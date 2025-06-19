import { useCallback, useEffect, useState } from 'react';
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
import { useRouter } from 'next/router';
import styles from './edit.module.css';
import QuillEditor from '@/components/quillEditor/QuillEditor';

import { uploadImgToCloud, deleteImgFromCloud } from '@/lib/cloudinary';
import { getEventById, updateEvent } from '@/pages/api/event';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Dragger } = Upload;

export function formatTime(isoTime: string): string {
    return dayjs(isoTime).format("YYYY-MM-DD HH:mm")
}

export default function EditEventPage() {
    const [form] = Form.useForm();
    const router = useRouter();
    const { id } = router.query // 路由参数应该叫 id，不是 ids
    const rId = Array.isArray(id) ? id[0] : id
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
    const [event, setEvent] = useState<any>(null)
    const [loading, setLoading] = useState(true)


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

            // 构建完整的表单数据
            const formData = {
                ...values,
                tags: tags, // 添加标签数据
                coverImage: coverImage, // 添加封面图片
                eventMode: eventMode, // 确保活动类型被包含
            };

            const updateEventRequest = {
                title: values.title || '',
                description: values.description || '',
                event_mode: eventMode, // online 或 offline
                location: eventMode === '线下活动' ? values.location || '' : '',
                link: eventMode === '线上活动' ? values.location || '' : '',
                start_time: formatDateTime(values.startDate, values.startTime),
                end_time: formatDateTime(values.endDate, values.endTime),
                // cover_img: coverImage,
                cover_img: cloudinaryImg?.secure_url || '',
                tags: tags,
                twitter: values.twitter,
            };

            const result = await updateEvent(event.ID, updateEventRequest);

            if (result.success) {
                message.success(result.message);
                router.push(`/events/${event.ID}`);
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


    useEffect(() => {
        if (!router.isReady || !rId) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getEventById(rId);
                console.log('获取活动详情:', response);
                if (response.success) {
                    setEvent(response?.data);
                    form.setFieldsValue({
                        title: response.data?.title,
                        description: response.data?.description,
                        eventMode: response.data?.event_mode,
                        location: response.data?.location,
                        cover: response.data?.cover_img,
                        startDate: dayjs(response.data?.start_time),
                        startTime: dayjs(response.data?.start_time),
                        endDate: dayjs(response.data?.end_time),
                        endTime: dayjs(response.data?.end_time),
                        twitter: response.data?.twitter,
                    });
                    console.log(response.data?.twitter)
                    setPreviewUrl(response.data?.cover_img || '');
                    setTags(response.data?.tags || [])
                }

            } catch (error) {
                message.error('加载失败');
                setEvent(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router.isReady, rId, form]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
                <p>加载中...</p>
            </div>
        )
    }

    if (!loading && !event) {
        return (
            <div className={styles.error}>
                <h2>活动不存在</h2>
                <p>抱歉，找不到您要查看的活动</p>
                <Link href="/events" className={styles.backButton}>
                    返回活动列表
                </Link>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/events" className={styles.backButton}>
                    <ArrowLeft className={styles.backIcon} />
                    返回活动列表
                </Link>
            </div>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className={styles.form}
            // initialValues={{
            //     eventMode: '线上活动',
            //     publishImmediately: true,
            // }}
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
                            <Form.Item name="cover" rules={[{ required: true, message: '请上传活动封面' }]}>
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
                        {isSubmitting ? '更新中...' : '更新活动'}
                    </Button>
                </div>
            </Form>
        </div>
    );
}
