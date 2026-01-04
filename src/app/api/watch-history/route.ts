import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { watchHistory, userSessions, anime } from "@/db/schema";
import { eq, and, gt, desc } from "drizzle-orm";

async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

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

// GET user watch history
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const history = await db
      .select({
        watchHistory: watchHistory,
        anime: anime,
      })
      .from(watchHistory)
      .leftJoin(anime, eq(watchHistory.animeId, anime.id))
      .where(eq(watchHistory.userId, userId))
      .orderBy(desc(watchHistory.watchedAt));

    const result = history.map(({ watchHistory, anime }) => ({
      ...anime,
      episodeNumber: watchHistory.episodeNumber,
      watchedAt: watchHistory.watchedAt,
      progress: watchHistory.progress,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get watch history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST track watch
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { animeId, episodeNumber, progress } = body;

    if (!animeId || !episodeNumber) {
      return NextResponse.json(
        { error: "animeId and episodeNumber are required" },
        { status: 400 }
      );
    }

    // Check if already tracked
    const existing = await db
      .select()
      .from(watchHistory)
      .where(
        and(
          eq(watchHistory.userId, userId),
          eq(watchHistory.animeId, parseInt(animeId)),
          eq(watchHistory.episodeNumber, parseInt(episodeNumber))
        )
      )
      .limit(1);

    let responseData;

    if (existing.length > 0) {
      // Update existing
      const updated = await db
        .update(watchHistory)
        .set({
          watchedAt: new Date().toISOString(),
          progress: progress || 0,
        })
        .where(eq(watchHistory.id, existing[0].id))
        .returning();
      
      responseData = updated[0];
    } else {
      // Create new
      const newHistory = await db
        .insert(watchHistory)
        .values({
          userId,
          animeId: parseInt(animeId),
          episodeNumber: parseInt(episodeNumber),
          watchedAt: new Date().toISOString(),
          progress: progress || 0,
        })
        .returning();
      
      responseData = newHistory[0];
    }

    return NextResponse.json(responseData, { status: existing.length > 0 ? 200 : 201 });
  } catch (error) {
    console.error("Track watch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
