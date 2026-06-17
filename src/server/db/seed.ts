import { db } from './index';
import {
  categories,
  permissionGroupPermissions,
  permissionGroups,
  permissions,
  rolePermissionGroups,
  roles,
} from './schema';
import { eq, and, isNull } from 'drizzle-orm';

const permissionSeed = [
  ['blog:write', '创作博客'],
  ['blog:review', '审核博客'],
  ['blog:delete', '删除博客'],
  ['blog:publish', '发布博客'],
  ['tutorial:write', '创作教程'],
  ['tutorial:review', '审核教程'],
  ['tutorial:delete', '删除教程'],
  ['tutorial:publish', '发布教程'],
  ['event:write', '新建活动'],
  ['event:review', '审核活动'],
  ['event:delete', '删除活动'],
  ['event:publish', '发布活动'],
  ['dapp:write', '增加Dapp'],
  ['dapp:review', '审核Dapp'],
  ['dapp:delete', '删除Dapp'],
  ['dapp:publish', '发布Dapp'],
] as const;

const groupSeed = [
  ['博客作者', '博客创作权限组', ['blog:write', 'blog:delete']],
  [
    '博客管理员',
    '博客管理权限组',
    ['blog:write', 'blog:review', 'blog:delete', 'blog:publish'],
  ],
  ['教程作者', '教程创作权限组', ['tutorial:write', 'tutorial:delete']],
  [
    '教程管理员',
    '教程管理权限组',
    ['tutorial:write', 'tutorial:review', 'tutorial:delete', 'tutorial:publish'],
  ],
  ['活动创建者', '活动创建权限组', ['event:write']],
  [
    '活动管理员',
    '活动管理权限组',
    ['event:write', 'event:review', 'event:delete', 'event:publish'],
  ],
  [
    '内容创作者',
    '内容创作者权限组',
    ['blog:write', 'blog:delete', 'tutorial:write', 'tutorial:delete'],
  ],
  [
    '内容管理员',
    '内容管理权限组',
    [
      'blog:write',
      'blog:review',
      'blog:delete',
      'blog:publish',
      'tutorial:write',
      'tutorial:review',
      'tutorial:delete',
      'tutorial:publish',
    ],
  ],
  [
    'Dapp管理员',
    'Dapp管理权限组',
    ['dapp:write', 'dapp:review', 'dapp:delete', 'dapp:publish'],
  ],
  [
    '超级管理员',
    '拥有所有权限',
    permissionSeed.map(([name]) => name),
  ],
] as const;

const roleSeed = [
  ['blog_writer', '博客作者角色', ['博客作者']],
  ['blog_admin', '博客管理员角色', ['博客管理员']],
  ['tutorial_writer', '教程作者角色', ['教程作者']],
  ['tutorial_admin', '教程管理员角色', ['教程管理员']],
  ['event_creator', '活动创建角色', ['活动创建者']],
  ['event_admin', '活动管理员角色', ['活动管理员']],
  ['content_creator', '内容创作者角色', ['内容创作者']],
  ['content_admin', '内容管理员角色', ['内容管理员']],
  ['dapp_admin', 'Dapp管理员角色', ['Dapp管理员']],
  ['super_admin', '超级管理员角色', ['超级管理员']],
] as const;

const appSubCategories = [
  'AI',
  'Betting',
  'DeFi',
  'DePIN',
  'Gaming',
  'Governance',
  'NFT',
  'Other Apps',
  'Payments',
  'Prediction Market',
  'RWA',
  'Social',
];

const infraSubCategories = [
  'Account Abstraction',
  'Analytics',
  'Cross-Chain',
  'Dev Tooling',
  'Gaming Infra',
  'Identity',
  'Indexer',
  'Onramp',
  'Oracle',
  'Other Infra',
  'Privacy',
  'RPC',
  'Stablecoin',
  'Wallet',
  'Zero-Knowledge',
];

async function findPermission(name: string) {
  const [row] = await db
    .select()
    .from(permissions)
    .where(and(eq(permissions.name, name), isNull(permissions.deletedAt)))
    .limit(1);
  return row;
}

async function findGroup(name: string) {
  const [row] = await db
    .select()
    .from(permissionGroups)
    .where(
      and(eq(permissionGroups.name, name), isNull(permissionGroups.deletedAt))
    )
    .limit(1);
  return row;
}

async function findRole(name: string) {
  const [row] = await db
    .select()
    .from(roles)
    .where(and(eq(roles.name, name), isNull(roles.deletedAt)))
    .limit(1);
  return row;
}

async function ensurePermission(name: string, description: string) {
  const existing = await findPermission(name);
  if (existing) return existing;
  const [row] = await db
    .insert(permissions)
    .values({ name, description })
    .returning();
  return row;
}

async function ensureGroup(
  name: string,
  description: string,
  permissionNames: readonly string[]
) {
  let group = await findGroup(name);
  if (!group) {
    [group] = await db
      .insert(permissionGroups)
      .values({ name, description })
      .returning();
  }

  for (const permissionName of permissionNames) {
    const permission = await findPermission(permissionName);
    if (!permission) continue;
    await db
      .insert(permissionGroupPermissions)
      .values({
        permissionGroupId: group.id,
        permissionId: permission.id,
      })
      .onConflictDoNothing();
  }

  return group;
}

async function ensureRole(
  name: string,
  description: string,
  groupNames: readonly string[]
) {
  let role = await findRole(name);
  if (!role) {
    [role] = await db.insert(roles).values({ name, description }).returning();
  }

  for (const groupName of groupNames) {
    const group = await findGroup(groupName);
    if (!group) continue;
    await db
      .insert(rolePermissionGroups)
      .values({
        roleId: role.id,
        permissionGroupId: group.id,
      })
      .onConflictDoNothing();
  }

  return role;
}

async function ensureCategory(
  name: string,
  parentId: number | null,
  fullName?: string
) {
  const where = parentId
    ? and(
        eq(categories.name, name),
        eq(categories.parentId, parentId),
        isNull(categories.deletedAt)
      )
    : and(
        eq(categories.name, name),
        isNull(categories.parentId),
        isNull(categories.deletedAt)
      );

  const [existing] = await db.select().from(categories).where(where).limit(1);
  if (existing) return existing;

  const [row] = await db
    .insert(categories)
    .values({ name, parentId, fullName })
    .returning();
  return row;
}

export async function seed() {
  for (const [name, description] of permissionSeed) {
    await ensurePermission(name, description);
  }

  for (const [name, description, permissionNames] of groupSeed) {
    await ensureGroup(name, description, permissionNames);
  }

  for (const [name, description, groupNames] of roleSeed) {
    await ensureRole(name, description, groupNames);
  }

  const app = await ensureCategory('App', null);
  const infra = await ensureCategory('Infra', null);

  for (const name of appSubCategories) {
    await ensureCategory(name, app.id, `${app.name}-${name}`);
  }

  for (const name of infraSubCategories) {
    await ensureCategory(name, infra.id, `${infra.name}-${name}`);
  }
}

seed()
  .then(() => {
    console.log('Seed completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
