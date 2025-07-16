import { useCallback, useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Tag,
  Select,
  App as AntdApp,
} from 'antd';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  Save,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import styles from './edit.module.css';

import QuillEditor from '@/components/quillEditor/QuillEditor';
import UploadCardImg from '@/components/uploadCardImg/UploadCardImg';

import { getTutorialById, updateTutorial } from '@/pages/api/tutorial';
import { getDapps } from '@/pages/api/dapp';

const { TextArea } = Input;
const { Option } = Select;

export default function EditTutorialPage() {
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();
  const router = useRouter();
  const { id } = router.query;
  const rId = Array.isArray(id) ? id[0] : id;

  const [tags, setTags] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudinaryImg, setCloudinaryImg] = useState<any>();
  const [dappList, setDappList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorial, setTutorial] = useState<any>();

  // 获取 Dapp 列表
  const fetchDapps = async () => {
    try {
      const result = await getDapps({ page: 1, page_size: 20 });
      if (result.success && result.data) {
        setDappList(result.data.dapps || []);
      } else {
        message.warning(result.message || '获取 Dapp 列表失败');
      }
    } catch (error) {
      console.error('获取 Dapp 列表失败:', error);
      message.error('获取 Dapp 列表失败');
    }
  };

  useEffect(() => {
    fetchDapps();
  }, []);

  // 富文本处理
  const handleQuillEditorChange = useCallback(
    (value: string) => {
      form.setFieldValue('content', value);
    },
    [form]
  );

  const handleSubmit = async (values: any) => {
    try {
      if (!previewUrl && !cloudinaryImg?.secure_url) {
        message.error('请上传教程封面');
        return;
      }

      setIsSubmitting(true);

      const updateTutorialRequest: any = {
        title: values.title || '',
        description: values.description || '',
        content: values.content || '',
        cover_img: cloudinaryImg?.secure_url || previewUrl,
        tags: tags,
        source_link: values.source || '',
        dapp_id: values.dappId || undefined,
        author: values.author,
      };

      const result = await updateTutorial(tutorial.ID.toString(), updateTutorialRequest);
      if (result.success) {
        message.success('教程更新成功，请到个人页面查看！');
        router.push('/ecosystem/tutorials');
      } else {
        message.error('更新教程出错！');
      }
    } catch (error) {
      console.error('更新教程失败:', error);
      message.error('更新教程出错，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
      setInputValue('');
    }
    setInputVisible(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
  };

  useEffect(() => {
    if (!router.isReady || !rId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getTutorialById(rId);
        if (response.success && response.data) {
          setTutorial(response.data);
          form.setFieldsValue({
            title: response.data.title,
            description: response.data.description,
            content: response.data.content,
            author: response.data.author,
            source: response.data.source_link,
            dappId: response.data.dapp_id,
          });
          setPreviewUrl(response.data.cover_img || '');
          setTags(response.data.tags || []);
        } else {
          message.error('加载教程失败');
        }
      } catch (error) {
        console.error('加载教程失败:', error);
        message.error('加载教程出错');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, rId, form]);

  if (!loading && !tutorial) {
    return (
      <div className={styles.error}>
        <h2>教程不存在</h2>
        <p>抱歉，找不到您要查看的教程</p>
        <Link href="/ecosystem/tutorials" className={styles.backButton}>
          返回教程列表
        </Link>
      </div>
    );
  }

  return (
    <div className={`${styles.container} nav-t-top`}>
      <div className={styles.header}>
        <Link href="/ecosystem/tutorials" className={styles.backButton}>
          <ArrowLeft className={styles.backIcon} />
          返回教程列表
        </Link>
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.title}>编辑教程</h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={styles.form}
      >
        <div className={styles.formGrid}>
          {/* 左侧表单 */}
          <div className={styles.leftColumn}>
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
              <UploadCardImg
                previewUrl={previewUrl}
                setPreviewUrl={setPreviewUrl}
                cloudinaryImg={cloudinaryImg}
                setCloudinaryImg={setCloudinaryImg}
                form={form}
              />
            </Card>

            <Card className={styles.section}>
              <Form.Item
                label="作者"
                name="author"
                rules={[{ required: true, message: '请输入作者' }]}
              >
                <Input placeholder="请输入参考链接" />
              </Form.Item>
              <Form.Item label="关联 DApp（可选）" name="dappId">
                <Select allowClear placeholder="请选择关联 DApp">
                  {dappList.map((dapp) => (
                    <Option key={dapp.ID} value={dapp.ID}>
                      {dapp.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="参考链接（可选）"
                name="source"
                rules={[{ type: 'url', message: '请输入有效的链接地址' }]}
              >
                <Input placeholder="请输入参考链接" />
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
            {isSubmitting ? '更新中...' : '更新教程'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
