import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { comments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthorizedAdmin } from '@/lib/server-auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthorizedAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const id = parseInt(params.id);
    await db.delete(comments).where(eq(comments.id, id));

    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Admin comments DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
