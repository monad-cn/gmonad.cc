import type React from "react"
import { useState, useMemo, useEffect, useCallback } from "react"
import { Input, Select, Card, Empty, Button, Modal, Form, message, Spin, Tag, DatePicker } from "antd"
import { Search, Star, Plus, User, ExternalLink, Clock, X, TrendingUp, Users, MessageCircle, Calendar } from "lucide-react"
import styles from "./index.module.css"
import { getPosts, createPost, Post as PostType } from "../api/post"
import Image from 'next/image'
import dayjs from "dayjs"
import { start } from "repl"

const { TextArea } = Input
const { Option } = Select
const { RangePicker } = DatePicker

export default function PostsList() {
    const [posts, setPosts] = useState<PostType[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("desc")
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
    const [form] = Form.useForm()
    const [tags, setTags] = useState<string[]>([])
    const [inputVisible, setInputVisible] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>(() => {
        const endOfToday = dayjs().endOf('day');
        const startOfWeekAgo = dayjs().subtract(6, 'day').startOf('day');
        return [startOfWeekAgo, endOfToday];
    });

    const [startDate, setStartDate] = useState(dateRange[0].format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(dateRange[1].format('YYYY-MM-DD'));


    const [loading, setLoading] = useState(false)

    const fetchPosts = useCallback(async (start: string, end: string) => {
        setLoading(true);
        const res = await getPosts({
            keyword: searchTerm,
            order: sortBy as 'asc' | 'desc',
            page: 1,
            page_size: 100,
            start_date: start,
            end_date: end,
        });
        if (res.success && res.data) {
            setPosts(res.data.posts);
        } else {
            message.error(res.message || '获取帖子失败');
        }
        setLoading(false);
    }, [searchTerm, sortBy]);

    useEffect(() => {
        if (!dateRange?.[0] || !dateRange?.[1]) return;
        const newStartDate = dateRange[0].format('YYYY-MM-DD');
        const newEndDate = dateRange[1].format('YYYY-MM-DD');
        setStartDate(newStartDate);
        setEndDate(newEndDate);
        fetchPosts(newStartDate, newEndDate);
    }, [dateRange, fetchPosts]);

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
                fetchPosts(startDate, endDate)
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


    const activeUsers = [
        { name: "Alice Chen", avatar: "/placeholder.svg?height=32&width=32", posts: 23, reputation: 1250 },
        { name: "Bob Wilson", avatar: "/placeholder.svg?height=32&width=32", posts: 19, reputation: 980 },
        { name: "Carol Davis", avatar: "/placeholder.svg?height=32&width=32", posts: 17, reputation: 890 },
        { name: "David Kim", avatar: "/placeholder.svg?height=32&width=32", posts: 15, reputation: 750 },
        { name: "Eva Martinez", avatar: "/placeholder.svg?height=32&width=32", posts: 12, reputation: 680 },
    ]
    const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
        if (!dates || !dates[0] || !dates[1]) return;
        setDateRange([dates[0], dates[1]]);
    };

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
                        <div className={styles.dateContainer}>
                            <RangePicker
                                placeholder={["开始日期", "结束日期"]}
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                className={styles.dateRangePicker}
                                size="large"
                                suffixIcon={<Calendar className={styles.calendarIcon} />}
                                format="YYYY-MM-DD"
                                allowClear
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
                    <div className={styles.mainLayout}>
                        <div className={styles.postsSection}>
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
                                                            {post.twitter && (
                                                                <a
                                                                    href={post.twitter}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={styles.xLink}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <ExternalLink size={14} />
                                                                </a>
                                                            )}
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
                        </div>

                        <div className={styles.sidebar}>
                            {/* 热门帖子 */}
                            <Card className={styles.sidebarCard}>
                                <div className={styles.sidebarHeader}>
                                    <TrendingUp className={styles.sidebarIcon} />
                                    <h3 className={styles.sidebarTitle}>热门帖子</h3>
                                </div>
                                <div className={styles.hotPosts}>
                                    {posts.map((post, index) => (
                                        <div key={post.ID} className={styles.hotPostItem}>
                                            <div className={styles.hotPostRank}>{index + 1}</div>
                                            <div className={styles.hotPostContent}>
                                                <h4 className={styles.hotPostTitle}>{post.title}</h4>
                                                <div className={styles.hotPostMeta}>
                                                    <span className={styles.hotPostAuthor}>{post.user?.username}</span>
                                                    <span className={styles.hotPostViews}>{post.view_count} 浏览</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>



                            {/* 活跃用户 */}
                            <Card className={styles.sidebarCard}>
                                <div className={styles.sidebarHeader}>
                                    <Users className={styles.sidebarIcon} />
                                    <h3 className={styles.sidebarTitle}>活跃用户</h3>
                                </div>
                                <div className={styles.activeUsers}>
                                    {activeUsers.map((user) => (
                                        <div key={user.name} className={styles.activeUserItem}>
                                            <img src={user.avatar || "/placeholder.svg"} alt={user.name} className={styles.activeUserAvatar} />
                                            <div className={styles.activeUserInfo}>
                                                <div className={styles.activeUserName}>{user.name}</div>
                                                <div className={styles.activeUserStats}>
                                                    {user.posts} 帖子 · {user.reputation} 声誉
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* 社区统计 */}
                            <Card className={styles.sidebarCard}>
                                <div className={styles.sidebarHeader}>
                                    <MessageCircle className={styles.sidebarIcon} />
                                    <h3 className={styles.sidebarTitle}>社区统计</h3>
                                </div>
                                <div className={styles.communityStats}>
                                    <div className={styles.statItem}>
                                        <div className={styles.statNumber}>1,234</div>
                                        <div className={styles.statLabel}>总帖子数</div>
                                    </div>
                                    <div className={styles.statItem}>
                                        <div className={styles.statNumber}>567</div>
                                        <div className={styles.statLabel}>活跃用户</div>
                                    </div>
                                    <div className={styles.statItem}>
                                        <div className={styles.statNumber}>89</div>
                                        <div className={styles.statLabel}>今日新帖</div>
                                    </div>
                                </div>
                            </Card>
                        </div>

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
