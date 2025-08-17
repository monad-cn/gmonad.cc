import { NextApiRequest, NextApiResponse } from 'next';
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


// Google Analytics 数据类型定义
export interface AnalyticsData {
  pageViews: number;
  users: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  newUsers: number;
  returningUsers: number;
  events: number;
}

export interface AnalyticsTrendData {
  date: string;
  pageViews: number;
  users: number;
  sessions: number;
  events: number;
}

export interface AnalyticsResult {
  success: boolean;
  message: string;
  data?: {
    overview: AnalyticsData;
    trend: AnalyticsTrendData[];
  };
}

// 获取Google Analytics数据
export const getAnalyticsData = async (
  startDate: string = '7daysAgo', 
  endDate: string = 'today'
): Promise<AnalyticsResult> => {
  try {
    const propertyId = process.env.NEXT_PUBLIC_GA_ID;
    
    if (!propertyId) {
      throw new Error('Google Analytics ID not configured');
    }

    // 调用后端API获取真实的Google Analytics数据
    const response = await fetch('/api/analytics/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyId,
        startDate,
        endDate,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Analytics API request failed:', response.status, errorText);
      throw new Error(`Analytics API request failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        success: true,
        message: '获取运营数据成功',
        data: result.data,
      };
    } else {
      console.error('Analytics API returned error:', result.error);
      throw new Error(result.error || 'Analytics API error');
    }
  } catch (error: any) {
    console.error('获取Analytics数据异常:', error);
    throw error;
  }
};


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

// Next.js API handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 调用内部API获取统计数据
    const result = await getStatsOverview();
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error: any) {
    console.error('Stats API error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}