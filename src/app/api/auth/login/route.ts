import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, userSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailOrUsername, password } = body;

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: "Email/username and password are required" },
        { status: 400 }
      );
    }

    // Normalize email/username to lowercase
    const normalizedInput = emailOrUsername.toLowerCase();

    // Find user by email or username (case-insensitive)
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedInput))
      .limit(1);

    let user = userResults[0];

    if (!user) {
      const usernameResults = await db
        .select()
        .from(users)
        .where(eq(users.username, normalizedInput))
        .limit(1);
      user = usernameResults[0];
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAtDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const expiresAt = expiresAtDate.toISOString();

    // Create session
    await db.insert(userSessions).values({
      userId: user.id,
      token,
      expiresAt,
      createdAt: new Date().toISOString(),
    });

    // Set HttpOnly cookie for "Advanced" security
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAtDate,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        bio: user.bio,
        profilePicture: user.profilePicture,
        favoriteGenres: user.favoriteGenres,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}