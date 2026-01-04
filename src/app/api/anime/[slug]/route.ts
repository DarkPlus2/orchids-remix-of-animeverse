import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { anime, episodes } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const animeRecord = await db
      .select()
      .from(anime)
      .where(eq(anime.slug, slug))
      .limit(1);

    if (animeRecord.length === 0) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }

    const animeEpisodes = await db
      .select()
      .from(episodes)
      .where(eq(episodes.animeId, animeRecord[0].id))
      .orderBy(asc(episodes.episodeNumber));

    // Transform data to match UI expectations
    const transformedAnime = {
      ...animeRecord[0],
      id: String(animeRecord[0].id),
      genres: typeof animeRecord[0].genres === 'string' 
        ? JSON.parse(animeRecord[0].genres) 
        : animeRecord[0].genres,
      episodes: animeEpisodes.map(ep => ({
        id: ep.id,
        number: ep.episodeNumber,
        title: ep.title,
        embedSources: typeof ep.embedSources === 'string' 
          ? JSON.parse(ep.embedSources) 
          : ep.embedSources,
        thumbnail: ep.thumbnail || undefined,
        season: ep.season || 1, // Include season field
      })),
    };

    return NextResponse.json(transformedAnime);
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const existingAnime = await db
      .select()
      .from(anime)
      .where(eq(anime.slug, slug))
      .limit(1);

    if (existingAnime.length === 0) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }

    // Validate if rating is provided
    if (body.rating !== undefined && (typeof body.rating !== 'number' || body.rating < 0 || body.rating > 10)) {
      return NextResponse.json(
        { error: 'rating must be between 0 and 10', code: 'INVALID_RATING' },
        { status: 400 }
      );
    }

    // Validate status
    if (body.status !== undefined && body.status !== 'ongoing' && body.status !== 'completed') {
      return NextResponse.json(
        { error: 'status must be either "ongoing" or "completed"', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Validate genres
    if (body.genres !== undefined && (!Array.isArray(body.genres) || body.genres.length === 0)) {
      return NextResponse.json(
        { error: 'genres must be a non-empty array', code: 'INVALID_GENRES' },
        { status: 400 }
      );
    }

    // Validate releaseYear
    if (body.releaseYear !== undefined && (typeof body.releaseYear !== 'number' || body.releaseYear < 1900 || body.releaseYear > 2100)) {
      return NextResponse.json(
        { error: 'releaseYear must be between 1900 and 2100', code: 'INVALID_RELEASE_YEAR' },
        { status: 400 }
      );
    }

    // Validate totalEpisodes
    if (body.totalEpisodes !== undefined && (typeof body.totalEpisodes !== 'number' || body.totalEpisodes <= 0)) {
      return NextResponse.json(
        { error: 'totalEpisodes must be a positive integer', code: 'INVALID_TOTAL_EPISODES' },
        { status: 400 }
      );
    }

    // Validate type
    if (body.type !== undefined) {
      const validTypes = ['Movie', 'Series', 'OVA', 'Special'];
      if (!validTypes.includes(body.type)) {
        return NextResponse.json(
          { error: 'type must be one of: Movie, Series, OVA, Special', code: 'INVALID_TYPE' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (body.title !== undefined) {
      updateData.title = body.title.trim();
      // Regenerate slug from new title
      updateData.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    if (body.japaneseTitle !== undefined) updateData.japaneseTitle = body.japaneseTitle.trim();
    if (body.synopsis !== undefined) updateData.synopsis = body.synopsis.trim();
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage.trim();
    if (body.bannerImage !== undefined) updateData.bannerImage = body.bannerImage.trim();
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.genres !== undefined) updateData.genres = JSON.stringify(body.genres);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.releaseYear !== undefined) updateData.releaseYear = body.releaseYear;
    if (body.totalEpisodes !== undefined) updateData.totalEpisodes = body.totalEpisodes;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.trending !== undefined) updateData.trending = Boolean(body.trending);
    if (body.mostWatched !== undefined) updateData.mostWatched = Boolean(body.mostWatched);
    if (body.pinned !== undefined) updateData.pinned = Boolean(body.pinned);

    const updatedAnime = await db
      .update(anime)
      .set(updateData)
      .where(eq(anime.slug, slug))
      .returning();

    // Transform response
    const transformed = {
      ...updatedAnime[0],
      id: String(updatedAnime[0].id),
      genres: typeof updatedAnime[0].genres === 'string'
        ? JSON.parse(updatedAnime[0].genres)
        : updatedAnime[0].genres,
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const existingAnime = await db
      .select()
      .from(anime)
      .where(eq(anime.slug, slug))
      .limit(1);

    if (existingAnime.length === 0) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }

    await db.delete(anime).where(eq(anime.slug, slug));

    return NextResponse.json(
      { message: 'Anime and associated episodes deleted successfully' },
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