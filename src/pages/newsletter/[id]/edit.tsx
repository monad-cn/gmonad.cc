import { useCallback, useEffect, useState } from 'react';
import { App as AntdApp, Button, Card, Form, Input, Tag } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  Plus,
  Save,
  Users,
} from 'lucide-react';
import VditorEditor from '@/components/vditorEditor/VditorEditor';
import UploadCardImg from '@/components/uploadCardImg/UploadCardImg';
import {
  Newsletter,
  getNewsletterById,
  updateNewsletter,
} from '@/pages/api/newsletter';
import styles from '../../blogs/[id]/edit.module.css';

const { TextArea } = Input;

type CloudinaryImage = {
  secure_url?: string;
};

type NewsletterFormValues = {
  title?: string;
  description?: string;
  content?: string;
  source?: string;
  author?: string;
  translator?: string;
};

export default function EditNewsletterPage() {
  const router = useRouter();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();
  const { id } = router.query;
  const newsletterId = Array.isArray(id) ? id[0] : id;

  const [newsletter, setNewsletter] = useState<Newsletter | null>();
  const [loading, setLoading] = useState(true);
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
    if (!newsletter) return;

    try {
      setIsSubmitting(true);
      const result = await updateNewsletter(newsletter.ID.toString(), {
        title: values.title || '',
        description: values.description || '',
        content: values.content || '',
        source_link: values.source || '',
        cover_img: cloudinaryImg?.secure_url || previewUrl,
        tags,
        author: values.author || '',
        translator: values.translator || '',
      });

      if (result.success) {
        message.success('周报更新成功');
        router.push('/newsletter');
      } else {
        message.error(result.message || '更新周报失败');
      }
    } catch (error) {
      console.error('更新周报失败:', error);
      message.error('更新周报出错，请重试');
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

  useEffect(() => {
    if (!router.isReady || !newsletterId) return;

    const fetchNewsletter = async () => {
      setLoading(true);
      try {
        const response = await getNewsletterById(newsletterId);
        const data = response.data;

        if (response.success && data) {
          setNewsletter(data);
          form.setFieldsValue({
            title: data.title,
            description: data.description,
            content: data.content,
            source: data.source_link,
            cover: data.cover_img,
            author: data.author,
            translator: data.translator || '',
          });
          setPreviewUrl(data.cover_img || '');
          setTags(data.tags || []);
        } else {
          setNewsletter(null);
        }
      } catch {
        message.error('加载周报失败');
        setNewsletter(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletter();
  }, [router.isReady, newsletterId, form, message]);

  if (!loading && !newsletter) {
    return (
      <div className={styles.error}>
        <h2>周报不存在</h2>
        <p>抱歉，找不到您要编辑的周报</p>
        <Link href="/newsletter" className={styles.backButton}>
          返回周报列表
        </Link>
      </div>
    );
  }

  return (
    <div className={`${styles.container} nav-t-top`}>
      <div className={styles.header}>
        <Link href="/newsletter" className={styles.backButton}>
          <ArrowLeft className={styles.backIcon} />
          返回周报列表
        </Link>
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
                  placeholder="请输入周报标题"
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
                  placeholder="请输入周报摘要"
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
                  height={700}
                />
              </Form.Item>

              <Form.Item
                label="原文链接"
                name="source"
                rules={[{ type: 'url', message: '请输入有效的链接地址' }]}
              >
                <Input placeholder="请输入原文链接（可选）" className={styles.input} />
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
          <Button onClick={() => router.back()} className={styles.cancelButton}>
            取消
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className={styles.submitButton}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <Save className={styles.submitIcon} />
            {isSubmitting ? '更新中...' : '更新周报'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
