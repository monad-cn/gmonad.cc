import type React from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Pagination,
  Input,
  Select,
  Card,
  Empty,
  Button,
  Modal,
  Form,
  message,
  Spin,
  Tag,
  DatePicker,
  App as AntdApp,
  Popconfirm,
} from 'antd';
import {
  Search,
  Star,
  Plus,
  User,
  ExternalLink,
  Clock,
  X,
  TrendingUp,
  Users,
  MessageCircle,
  Calendar,
  ThumbsUp,
  Share2,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import styles from './index.module.css';
import {
  getPosts,
  createPost,
  Post as PostType,
  getPostsStats,
  PostsStats,
  Post,
  getPostById,
  updatePost,
  deletePost,
} from '../api/post';
import { SiX } from 'react-icons/si';
import Image from 'next/image';
import DateButton from '@/components/base/DateButton';

import dayjs from 'dayjs';
import VditorEditor from '@/components/vditorEditor';
import { sanitizeMarkdown } from '@/lib/markdown';
import { useAuth } from '@/contexts/AuthContext';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function PostsList() {
  const { message } = AntdApp.useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('desc');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPost, setEditingPost] = useState<PostType | null>(null);

  const [form] = Form.useForm();
  const [tags, setTags] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >(() => {
    const endOfToday = dayjs().endOf('day');
    const startOfWeekAgo = dayjs().subtract(6, 'day').startOf('day');
    return [startOfWeekAgo, endOfToday];
  });
  const [postsStats, setPostsStats] = useState<PostsStats | null>(null);
  const [isPostDetailVisible, setIsPostDetailVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [startDate, setStartDate] = useState(
    dateRange[0]?.format('YYYY-MM-DD')
  );
  const [endDate, setEndDate] = useState(dateRange[1]?.format('YYYY-MM-DD'));

  const [loading, setLoading] = useState(false);
  const [detailLoading, setdetailLoading] = useState(false);

  const { session, status } = useAuth();
  const permissions = session?.user?.permissions || [];

  // parseMarkdown将返回的markdown转为html展示
  const [postContent, setPostContent] = useState<string>('');

  useEffect(() => {
    if (selectedPost?.description) {
      sanitizeMarkdown(selectedPost.description).then((htmlContent) => {
        setPostContent(htmlContent);
      });
    }
  }, [selectedPost?.description]);

  const fetchPosts = useCallback(
    async (params?: {
      keyword?: string;
      order?: 'asc' | 'desc';
      page?: number;
      page_size?: number;
      start_date?: string;
      end_date?: string;
    }) => {
      setLoading(true);

      const res = await getPosts({
        keyword: params?.keyword || searchTerm,
        order: params?.order || (sortBy as 'asc' | 'desc'),
        page: params?.page || currentPage,
        page_size: params?.page_size || pageSize,
        start_date: params?.start_date || startDate,
        end_date: params?.end_date || endDate,
      });
      if (res.success && res.data) {
        setPosts(res.data.posts);
        setTotal(res.data.total || res.data.posts.length);
      } else {
        message.error(res.message || '获取帖子失败');
      }

      setLoading(false);
    },
    [searchTerm, sortBy, startDate, endDate]
  );

  const fetchPostsStats = async () => {
    try {
      const res = await getPostsStats();
      if (res.success && res.data) {
        setPostsStats(res.data);
      } else {
        message.error(res.message || '获取社区统计失败');
      }
    } catch (error) {
      console.error('获取社区统计异常:', error);
      message.error('获取社区统计异常');
    }
  };

  useEffect(() => {
    // 请求参数发生变更，分页参数重制为1
    setCurrentPage(1);

    let newStartDate = undefined;
    let newEndDate = undefined;
    if (!dateRange?.[0] || !dateRange?.[1]) {
      newStartDate = undefined;
      newEndDate = undefined;
    } else {
      newStartDate = dateRange[0].format('YYYY-MM-DD');
      newEndDate = dateRange[1].format('YYYY-MM-DD');
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);

    fetchPosts();
    fetchPostsStats();
  }, [searchTerm, sortBy, dateRange, fetchPosts]);

  const getStarCount = (viewCount: number) => {
    if (viewCount >= 2000) return 5;
    if (viewCount >= 1500) return 4;
    if (viewCount >= 1000) return 3;
    if (viewCount >= 500) return 2;
    return 1;
  };

  const handleCallPost = async (values: any) => {
    try {
      if (isEditMode && editingPost) {
        const res = await updatePost(editingPost.ID.toString(), {
          title: values.title,
          description: values.description,
          tags,
          twitter: values.twitter,
        });
        if (res.success) {
          message.success('帖子更新成功！');
        } else {
          message.error(res.message || '更新失败');
        }
      } else {
        const res = await createPost({
          title: values.title,
          description: values.description,
          tags,
          twitter: values.twitter,
        });
        if (res.success) {
          message.success('帖子发布成功！');
        } else {
          message.error(res.message || '发布失败');
        }
      }

      setIsCreateModalVisible(false);
      setIsEditMode(false);
      setEditingPost(null);
      form.resetFields();
      fetchPosts();
      fetchPostsStats();
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  const handleEditPost = (post: PostType) => {
    setIsEditMode(true);
    setEditingPost(post);
    setIsCreateModalVisible(true);

    // 填充表单
    form.setFieldsValue({
      title: post.title,
      description: post.description,
      twitter: post.twitter || '',
    });
    setTags(post.tags || []);
  };

  const handleDeletePost = async (postId: number) => {
    try {
      const res = await deletePost(postId);
      if (res.success) {
        message.success('帖子删除成功');
        fetchPosts();
        fetchPostsStats();
      } else {
        message.error(res.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  // 编辑器处理
  const handleVditorEditorChange = useCallback(
    (value: string) => {
      form.setFieldValue('description', value);
    },
    [form]
  );

  const handleAddTag = () => {
    if (inputValue && !tags.includes(inputValue)) {
      const newTags = [...tags, inputValue];
      setTags(newTags);
      setInputValue('');
    }
    setInputVisible(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handlePostClick = async (post: Post) => {
    try {
      setIsPostDetailVisible(true);
      setdetailLoading(true);

      const res = await getPostById(post.ID.toString());
      if (res.success && res.data) {
        setSelectedPost(res.data);
      } else {
        console.error('获取帖子失败:', res.message);
      }
    } catch (error) {
      console.error('获取帖子详情异常:', error);
    } finally {
      setdetailLoading(false);
    }
  };

  const handleClosePostDetail = () => {
    setPostContent('')
    setIsPostDetailVisible(false);
    setSelectedPost(null);
    // fetchPosts();
    // fetchPostsStats();
  };

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    if (!dates || !dates[0] || !dates[1]) {
      setDateRange([null, null]);
    } else {
      setDateRange([dates[0], dates[1]]);
    }
  };

  // pagenation
  // 分页处理
  const handlePageChange = async (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
    await fetchPosts({ page, page_size: size || pageSize });
  };

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

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
          {status === 'authenticated' && permissions.includes('blog:write') && (
            <Button
              type="primary"
              icon={<Plus size={16} />}
              className={styles.createButton}
              onClick={() => setIsCreateModalVisible(true)}
            >
              发布帖子
            </Button>
          )}
        </div>
        <Card className={styles.filtersCard}>
          <div className={styles.filters}>
            <div className={styles.searchContainer}>
              <Input
                placeholder="搜索帖子、作者..."
                prefix={<Search className={styles.searchIcon} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                size="large"
              />
            </div>
            <div className={styles.dateContainer}>
              <RangePicker
                prefix={
                  <>
                    <DateButton
                      style={{ marginRight: '4px' }}
                      size="small"
                      color="primary"
                      variant="filled"
                      dateRange={dateRange}
                      handleDateRangeChange={handleDateRangeChange}
                      label="今天"
                      dates={[dayjs(), dayjs()]}
                      active={
                        dateRange[0]?.format('YYYY-MM-DD') ===
                          dayjs().format('YYYY-MM-DD') &&
                        dateRange[1]?.format('YYYY-MM-DD') ===
                          dayjs().format('YYYY-MM-DD')
                      }
                    />
                    <DateButton
                      size="small"
                      color="primary"
                      variant="filled"
                      dateRange={dateRange}
                      handleDateRangeChange={handleDateRangeChange}
                      label="近一周"
                      dates={[dayjs().subtract(1, 'week'), dayjs()]}
                      active={
                        dateRange[0]?.format('YYYY-MM-DD') ===
                          dayjs().subtract(1, 'week').format('YYYY-MM-DD') &&
                        dateRange[1]?.format('YYYY-MM-DD') ===
                          dayjs().format('YYYY-MM-DD')
                      }
                    />
                  </>
                }
                placeholder={['开始日期', '结束日期']}
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
              <Select
                value={sortBy}
                onChange={setSortBy}
                className={styles.sortSelect}
                size="large"
              >
                <Option value="desc">最新发布</Option>
                <Option value="asc">最早发布</Option>
              </Select>
            </div>
            {/* <div className={styles.resultsInfo}>
              显示 {startIndex}-{endIndex} 项，共 {total} 项
            </div> */}
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
                    <Card
                      key={post.ID}
                      className={styles.postCard}
                      onClick={() => handlePostClick(post)}
                    >
                      <div className={styles.postContent}>
                        {status === 'authenticated' &&
                          session?.user?.uid == post.user?.ID && (
                            <div className={styles.actionButtons}>
                              {/* 编辑按钮 */}
                              <Button
                                icon={<Edit size={16} />}
                                className={styles.editButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPost(post);
                                }}
                              />

                              <Popconfirm
                                title="确认删除该帖子吗？"
                                description="删除后将无法恢复"
                                okText="删除"
                                cancelText="取消"
                                okButtonProps={{ danger: true }}
                                onConfirm={(e) => {
                                  e?.stopPropagation();
                                  handleDeletePost(post.ID);
                                }}
                                onCancel={(e) => e?.stopPropagation()}
                              >
                                <Button
                                  icon={<Trash2 size={16} />}
                                  className={styles.deleteButton}
                                  onClick={(e) => e.stopPropagation()} // 避免触发卡片点击
                                />
                              </Popconfirm>
                            </div>
                          )}
                        <div className={styles.avatarSection}>
                          <Image
                            src={post.user?.avatar || '/placeholder.svg'}
                            alt={post.user?.username || 'avatar'}
                            width={40}
                            height={40}
                            className={styles.avatar}
                          />
                        </div>
                        <div className={styles.contentSection}>
                          <div className={styles.postHeader}>
                            <h3 className={styles.postTitle}>{post.title}</h3>
                            <div className={styles.postMeta}>
                              <span className={styles.authorName}>
                                {post.user?.username}
                              </span>
                              <span className={styles.postDate}>
                                {dayjs(post.CreatedAt).format(
                                  'YYYY-MM-DD HH:mm'
                                )}
                              </span>
                              {post.twitter && (
                                <a
                                  href={post.twitter}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.xLink}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <SiX size={16} />
                                  <span className={styles.xText}>查看推文</span>
                                </a>
                              )}
                            </div>
                          </div>
                          <p className={styles.postDescription}>
                            {post.description}
                          </p>
                          <div className={styles.postFooter}>
                            <div className={styles.popularity}>
                              {Array.from({
                                length: getStarCount(post.view_count || 0),
                              }).map((_, index) => (
                                <Star
                                  key={index}
                                  className={styles.starIcon}
                                  fill="currentColor"
                                />
                              ))}
                              {post.view_count !== 0 && (
                                <span className={styles.viewCount}>
                                  {post.view_count?.toLocaleString()} 次浏览
                                </span>
                              )}
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
                  {(postsStats?.weekly_hot_posts ?? []).map((post, index) => (
                    <div
                      key={post.ID}
                      className={styles.hotPostItem}
                      onClick={() => handlePostClick(post)}
                    >
                      <div className={styles.hotPostRank}>{index + 1}</div>
                      <div className={styles.hotPostContent}>
                        <h4 className={styles.hotPostTitle}>{post.title}</h4>
                        <div className={styles.hotPostMeta}>
                          <span className={styles.hotPostAuthor}>
                            {post.user?.username}
                          </span>
                          <span className={styles.hotPostViews}>
                            {post.view_count} 浏览
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(postsStats?.weekly_hot_posts?.length ?? 0) === 0 && (
                    <Empty description="暂无热门帖子" />
                  )}
                </div>
              </Card>

              {/* 活跃用户 */}
              <Card className={styles.sidebarCard}>
                <div className={styles.sidebarHeader}>
                  <Users className={styles.sidebarIcon} />
                  <h3 className={styles.sidebarTitle}>活跃作者</h3>
                </div>
                <div className={styles.activeUsers}>
                  {(postsStats?.top_active_users ?? []).map((user) => (
                    <div key={user.ID} className={styles.activeUserItem}>
                      <Image
                        width={40} // 你可以根据实际样式调整宽度
                        height={40}
                        src={user.avatar || '/placeholder.svg'}
                        alt={user.username}
                        className={styles.activeUserAvatar}
                      />
                      <div className={styles.activeUserInfo}>
                        <div className={styles.activeUserName}>
                          {user.username}
                        </div>
                        <div className={styles.activeUserPosts}>
                          帖子数: {user.post_count}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(postsStats?.top_active_users?.length ?? 0) === 0 && (
                    <Empty description="暂无活跃用户" />
                  )}
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
                    <div className={styles.statNumber}>
                      {postsStats?.total_posts?.toLocaleString() ?? '0'}
                    </div>
                    <div className={styles.statLabel}>总帖子数</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>
                      {postsStats?.active_user_count?.toLocaleString() ?? '0'}
                    </div>
                    <div className={styles.statLabel}>活跃用户</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>
                      {postsStats?.weekly_post_count?.toLocaleString() ?? '0'}
                    </div>
                    <div className={styles.statLabel}>本周帖子</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className={styles.listBottomControls}>
            <div className={styles.bottomPagination}>
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={handlePageChange}
                // showQuickJumper={true}
                showTotal={(total, range) =>
                  `显示 ${startIndex}-${endIndex} 项，共 ${total} 项`
                }
                className={styles.fullPagination}
              />
            </div>
          </div>
        </Spin>

        <Modal
          loading={detailLoading}
          title={null}
          open={isPostDetailVisible}
          onCancel={handleClosePostDetail}
          footer={null}
          width={800}
          className={styles.postDetailModal}
        >
          {selectedPost && (
            <div className={styles.postDetailContent}>
              {/* 帖子头部 */}
              <div className={styles.postDetailHeader}>
                <div className={styles.postDetailAuthor}>
                  <Image
                    src={selectedPost.user?.avatar || '/placeholder.svg'}
                    width={40}
                    height={40}
                    alt={selectedPost.user?.username as string}
                    className={styles.postDetailAvatar}
                  />
                  <div className={styles.postDetailAuthorInfo}>
                    <h4 className={styles.postDetailAuthorName}>
                      {selectedPost.user?.username}
                    </h4>

                    <div className={styles.postDetailMeta}>
                      <div className={styles.postDetailTime}>
                        <Clock size={16} />
                        <span>
                          {dayjs(selectedPost.CreatedAt).format(
                            'YYYY-MM-DD HH:mm'
                          )}
                        </span>
                      </div>

                      {selectedPost.view_count !== 0 && (
                        <div className={styles.postDetailStat}>
                          <Eye size={16} />
                          <span>
                            {selectedPost.view_count?.toLocaleString()} 浏览
                          </span>
                        </div>
                      )}
                      <div className={styles.postDetailTags}>
                        {selectedPost.tags.map((tag, index) => (
                          <span key={index} className={styles.postDetailTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {selectedPost.twitter && (
                  <a
                    href={selectedPost.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.postDetailXLink}
                  >
                    <SiX size={18} />
                    <span>查看推文</span>
                  </a>
                )}
              </div>

              {/* 帖子标题 */}
              <h1 className={styles.postDetailTitle}>{selectedPost.title}</h1>

              {/* 帖子内容 */}
              <div className={styles.postDetailBody}>
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: postContent }}
                />
              </div>

              {/* 帖子统计和操作 */}
              <div className={styles.postDetailFooter}>
                {/* <div className={styles.postDetailStats}> */}
                {/* {selectedPost.view_count !== 0 && <div className={styles.postDetailStat}>
                    <Eye size={16} />
                    <span>{selectedPost.view_count?.toLocaleString()} 浏览</span>
                  </div>
                  } */}
                {/* <div className={styles.postDetailStat}>
                    <ThumbsUp size={16} />
                    <span>{selectedPost.likes || 0} 点赞</span>
                  </div>
                  <div className={styles.postDetailStat}>
                    <MessageCircle size={16} />
                    <span>12 评论</span>
                  </div> */}
                {/* </div> */}
                {/* <div className={styles.postDetailActions}>
                  <Button icon={<ThumbsUp size={16} />} className={styles.postDetailActionBtn}>
                    点赞
                  </Button>
                  <Button icon={<MessageCircle size={16} />} className={styles.postDetailActionBtn}>
                    评论
                  </Button>
                  <Button icon={<Share2 size={16} />} className={styles.postDetailActionBtn}>
                    分享
                  </Button>
                </div> */}
              </div>
            </div>
          )}
        </Modal>

        <Modal
          title={isEditMode ? '编辑帖子' : '发布新帖子'}
          open={isCreateModalVisible}
          onCancel={() => {
            setIsCreateModalVisible(false);
            setIsEditMode(false);
            setEditingPost(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
          className={styles.createModal}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCallPost}
            className={styles.createForm}
          >
            <Form.Item
              name="title"
              label="标题"
              rules={[
                { required: true, message: '请输入帖子标题' },
                { max: 100, message: '标题不能超过100个字符' },
              ]}
            >
              <Input placeholder="输入帖子标题..." size="large" />
            </Form.Item>

            <Form.Item
              name="description"
              label="内容描述"
              rules={[
                { required: true, message: '请输入帖子内容' },
                { min: 100, message: '内容至少需要100个字符' },
                { max: 2000, message: '内容不能超过2000个字符' },
              ]}
            >
              <VditorEditor
                value={form.getFieldValue('description')}
                onChange={handleVditorEditorChange}
              />
            </Form.Item>
            <Form.Item
              name="twitter"
              label="推文链接"
              rules={[
                {
                  type: 'url',
                  message: '请输入有效的 URL 链接',
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
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className={styles.removeTagButton}
                    >
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
                  <button
                    type="button"
                    onClick={() => setInputVisible(true)}
                    className={styles.addTagButton}
                  >
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
                    setIsCreateModalVisible(false);
                    form.resetFields();
                  }}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className={styles.submitButton}
                >
                  {isEditMode ? '更新帖子' : '发布帖子'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
