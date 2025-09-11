import { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    List,
    Tag,
    Divider,
    Typography,
    Space,
    Menu,
    Pagination,
    Button,
    Popconfirm,
    App as AntdApp,
    Form,
    Avatar,
} from 'antd';
import { BookOpen, FileText, Eye, Clock, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import dayjs from 'dayjs';
import styles from './index.module.css';
import { deleteBlog, getBlogs } from '../../api/blog';
import { deleteTutorial, getTutorials } from '../../api/tutorial';
import { deletePost, getPosts, updatePost, getPostById } from '../../api/post';
import { useAuth } from '@/contexts/AuthContext';
import PostDetailModal from '@/components/posts/PostDetailModal';
import {
    PostType,
    CreatePostState,
    PostDetailState,
} from '@/types/posts';
import { usePostData } from '@/hooks/usePostData';
import { parseMarkdown } from '@/lib/markdown';
import { useRouter } from 'next/router';
import { getUser, User } from '../../api/user';
import { parseMd } from '@/utils/posts';

const { Title, Text } = Typography;

type ActiveTab = 'blogs' | 'tutorials' | 'posts';

export default function DashboardPage() {
    const { message } = AntdApp.useApp();
    const [activeTab, setActiveTab] = useState<ActiveTab>('posts');
    const [blogs, setBlogs] = useState<any[]>([]);
    const [tutorials, setTutorials] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [blogsLoading, setBlogsLoading] = useState(false);
    const [tutorialsLoading, setTutorialsLoading] = useState(false);
    const [postsLoading, setPostsLoading] = useState(false);
    const { session, status } = useAuth();


    const router = useRouter();
    const { id } = router.query;
    const userId = Number(id);
    const [user, setUser] = useState<User | null>(null);

    const [blogsPagination, setBlogsPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [tutorialsPagination, setTutorialsPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [postsPagination, setPostsPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const loadUser = async () => {
        try {
            const res = await getUser(userId);
            if (res.success && res.data) {
                setUser(res.data);
            } else {
                message.error(res.message || "获取用户信息失败");
                router.push("/");
                return;
            }
        } catch (err) {
            message.error("获取用户信息失败");
        }
    };


    // 帖子详情状态
    const [detailState, setDetailState] = useState<PostDetailState>({
        isPostDetailVisible: false,
        selectedPost: null,
        postContent: '',
        detailLoading: false,
    });


    // 使用帖子相关Hook
    const { interactionState, fetchPosts, fetchPostsStats } = usePostData();

    const loadBlogs = async (page = 1, pageSize = 10) => {
        try {
            setBlogsLoading(true);

            const result = await getBlogs({
                page,
                page_size: pageSize,
                user_id: userId as unknown as number,
                publish_status: 0,
                order: 'desc',
            });
            if (result.success && result.data) {
                setBlogs(result.data.blogs || []);
                setBlogsPagination({
                    current: result.data.page || 1,
                    pageSize: result.data.page_size || pageSize,
                    total: result.data.total || 0,
                });
            }
        } catch (error) {
            console.error('加载博客列表失败:', error);
            setBlogs([]);
        } finally {
            setBlogsLoading(false);
        }
    };

    const loadTutorials = async (page = 1, pageSize = 10) => {
        try {
            setTutorialsLoading(true);
            const result = await getTutorials({
                page,
                page_size: pageSize,
                user_id: userId,
                publish_status: 0,
            });
            if (result.success && result.data) {
                setTutorials(result.data.tutorials || []);
                setTutorialsPagination({
                    current: result.data.page || 1,
                    pageSize: result.data.page_size || pageSize,
                    total: result.data.total || 0,
                });
            }
        } catch (error) {
            console.error('加载教程列表失败:', error);
            setTutorials([]);
        } finally {
            setTutorialsLoading(false);
        }
    };

    const loadPosts = async (page = 1, pageSize = 10) => {
        try {
            setPostsLoading(true);
            const result = await getPosts({
                page: postsPagination.current || page,
                page_size: postsPagination.pageSize || pageSize,
                user_id: userId,
                order: 'desc',
            });
            if (result.success && result.data) {
                setPosts(result.data.posts || []);
                setPostsPagination({
                    current: result.data.page || 1,
                    pageSize: result.data.page_size || pageSize,
                    total: result.data.total || 0,
                });
            }
        } catch (error) {
            console.error('加载帖子列表失败:', error);
            setPosts([]);
        } finally {
            setPostsLoading(false);
        }
    };

    // 解析Markdown内容
    useEffect(() => {
        if (detailState.selectedPost?.description) {
            parseMarkdown(detailState.selectedPost.description, {
                breaks: true,
            }).then((htmlContent) => {
                setDetailState((prev) => ({ ...prev, postContent: htmlContent }));
            });
        }
    }, [detailState.selectedPost?.description]);

    useEffect(() => {
        if (!userId) return;

        if (session?.user?.uid && Number(session.user.uid) === userId) {
            router.push("/dashboard");
            return;
        }

        loadUser();
        loadBlogs();
        loadTutorials();
        loadPosts();
    }, [userId, session?.user?.uid]);


    const profileData = {
        name: user?.username || "",
        email: user?.email || "",
        avatar: user?.avatar || "",
    };

    const menuItems = [
        {
            key: 'posts',
            icon: <FileText className={styles.menuIcon} />,
            label: '帖子',
        },
        {
            key: 'blogs',
            icon: <FileText className={styles.menuIcon} />,
            label: '博客',
        },
        {
            key: 'tutorials',
            icon: <BookOpen className={styles.menuIcon} />,
            label: '教程',
        },
    ];

    const handleMenuClick = (key: string) => {
        setActiveTab(key as ActiveTab);
    };


    const handleDeleteTutorial = async (id: number) => {
        try {
            const result = await deleteTutorial(id);
            if (result.success) {
                message.success('教程删除成功！');
                loadTutorials();
            } else {
                message.error('删除出错');
            }
        } catch (error) {
            message.error('删除失败，请重试');
        }
    };


    const handlePostClick = async (post: PostType) => {
        try {
            setPostsLoading(true);
            setDetailState((prev) => ({
                ...prev,
                isPostDetailVisible: true,
                detailLoading: true,
            }));

            const res = await getPostById(post.ID.toString());
            if (res.success && res.data) {
                setDetailState((prev) => ({
                    ...prev,
                    selectedPost: res.data || null, // 确保类型兼容
                }));
            }
        } catch (error) {
            console.error('获取帖子详情异常:', error);
        } finally {
            setPostsLoading(false);
            setDetailState((prev) => ({
                ...prev,
                detailLoading: false,
            }));
        }
    };

    const renderContent = () => {
        if (activeTab === 'blogs') {
            return (
                <Card className={styles.contentCard}>
                    <div className={styles.cardHeader}>
                        <Title level={3} className={styles.cardTitle}>
                            <FileText className={styles.cardIcon} />
                            博客
                        </Title>
                    </div>
                    <Divider />
                    <List
                        loading={blogsLoading}
                        dataSource={blogs}
                        renderItem={(blog) => (
                            <List.Item
                                key={blog.ID}
                                className={styles.listItem}
                            >
                                <div className={styles.itemContent}>
                                    <div className={styles.itemMain}>
                                        <div className={styles.titleRow}>
                                            <Link
                                                href={`/blogs/${blog.ID}`}
                                                className={styles.itemTitle}
                                            >
                                                {blog.title}
                                            </Link>
                                            {blog.publish_status === 1 && (
                                                <Tag color="orange" style={{ marginLeft: 8 }}>
                                                    待审核
                                                </Tag>
                                            )}
                                            {blog.publish_status === 2 && (
                                                <Tag color="green" style={{ marginLeft: 8 }}>
                                                    已发布
                                                </Tag>
                                            )}
                                            {blog.publish_status === 3 && (
                                                <Tag color="red" style={{ marginLeft: 8 }}>
                                                    未通过
                                                </Tag>
                                            )}
                                        </div>
                                        <Text type="secondary" className={styles.itemDesc}>
                                            {blog.description}
                                        </Text>

                                        <div className={styles.itemFooter}>
                                            <Space>
                                                <Clock size={14} className={styles.itemClock} />
                                                <span>
                                                    {dayjs(blog.publish_time || blog.CreatedAt).format(
                                                        'YYYY-MM-DD HH:MM'
                                                    )}
                                                </span>
                                                <Eye size={14} className={styles.itemClock} />
                                                <span>{blog.view_count || 0}</span>
                                            </Space>
                                        </div>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                    <div className={styles.bottomPagination}>
                        <Pagination
                            current={blogsPagination.current}
                            total={blogsPagination.total}
                            pageSize={blogsPagination.pageSize}
                            onChange={(page, pageSize) => loadBlogs(page, pageSize)}
                            showSizeChanger
                            showQuickJumper
                            showTotal={(total, range) =>
                                `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`
                            }
                        />
                    </div>
                </Card>
            );
        }

        if (activeTab === 'tutorials') {
            return (
                <Card className={styles.contentCard}>
                    <div className={styles.cardHeader}>
                        <Title level={3} className={styles.cardTitle}>
                            <BookOpen className={styles.cardIcon} />
                            教程
                        </Title>
                    </div>
                    <Divider />
                    <List
                        loading={tutorialsLoading}
                        dataSource={tutorials}
                        renderItem={(tutorial) => (
                            <List.Item
                                key={tutorial.ID}
                                className={styles.listItem}
                            >
                                <div className={styles.itemContent}>
                                    <div className={styles.itemMain}>
                                        <div className={styles.titleRow}>
                                            <Link
                                                href={`/ecosystem/tutorials/${tutorial.ID}`}
                                                className={styles.itemTitle}
                                            >
                                                {tutorial.title}
                                            </Link>
                                            {tutorial.publish_status === 1 && (
                                                <Tag color="orange" style={{ marginLeft: 8 }}>
                                                    待审核
                                                </Tag>
                                            )}
                                            {tutorial.publish_status === 2 && (
                                                <Tag color="green" style={{ marginLeft: 8 }}>
                                                    已发布
                                                </Tag>
                                            )}
                                            {tutorial.publish_status === 3 && (
                                                <Tag color="red" style={{ marginLeft: 8 }}>
                                                    未通过
                                                </Tag>
                                            )}
                                        </div>
                                        <Text type="secondary" className={styles.itemDesc}>
                                            {tutorial.description}
                                        </Text>
                                        <div className={styles.itemFooter}>
                                            <Space>
                                                <Clock size={14} className={styles.itemClock} />
                                                <span>
                                                    {dayjs(
                                                        tutorial.publish_time || tutorial.CreatedAt
                                                    ).format('YYYY-MM-DD HH:MM')}
                                                </span>
                                                <Eye size={16} className={styles.itemClock} />
                                                <span>{tutorial.view_count || 0}</span>
                                            </Space>
                                        </div>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />

                    <div className={styles.bottomPagination}>
                        <Pagination
                            current={tutorialsPagination.current}
                            total={tutorialsPagination.total}
                            pageSize={tutorialsPagination.pageSize}
                            onChange={(page, pageSize) => loadTutorials(page, pageSize)}
                            showSizeChanger
                            showQuickJumper
                            showTotal={(total, range) =>
                                `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`
                            }
                        />
                    </div>
                </Card>
            );
        }

        if (activeTab === 'posts') {
            return (
                <Card className={styles.contentCard}>
                    <div className={styles.cardHeader}>
                        <Title level={3} className={styles.cardTitle}>
                            <FileText className={styles.cardIcon} />
                            帖子
                        </Title>
                    </div>
                    <Divider />
                    <List
                        loading={postsLoading}
                        dataSource={posts}
                        renderItem={(post) => (
                            <List.Item
                                key={post.ID}
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => handlePostClick(post)}
                            >
                                <div className={styles.itemContent}>
                                    <div className={styles.itemMain}>
                                        <div className={styles.titleRow}>
                                            <Link
                                                href={`/posts`}
                                                className={styles.itemTitle}
                                                title="查看帖子详情"
                                            >
                                                {post.title}
                                            </Link>
                                        </div>
                                        <div className={styles.postDescription}>
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: parseMd(post.description || ''),
                                                }}
                                            />
                                        </div>
                                        <div className={styles.itemFooter}>
                                            <Space>
                                                {post.tags?.slice(0, 3).map((tag: string) => (
                                                    <Tag key={tag} className={styles.itemTag}>
                                                        {tag}
                                                    </Tag>
                                                ))}
                                                <Clock size={14} className={styles.itemClock} />
                                                <span>
                                                    {dayjs(post.CreatedAt).format('YYYY-MM-DD HH:MM')}
                                                </span>
                                                <Eye size={16} className={styles.itemClock} />
                                                <span>{post.view_count || 0}</span>
                                            </Space>
                                        </div>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                    <div className={styles.bottomPagination}>
                        <Pagination
                            current={postsPagination.current}
                            total={postsPagination.total}
                            pageSize={postsPagination.pageSize}
                            onChange={(page, pageSize) => loadPosts(page, pageSize)}
                            showSizeChanger
                            showQuickJumper
                            showTotal={(total, range) =>
                                `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`
                            }
                        />
                    </div>
                </Card>
            );
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.profileSection}>
                    <div className={styles.profileInfo}>
                        <Avatar
                            size={80}
                            src={profileData?.avatar}
                        />
                        <div className={styles.profileDetails}>
                            <h1>{profileData.name}</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.contentWrapper}>
                <Row gutter={[24, 24]} className={styles.content}>
                    <Col span={6}>
                        <Card className={styles.sidebarCard}>
                            <div className={styles.menuSection}>
                                <Title level={4} className={styles.sectionTitle}>
                                    内容导航
                                </Title>
                                <Menu
                                    mode="vertical"
                                    selectedKeys={[activeTab]}
                                    items={menuItems}
                                    onClick={({ key }) => handleMenuClick(key)}
                                    className={styles.navigationMenu}
                                />
                            </div>
                        </Card>
                    </Col>

                    <Col span={18}>
                        <div className={styles.mainContent}>{renderContent()}</div>
                    </Col>
                </Row>
            </div>

            {/* 帖子详情模态框 */}
            <PostDetailModal
                visible={detailState.isPostDetailVisible}
                loading={detailState.detailLoading}
                post={detailState.selectedPost}
                postContent={detailState.postContent}
                isAuthenticated={status === 'authenticated'}
                currentUserId={Number(user?.ID)}
                isShowOperate={false}
                likeCount={
                    detailState.selectedPost
                        ? (interactionState.postLikeCounts.get(
                            detailState.selectedPost.ID
                        ) ?? 0)
                        : 0
                }
                favoriteCount={
                    detailState.selectedPost
                        ? (interactionState.postFavoriteCounts.get(
                            detailState.selectedPost.ID
                        ) ?? 0)
                        : 0
                }
                onClose={() =>
                    setDetailState({
                        isPostDetailVisible: false,
                        selectedPost: null,
                        postContent: '',
                        detailLoading: false,
                    })
                }
                onLike={() => { }}
                onBookmark={() => { }}
                onFollow={() => { }}
            />
        </div>
    );
}
