import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, name } = body;

    if (!email || !username || !password || !name) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate username is lowercase
    if (username !== username.toLowerCase()) {
      return NextResponse.json(
        { error: "Username must be lowercase" },
        { status: 400 }
      );
    }

    // Convert to lowercase
    const lowercaseUsername = username.toLowerCase();
    const lowercaseEmail = email.toLowerCase();

    // Check if user already exists (case-insensitive)
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, lowercaseEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, lowercaseUsername))
      .limit(1);

    if (existingUsername.length > 0) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email: lowercaseEmail,
        username: lowercaseUsername,
        password: hashedPassword,
        name,
        bio: null,
        profilePicture: null,
        favoriteGenres: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    const user = newUser[0];

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
