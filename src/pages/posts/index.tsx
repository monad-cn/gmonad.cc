import type React from 'react';
import debounce from 'lodash/debounce';
import { useState, useEffect, useCallback } from 'react';
import {
  Pagination,
  Input,
  Select,
  Card,
  Empty,
  Button,
  Modal,
  Form,
  Spin,
  DatePicker,
  App as AntdApp,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  Search,
  Plus,
  User,
  Clock,
  X,
  TrendingUp,
  Users,
  MessageCircle,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Heart,
  Bookmark,
} from 'lucide-react';
import styles from './index.module.css';
import {
  getPosts,
  createPost,
  Post as PostType,
  getPostsStats,
  PostsStats,
  getPostById,
  updatePost,
  deletePost,
  getPostsStatus,
  likePost,
  unlikePost,
  favoritePost,
  unFavoritePost,
} from '../api/post';
import { SiX } from 'react-icons/si';
import Image from 'next/image';
import DateButton from '@/components/base/DateButton';

import dayjs from 'dayjs';
import VditorEditor from '@/components/vditorEditor';
import { parseMarkdown } from '@/lib/markdown';
import { useAuth } from '@/contexts/AuthContext';
// 接口请求已封装在 ../api/post

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
  const [btnLoading, setbtnLoading] = useState(false);
  const [detailLoading, setdetailLoading] = useState(false);

  // 帖子列表的点赞收藏状态 - 使用Map存储每个帖子的状态
  const [postLikeStates, setPostLikeStates] = useState<Map<number, boolean>>(new Map());
  const [postBookmarkStates, setPostBookmarkStates] = useState<Map<number, boolean>>(new Map());
  const [postLikeCounts, setPostLikeCounts] = useState<Map<number, number>>(new Map());
  const [postFavoriteCounts, setPostFavoriteCounts] = useState<Map<number, number>>(new Map());

  const { session, status } = useAuth();
  const permissions = session?.user?.permissions || [];

  // parseMarkdown将返回的markdown转为html展示
  const [postContent, setPostContent] = useState<string>('');

  useEffect(() => {
    if (selectedPost?.description) {
      parseMarkdown(selectedPost.description, { breaks: true }).then((htmlContent) => {
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

        // 初始化点赞/收藏数量
        const likeCountMap = new Map<number, number>();
        const favoriteCountMap = new Map<number, number>();
        res.data.posts.forEach((p) => {
          likeCountMap.set(p.ID, p.like_count ?? 0);
          favoriteCountMap.set(p.ID, p.favorite_count ?? 0);
        });
        setPostLikeCounts(likeCountMap);
        setPostFavoriteCounts(favoriteCountMap);

        // 初始化点赞/收藏状态
        try {
          if (status === 'authenticated') {
            const ids = res.data.posts.map((p) => p.ID);
            if (ids.length > 0) {
              const postsStatus = await getPostsStatus(ids);

              // 默认全部 false，避免与计数不一致
              const likeMap = new Map<number, boolean>(ids.map((id) => [id, false]));
              const favoriteMap = new Map<number, boolean>(ids.map((id) => [id, false]));

              if (postsStatus.success && postsStatus.data?.status) {
                postsStatus.data.status.forEach((r) => {
                  if (r.liked) likeMap.set(r.post_id, true);
                  if (r.favorited) favoriteMap.set(r.post_id, true);
                });
              }
              setPostLikeStates(likeMap);
              setPostBookmarkStates(favoriteMap);
            }
          } else {
            // 未登录状态，清空本地映射，确保 UI 不残留上一次状态
            setPostLikeStates(new Map());
            setPostBookmarkStates(new Map());
          }
        } catch {
          // 静默失败，使用默认空状态
        }
      } else {
        message.error(res.message || '获取帖子失败');
      }

      setLoading(false);
    },
    [searchTerm, sortBy, startDate, endDate, status, currentPage, pageSize, message]
  );

  const fetchPostsStats = useCallback(async () => {
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
  }, [message]);

  useEffect(() => {
    // 当搜索/排序/时间范围变化时：
    // 1) 重置到第 1 页
    // 2) 计算新的起止日期
    // 3) 显式传参触发列表与统计请求（避免闭包拿到旧状态）
    if (status === 'loading') {
      return
    }

    const debouncedFetch = debounce(() => {
      let computedStartDate: string | undefined;
      let computedEndDate: string | undefined;
      if (!dateRange?.[0] || !dateRange?.[1]) {
        computedStartDate = undefined;
        computedEndDate = undefined;
      } else {
        computedStartDate = dateRange[0].format('YYYY-MM-DD');
        computedEndDate = dateRange[1].format('YYYY-MM-DD');
      }

      setStartDate(computedStartDate);
      setEndDate(computedEndDate);

      // 显式传参，确保使用最新筛选条件与分页
      fetchPosts({
        keyword: searchTerm,
        order: sortBy as 'asc' | 'desc',
        page: 1,
        page_size: pageSize,
        start_date: computedStartDate,
        end_date: computedEndDate,
      });
      fetchPostsStats();
    }, 300);

    setCurrentPage(1);
    debouncedFetch();
    return () => {
      debouncedFetch.cancel();
    };
    // 这里刻意不把 fetchPosts/fetchPostsStats 放进依赖，避免其引用变化导致误触发并重置分页
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sortBy, dateRange, pageSize, status]);

  // 点赞/收藏后端交互（使用 ../api/post 封装）
  const toggleLikeOnServer = async (postId: number, like: boolean) => {
    return like ? (await likePost(postId)).success : (await unlikePost(postId)).success;
  };

  const toggleBookmarkOnServer = async (postId: number, bookmark: boolean) => {
    return bookmark ? (await favoritePost(postId)).success : (await unFavoritePost(postId)).success;
  };

  const handleCallPost = async (values: { title: string; description: string; twitter?: string }) => {
    try {
      setbtnLoading(true)
      if (isEditMode && editingPost) {
        const res = await updatePost(editingPost.ID.toString(), {
          title: values.title,
          description: values.description,
          tags,
          twitter: values.twitter || '',
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
          twitter: values.twitter || '',
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
    } catch {
      message.error('操作失败，请重试');
    } finally {
      setbtnLoading(false)
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
    } catch {
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

  const handlePostClick = async (post: PostType) => {
    try {
      setIsPostDetailVisible(true);
      setdetailLoading(true);
      // 直接从列表拿数据
      // const currentPost = posts.find((item: Post) => item.ID === post.ID);
      // if (currentPost) {
      //   setSelectedPost(currentPost);
      // } else {
      //   console.error('获取帖子失败:');
      // }

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
    setPostContent('');
    setIsPostDetailVisible(false);
    setSelectedPost(null);
    // fetchPosts();
    // fetchPostsStats();
  };

  // 详情页点赞处理函数
  const handleDetailLike = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await handleCardLike(postId, e);
    
    // 同步更新 selectedPost 的计数
    if (selectedPost && selectedPost.ID === postId) {
      const newLikeCount = postLikeCounts.get(postId) ?? 0;
      setSelectedPost({
        ...selectedPost,
        like_count: newLikeCount
      });
    }
  };

  // 详情页收藏处理函数
  const handleDetailBookmark = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await handleCardBookmark(postId, e);
    
    // 同步更新 selectedPost 的计数
    if (selectedPost && selectedPost.ID === postId) {
      const newFavoriteCount = postFavoriteCounts.get(postId) ?? 0;
      setSelectedPost({
        ...selectedPost,
        favorite_count: newFavoriteCount
      });
    }
  };

  // 列表卡片点赞处理函数
  const handleCardLike = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    // 检查用户是否已登录
    if (status !== 'authenticated') {
      message.warning('请先登录后再进行点赞操作');
      return;
    }

    try {
      const currentLiked = postLikeStates.get(postId) || false;
      const currentCount = postLikeCounts.get(postId) || 0;

      // 乐观更新
      const nextLiked = !currentLiked;
      setPostLikeStates(prev => {
        const newMap = new Map(prev);
        newMap.set(postId, nextLiked);
        return newMap;
      });

      setPostLikeCounts(prev => {
        const newMap = new Map(prev);
        newMap.set(postId, nextLiked ? currentCount + 1 : Math.max(0, currentCount - 1));
        return newMap;
      });

      const ok = await toggleLikeOnServer(postId, nextLiked);
      if (!ok) {
        // 回滚
        setPostLikeStates(prev => {
          const newMap = new Map(prev);
          newMap.set(postId, currentLiked);
          return newMap;
        });
        setPostLikeCounts(prev => {
          const newMap = new Map(prev);
          newMap.set(postId, currentCount);
          return newMap;
        });
        message.error('操作失败，请重试');
        return;
      }

      // message.success(nextLiked ? '点赞成功' : '取消点赞成功');
    } catch {
      message.error('操作失败，请重试');
    }
  };

  // 列表卡片收藏处理函数
  const handleCardBookmark = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡

    // 检查用户是否已登录
    if (status !== 'authenticated') {
      message.warning('请先登录后再进行收藏操作');
      return;
    }

    try {
      const currentBookmarked = postBookmarkStates.get(postId) || false;
      const currentCount = postFavoriteCounts.get(postId) || 0;
      const nextBookmarked = !currentBookmarked;
      // 乐观更新
      setPostBookmarkStates(prev => {
        const newMap = new Map(prev);
        newMap.set(postId, nextBookmarked);
        return newMap;
      });

      setPostFavoriteCounts(prev => {
        const newMap = new Map(prev);
        newMap.set(postId, nextBookmarked ? currentCount + 1 : Math.max(0, currentCount - 1));
        return newMap;
      });

      const ok = await toggleBookmarkOnServer(postId, nextBookmarked);
      if (!ok) {
        // 回滚
        setPostBookmarkStates(prev => {
          const newMap = new Map(prev);
          newMap.set(postId, currentBookmarked);
          return newMap;
        });
        setPostFavoriteCounts(prev => {
          const newMap = new Map(prev);
          newMap.set(postId, currentCount);
          return newMap;
        });
        message.error('操作失败，请重试');
        return;
      }

      // message.success(nextBookmarked ? '收藏成功' : '取消收藏成功');
    } catch {
      message.error('操作失败，请重试');
    }
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
                        {/* 帖子头部：作者信息和操作按钮 */}
                        <div className={styles.postHeader}>
                          <div className={styles.authorSection}>
                            <Image
                              src={post.user?.avatar || '/placeholder.svg'}
                              alt={post.user?.username || 'avatar'}
                              width={36}
                              height={36}
                              className={styles.avatar}
                            />
                            <div className={styles.authorInfo}>
                              <span className={styles.authorName}>
                                {post.user?.username}
                              </span>
                              <span className={styles.postDate}>
                                {dayjs(post.CreatedAt).format('YYYY-MM-DD HH:mm')}
                              </span>
                            </div>
                          </div>

                          {/* 右侧操作按钮 */}
                          <div className={styles.headerActions}>
                            {post.twitter && (
                              <a
                                href={post.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.twitterLink}
                                onClick={(e) => e.stopPropagation()}
                                title="查看推文"
                              >
                                <SiX size={14} />
                                <span className={styles.twitterText}>查看推文</span>
                              </a>
                            )}

                            {status === 'authenticated' &&
                              session?.user?.uid == post.user?.ID && (
                                <div className={styles.ownerActions}>
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<Edit size={14} />}
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
                                      type="text"
                                      size="small"
                                      icon={<Trash2 size={14} />}
                                      className={styles.deleteButton}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </Popconfirm>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* 帖子标题 */}
                        <h3 className={styles.postTitle}>{post.title}</h3>

                        {/* 帖子描述 */}
                        <p className={styles.postDescription}>
                          {post.description}
                        </p>

                        {/* 帖子底部：标签和互动数据 */}
                        <div className={styles.postFooter}>
                          <div className={styles.tagsSection}>
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className={styles.tag}>
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className={styles.moreTagsIndicator}>
                                +{post.tags.length - 3}
                              </span>
                            )}
                          </div>

                          <div className={styles.interactionSection}>
                           {/* 浏览量 */}
                            {post.view_count !== 0 && (
                              <Tooltip title="浏览量" placement="top">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<Eye size={14} />}
                                  className={`${styles.interactionBtn} ${styles.viewCount}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span>{post.view_count?.toLocaleString()}</span>
                                </Button>
                              </Tooltip>
                            )}

                            {/* 点赞按钮 */}
                            <Tooltip
                              title={
                                status !== 'authenticated' 
                                  ? '登录后可点赞' 
                                  : postLikeStates.get(post.ID) 
                                    ? '取消点赞' 
                                    : '点赞'
                              }
                              placement="top"
                            >
                              <Button
                                type="text"
                                size="small"
                                icon={
                                  <Heart
                                    size={14}
                                    fill={postLikeStates.get(post.ID) ? 'currentColor' : 'none'}
                                  />
                                }
                                className={`${styles.interactionBtn} ${postLikeStates.get(post.ID) ? styles.liked : ''
                                  } ${status !== 'authenticated' ? styles.guestBtn : ''}`}
                                onClick={(e) => handleCardLike(post.ID, e)}
                              >
                                {(postLikeCounts.get(post.ID) ?? 0) > 0 && (
                                  <span>{postLikeCounts.get(post.ID)}</span>
                                )}
                              </Button>
                            </Tooltip>

                            {/* 收藏按钮 */}
                            <Tooltip
                              title={
                                status !== 'authenticated' 
                                  ? '登录后可收藏' 
                                  : postBookmarkStates.get(post.ID) 
                                    ? '取消收藏' 
                                    : '收藏'
                              }
                              placement="top"
                            >
                              <Button
                                type="text"
                                size="small"
                                icon={
                                  <Bookmark
                                    size={14}
                                    fill={postBookmarkStates.get(post.ID) ? 'currentColor' : 'none'}
                                  />
                                }
                                className={`${styles.interactionBtn} ${postBookmarkStates.get(post.ID) ? styles.bookmarked : ''
                                  } ${status !== 'authenticated' ? styles.guestBtn : ''}`}
                                onClick={(e) => handleCardBookmark(post.ID, e)}
                              >
                                {(postFavoriteCounts.get(post.ID) ?? 0) > 0 && (
                                  <span>{postFavoriteCounts.get(post.ID)}</span>
                                )}
                              </Button>
                            </Tooltip>
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
                showTotal={(total) =>
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
                        {selectedPost.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className={styles.postDetailTag}>
                            {tag}
                          </span>
                        ))}
                        {selectedPost.tags.length > 3 && (
                          <span className={styles.postDetailTag}>
                            +{selectedPost.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 推文链接 */}
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
                <div className={styles.postDetailActions}>
                  {/* 点赞按钮 */}
                  <Tooltip
                    title={
                      status !== 'authenticated' 
                        ? '登录后可点赞' 
                        : postLikeStates.get(selectedPost.ID) 
                          ? '取消点赞' 
                          : '点赞'
                    }
                    placement="top"
                  >
                    <Button
                      type="text"
                      size="large"
                      icon={
                        <Heart
                          size={16}
                          fill={postLikeStates.get(selectedPost.ID) ? 'currentColor' : 'none'}
                        />
                      }
                      className={`${styles.postDetailActionBtn} ${postLikeStates.get(selectedPost.ID) ? styles.liked : ''
                        } ${status !== 'authenticated' ? styles.guestBtn : ''}`}
                      onClick={(e) => handleDetailLike(selectedPost.ID, e)}
                    >
                      {(postLikeCounts.get(selectedPost.ID) ?? 0) > 0 && (
                        <span>{postLikeCounts.get(selectedPost.ID)}</span>
                      )}
                    </Button>
                  </Tooltip>

                  {/* 收藏按钮 */}
                  <Tooltip
                    title={
                      status !== 'authenticated' 
                        ? '登录后可收藏' 
                        : postBookmarkStates.get(selectedPost.ID) 
                          ? '取消收藏' 
                          : '收藏'
                    }
                    placement="top"
                  >
                    <Button
                      type="text"
                      size="large"
                      icon={
                        <Bookmark
                          size={16}
                          fill={postBookmarkStates.get(selectedPost.ID) ? 'currentColor' : 'none'}
                        />
                      }
                      className={`${styles.postDetailActionBtn} ${postBookmarkStates.get(selectedPost.ID) ? styles.bookmarked : ''
                        } ${status !== 'authenticated' ? styles.guestBtn : ''}`}
                      onClick={(e) => handleDetailBookmark(selectedPost.ID, e)}
                    >
                      {(postFavoriteCounts.get(selectedPost.ID) ?? 0) > 0 && (
                        <span>{postFavoriteCounts.get(selectedPost.ID)}</span>
                      )}
                    </Button>
                  </Tooltip>
                </div>
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
          width={800}
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
                  loading={btnLoading}
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
