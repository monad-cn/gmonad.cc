// Google Analytics 数据获取服务
import { AnalyticsData, AnalyticsTrendData } from '@/pages/api/stats';

// 定义扩展的分析数据类型
export interface ExtendedAnalyticsData {
  overview: AnalyticsData;
  trend: AnalyticsTrendData[];
  topPages?: Array<{
    page: string;
    pageViews: number;
  }>;
  demographics?: {
    countries: Array<{ country: string; users: number }>;
    devices: Array<{ device: string; sessions: number }>;
  };
  source?: 'ga4' | 'ua';
}

// 使用 Google Analytics Reporting API v4 (需要服务端实现)
// 或者使用 gtag 获取基本数据

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'get',
      targetId: string,
      config?: any
    ) => void;
    dataLayer?: Object[] | undefined;
  }
}

// 获取GA配置的属性ID
function getGAPropertyId(): string | null {
  return process.env.NEXT_PUBLIC_GA_ID || null;
}

// Google Analytics Reporting API 实现
// 支持GA4和Universal Analytics，带有自动降级和错误处理
export async function getAnalyticsDataFromAPI(
  startDate: string = '7daysAgo',
  endDate: string = 'today',
  options?: {
    metrics?: string[];
    dimensions?: string[];
    includeTopPages?: boolean;
    includeDemographics?: boolean;
  }
): Promise<ExtendedAnalyticsData> {
  const propertyId = getGAPropertyId();
  if (!propertyId) {
    throw new Error('GA Property ID not configured');
  }

  try {
    console.log('Fetching analytics data for period:', { startDate, endDate });
    
    const response = await fetch('/api/analytics/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyId,
        startDate,
        endDate,
        metrics: options?.metrics,
        dimensions: options?.dimensions,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Analytics API error: ${response.status} - ${errorText}`);
      throw new Error(`Analytics API returned ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      console.error('Analytics API returned error:', result.error);
      throw new Error(result.error || 'Unknown analytics API error');
    }

    console.log('Analytics data fetched successfully from:', result.source || 'unknown source');
    
    return {
      overview: result.data.overview,
      trend: result.data.trend,
      topPages: result.data.topPages,
      demographics: result.data.demographics,
      source: result.source
    };

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
}

// 获取实时数据的增强版本
export async function getRealTimeAnalytics(): Promise<{
  activeUsers: number;
  activePages: Array<{ page: string; activeUsers: number }>;
  currentPageViews: number;
  source: 'ga4';
}> {
  const propertyId = getGAPropertyId();
  if (!propertyId) {
    throw new Error('GA Property ID not configured');
  }

  try {
    // TODO: Implement GA4 real-time API call
    throw new Error('Real-time analytics not implemented yet');
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    throw error;
  }
}

// 导出便捷的数据获取函数，保持向后兼容
export { getRealTimeAnalytics as getRealTimeData };