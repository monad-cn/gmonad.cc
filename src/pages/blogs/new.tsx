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
import type { UploadProps, UploadFile } from 'antd';
import {
  ArrowLeft,
  Users,
  FileText,
  ImageIcon,
  Save,
  Plus,
  X,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './new.module.css';

import QuillEditor from '@/components/quillEditor/QuillEditor';

import { uploadImgToCloud, deleteImgFromCloud } from '@/lib/cloudinary';

const { Dragger } = Upload;

export default function NewEventPage() {
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();

  const [tags, setTags] = useState<string[]>(['技术分享']);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [coverImage, setCoverImage] = useState<UploadFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudinaryImg, setCloudinaryImg] = useState<any>();

  // 格式化时间为字符串
  const formatDateTime = (date: any, time: any) => {
    if (!date || !time) return '';

    const dateStr = date.format('YYYY-MM-DD');
    const timeStr = time.format('HH:mm:ss');
    return `${dateStr} ${timeStr}`;
  };

  // 富文本处理
  const handleQuillEditorChange = useCallback(
    (value: string) => {
      form.setFieldValue('description', value);
    },
    [form]
  );

  const handleSubmit = async (values: any) => {
    try {
      console.log(values);
      setIsSubmitting(true);

      console.log('submit');
    } catch (error) {
      console.error('创建博客失败:', error);
      message.error('创建博客失败，请重试');
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

  const handleImageChange = async (info: any) => {
    const { file, fileList } = info;

    // 只处理上传完成的文件
    if (file.status === 'done') {
      const latestFile = fileList[fileList.length - 1];
      setCoverImage(latestFile);

      if (latestFile.originFileObj) {
        try {
          const res = await uploadImgToCloud(latestFile.originFileObj);
          if (res && res.secure_url) {
            setCloudinaryImg(res);
            setPreviewUrl(res.secure_url);
          } else {
            message.error('图片上传失败，请重试');
          }
        } catch (error) {
          message.error('图片上传失败，请检查网络连接');
        }
      }
    } else if (file.status === 'error') {
      message.error('图片上传失败，请检查网络连接');
    }
  };

  const handleRemoveImage = async () => {
    const res = await deleteImgFromCloud(cloudinaryImg?.public_id || '');
    if (!res) {
      message.error('图片删除失败，请重试');
      return;
    }

    setCoverImage(null);
    setPreviewUrl('');
    form.setFieldValue('cover', undefined);
  };

  const handleReplaceImage = () => {
    // 触发文件选择
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
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
        } else {
          message.error('图片上传失败，请重试');
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
    beforeUpload: async (file) => {
      console.log('beforeUpload');
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
    },
    onChange: handleImageChange,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/new" className={styles.backButton}>
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
                <Input placeholder="请输入博客标题" className={styles.input} />
              </Form.Item>

              <Form.Item
                label="博客描述"
                name="description"
                rules={[{ required: true, message: '请输入博客描述' }]}
              >
                <QuillEditor
                  value={form.getFieldValue('description')}
                  onChange={handleQuillEditorChange}
                />
              </Form.Item>
            </Card>

            {/* 参与人员 */}
            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Users className={styles.sectionIcon} />
                参与人员
              </h2>

              <div className={styles.formRow}>
                <Form.Item label="作者">
                  <Input placeholder="请输入作者" />
                </Form.Item>
                <Form.Item label="翻译" name="">
                  <Input placeholder="请输入翻译人员" />
                </Form.Item>
              </div>
              <div className={styles.formRow}>
                <Form.Item label="排版" name="">
                  <Input placeholder="请输入排版人员" />
                </Form.Item>

                <Form.Item
                  label="推文链接"
                  name="twitter"
                  rules={[
                    {
                      required: true,
                      message: `请输入推文链接`,
                    },
                  ]}
                >
                  <div className={styles.inputWithIcon}>
                    <X className={styles.inputIcon} />
                    <Input
                      placeholder="请输入推文链接"
                      className={styles.inputWithIconField}
                    />
                  </div>
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
                <div className={styles.imageUpload}>
                  {previewUrl ? (
                    <div className={styles.imagePreviewContainer}>
                      <img
                        src={previewUrl || '/placeholder.svg'}
                        alt="博客封面预览"
                        className={styles.previewImage}
                      />
                      <div className={styles.imageOverlay}>
                        <div className={styles.imageActions}>
                          <button
                            type="button"
                            onClick={handleReplaceImage}
                            className={styles.imageActionButton}
                            title="更换图片"
                          >
                            <RotateCcw className={styles.imageActionIcon} />
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className={`${styles.imageActionButton} ${styles.removeButton}`}
                            title="删除图片"
                          >
                            <X className={styles.imageActionIcon} />
                          </button>
                        </div>
                      </div>
                      <div className={styles.imageInfo}>
                        <span className={styles.imageName}>
                          {coverImage?.name}
                        </span>
                        <span className={styles.imageSize}>
                          {coverImage?.originFileObj
                            ? `${(
                                coverImage.originFileObj.size /
                                1024 /
                                1024
                              ).toFixed(2)} MB`
                            : ''}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Dragger {...uploadProps} className={styles.imagePreview}>
                      <ImageIcon className={styles.imageIcon} />
                      <p className={styles.imageText}>点击或拖拽上传博客封面</p>
                      <p className={styles.imageHint}>
                        建议尺寸: 1200x630px，支持 JPG、PNG 格式，最大 5MB
                      </p>
                    </Dragger>
                  )}
                </div>
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

            {/* 其他设置 */}
            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>其他设置</h2>
              <Form.Item
                name="publishImmediately"
                valuePropName="checked"
                className={styles.formGroup}
              >
                <Checkbox className={styles.checkbox}>立即发布博客</Checkbox>
              </Form.Item>
            </Card>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className={styles.submitSection}>
          <Link href="/" className={styles.cancelButton}>
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
