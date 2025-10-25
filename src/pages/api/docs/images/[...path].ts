import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path: imagePath } = req.query;
  
  if (!imagePath || !Array.isArray(imagePath)) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  // 构建图片文件路径
  const filePath = path.join(process.cwd(), 'src', 'docs', 'images', ...imagePath);
  
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // 检查文件是否在允许的目录内（安全检查）
    const docsImagesDir = path.join(process.cwd(), 'src', 'docs', 'images');
    const resolvedPath = path.resolve(filePath);
    const resolvedDocsDir = path.resolve(docsImagesDir);
    
    if (!resolvedPath.startsWith(resolvedDocsDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // 获取文件扩展名来设置正确的 Content-Type
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // 读取文件
    const fileBuffer = fs.readFileSync(filePath);
    
    // 设置缓存头
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    // 返回图片数据
    res.status(200).send(fileBuffer);
    
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}