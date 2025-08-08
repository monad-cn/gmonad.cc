import { apiRequest } from './api';

// StatsOverview 类型定义
export interface CategoryStats {
  total: number;
  new_this_Week: number;
  new_this_Month: number;
  weekly_growth: number;
  monthly_growth: number;
}

export interface StatsOverview {
  users: CategoryStats;
  blogs: CategoryStats;
  tutorials: CategoryStats;
  events: CategoryStats;
  posts: CategoryStats;
}

export interface TimeSeriesData {
    date: string
    users: number
    blogs: number
    tutorials: number
    events: number
    posts: number
}


export interface StatsResponse {
  overview: StatsOverview;
  trend: TimeSeriesData[];
}

// 返回结构
export interface StatsResult {
  success: boolean;
  message: string;
  data?: StatsResponse;
}


// 获取统计概览
export const getStatsOverview = async (): Promise<StatsResult> => {
  try {
    const response = await apiRequest<StatsResult>(
      '/stats',
      'GET'
    );

    if (response.code === 200 && response.data) {
      return {
        success: true,
        message: response.message ?? '获取成功',
        data: response.data as unknown as StatsResponse,
      };
    }

    return {
      success: false,
      message: response.message ?? '获取统计失败',
    };
  } catch (error: any) {
    console.error('获取统计概览异常:', error);
    return {
      success: false,
      message: error?.message ?? '网络错误，请稍后重试',
    };
  }
};