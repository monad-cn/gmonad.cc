import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Input, Select, Card, Empty, Button, Modal, Form, message, Spin } from "antd"
import { Search, Star, Plus, User, ExternalLink, Clock, X } from "lucide-react"
import styles from "./index.module.css"
import { getPosts, createPost, Post as PostType } from "../api/post"
import Image from 'next/image'

const { TextArea } = Input
const { Option } = Select

export default function PostsList() {
    const [posts, setPosts] = useState<PostType[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("desc")
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
    const [form] = Form.useForm()
    const [tags, setTags] = useState<string[]>([])
    const [inputVisible, setInputVisible] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [loading, setLoading] = useState(false)

    const fetchPosts = async () => {
        setLoading(true)
        const res = await getPosts({
            keyword: searchTerm,
            order: sortBy as 'asc' | 'desc',
            page: 1,
            page_size: 100
        })
        if (res.success && res.data) {
            setPosts(res.data.posts)
        } else {
            message.error(res.message || '获取帖子失败')
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchPosts()
    }, [searchTerm, sortBy])

    const getStarCount = (viewCount: number) => {
        if (viewCount >= 2000) return 5
        if (viewCount >= 1500) return 4
        if (viewCount >= 1000) return 3
        if (viewCount >= 500) return 2
        return 1
    }

    const handleCreatePost = async (values: any) => {
        try {
            const res = await createPost({
                title: values.title,
                description: values.description,
                tags,
                twitter: values.twitter,
            })
            if (res.success) {
                message.success("帖子发布成功！")
                setIsCreateModalVisible(false)
                form.resetFields()
                fetchPosts()
            } else {
                message.error(res.message || "发布失败")
            }
        } catch (error) {
            message.error("发布失败，请重试")
        }
    }

    const handleAddTag = () => {
        if (inputValue && !tags.includes(inputValue)) {
            const newTags = [...tags, inputValue]
            setTags(newTags)
            setInputValue("")
        }
        setInputVisible(false)
    }

    const handleRemoveTag = (tagToRemove: string) => {
        const newTags = tags.filter((tag) => tag !== tagToRemove)
        setTags(newTags)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleAddTag()
        }
    }

    return (
        <div className={`${styles.container} nav-t-top`}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.titleSection}>
                        <h1 className={styles.title}>
                            <User className={styles.titleIcon} />
                            社区帖子
                        </h1>
                        <p className={styles.subtitle}>分享见解，交流经验，共建社区</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<Plus size={16} />}
                        className={styles.createButton}
                        onClick={() => setIsCreateModalVisible(true)}
                    >
                        发布帖子
                    </Button>
                </div>

                <Card className={styles.filtersCard}>
                    <div className={styles.filters}>
                        <div className={styles.searchContainer}>
                            <Input
                                placeholder="搜索帖子、作者或标签..."
                                prefix={<Search className={styles.searchIcon} />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.searchInput}
                                size="large"
                            />
                        </div>
                        <div className={styles.sortContainer}>
                            <Select value={sortBy} onChange={setSortBy} className={styles.sortSelect} size="large">
                                <Option value="desc">
                                    最新发布
                                </Option>
                                <Option value="asc">
                                    最早发布
                                </Option>
                            </Select>
                        </div>
                    </div>
                </Card>

                <Spin spinning={loading}>
                    <div className={styles.postsContainer}>
                        {posts.length === 0 ? (
                            <Empty description="暂无帖子" className={styles.empty} />
                        ) : (
                            posts.map((post) => (
                                <Card key={post.ID} className={styles.postCard}>
                                    <div className={styles.postContent}>
                                        <div className={styles.avatarSection}>
                                            <Image
                                                src={post.user?.avatar || "/placeholder.svg"}
                                                alt={post.user?.username || "avatar"}
                                                width={40}
                                                height={40}
                                                className={styles.avatar}
                                            />
                                        </div>
                                        <div className={styles.contentSection}>
                                            <div className={styles.postHeader}>
                                                <h3 className={styles.postTitle}>{post.title}</h3>
                                                <div className={styles.postMeta}>
                                                    <span className={styles.authorName}>{post.user?.username}</span>
                                                    <span className={styles.postDate}>{post.CreatedAt.slice(0, 10)}</span>
                                                </div>
                                            </div>
                                            <p className={styles.postDescription}>{post.description}</p>
                                            <div className={styles.postFooter}>
                                                <div className={styles.popularity}>
                                                    {Array.from({ length: getStarCount(post.view_count || 0) }).map((_, index) => (
                                                        <Star key={index} className={styles.starIcon} fill="currentColor" />
                                                    ))}
                                                    {post.view_count !== 0 && <span className={styles.viewCount}>{post.view_count?.toLocaleString()} 次浏览</span>}
                                                </div>
                                                <div className={styles.tags}>
                                                    {post.tags.map((tag, index) => (
                                                        <span key={index} className={styles.tag}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </Spin>

                <Modal
                    title="发布新帖子"
                    open={isCreateModalVisible}
                    onCancel={() => {
                        setIsCreateModalVisible(false)
                        form.resetFields()
                    }}
                    footer={null}
                    width={600}
                    className={styles.createModal}
                >
                    <Form form={form} layout="vertical" onFinish={handleCreatePost} className={styles.createForm}>
                        <Form.Item
                            name="title"
                            label="标题"
                            rules={[
                                { required: true, message: "请输入帖子标题" },
                                { max: 100, message: "标题不能超过100个字符" },
                            ]}
                        >
                            <Input placeholder="输入帖子标题..." size="large" />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="内容描述"
                            rules={[
                                { required: true, message: "请输入帖子内容" },
                                { min: 100, message: "内容至少需要100个字符" },
                                { max: 2000, message: "内容不能超过2000个字符" },
                            ]}
                        >
                            <TextArea placeholder="详细描述你的帖子内容..." rows={8} size="large" maxLength={2000} showCount />
                        </Form.Item>
                        <Form.Item
                            name="twitter"
                            label="推文链接"
                            rules={[
                                { required: true, message: "请输入推文链接" },
                                {
                                    type: "url",
                                    message: "请输入有效的 URL 链接",
                                },
                            ]}
                        >
                            <Input placeholder="输入推文链接" size="large" />
                        </Form.Item>
                        <Form.Item label="标签">
                            <div className={styles.tagsContainer}>
                                {tags.map((tag, index) => (
                                    <span key={index} className={styles.selectedTag}>
                                        {tag}
                                        <button type="button" onClick={() => handleRemoveTag(tag)} className={styles.removeTagButton}>
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                                {inputVisible ? (
                                    <input
                                        type="text"
                                        className={styles.tagInput}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onBlur={handleAddTag}
                                        onKeyPress={handleKeyPress}
                                        autoFocus
                                    />
                                ) : (
                                    <button type="button" onClick={() => setInputVisible(true)} className={styles.addTagButton}>
                                        <Plus size={14} />
                                        添加标签
                                    </button>
                                )}
                            </div>
                        </Form.Item>

                        <Form.Item className={styles.formActions}>
                            <div className={styles.formActions}>
                                <Button
                                    onClick={() => {
                                        setIsCreateModalVisible(false)
                                        form.resetFields()
                                    }}
                                >
                                    取消
                                </Button>
                                <Button type="primary" htmlType="submit" className={styles.submitButton}>
                                    发布帖子
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    )
}
