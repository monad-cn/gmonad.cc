import { useState } from 'react';
import { Modal, Upload, Button, message, Image } from 'antd';
import { Camera, Upload as UploadIcon } from 'lucide-react';
import type { UploadFile, UploadProps } from 'antd';
import { uploadImgToCloud } from '@/lib/cloudinary';

interface AvatarEditProps {
  currentAvatar?: string;
  userName?: string;
  onSave: (avatarUrl: string) => Promise<void>;
}

export default function AvatarEdit({
  currentAvatar,
  userName,
  onSave,
}: AvatarEditProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(currentAvatar || '');
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const handleUploadChange: UploadProps['onChange'] = (info) => {
    setFileList(info.fileList);

    if (info.file.status === 'done') {
      // 这里应该设置上传成功后的图片URL
      // setPreviewImage(info.file.response?.url);
      message.success('图片上传成功');
    } else if (info.file.status === 'error') {
      message.error('图片上传失败');
    }
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB!');
      return false;
    }

    // 保存文件引用
    setCurrentFile(file);

    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    return false; // 阻止自动上传，由我们手动处理
  };

  const handleSave = async () => {
    if (!previewImage || !currentFile) {
      message.error('请先选择头像');
      return;
    }

    try {
      setUploading(true);

      // 上传图片到 Cloudinary
      const uploadResult = await uploadImgToCloud(currentFile);
      const uploadedUrl = uploadResult.secure_url;

      // 保存上传后的 URL
      await onSave(uploadedUrl);

      message.success('头像修改成功');
      setIsModalVisible(false);
    } catch (error) {
      console.error('头像上传失败:', error);
      message.error('头像修改失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setPreviewImage(currentAvatar || '');
    setFileList([]);
    setCurrentFile(null);
  };

  return (
    <>
      <div
        onClick={() => setIsModalVisible(true)}
        style={{
          position: 'relative',
          cursor: 'pointer',
          display: 'inline-block',
        }}
      >
        {currentAvatar ? (
          <Image
            src={currentAvatar}
            alt={userName}
            width={80}
            height={80}
            preview={false}
            style={{
              border: '4px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              borderRadius: '50%',
            }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 80,
              border: '4px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '24px',
              fontWeight: 600,
            }}
          >
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
        )}

        {/* 相机图标覆盖层 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 24,
            height: 24,
            backgroundColor: '#667eea',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Camera size={12} color="white" />
        </div>
      </div>

      <Modal
        title="修改头像"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={uploading}
            onClick={handleSave}
            disabled={!previewImage || !currentFile}
          >
            保存
          </Button>,
        ]}
        width={400}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {/* 预览区域 */}
          <div style={{ marginBottom: 24 }}>
            {previewImage ? (
              <Image
                src={previewImage}
                alt="预览"
                width={120}
                height={120}
                preview={false}
                style={{
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  border: '2px dashed #d9d9d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  color: '#999',
                }}
              >
                <UploadIcon size={32} />
              </div>
            )}
          </div>

          {/* 上传区域 */}
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={beforeUpload}
            showUploadList={false}
            accept="image/*"
          >
            <Button icon={<UploadIcon size={16} />} style={{ marginBottom: 8 }}>
              选择图片
            </Button>
          </Upload>

          <div
            style={{
              fontSize: '12px',
              color: '#999',
              marginTop: 8,
            }}
          >
            支持 JPG、PNG 格式，文件大小不超过 2MB
          </div>
        </div>
      </Modal>
    </>
  );
}
