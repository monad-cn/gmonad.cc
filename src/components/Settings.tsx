import React, { useState } from 'react';
import { Modal, Form, Input, Upload, Button, Avatar, message, Divider } from 'antd';
import { Camera, Edit } from 'lucide-react';
import type { RcFile } from 'antd/es/upload/interface';
import styles from '../styles/settings.module.css';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsProps {
  visible: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ visible, onClose }) => {
  const { session } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  // 预览头像处理
  const handleAvatarPreview = (file: RcFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewAvatar(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return false; // 阻止自动上传
  };

  // 头像上传处理
  const handleAvatarUpload = async (file: RcFile) => {
    setAvatarLoading(true);
    try {
      // TODO: 在这里调用头像上传接口
      // const formData = new FormData();
      // formData.append('avatar', file);
      // const response = await fetch('xxx', {
      //   method: 'POST',
      //   body: formData
      // });
      // const result = await response.json();
      
      // 临时模拟接口调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('头像上传成功');
      setPreviewAvatar(null);
      // TODO: 更新用户session中的头像信息
      // updateUserAvatar(result.avatarUrl);
      
    } catch (error) {
      console.error('头像上传失败:', error);
      message.error('头像上传失败');
    } finally {
      setAvatarLoading(false);
    }
  };

  // 昵称修改处理
  const handleNicknameSubmit = async (values: { nickname: string }) => {
    setLoading(true);
    try {
      // TODO: 调用昵称修改接口
      
      // 临时模拟接口调用
      await new Promise(resolve => setTimeout(resolve, 800));
      message.success('昵称修改成功');
      // TODO: 更新用户session中的昵称信息
      // updateUserNickname(values.nickname);
      
    } catch (error) {
      console.error('昵称修改失败:', error);
      message.error('昵称修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setPreviewAvatar(null);
    onClose();
  };

  return (
    <Modal
      title="个人设置"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      className={styles.settingsModal}
    >
      <div className={styles.settingsContent}>
        {/* 头像修改部分 */}
        <div className={styles.avatarSection}>
          <h3 className={styles.sectionTitle}>
            <Camera className={styles.sectionIcon} />
            修改头像
          </h3>
          <div className={styles.avatarContainer}>
            <Avatar
              size={100}
              src={previewAvatar || session?.user?.avatar}
              className={styles.avatarPreview}
            />
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleAvatarPreview}
              className={styles.avatarUpload}
            >
              <Button
                type="dashed"
                icon={<Camera size={16} />}
                className={styles.avatarUploadBtn}
              >
                选择图片
              </Button>
            </Upload>
            {previewAvatar && (
              <div className={styles.avatarActions}>
                <Button 
                  type="primary"
                  size="small"
                  loading={avatarLoading}
                  onClick={() => {
                    // 这里需要获取到原始文件进行上传
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        handleAvatarUpload(file as RcFile);
                      }
                    };
                    // 如果用户选择了新图片，则触发上传
                    message.info('请重新选择图片进行上传');
                  }}
                >
                  确认修改
                </Button>
                <Button
                  size="small"
                  onClick={() => setPreviewAvatar(null)}
       
                >
                  取消
                </Button>
              </div>
            )}
          </div>
        </div>

        <Divider />

        {/* 昵称修改部分 */}
        <div className={styles.nicknameSection}>
          <h3 className={styles.sectionTitle}>
            <Edit className={styles.sectionIcon} />
            修改昵称
          </h3>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleNicknameSubmit}
            initialValues={{ nickname: session?.user?.username }}
          >
            <Form.Item
              name="nickname"
              label="昵称"
              rules={[
                { required: true, message: '请输入昵称' },
                { min: 2, message: '昵称至少2个字符' },
                { max: 20, message: '昵称最多20个字符' }
              ]}
            >
              <Input
                placeholder="请输入新昵称"
                className={styles.nicknameInput}
              />
            </Form.Item>
            <Form.Item className={styles.nicknameActions}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className={styles.submitButton}
              >
                确认修改
              </Button>
              <Button
                onClick={() => form.resetFields()}
                className={styles.resetBtn}
              >
                重置
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default Settings;