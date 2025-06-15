import { message } from 'antd';
const CLOUDINARY_UPLOAD = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
const CLOUDINARY_DELETE = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`;

/**
 * 上传图片到 Cloudinary
 * @param file - 要上传的图片文件
 * @returns
 */
async function uploadImgToCloud(file: File) {
  // 获取签名
  const signResponse = await fetch('/api/cloudinary/cloudinary-sign');
  const { signature, timestamp } = await signResponse.json();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '');
  formData.append(
    'folder',
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDERS || 'images'
  );

  try {
    const response = await fetch(CLOUDINARY_UPLOAD, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.secure_url) {
      return Promise.resolve(result); // 返回包含图片信息的对象
    } else {
      message.error('图片上传失败，请重试');
      return Promise.reject(false);
    }
  } catch (error) {
    console.error('图片上传错误：', error);
    message.error('图片上传失败，请检查网络连接');
    return Promise.reject(false);
  }
}

/**
 * 删除coludinary上的图片
 */
async function deleteImgFromCloud(publicId: string): Promise<boolean> {
  try {
    // 获取签名
    const signResponse = await fetch(
      '/api/cloudinary/cloudinary-sign-destroy',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      }
    );
    const {
      signature,
      timestamp,
    }: {
      signature: string;
      timestamp: number;
    } = await signResponse.json();

    // 调用 Destroy API
    const response = await fetch(CLOUDINARY_DELETE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public_id: publicId,
        api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        signature,
        timestamp,
        invalidate: true, // 添加缓存失效标志
      }),
    });

    const data: {
      message?: string;
      error?: string;
    } = await response.json();

    if (response.ok && data.message === 'ok') {
      message.success('图片删除成功！');

      return true;
    } else {
      throw new Error(data.error || '删除失败');
    }
  } catch (error) {
    message.error(`图片删除失败：${(error as Error).message}`);
    return false;
  }
}

export { uploadImgToCloud, deleteImgFromCloud };
