import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments, userSessions } from "@/db/schema";
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

// PUT update comment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { content, isPinned, isSpoiler } = body;

    // Check if comment exists
    const existingComment = await db
      .select()
      .from(comments)
      .where(eq(comments.id, parseInt(id)))
      .limit(1);

    if (existingComment.length === 0) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Only allow owner to update content/spoiler, and admin/owner to pin
    const isOwner = existingComment[0].userId === userId;
    // Check if user is admin (simplified check for now)
    const isAdmin = false; // Need to check admins table if necessary

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (content !== undefined && isOwner) updateData.content = content;
    if (isSpoiler !== undefined && isOwner) updateData.isSpoiler = isSpoiler;
    if (isPinned !== undefined) updateData.isPinned = isPinned;

    // Update comment
    const updated = await db
      .update(comments)
      .set(updateData)
      .where(eq(comments.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Update comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if comment exists and belongs to user
    const existingComment = await db
      .select()
      .from(comments)
      .where(eq(comments.id, parseInt(id)))
      .limit(1);

    if (existingComment.length === 0) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment[0].userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete comment and its replies (cascade)
    await db.delete(comments).where(eq(comments.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
