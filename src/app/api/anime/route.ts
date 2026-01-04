import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { anime, episodes } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trending = searchParams.get('trending');
    const mostWatched = searchParams.get('mostWatched');
    const pinned = searchParams.get('pinned');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const genre = searchParams.get('genre');
    const letter = searchParams.get('letter');

    let query = db.select().from(anime);
    const conditions = [];

    if (trending === 'true') {
      conditions.push(eq(anime.trending, true));
    }

    if (mostWatched === 'true') {
      conditions.push(eq(anime.mostWatched, true));
    }

    if (pinned === 'true') {
      conditions.push(eq(anime.pinned, true));
    }

    if (status) {
      conditions.push(eq(anime.status, status as 'ongoing' | 'completed'));
    }

    if (type) {
      const typeMap: Record<string, string> = {
        'movie': 'Movie',
        'series': 'Series',
        'ova': 'OVA',
        'special': 'Special'
      };
      const mappedType = typeMap[type.toLowerCase()] || type;
      conditions.push(eq(anime.type, mappedType as any));
    }

    if (genre) {
      const genreLower = genre.toLowerCase();
      conditions.push(like(anime.genres, `%${genreLower}%`));
    }

    if (letter) {
      if (letter === 'other' || letter === '#') {
        // Match titles starting with non-alphabetic characters
        const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
        conditions.push(
          and(
            ...alphabet.map(char => 
              sql`LOWER(${anime.title}) NOT LIKE ${char.toLowerCase() + '%'}`
            )
          )
        );
      } else {
        conditions.push(
          or(
            like(anime.title, `${letter.toUpperCase()}%`),
            like(anime.title, `${letter.toLowerCase()}%`)
          )
        );
      }
    }

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          like(anime.title, searchLower),
          like(anime.japaneseTitle, searchLower),
          like(anime.genres, searchLower)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const results = await query.orderBy(desc(anime.rating));

    // Transform data to match UI expectations
    const transformedResults = results.map(item => ({
      ...item,
      id: String(item.id),
      genres: typeof item.genres === 'string' ? JSON.parse(item.genres) : item.genres,
      episodes: [], // Episodes loaded separately for detail view
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
    const {
      title,
      japaneseTitle,
      synopsis,
      coverImage,
      bannerImage,
      rating,
      genres,
      status,
      releaseYear,
      totalEpisodes,
      type = 'Series',
      trending = false,
      mostWatched = false,
      pinned = false,
      episodes: episodesData
    } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'title is required and must be a non-empty string', code: 'INVALID_TITLE' },
        { status: 400 }
      );
    }

    if (!synopsis || typeof synopsis !== 'string' || synopsis.trim() === '') {
      return NextResponse.json(
        { error: 'synopsis is required and must be a non-empty string', code: 'INVALID_SYNOPSIS' },
        { status: 400 }
      );
    }

    if (!coverImage || typeof coverImage !== 'string' || coverImage.trim() === '') {
      return NextResponse.json(
        { error: 'coverImage is required and must be a non-empty string', code: 'INVALID_COVER_IMAGE' },
        { status: 400 }
      );
    }

    if (!bannerImage || typeof bannerImage !== 'string' || bannerImage.trim() === '') {
      return NextResponse.json(
        { error: 'bannerImage is required and must be a non-empty string', code: 'INVALID_BANNER_IMAGE' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 0 || rating > 10) {
      return NextResponse.json(
        { error: 'rating is required and must be a number between 0 and 10', code: 'INVALID_RATING' },
        { status: 400 }
      );
    }

    if (!Array.isArray(genres) || genres.length === 0) {
      return NextResponse.json(
        { error: 'genres is required and must be a non-empty array', code: 'INVALID_GENRES' },
        { status: 400 }
      );
    }

    if (status !== 'ongoing' && status !== 'completed') {
      return NextResponse.json(
        { error: 'status must be either "ongoing" or "completed"', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    if (typeof releaseYear !== 'number' || releaseYear < 1900 || releaseYear > 2100) {
      return NextResponse.json(
        { error: 'releaseYear must be a valid year between 1900 and 2100', code: 'INVALID_RELEASE_YEAR' },
        { status: 400 }
      );
    }

    if (typeof totalEpisodes !== 'number' || totalEpisodes <= 0) {
      return NextResponse.json(
        { error: 'totalEpisodes must be a positive integer', code: 'INVALID_TOTAL_EPISODES' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['Movie', 'Series', 'OVA', 'Special'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'type must be one of: Movie, Series, OVA, Special', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const now = new Date().toISOString();

    // Insert anime
    const newAnime = await db.insert(anime).values({
      slug,
      title: title.trim(),
      japaneseTitle: (typeof japaneseTitle === 'string' && japaneseTitle.trim() !== '' ? japaneseTitle.trim() : title.trim()),
      synopsis: synopsis.trim(),
      coverImage: coverImage.trim(),
      bannerImage: bannerImage.trim(),
      rating,
      genres: JSON.stringify(genres),
      status,
      releaseYear,
      totalEpisodes,
      type,
      trending: Boolean(trending),
      mostWatched: Boolean(mostWatched),
      pinned: Boolean(pinned),
      createdAt: now,
      updatedAt: now,
    }).returning();

    // If episodes are provided, create them
    if (Array.isArray(episodesData) && episodesData.length > 0) {
      const episodeInserts = episodesData.map((ep: any) => ({
        animeId: newAnime[0].id,
        episodeNumber: ep.episodeNumber,
        title: ep.title,
        embedSources: JSON.stringify(ep.embedSources || [{ name: 'Default', url: ep.streamtapeUrl || '' }]),
        thumbnail: ep.thumbnail || null,
        createdAt: new Date().toISOString(),
      }));

      await db.insert(episodes).values(episodeInserts);
    }

    // Transform response
    const transformed = {
      ...newAnime[0],
      id: String(newAnime[0].id),
      genres: typeof newAnime[0].genres === 'string' 
        ? JSON.parse(newAnime[0].genres) 
        : newAnime[0].genres,
      episodes: [],
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