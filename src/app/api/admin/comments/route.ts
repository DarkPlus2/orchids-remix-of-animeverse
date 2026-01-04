import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { comments, users, anime } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getAuthorizedAdmin } from '@/lib/server-auth';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthorizedAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const allComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        isSpoiler: comments.isSpoiler,
        isPinned: comments.isPinned,
        likes: comments.likes,
        dislikes: comments.dislikes,
        user: {
          username: users.username,
          name: users.name,
        },
        anime: {
          title: anime.title,
          slug: anime.slug,
        },
        episodeNumber: comments.episodeNumber,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .leftJoin(anime, eq(comments.animeId, anime.id))
      .orderBy(desc(comments.createdAt))
      .limit(limit);

    return NextResponse.json(allComments);
  } catch (error) {
    console.error('Admin comments GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
