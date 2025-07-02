import { useCallback, useState } from 'react';
import {
  Form,
  Input,
  Checkbox,
  Upload,
  Button,
  Card,
  Tag,
  App as AntdApp,
} from 'antd';
import type { UploadFile } from 'antd';
import {
  ArrowLeft,
  Users,
  FileText,
  ImageIcon,
  Save,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import router from 'next/router';
import styles from './new.module.css';

import QuillEditor from '@/components/quillEditor/QuillEditor';
import UploadCardImg from '@/components/uploadCardImg/UploadCardImg';

import {  createBlog } from '@/pages/api/blog';

const { TextArea } = Input;

export default function NewTutorialPage() {
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();

  const [tags, setTags] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudinaryImg, setCloudinaryImg] = useState<any>();

  // 富文本处理
  const handleQuillEditorChange = useCallback(
    (value: string) => {
      form.setFieldValue('content', value);
    },
    [form]
  );

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      const createTutorialRequest = {
        title: values.title || '',
        description: values.description || '',
        content: values.content || '',
        // dappName: values.dappName || '',
        category: 'tutorial',
        // difficulty: values.difficulty || '',
        // duration: values.duration || '',
        cover_img: cloudinaryImg?.secure_url || '',
        tags: tags,
        source_link: values.source || '',
        author: '',
        translator: '',
      };

      const result = await createBlog(createTutorialRequest);
      if (result.success) {
        message.success(result.message || '教程创建成功');
        router.push('/ecosystem/tutorials');
      } else {
        message.error(result.message || '创建教程失败');
      }
    } catch (error) {
      console.error('创建教程失败:', error);
      message.error('创建教程出错，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (inputValue && !tags.includes(inputValue)) {
      const newTags = [...tags, inputValue];
      setTags(newTags);
      setInputValue('');
    }
    setInputVisible(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/ecosystem/tutorials" className={styles.backButton}>
          <ArrowLeft className={styles.backIcon} />
          返回教程列表
        </Link>
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.title}>新建教程</h1>
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
                教程信息
              </h2>

              <Form.Item
                label="教程标题"
                name="title"
                rules={[{ required: true, message: '请输入教程标题' }]}
              >
                <Input
                  placeholder="请输入教程标题"
                  className={styles.input}
                  maxLength={30}
                  showCount
                />
              </Form.Item>
              <Form.Item
                label="教程描述"
                name="description"
                rules={[{ required: true, message: '请输入教程描述' }]}
              >
                <TextArea
                  rows={2}
                  maxLength={60}
                  showCount
                  placeholder="请输入教程描述"
                />
              </Form.Item>
              <Form.Item
                label="教程内容"
                name="content"
                rules={[{ required: true, message: '请输入教程内容' }]}
              >
                <QuillEditor
                  value={form.getFieldValue('content')}
                  onChange={handleQuillEditorChange}
                />
              </Form.Item>
              <Form.Item
                label="关联 DApp 名称"
                name="dappName"
                rules={[{ required: true, message: '请输入 DApp 名称' }]}
              >
                <Input placeholder="例如：Uniswap, OpenSea 等" className={styles.input} />
              </Form.Item>
              <Form.Item
                label="教程分类"
                name="category"
                rules={[{ required: true, message: '请输入教程分类' }]}
              >
                <Input placeholder="例如：DeFi, NFT, 钱包" className={styles.input} />
              </Form.Item>
              <Form.Item
                label="教程难度"
                name="difficulty"
                rules={[{ required: true, message: '请输入教程难度（beginner/intermediate/advanced）' }]}
              >
                <Input placeholder="请输入教程难度" className={styles.input} />
              </Form.Item>
              <Form.Item
                label="教程时长"
                name="duration"
                rules={[{ required: true, message: '请输入教程时长，如 20分钟' }]}
              >
                <Input placeholder="请输入教程时长" className={styles.input} />
              </Form.Item>
              <Form.Item
                label="参考链接（可选）"
                name="source"
                rules={[
                  {
                    type: 'url',
                    message: '请输入有效的链接地址',
                  },
                ]}
              >
                <Input placeholder="请输入参考链接" className={styles.input} />
              </Form.Item>
            </Card>
          </div>

          {/* 右侧表单 */}
          <div className={styles.rightColumn}>
            {/* 教程封面 */}
            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <ImageIcon className={styles.sectionIcon} />
                教程封面
              </h2>
              <Form.Item
                name="cover"
                rules={[{ required: true, message: '请上传教程封面' }]}
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
                教程标签
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

            {/* 其他设置 */}
            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>其他设置</h2>
              <Form.Item
                name="publishImmediately"
                valuePropName="checked"
                className={styles.formGroup}
              >
                <Checkbox className={styles.checkbox}>立即发布教程</Checkbox>
              </Form.Item>
            </Card>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className={styles.submitSection}>
          <Link href="/tutorials" className={styles.cancelButton}>
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
            {isSubmitting ? '创建中...' : '创建教程'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
