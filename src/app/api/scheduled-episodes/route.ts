import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { scheduledEpisodes, anime } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const animeIdParam = searchParams.get('anime_id');

    let query = db.select().from(scheduledEpisodes);
    const conditions = [];

    if (status) {
      conditions.push(eq(scheduledEpisodes.status, status));
    }

    if (animeIdParam) {
      const animeId = parseInt(animeIdParam);
      if (isNaN(animeId)) {
        return NextResponse.json(
          { error: 'anime_id must be a valid integer', code: 'INVALID_ANIME_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(scheduledEpisodes.animeId, animeId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(
      asc(scheduledEpisodes.scheduledDate),
      asc(scheduledEpisodes.scheduledTime)
    );

    // Transform embedSources from string to parsed JSON
    const transformedResults = results.map(ep => ({
      ...ep,
      embedSources: typeof ep.embedSources === 'string'
        ? JSON.parse(ep.embedSources)
        : ep.embedSources,
    }));

    return NextResponse.json(transformedResults, { status: 200 });
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
    const {
      animeId,
      episodeNumber,
      title,
      scheduledDate,
      scheduledTime,
      status,
      notifyUsers,
      streamUrl,
      notes,
      season,
      embedSources,
      thumbnail,
    } = body;

    // Validate animeId
    if (!animeId || typeof animeId !== 'number' || animeId <= 0) {
      return NextResponse.json(
        { error: 'animeId must be a positive integer', code: 'INVALID_ANIME_ID' },
        { status: 400 }
      );
    }

    // Check if anime exists
    const existingAnime = await db
      .select()
      .from(anime)
      .where(eq(anime.id, animeId))
      .limit(1);

    if (existingAnime.length === 0) {
      return NextResponse.json(
        { error: 'Referenced anime does not exist', code: 'ANIME_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Validate episodeNumber
    if (!episodeNumber || typeof episodeNumber !== 'number' || episodeNumber <= 0) {
      return NextResponse.json(
        { error: 'episodeNumber must be a positive integer', code: 'INVALID_EPISODE_NUMBER' },
        { status: 400 }
      );
    }

    // Validate title
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'title is required and must be a non-empty string', code: 'INVALID_TITLE' },
        { status: 400 }
      );
    }

    // Validate scheduledDate
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!scheduledDate || typeof scheduledDate !== 'string' || !dateRegex.test(scheduledDate)) {
      return NextResponse.json(
        { error: 'scheduledDate must be a valid date string (YYYY-MM-DD)', code: 'INVALID_SCHEDULED_DATE' },
        { status: 400 }
      );
    }

    // Validate scheduledTime
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!scheduledTime || typeof scheduledTime !== 'string' || !timeRegex.test(scheduledTime)) {
      return NextResponse.json(
        { error: 'scheduledTime must be a valid time string (HH:MM)', code: 'INVALID_SCHEDULED_TIME' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['upcoming', 'airing', 'aired', 'delayed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'status must be one of: upcoming, airing, aired, delayed', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Validate embedSources (required)
    if (!embedSources || !Array.isArray(embedSources) || embedSources.length === 0) {
      return NextResponse.json(
        { error: 'embedSources is required and must be a non-empty array', code: 'INVALID_EMBED_SOURCES' },
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

    // Validate notifyUsers if provided
    if (notifyUsers !== undefined && typeof notifyUsers !== 'boolean') {
      return NextResponse.json(
        { error: 'notifyUsers must be a boolean', code: 'INVALID_NOTIFY_USERS' },
        { status: 400 }
      );
    }

    // Validate season if provided
    if (season !== undefined && (typeof season !== 'number' || season <= 0)) {
      return NextResponse.json(
        { error: 'season must be a positive integer', code: 'INVALID_SEASON' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newEpisode = await db
      .insert(scheduledEpisodes)
      .values({
        animeId,
        episodeNumber,
        title: title.trim(),
        scheduledDate,
        scheduledTime,
        status,
        notifyUsers: notifyUsers !== undefined ? notifyUsers : true,
        streamUrl: streamUrl || null,
        notes: notes || null,
        season: season || 1,
        embedSources: JSON.stringify(embedSources),
        thumbnail: thumbnail || null,
        createdAt: now,
        updatedAt: now,
      })
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