import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { scheduledEpisodes, anime } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const episode = await db
      .select()
      .from(scheduledEpisodes)
      .where(eq(scheduledEpisodes.id, parseInt(id)))
      .limit(1);

    if (episode.length === 0) {
      return NextResponse.json(
        { error: 'Scheduled episode not found', code: 'EPISODE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Transform embedSources from string to parsed JSON
    const transformed = {
      ...episode[0],
      embedSources: typeof episode[0].embedSources === 'string'
        ? JSON.parse(episode[0].embedSources)
        : episode[0].embedSources,
    };

    return NextResponse.json(transformed, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
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

    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingEpisode = await db
      .select()
      .from(scheduledEpisodes)
      .where(eq(scheduledEpisodes.id, parseInt(id)))
      .limit(1);

    if (existingEpisode.length === 0) {
      return NextResponse.json(
        { error: 'Scheduled episode not found', code: 'EPISODE_NOT_FOUND' },
        { status: 404 }
      );
    }

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

    const updates: Record<string, any> = {};

    if (animeId !== undefined) {
      if (!Number.isInteger(animeId) || animeId <= 0) {
        return NextResponse.json(
          { error: 'Invalid anime ID', code: 'INVALID_ANIME_ID' },
          { status: 400 }
        );
      }

      const animeExists = await db
        .select()
        .from(anime)
        .where(eq(anime.id, animeId))
        .limit(1);

      if (animeExists.length === 0) {
        return NextResponse.json(
          { error: 'Referenced anime does not exist', code: 'ANIME_NOT_FOUND' },
          { status: 400 }
        );
      }

      updates.animeId = animeId;
    }

    if (episodeNumber !== undefined) {
      if (!Number.isInteger(episodeNumber) || episodeNumber <= 0) {
        return NextResponse.json(
          { error: 'Episode number must be a positive integer', code: 'INVALID_EPISODE_NUMBER' },
          { status: 400 }
        );
      }
      updates.episodeNumber = episodeNumber;
    }

    if (title !== undefined) {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        return NextResponse.json(
          { error: 'Title cannot be empty', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
      updates.title = trimmedTitle;
    }

    if (scheduledDate !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(scheduledDate)) {
        return NextResponse.json(
          { error: 'Scheduled date must be in YYYY-MM-DD format', code: 'INVALID_SCHEDULED_DATE' },
          { status: 400 }
        );
      }

      const dateObj = new Date(scheduledDate);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json(
          { error: 'Scheduled date must be a valid date', code: 'INVALID_SCHEDULED_DATE' },
          { status: 400 }
        );
      }

      updates.scheduledDate = scheduledDate;
    }

    if (scheduledTime !== undefined) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(scheduledTime)) {
        return NextResponse.json(
          { error: 'Scheduled time must be in HH:MM format', code: 'INVALID_SCHEDULED_TIME' },
          { status: 400 }
        );
      }
      updates.scheduledTime = scheduledTime;
    }

    if (status !== undefined) {
      const validStatuses = ['upcoming', 'airing', 'aired', 'delayed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Status must be one of: upcoming, airing, aired, delayed', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    if (notifyUsers !== undefined) {
      if (typeof notifyUsers !== 'boolean') {
        return NextResponse.json(
          { error: 'Notify users must be a boolean', code: 'INVALID_NOTIFY_USERS' },
          { status: 400 }
        );
      }
      updates.notifyUsers = notifyUsers;
    }

    if (streamUrl !== undefined) {
      updates.streamUrl = streamUrl;
    }

    if (notes !== undefined) {
      updates.notes = notes;
    }

    if (season !== undefined) {
      if (typeof season !== 'number' || season <= 0) {
        return NextResponse.json(
          { error: 'Season must be a positive integer', code: 'INVALID_SEASON' },
          { status: 400 }
        );
      }
      updates.season = season;
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

      updates.embedSources = JSON.stringify(embedSources);
    }

    if (thumbnail !== undefined) {
      updates.thumbnail = thumbnail;
    }

    updates.updatedAt = new Date().toISOString();

    const updatedEpisode = await db
      .update(scheduledEpisodes)
      .set(updates)
      .where(eq(scheduledEpisodes.id, parseInt(id)))
      .returning();

    // Transform response
    const transformed = {
      ...updatedEpisode[0],
      embedSources: typeof updatedEpisode[0].embedSources === 'string'
        ? JSON.parse(updatedEpisode[0].embedSources)
        : updatedEpisode[0].embedSources,
    };

    return NextResponse.json(transformed, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
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

    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingEpisode = await db
      .select()
      .from(scheduledEpisodes)
      .where(eq(scheduledEpisodes.id, parseInt(id)))
      .limit(1);

    if (existingEpisode.length === 0) {
      return NextResponse.json(
        { error: 'Scheduled episode not found', code: 'EPISODE_NOT_FOUND' },
        { status: 404 }
      );
    }

    await db
      .delete(scheduledEpisodes)
      .where(eq(scheduledEpisodes.id, parseInt(id)));

    return NextResponse.json(
      { 
        message: 'Scheduled episode deleted successfully',
        deletedEpisode: existingEpisode[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}