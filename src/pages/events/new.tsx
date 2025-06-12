import { useCallback, useState } from 'react';
import {
  Form,
  Input,
  Radio,
  DatePicker,
  TimePicker,
  InputNumber,
  Checkbox,
  Upload,
  Button,
  Card,
  Tag,
  message,
} from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Video,
  Globe,
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
import { createEvent } from '../api/event';
import QuillEditor from '@/components/quillEditor/QuillEditor';

import { uploadImgToCloud, deleteImgFromCloud } from '@/utils/cloudinary';

const { TextArea } = Input;
const { Dragger } = Upload;

export default function NewEventPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [eventMode, setEventMode] = useState<'线上活动' | '线下活动'>(
    '线上活动'
  );
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
  const handleQuillEditorChange = useCallback(() => {
    (value: string) => {
      form.setFieldValue('description', value);
    };
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      console.log(values);
      setIsSubmitting(true);

      // 构建完整的表单数据
      const formData = {
        ...values,
        tags: tags, // 添加标签数据
        coverImage: coverImage, // 添加封面图片
        eventMode: eventMode, // 确保活动类型被包含
      };

      console.log('完整表单数据:', formData);
      console.log('标签数据:', tags);
      console.log('封面图片:', coverImage);
      console.log(values);
      console.log('description:', formData.description);

      const createEventRequest = {
        title: values.title || '',
        desc: values.description || '',
        event_mode: eventMode, // online 或 offline
        location: eventMode === '线下活动' ? values.location || '' : '',
        link: eventMode === '线上活动' ? values.location || '' : '',
        start_time: formatDateTime(values.startDate, values.startTime),
        end_time: formatDateTime(values.endDate, values.endTime),
        // cover_img: coverImage,
        cover_img: cloudinaryImg?.secure_url?.split('upload/')[1] || '',
        tags: tags,
      };

      console.log(createEventRequest);

      // 调用创建事件接口
      const result = await createEvent(createEventRequest);

      console.log('创建事件结果:', result);

      if (result.success) {
        message.success(result.message);
        router.push('/events');
      } else {
        message.error(result.message || '创建活动失败');
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

  const handleImageChange = (info: any) => {
    const { file, fileList } = info;

    // 只保留最新上传的一个文件
    if (fileList.length > 0) {
      const latestFile = fileList[fileList.length - 1];
      setCoverImage(latestFile);
      console.log('上传图片:', latestFile);

      // 创建预览URL
      if (latestFile.originFileObj) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(latestFile.originFileObj);
      }
    } else {
      setCoverImage(null);
      setPreviewUrl('');
    }
  };

  const handleRemoveImage = async () => {
    // TODO : 删除uid问题导致401
    // const res = await deleteImgFromCloud(cloudinaryImg?.public_id || '');
    // if (!res) {
    //   message.error('图片删除失败，请重试');
    //   return;
    // }

    setCoverImage(null);
    setPreviewUrl('');
    form.setFieldValue('cover', undefined);
    console.log('删除图片');
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
        console.log('更换图片:', uploadFile);

        const res = await uploadImgToCloud(file);
        if (!res) {
          message.error('图片上传失败，请重试');
          return;
        } else {
          // set coverImage info
          setCloudinaryImg(res);

          const reader = new FileReader();
          reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
          };
          reader.readAsDataURL(file);
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

      const res = await uploadImgToCloud(file);

      if (!res) {
        message.error('图片上传失败，请重试');
        return false;
      } else {
        // set coverImage info
        setCloudinaryImg(res);
        return true;
      }
    },
    onChange: handleImageChange,
  };

  return (
    <div className={styles.container}>
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
                  value={form.getFieldValue('description')}
                  onChange={handleQuillEditorChange}
                />
              </Form.Item>
              <Form.Item
                label="活动形式"
                name="eventMode"
                rules={[{ required: true, message: '请选择活动形式' }]}
              >
                <Radio.Group
                  onChange={(e) => setEventMode(e.target.value)}
                  className={styles.radioGroup}
                >
                  <Radio value="线上活动" className={styles.radioOption}>
                    <div className={styles.radioContent}>
                      <Video className={styles.radioIcon} />
                      <span className={styles.radioText}>线上活动</span>
                    </div>
                  </Radio>
                  <Radio value="线下活动" className={styles.radioOption}>
                    <div className={styles.radioContent}>
                      <MapPin className={styles.radioIcon} />
                      <span className={styles.radioText}>线下活动</span>
                    </div>
                  </Radio>
                </Radio.Group>
              </Form.Item>
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
                <Form.Item label="结束日期" name="endDate">
                  <DatePicker className={styles.input} />
                </Form.Item>
                <Form.Item label="结束时间" name="endTime">
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
            </Card>

            {/* 参与设置 */}
            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Users className={styles.sectionIcon} />
                参与设置
              </h2>

              <div className={styles.formRow}>
                <Form.Item label="最大参与人数" name="maxParticipants">
                  <InputNumber
                    placeholder="不限制请留空"
                    min={1}
                    className={styles.input}
                  />
                </Form.Item>
                <Form.Item label="报名截止时间" name="registrationDeadline">
                  <DatePicker showTime className={styles.input} />
                </Form.Item>
              </div>

              <Form.Item
                name="requireApproval"
                valuePropName="checked"
                className={styles.formGroup}
              >
                <Checkbox className={styles.checkbox}>需要审核报名</Checkbox>
              </Form.Item>

              <Form.Item
                name="allowWaitlist"
                valuePropName="checked"
                className={styles.formGroup}
              >
                <Checkbox className={styles.checkbox}>允许候补报名</Checkbox>
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

              <Form.Item name="cover">
                <div className={styles.imageUpload}>
                  {previewUrl ? (
                    <div className={styles.imagePreviewContainer}>
                      <img
                        src={previewUrl || '/placeholder.svg'}
                        alt="活动封面预览"
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
                      <p className={styles.imageText}>点击或拖拽上传活动封面</p>
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

            {/* 其他设置 */}
            <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>其他设置</h2>

              <Form.Item
                name="sendThankYouEmail"
                valuePropName="checked"
                className={styles.formGroup}
              >
                <Checkbox className={styles.checkbox}>
                  活动结束后发送感谢邮件
                </Checkbox>
              </Form.Item>

              <Form.Item
                name="allowInviteFriends"
                valuePropName="checked"
                className={styles.formGroup}
              >
                <Checkbox className={styles.checkbox}>
                  允许参与者邀请朋友
                </Checkbox>
              </Form.Item>

              <Form.Item
                name="publishImmediately"
                valuePropName="checked"
                className={styles.formGroup}
              >
                <Checkbox className={styles.checkbox}>立即发布活动</Checkbox>
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
            {isSubmitting ? '创建中...' : '创建活动'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
