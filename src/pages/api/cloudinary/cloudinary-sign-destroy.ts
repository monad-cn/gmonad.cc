import type { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from './cloudinaryConfig';

interface SignRequestBody {
  publicId: string;
}

interface SignResponse {
  signature: string;
  timestamp: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignResponse | { error: string }>
) {
  const { publicId } = req.body as SignRequestBody;

  if (!publicId) {
    return res.status(400).json({ error: 'Public ID is required' });
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || '';

  const signature = cloudinary.utils.api_sign_request(
    { public_id: publicId, timestamp },
    apiSecret
  );

  return res.status(200).json({ signature, timestamp });
}
