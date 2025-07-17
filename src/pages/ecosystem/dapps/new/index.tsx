import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Form, Input, Select, Upload, Button, App as AntdApp, Tag } from "antd"
import styles from "./index.module.css"
import UploadCardImg from "@/components/uploadCardImg/UploadCardImg"
import { createDapp, getCategories } from "@/pages/api/dapp"

const { TextArea } = Input
const { Option } = Select


const predefinedTags = [
    "去中心化交易", "流动性挖矿", "借贷协议", "收益农场", "跨链桥", "预言机", "钱包", "基础设施",
    "Layer2", "扩容方案", "GameFi", "元宇宙", "NFT市场", "数字收藏品", "社交网络", "内容创作",
    "开发框架", "智能合约", "人工智能", "机器学习", "物联网", "去中心化存储", "真实世界资产",
    "支付网关", "稳定币",
]

export default function NewDAppPage() {
    const { message } = AntdApp.useApp();
    const router = useRouter()
    const [form] = Form.useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [inputVisible, setInputVisible] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [tags, setTags] = useState<string[]>(["去中心化交易"])
    const [loading, setLoading] = useState(true);

    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('')
    const [logoCloudinaryImg, setLogoCloudinaryImg] = useState<any>()

    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>('')
    const [coverCloudinaryImg, setCoverCloudinaryImg] = useState<any>()

    // ========== 新增二级分类逻辑 ==========
    const [allCategories, setAllCategories] = useState<any[]>([])
    const [subCategories, setSubCategories] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

    const loadCategories = async (params?: {
        order: 'asc' | 'desc';
        page: 1;
        page_size: 12;
    }) => {
        try {
            setLoading(true);
            const result = await getCategories(params);
            if (result.success && result.data) {
                // 处理后端返回的数据结构
                if (result.data.categories && Array.isArray(result.data.categories)) {
                    setAllCategories(result.data.categories)
                } else {
                    console.warn('API 返回的数据格式不符合预期:', result.data);
                    setAllCategories([])
                }
            } else {
                setAllCategories([])
            }
        } catch (error) {
            setAllCategories([])
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories()
    }, [])

    const handleCategoryChange = (value: number) => {
        setSelectedCategory(value)
        const parent = allCategories.find(item => item.name === value)
        console.log(parent)
        setSubCategories(parent?.children || [])
        form.setFieldsValue({ subCategory: undefined })
    }

    const handleAddTag = () => {
        if (inputValue && !tags.includes(inputValue)) {
            setTags([...tags, inputValue])
            form.setFieldsValue({ tags: [...tags, inputValue] })
            setInputValue("")
        }
        setInputVisible(false)
    }

    const handleRemoveTag = (tagToRemove: string) => {
        const newTags = tags.filter((tag) => tag !== tagToRemove)
        setTags(newTags)
        form.setFieldsValue({ tags: newTags })
    }

    const addPredefinedTag = (tag: string) => {
        if (!tags.includes(tag)) {
            const newTags = [...tags, tag]
            setTags(newTags)
            form.setFieldsValue({ tags: newTags })
        }
    }

    const handleSubmit = async (values: any) => {
        if (!logoCloudinaryImg?.secure_url) {
            message.error("请上传 Logo")
            return
        }
        if (!coverCloudinaryImg?.secure_url) {
            message.error("请上传封面")
            return
        }

        setIsSubmitting(true)
        try {
            const createDappRequest = {
                name: values.name || '',
                description: values.description || '',
                x: values.xLink,
                site: values.website,
                category_id: values.subCategory, // 传二级分类的id
                logo: logoCloudinaryImg?.secure_url || '',
                cover_img: coverCloudinaryImg?.secure_url || '',
                tags: tags,
            };

            const result = await createDapp(createDappRequest);

            if (result.success) {
                message.success(result.message);
                router.push('/ecosystem/dapps');
            } else {
                message.error(result.message || '添加Dapp出错');
            }
        } catch (error) {
            message.error('添加Dapp出错，请重试');
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        if (logoCloudinaryImg?.secure_url) {
            form.setFieldsValue({ logo: logoCloudinaryImg.secure_url })
        }
    }, [logoCloudinaryImg, form])

    useEffect(() => {
        if (coverCloudinaryImg?.secure_url) {
            form.setFieldsValue({ cover: coverCloudinaryImg.secure_url })
        }
    }, [coverCloudinaryImg, form])

    return (
           <div className={`${styles.container} nav-t-top`}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <Link href="/ecosystem/dapps" className={styles.backButton}>
                        <ArrowLeft className={styles.backIcon} />
                        返回生态系统
                    </Link>
                    <h1 className={styles.title}>添加新的 DApp</h1>
                    <p className={styles.subtitle}>将您的去中心化应用添加到 Monad 生态系统中</p>
                </div>
            </div>

            <div className={styles.formContainer}>
                <div className={styles.formCard}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{ tags: ["去中心化交易"] }}
                        className={styles.form}
                    >
                        {/* 基本信息 */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>基本信息</h2>

                            <Form.Item
                                label="DApp 名称"
                                name="name"
                                rules={[{ required: true, message: "请输入 DApp 名称" }]}
                                className={styles.formItem}
                            >
                                <Input placeholder="输入 DApp 名称" className={styles.input} />
                            </Form.Item>

                            <Form.Item
                                label="描述"
                                name="description"
                                rules={[{ required: true, message: "请输入 DApp 描述" }]}
                                className={styles.formItem}
                            >
                                <TextArea rows={4} placeholder="描述您的 DApp 功能和特点" className={styles.textarea} />
                            </Form.Item>

                            <Form.Item
                                label="分类"
                                name="category"
                                rules={[{ required: true, message: "请选择分类" }]}
                                className={styles.formItem}
                            >
                                <Select placeholder="选择分类" className={styles.select} onChange={handleCategoryChange}>
                                    {allCategories.map((category) => (
                                        <Option key={category.ID} value={category.name}>
                                            {category.Name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {/* 新增二级分类 */}
                            <Form.Item
                                label="子分类"
                                name="subCategory"
                                rules={[{ required: true, message: "请选择子分类" }]}
                                className={styles.formItem}
                            >
                                <Select placeholder="选择子分类" disabled={!selectedCategory} className={styles.select} >
                                    {subCategories.map((sub) => (
                                        <Option key={sub.ID} value={sub.ID}>
                                            {sub.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>

                        {/* 媒体文件 */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>媒体文件</h2>

                            <div className={styles.uploadGrid}>
                                <Form.Item
                                    label="Logo"
                                    name="logo"
                                    rules={[{ required: true, message: "请上传 Logo" }]}
                                    className={styles.formItem}
                                >
                                    <UploadCardImg
                                        previewUrl={logoPreviewUrl}
                                        setPreviewUrl={setLogoPreviewUrl}
                                        cloudinaryImg={logoCloudinaryImg}
                                        setCloudinaryImg={setLogoCloudinaryImg}
                                        form={form}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="封面图片"
                                    name="cover"
                                    rules={[{ required: true, message: "请上传封面" }]}
                                    className={styles.formItem}
                                >
                                    <UploadCardImg
                                        previewUrl={coverPreviewUrl}
                                        setPreviewUrl={setCoverPreviewUrl}
                                        cloudinaryImg={coverCloudinaryImg}
                                        setCloudinaryImg={setCoverCloudinaryImg}
                                        form={form}
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        {/* 链接信息 */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>链接信息</h2>
                            <Form.Item
                                label="网站链接"
                                name="website"
                                rules={[
                                    { required: true, message: "请输入网站链接" },
                                    { type: "url", message: "请输入有效的网址" },
                                ]}
                                className={styles.formItem}
                            >
                                <Input placeholder="https://example.com" className={styles.input} />
                            </Form.Item>

                            <Form.Item
                                label="X (Twitter) 链接"
                                name="xLink"
                                rules={[
                                    { required: true, message: "请输入 X (Twitter) 链接" },
                                    { type: "url", message: "请输入有效的链接" },
                                ]}
                                className={styles.formItem}
                            >
                                <Input placeholder="https://x.com/username" className={styles.input} />
                            </Form.Item>
                        </div>

                        {/* 标签 */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>标签</h2>

                            <Form.Item label="DApp 标签" name="tags" className={styles.formItem}>
                                <div className={styles.tagContainer}>
                                    {tags.map((tag, index) => (
                                        <Tag key={index} closable onClose={() => handleRemoveTag(tag)} className={styles.tag}>
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
                                            placeholder="输入标签"
                                        />
                                    ) : (
                                        <Tag onClick={() => setInputVisible(true)} className={styles.addTag}>
                                            <Plus className={styles.addIcon} />
                                            添加标签
                                        </Tag>
                                    )}
                                </div>

                                <div className={styles.predefinedTags}>
                                    <p className={styles.predefinedLabel}>常用标签：</p>
                                    <div className={styles.tagContainer}>
                                        {predefinedTags
                                            .filter((tag) => !tags.includes(tag))
                                            .slice(0, 10)
                                            .map((tag) => (
                                                <Tag key={tag} onClick={() => addPredefinedTag(tag)} className={styles.predefinedTag}>
                                                    <Plus className={styles.predefinedIcon} />
                                                    {tag}
                                                </Tag>
                                            ))}
                                    </div>
                                </div>
                            </Form.Item>
                        </div>

                        {/* 提交按钮 */}
                        <div className={styles.submitSection}>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmitting}
                                    className={styles.submitButton}
                                    size="large"
                                >
                                    {isSubmitting ? "提交中..." : "添加 DApp"}
                                </Button>
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    )
}
