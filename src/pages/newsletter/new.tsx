import { useCallback, useState } from 'react';
import { App as AntdApp, Button, Card, Form, Input, Select, Tag } from 'antd';
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  Plus,
  Save,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import VditorEditor from '@/components/vditorEditor/VditorEditor';
import UploadCardImg from '@/components/uploadCardImg/UploadCardImg';
import { createNewsletter } from '../api/newsletter';
import styles from '../blogs/new.module.css';

const { TextArea } = Input;

type CloudinaryImage = {
  secure_url?: string;
};

type NewsletterFormValues = {
  title?: string;
  description?: string;
  content?: string;
  source?: string;
  sourceType?: string;
  author?: string;
  translator?: string;
};

export default function NewNewsletterPage() {
  const router = useRouter();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();

  const [tags, setTags] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [cloudinaryImg, setCloudinaryImg] = useState<CloudinaryImage>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVditorEditorChange = useCallback(
    (value: string) => {
      form.setFieldValue('content', value);
    },
    [form]
  );

  const handleSubmit = async (values: NewsletterFormValues) => {
    try {
      setIsSubmitting(true);
      const result = await createNewsletter({
        title: values.title || '',
        description: values.description || '',
        content: values.content || '',
        source_link: values.source || '',
        source_type: values.sourceType || 'official',
        cover_img: cloudinaryImg?.secure_url || '',
        tags,
        author: values.author || '',
        translator: values.translator || '',
      });

      if (result.success) {
        message.success('周报创建成功');
        router.push('/newsletter');
      } else {
        message.error(result.message || '创建周报失败');
      }
    } catch (error) {
      console.error('创建周报失败:', error);
      message.error('创建周报出错，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const normalizedTag = inputValue.trim();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags([...tags, normalizedTag]);
    }
    setInputValue('');
    setInputVisible(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={`${styles.container} nav-t-top`}>
      <div className={styles.header}>
        <Link href="/newsletter" className={styles.backButton}>
          <ArrowLeft className={styles.backIcon} />
          返回周报列表
        </Link>
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.title}>新建周报</h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={styles.form}
      >
        <div className={styles.formGrid}>
          <div className={styles.leftColumn}>
            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <FileText className={styles.sectionIcon} />
                基本信息
              </h2>

              <Form.Item
                label="周报标题"
                name="title"
                rules={[{ required: true, message: '请输入周报标题' }]}
              >
                <Input
                  placeholder="例如：Monad 中文社区周报 #13"
                  className={styles.input}
                  maxLength={60}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label="周报摘要"
                name="description"
                rules={[{ required: true, message: '请输入周报摘要' }]}
              >
                <TextArea
                  rows={2}
                  maxLength={80}
                  showCount
                  placeholder="概括本期周报的核心内容"
                />
              </Form.Item>

              <Form.Item
                label="周报内容"
                name="content"
                rules={[{ required: true, message: '请输入周报内容' }]}
              >
                <VditorEditor
                  value={form.getFieldValue('content')}
                  onChange={handleVditorEditorChange}
                  height={720}
                />
              </Form.Item>
            </Card>
          </div>

          <div className={styles.rightColumn}>
            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <ImageIcon className={styles.sectionIcon} />
                周报封面
              </h2>
              <Form.Item
                name="cover"
                rules={[{ required: true, message: '请上传周报封面' }]}
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

            <Card className={styles.section}>
              <Form.Item
                label="原文链接"
                name="source"
                rules={[{ type: 'url', message: '请输入有效的链接地址' }]}
              >
                <Input placeholder="请输入原文链接（可选）" className={styles.input} />
              </Form.Item>

              <Form.Item
                label="类型"
                name="sourceType"
                rules={[{ required: true, message: '请选择类型' }]}
                initialValue="official"
              >
                <Select placeholder="请选择类型">
                  <Select.Option value="official">官方</Select.Option>
                  <Select.Option value="community">社区整理</Select.Option>
                </Select>
              </Form.Item>
            </Card>

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
                  <Input placeholder="请输入作者" maxLength={20} showCount />
                </Form.Item>
              </div>

              <div className={styles.formRow}>
                <Form.Item label="整理 / 翻译" name="translator">
                  <Input
                    placeholder="请输入整理或翻译人员（可选）"
                    maxLength={20}
                    showCount
                  />
                </Form.Item>
              </div>
            </Card>

            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Plus className={styles.sectionIcon} />
                周报标签
              </h2>

              <div className={styles.tagsContainer}>
                {tags.map((tag) => (
                  <Tag
                    key={tag}
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

        <div className={styles.submitSection}>
          <Link href="/newsletter" className={styles.cancelButton}>
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
            {isSubmitting ? '创建中...' : '创建周报'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
