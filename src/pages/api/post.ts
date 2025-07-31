import Twitter from 'next-auth/providers/twitter';
import { apiRequest } from './api';

// 用户信息
export interface User {
  ID: number;
  username: string;
  avatar: string;
  post_count: number;
}

// 帖子主模型
export interface Post {
  twitter: string | undefined;
  ID: number;
  title: string;
  description: string;
  tags: string[];
  view_count: number;
  user?: User;
  CreatedAt: string;
  UpdatedAt: string;
}

// 创建帖子参数
export interface CreatePostParams {
  title: string;
  description: string;
  tags: string[];
  twitter: string;
}

// 更新帖子参数
export interface UpdatePostParams {
  title: string;
  description: string;
  tags: string[];
  twitter: string;
}

// 获取帖子列表参数
export interface GetPostsParams {
  keyword?: string;
  tag?: string;
  order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
  user_id?: number;
  start_date?: string;
  end_date?: string;
}

// 分页返回数据结构
export interface PaginatedPostData {
  posts: Post[];
  page: number;
  page_size: number;
  total: number;
}

// 统一返回结构
export interface PostListResult {
  success: boolean;
  message: string;
  data?: PaginatedPostData;
}

export interface PostResult {
  success: boolean;
  message: string;
  data?: Post;
}

// 创建帖子
export const createPost = async (
  params: CreatePostParams
): Promise<PostResult> => {
  try {
    const body = {
      title: params.title.trim(),
      description: params.description.trim(),
      tags: params.tags ?? [],
      twitter: params.twitter?.trim(),
    };

    const response = await apiRequest<PostResult>(
      '/posts',
      'POST',
      body
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: '帖子创建成功',
        data: response.data as unknown as Post,
      };
    }

    return { success: false, message: '帖子创建失败' };
  } catch (error: any) {
    console.error('创建帖子异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 更新帖子
export const updatePost = async (
  postId: string,
  params: UpdatePostParams
): Promise<PostResult> => {
  try {
    const body = {
      title: params.title.trim(),
      description: params.description.trim(),
      tags: params.tags ?? [],
      twitter: params.twitter?.trim(),
    };

    const response = await apiRequest<PostResult>(
      `/posts/${postId}`,
      'PUT',
      body
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '帖子更新成功',
        data: response.data as unknown as Post,
      };
    }

    return { success: false, message: response.message ?? '帖子更新失败' };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 获取帖子列表
export const getPosts = async (
  params: GetPostsParams = {}
): Promise<PostListResult> => {
  try {
    const query = new URLSearchParams();

    if (params.keyword?.trim()) query.append('keyword', params.keyword.trim());
    if (params.tag?.trim()) query.append('tag', params.tag.trim());
    if (params.start_date?.trim()) query.append('start_date', params.start_date.trim());
    if (params.end_date?.trim()) query.append('end_date', params.end_date.trim());

    if (params.user_id != null)
      query.append('user_id', params.user_id.toString());


    query.append('order', params.order ?? 'desc');
    query.append('page', (params.page ?? 1).toString());
    query.append('page_size', (params.page_size ?? 6).toString());

    const response = await apiRequest<PostListResult>(
      `/posts?${query.toString()}`,
      'GET'
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '获取帖子列表成功',
        data: response.data as unknown as PaginatedPostData,
      };
    }

    return { success: false, message: response.message ?? '获取帖子列表失败' };
  } catch (error: any) {
    console.error('获取帖子列表异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 根据 ID 获取帖子
export const getPostById = async (
  postId: string
): Promise<PostResult> => {
  try {
    if (!postId) {
      return { success: false, message: '帖子ID不能为空' };
    }

    const response = await apiRequest<PostResult>(
      `/posts/${postId}`,
      'GET'
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '获取帖子成功',
        data: response.data as unknown as Post,
      };
    }

    return { success: false, message: response.message ?? '获取帖子失败' };
  } catch (error: any) {
    console.error('获取帖子异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 删除帖子
export const deletePost = async (
  postId: number
): Promise<PostResult> => {
  try {
    const response = await apiRequest<PostResult>(
      `/posts/${postId}`,
      'DELETE'
    );

    if (response.code === 200) {
      return { success: true, message: response.message ?? '删除成功' };
    }

    return { success: false, message: response.message ?? '删除失败' };
  } catch (error: any) {
    console.error('删除帖子异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};


// 返回的统计数据结构
export interface PostsStats {
  total_posts: number;       // 总帖子数
  active_user_count: number;      // 活跃用户数（发帖用户数）
  weekly_post_count: number;   // 本周帖子数
  top_active_users: User[];         // 活跃用户列表，假设是用户数组（可根据后端调整）
  weekly_hot_posts: Post[];    // 本周热门帖子列表
  all_time_hot_posts: Post[];     // 总热门帖子列表
}

// 统一返回结构
export interface PostsStatsResult {
  success: boolean;
  message: string;
  data?: PostsStats;
}

// 调用获取统计数据接口
export const getPostsStats = async (): Promise<PostsStatsResult> => {
  try {
    const response = await apiRequest<PostsStatsResult>('/posts/stats', 'GET');
    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '获取帖子统计成功',
        data: response.data as unknown as PostsStats,
      };
    }
    return { success: false, message: response.message ?? '获取帖子统计失败' };
  } catch (error: any) {
    console.error('获取帖子统计异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};
