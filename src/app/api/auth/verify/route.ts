import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, userSessions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "No token provided", valid: false },
        { status: 401 }
      );
    }

    // Find session
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
      return NextResponse.json(
        { error: "Invalid or expired token", valid: false },
        { status: 401 }
      );
    }

    const session = sessions[0];

    // Get user
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userResults.length === 0) {
      return NextResponse.json(
        { error: "User not found", valid: false },
        { status: 404 }
      );
    }

    const user = userResults[0];

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        bio: user.bio,
        profilePicture: user.profilePicture,
        favoriteGenres: user.favoriteGenres,
      },
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Internal server error", valid: false },
      { status: 500 }
    );
  }
}
