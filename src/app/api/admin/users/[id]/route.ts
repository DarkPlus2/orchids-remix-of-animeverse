import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { admins, adminSessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const session = await db.select()
      .from(adminSessions)
      .where(eq(adminSessions.token, token))
      .limit(1);

    if (session.length === 0) {
      return null;
    }

    const sessionData = session[0];
    const expiresAt = new Date(sessionData.expiresAt);
    const now = new Date();

    if (expiresAt < now) {
      return null;
    }

    const admin = await db.select()
      .from(admins)
      .where(eq(admins.id, sessionData.adminId))
      .limit(1);

    if (admin.length === 0 || !admin[0].isActive) {
      return null;
    }

    return admin[0];
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminToken(request);

    if (!admin) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (admin.role.toLowerCase() !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    if (!id || isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'Valid positive integer ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { username, password, role, email, isActive } = body;

    if (role && !['Admin', 'Manager', 'Uploader', 'Moderator'].includes(role)) {
      return NextResponse.json(
        { 
          error: 'Invalid role. Must be Admin, Manager, Uploader, or Moderator', 
          code: 'INVALID_ROLE' 
        },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (username !== undefined) {
      updateData.username = username.trim();
    }

    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (role !== undefined) {
      updateData.role = role;
    }

    if (email !== undefined) {
      updateData.email = email ? email.trim().toLowerCase() : null;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const existingAdmin = await db.select()
      .from(admins)
      .where(eq(admins.id, id))
      .limit(1);

    if (existingAdmin.length === 0) {
      return NextResponse.json(
        { error: 'Admin not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const updated = await db.update(admins)
      .set(updateData)
      .where(eq(admins.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Admin not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const { password: _, ...adminWithoutPassword } = updated[0];

    return NextResponse.json(adminWithoutPassword, { status: 200 });

  } catch (error: any) {
    console.error('PATCH error:', error);

    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { 
          error: 'Username already exists', 
          code: 'DUPLICATE_USERNAME' 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminToken(request);

    if (!admin) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (admin.role.toLowerCase() !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    if (!id || isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'Valid positive integer ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingAdmin = await db.select()
      .from(admins)
      .where(eq(admins.id, id))
      .limit(1);

    if (existingAdmin.length === 0) {
      return NextResponse.json(
        { error: 'Admin not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    await db.delete(admins)
      .where(eq(admins.id, id));

    return NextResponse.json(
      { message: 'Admin deleted successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}