import { useCallback, useState, useEffect } from 'react';
import {
    Form,
    Input,
    Checkbox,
    Button,
    Card,
    Tag,
    Select,
    App as AntdApp,
} from 'antd';
import type { UploadFile } from 'antd';
import {
    ArrowLeft,
    FileText,
    ImageIcon,
    Save,
    Plus,
} from 'lucide-react';
import Link from 'next/link';
import router, { useRouter } from 'next/router';
import styles from './new.module.css';

import QuillEditor from '@/components/quillEditor/QuillEditor';
import UploadCardImg from '@/components/uploadCardImg/UploadCardImg';

import { createTutorial } from '@/pages/api/tutorial';
import { getDapps } from '@/pages/api/dapp';

const { TextArea } = Input;
const { Option } = Select;

export default function NewTutorialPage() {
    const { message } = AntdApp.useApp();
    const [form] = Form.useForm();

    const router = useRouter()
    const { dappId } = router.query

    const [tags, setTags] = useState<string[]>([]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cloudinaryImg, setCloudinaryImg] = useState<any>();
    const [dappList, setDappList] = useState<any[]>([]);

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
            setIsSubmitting(true);

            const createTutorialRequest: any = {
                title: values.title || '',
                description: values.description || '',
                content: values.content || '',
                cover_img: cloudinaryImg?.secure_url || '',
                tags: tags,
                author: values.author,
                source_link: values.source || '',
            };

            if (values.dappId) {
                createTutorialRequest.dapp_id = values.dappId;
            }

            const result = await createTutorial(createTutorialRequest);
            if (result.success) {
                message.success('教程创建成功，请到个人页面查看！');
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
        if (dappId) {
            form.setFieldsValue({ dappId: Number(dappId) })
        }
    }, [dappId])

    return (
        <div className={`${styles.container} nav-t-top`}>
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
                                    minHeight={480}
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
                        <Card className={styles.section}>
                            <Form.Item
                                label="作者"
                                name="author"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入作者',
                                    },
                                ]}
                            >
                                <Input placeholder="请输入作者" />
                            </Form.Item>
                            <Form.Item
                                label="关联 DApp（可选）"
                                name="dappId"
                            >
                                <Select
                                    allowClear
                                    placeholder="请选择关联 DApp"
                                >
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
                                rules={[
                                    {
                                        type: 'url',
                                        message: '请输入有效的链接地址',
                                    },
                                ]}
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

                        {/* 其他设置 */}
                        {/* <Card className={styles.section}>
              <h2 className={styles.sectionTitle}>其他设置</h2>
              <Form.Item
                name="publishImmediately"
                valuePropName="checked"
                className={styles.formGroup}
              >
                <Checkbox className={styles.checkbox}>立即发布教程</Checkbox>
              </Form.Item>
            </Card> */}
                    </div>
                </div>

                <div className={styles.submitSection}>
                    <Link href="/ecosystem/tutorials" className={styles.cancelButton}>
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
