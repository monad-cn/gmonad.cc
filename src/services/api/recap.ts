import { apiRequest } from './api';

// 回顾模型
export interface Recap {
  ID: number;
  content: string;
  video: string;
  recording: string;
  twitter: string;
  event_id: number;
  CreatedAt: string;
  UpdatedAt: string;
}

// 创建回顾参数
export interface CreateRecapParams {
  content: string;
  video: string;
  recording: string;
  twitter: string;
  event_id: number;
}

// 更新回顾参数
export interface UpdateRecapParams {
  content: string;
  video: string;
  recording: string;
  twitter: string;
}

// 返回结构
export interface RecapResult {
  success: boolean;
  message: string;
  data?: Recap;
}

// 创建回顾
export const createRecap = async (
  params: CreateRecapParams
): Promise<RecapResult> => {
  try {
    const body = {
      content: params.content.trim(),
      video: (params.video ?? '').trim(),
      recording: (params.recording ?? '').trim(),
      twitter: (params.twitter ?? '').trim(),
      event_id: params.event_id,
    };

    const response = await apiRequest<RecapResult>(
      '/events/recap',
      'POST',
      body
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: '活动回顾创建成功',
        data: response.data as unknown as Recap,
      };
    }

    return { success: false, message: response.message ?? '创建失败' };
  } catch (error: any) {
    console.error('创建回顾异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 更新回顾
export const updateRecap = async (
  recapId: string,
  params: UpdateRecapParams
): Promise<RecapResult> => {
  try {
    const body = {
      content: params.content.trim(),
      video: params.video.trim(),
      recording: params.recording.trim(),
      twitter: params.twitter.trim(),
    };

    const response = await apiRequest<RecapResult>(
      `/events/recap/${recapId}`,
      'PUT',
      body
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '更新成功',
        data: response.data as unknown as Recap,
      };
    }

    return { success: false, message: response.message ?? '更新失败' };
  } catch (error: any) {
    console.error('更新回顾异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 根据活动 ID 获取回顾
export const getRecapByEventId = async (
  eventId: string
): Promise<RecapResult> => {
  try {
    const response = await apiRequest<RecapResult>(
      `/events/recap?event_id=${eventId}`,
      'GET'
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '获取成功',
        data: response.data as unknown as Recap,
      };
    }

    return { success: false, message: response.message ?? '获取失败' };
  } catch (error: any) {
    console.error('获取回顾异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 删除回顾
export const deleteRecap = async (recapId: number): Promise<RecapResult> => {
  try {
    const response = await apiRequest<RecapResult>(
      `/events/recap/${recapId}`,
      'DELETE'
    );

    if (response.code === 200) {
      return { success: true, message: response.message ?? '删除成功' };
    }

    return { success: false, message: response.message ?? '删除失败' };
  } catch (error: any) {
    console.error('删除回顾异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};
