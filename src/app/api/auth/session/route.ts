import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, userSessions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No token provided", authenticated: false },
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
        { error: "Invalid or expired session", authenticated: false },
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
        { error: "User not found", authenticated: false },
        { status: 404 }
      );
    }

    const user = userResults[0];

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        bio: user.bio,
        profilePicture: user.profilePicture,
        favoriteGenres: user.favoriteGenres,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "Internal server error", authenticated: false },
      { status: 500 }
    );
  }
}