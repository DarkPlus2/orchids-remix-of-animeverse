import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { episodes, anime } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const animeId = searchParams.get('anime_id');

    let results;

    if (animeId) {
      const parsedAnimeId = parseInt(animeId);
      
      if (isNaN(parsedAnimeId) || parsedAnimeId <= 0) {
        return NextResponse.json(
          { 
            error: 'Invalid anime_id parameter. Must be a positive integer.',
            code: 'INVALID_ANIME_ID' 
          },
          { status: 400 }
        );
      }

      results = await db.select()
        .from(episodes)
        .where(eq(episodes.animeId, parsedAnimeId))
        .orderBy(asc(episodes.episodeNumber));
    } else {
      results = await db.select()
        .from(episodes)
        .orderBy(asc(episodes.episodeNumber));
    }

    // Transform embedSources from string to parsed JSON and add season
    const transformedResults = results.map(ep => ({
      ...ep,
      embedSources: typeof ep.embedSources === 'string' 
        ? JSON.parse(ep.embedSources) 
        : ep.embedSources,
      season: ep.season || 1,
    }));

    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { animeId, episodeNumber, title, embedSources, thumbnail, season } = body;

    // Validate required fields
    if (!animeId) {
      return NextResponse.json(
        { 
          error: 'animeId is required',
          code: 'MISSING_ANIME_ID' 
        },
        { status: 400 }
      );
    }

    if (!episodeNumber) {
      return NextResponse.json(
        { 
          error: 'episodeNumber is required',
          code: 'MISSING_EPISODE_NUMBER' 
        },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { 
          error: 'title is required',
          code: 'MISSING_TITLE' 
        },
        { status: 400 }
      );
    }

    if (!embedSources) {
      return NextResponse.json(
        { 
          error: 'embedSources is required',
          code: 'MISSING_EMBED_SOURCES' 
        },
        { status: 400 }
      );
    }

    // Validate animeId is a positive integer
    const parsedAnimeId = parseInt(animeId);
    if (isNaN(parsedAnimeId) || parsedAnimeId <= 0) {
      return NextResponse.json(
        { 
          error: 'animeId must be a positive integer',
          code: 'INVALID_ANIME_ID' 
        },
        { status: 400 }
      );
    }

    // Validate episodeNumber is a positive integer
    const parsedEpisodeNumber = parseInt(episodeNumber);
    if (isNaN(parsedEpisodeNumber) || parsedEpisodeNumber <= 0) {
      return NextResponse.json(
        { 
          error: 'episodeNumber must be a positive integer',
          code: 'INVALID_EPISODE_NUMBER' 
        },
        { status: 400 }
      );
    }

    // Validate title is non-empty string
    const trimmedTitle = String(title).trim();
    if (trimmedTitle.length === 0) {
      return NextResponse.json(
        { 
          error: 'title must be a non-empty string',
          code: 'INVALID_TITLE' 
        },
        { status: 400 }
      );
    }

    // Validate embedSources is array
    if (!Array.isArray(embedSources) || embedSources.length === 0) {
      return NextResponse.json(
        { 
          error: 'embedSources must be a non-empty array of {name, url} objects',
          code: 'INVALID_EMBED_SOURCES' 
        },
        { status: 400 }
      );
    }

    // Validate each embedSource has name and url
    for (const source of embedSources) {
      if (!source.name || !source.url || typeof source.name !== 'string' || typeof source.url !== 'string') {
        return NextResponse.json(
          { 
            error: 'Each embedSource must have name and url as strings',
            code: 'INVALID_EMBED_SOURCE_FORMAT' 
          },
          { status: 400 }
        );
      }
    }

    // Verify that the referenced anime exists
    const animeExists = await db.select()
      .from(anime)
      .where(eq(anime.id, parsedAnimeId))
      .limit(1);

    if (animeExists.length === 0) {
      return NextResponse.json(
        { 
          error: 'Referenced anime does not exist',
          code: 'ANIME_NOT_FOUND' 
        },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData = {
      animeId: parsedAnimeId,
      episodeNumber: parsedEpisodeNumber,
      title: trimmedTitle,
      embedSources: JSON.stringify(embedSources),
      thumbnail: thumbnail ? String(thumbnail).trim() : null,
      season: season ? parseInt(season) : 1,
      createdAt: new Date().toISOString()
    };

    // Insert episode
    const newEpisode = await db.insert(episodes)
      .values(insertData)
      .returning();

    // Transform response
    const transformed = {
      ...newEpisode[0],
      embedSources: typeof newEpisode[0].embedSources === 'string'
        ? JSON.parse(newEpisode[0].embedSources)
        : newEpisode[0].embedSources,
    };

    return NextResponse.json(transformed, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}