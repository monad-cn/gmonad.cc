import { useState, useCallback } from 'react';
import { App as AntdApp } from 'antd';
import dayjs from 'dayjs';
import {
  getPosts,
  getPostsStats,
  getPostsStatus,
  likePost,
  unlikePost,
  favoritePost,
  unFavoritePost,
} from '@/pages/api/post';
import {
  PostType,
  PostsStats,
  PostListState,
  PostInteractionState,
} from '@/types/posts';

export function usePostData() {
  const { message } = AntdApp.useApp();

  // 列表状态
  const [listState, setListState] = useState<PostListState>({
    currentPage: 1,
    pageSize: 10,
    total: 0,
    posts: [],
    searchTerm: '',
    sortBy: 'desc',
    dateRange: [
      dayjs().subtract(6, 'day').startOf('day'),
      dayjs().endOf('day'),
    ],
    loading: false,
  });

  // 交互状态
  const [interactionState, setInteractionState] =
    useState<PostInteractionState>({
      postLikeStates: new Map(),
      postBookmarkStates: new Map(),
      postLikeCounts: new Map(),
      postFavoriteCounts: new Map(),
    });

  const [postsStats, setPostsStats] = useState<PostsStats | null>(null);

  // 获取帖子列表
  const fetchPosts = useCallback(
    async (params?: any) => {
      setListState((prev) => ({ ...prev, loading: true }));

      try {
        const res = await getPosts({
          keyword: params?.keyword || listState.searchTerm,
          order: params?.order || (listState.sortBy as 'asc' | 'desc'),
          page: params?.page || listState.currentPage,
          page_size: params?.page_size || listState.pageSize,
          start_date: params?.start_date || listState.startDate,
          end_date: params?.end_date || listState.endDate,
        });

        if (res.success && res.data) {
          setListState((prev) => ({
            ...prev,
            posts: res.data?.posts || [],
            total: res.data?.total || res.data?.posts?.length || 0,
          }));

          // 初始化计数
          const likeCountMap = new Map<number, number>();
          const favoriteCountMap = new Map<number, number>();
          res.data.posts.forEach((p: PostType) => {
            likeCountMap.set(p.ID, p.like_count ?? 0);
            favoriteCountMap.set(p.ID, p.favorite_count ?? 0);
          });

          setInteractionState((prev) => ({
            ...prev,
            postLikeCounts: likeCountMap,
            postFavoriteCounts: favoriteCountMap,
          }));
        }
      } catch (error) {
        message.error('获取帖子失败');
      } finally {
        setListState((prev) => ({ ...prev, loading: false }));
      }
    },
    [listState, message]
  );

  // 获取统计数据
  const fetchPostsStats = useCallback(async () => {
    try {
      const res = await getPostsStats();
      if (res.success && res.data) {
        setPostsStats(res.data);
      }
    } catch (error) {
      message.error('获取统计数据失败');
    }
  }, [message]);

  // 点赞操作
  const toggleLike = useCallback(async (postId: number, like: boolean) => {
    return like
      ? (await likePost(postId)).success
      : (await unlikePost(postId)).success;
  }, []);

  // 收藏操作
  const toggleBookmark = useCallback(
    async (postId: number, bookmark: boolean) => {
      return bookmark
        ? (await favoritePost(postId)).success
        : (await unFavoritePost(postId)).success;
    },
    []
  );

  return {
    listState,
    setListState,
    interactionState,
    setInteractionState,
    postsStats,
    fetchPosts,
    fetchPostsStats,
    toggleLike,
    toggleBookmark,
  };
}
