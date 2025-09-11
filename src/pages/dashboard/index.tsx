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
} from 'antd';
import { BookOpen, FileText, Eye, Clock, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import dayjs from 'dayjs';
import styles from './index.module.css';
import { deleteBlog, getBlogs } from '../api/blog';
import { deleteTutorial, getTutorials } from '../api/tutorial';
import { deletePost, getPosts, updatePost, getPostById } from '../api/post';
import { useAuth } from '@/contexts/AuthContext';
import AvatarEdit from '@/components/settings/AvatarEdit';
import NicknameEdit from '@/components/settings/NicknameEdit';
import PostDetailModal from '@/components/posts/PostDetailModal';
import CreatePostModal from '@/components/posts/CreatePostModal';
import {
  PostType,
  CreatePostState,
  PostDetailState,
} from '@/types/posts';
import { usePostData } from '@/hooks/usePostData';
import { parseMarkdown } from '@/lib/markdown';

import { updateUser } from '../api/user';
import { useSession } from 'next-auth/react';
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
  const [postForm] = Form.useForm();
  const { session } = useAuth();
  const { update } = useSession();

  // 帖子相关
  const [createState, setCreateState] = useState<CreatePostState>({
    isCreateModalVisible: false,
    isEditMode: false,
    editingPost: null,
    tags: [],
    inputVisible: false,
    inputValue: '',
    btnLoading: false,
  });

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
        user_id: session?.user?.uid as unknown as number,
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
        user_id: session?.user?.uid as unknown as number,
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
        user_id: session?.user?.uid as unknown as number,
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
    if (session?.user?.uid) {
      loadBlogs();
      loadTutorials();
      loadPosts();
    }
  }, [session]);

  const profileData = {
    name: session?.user?.username || '',
    email: session?.user?.email || '',
    // subtitle: '前端开发人员其他',
    avatar: session?.user?.avatar || '',
  };

  const menuItems = [
    {
      key: 'posts',
      icon: <FileText className={styles.menuIcon} />,
      label: '我的帖子',
    },
    {
      key: 'blogs',
      icon: <FileText className={styles.menuIcon} />,
      label: '我的博客',
    },
    {
      key: 'tutorials',
      icon: <BookOpen className={styles.menuIcon} />,
      label: '我的教程',
    },
  ];

  const handleMenuClick = (key: string) => {
    setActiveTab(key as ActiveTab);
  };

  const handleAvatarSave = async (avatarUrl: string) => {
    try {
      const result = await updateUser(session?.user?.uid as unknown as number, {
        email: session?.user?.email ?? '',
        avatar: avatarUrl,
        github: session?.user?.github ?? '',
        username: session?.user?.username ?? '',
      });

      if (result.success) {
        message.success('头像更新成功');
        console.log('头像更新成功:', avatarUrl);

        // 刷新session，更新用户信息
        await update({
          ...session,
          user: {
            ...session?.user,
            avatar: avatarUrl,
          },
        });
      } else {
        console.error('头像更新失败:', result.message);
        return Promise.reject(result.message);
      }
    } catch (error: any) {
      console.error('头像更新异常:', error);
    }
  };

  const handleNicknameSave = async (nickname: string) => {
    try {
      const result = await updateUser(session?.user?.uid as unknown as number, {
        email: session?.user?.email ?? '',
        avatar: session?.user?.avatar ?? '',
        github: session?.user?.github ?? '',
        username: nickname,
      });

      if (result.success) {
        message.success('昵称修改成功');

        // 刷新session，更新用户信息
        await update({
          ...session,
          user: {
            ...session?.user,
            username: nickname,
            name: nickname, // 同时更新name字段
          },
        });
      } else {
        message.error('昵称修改失败');
        console.error('昵称修改失败:', result.message);
      }
    } catch (error: any) {
      message.error('昵称修改异常');
      console.error('昵称修改异常:', error);
    }
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

  const handleDeleteBlog = async (id: number) => {
    try {
      const result = await deleteBlog(id);
      if (result.success) {
        message.success('博客删除成功！');
        loadBlogs();
      } else {
        message.error('删除出错');
      }
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      const result = await deletePost(id);
      if (result.success) {
        message.success('帖子删除成功！');
        loadPosts();
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

  // 处理帖子创建/更新
  const handlePostSubmit = async (values: {
    title: string;
    description: string;
    twitter?: string;
  }) => {
    try {
      setCreateState((prev) => ({ ...prev, btnLoading: true }));

      if (createState.isEditMode && createState.editingPost) {
        const res = await updatePost(createState.editingPost.ID.toString(), {
          title: values.title,
          description: values.description,
          tags: createState.tags,
          twitter: values.twitter || '',
        });

        if (res.success) {
          message.success('帖子更新成功！');
          // 帖子列表更新
          loadPosts();
        } else {
          message.error(res.message || '更新失败');
        }
      }
      // 重置状态
      setCreateState({
        isCreateModalVisible: false,
        isEditMode: false,
        editingPost: null,
        tags: [],
        inputVisible: false,
        inputValue: '',
        btnLoading: false,
      });
      postForm.resetFields();
      fetchPosts();
      fetchPostsStats();
    } catch {
      message.error('操作失败，请重试');
    } finally {
      setCreateState((prev) => ({ ...prev, btnLoading: false }));
    }
  };

  //  点击编辑帖子
  const handleEditPost = (post: PostType) => {
    setCreateState({
      ...createState,
      isEditMode: true,
      editingPost: post,
      isCreateModalVisible: true,
      tags: post.tags || [],
    });

    postForm.setFieldsValue({
      title: post.title,
      description: post.description,
      twitter: post.twitter || '',
    });
  };

  if (!session) {
    return (
      <div className={styles.emptyState}>
        <img src="/meme1.gif" className={styles.emptyImage} />
        <p>请先登录以查看个人中心</p>
      </div>
    );
  }

  const renderContent = () => {
    if (activeTab === 'blogs') {
      return (
        <Card className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <Title level={3} className={styles.cardTitle}>
              <FileText className={styles.cardIcon} />
              我的博客
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
                actions={[
                  <div className={styles.itemMeta}>
                    <Link href={`/blogs/${blog.ID}/edit`}>
                      <Edit size={16} className={styles.metaIcon} />
                    </Link>
                    <Popconfirm
                      title="删除博客"
                      description="你确定删除这个博客吗？"
                      okText="是"
                      cancelText="否"
                      onConfirm={() => handleDeleteBlog(blog.ID)}
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<Trash2 size={16} />}
                        title="删除博客"
                      />
                    </Popconfirm>
                  </div>,
                ]}
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
              我的教程
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
                actions={[
                  <div className={styles.itemMeta}>
                    <Link href={`/ecosystem/tutorials/${tutorial.ID}/edit`}>
                      <Edit size={16} className={styles.metaIcon} />
                    </Link>
                    <Popconfirm
                      title="删除教程"
                      description="你确定删除这个教程吗？"
                      okText="是"
                      cancelText="否"
                      onConfirm={() => handleDeleteTutorial(tutorial.ID)}
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<Trash2 size={16} />}
                        title="删除教程"
                        className={styles.metaBtn}
                      />
                    </Popconfirm>
                  </div>,
                ]}
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
              我的帖子
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
                actions={[
                  <div
                    className={styles.itemMeta}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<Edit size={16} />}
                      title="编辑帖子"
                      className={styles.metaBtn}
                      onClick={(e) => handleEditPost(post)}
                    />
                    <Popconfirm
                      title="删除帖子"
                      description="你确定删除这个帖子吗？"
                      okText="是"
                      cancelText="否"
                      onConfirm={() => handleDeletePost(post.ID)}
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<Trash2 size={16} />}
                        title="删除帖子"
                        className={styles.metaBtn}
                      />
                    </Popconfirm>
                  </div>,
                ]}
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
                    {/* 帖子描述 */}
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
            <AvatarEdit
              currentAvatar={session?.user?.avatar}
              userName={session?.user?.name || ''}
              onSave={handleAvatarSave}
            />
            <div className={styles.profileDetails}>
              <NicknameEdit
                currentNickname={profileData.name}
                onSave={handleNicknameSave}
              />
              <Text className={styles.subtitle}>
                Email: {profileData.email}
              </Text>
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
        currentUserId={Number(session?.user?.uid)}
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

      {/* 创建/编辑帖子模态框 */}
      <CreatePostModal
        visible={createState.isCreateModalVisible}
        isEditMode={createState.isEditMode}
        loading={createState.btnLoading}
        form={postForm}
        tags={createState.tags}
        inputVisible={createState.inputVisible}
        inputValue={createState.inputValue}
        onCancel={() => {
          setCreateState({
            isCreateModalVisible: false,
            isEditMode: false,
            editingPost: null,
            tags: [],
            inputVisible: false,
            inputValue: '',
            btnLoading: false,
          });
          postForm.resetFields();
        }}
        onSubmit={handlePostSubmit}
        onEditorChange={(value) => postForm.setFieldValue('description', value)}
        onTagAdd={() => {
          if (
            createState.inputValue &&
            !createState.tags.includes(createState.inputValue)
          ) {
            setCreateState((prev) => ({
              ...prev,
              tags: [...prev.tags, prev.inputValue],
              inputValue: '',
              inputVisible: false,
            }));
          }
        }}
        onTagRemove={(tag) => {
          setCreateState((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => t !== tag),
          }));
        }}
        onInputChange={(value) =>
          setCreateState((prev) => ({ ...prev, inputValue: value }))
        }
        onInputVisibleChange={(visible) =>
          setCreateState((prev) => ({ ...prev, inputVisible: visible }))
        }
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (
              createState.inputValue &&
              !createState.tags.includes(createState.inputValue)
            ) {
              setCreateState((prev) => ({
                ...prev,
                tags: [...prev.tags, prev.inputValue],
                inputValue: '',
                inputVisible: false,
              }));
            }
          }
        }}
      />
    </div>
  );
}
