import { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { Edit3 } from 'lucide-react';

interface NicknameEditProps {
  currentNickname?: string;
  onSave: (nickname: string) => Promise<void>;
}

export default function NicknameEdit({ currentNickname, onSave }: NicknameEditProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nickname, setNickname] = useState(currentNickname || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim()) {
      message.error('昵称不能为空');
      return;
    }

    if (nickname.trim().length < 2) {
      message.error('昵称至少需要2个字符');
      return;
    }

    if (nickname.trim().length > 20) {
      message.error('昵称不能超过20个字符');
      return;
    }

    try {
      setSaving(true);
      // TODO: 在这里调用更新昵称的接口
      await onSave(nickname.trim());
      
      message.success('昵称修改成功');
      setIsModalVisible(false);
    } catch (error) {
      message.error('昵称修改失败');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setNickname(currentNickname || '');
  };

  const handleOpenModal = () => {
    setNickname(currentNickname || '');
    setIsModalVisible(true);
  };

  return (
    <>
      <div 
        onClick={handleOpenModal}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '6px',
          transition: 'all 0.2s ease',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        <span style={{
          color: 'white',
          fontSize: '32px',
          fontWeight: 600,
          lineHeight: 1,
        }}>
          {currentNickname || '未设置昵称'}
        </span>
        <Edit3 size={16} color="rgba(255, 255, 255, 0.8)" />
      </div>

      <Modal
        title="修改昵称"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            loading={saving}
            onClick={handleSave}
          >
            保存
          </Button>,
        ]}
        width={400}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8,
              fontWeight: 500,
              color: '#262626'
            }}>
              新昵称
            </label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入新昵称"
              maxLength={20}
              showCount
              autoFocus
              onPressEnter={handleSave}
            />
          </div>
          
          <div style={{ 
            fontSize: '12px', 
            color: '#999',
            lineHeight: 1.5 
          }}>
            <div>• 昵称长度：2-20个字符</div>
            <div>• 支持中文、英文、数字和常用符号</div>
          </div>
        </div>
      </Modal>
    </>
  );
}