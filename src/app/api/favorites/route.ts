import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, userSessions, anime } from "@/db/schema";
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

// GET user favorites
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userFavorites = await db
      .select({
        favorite: favorites,
        anime: anime,
      })
      .from(favorites)
      .leftJoin(anime, eq(favorites.animeId, anime.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));

    const result = userFavorites.map(({ favorite, anime }) => ({
      ...anime,
      favoritedAt: favorite.createdAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST add to favorites
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

    // Check if already favorited
    const existing = await db
      .select()
      .from(favorites)
      .where(
        and(eq(favorites.userId, userId), eq(favorites.animeId, parseInt(animeId)))
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Already in favorites" },
        { status: 400 }
      );
    }

    const newFavorite = await db
      .insert(favorites)
      .values({
        userId,
        animeId: parseInt(animeId),
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newFavorite[0], { status: 201 });
  } catch (error) {
    console.error("Add favorite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
