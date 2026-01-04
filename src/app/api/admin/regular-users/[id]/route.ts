import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, adminSessions, admins } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcrypt";

// Verify admin authentication
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  const sessions = await db
    .select()
    .from(adminSessions)
    .where(
      and(
        eq(adminSessions.token, token),
        gt(adminSessions.expiresAt, new Date().toISOString())
      )
    )
    .limit(1);

  if (sessions.length === 0) {
    return null;
  }

  const adminResults = await db
    .select()
    .from(admins)
    .where(eq(admins.id, sessions[0].adminId))
    .limit(1);

  return adminResults[0] || null;
}

// PATCH - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);

    const role = admin.role.toLowerCase();
    if (!admin || (role !== "admin" && role !== "manager")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin role required." },
        { status: 403 }
      );
    }

    const userId = parseInt(params.id);
    const body = await request.json();
    const { email, username, name, bio, password, status } = body;

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (status) updateData.status = status;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);

    const role = admin.role.toLowerCase();
    if (!admin || (role !== "admin" && role !== "manager")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin role required." },
        { status: 403 }
      );
    }

    const userId = parseInt(params.id);

    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
