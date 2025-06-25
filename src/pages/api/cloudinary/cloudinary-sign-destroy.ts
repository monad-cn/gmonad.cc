import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { publicId } = req.body;
  const timestamp = Math.floor(Date.now() / 1000);
  const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

  if (!publicId || !apiSecret) {
    return res.status(400).json({ error: 'Missing publicId or API secret' });
  }

  // ⚠️ 字段顺序必须严格遵守 Cloudinary 的签名规则
  const stringToSign = `invalidate=true&public_id=${publicId}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(stringToSign + apiSecret)
    .digest('hex');

  return res.status(200).json({
    signature,
    timestamp,
  });
}
