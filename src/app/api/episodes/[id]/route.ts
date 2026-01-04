import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { episodes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const episode = await db
      .select()
      .from(episodes)
      .where(eq(episodes.id, parseInt(id)))
      .limit(1);

    if (episode.length === 0) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    // Transform embedSources and add season
    const transformed = {
      ...episode[0],
      embedSources: typeof episode[0].embedSources === 'string'
        ? JSON.parse(episode[0].embedSources)
        : episode[0].embedSources,
      season: episode[0].season || 1,
    };

    return NextResponse.json(transformed, { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingEpisode = await db
      .select()
      .from(episodes)
      .where(eq(episodes.id, parseInt(id)))
      .limit(1);

    if (existingEpisode.length === 0) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { episodeNumber, title, embedSources, thumbnail, season } = body;

    if (episodeNumber !== undefined) {
      if (!Number.isInteger(episodeNumber) || episodeNumber <= 0) {
        return NextResponse.json(
          { error: 'Episode number must be a positive integer', code: 'INVALID_EPISODE_NUMBER' },
          { status: 400 }
        );
      }
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json(
          { error: 'Title must be a non-empty string', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
    }

    if (embedSources !== undefined) {
      if (!Array.isArray(embedSources) || embedSources.length === 0) {
        return NextResponse.json(
          { error: 'embedSources must be a non-empty array', code: 'INVALID_EMBED_SOURCES' },
          { status: 400 }
        );
      }

      // Validate each embedSource has name and url
      for (const source of embedSources) {
        if (!source.name || !source.url || typeof source.name !== 'string' || typeof source.url !== 'string') {
          return NextResponse.json(
            { error: 'Each embedSource must have name and url as strings', code: 'INVALID_EMBED_SOURCE_FORMAT' },
            { status: 400 }
          );
        }
      }
    }

    if (season !== undefined) {
      const parsedSeason = parseInt(season);
      if (isNaN(parsedSeason) || parsedSeason <= 0) {
        return NextResponse.json(
          { error: 'Season must be a positive integer', code: 'INVALID_SEASON' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};

    if (episodeNumber !== undefined) updateData.episodeNumber = episodeNumber;
    if (title !== undefined) updateData.title = title.trim();
    if (embedSources !== undefined) updateData.embedSources = JSON.stringify(embedSources);
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (season !== undefined) updateData.season = parseInt(season);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_FIELDS_TO_UPDATE' },
        { status: 400 }
      );
    }

    const updatedEpisode = await db
      .update(episodes)
      .set(updateData)
      .where(eq(episodes.id, parseInt(id)))
      .returning();

    if (updatedEpisode.length === 0) {
      return NextResponse.json(
        { error: 'Episode not found after update' },
        { status: 404 }
      );
    }

    // Transform response
    const transformed = {
      ...updatedEpisode[0],
      embedSources: typeof updatedEpisode[0].embedSources === 'string'
        ? JSON.parse(updatedEpisode[0].embedSources)
        : updatedEpisode[0].embedSources,
    };

    return NextResponse.json(transformed, { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingEpisode = await db
      .select()
      .from(episodes)
      .where(eq(episodes.id, parseInt(id)))
      .limit(1);

    if (existingEpisode.length === 0) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    await db
      .delete(episodes)
      .where(eq(episodes.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      { message: 'Episode deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}