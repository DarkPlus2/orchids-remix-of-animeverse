import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, or, desc } from 'drizzle-orm';
import { getAuthorizedAdmin } from '@/lib/server-auth';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthorizedAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // Fetch all users, but order by role then username
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      role: users.role,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
      lastLogin: users.lastLogin,
      status: users.status,
    })
    .from(users)
    .orderBy(desc(users.role), users.username);

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAuthorizedAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await request.json();
    const { userId, role, status } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No data provided to update' }, { status: 400 });
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin users PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
