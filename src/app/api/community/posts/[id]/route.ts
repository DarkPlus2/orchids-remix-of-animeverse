import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communityPosts } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_CATEGORIES = ['announcement', 'discussion', 'news', 'question'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    const postId = parseInt(id);
    if (!id || isNaN(postId) || postId <= 0) {
      return NextResponse.json(
        { 
          error: 'Valid positive integer ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if post exists
    const existingPost = await db.select()
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { 
          error: 'Community post not found',
          code: 'POST_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { likes, comments, shares, pinned, content, imageUrl, category } = body;

    // Validate category if provided
    if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { 
          error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
          code: 'INVALID_CATEGORY' 
        },
        { status: 400 }
      );
    }

    // Validate numeric fields if provided
    if (likes !== undefined && (typeof likes !== 'number' || likes < 0 || !Number.isInteger(likes))) {
      return NextResponse.json(
        { 
          error: 'Likes must be a non-negative integer',
          code: 'INVALID_LIKES' 
        },
        { status: 400 }
      );
    }

    if (comments !== undefined && (typeof comments !== 'number' || comments < 0 || !Number.isInteger(comments))) {
      return NextResponse.json(
        { 
          error: 'Comments must be a non-negative integer',
          code: 'INVALID_COMMENTS' 
        },
        { status: 400 }
      );
    }

    if (shares !== undefined && (typeof shares !== 'number' || shares < 0 || !Number.isInteger(shares))) {
      return NextResponse.json(
        { 
          error: 'Shares must be a non-negative integer',
          code: 'INVALID_SHARES' 
        },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (likes !== undefined) updates.likes = likes;
    if (comments !== undefined) updates.comments = comments;
    if (shares !== undefined) updates.shares = shares;
    if (pinned !== undefined) updates.pinned = pinned;
    if (content !== undefined) updates.content = content.trim();
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (category !== undefined) updates.category = category;

    // Update post
    const updatedPost = await db.update(communityPosts)
      .set(updates)
      .where(eq(communityPosts.id, postId))
      .returning();

    return NextResponse.json(updatedPost[0], { status: 200 });

  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    const postId = parseInt(id);
    if (!id || isNaN(postId) || postId <= 0) {
      return NextResponse.json(
        { 
          error: 'Valid positive integer ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if post exists
    const existingPost = await db.select()
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { 
          error: 'Community post not found',
          code: 'POST_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Delete post
    await db.delete(communityPosts)
      .where(eq(communityPosts.id, postId))
      .returning();

    return NextResponse.json(
      { 
        message: 'Community post deleted successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}