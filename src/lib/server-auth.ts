import { NextRequest } from 'next/server';
import { db } from '@/db';
import { users, userSessions } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { cookies } from 'next/headers';

export interface AuthUser {
  id: number;
  username: string;
  role: string;
  email: string | null;
}

/**
 * Verifies if the request is from an authorized admin (role === 'admin')
 */
export async function getAuthorizedAdmin(request: NextRequest): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const userToken = cookieStore.get('auth_token')?.value;

    if (userToken) {
      const userSessionData = await db
        .select()
        .from(userSessions)
        .where(
          and(
            eq(userSessions.token, userToken),
            gt(userSessions.expiresAt, new Date().toISOString())
          )
        )
        .limit(1);

      if (userSessionData.length > 0) {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, userSessionData[0].userId))
          .limit(1);

        if (user.length > 0 && user[0].role === 'admin') {
          return {
            id: user[0].id,
            username: user[0].username,
            role: user[0].role,
            email: user[0].email,
          };
        }
      }
    }
  } catch (error) {
    console.error('Admin session verification error:', error);
  }

  return null;
}

/**
 * Checks if the authorized admin has the required role
 */
export function hasRequiredRole(user: AuthUser, requiredRole: string): boolean {
  return user.role === 'admin';
}
