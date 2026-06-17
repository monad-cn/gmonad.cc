import type { NextApiRequest, NextApiResponse } from 'next';
import { sqlClient } from '@/server/db';
import { failure, success } from '@/server/api/response';
import {
  getPermissionsForUser,
  requireAuth,
  signAppToken,
} from '@/server/auth/token';

type Row = Record<string, any>;

const nowSql = 'now()';

function first<T = Row>(rows: T[]): T | null {
  return rows[0] ?? null;
}

async function query<T = Row>(text: string, params: unknown[] = []) {
  return (await sqlClient.unsafe(text, params as any[])) as T[];
}

function intValue(value: unknown, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pageParams(req: NextApiRequest) {
  const page = Math.max(intValue(req.query.page, 1), 1);
  const pageSize = Math.max(intValue(req.query.page_size, 6), 1);
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function softDeleteWhere(alias = '') {
  return `${alias ? `${alias}.` : ''}deleted_at is null`;
}

function mapBase(row: Row) {
  return {
    ID: row.id,
    CreatedAt: row.created_at,
    UpdatedAt: row.updated_at,
    DeletedAt: row.deleted_at,
  };
}

function mapUser(row: Row | null) {
  if (!row) return null;
  return {
    ...mapBase(row),
    email: row.email,
    username: row.username,
    avatar: row.avatar,
    github: row.github,
    twitter: row.twitter,
    introduction: row.introduction,
    post_count: row.post_count,
  };
}

function parseJsonObject(value: unknown) {
  if (!value) return null;
  if (typeof value === 'string') return JSON.parse(value);
  return value;
}

function mapCategory(row: Row | null) {
  if (!row) return null;
  return {
    ...mapBase(row),
    name: row.name,
    desc: row.desc,
    full_name: row.full_name,
    is_only_monad: row.is_only_monad,
    parent_id: row.parent_id,
    children: row.children ?? [],
  };
}

function mapArticle(row: Row) {
  return {
    ...mapBase(row),
    title: row.title,
    description: row.description,
    content: row.content,
    source_link: row.source_link,
    source_type: row.source_type,
    cover_img: row.cover_img,
    tags: row.tags ?? [],
    category: row.category,
    author: row.author,
    translator: row.translator,
    publisher_id: row.publisher_id,
    publisher: parseJsonObject(row.publisher),
    publish_time: row.publish_time,
    publish_status: row.publish_status,
    view_count: row.view_count,
  };
}

function mapEvent(row: Row) {
  return {
    ...mapBase(row),
    title: row.title,
    description: row.description,
    event_mode: row.event_mode,
    event_type: row.event_type,
    location: row.location,
    link: row.link,
    registration_deadline: row.registration_deadline,
    registration_link: row.registration_link,
    start_time: row.start_time,
    end_time: row.end_time,
    cover_img: row.cover_img,
    tags: row.tags ?? [],
    participants: row.participants,
    status: row.status,
    publish_status: row.publish_status,
    publish_time: row.publish_time,
    twitter: row.twitter,
    user_id: row.user_id,
  };
}

function mapDapp(row: Row) {
  return {
    ...mapBase(row),
    name: row.name,
    description: row.description,
    x: row.x,
    logo: row.logo,
    site: row.site,
    cover_img: row.cover_img,
    category_id: row.category_id,
    category: parseJsonObject(row.category),
    tags: row.tags ?? [],
    user_id: row.user_id,
    tutorials: parseJsonObject(row.tutorials) ?? [],
    is_feature: row.is_feature,
    is_only_monad: row.is_only_monad,
  };
}

function mapTutorial(row: Row) {
  return {
    ...mapBase(row),
    title: row.title,
    description: row.description,
    content: row.content,
    source_link: row.source_link,
    cover_img: row.cover_img,
    tags: row.tags ?? [],
    author: row.author,
    publisher_id: row.publisher_id,
    publisher: parseJsonObject(row.publisher),
    publish_time: row.publish_time,
    publish_status: row.publish_status,
    dapp_id: row.dapp_id,
    dapp: parseJsonObject(row.dapp),
    view_count: row.view_count,
  };
}

function mapPost(row: Row) {
  return {
    ...mapBase(row),
    title: row.title,
    description: row.description,
    twitter: row.twitter,
    tags: row.tags ?? [],
    view_count: row.view_count,
    user_id: row.user_id,
    user: parseJsonObject(row.user),
    like_count: row.like_count,
    favorite_count: row.favorite_count,
  };
}

function mapRecap(row: Row) {
  return {
    ...mapBase(row),
    content: row.content,
    video: row.video,
    recording: row.recording,
    twitter: row.twitter,
    event_id: row.event_id,
    user_id: row.user_id,
    user: parseJsonObject(row.user),
  };
}

async function insertRow(table: string, values: Record<string, unknown>) {
  const columns = Object.keys(values);
  const params = columns.map((column) => values[column]);
  const placeholders = columns.map((_, index) => `$${index + 1}`);
  const rows = await query(
    `insert into ${table} (${columns.join(', ')})
     values (${placeholders.join(', ')})
     returning *`,
    params
  );
  return first(rows);
}

async function updateRow(
  table: string,
  id: number,
  values: Record<string, unknown>
) {
  const columns = Object.keys(values);
  const params = columns.map((column) => values[column]);
  const sets = columns.map((column, index) => `${column} = $${index + 1}`);
  params.push(id);
  const rows = await query(
    `update ${table}
     set ${sets.join(', ')}, updated_at = ${nowSql}
     where id = $${params.length} and ${softDeleteWhere()}
     returning *`,
    params
  );
  return first(rows);
}

async function softDelete(table: string, id: number) {
  const rows = await query(
    `update ${table}
     set deleted_at = ${nowSql}, updated_at = ${nowSql}
     where id = $1 and ${softDeleteWhere()}
     returning id`,
    [id]
  );
  return Boolean(first(rows));
}

function addFilter(
  clauses: string[],
  params: unknown[],
  sql: string,
  value: unknown
) {
  params.push(value);
  clauses.push(sql.replace('?', `$${params.length}`));
}

async function getUserById(id: number) {
  const row = first(
    await query(
      `select u.*,
        (select count(*)::int from posts p where p.user_id = u.id and ${softDeleteWhere(
          'p'
        )}) as post_count
       from users u
       where u.id = $1 and ${softDeleteWhere('u')}`,
      [id]
    )
  );
  return mapUser(row);
}

async function getDefaultRoleId() {
  const role = first(
    await query(`select id from roles where name = 'content_creator' limit 1`)
  );
  return role?.id ?? null;
}

async function handleLogin(req: NextApiRequest, res: NextApiResponse) {
  const code = String(req.body?.code || '').trim();
  if (!code) return failure(res, 400, 'Invalid request. Please try again later.');

  const accessApi = process.env.OAUTH_ACCESS_API;
  const getUserApi = process.env.OAUTH_GET_USER;
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!accessApi || !getUserApi || !clientId || !clientSecret) {
    return failure(res, 500, 'OAuth is not configured');
  }

  const tokenResp = await fetch(accessApi, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  }).then((response) => response.json());

  if (tokenResp.status !== 200 || !tokenResp.data?.token) {
    return failure(res, 500, 'Network error, please try again later.');
  }

  const userResp = await fetch(getUserApi, {
    headers: {
      Authorization: `Bearer ${tokenResp.data.token}`,
    },
  }).then((response) => response.json());

  if (userResp.status !== 200 || !userResp.data?.uid) {
    return failure(res, 500, userResp.message || 'Network error');
  }

  const remote = userResp.data;
  let user = first(
    await query(`select * from users where uid = $1 and ${softDeleteWhere()}`, [
      remote.uid,
    ])
  );

  if (user) {
    user = await updateRow('users', user.id, {
      uid: remote.uid,
      email: remote.email,
      github: remote.github,
    });
  } else {
    const roleId = await getDefaultRoleId();
    if (!roleId) {
      return failure(res, 500, 'Default role is missing. Run npm run db:seed.');
    }

    user = await insertRow('users', {
      uid: remote.uid,
      avatar: remote.avatar,
      email: remote.email,
      username: remote.user_name,
      github: remote.github,
      role_id: roleId,
    });
  }

  if (!user) {
    return failure(res, 500, 'Failed to save user');
  }

  const permissions = await getPermissionsForUser(user.id);
  const token = await signAppToken({
    uid: user.id,
    email: user.email,
    avatar: user.avatar,
    username: user.username,
    github: user.github,
    permissions,
  });

  return success(res, 'success', {
    ...mapUser(user),
    permissions,
    token,
  });
}

async function handleUsers(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string[]
) {
  if (path[1] === 'follow' && path[2] === 'states' && req.method === 'POST') {
    const auth = await requireAuth(req);
    const userIds = Array.isArray(req.body?.user_ids) ? req.body.user_ids : [];
    if (userIds.length === 0) return success(res, 'ok', []);

    const rows = await query(
      `select following_id from follows
       where follower_id = $1 and following_id = any($2::int[])
       and ${softDeleteWhere()}`,
      [auth.uid, userIds]
    );
    const followed = new Set(rows.map((row) => row.following_id));
    return success(
      res,
      'ok',
      userIds.map((id: number) => ({
        user_id: id,
        is_following: followed.has(id),
      }))
    );
  }

  if ((path[1] === 'follow' || path[1] === 'unfollow') && req.method === 'POST') {
    const auth = await requireAuth(req);
    const targetId = intValue(path[2]);
    if (!targetId || targetId === auth.uid) {
      return failure(res, 400, 'Invalid user');
    }

    if (path[1] === 'follow') {
      await query(
        `insert into follows (follower_id, following_id, created_at, updated_at)
         values ($1, $2, ${nowSql}, ${nowSql})
         on conflict do nothing`,
        [auth.uid, targetId]
      );
      return success(res, '关注成功');
    }

    await query(
      `update follows
       set deleted_at = ${nowSql}, updated_at = ${nowSql}
       where follower_id = $1 and following_id = $2 and ${softDeleteWhere()}`,
      [auth.uid, targetId]
    );
    return success(res, '取消关注成功');
  }

  const id = intValue(path[1]);
  if (!id) return failure(res, 400, 'Invalid ID');

  if (req.method === 'GET') {
    const user = await getUserById(id);
    if (!user) return failure(res, 400, 'Invalid User');
    return success(res, 'success', user);
  }

  if (req.method === 'PUT') {
    const auth = await requireAuth(req);
    if (auth.uid !== id) return failure(res, 401, 'not owner');
    const user = await updateRow('users', id, {
      email: req.body?.email || '',
      avatar: req.body?.avatar || '',
      github: req.body?.github || '',
      username: req.body?.username || '',
      introduction: req.body?.introduction ?? null,
    });
    return success(res, 'success', mapUser(user));
  }

  return failure(res, 405, 'Method not allowed');
}

function articleSelect() {
  return `a.*,
    case when u.id is null then null else json_build_object(
      'ID', u.id,
      'CreatedAt', u.created_at,
      'UpdatedAt', u.updated_at,
      'email', u.email,
      'username', u.username,
      'avatar', u.avatar,
      'github', u.github,
      'introduction', u.introduction
    ) end as publisher`;
}

async function handleArticles(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string[],
  categoryDefault?: string
) {
  const id = intValue(path[1]);

  if (!id && req.method === 'POST') {
    const auth = await requireAuth(req, 'blog:write');
    const row = await insertRow('articles', {
      title: req.body?.title,
      description: req.body?.desc,
      content: req.body?.content,
      category: req.body?.category || categoryDefault || 'blog',
      cover_img: req.body?.cover_img,
      tags: req.body?.tags ?? [],
      source_link: req.body?.source_link,
      source_type: req.body?.source_type,
      author: req.body?.author,
      translator: req.body?.translator,
      publisher_id: auth.uid,
    });
    return success(res, 'create success', mapArticle(row!));
  }

  if (!id && req.method === 'GET') {
    const { page, pageSize, offset } = pageParams(req);
    const clauses = [`${softDeleteWhere('a')}`];
    const params: unknown[] = [];

    const category = String(req.query.category || categoryDefault || '');
    if (category) addFilter(clauses, params, 'a.category = ?', category);
    if (req.query.keyword) {
      addFilter(
        clauses,
        params,
        '(a.title ilike ? or a.description ilike ?)',
        `%${req.query.keyword}%`
      );
      params.push(`%${req.query.keyword}%`);
      clauses[clauses.length - 1] = `(a.title ilike $${
        params.length - 1
      } or a.description ilike $${params.length})`;
    }
    if (req.query.tag) addFilter(clauses, params, '? = any(a.tags)', req.query.tag);
    if (req.query.publish_status && req.query.publish_status !== '0') {
      addFilter(clauses, params, 'a.publish_status = ?', intValue(req.query.publish_status));
    }
    if (req.query.user_id) {
      addFilter(clauses, params, 'a.publisher_id = ?', intValue(req.query.user_id));
    }

    const where = clauses.join(' and ');
    const total = first(
      await query(`select count(*)::int as count from articles a where ${where}`, params)
    )?.count;
    const rows = await query(
      `select ${articleSelect()}
       from articles a
       left join users u on u.id = a.publisher_id and ${softDeleteWhere('u')}
       where ${where}
       order by a.publish_time ${req.query.order === 'asc' ? 'asc' : 'desc'} nulls last, a.created_at desc
       limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, pageSize, offset]
    );
    const data = {
      page,
      page_size: pageSize,
      total,
      ...(category === 'blog'
        ? { blogs: rows.map(mapArticle) }
        : { guides: rows.map(mapArticle) }),
    };
    return success(res, 'query success', data);
  }

  if (!id) return failure(res, 400, 'Invalid ID');

  if (req.method === 'GET') {
    const row = first(
      await query(
        `select ${articleSelect()}
         from articles a
         left join users u on u.id = a.publisher_id and ${softDeleteWhere('u')}
         where a.id = $1 and ${softDeleteWhere('a')}`,
        [id]
      )
    );
    if (!row) return failure(res, 400, 'Invalid Article');
    await query(`update articles set view_count = coalesce(view_count, 0) + 1 where id = $1`, [id]);
    return success(res, 'success', mapArticle(row!));
  }

  if (req.method === 'DELETE') {
    const auth = await requireAuth(req, 'blog:delete');
    const row = first(await query(`select publisher_id from articles where id = $1`, [id]));
    if (!row) return failure(res, 400, 'Invalid article');
    if (row.publisher_id !== auth.uid && !auth.permissions.includes('blog:review')) {
      return failure(res, 401, 'not author');
    }
    await softDelete('articles', id);
    return success(res, 'delete success');
  }

  if (req.method === 'PUT' && path[2] === 'status') {
    await requireAuth(req, 'blog:review');
    const row = await updateRow('articles', id, {
      publish_status: req.body?.publish_status,
      publish_time: new Date(),
    });
    return success(res, 'success', mapArticle(row!));
  }

  if (req.method === 'PUT') {
    const auth = await requireAuth(req, 'blog:write');
    const existing = first(await query(`select publisher_id from articles where id = $1`, [id]));
    if (!existing) return failure(res, 400, 'Invalid article');
    if (existing.publisher_id !== auth.uid) return failure(res, 401, 'not author');
    const row = await updateRow('articles', id, {
      title: req.body?.title,
      description: req.body?.desc,
      content: req.body?.content,
      category: req.body?.category || categoryDefault || 'blog',
      source_link: req.body?.source_link,
      cover_img: req.body?.cover_img,
      tags: req.body?.tags ?? [],
      author: req.body?.author,
      translator: req.body?.translator,
      publish_status: 1,
    });
    return success(res, 'success', mapArticle(row!));
  }

  return failure(res, 405, 'Method not allowed');
}

async function handleEvents(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string[]
) {
  if (path[1] === 'recap') return handleRecaps(req, res, path.slice(1));
  const id = intValue(path[1]);

  if (!id && req.method === 'POST') {
    const auth = await requireAuth(req, 'event:write');
    const row = await insertRow('events', {
      title: req.body?.title,
      description: req.body?.desc,
      event_mode: req.body?.event_mode,
      event_type: req.body?.event_type,
      location: req.body?.location,
      link: req.body?.link,
      registration_link: req.body?.registration_link,
      registration_deadline: req.body?.registration_deadline || null,
      start_time: req.body?.start_time,
      end_time: req.body?.end_time,
      cover_img: req.body?.cover_img,
      tags: req.body?.tags ?? [],
      twitter: req.body?.twitter,
      user_id: auth.uid,
    });
    return success(res, 'create success', mapEvent(row!));
  }

  if (!id && req.method === 'GET') {
    const { page, pageSize, offset } = pageParams(req);
    const clauses = [softDeleteWhere()];
    const params: unknown[] = [];
    if (req.query.keyword) {
      params.push(`%${req.query.keyword}%`, `%${req.query.keyword}%`);
      clauses.push(`(title ilike $${params.length - 1} or description ilike $${params.length})`);
    }
    if (req.query.tag) addFilter(clauses, params, '? = any(tags)', req.query.tag);
    if (req.query.location) addFilter(clauses, params, 'location ilike ?', `%${req.query.location}%`);
    if (req.query.event_mode) addFilter(clauses, params, 'event_mode = ?', req.query.event_mode);
    if (req.query.event_type) addFilter(clauses, params, 'event_type = ?', req.query.event_type);
    const status = intValue(req.query.status, 0);
    if (status !== 3) addFilter(clauses, params, 'status = ?', status);
    const publishStatus = intValue(req.query.publish_status, 0);
    if (publishStatus !== 0) addFilter(clauses, params, 'publish_status = ?', publishStatus);
    if (req.query.start_date && req.query.end_date) {
      params.push(req.query.start_date, req.query.end_date);
      clauses.push(`created_at between $${params.length - 1} and ($${params.length}::date + interval '1 day')`);
    }
    const where = clauses.join(' and ');
    const total = first(await query(`select count(*)::int as count from events where ${where}`, params))?.count;
    const rows = await query(
      `select * from events where ${where}
       order by start_time ${req.query.order === 'asc' ? 'asc' : 'desc'}
       limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, pageSize, offset]
    );
    return success(res, 'query success', {
      events: rows.map(mapEvent),
      page,
      page_size: pageSize,
      total,
    });
  }

  if (!id) return failure(res, 400, 'Invalid ID');

  if (req.method === 'GET') {
    const row = first(await query(`select * from events where id = $1 and ${softDeleteWhere()}`, [id]));
    if (!row) return failure(res, 400, 'Invalid Event');
    return success(res, 'success', mapEvent(row!));
  }

  if (req.method === 'DELETE') {
    await requireAuth(req, 'event:delete');
    await softDelete('events', id);
    return success(res, 'delete success');
  }

  if (req.method === 'PUT' && path[2] === 'status') {
    await requireAuth(req, 'event:review');
    const row = await updateRow('events', id, {
      publish_status: req.body?.publish_status,
      publish_time: new Date(),
    });
    return success(res, 'success', mapEvent(row!));
  }

  if (req.method === 'PUT') {
    await requireAuth(req, 'event:write');
    const row = await updateRow('events', id, {
      title: req.body?.title,
      description: req.body?.desc,
      event_mode: req.body?.event_mode,
      event_type: req.body?.event_type,
      location: req.body?.location,
      link: req.body?.link,
      start_time: req.body?.start_time,
      end_time: req.body?.end_time,
      cover_img: req.body?.cover_img,
      tags: req.body?.tags ?? [],
      twitter: req.body?.twitter,
      registration_link: req.body?.registration_link,
      registration_deadline: req.body?.registration_deadline || null,
    });
    return success(res, 'success', mapEvent(row!));
  }

  return failure(res, 405, 'Method not allowed');
}

async function handleRecaps(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string[]
) {
  const id = intValue(path[1]);

  if (!id && req.method === 'POST') {
    const auth = await requireAuth(req, 'blog:write');
    const row = await insertRow('recaps', {
      content: req.body?.content,
      video: req.body?.video,
      recording: req.body?.recording,
      twitter: req.body?.twitter,
      event_id: req.body?.event_id,
      user_id: auth.uid,
    });
    return success(res, 'create success', mapRecap(row!));
  }

  if (!id && req.method === 'GET') {
    const eventId = intValue(req.query.event_id);
    const row = first(
      await query(
        `select r.*, case when u.id is null then null else json_build_object(
          'ID', u.id, 'username', u.username, 'avatar', u.avatar, 'github', u.github, 'email', u.email
        ) end as user
         from recaps r
         left join users u on u.id = r.user_id and ${softDeleteWhere('u')}
         where r.event_id = $1 and ${softDeleteWhere('r')}
         order by r.created_at desc
         limit 1`,
        [eventId]
      )
    );
    if (!row) return failure(res, 400, 'Invalid Recap');
    return success(res, 'success', mapRecap(row!));
  }

  if (req.method === 'PUT') {
    const auth = await requireAuth(req, 'blog:write');
    const existing = first(await query(`select user_id from recaps where id = $1`, [id]));
    if (!existing) return failure(res, 400, 'Invalid recap');
    if (existing.user_id !== auth.uid) return failure(res, 401, 'not author');
    const row = await updateRow('recaps', id, {
      content: req.body?.content,
      video: req.body?.video,
      recording: req.body?.recording,
      twitter: req.body?.twitter,
    });
    return success(res, 'success', mapRecap(row!));
  }

  if (req.method === 'DELETE') {
    await requireAuth(req, 'blog:delete');
    await softDelete('recaps', id);
    return success(res, 'delete success');
  }

  return failure(res, 405, 'Method not allowed');
}

async function handleDapps(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string[]
) {
  if (path[1] === 'categories' && req.method === 'GET') {
    const { page, pageSize, offset } = pageParams(req);
    const parentId = req.query.parent_id ? intValue(req.query.parent_id) : null;
    const params: unknown[] = [];
    const clauses = [softDeleteWhere('c')];
    if (parentId) addFilter(clauses, params, 'c.parent_id = ?', parentId);
    else clauses.push('c.parent_id is null');
    if (req.query.keyword) {
      params.push(`%${req.query.keyword}%`, `%${req.query.keyword}%`);
      clauses.push(`(c.name ilike $${params.length - 1} or c.desc ilike $${params.length})`);
    }
    const where = clauses.join(' and ');
    const rows = await query(
      `select c.*,
        coalesce((
          select json_agg(json_build_object(
            'ID', child.id,
            'CreatedAt', child.created_at,
            'UpdatedAt', child.updated_at,
            'name', child.name,
            'desc', child.desc,
            'full_name', child.full_name,
            'is_only_monad', child.is_only_monad,
            'parent_id', child.parent_id
          ) order by child.created_at asc)
          from categories child
          where child.parent_id = c.id and ${softDeleteWhere('child')}
        ), '[]'::json) as children
       from categories c
       where ${where}
       order by c.created_at ${req.query.order === 'desc' ? 'desc' : 'asc'}
       limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, pageSize, offset]
    );
    const total = first(
      await query(`select count(*)::int as count from categories c where ${where}`, params)
    )?.count;
    return success(res, 'query success', {
      categories: rows.map(mapCategory),
      page,
      page_size: pageSize,
      total,
    });
  }

  const id = intValue(path[1]);
  if (!id && req.method === 'POST') {
    const auth = await requireAuth(req, 'dapp:write');
    const row = await insertRow('dapps', {
      name: req.body?.name,
      description: req.body?.description,
      category_id: req.body?.category_id,
      x: req.body?.x,
      site: req.body?.site,
      cover_img: req.body?.cover_img,
      logo: req.body?.logo,
      tags: req.body?.tags ?? [],
      user_id: auth.uid,
    });
    return success(res, 'create success', mapDapp(row!));
  }

  if (!id && req.method === 'GET') {
    const { page, pageSize, offset } = pageParams(req);
    const params: unknown[] = [];
    const clauses = [softDeleteWhere('d')];
    if (req.query.keyword) {
      params.push(`%${req.query.keyword}%`, `%${req.query.keyword}%`);
      clauses.push(`(d.name ilike $${params.length - 1} or d.description ilike $${params.length})`);
    }
    if (req.query.tag) addFilter(clauses, params, '? = any(d.tags)', req.query.tag);
    if (req.query.is_feature && req.query.is_feature !== '0') {
      addFilter(clauses, params, 'd.is_feature = ?', intValue(req.query.is_feature));
    }
    if (req.query.is_only_monad && req.query.is_only_monad !== '0') {
      addFilter(clauses, params, 'd.is_only_monad = ?', intValue(req.query.is_only_monad));
    }
    if (req.query.sub_category) {
      const ids = String(req.query.sub_category).split(',').map(Number).filter(Boolean);
      if (ids.length) addFilter(clauses, params, 'd.category_id = any(?::int[])', ids);
    }
    if (req.query.main_category) {
      const ids = String(req.query.main_category).split(',').map(Number).filter(Boolean);
      if (ids.length) addFilter(clauses, params, 'c.parent_id = any(?::int[])', ids);
    }
    const where = clauses.join(' and ');
    const total = first(
      await query(
        `select count(*)::int as count from dapps d
         left join categories c on c.id = d.category_id
         where ${where}`,
        params
      )
    )?.count;
    const rows = await query(
      `select d.*,
        case when c.id is null then null else json_build_object(
          'ID', c.id, 'name', c.name, 'desc', c.desc, 'full_name', c.full_name, 'parent_id', c.parent_id
        ) end as category,
        coalesce((
          select json_agg(json_build_object('ID', t.id, 'title', t.title, 'description', t.description, 'cover_img', t.cover_img))
          from tutorials t where t.dapp_id = d.id and ${softDeleteWhere('t')}
        ), '[]'::json) as tutorials
       from dapps d
       left join categories c on c.id = d.category_id
       where ${where}
       order by d.created_at ${req.query.order === 'asc' ? 'asc' : 'desc'}
       limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, pageSize, offset]
    );
    return success(res, 'query success', {
      dapps: rows.map(mapDapp),
      page,
      page_size: pageSize,
      total,
    });
  }

  if (!id) return failure(res, 400, 'Invalid ID');

  if (req.method === 'GET') {
    const row = first(
      await query(
        `select d.*,
          case when c.id is null then null else json_build_object(
            'ID', c.id, 'name', c.name, 'desc', c.desc, 'full_name', c.full_name, 'parent_id', c.parent_id
          ) end as category,
          coalesce((
            select json_agg(json_build_object('ID', t.id, 'title', t.title, 'description', t.description, 'cover_img', t.cover_img))
            from tutorials t where t.dapp_id = d.id and ${softDeleteWhere('t')}
          ), '[]'::json) as tutorials
         from dapps d
         left join categories c on c.id = d.category_id
         where d.id = $1 and ${softDeleteWhere('d')}`,
        [id]
      )
    );
    if (!row) return failure(res, 400, 'Invalid Dapp');
    return success(res, 'success', mapDapp(row));
  }

  if (req.method === 'DELETE') {
    await requireAuth(req, 'dapp:delete');
    await softDelete('dapps', id);
    return success(res, 'delete success');
  }

  return failure(res, 405, 'Method not allowed');
}

async function handleTutorials(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string[]
) {
  const id = intValue(path[1]);
  if (!id && req.method === 'POST') {
    const auth = await requireAuth(req, 'tutorial:write');
    const row = await insertRow('tutorials', {
      title: req.body?.title,
      description: req.body?.desc,
      content: req.body?.content,
      author: req.body?.author,
      source_link: req.body?.source_link,
      cover_img: req.body?.cover_img,
      tags: req.body?.tags ?? [],
      dapp_id: req.body?.dapp_id || null,
      publisher_id: auth.uid,
    });
    return success(res, 'create success', mapTutorial(row!));
  }

  if (!id && req.method === 'GET') {
    const { page, pageSize, offset } = pageParams(req);
    const params: unknown[] = [];
    const clauses = [softDeleteWhere('t')];
    if (req.query.keyword) {
      params.push(`%${req.query.keyword}%`, `%${req.query.keyword}%`);
      clauses.push(`(t.title ilike $${params.length - 1} or t.description ilike $${params.length})`);
    }
    if (req.query.tag) addFilter(clauses, params, '? = any(t.tags)', req.query.tag);
    if (req.query.dapp_id && req.query.dapp_id !== '0') addFilter(clauses, params, 't.dapp_id = ?', intValue(req.query.dapp_id));
    if (req.query.publish_status && req.query.publish_status !== '0') addFilter(clauses, params, 't.publish_status = ?', intValue(req.query.publish_status));
    if (req.query.user_id) addFilter(clauses, params, 't.publisher_id = ?', intValue(req.query.user_id));
    const where = clauses.join(' and ');
    const total = first(await query(`select count(*)::int as count from tutorials t where ${where}`, params))?.count;
    const rows = await query(
      `select t.*,
        case when d.id is null then null else json_build_object('ID', d.id, 'name', d.name, 'logo', d.logo, 'site', d.site, 'x', d.x, 'description', d.description) end as dapp
       from tutorials t
       left join dapps d on d.id = t.dapp_id and ${softDeleteWhere('d')}
       where ${where}
       order by t.publish_time ${req.query.order === 'asc' ? 'asc' : 'desc'} nulls last, t.created_at desc
       limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, pageSize, offset]
    );
    return success(res, 'query success', {
      tutorials: rows.map(mapTutorial),
      page,
      page_size: pageSize,
      total,
    });
  }

  if (!id) return failure(res, 400, 'Invalid ID');

  if (req.method === 'GET') {
    const row = first(
      await query(
        `select t.*,
          case when d.id is null then null else json_build_object('ID', d.id, 'name', d.name, 'logo', d.logo, 'site', d.site, 'x', d.x, 'description', d.description) end as dapp,
          case when u.id is null then null else json_build_object('ID', u.id, 'username', u.username, 'avatar', u.avatar, 'github', u.github, 'email', u.email) end as publisher
         from tutorials t
         left join dapps d on d.id = t.dapp_id and ${softDeleteWhere('d')}
         left join users u on u.id = t.publisher_id and ${softDeleteWhere('u')}
         where t.id = $1 and ${softDeleteWhere('t')}`,
        [id]
      )
    );
    if (!row) return failure(res, 400, 'Invalid Tutorial');
    await query(`update tutorials set view_count = coalesce(view_count, 0) + 1 where id = $1`, [id]);
    return success(res, 'success', mapTutorial(row!));
  }

  if (req.method === 'DELETE') {
    await requireAuth(req, 'tutorial:delete');
    await softDelete('tutorials', id);
    return success(res, 'delete success');
  }

  if (req.method === 'PUT' && path[2] === 'status') {
    await requireAuth(req, 'tutorial:review');
    const row = await updateRow('tutorials', id, {
      publish_status: req.body?.publish_status,
      publish_time: new Date(),
    });
    return success(res, 'success', mapTutorial(row!));
  }

  if (req.method === 'PUT') {
    const auth = await requireAuth(req, 'tutorial:write');
    const existing = first(await query(`select publisher_id from tutorials where id = $1`, [id]));
    if (!existing) return failure(res, 400, 'Invalid tutorial');
    if (existing.publisher_id !== auth.uid) return failure(res, 401, 'not author');
    const row = await updateRow('tutorials', id, {
      title: req.body?.title,
      description: req.body?.desc,
      content: req.body?.content,
      author: req.body?.author,
      source_link: req.body?.source_link,
      cover_img: req.body?.cover_img,
      tags: req.body?.tags ?? [],
      dapp_id: req.body?.dapp_id || null,
      publish_status: 1,
    });
    return success(res, 'success', mapTutorial(row!));
  }

  return failure(res, 405, 'Method not allowed');
}

async function handleFeedbacks(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    let userId: number | null = null;
    try {
      userId = (await requireAuth(req)).uid;
    } catch {
      userId = null;
    }
    const row = await insertRow('feedbacks', {
      content: req.body?.content,
      url: req.body?.url,
      email: req.body?.email,
      user_id: userId,
    });
    return success(res, 'create success', row);
  }

  if (req.method === 'GET') {
    const { page, pageSize, offset } = pageParams(req);
    const total = first(await query(`select count(*)::int as count from feedbacks where ${softDeleteWhere()}`))?.count;
    const rows = await query(
      `select f.*, case when u.id is null then null else json_build_object('ID', u.id, 'username', u.username, 'avatar', u.avatar, 'github', u.github, 'email', u.email) end as user
       from feedbacks f
       left join users u on u.id = f.user_id and ${softDeleteWhere('u')}
       where ${softDeleteWhere('f')}
       order by f.created_at ${req.query.order === 'asc' ? 'asc' : 'desc'}
       limit $1 offset $2`,
      [pageSize, offset]
    );
    return success(res, 'query success', {
      feedbacks: rows.map((row) => ({ ...row, user: parseJsonObject(row.user) })),
      page,
      page_size: pageSize,
      total,
    });
  }

  return failure(res, 405, 'Method not allowed');
}

async function handlePosts(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string[]
) {
  if (path[1] === 'stats' && req.method === 'GET') {
    const row = first(
      await query(
        `select count(*)::int as total_posts,
          coalesce(sum(view_count), 0)::int as total_views,
          coalesce(sum(like_count), 0)::int as total_likes,
          coalesce(sum(favorite_count), 0)::int as total_favorites
         from posts where ${softDeleteWhere()}`
      )
    );
    return success(res, 'success', row);
  }

  if (path[1] === 'status' && req.method === 'GET') {
    const auth = await requireAuth(req);
    const ids = String(req.query.ids || '')
      .split(',')
      .map(Number)
      .filter(Boolean);
    if (!ids.length) return success(res, 'success', []);
    const likes = await query(
      `select post_id from post_likes where user_id = $1 and post_id = any($2::int[]) and ${softDeleteWhere()}`,
      [auth.uid, ids]
    );
    const favorites = await query(
      `select post_id from post_favorites where user_id = $1 and post_id = any($2::int[]) and ${softDeleteWhere()}`,
      [auth.uid, ids]
    );
    const liked = new Set(likes.map((row) => row.post_id));
    const favorited = new Set(favorites.map((row) => row.post_id));
    return success(
      res,
      'success',
      ids.map((id) => ({
        post_id: id,
        liked: liked.has(id),
        favorited: favorited.has(id),
      }))
    );
  }

  const id = intValue(path[1]);
  const action = path[2];

  if (id && ['like', 'unlike', 'favorite', 'unfavorite'].includes(action || '') && req.method === 'POST') {
    const auth = await requireAuth(req);
    if (action === 'like') {
      await query(
        `insert into post_likes (post_id, user_id, created_at, updated_at)
         values ($1, $2, ${nowSql}, ${nowSql}) on conflict do nothing`,
        [id, auth.uid]
      );
      await query(`update posts set like_count = (select count(*)::int from post_likes where post_id = $1 and ${softDeleteWhere()}) where id = $1`, [id]);
      return success(res, 'success');
    }
    if (action === 'unlike') {
      await query(`update post_likes set deleted_at = ${nowSql}, updated_at = ${nowSql} where post_id = $1 and user_id = $2 and ${softDeleteWhere()}`, [id, auth.uid]);
      await query(`update posts set like_count = (select count(*)::int from post_likes where post_id = $1 and ${softDeleteWhere()}) where id = $1`, [id]);
      return success(res, 'success');
    }
    if (action === 'favorite') {
      await query(
        `insert into post_favorites (post_id, user_id, created_at, updated_at)
         values ($1, $2, ${nowSql}, ${nowSql}) on conflict do nothing`,
        [id, auth.uid]
      );
      await query(`update posts set favorite_count = (select count(*)::int from post_favorites where post_id = $1 and ${softDeleteWhere()}) where id = $1`, [id]);
      return success(res, 'success');
    }
    await query(`update post_favorites set deleted_at = ${nowSql}, updated_at = ${nowSql} where post_id = $1 and user_id = $2 and ${softDeleteWhere()}`, [id, auth.uid]);
    await query(`update posts set favorite_count = (select count(*)::int from post_favorites where post_id = $1 and ${softDeleteWhere()}) where id = $1`, [id]);
    return success(res, 'success');
  }

  if (!id && req.method === 'POST') {
    const auth = await requireAuth(req, 'blog:write');
    const row = await insertRow('posts', {
      title: req.body?.title,
      description: req.body?.description,
      twitter: req.body?.twitter,
      tags: req.body?.tags ?? [],
      user_id: auth.uid,
    });
    return success(res, 'create success', mapPost(row!));
  }

  if (!id && req.method === 'GET') {
    const { page, pageSize, offset } = pageParams(req);
    const params: unknown[] = [];
    const clauses = [softDeleteWhere('p')];
    if (req.query.keyword) {
      params.push(`%${req.query.keyword}%`, `%${req.query.keyword}%`, `%${req.query.keyword}%`);
      clauses.push(`(p.title ilike $${params.length - 2} or p.description ilike $${params.length - 1} or u.username ilike $${params.length})`);
    }
    if (req.query.user_id) addFilter(clauses, params, 'p.user_id = ?', intValue(req.query.user_id));
    if (req.query.start_date && req.query.end_date) {
      params.push(req.query.start_date, req.query.end_date);
      clauses.push(`p.created_at between $${params.length - 1} and ($${params.length}::date + interval '1 day')`);
    }
    const where = clauses.join(' and ');
    const total = first(
      await query(
        `select count(*)::int as count from posts p left join users u on u.id = p.user_id where ${where}`,
        params
      )
    )?.count;
    const rows = await query(
      `select p.*,
        case when u.id is null then null else json_build_object(
          'ID', u.id, 'username', u.username, 'avatar', u.avatar, 'github', u.github, 'email', u.email,
          'post_count', (select count(*)::int from posts pp where pp.user_id = u.id and ${softDeleteWhere('pp')})
        ) end as user
       from posts p
       left join users u on u.id = p.user_id and ${softDeleteWhere('u')}
       where ${where}
       order by p.created_at ${req.query.order === 'asc' ? 'asc' : 'desc'}, p.view_count desc
       limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, pageSize, offset]
    );
    return success(res, 'query success', {
      posts: rows.map(mapPost),
      page,
      page_size: pageSize,
      total,
    });
  }

  if (!id) return failure(res, 400, 'Invalid ID');

  if (req.method === 'GET') {
    const row = first(
      await query(
        `select p.*,
          case when u.id is null then null else json_build_object(
            'ID', u.id, 'username', u.username, 'avatar', u.avatar, 'github', u.github, 'email', u.email,
            'post_count', (select count(*)::int from posts pp where pp.user_id = u.id and ${softDeleteWhere('pp')})
          ) end as user
         from posts p
         left join users u on u.id = p.user_id and ${softDeleteWhere('u')}
         where p.id = $1 and ${softDeleteWhere('p')}`,
        [id]
      )
    );
    if (!row) return failure(res, 400, 'Invalid Post');
    await query(`update posts set view_count = coalesce(view_count, 0) + 1 where id = $1`, [id]);
    return success(res, 'success', mapPost(row!));
  }

  if (req.method === 'DELETE') {
    const auth = await requireAuth(req, 'blog:delete');
    const existing = first(await query(`select user_id from posts where id = $1`, [id]));
    if (!existing) return failure(res, 400, 'Invalid post');
    if (existing.user_id !== auth.uid && !auth.permissions.includes('blog:review')) {
      return failure(res, 401, 'not author');
    }
    await softDelete('posts', id);
    return success(res, 'delete success');
  }

  if (req.method === 'PUT') {
    const auth = await requireAuth(req, 'blog:write');
    const existing = first(await query(`select user_id from posts where id = $1`, [id]));
    if (!existing) return failure(res, 400, 'Invalid post');
    if (existing.user_id !== auth.uid) return failure(res, 401, 'not author');
    const row = await updateRow('posts', id, {
      title: req.body?.title,
      description: req.body?.description,
      tags: req.body?.tags ?? [],
      twitter: req.body?.twitter,
    });
    return success(res, 'success', mapPost(row!));
  }

  return failure(res, 405, 'Method not allowed');
}

async function handleStats(req: NextApiRequest, res: NextApiResponse) {
  const rows = await query(
    `select * from daily_stats
     where date >= date_trunc('month', now()) and ${softDeleteWhere()}
     order by date asc`
  );

  if (!rows.length) {
    return success(res, 'query success', { overview: null, trend: [] });
  }

  const latest = rows[rows.length - 1];
  const weekAgo = rows.find((row) => new Date(row.date) >= new Date(Date.now() - 6 * 86400000)) || rows[0];
  const monthAgo = rows[0];
  const build = (key: string) => {
    const total = Number(latest[key] || 0);
    const newThisWeek = total - Number(weekAgo[key] || 0);
    const newThisMonth = total - Number(monthAgo[key] || 0);
    return {
      total,
      new_this_week: newThisWeek,
      new_this_month: newThisMonth,
      weekly_growth: Number(weekAgo[key] || 0) ? (newThisWeek / Number(weekAgo[key])) * 100 : newThisWeek > 0 ? 100 : 0,
      monthly_growth: Number(monthAgo[key] || 0) ? (newThisMonth / Number(monthAgo[key])) * 100 : newThisMonth > 0 ? 100 : 0,
    };
  };

  return success(res, 'query success', {
    overview: {
      users: build('users'),
      blogs: build('blogs'),
      tutorials: build('tutorials'),
      events: build('events'),
      posts: build('posts'),
    },
    trend: rows.slice(-7).map((row) => ({
      date: new Date(row.date).toISOString().slice(0, 10),
      users: row.users,
      blogs: row.blogs,
      tutorials: row.tutorials,
      events: row.events,
      posts: row.posts,
    })),
  });
}

async function handleStatistics(req: NextApiRequest, res: NextApiResponse) {
  const testnet = first(await query(`select * from testnets where ${softDeleteWhere()} order by block_num desc limit 1`));
  const validator = first(await query(`select * from validators where ${softDeleteWhere()} order by created_at desc limit 1`));
  const data = {
    block_num: testnet?.block_num ?? 0,
    avg_block_time: testnet?.avg_block_time ?? '0',
    validators: validator?.t1_validators ?? 0,
    timestamp: Math.floor(Date.now() / 1000),
  };

  if (req.headers.accept?.includes('text/event-stream')) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    return res.end();
  }

  return success(res, 'success', data);
}

function requireCron(req: NextApiRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret && process.env.NODE_ENV !== 'production') return;

  const auth = req.headers.authorization || '';
  const headerSecret = req.headers['x-cron-secret'];
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : headerSecret;

  if (!secret || token !== secret) {
    throw Object.assign(new Error('Unauthorized cron request'), {
      statusCode: 401,
    });
  }
}

async function handleCron(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string[]
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return failure(res, 405, 'Method not allowed');
  }

  requireCron(req);
  const task = path[2];

  if (task === 'daily-stats') {
    const [counts] = await query(
      `select
        (select count(*)::int from users where ${softDeleteWhere()}) as users,
        (select count(*)::int from articles where category = 'blog' and ${softDeleteWhere()}) as blogs,
        (select count(*)::int from tutorials where ${softDeleteWhere()}) as tutorials,
        (select count(*)::int from events where ${softDeleteWhere()}) as events,
        (select count(*)::int from posts where ${softDeleteWhere()}) as posts`
    );

    const [row] = await query(
      `insert into daily_stats (date, users, blogs, tutorials, events, posts, created_at, updated_at)
       values (date_trunc('day', now()), $1, $2, $3, $4, $5, ${nowSql}, ${nowSql})
       on conflict (date) do update set
         users = excluded.users,
         blogs = excluded.blogs,
         tutorials = excluded.tutorials,
         events = excluded.events,
         posts = excluded.posts,
         updated_at = ${nowSql}
       returning *`,
      [counts.users, counts.blogs, counts.tutorials, counts.events, counts.posts]
    );

    return success(res, 'daily stats collected', row);
  }

  if (task === 'testnet') {
    const rpcUrl = process.env.MONAD_RPC_URL;
    if (!rpcUrl) return failure(res, 500, 'MONAD_RPC_URL is not configured');

    const rpc = async (method: string, params: unknown[]) => {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || 'RPC error');
      return data.result;
    };

    const latest = await rpc('eth_getBlockByNumber', ['latest', false]);
    const latestNumber = Number.parseInt(latest.number, 16);
    const blocks: any[] = [];
    for (let i = 0; i < 10 && latestNumber - i >= 0; i += 1) {
      blocks.push(
        await rpc('eth_getBlockByNumber', [
          `0x${(latestNumber - i).toString(16)}`,
          false,
        ])
      );
    }
    blocks.sort(
      (a, b) => Number.parseInt(a.number, 16) - Number.parseInt(b.number, 16)
    );
    const diffs = blocks
      .slice(1)
      .map((block, index) =>
        Math.max(
          0,
          Number.parseInt(block.timestamp, 16) -
            Number.parseInt(blocks[index].timestamp, 16)
        )
      );
    const avg =
      diffs.length > 0
        ? diffs.reduce((sum, value) => sum + value, 0) / diffs.length
        : 0;

    const [row] = await query(
      `insert into testnets (block_num, avg_block_time, created_at, updated_at)
       values ($1, $2, ${nowSql}, ${nowSql})
       returning *`,
      [latestNumber, avg.toFixed(1)]
    );
    return success(res, 'testnet stats collected', row);
  }

  if (task === 'validator') {
    const validatorUrl = process.env.VALIDATOR_URL;
    if (!validatorUrl) return failure(res, 500, 'VALIDATOR_URL is not configured');

    const response = await fetch(`${validatorUrl}testnet`);
    const data = await response.json();
    const validators = Array.isArray(data.data) ? data.data.length : 0;
    const [row] = await query(
      `insert into validators (t1_validators, created_at, updated_at)
       values ($1, ${nowSql}, ${nowSql})
       returning *`,
      [validators]
    );
    return success(res, 'validator stats collected', row);
  }

  return failure(res, 404, 'Unknown cron task');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const path = Array.isArray(req.query.path)
    ? req.query.path
    : [String(req.query.path || '')].filter(Boolean);

  try {
    if (path[0] === 'login' && req.method === 'POST') return await handleLogin(req, res);
    if (path[0] === 'users') return await handleUsers(req, res, path);
    if (path[0] === 'events') return await handleEvents(req, res, path);
    if (path[0] === 'blogs') return await handleArticles(req, res, path, 'blog');
    if (path[0] === 'dapps') return await handleDapps(req, res, path);
    if (path[0] === 'tutorials') return await handleTutorials(req, res, path);
    if (path[0] === 'feedbacks') return await handleFeedbacks(req, res);
    if (path[0] === 'posts') return await handlePosts(req, res, path);
    if (path[0] === 'stats') return await handleStats(req, res);
    if (path[0] === 'statistics') return await handleStatistics(req, res);
    if (path[0] === 'internal' && path[1] === 'cron') {
      return await handleCron(req, res, path);
    }
    if (path[0] === 'recaps' && path[1] === 'event') {
      req.query.event_id = path[2];
      return await handleRecaps(req, res, ['recap']);
    }
    return failure(res, 404, 'Not found');
  } catch (error: any) {
    const status = error?.statusCode || 500;
    console.error('API error:', error);
    return failure(res, status, error?.message || 'Internal server error');
  }
}
