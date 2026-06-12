import { apiRequest } from './api';

export const NEWSLETTER_CATEGORY = 'newsletter';

export interface NewsletterParams {
  title: string;
  description: string;
  content: string;
  cover_img: string;
  source_link: string;
  source_type?: string;
  tags: string[];
  author: string;
  translator: string;
}

export interface GetNewslettersParams {
  keyword?: string;
  tag?: string;
  order?: 'asc' | 'desc';
  page?: number;
  user_id?: number;
  page_size?: number;
  author?: string;
  translator?: string;
  publish_status?: number;
  publish_time?: string;
}

export interface NewsletterUser {
  ID: number;
  email: string;
  username: string;
  avatar: string;
  github: string;
}

export interface Newsletter {
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
  publisher?: NewsletterUser;
  publisher_id?: number;
  view_count?: number;
}

interface RawPaginatedNewsletterData {
  blogs?: Newsletter[];
  newsletters?: Newsletter[];
  page: number;
  page_size: number;
  total: number;
}

export interface PaginatedNewsletterData {
  newsletters: Newsletter[];
  page: number;
  page_size: number;
  total: number;
}

export interface NewsletterListResult {
  success: boolean;
  message: string;
  data?: PaginatedNewsletterData;
}

export interface NewsletterResult {
  success: boolean;
  message: string;
  data?: Newsletter;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '网络错误，请稍后重试';

// 周报复用后端内容表，通过 category 固定隔离为 newsletter。
export const createNewsletter = async (
  params: NewsletterParams
): Promise<NewsletterResult> => {
  try {
    const body = {
      title: params.title.trim(),
      desc: params.description.trim(),
      content: params.content,
      category: NEWSLETTER_CATEGORY,
      source_link: params.source_link,
      source_type: params.source_type ?? 'official',
      cover_img: params.cover_img,
      tags: params.tags ?? [],
      author: params.author ?? '',
      translator: params.translator ?? '',
    };

    const response = await apiRequest<NewsletterResult>('/blogs', 'POST', body);

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '周报创建成功',
        data: response.data as unknown as Newsletter,
      };
    }

    return { success: false, message: response.message ?? '周报创建失败' };
  } catch (error: unknown) {
    console.error('创建周报异常:', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

export const updateNewsletter = async (
  newsletterId: string,
  params: NewsletterParams
): Promise<NewsletterResult> => {
  try {
    const body = {
      title: params.title.trim(),
      desc: params.description.trim(),
      content: params.content,
      category: NEWSLETTER_CATEGORY,
      source_link: params.source_link,
      cover_img: params.cover_img,
      tags: params.tags ?? [],
      author: params.author ?? '',
      translator: params.translator ?? '',
    };

    const response = await apiRequest<NewsletterResult>(
      `/blogs/${newsletterId}`,
      'PUT',
      body
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '周报更新成功',
        data: response.data as unknown as Newsletter,
      };
    }

    return { success: false, message: response.message ?? '周报更新失败' };
  } catch (error: unknown) {
    console.error('更新周报异常:', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

export const getNewsletters = async (
  params: GetNewslettersParams = {}
): Promise<NewsletterListResult> => {
  try {
    const query = new URLSearchParams();

    if (params.keyword?.trim()) query.append('keyword', params.keyword.trim());
    if (params.tag?.trim()) query.append('tag', params.tag.trim());
    if (params.publish_status != null) {
      query.append('publish_status', params.publish_status.toString());
    }
    if (params.user_id != null) query.append('user_id', params.user_id.toString());

    query.append('category', NEWSLETTER_CATEGORY);
    query.append('order', params.order ?? 'desc');
    query.append('page', (params.page ?? 1).toString());
    query.append('page_size', (params.page_size ?? 6).toString());

    const response = await apiRequest<RawPaginatedNewsletterData>(
      `/blogs?${query.toString()}`,
      'GET'
    );

    if (response.code === 200 && response.data) {
      const newsletters = response.data.newsletters ?? response.data.blogs ?? [];

      return {
        success: true,
        message: response.message ?? '获取周报列表成功',
        data: {
          newsletters,
          page: response.data.page,
          page_size: response.data.page_size,
          total: response.data.total,
        },
      };
    }

    return { success: false, message: response.message ?? '获取周报列表失败' };
  } catch (error: unknown) {
    console.error('获取周报列表异常:', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

export const getNewsletterById = async (
  newsletterId: string
): Promise<NewsletterResult> => {
  try {
    if (!newsletterId) {
      return { success: false, message: '周报ID不能为空' };
    }

    const response = await apiRequest<NewsletterResult>(
      `/blogs/${newsletterId}`,
      'GET'
    );

    if (response.code === 200 && response.data) {
      const newsletter = response.data as unknown as Newsletter;
      if (newsletter.category !== NEWSLETTER_CATEGORY) {
        return { success: false, message: '周报不存在' };
      }

      return {
        success: true,
        message: response.message ?? '获取周报成功',
        data: newsletter,
      };
    }

    return { success: false, message: response.message ?? '获取周报失败' };
  } catch (error: unknown) {
    console.error('获取周报异常:', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

export const deleteNewsletter = async (
  newsletterId: number
): Promise<NewsletterResult> => {
  try {
    const response = await apiRequest<NewsletterResult>(
      `/blogs/${newsletterId}`,
      'DELETE'
    );

    if (response.code === 200) {
      return { success: true, message: response.message ?? '周报删除成功' };
    }

    return { success: false, message: response.message ?? '周报删除失败' };
  } catch (error: unknown) {
    console.error('删除周报异常:', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

export const updateNewsletterPublishStatus = async (
  newsletterId: string,
  publishStatus: number
): Promise<NewsletterResult> => {
  try {
    const response = await apiRequest<NewsletterResult>(
      `/blogs/${newsletterId}/status`,
      'PUT',
      { publish_status: publishStatus }
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '周报状态更新成功',
        data: response.data as unknown as Newsletter,
      };
    }

    return { success: false, message: response.message ?? '周报状态更新失败' };
  } catch (error: unknown) {
    console.error('更新周报状态异常:', error);
    return { success: false, message: getErrorMessage(error) };
  }
};
