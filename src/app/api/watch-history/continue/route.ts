import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { watchHistory, userSessions, anime } from "@/db/schema";
import { eq, and, gt, desc, sql } from "drizzle-orm";
import { cookies } from "next/headers";

async function verifyAuth(request: NextRequest) {
  // Try Authorization header first
  const authHeader = request.headers.get("authorization");
  let token = authHeader?.replace("Bearer ", "");

  // Fallback to cookie
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get("auth_token")?.value;
  }

  if (!token) {
    return null;
  }

  const sessions = await db
    .select()
    .from(userSessions)
    .where(
      and(
        eq(userSessions.token, token),
        gt(userSessions.expiresAt, new Date().toISOString())
      )
    )
    .limit(1);

  if (sessions.length === 0) {
    return null;
  }

  return sessions[0].userId;
}

// GET continue watching list
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get latest watch history for each anime (grouped by animeId)
    // Join with episodes to get season info
    const history = await db
      .select({
        watchHistory: watchHistory,
        anime: anime,
        episodeSeason: sql<number>`(SELECT season_new FROM episodes WHERE anime_id = ${watchHistory.animeId} AND episode_number = ${watchHistory.episodeNumber} LIMIT 1)`
      })
      .from(watchHistory)
      .leftJoin(anime, eq(watchHistory.animeId, anime.id))
      .where(eq(watchHistory.userId, userId))
      .orderBy(desc(watchHistory.watchedAt))
      .limit(30);

      // Group by anime and get the latest episode for each
      const uniqueAnime = new Map();
      for (const item of history) {
        const animeId = item.watchHistory.animeId;
        if (!uniqueAnime.has(animeId)) {
          uniqueAnime.set(animeId, {
            ...item.anime,
            episodeNumber: item.watchHistory.episodeNumber,
            season: item.episodeSeason || 1,
            watchedAt: item.watchHistory.watchedAt,
            progress: item.watchHistory.progress,
            animeId: item.watchHistory.animeId
          });
        }
      }


    return NextResponse.json(Array.from(uniqueAnime.values()));
  } catch (error) {
    console.error("Get continue watching error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
