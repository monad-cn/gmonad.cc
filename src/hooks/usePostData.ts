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
      followingStates: new Map(),
    });

  const [postsStats, setPostsStats] = useState<PostsStats | null>(null);

  // 获取用户帖子状态（点赞/收藏）
  const fetchPostsStatus = useCallback(async () => {
    try {
      const postIds = listState.posts.map(p => p.ID);
      if (postIds.length > 0) {
        const res = await getPostsStatus(postIds);
        if (res.success && res.data?.status && res.data?.followed) {
          setInteractionState((prev) => {
            // 保留之前的状态
            const likeMap = new Map(prev.postLikeStates);
            const favoriteMap = new Map(prev.postBookmarkStates);
            const followedMap = new Map(prev.followingStates);

            // 更新状态
            res.data.status.forEach((r) => {
              if (r.liked) likeMap.set(r.post_id, true);
              if (r.favorited) favoriteMap.set(r.post_id, r.favorited);
            });

            res.data.followed.forEach((f) => {
              followedMap.set(f, true);
            });

            return {
              ...prev,
              postLikeStates: likeMap,
              postBookmarkStates: favoriteMap,
              followingStates: followedMap
            };
          });
        }
      }
    } catch (error) {
      console.error('获取帖子状态失败:', error);
    }
  }, [listState.posts]);

  // 获取帖子列表
  const fetchPosts = useCallback(
    async (params?: {
      keyword?: string;
      order?: 'asc' | 'desc';
      page?: number;
      page_size?: number;
      start_date?: string;
      end_date?: string;
    }) => {
      setListState((prev) => ({ ...prev, loading: true }));

      try {
        const res = await getPosts(params);

        if (res.success && res.data) {
          setListState((prev) => ({
            ...prev,
            posts: res.data?.posts || [],
            total: res.data?.total || res.data?.posts?.length || 0,
          }));

          // 更新计数，保留之前的状态
          setInteractionState((prev) => {
            const likeCountMap = new Map(prev.postLikeCounts);
            const favoriteCountMap = new Map(prev.postFavoriteCounts);

            // 更新新获取的帖子的计数
            res.data.posts.forEach((p: PostType) => {
              likeCountMap.set(p.ID, p.like_count ?? 0);
              favoriteCountMap.set(p.ID, p.favorite_count ?? 0);
            });

            return {
              ...prev,
              postLikeCounts: likeCountMap,
              postFavoriteCounts: favoriteCountMap,
            };
          });
        }
      } catch (error) {
        message.error('获取帖子失败');
      } finally {
        setListState((prev) => ({ ...prev, loading: false }));
      }
    },
    [message]
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
    fetchPostsStatus,
    toggleLike,
    toggleBookmark,
  };
}
