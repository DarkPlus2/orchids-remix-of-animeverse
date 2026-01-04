import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments, commentLikes, commentDislikes, userSessions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) return null;

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

  return sessions.length > 0 ? sessions[0].userId : null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const { id } = await params;
    const commentId = parseInt(id);

    // Check if comment exists
    const comment = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (comment.length === 0) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    // Check if already disliked
    const existingDislike = await db
      .select()
      .from(commentDislikes)
      .where(and(eq(commentDislikes.userId, userId), eq(commentDislikes.commentId, commentId)))
      .limit(1);

    if (existingDislike.length > 0) {
      // Remove dislike
      await db.delete(commentDislikes).where(eq(commentDislikes.id, existingDislike[0].id));
      await db.update(comments).set({ dislikes: Math.max(0, comment[0].dislikes - 1) }).where(eq(comments.id, commentId));
      return NextResponse.json({ disliked: false, dislikes: Math.max(0, comment[0].dislikes - 1) });
    } else {
      // Add dislike
      // Also remove like if it exists
      const existingLike = await db
        .select()
        .from(commentLikes)
        .where(and(eq(commentLikes.userId, userId), eq(commentLikes.commentId, commentId)))
        .limit(1);

      let currentLikes = comment[0].likes;
      if (existingLike.length > 0) {
        await db.delete(commentLikes).where(eq(commentLikes.id, existingLike[0].id));
        currentLikes = Math.max(0, currentLikes - 1);
      }

      await db.insert(commentDislikes).values({
        userId,
        commentId,
        createdAt: new Date().toISOString(),
      });

      await db.update(comments).set({ 
        dislikes: comment[0].dislikes + 1,
        likes: currentLikes
      }).where(eq(comments.id, commentId));

      return NextResponse.json({ disliked: true, dislikes: comment[0].dislikes + 1, likes: currentLikes });
    }
  } catch (error) {
    console.error("Toggle dislike error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
