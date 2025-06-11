import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export default async function handler(req: any, res: any) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDERS },
    process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || ''
  );

  res.status(200).json({ signature, timestamp });
}
