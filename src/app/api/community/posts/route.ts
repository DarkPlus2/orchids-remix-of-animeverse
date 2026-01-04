import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communityPosts } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const category = searchParams.get('category');

    let query = db.select().from(communityPosts);

    if (category) {
      query = query.where(eq(communityPosts.category, category));
    }

    const results = await query
      .orderBy(desc(communityPosts.pinned), desc(communityPosts.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authorName, content, category, imageUrl, authorIsAdmin, pinned } = body;

    // Validate required fields
    if (!authorName || typeof authorName !== 'string' || authorName.trim() === '') {
      return NextResponse.json(
        { error: 'Author name is required and must be a non-empty string', code: 'INVALID_AUTHOR_NAME' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required and must be a non-empty string', code: 'INVALID_CONTENT' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required', code: 'MISSING_CATEGORY' },
        { status: 400 }
      );
    }

    const validCategories = ['announcement', 'discussion', 'news', 'question'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { 
          error: `Category must be one of: ${validCategories.join(', ')}`, 
          code: 'INVALID_CATEGORY' 
        },
        { status: 400 }
      );
    }

    // Prepare insert data
    const timestamp = new Date().toISOString();
    const insertData: any = {
      authorName: authorName.trim(),
      content: content.trim(),
      category,
      authorIsAdmin: authorIsAdmin ?? false,
      pinned: pinned ?? false,
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (imageUrl) {
      insertData.imageUrl = imageUrl;
    }

    const newPost = await db.insert(communityPosts)
      .values(insertData)
      .returning();

    return NextResponse.json(newPost[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}