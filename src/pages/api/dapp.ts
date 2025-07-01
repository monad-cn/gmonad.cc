import { apiRequest } from './api';

// 创建事件请求参数接口
export interface CreateDappParams {
  name: string;
  description: string;
  category_id: number;
  cover_img: string;
  logo: string;
  tags: string[];
  x: string;
  site: string;
}

export interface GetDappsParams {
  keyword?: string;
  tag?: string;
  category?: string;
  order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface Dapp {
  name: string;
  description: string;
  category: string;
  cover_img: string;
  logo: string;
  tags: string[];
  x: string;
  site: string;
}

// 分页返回数据结构
export interface PaginatedDappData {
  dapps: Dapp[];
  page: number;
  page_size: number;
  total: number;
}

// 统一结果结构
export interface DappListResult {
  success: boolean;
  message: string;
  data?: PaginatedDappData;
}

export interface DappResult {
  success: boolean;
  message: string;
  data?: Dapp;
}

export const createDapp = async (
  params: CreateDappParams
): Promise<DappResult> => {
  try {
    const body = {
      name: params.name.trim(),
      description: params.description.trim(),
      category_id: params.category_id,
      x: params.x.trim(),
      site: params.x.trim(),
      cover_img: params.cover_img,
      logo: params.logo,
      tags: params.tags ?? [],
    };

    const response = await apiRequest<DappResult>('/dapps', 'POST', body);

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: 'Dapp添加成功',
        data: response.data as unknown as Dapp,
      };
    }

    return { success: false, message: 'Dapp 添加出错' };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

export const getDapps = async (
  params: GetDappsParams = {}
): Promise<DappListResult> => {
  try {
    const query = new URLSearchParams();

    if (params.keyword?.trim()) query.append('keyword', params.keyword.trim());
    if (params.tag?.trim()) query.append('tag', params.tag.trim());
      if (params.category?.trim()) query.append('category',  params.category.trim());
    query.append('order', params.order ?? 'desc');
    query.append('page', (params.page ?? 1).toString());
    query.append('page_size', (params.page_size ?? 6).toString());

    const response = await apiRequest<DappListResult>(
      `/dapps?${query.toString()}`,
      'GET'
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '获取Dapp列表成功',
        data: response.data as unknown as PaginatedDappData,
      };
    }

    return { success: false, message: response.message ?? '获取Dapp列表失败'};
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

export const getDappById = async (dappId: string): Promise<DappResult> => {
  try {
    if (!dappId) {
      return { success: false, message: 'ID不能为空' };
    }

    const response = await apiRequest<DappResult>(`/dapps/${dappId}`, 'GET');

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '获取Dapp成功',
        data: response.data as unknown as Dapp,
      };
    }

    return { success: false, message: response.message ?? '获取Dapp失败' };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};

export const deleteDapp = async (dappId: number): Promise<DappResult> => {
  try {
    const response = await apiRequest<DappResult>(`/dapps/${dappId}`, 'DELETE');

    if (response.code === 200) {
      return { success: true, message: response.message ?? '删除成功' };
    }

    return { success: false, message: response.message ?? '删除失败' };
  } catch (error: any) {
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

// categories
export interface GetCategoriesParams {
  keyword?: string;
  parent_id?: number;
  order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface CategoryListResult {
  success: boolean;
  message: string;
  data?: PaginatedCategoryData;
}

// 分页返回数据结构
export interface PaginatedCategoryData {
  categories: Category[];
  page: number;
  page_size: number;
  total: number;
}

export interface Category {
  name: string;
  desc: string;
  full_name: string;
  parent_id: number;
  children: Category[];
}

export const getCategories = async (
  params: GetCategoriesParams = {}
): Promise<CategoryListResult> => {
  try {
    const query = new URLSearchParams();
    if (params.keyword?.trim()) query.append('keyword', params.keyword.trim());
    if (params.parent_id) query.append('parent_id', params.parent_id.toString());
    query.append('order', params.order ?? 'desc');
    query.append('page', (params.page ?? 1).toString());
    query.append('page_size', (params.page_size ?? 12).toString());

    const response = await apiRequest<CategoryListResult>(
      `/dapps/categories?${query.toString()}`,
      'GET'
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '获取分类成功',
        data: response.data as unknown as PaginatedCategoryData,
      };
    }

    return { success: false, message: response.message ?? '获取分类出错'};
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};