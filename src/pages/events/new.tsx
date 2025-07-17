import { useCallback, useState } from 'react';
import {
  Form,
  Input,
  Radio,
  DatePicker,
  TimePicker,
  InputNumber,
  Checkbox,
  Button,
  Card,
  Tag,
  App as AntdApp,
  Select,
} from 'antd';

import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Video,
  Globe,
  FileText,
  NotepadTextDashed,
  Save,
  Plus,
  ImageIcon,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './new.module.css';
import { createEvent } from '../api/event';
import UploadCardImg from '@/components/uploadCardImg/UploadCardImg';
import dynamic from 'next/dynamic';

const QuillEditor = dynamic(() => import('@/components/quillEditor/QuillEditor'), { ssr: false });

export default function NewEventPage() {
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();
  const router = useRouter();
  const [eventMode, setEventMode] = useState<'线上活动' | '线下活动'>(
    '线上活动'
  );
  const [tags, setTags] = useState<string[]>(['技术分享']);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // 封面图片
  const [previewUrl, setPreviewUrl] = useState<string>('');
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
      setIsSubmitting(true);

      const createEventRequest = {
        title: values.title || '',
        description: values.description || '',
        event_mode: values.eventMode, // online 或 offline
        event_type: values.eventType,
        location: eventMode === '线下活动' ? values.location || '' : '',
        link: eventMode === '线上活动' ? values.location || '' : '',
        start_time: formatDateTime(values.startDate, values.startTime),
        end_time: formatDateTime(values.endDate, values.endTime),
        cover_img: cloudinaryImg?.secure_url || '',
        tags: tags,
        twitter: values.twitter,
        registration_link: values.registrationLink,
        registration_deadline: values.registrationDeadline
          ? values.registrationDeadline.format('YYYY-MM-DD HH:mm:ss')
          : '',
      };

      // 调用创建事件接口
      const result = await createEvent(createEventRequest);

      if (result.success) {
        message.success("活动创建成功！");
        router.push('/events');
      } else {
        message.error('活动创建出错');
      }
    } catch (error) {
      console.error('创建活动失败:', error);
      message.error('创建活动失败，请重试');
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
        <Link href="/events" className={styles.backButton}>
          <ArrowLeft className={styles.backIcon} />
          返回活动列表
        </Link>
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.title}>新建活动</h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={styles.form}
        initialValues={{
          eventMode: '线上活动',
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
                label="活动标题"
                name="title"
                rules={[{ required: true, message: '请输入活动标题' }]}
              >
                <Input placeholder="请输入活动标题" className={styles.input} />
              </Form.Item>

              <Form.Item
                label="活动描述"
                name="description"
                rules={[{ required: true, message: '请输入活动描述' }]}
              >
                <QuillEditor
                  minHeight={400}
                  value={form.getFieldValue('description')}
                  onChange={handleQuillEditorChange}
                />
              </Form.Item>
            </Card>
            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Users className={styles.sectionIcon} />
                活动形式 & 类型
              </h2>

              <div style={{ display: 'flex', gap: '1rem' }}>
                {/* 活动形式 Select */}
                <Form.Item
                  label="活动形式"
                  name="eventMode"
                  rules={[{ required: true, message: '请选择活动形式' }]}
                  style={{ flex: 1 }}
                >
                  <Select
                    placeholder="请选择活动形式"
                    options={[
                      { label: '线上活动', value: '线上活动' },
                      { label: '线下活动', value: '线下活动' },
                    ]}
                    onChange={(value) => setEventMode(value)}
                  />
                </Form.Item>

                {/* 活动类型 Select */}
                <Form.Item
                  label="活动类型"
                  name="eventType"
                  rules={[{ required: true, message: '请选择活动类型' }]}
                  style={{ flex: 1 }}
                >
                  <Select
                    placeholder="请选择活动类型"
                    options={[
                      { label: 'AMA', value: 'ama' },
                      { label: '黑客松', value: 'hackathon' },
                      { label: '社区聚会', value: 'meetup' },
                      { label: 'Workshop', value: 'workshop' },
                    ]}
                  />
                </Form.Item>
              </div>
            </Card>


            {/* 时间和地点 */}
            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Calendar className={styles.sectionIcon} />
                时间和地点
              </h2>

              <div className={styles.formRow}>
                <Form.Item
                  label="开始日期"
                  name="startDate"
                  rules={[{ required: true, message: '请选择开始日期' }]}
                >
                  <DatePicker className={styles.input} />
                </Form.Item>
                <Form.Item
                  label="开始时间"
                  name="startTime"
                  rules={[{ required: true, message: '请选择开始时间' }]}
                >
                  <TimePicker className={styles.input} format="HH:mm" />
                </Form.Item>
              </div>

              <div className={styles.formRow}>
                <Form.Item label="结束日期" name="endDate" rules={[{ required: true, message: '请选择结束日期' }]}>
                  <DatePicker className={styles.input} />
                </Form.Item>
                <Form.Item label="结束时间" name="endTime" rules={[{ required: true, message: '请选择结束时间' }]}>
                  <TimePicker className={styles.input} format="HH:mm" />
                </Form.Item>
              </div>

              <Form.Item
                label={eventMode === '线上活动' ? '活动链接' : '活动地址'}
                name="location"
                rules={[
                  {
                    required: true,
                    message: `请输入${eventMode === '线上活动' ? '活动链接' : '活动地址'}`,
                  },
                ]}
              >
                <div className={styles.inputWithIcon}>
                  {eventMode === '线上活动' ? (
                    <Globe className={styles.inputIcon} />
                  ) : (
                    <MapPin className={styles.inputIcon} />
                  )}
                  <Input
                    placeholder={
                      eventMode === '线上活动'
                        ? '请输入会议链接'
                        : '请输入详细地址'
                    }
                    className={styles.inputWithIconField}
                  />
                </div>
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
            </Card>
          </div>

          {/* 右侧表单 */}
          <div className={styles.rightColumn}>
            {/* 活动封面 */}
            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <ImageIcon className={styles.sectionIcon} />
                活动封面
              </h2>
              <Form.Item
                name="cover"
                rules={[{ required: true, message: '请上传活动封面' }]}
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
                活动标签
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

            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Users className={styles.sectionIcon} />
                报名设置
              </h2>

              <Form.Item
                label="报名链接"
                name="registrationLink"
                rules={[
                  {
                    type: 'url',
                    message: '请输入有效的链接地址',
                  },
                ]}
              >
                <Input
                  placeholder="请输入报名链接（可选）"
                  className={styles.input}
                />
              </Form.Item>

              <Form.Item
                label="报名截止时间"
                name="registrationDeadline"
              >
                <DatePicker
                  showTime
                  placeholder="请选择报名截止时间（可选）"
                  className={styles.input}
                />
              </Form.Item>
            </Card>

          </div>
        </div>

        {/* 提交按钮 */}
        <div className={styles.submitSection}>
          <Button onClick={() => router.back()} className={styles.cancelButton}>
            取消
          </Button>
          {/* <Button
            className={styles.submitButton}
            loading={isSavingDraft}
            disabled={isSavingDraft}
            onClick={handleSaveDraft}
          >
            <NotepadTextDashed className={styles.submitIcon} />
            {isSavingDraft ? '保存中...' : '保存草稿'}
          </Button> */}
          <Button
            type="primary"
            htmlType="submit"
            className={styles.submitButton}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <Save className={styles.submitIcon} />
            {isSubmitting ? '创建中...' : '创建活动'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
