import type { NextApiRequest } from 'next';
import { SignJWT, jwtVerify } from 'jose';
import { db } from '@/server/db';
import {
  permissionGroupPermissions,
  permissions,
  rolePermissionGroups,
  rolePermissions,
  roles,
  users,
} from '@/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

function getSecret() {
  const secretText = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || '';
  if (!secretText) {
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET is not configured');
  }
  return new TextEncoder().encode(secretText);
}

export interface AuthUser {
  uid: number;
  email: string;
  avatar: string;
  username: string;
  github: string;
  permissions: string[];
}

export async function signAppToken(user: AuthUser) {
  return new SignJWT({
    uid: user.uid,
    email: user.email,
    avatar: user.avatar,
    username: user.username,
    github: user.github,
    permissions: user.permissions,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyAppToken(token: string): Promise<AuthUser> {
  const { payload } = await jwtVerify(token, getSecret());
  return {
    uid: Number(payload.uid),
    email: String(payload.email || ''),
    avatar: String(payload.avatar || ''),
    username: String(payload.username || ''),
    github: String(payload.github || ''),
    permissions: Array.isArray(payload.permissions)
      ? payload.permissions.map(String)
      : [],
  };
}

export async function getPermissionsForUser(userId: number) {
  const [user] = await db
    .select({ roleId: users.roleId })
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user?.roleId) return [];

  const directRows = await db
    .select({ name: permissions.name })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, user.roleId));

  const groupRows = await db
    .select({ name: permissions.name })
    .from(rolePermissionGroups)
    .innerJoin(roles, eq(rolePermissionGroups.roleId, roles.id))
    .innerJoin(
      permissionGroupPermissions,
      eq(
        rolePermissionGroups.permissionGroupId,
        permissionGroupPermissions.permissionGroupId
      )
    )
    .innerJoin(
      permissions,
      eq(permissionGroupPermissions.permissionId, permissions.id)
    )
    .where(eq(roles.id, user.roleId));

  return Array.from(
    new Set([...directRows, ...groupRows].map((row) => row.name).filter(Boolean))
  ) as string[];
}

export async function requireAuth(
  req: NextApiRequest,
  permission?: string
): Promise<AuthUser> {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    throw Object.assign(new Error('Please log in to continue!'), {
      statusCode: 401,
    });
  }

  const auth = await verifyAppToken(token);
  const currentPermissions = await getPermissionsForUser(auth.uid);
  const currentSet = new Set(currentPermissions);

  if (permission && !currentSet.has(permission)) {
    throw Object.assign(new Error('Unauthorized permission'), {
      statusCode: 403,
    });
  }

  return {
    ...auth,
    permissions: currentPermissions,
  };
}
