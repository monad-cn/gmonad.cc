import { useCallback, useState } from 'react';
import { Form, Input, Upload, Button, Card, Tag, App as AntdApp } from 'antd';
import {
  ArrowLeft,
  Users,
  FileText,
  ImageIcon,
  Save,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import styles from './new.module.css';

import VditorEditor from '@/components/vditorEditor/VditorEditor';
// import QuillEditor from '@/components/quillEditor/QuillEditor';
import UploadCardImg from '@/components/uploadCardImg/UploadCardImg';

import { createBlog } from '../api/blog';
import router from 'next/router';

const { TextArea } = Input;

export default function NewBlogPage() {
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();

  const [tags, setTags] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudinaryImg, setCloudinaryImg] = useState<any>();

  // 编辑器处理
  const handleVditorEditorChange = useCallback(
    (value: string) => {
      form.setFieldValue('content', value);
    },
    [form]
  );
  
  const handleSubmit = async (values: any) => {
    try {
      console.log(values);
      setIsSubmitting(true);

      const createBlogRequest = {
        title: values.title || '',
        description: values.description || '',
        content: values.content || '',
        source_link: values.source || '',
        category: 'blog',
        cover_img: cloudinaryImg?.secure_url || '',
        tags: tags,
        author: values.author || '',
        translator: values.translator || '',
      };

      const result = await createBlog(createBlogRequest);
      if (result.success) {
        message.success(result.message);
        router.push('/blogs');
      } else {
        message.error(result.message || '创建博客失败');
      }
    } catch (error) {
      console.error('创建博客失败:', error);
      message.error('创建博客出错，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (inputValue && !tags.includes(inputValue)) {
      const newTags = [...tags, inputValue];
      setTags(newTags);
      setInputValue('');
      console.log('添加标签后:', newTags);
    }
    setInputVisible(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    console.log('删除标签后:', newTags);
  };

  return (
    <div className={`${styles.container} nav-t-top`}>
      <div className={styles.header}>
        <Link href="/blogs" className={styles.backButton}>
          <ArrowLeft className={styles.backIcon} />
          返回博客列表
        </Link>
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.title}>新建博客</h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={styles.form}
        initialValues={{
          publishImmediately: true,
        }}
      >
        <div className={styles.formGrid}>
          {/* 左侧表单 */}
          <div className={styles.leftColumn}>
            {/* 基本信息 */}
            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <FileText className={styles.sectionIcon} />
                基本信息
              </h2>

              <Form.Item
                label="博客标题"
                name="title"
                rules={[{ required: true, message: '请输入博客标题' }]}
              >
                <Input
                  placeholder="请输入博客标题"
                  className={styles.input}
                  maxLength={30}
                  showCount
                />
              </Form.Item>
              <Form.Item
                label="博客描述"
                name="description"
                rules={[{ required: true, message: '请输入博客描述' }]}
              >
                <TextArea
                  rows={2}
                  maxLength={60}
                  showCount
                  placeholder="请输入博客描述"
                />
              </Form.Item>
              <Form.Item
                label="博客内容"
                name="content"
                rules={[{ required: true, message: '请输入博客内容' }]}
              >
                {/* <QuillEditor
                  value={form.getFieldValue('content')}
                  onChange={handleQuillEditorChange}
                /> */}
                <VditorEditor
                  value={form.getFieldValue('content')}
                  onChange={handleVditorEditorChange}
                />
              </Form.Item>
              <Form.Item
                label="原文链接"
                name="source"
                rules={[
                  {
                    type: 'url',
                    message: '请输入有效的链接地址',
                  },
                ]}
              >
                <Input placeholder="请输入原文链接" className={styles.input} />
              </Form.Item>
            </Card>

            {/* 参与人员 */}
            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Users className={styles.sectionIcon} />
                作者与协作者
              </h2>

              <div className={styles.formRow}>
                <Form.Item
                  label="作者"
                  name="author"
                  rules={[{ required: true, message: '请输入作者姓名' }]}
                >
                  <Input placeholder="请输入作者" maxLength={10} showCount />
                </Form.Item>
              </div>

              <div className={styles.formRow}>
                <Form.Item label="翻译" name="translator">
                  <Input
                    placeholder="请输入翻译人员（可选）"
                    maxLength={10}
                    showCount
                  />
                </Form.Item>
              </div>
            </Card>
          </div>

          {/* 右侧表单 */}
          <div className={styles.rightColumn}>
            {/* 博客封面 */}
            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <ImageIcon className={styles.sectionIcon} />
                博客封面
              </h2>
              <Form.Item
                name="cover"
                rules={[{ required: true, message: '请上传博客封面' }]}
              >
                <UploadCardImg
                  previewUrl={previewUrl}
                  setPreviewUrl={setPreviewUrl}
                  cloudinaryImg={cloudinaryImg}
                  setCloudinaryImg={setCloudinaryImg}
                  form={form}
                />
              </Form.Item>
            </Card>

            {/* 标签 */}
            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Plus className={styles.sectionIcon} />
                博客标签
              </h2>

              <div className={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <Tag
                    key={index}
                    closable
                    onClose={() => handleRemoveTag(tag)}
                    className={styles.tag}
                  >
                    {tag}
                  </Tag>
                ))}
                {inputVisible ? (
                  <Input
                    type="text"
                    size="small"
                    className={styles.tagInput}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleAddTag}
                    onPressEnter={handleAddTag}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setInputVisible(true)}
                    className={styles.addTagButton}
                  >
                    <Plus className={styles.addTagIcon} />
                    添加标签
                  </button>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className={styles.submitSection}>
          <Link href="/blogs" className={styles.cancelButton}>
            取消
          </Link>
          <Button
            type="primary"
            htmlType="submit"
            className={styles.submitButton}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <Save className={styles.submitIcon} />
            {isSubmitting ? '创建中...' : '创建博客'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
