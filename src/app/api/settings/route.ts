import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthorizedAdmin, hasRequiredRole } from '@/lib/server-auth';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthorizedAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (!hasRequiredRole(admin, 'admin')) {
      return NextResponse.json(
        { error: 'Insufficient permissions', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const allSettings = await db.select().from(settings);
    return NextResponse.json(allSettings, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getAuthorizedAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (!hasRequiredRole(admin, 'admin')) {
      return NextResponse.json(
        { error: 'Insufficient permissions', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { key, value } = body;

    // Validate key is provided and non-empty
    if (!key || typeof key !== 'string' || key.trim() === '') {
      return NextResponse.json({ 
        error: "Key is required and must be a non-empty string",
        code: "INVALID_KEY" 
      }, { status: 400 });
    }

    // Validate value is provided (can be empty string)
    if (value === undefined || value === null) {
      return NextResponse.json({ 
        error: "Value is required",
        code: "MISSING_VALUE" 
      }, { status: 400 });
    }

    const trimmedKey = key.trim();

    // Check if setting exists
    const existingSetting = await db.select()
      .from(settings)
      .where(eq(settings.key, trimmedKey))
      .limit(1);

    if (existingSetting.length === 0) {
      return NextResponse.json({ 
        error: "Setting with the specified key not found",
        code: "SETTING_NOT_FOUND" 
      }, { status: 404 });
    }

    // Update the setting
    const updated = await db.update(settings)
      .set({
        value: value,
        updatedAt: new Date().toISOString()
      })
      .where(eq(settings.key, trimmedKey))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}