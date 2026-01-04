import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, comments, favorites, watchHistory } from "@/db/schema";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { getAuthorizedAdmin, hasRequiredRole } from '@/lib/server-auth';

// GET - Fetch all regular users with stats
export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthorizedAdmin(request);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      name: users.name,
      bio: users.bio,
      profilePicture: users.profilePicture,
      favoriteGenres: users.favoriteGenres,
      status: users.status,
      lastLogin: users.lastLogin,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      commentCount: sql<number>`(SELECT COUNT(*) FROM ${comments} WHERE ${comments.userId} = ${users.id})`,
      favoriteCount: sql<number>`(SELECT COUNT(*) FROM ${favorites} WHERE ${favorites.userId} = ${users.id})`,
      watchCount: sql<number>`(SELECT COUNT(*) FROM ${watchHistory} WHERE ${watchHistory.userId} = ${users.id})`,
    }).from(users);

    if (status) {
      query = query.where(eq(users.status, status)) as any;
    }

    const allUsers = await query.orderBy(desc(users.createdAt));

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Bulk delete users (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAuthorizedAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (!hasRequiredRole(admin, 'admin') && !hasRequiredRole(admin, 'manager')) {
      return NextResponse.json(
        { error: 'Insufficient permissions', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");
    
    // Check for bulk delete in body
    let idsToDelete: number[] = [];
    if (userId) {
      idsToDelete = [parseInt(userId)];
    } else {
      const body = await request.json().catch(() => ({}));
      if (body.ids && Array.isArray(body.ids)) {
        idsToDelete = body.ids;
      }
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json(
        { error: "User ID(s) required" },
        { status: 400 }
      );
    }

    await db.delete(users).where(inArray(users.id, idsToDelete));

    return NextResponse.json({ success: true, count: idsToDelete.length });
  } catch (error) {
    console.error("Error deleting users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
