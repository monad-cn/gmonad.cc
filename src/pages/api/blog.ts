import { apiRequest } from './api';

// 创建事件请求参数接口
export interface CreateBlogParams {
  title: string;
  description: string;
  content: string;
  category: string;
  cover_img: string;
  source_link: string;
  tags: string[];
  author: string;
  translator: string;
}

export interface UpdateBlogParams {
  title: string;
  description: string;
  content: string;
  category: string | 'blog';
  source_link: string;
  cover_img: string;
  tags: string[];
  author: string;
  translator: string;
}

export interface GetBlogsParams {
  keyword?: string;
  tag?: string;
  order?: 'asc' | 'desc';
  page?: number;
  user_id?: number;
  page_size?: number;
  category?: string;
  author?: string;
  translator?: string;
  publish_status?: number;
  publish_time?: string;
}

export interface User {
  ID: number;
  email: string;
  username: string;
  avatar: string;
  github: string;
}

export interface Blog {
  ID: number;
  title: string;
  CreatedAt: string;
  UpdatedAt: string;
  description: string;
  content: string;
  source_link: string;
  cover_img: string;
  category: string;
  author: string;
  translator: string;
  tags: string[];
  publish_status?: number;
  publish_time?: string;
  publisher?: User;
  publisher_id?: number;
  view_count?: number;
}

// 分页返回数据结构
export interface PaginatedBlogData {
  blogs: Blog[];
  page: number;
  page_size: number;
  total: number;
}

// 统一结果结构
export interface BlogListResult {
  success: boolean;
  message: string;
  data?: PaginatedBlogData;
}

export interface BlogResult {
  success: boolean;
  message: string;
  data?: Blog;
}

export const createBlog = async (
  params: CreateBlogParams
): Promise<BlogResult> => {
  try {
    const body = {
      title: params.title.trim(),
      desc: params.description.trim(),
      content: params.content,
      category: 'blog',
      source_link: params.source_link,
      cover_img: params.cover_img,
      tags: params.tags ?? [],
      author: params.author ?? '',
      translator: params.translator ?? '',
    };

    const response = await apiRequest<BlogResult>('/blogs', 'POST', body);

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: '博客创建成功',
        data: response.data as unknown as Blog,
      };
    }

    return { success: false, message: '博客创建出错' };
  } catch (error: any) {
    console.error('博客活动异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

export const updateBlog = async (
  blogId: string,
  params: UpdateBlogParams
): Promise<BlogResult> => {
  try {
    const body = {
      title: params.title.trim(),
      desc: params.description.trim(),
      content: params.content,
      category: 'blog',
      source_link: params.source_link,
      cover_img: params.cover_img,
      tags: params.tags ?? [],
      author: params.author ?? '',
      translator: params.translator ?? '',
    };

    const response = await apiRequest<BlogResult>(
      `/blogs/${blogId}`,
      'PUT',
      body
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '博客更新成功',
        data: response.data as unknown as Blog,
      };
    }

    return { success: false, message: response.message ?? '博客更新失败' };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

export const getBlogs = async (
  params: GetBlogsParams = {}
): Promise<BlogListResult> => {
  try {
    const query = new URLSearchParams();

    if (params.keyword?.trim()) query.append('keyword', params.keyword.trim());
    if (params.tag?.trim()) query.append('tag', params.tag.trim());
    if (params.publish_status != null)
      query.append('publish_status', params.publish_status.toString());
    if (params.user_id != null)
      query.append('user_id', params.user_id.toString());

    query.append('category', 'blog');
    query.append('order', params.order ?? 'desc');
    query.append('page', (params.page ?? 1).toString());
    query.append('page_size', (params.page_size ?? 6).toString());

    const response = await apiRequest<BlogListResult>(
      `/blogs?${query.toString()}`,
      'GET'
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '获取博客列表成功',
        data: response.data as unknown as PaginatedBlogData,
      };
    }

    return { success: false, message: response.message ?? '获取博客列表失败' };
  } catch (error: any) {
    console.error('获取博客列表异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

export const getBlogById = async (blogId: string): Promise<BlogResult> => {
  try {
    if (!blogId) {
      return { success: false, message: '博客ID不能为空' };
    }

    const response = await apiRequest<BlogResult>(`/blogs/${blogId}`, 'GET');

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '获取博客成功',
        data: response.data as unknown as Blog,
      };
    }

    return { success: false, message: response.message ?? '获取博客失败' };
  } catch (error: any) {
    console.error('获取博客异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 删除事件
export const deleteBlog = async (blogId: number): Promise<BlogResult> => {
  try {
    const response = await apiRequest<BlogResult>(`/blogs/${blogId}`, 'DELETE');

    if (response.code === 200) {
      return { success: true, message: response.message ?? '删除成功' };
    }

    return { success: false, message: response.message ?? '删除失败' };
  } catch (error: any) {
    console.error('删除博客异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 工具函数：格式化日期时间
export const formatDateTime = (date: any, time: any): string => {
  try {
    if (!date || !time) return '';

    if (
      typeof date?.format === 'function' &&
      typeof time?.format === 'function'
    ) {
      return `${date.format('YYYY-MM-DD')} ${time.format('HH:mm:ss')}`;
    }

    if (date instanceof Date && time instanceof Date) {
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = time.toTimeString().split(' ')[0];
      return `${dateStr} ${timeStr}`;
    }

    if (typeof date === 'string' && typeof time === 'string') {
      return `${date} ${time}`;
    }

    return '';
  } catch (error) {
    console.error('格式化日期时间失败:', error);
    return '';
  }
};

export const updateBlogPublishStatus = async (
  blogId: string,
  publishStatus: number
): Promise<BlogResult> => {
  try {
    const body = {
      publish_status: publishStatus,
    };

    const response = await apiRequest<BlogResult>(
      `/blogs/${blogId}/status`,
      'PUT',
      body
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '博客状态更新成功',
        data: response.data as unknown as Blog,
      };
    }

    return { success: false, message: response.message ?? '博客状态更新失败' };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};
