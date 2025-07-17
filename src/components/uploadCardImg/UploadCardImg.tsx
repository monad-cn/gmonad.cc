import React, { useState } from 'react';
import { RotateCcw, X, ImageIcon } from 'lucide-react';
import { App as AntdApp } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { uploadImgToCloud, deleteImgFromCloud } from '@/lib/cloudinary';
import { Upload } from 'antd';

import styles from './UploadCardImg.module.css';

const { Dragger } = Upload;

export default function UploadCardImg(props: {
  previewUrl: string;
  setPreviewUrl: (url: string) => void;
  cloudinaryImg: any;
  setCloudinaryImg: (img: any) => void;
  form?: any;
}) {
  const { previewUrl, setPreviewUrl, cloudinaryImg, setCloudinaryImg, form } =
    props;
  const { message } = AntdApp.useApp();
  const [coverImage, setCoverImage] = useState<UploadFile | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const handleImageChange = async (info: any) => {
    // const { file, fileList } = info;

    // // 只处理上传完成的文件
    // if (file.status === 'done') {
    //   const latestFile = fileList[fileList.length - 1];
    //   setCoverImage(latestFile);

    //   if (latestFile.originFileObj) {
    //     try {
    //       setIsImageLoading(true);
    //       const res = await uploadImgToCloud(latestFile.originFileObj);
    //       if (res && res.secure_url) {
    //         setCloudinaryImg(res);
    //         setPreviewUrl(res.secure_url);
    //         form?.setFieldValue('cover', res.secure_url);
    //       } else {
    //         message.error('图片上传失败，请重试');
    //       }
    //     } catch (error) {
    //       message.error('图片上传失败，请检查网络连接');
    //     } finally {
    //       setIsImageLoading(false);
    //     }
    //   }
    // } else if (file.status === 'error') {
    //   message.error('图片上传失败，请检查网络连接');
    //   setIsImageLoading(false);
    // }
     const { file, fileList } = info;
     console.log(info);
     

    // 只处理上传完成的文件
    if (file.status === 'done') {
      const latestFile = fileList[fileList.length - 1];
      setCoverImage(latestFile);
    } else if (file.status === 'error') {
      message.error('图片上传失败，请检查网络连接');
      setIsImageLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setIsImageLoading(true);
      const res = await deleteImgFromCloud(cloudinaryImg?.public_id || '');
      if (!res) {
        message.error('图片删除失败，请重试');
        return;
      }

      setCoverImage(null);
      setPreviewUrl('');
      form?.setFieldValue('cover', undefined);
    } catch (error) {
      message.error('图片删除失败，请重试');
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleReplaceImage = () => {
    // 触发文件选择
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          setIsImageLoading(true);
          // 创建一个符合 UploadFile 接口的对象
          const uploadFile: UploadFile = {
            uid: Date.now().toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            lastModifiedDate: new Date(file.lastModified),
            status: 'done',
            percent: 100,
            // 使用类型断言来处理 originFileObj
            originFileObj: file as any,
          };

          setCoverImage(uploadFile);

          const res = await uploadImgToCloud(file);
          if (res && res.secure_url) {
            setCloudinaryImg(res);
            setPreviewUrl(res.secure_url);
            form?.setFieldValue('cover', res.secure_url);
          } else {
            message.error('图片上传失败，请重试');
          }
        } catch (error) {
          message.error('图片上传失败，请重试');
        } finally {
          setIsImageLoading(false);
        }
      }
    };
    input.click();
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    showUploadList: false,
    action: '', // 设置为空，阻止默认上传请求
    beforeUpload: async (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
        return false;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB!');
        return false;
      }

      return true; // 始终返回 false，阻止默认上传
    },
    customRequest: async ({ file, onSuccess, onError }:any) => {
      try {
        setIsImageLoading(true);
        const res = await uploadImgToCloud(file);
        if (res && res.secure_url) {
          setCloudinaryImg(res);
          setPreviewUrl(res.secure_url);
          form?.setFieldValue('cover', res.secure_url);
          onSuccess?.(res); // 通知 Upload 组件上传成功
        } else {
          message.error('图片上传失败，请重试');
          onError?.(new Error('Upload failed'));
        }
      } catch (error) {
        message.error('图片上传失败，请检查网络连接');
        onError?.(error as Error);
      } finally {
        setIsImageLoading(false);
      }
    },
    onChange: handleImageChange,
  };

  return (
    <div className={styles.imageUpload}>
      {previewUrl ? (
        <div className={styles.imagePreviewContainer}>
          <img
            src={previewUrl || '/placeholder.svg'}
            alt="图片预览"
            className={styles.previewImage}
          />
          {isImageLoading && (
            <div className={styles.imageLoadingOverlay}>
              <div className={styles.loadingSpinner}></div>
              <span className={styles.loadingText}>处理中...</span>
            </div>
          )}
          <div className={styles.imageOverlay}>
            <div className={styles.imageActions}>
              <button
                type="button"
                onClick={handleReplaceImage}
                className={styles.imageActionButton}
                title="更换图片"
                disabled={isImageLoading}
              >
                <RotateCcw className={styles.imageActionIcon} />
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className={`${styles.imageActionButton} ${styles.removeButton}`}
                title="删除图片"
                disabled={isImageLoading}
              >
                <X className={styles.imageActionIcon} />
              </button>
            </div>
          </div>
          <div className={styles.imageInfo}>
            <span className={styles.imageName}>{coverImage?.name}</span>
            <span className={styles.imageSize}>
              {coverImage?.originFileObj
                ? `${(coverImage.originFileObj.size / 1024 / 1024).toFixed(
                    2
                  )} MB`
                : ''}
            </span>
          </div>
        </div>
      ) : (
        <Dragger {...uploadProps} className={styles.imagePreview}>
          {isImageLoading ? (
            <div className={styles.uploadLoading}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>上传中...</p>
            </div>
          ) : (
            <>
              <ImageIcon className={styles.imageIcon} />
              <p className={styles.imageText}>点击或拖拽上传图片</p>
              <p className={styles.imageHint}>
                建议尺寸: 1200x630px，支持 JPG、PNG 格式，最大 5MB
              </p>
            </>
          )}
        </Dragger>
      )}
    </div>
  );
}
