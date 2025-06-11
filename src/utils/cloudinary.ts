import { message } from 'antd';
const CLOUDINARY = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;

async function uploadImgToCloud(file: File): Promise<string | boolean> {
  // 获取签名
  const signResponse = await fetch('/api/cloudinary-sign');
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
    const response = await fetch(CLOUDINARY, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    console.log('图片上传结果：', result);

    if (result.secure_url) {
      return Promise.resolve(result.secure_url); // 返回图片的 URL
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

export { uploadImgToCloud };
