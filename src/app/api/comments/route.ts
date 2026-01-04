import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments, users, userSessions, commentLikes, commentDislikes } from "@/db/schema";
import { eq, and, gt, isNull, desc } from "drizzle-orm";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const animeId = searchParams.get("animeId");
    const episodeNumber = searchParams.get("episodeNumber");
    const sort = searchParams.get("sort") || "newest";
    
    const userId = await verifyAuth(request);

    if (!animeId) {
      return NextResponse.json(
        { error: "animeId is required" },
        { status: 400 }
      );
    }

    const conditions = [eq(comments.animeId, parseInt(animeId))];

    if (episodeNumber) {
      conditions.push(eq(comments.episodeNumber, parseInt(episodeNumber)));
    } else {
      conditions.push(isNull(comments.episodeNumber));
    }

    conditions.push(isNull(comments.parentCommentId));

    const allComments = await db
      .select({
        comment: comments,
        user: {
          id: users.id,
          username: users.username,
          name: users.name,
          profilePicture: users.profilePicture,
          role: users.role,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(and(...conditions))
      .orderBy(sort === "popular" ? desc(comments.likes) : desc(comments.createdAt));

    const userLikes = userId
      ? await db
          .select({ commentId: commentLikes.commentId })
          .from(commentLikes)
          .where(eq(commentLikes.userId, userId))
      : [];

    const userDislikes = userId
      ? await db
          .select({ commentId: commentDislikes.commentId })
          .from(commentDislikes)
          .where(eq(commentDislikes.userId, userId))
      : [];

    const likedCommentIds = new Set(userLikes.map((l) => l.commentId));
    const dislikedCommentIds = new Set(userDislikes.map((d) => d.commentId));

    const commentsWithReplies = await Promise.all(
      allComments.map(async ({ comment, user }) => {
        const replies = await db
          .select({
            comment: comments,
            user: {
              id: users.id,
              username: users.username,
              name: users.name,
              profilePicture: users.profilePicture,
              role: users.role,
            },
          })
          .from(comments)
          .leftJoin(users, eq(comments.userId, users.id))
          .where(eq(comments.parentCommentId, comment.id))
          .orderBy(comments.createdAt);

        return {
          ...comment,
          user,
          isLiked: likedCommentIds.has(comment.id),
          isDisliked: dislikedCommentIds.has(comment.id),
          replies: replies.map((r) => ({
            ...r.comment,
            user: r.user,
            isLiked: likedCommentIds.has(r.comment.id),
            isDisliked: dislikedCommentIds.has(r.comment.id),
            replies: [],
          })),
        };
      })
    );

    return NextResponse.json(commentsWithReplies);
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { animeId, episodeNumber, content, parentCommentId, isSpoiler } = body;

    if (!animeId || !content) {
      return NextResponse.json(
        { error: "animeId and content are required" },
        { status: 400 }
      );
    }

    const newComment = await db
      .insert(comments)
      .values({
        userId,
        animeId: parseInt(animeId),
        episodeNumber: episodeNumber ? parseInt(episodeNumber) : null,
        content,
        parentCommentId: parentCommentId ? parseInt(parentCommentId) : null,
        likes: 0,
        dislikes: 0,
        isPinned: false,
        isSpoiler: isSpoiler || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    const userInfo = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        profilePicture: users.profilePicture,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return NextResponse.json({
      ...newComment[0],
      user: userInfo[0],
      isLiked: false,
      isDisliked: false,
      replies: [],
    }, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
