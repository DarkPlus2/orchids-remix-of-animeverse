import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments, commentLikes, userSessions } from "@/db/schema";
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

// POST toggle like
export async function POST(
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
    const commentId = parseInt(id);

    // Check if comment exists
    const comment = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (comment.length === 0) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await db
      .select()
      .from(commentLikes)
      .where(
        and(
          eq(commentLikes.userId, userId),
          eq(commentLikes.commentId, commentId)
        )
      )
      .limit(1);

    if (existingLike.length > 0) {
      // Unlike - remove like
      await db
        .delete(commentLikes)
        .where(eq(commentLikes.id, existingLike[0].id));

      // Decrease like count
      await db
        .update(comments)
        .set({ likes: comment[0].likes - 1 })
        .where(eq(comments.id, commentId));

      return NextResponse.json({ liked: false, likes: comment[0].likes - 1 });
    } else {
      // Like - add like
      await db.insert(commentLikes).values({
        userId,
        commentId,
        createdAt: new Date().toISOString(),
      });

      // Increase like count
      await db
        .update(comments)
        .set({ likes: comment[0].likes + 1 })
        .where(eq(comments.id, commentId));

      return NextResponse.json({ liked: true, likes: comment[0].likes + 1 });
    }
  } catch (error) {
    console.error("Toggle like error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
