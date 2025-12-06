import { apiRequest } from './api';

// 创建教程请求参数接口
export interface CreateTutorialParams {
  title: string;
  description: string;
  content: string;
  author: string;
  source_link: string;
  cover_img: string;
  tags: string[];
  dapp_id: number;
}

export interface UpdateTutorialParams {
  title: string;
  description: string;
  content: string;
  source_link: string;
  cover_img: string;
  author: string;
  tags: string[];
  dapp_id: number;
}

export interface GetTutorialsParams {
  keyword?: string;
  tag?: string;
  order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
  publish_status?: number;
  dapp_id?: number;
  user_id?: number;
}

// 关联 User
export interface User {
  ID: number;
  email: string;
  username: string;
  avatar: string;
  github: string;
}

// 关联 Dapp
export interface Dapp {
  ID: number;
  name: string;
  description: string;
  logo: string;
  site: string;
  x: string;
}

// 教程主模型
export interface Tutorial {
  ID: number;
  title: string;
  description: string;
  content: string;
  source_link: string;
  author: string;
  cover_img: string;
  tags: string[];
  publisher_id?: number;
  publisher?: User;
  publish_time?: string;
  publish_status: number;
  dapp_id: number;
  dapp?: Dapp;
  view_count?: number;
  CreatedAt: string;
  UpdatedAt: string;
}

// 分页返回数据结构
export interface PaginatedTutorialData {
  tutorials: Tutorial[];
  page: number;
  page_size: number;
  total: number;
}

// 统一结果结构
export interface TutorialListResult {
  success: boolean;
  message: string;
  data?: PaginatedTutorialData;
}

export interface TutorialResult {
  success: boolean;
  message: string;
  data?: Tutorial;
}

// 创建教程
export const createTutorial = async (
  params: CreateTutorialParams
): Promise<TutorialResult> => {
  try {
    const body = {
      title: params.title.trim(),
      desc: params.description.trim(),
      content: params.content.trim(),
      author: params.author.trim(),
      source_link: params.source_link,
      cover_img: params.cover_img,
      tags: params.tags ?? [],
      dapp_id: params.dapp_id,
    };

    const response = await apiRequest<TutorialResult>(
      '/tutorials',
      'POST',
      body
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: '教程创建成功',
        data: response.data as unknown as Tutorial,
      };
    }

    return { success: false, message: '教程创建失败' };
  } catch (error: any) {
    console.error('创建教程异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 更新教程
export const updateTutorial = async (
  tutorialId: string,
  params: UpdateTutorialParams
): Promise<TutorialResult> => {
  try {
    const body = {
      title: params.title.trim(),
      desc: params.description.trim(),
      content: params.content.trim(),
      author: params.author.trim(),
      source_link: params.source_link,
      cover_img: params.cover_img,
      tags: params.tags ?? [],
      dapp_id: params.dapp_id,
    };

    const response = await apiRequest<TutorialResult>(
      `/tutorials/${tutorialId}`,
      'PUT',
      body
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '教程更新成功',
        data: response.data as unknown as Tutorial,
      };
    }

    return { success: false, message: response.message ?? '教程更新失败' };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 获取教程列表
export const getTutorials = async (
  params: GetTutorialsParams = {}
): Promise<TutorialListResult> => {
  try {
    const query = new URLSearchParams();

    if (params.keyword?.trim()) query.append('keyword', params.keyword.trim());
    if (params.tag?.trim()) query.append('tag', params.tag.trim());
    if (params.publish_status != null)
      query.append('publish_status', params.publish_status.toString());
    if (params.dapp_id != null)
      query.append('dapp_id', params.dapp_id.toString());
    if (params.user_id != null)
      query.append('user_id', params.user_id.toString());

    query.append('order', params.order ?? 'desc');
    query.append('page', (params.page ?? 1).toString());
    query.append('page_size', (params.page_size ?? 6).toString());

    const response = await apiRequest<TutorialListResult>(
      `/tutorials?${query.toString()}`,
      'GET'
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '获取教程列表成功',
        data: response.data as unknown as PaginatedTutorialData,
      };
    }

    return { success: false, message: response.message ?? '获取教程列表失败' };
  } catch (error: any) {
    console.error('获取教程列表异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 根据 ID 获取教程
export const getTutorialById = async (
  tutorialId: string
): Promise<TutorialResult> => {
  try {
    if (!tutorialId) {
      return { success: false, message: '教程ID不能为空' };
    }

    const response = await apiRequest<TutorialResult>(
      `/tutorials/${tutorialId}`,
      'GET'
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '获取教程成功',
        data: response.data as unknown as Tutorial,
      };
    }

    return { success: false, message: response.message ?? '获取教程失败' };
  } catch (error: any) {
    console.error('获取教程异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 删除教程
export const deleteTutorial = async (
  tutorialId: number
): Promise<TutorialResult> => {
  try {
    const response = await apiRequest<TutorialResult>(
      `/tutorials/${tutorialId}`,
      'DELETE'
    );

    if (response.code === 200) {
      return { success: true, message: response.message ?? '删除成功' };
    }

    return { success: false, message: response.message ?? '删除失败' };
  } catch (error: any) {
    console.error('删除教程异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

// 更新教程发布状态
export const updateTutorialPublishStatus = async (
  tutorialId: string,
  publishStatus: number
): Promise<TutorialResult> => {
  try {
    const body = {
      publish_status: publishStatus,
    };

    const response = await apiRequest<TutorialResult>(
      `/tutorials/${tutorialId}/status`,
      'PUT',
      body
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '教程状态更新成功',
        data: response.data as unknown as Tutorial,
      };
    }

    return { success: false, message: response.message ?? '教程状态更新失败' };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};
