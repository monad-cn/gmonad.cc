import React from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { Plus, X } from 'lucide-react';
import styles from '../../pages/posts/index.module.css';
import dynamic from 'next/dynamic';

const VditorEditor = dynamic(() => import('@/components/vditorEditor'), {
  ssr: false,
  loading: () => <div>加载编辑器中...</div>,
});

interface CreatePostModalProps {
  visible: boolean;
  isEditMode: boolean;
  loading: boolean;
  form: any;
  tags: string[];
  inputVisible: boolean;
  inputValue: string;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  onEditorChange: (value: string) => void;
  onTagAdd: () => void;
  onTagRemove: (tag: string) => void;
  onInputChange: (value: string) => void;
  onInputVisibleChange: (visible: boolean) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export default function CreatePostModal({
  visible,
  isEditMode,
  loading,
  form,
  tags,
  inputVisible,
  inputValue,
  onCancel,
  onSubmit,
  onEditorChange,
  onTagAdd,
  onTagRemove,
  onInputChange,
  onInputVisibleChange,
  onKeyPress,
}: CreatePostModalProps) {
  const currentDescription = form?.getFieldValue?.('description') || '';

  return (
    <Modal
      title={isEditMode ? '编辑帖子' : '发布新帖子'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      className={styles.createModal}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className={styles.createForm}
      >
        <Form.Item
          name="twitter"
          label="推文链接"
          rules={[
            {
              type: 'url',
              message: '请输入有效的 URL 链接',
            },
          ]}
        >
          <Input placeholder="输入推文链接" size="large" />
        </Form.Item>

        <Form.Item
          name="title"
          label="标题（推文标题）"
          rules={[
            { required: true, message: '请输入帖子标题' },
            { max: 100, message: '标题不能超过100个字符' },
          ]}
        >
          <Input placeholder="输入帖子标题..." size="large" />
        </Form.Item>

        <Form.Item
          name="description"
          label="内容描述（推文内容）"
          rules={[
            { required: true, message: '请输入帖子内容' },
            { min: 100, message: '内容至少需要100个字符' },
            { max: 3000, message: '内容不能超过3000个字符' },
          ]}
        >
          <VditorEditor value={currentDescription} onChange={onEditorChange} />
        </Form.Item>

        <Form.Item label="标签">
          <div className={styles.tagsContainer}>
            {(tags || []).map((tag, index) => (
              <span key={index} className={styles.selectedTag}>
                {tag}
                <button
                  type="button"
                  onClick={() => onTagRemove(tag)}
                  className={styles.removeTagButton}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {inputVisible ? (
              <input
                type="text"
                className={styles.tagInput}
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                onBlur={onTagAdd}
                onKeyPress={onKeyPress}
                autoFocus
              />
            ) : (
              <button
                type="button"
                onClick={() => onInputVisibleChange(true)}
                className={styles.addTagButton}
              >
                <Plus size={14} />
                添加标签
              </button>
            )}
          </div>
        </Form.Item>

        <Form.Item className={styles.formActions}>
          <div className={styles.formActions}>
            <Button onClick={onCancel}>取消</Button>
            <Button
              loading={loading}
              type="primary"
              htmlType="submit"
              className={styles.submitButton}
            >
              {isEditMode ? '更新帖子' : '发布帖子'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
