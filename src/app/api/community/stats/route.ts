import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communityPosts } from '@/db/schema';
import { eq, sql, count, sum } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const stats = await db
      .select({
        totalPosts: count(),
        totalLikes: sum(communityPosts.likes),
        totalComments: sum(communityPosts.comments),
        totalShares: sum(communityPosts.shares),
        pinnedPosts: sql<number>`COUNT(CASE WHEN ${communityPosts.pinned} = 1 THEN 1 END)`,
        announcementCount: sql<number>`COUNT(CASE WHEN ${communityPosts.category} = 'announcement' THEN 1 END)`,
        discussionCount: sql<number>`COUNT(CASE WHEN ${communityPosts.category} = 'discussion' THEN 1 END)`,
        newsCount: sql<number>`COUNT(CASE WHEN ${communityPosts.category} = 'news' THEN 1 END)`,
        questionCount: sql<number>`COUNT(CASE WHEN ${communityPosts.category} = 'question' THEN 1 END)`,
      })
      .from(communityPosts);

    const result = stats[0];

    const response = {
      totalPosts: result.totalPosts || 0,
      totalLikes: result.totalLikes || 0,
      totalComments: result.totalComments || 0,
      totalShares: result.totalShares || 0,
      pinnedPosts: result.pinnedPosts || 0,
      announcementCount: result.announcementCount || 0,
      discussionCount: result.discussionCount || 0,
      newsCount: result.newsCount || 0,
      questionCount: result.questionCount || 0,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}