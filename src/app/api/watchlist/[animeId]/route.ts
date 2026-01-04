import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { watchlist, userSessions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

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

// GET check if in watchlist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ animeId: string }> }
) {
  try {
    const userId = await verifyAuth(request);

    if (!userId) {
      return NextResponse.json({ inWatchlist: false });
    }

    const { animeId } = await params;

    const item = await db
      .select()
      .from(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.animeId, parseInt(animeId))
        )
      )
      .limit(1);

    return NextResponse.json({ inWatchlist: item.length > 0 });
  } catch (error) {
    console.error("Check watchlist error:", error);
    return NextResponse.json({ inWatchlist: false });
  }
}

// DELETE remove from watchlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ animeId: string }> }
) {
  try {
    const userId = await verifyAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { animeId } = await params;

    await db
      .delete(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.animeId, parseInt(animeId))
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove watchlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
