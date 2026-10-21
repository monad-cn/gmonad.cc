import { createHash, timingSafeEqual } from 'node:crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getRuntimeStatus } from '@/server/runtime-policy.mjs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');

  const secret = process.env.CRON_SECRET;
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : '';

  // Hash both values so secret comparisons always use equal-length buffers.
  const digest = (value: string) => createHash('sha256').update(value).digest();
  if (!secret || !token || !timingSafeEqual(digest(token), digest(secret))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const status = getRuntimeStatus();
  return res.status(status.patched ? 200 : 503).json(status);
}
