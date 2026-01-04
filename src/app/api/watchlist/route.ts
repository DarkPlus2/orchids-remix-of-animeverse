import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { watchlist, userSessions, anime } from "@/db/schema";
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

// GET user watchlist
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userWatchlist = await db
      .select({
        watchlist: watchlist,
        anime: anime,
      })
      .from(watchlist)
      .leftJoin(anime, eq(watchlist.animeId, anime.id))
      .where(eq(watchlist.userId, userId))
      .orderBy(desc(watchlist.createdAt));

    const result = userWatchlist.map(({ watchlist, anime }) => ({
      ...anime,
      addedAt: watchlist.createdAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get watchlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST add to watchlist
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
    const { animeId } = body;

    if (!animeId) {
      return NextResponse.json(
        { error: "animeId is required" },
        { status: 400 }
      );
    }

    // Check if already in watchlist
    const existing = await db
      .select()
      .from(watchlist)
      .where(
        and(eq(watchlist.userId, userId), eq(watchlist.animeId, parseInt(animeId)))
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Already in watchlist" },
        { status: 400 }
      );
    }

    const newWatchlist = await db
      .insert(watchlist)
      .values({
        userId,
        animeId: parseInt(animeId),
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newWatchlist[0], { status: 201 });
  } catch (error) {
    console.error("Add watchlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
