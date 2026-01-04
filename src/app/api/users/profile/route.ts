import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, userSessions } from "@/db/schema";
import { eq, and, gt, or, not } from "drizzle-orm";

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

// PUT update profile
export async function PUT(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, username, email, bio, profilePicture, banner, favoriteGenres } = body;

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (banner !== undefined) updateData.banner = banner;
    if (favoriteGenres !== undefined) updateData.favoriteGenres = favoriteGenres;

    // Check if username/email already exists if they are being changed
    if (username || email) {
      const existing = await db
        .select()
        .from(users)
        .where(
          and(
            not(eq(users.id, userId)),
            or(
              username ? eq(users.username, username) : undefined,
              email ? eq(users.email, email) : undefined
            )
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { error: "Username or email already taken" },
          { status: 400 }
        );
      }
    }

    const updated = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    return NextResponse.json({
      id: updated[0].id,
      email: updated[0].email,
      username: updated[0].username,
      name: updated[0].name,
      bio: updated[0].bio,
      profilePicture: updated[0].profilePicture,
      banner: updated[0].banner,
      favoriteGenres: updated[0].favoriteGenres,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE account
export async function DELETE(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Delete the user - cascade will handle related tables
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
