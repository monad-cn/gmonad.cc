import { apiRequest } from './api';

export interface CreateFeedbackParams {
  content: string;
  url: string;
  email: string;
}

export interface Feedback {
  content?: string;
  url?: string;
  email?: string;
  user?: User;
}

// 关联 User
export interface User {
  ID: number;
  email: string;
  username: string;
  avatar: string;
  github: string;
}

// 分页返回数据结构
export interface PaginatedFeedbackData {
  feedbacks: Feedback[];
  page: number;
  page_size: number;
  total: number;
}

export interface FeedbackListResult {
  success: boolean;
  message: string;
  data?: PaginatedFeedbackData;
}

export interface FeedbackResult {
  success: boolean;
  message: string;
  data?: Feedback;
}

// 创建教程
export const createFeedback = async (
  params: CreateFeedbackParams
): Promise<FeedbackResult> => {
  try {
    const body = {
      content: params.content.trim(),
      url: params.url.trim(),
      email: params.email.trim(),
    };

    const response = await apiRequest<FeedbackResult>(
      '/feedbacks',
      'POST',
      body
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: '创建成功',
        data: response.data as unknown as Feedback,
      };
    }

    return { success: false, message: '创建失败' };
  } catch (error: any) {
    console.error('创建异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 获取教程列表
export const getTFeedbacks= async (
  params: GetFeedbacksParams = {}
): Promise<FeedbackListResult> => {
  try {
    const query = new URLSearchParams();
    query.append('order', params.order ?? 'desc');
    query.append('page', (params.page ?? 1).toString());
    query.append('page_size', (params.page_size ?? 6).toString());

    const response = await apiRequest<FeedbackListResult>(
      `/feedbacks?${query.toString()}`,
      'GET'
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '获取列表成功',
        data: response.data as unknown as PaginatedFeedbackData,
      };
    }

    return { success: false, message: response.message ?? '获取列表失败' };
  } catch (error: any) {
    console.error('获取列表异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};
