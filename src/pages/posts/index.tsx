import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Spin, Empty, Form, App as AntdApp } from 'antd';
import { User, Plus } from 'lucide-react';
import debounce from 'lodash/debounce';

import { useAuth } from '@/contexts/AuthContext';
import { usePostData } from '@/hooks/usePostData';
import { parseMarkdown } from '@/lib/markdown';
import { createPost, updatePost, deletePost, getPostById, getPostsStatus } from '../api/post';
import {
  PostType,
  CreatePostState,
  PostDetailState,
} from '@/types/posts';

import PostFilters from '@/components/posts/PostFilters';
import PostSidebar from '@/components/posts/PostSidebar';
import PostCard from '@/components/posts/PostCard';
import PostDetailModal from '@/components/posts/PostDetailModal';
import CreatePostModal from '@/components/posts/CreatePostModal';

import styles from './index.module.css';
import { followUser, unfollowUser } from '../api/user';

export default function PostsList() {
  const { message } = AntdApp.useApp();
  const { session, status } = useAuth();
  const permissions = session?.user?.permissions || [];
  const loadingRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allPosts, setAllPosts] = useState<PostType[]>([]);

  // 使用自定义Hook
  const {
    listState,
    setListState,
    interactionState,
    setInteractionState,
    postsStats,
    fetchPosts,
    fetchPostsStats,
    fetchPostsStatus,
    toggleLike,
    toggleBookmark,
  } = usePostData();

  // 创建帖子状态
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

  // 关注状态
  const [followLoadingStates, setFollowLoadingStates] = useState<Map<number, boolean>>(new Map());

  const [form] = Form.useForm();

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

  // 同步帖子数据
  useEffect(() => {
    if (listState.currentPage === 1) {
      // 当是第一页时，重置列表
      setAllPosts(listState.posts);
    } else if (isLoadingMore) {
      // 加载更多时，追加数据
      const newPosts = listState.posts;
      const existingPostIds = new Set(allPosts.map(p => p.ID));
      const uniqueNewPosts = newPosts.filter(p => !existingPostIds.has(p.ID));
      setAllPosts(prev => [...prev, ...uniqueNewPosts]);
    }
  }, [listState.posts, listState.currentPage, isLoadingMore, allPosts]);

  // 获取用户的点赞/收藏/关注状态
  useEffect(() => {
    if (status === 'authenticated' && allPosts.length > 0) {
      fetchPostsStatus();
    }
  }, [status, allPosts, fetchPostsStatus]);

  const handleLoadMore = useCallback(async () => {
    if (
      isLoadingMore ||
      listState.loading ||
      allPosts.length >= listState.total ||
      !allPosts.length
    ) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const nextPage = listState.currentPage + 1;
      await fetchPosts({
        keyword: listState.searchTerm,
        order: listState.sortBy as 'asc' | 'desc',
        page: nextPage,
        page_size: listState.pageSize,
        start_date: listState.startDate,
        end_date: listState.endDate
      });
      setListState(prev => ({
        ...prev,
        currentPage: nextPage
      }));

      // 获取新加载帖子的状态
      if (status === 'authenticated') {
        await fetchPostsStatus();
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    listState.loading,
    listState.currentPage,
    listState.searchTerm,
    listState.sortBy,
    listState.pageSize,
    listState.startDate,
    listState.endDate,
    listState.total,
    allPosts.length,
    fetchPosts,
    setListState,
    status,
    fetchPostsStatus
  ]);

  // 使用防抖处理滚动加载
  const debouncedLoadMore = useCallback(
    debounce(() => {
      handleLoadMore();
    }, 200),
    [handleLoadMore]
  );

  // 监听滚动加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (
          target.isIntersecting &&
          !listState.loading &&
          !isLoadingMore &&
          allPosts.length > 0 &&
          allPosts.length < listState.total
        ) {
          debouncedLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
      debouncedLoadMore.cancel();
    };
  }, [
    listState.loading,
    listState.total,
    allPosts.length,
    isLoadingMore,
    debouncedLoadMore
  ]);

  // 筛选条件变化时重新获取数据
  useEffect(() => {
    if (status === 'loading') return;

    const debouncedFetch = debounce(() => {
      let computedStartDate: string | undefined;
      let computedEndDate: string | undefined;

      if (!listState.dateRange?.[0] || !listState.dateRange?.[1]) {
        computedStartDate = undefined;
        computedEndDate = undefined;
      } else {
        computedStartDate = listState.dateRange[0].format('YYYY-MM-DD');
        computedEndDate = listState.dateRange[1].format('YYYY-MM-DD');
      }

      // 重置状态
      setListState((prev) => ({
        ...prev,
        currentPage: 1,
        startDate: computedStartDate,
        endDate: computedEndDate,
      }));
      setAllPosts([]); // 重置帖子列表
      setIsLoadingMore(false);

      fetchPosts({
        keyword: listState.searchTerm,
        order: listState.sortBy as 'asc' | 'desc',
        page: 1,
        page_size: listState.pageSize,
        start_date: computedStartDate,
        end_date: computedEndDate,
      });
      fetchPostsStats();
    }, 300);

    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [
    listState.searchTerm,
    listState.sortBy,
    listState.dateRange,
    listState.pageSize,
    status,
    fetchPosts,
    fetchPostsStats,
    setListState
  ]);

  const handleResetFilters = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      searchTerm: '',
      sortBy: 'desc',
      dateRange: [null, null],
      currentPage: 1,
    }));
  }, [setListState]);

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
        } else {
          message.error(res.message || '更新失败');
        }
      } else {
        const res = await createPost({
          title: values.title,
          description: values.description,
          tags: createState.tags,
          twitter: values.twitter || '',
        });

        if (res.success) {
          message.success('帖子发布成功！');
        } else {
          message.error(res.message || '发布失败');
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
      form.resetFields();
      fetchPosts();
      fetchPostsStats();
    } catch {
      message.error('操作失败，请重试');
    } finally {
      setCreateState((prev) => ({ ...prev, btnLoading: false }));
    }
  };

  // 处理点赞
  const handleLike = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== 'authenticated') {
      message.warning('请先登录后再进行点赞操作');
      return;
    }

    const currentLiked = interactionState.postLikeStates.get(postId) || false;
    const currentCount = interactionState.postLikeCounts.get(postId) || 0;
    const nextLiked = !currentLiked;

    // 乐观更新
    setInteractionState((prev) => ({
      ...prev,
      postLikeStates: new Map(prev.postLikeStates).set(postId, nextLiked),
      postLikeCounts: new Map(prev.postLikeCounts).set(
        postId,
        nextLiked ? currentCount + 1 : Math.max(0, currentCount - 1)
      ),
    }));

    const success = await toggleLike(postId, nextLiked);
    if (!success) {
      // 回滚
      setInteractionState((prev) => ({
        ...prev,
        postLikeStates: new Map(prev.postLikeStates).set(postId, currentLiked),
        postLikeCounts: new Map(prev.postLikeCounts).set(postId, currentCount),
      }));
      message.error('操作失败，请重试');
    }
  };

  // 处理收藏
  const handleBookmark = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== 'authenticated') {
      message.warning('请先登录后再进行收藏操作');
      return;
    }

    const currentBookmarked =
      interactionState.postBookmarkStates.get(postId) || false;
    const currentCount = interactionState.postFavoriteCounts.get(postId) || 0;
    const nextBookmarked = !currentBookmarked;

    // 乐观更新
    setInteractionState((prev) => ({
      ...prev,
      postBookmarkStates: new Map(prev.postBookmarkStates).set(
        postId,
        nextBookmarked
      ),
      postFavoriteCounts: new Map(prev.postFavoriteCounts).set(
        postId,
        nextBookmarked ? currentCount + 1 : Math.max(0, currentCount - 1)
      ),
    }));

    const success = await toggleBookmark(postId, nextBookmarked);
    if (!success) {
      // 回滚
      setInteractionState((prev) => ({
        ...prev,
        postBookmarkStates: new Map(prev.postBookmarkStates).set(
          postId,
          currentBookmarked
        ),
        postFavoriteCounts: new Map(prev.postFavoriteCounts).set(
          postId,
          currentCount
        ),
      }));
      message.error('操作失败，请重试');
    }
  };

  // 处理关注
  const handleFollow = async (userId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (status !== 'authenticated') {
      message.warning('请先登录后再进行关注操作');
      return;
    }

    // 不能关注自己
    if (Number(session?.user?.uid) === userId) {
      message.warning('不能关注自己');
      return;
    }

    // 如果正在加载中，直接返回
    if (followLoadingStates.get(userId)) {
      return;
    }

    const currentFollowing = interactionState.followingStates.get(userId) || false;
    const nextFollowing = !currentFollowing;

    try {
      // 设置加载状态
      setFollowLoadingStates(prev => new Map(prev).set(userId, true));

      // 乐观更新
      setInteractionState(prev => ({
        ...prev,
        followingStates: new Map(prev.followingStates).set(userId, nextFollowing)
      }));

      // 调用后端 API
      const result = await (nextFollowing ? followUser(userId) : unfollowUser(userId));

      if (result.success) {
        message.success(nextFollowing ? '关注成功' : '取消关注成功', 1);
      } else {
        // 操作失败，回滚状态
        setInteractionState(prev => ({
          ...prev,
          followingStates: new Map(prev.followingStates).set(userId, currentFollowing)
        }));
        message.error('操作失败，请重试', 1);
      }
    } catch (error) {
      // 发生错误，回滚状态
      setInteractionState(prev => ({
        ...prev,
        followingStates: new Map(prev.followingStates).set(userId, currentFollowing)
      }));
      message.error('操作失败，请重试', 1);
    } finally {
      // 清除加载状态
      setFollowLoadingStates(prev => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    }
  };


  // 其他处理函数...
  const handleEditPost = (post: PostType) => {
    setCreateState({
      ...createState,
      isEditMode: true,
      editingPost: post,
      isCreateModalVisible: true,
      tags: post.tags || [],
    });

    form.setFieldsValue({
      title: post.title,
      description: post.description,
      twitter: post.twitter || '',
    });
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

  const handlePostClick = async (post: PostType) => {
    try {
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
      setDetailState((prev) => ({
        ...prev,
        detailLoading: false,
      }));
    }
  };

  return (
    <div className={`${styles.container} nav-t-top`}>
      <div className={styles.content}>
        {/* 页面头部 */}
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
              onClick={() =>
                setCreateState((prev) => ({
                  ...prev,
                  isCreateModalVisible: true,
                }))
              }
            >
              发布帖子
            </Button>
          )}
        </div>

        {/* 筛选组件 */}
        <PostFilters
          searchTerm={listState.searchTerm}
          sortBy={listState.sortBy}
          dateRange={listState.dateRange}
          onSearchChange={(value) =>
            setListState((prev) => ({ ...prev, searchTerm: value }))
          }
          onSortChange={(value) =>
            setListState((prev) => ({ ...prev, sortBy: value }))
          }
          onDateRangeChange={(dates) =>
            setListState((prev) => ({
              ...prev,
              dateRange: dates || [null, null],
            }))
          }
          onReset={handleResetFilters}
        />

        <div className={styles.mainLayout}>
          {/* 侧边栏 */}
          <PostSidebar
            postsStats={postsStats}
            onPostClick={handlePostClick}
            isAuthenticated={status === 'authenticated'}
            currentUserId={Number(session?.user?.uid)}
            followingStates={Object.fromEntries(interactionState.followingStates)}
            followLoadingStates={Object.fromEntries(followLoadingStates)}
            onFollow={handleFollow}
          />

          {/* 帖子列表 */}
          <div className={styles.postsSection}>
            <div className={styles.postsContainer}>
              {allPosts.length === 0 ? (
                listState.loading && !isLoadingMore ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <Empty description="暂无帖子" className={styles.empty} />
                )
              ) : (
                <>
                  {allPosts.map((post) => (
                    <PostCard
                      key={post.ID}
                      post={post}
                      isOwner={session?.user?.uid == post.user?.ID}
                      isAuthenticated={status === 'authenticated'}
                      currentUserId={Number(session?.user?.uid)}
                      likeState={
                        interactionState.postLikeStates.get(post.ID) || false
                      }
                      bookmarkState={
                        interactionState.postBookmarkStates.get(post.ID) ||
                        false
                      }
                      followingState={
                        interactionState.followingStates.get(post.user?.ID || 0) ||
                        false
                      }
                      followLoading={followLoadingStates.get(post.user?.ID || 0) || false}
                      likeCount={
                        interactionState.postLikeCounts.get(post.ID) ?? 0
                      }
                      favoriteCount={
                        interactionState.postFavoriteCounts.get(post.ID) ?? 0
                      }
                      onPostClick={handlePostClick}
                      onLike={handleLike}
                      onBookmark={handleBookmark}
                      onFollow={handleFollow}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                    />
                  ))}
                  {/* 加载更多指示器 */}
                  <div
                    ref={loadingRef}
                    style={{
                      height: '50px',
                      margin: '10px 0',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    {isLoadingMore ? (
                      <Spin size="default" />
                    ) : allPosts.length < listState.total ? (
                      <div style={{ color: '#999', fontSize: '14px' }}>
                        上滑加载更多
                      </div>
                    ) : (
                      <div style={{ color: '#999', fontSize: '14px' }}>
                        没有更多帖子了
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 帖子详情模态框 */}
        <PostDetailModal
          visible={detailState.isPostDetailVisible}
          loading={detailState.detailLoading}
          post={detailState.selectedPost}
          postContent={detailState.postContent}
          isAuthenticated={status === 'authenticated'}
          currentUserId={Number(session?.user?.uid)}
          isShowOperate={true}
          likeState={
            detailState.selectedPost
              ? interactionState.postLikeStates.get(
                  detailState.selectedPost.ID
                ) || false
              : false
          }
          bookmarkState={
            detailState.selectedPost
              ? interactionState.postBookmarkStates.get(
                  detailState.selectedPost.ID
                ) || false
              : false
          }
          followingState={
            detailState.selectedPost?.user?.ID
              ? interactionState.followingStates.get(
                  detailState.selectedPost.user.ID
                ) || false
              : false
          }
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
          onLike={handleLike}
          onBookmark={handleBookmark}
          onFollow={handleFollow}
        />

        {/* 创建/编辑帖子模态框 */}
        <CreatePostModal
          visible={createState.isCreateModalVisible}
          isEditMode={createState.isEditMode}
          loading={createState.btnLoading}
          form={form}
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
            form.resetFields();
          }}
          onSubmit={handlePostSubmit}
          onEditorChange={(value) => form.setFieldValue('description', value)}
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
    </div>
  );
}
