import type { Post as PostType, PostsStats } from '@/pages/api/post';
import dayjs from 'dayjs';
export type { PostType, PostsStats };

export interface PostListState {
  currentPage: number;
  pageSize: number;
  total: number;
  posts: PostType[];
  searchTerm: string;
  sortBy: string;
  dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null];
  startDate?: string;
  endDate?: string;
  loading: boolean;
}

export interface PostInteractionState {
  postLikeStates: Map<number, boolean>;
  postBookmarkStates: Map<number, boolean>;
  postLikeCounts: Map<number, number>;
  postFavoriteCounts: Map<number, number>;
  followingStates: Map<number, boolean>;
}

export interface CreatePostState {
  isCreateModalVisible: boolean;
  isEditMode: boolean;
  editingPost: PostType | null;
  tags: string[];
  inputVisible: boolean;
  inputValue: string;
  btnLoading: boolean;
}

export interface PostDetailState {
  isPostDetailVisible: boolean;
  selectedPost: PostType | null;
  postContent: string;
  detailLoading: boolean;
}
