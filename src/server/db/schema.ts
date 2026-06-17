import {
  bigint,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

const gormColumns = {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
};

export const permissions = pgTable('permissions', {
  ...gormColumns,
  name: text('name'),
  description: text('description'),
});

export const permissionGroups = pgTable('permission_groups', {
  ...gormColumns,
  name: text('name'),
  description: text('description'),
});

export const roles = pgTable('roles', {
  ...gormColumns,
  name: text('name'),
  description: text('description'),
});

export const permissionGroupPermissions = pgTable(
  'permission_group_permissions',
  {
    permissionGroupId: integer('permission_group_id').references(
      () => permissionGroups.id
    ),
    permissionId: integer('permission_id').references(() => permissions.id),
  },
  (table) => ({
    uniquePair: unique().on(table.permissionGroupId, table.permissionId),
  })
);

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: integer('role_id').references(() => roles.id),
    permissionId: integer('permission_id').references(() => permissions.id),
  },
  (table) => ({
    uniquePair: unique().on(table.roleId, table.permissionId),
  })
);

export const rolePermissionGroups = pgTable(
  'role_permission_groups',
  {
    roleId: integer('role_id').references(() => roles.id),
    permissionGroupId: integer('permission_group_id').references(
      () => permissionGroups.id
    ),
  },
  (table) => ({
    uniquePair: unique().on(table.roleId, table.permissionGroupId),
  })
);

export const users = pgTable(
  'users',
  {
    ...gormColumns,
    email: text('email').notNull(),
    username: text('username'),
    avatar: text('avatar'),
    github: text('github'),
    twitter: text('twitter'),
    uid: integer('uid'),
    roleId: integer('role_id').references(() => roles.id),
    introduction: text('introduction'),
  },
  (table) => ({
    emailUnique: uniqueIndex('idx_users_email_unique').on(table.email),
    uidIndex: index('idx_users_uid').on(table.uid),
  })
);

export const events = pgTable('events', {
  ...gormColumns,
  title: text('title'),
  description: text('description'),
  eventMode: text('event_mode'),
  eventType: text('event_type'),
  location: text('location'),
  link: text('link'),
  registrationDeadline: timestamp('registration_deadline', {
    withTimezone: true,
  }),
  registrationLink: text('registration_link'),
  startTime: timestamp('start_time', { withTimezone: true }),
  endTime: timestamp('end_time', { withTimezone: true }),
  coverImg: text('cover_img'),
  tags: text('tags').array(),
  participants: integer('participants').default(0),
  status: integer('status').default(0),
  publishStatus: integer('publish_status').default(1),
  publishTime: timestamp('publish_time', { withTimezone: true }),
  twitter: text('twitter'),
  userId: integer('user_id').references(() => users.id),
});

export const recaps = pgTable('recaps', {
  ...gormColumns,
  content: text('content'),
  video: text('video'),
  recording: text('recording'),
  twitter: text('twitter'),
  eventId: integer('event_id').references(() => events.id),
  userId: integer('user_id').references(() => users.id),
});

export const articles = pgTable('articles', {
  ...gormColumns,
  title: text('title'),
  description: text('description'),
  content: text('content'),
  sourceLink: text('source_link'),
  sourceType: text('source_type'),
  coverImg: text('cover_img'),
  tags: text('tags').array(),
  category: text('category'),
  author: text('author'),
  translator: text('translator'),
  publisherId: integer('publisher_id').references(() => users.id),
  publishTime: timestamp('publish_time', { withTimezone: true }),
  publishStatus: integer('publish_status').default(1),
  viewCount: integer('view_count').default(0),
});

export const testnets = pgTable('testnets', {
  ...gormColumns,
  blockNum: bigint('block_num', { mode: 'number' }),
  avgBlockTime: text('avg_block_time'),
  contracts: integer('contracts').default(0),
});

export const validators = pgTable('validators', {
  ...gormColumns,
  t1Validators: integer('t1_validators').default(0),
  t2Validators: integer('t2_validators').default(0),
});

export const categories = pgTable(
  'categories',
  {
    ...gormColumns,
    name: varchar('name', { length: 50 }).notNull(),
    desc: text('desc'),
    fullName: text('full_name'),
    isOnlyMonad: integer('is_only_monad').default(0),
    parentId: integer('parent_id'),
  },
  (table) => ({
    parentIndex: index('idx_categories_parent_id').on(table.parentId),
  })
);

export const dapps = pgTable('dapps', {
  ...gormColumns,
  name: text('name'),
  description: text('description'),
  x: text('x'),
  logo: text('logo'),
  site: text('site'),
  coverImg: text('cover_img'),
  categoryId: integer('category_id').references(() => categories.id),
  tags: text('tags').array(),
  userId: integer('user_id').references(() => users.id),
  isFeature: integer('is_feature').default(2),
  isOnlyMonad: integer('is_only_monad').default(2),
});

export const tutorials = pgTable('tutorials', {
  ...gormColumns,
  title: text('title'),
  description: text('description'),
  content: text('content'),
  sourceLink: text('source_link'),
  coverImg: text('cover_img'),
  tags: text('tags').array(),
  author: text('author'),
  publisherId: integer('publisher_id').references(() => users.id),
  publishTime: timestamp('publish_time', { withTimezone: true }),
  publishStatus: integer('publish_status').default(1),
  dappId: integer('dapp_id').references(() => dapps.id),
  viewCount: integer('view_count').default(0),
});

export const feedbacks = pgTable('feedbacks', {
  ...gormColumns,
  content: text('content'),
  url: text('url'),
  email: text('email'),
  userId: integer('user_id').references(() => users.id),
});

export const posts = pgTable('posts', {
  ...gormColumns,
  title: text('title'),
  description: text('description'),
  twitter: text('twitter'),
  tags: text('tags').array(),
  viewCount: integer('view_count').default(0),
  userId: integer('user_id').references(() => users.id),
  likeCount: integer('like_count').default(0),
  favoriteCount: integer('favorite_count').default(0),
});

export const postLikes = pgTable(
  'post_likes',
  {
    ...gormColumns,
    postId: integer('post_id').notNull().references(() => posts.id),
    userId: integer('user_id').notNull().references(() => users.id),
  },
  (table) => ({
    uniqueUserPost: uniqueIndex('idx_user_post').on(table.postId, table.userId),
  })
);

export const postFavorites = pgTable(
  'post_favorites',
  {
    ...gormColumns,
    postId: integer('post_id').notNull().references(() => posts.id),
    userId: integer('user_id').notNull().references(() => users.id),
  },
  (table) => ({
    uniqueUserPostFavorite: uniqueIndex('idx_user_post_favorite').on(
      table.postId,
      table.userId
    ),
  })
);

export const dailyStats = pgTable(
  'daily_stats',
  {
    ...gormColumns,
    date: timestamp('date', { withTimezone: true }),
    users: integer('users').default(0),
    blogs: integer('blogs').default(0),
    tutorials: integer('tutorials').default(0),
    events: integer('events').default(0),
    posts: integer('posts').default(0),
  },
  (table) => ({
    dateUnique: uniqueIndex('daily_stats_date_unique').on(table.date),
  })
);

export const follows = pgTable(
  'follows',
  {
    ...gormColumns,
    followerId: integer('follower_id').notNull().references(() => users.id),
    followingId: integer('following_id').notNull().references(() => users.id),
  },
  (table) => ({
    followerIndex: index('idx_follows_follower_id').on(table.followerId),
    followingIndex: index('idx_follows_following_id').on(table.followingId),
    uniqueFollow: uniqueIndex('idx_follows_pair').on(
      table.followerId,
      table.followingId
    ),
  })
);
