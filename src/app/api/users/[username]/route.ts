import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, favorites, watchlist, watchHistory, comments, userActivity, anime } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username || username === "undefined" || username === "null") {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (userResults.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = userResults[0];

    // Get stats
    const [favoritesCount, watchlistCount, watchHistoryCount, commentsCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(favorites).where(eq(favorites.userId, user.id)),
      db.select({ count: sql<number>`count(*)` }).from(watchlist).where(eq(watchlist.userId, user.id)),
      db.select({ count: sql<number>`count(distinct ${watchHistory.animeId})` }).from(watchHistory).where(eq(watchHistory.userId, user.id)),
      db.select({ count: sql<number>`count(*)` }).from(comments).where(eq(comments.userId, user.id)),
    ]);

    // Get Activity
    const activity = await db
      .select()
      .from(userActivity)
      .where(eq(userActivity.userId, user.id))
      .orderBy(sql`${userActivity.createdAt} DESC`)
      .limit(20);

    // Get Favorites with anime details
    const userFavorites = await db
      .select({
        id: anime.id,
        title: anime.title,
        slug: anime.slug,
        coverImage: anime.coverImage,
        type: anime.type,
        status: anime.status,
        releaseYear: anime.releaseYear,
      })
      .from(favorites)
      .innerJoin(anime, eq(favorites.animeId, anime.id))
      .where(eq(favorites.userId, user.id))
      .orderBy(sql`${favorites.createdAt} DESC`);

    // Get Watchlist with anime details
    const userWatchlist = await db
      .select({
        id: anime.id,
        title: anime.title,
        slug: anime.slug,
        coverImage: anime.coverImage,
        type: anime.type,
        status: anime.status,
        releaseYear: anime.releaseYear,
      })
      .from(watchlist)
      .innerJoin(anime, eq(watchlist.animeId, anime.id))
      .where(eq(watchlist.userId, user.id))
      .orderBy(sql`${watchlist.createdAt} DESC`);

    // Get History with anime details
    const userHistory = await db
      .select({
        id: anime.id,
        title: anime.title,
        slug: anime.slug,
        coverImage: anime.coverImage,
        episodeNumber: watchHistory.episodeNumber,
        watchedAt: watchHistory.watchedAt,
        progress: watchHistory.progress,
      })
      .from(watchHistory)
      .innerJoin(anime, eq(watchHistory.animeId, anime.id))
      .where(eq(watchHistory.userId, user.id))
      .orderBy(sql`${watchHistory.watchedAt} DESC`)
      .limit(20);

    return NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      profilePicture: user.profilePicture,
      banner: user.banner,
      favoriteGenres: user.favoriteGenres,
      createdAt: user.createdAt,
      stats: {
        favorites: Number(favoritesCount[0].count),
        watchlist: Number(watchlistCount[0].count),
        watched: Number(watchHistoryCount[0].count),
        comments: Number(commentsCount[0].count),
      },
      activity,
      favorites: userFavorites,
      watchlist: userWatchlist,
      history: userHistory
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
