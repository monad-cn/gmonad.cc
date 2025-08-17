// Google Analytics 数据获取服务
import { AnalyticsData, AnalyticsTrendData } from '@/pages/api/stats';

// 定义扩展的分析数据类型
export interface ExtendedAnalyticsData {
  overview: AnalyticsData;
  trend: AnalyticsTrendData[];
  topPages?: Array<{
    page: string;
    pageViews: number;
    uniquePageViews: number;
  }>;
  demographics?: {
    countries: Array<{ country: string; users: number }>;
    devices: Array<{ device: string; sessions: number }>;
  };
  source?: 'ga4' | 'ua' | 'mock';
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

// 使用 gtag 获取基础数据（客户端）
export async function getAnalyticsDataFromGtag(): Promise<{
  overview: AnalyticsData;
  trend: AnalyticsTrendData[];
}> {
  // 由于gtag主要用于事件发送而非数据获取，我们需要使用Google Analytics Reporting API
  // 这里先提供一个框架，实际使用需要配置Reporting API
  
  const propertyId = getGAPropertyId();
  if (!propertyId) {
    throw new Error('GA Property ID not configured');
  }

  // 这里需要实现实际的 Google Analytics Reporting API 调用
  // 目前返回示例数据，您需要替换为真实的API调用
  
  const mockOverview: AnalyticsData = {
    pageViews: await getPageViews(),
    uniquePageViews: await getUniquePageViews(),
    users: await getUsers(),
    sessions: await getSessions(),
    bounceRate: await getBounceRate(),
    avgSessionDuration: await getAvgSessionDuration(),
    newUsers: await getNewUsers(),
    returningUsers: await getReturningUsers(),
    events: await getEvents(),
  };

  const mockTrend: AnalyticsTrendData[] = await getTrendData();

  return {
    overview: mockOverview,
    trend: mockTrend,
  };
}

// 使用Google Analytics Reporting API获取页面浏览量
async function getPageViews(): Promise<number> {
  // 实际实现需要调用GA Reporting API
  // 这里返回模拟数据
  return Math.floor(Math.random() * 50000) + 20000;
}

async function getUniquePageViews(): Promise<number> {
  return Math.floor(Math.random() * 30000) + 15000;
}

async function getUsers(): Promise<number> {
  return Math.floor(Math.random() * 8000) + 3000;
}

async function getSessions(): Promise<number> {
  return Math.floor(Math.random() * 12000) + 5000;
}

async function getBounceRate(): Promise<number> {
  return Math.floor(Math.random() * 30) + 35;
}

async function getAvgSessionDuration(): Promise<number> {
  return Math.floor(Math.random() * 180) + 120;
}

async function getNewUsers(): Promise<number> {
  return Math.floor(Math.random() * 3000) + 1000;
}

async function getReturningUsers(): Promise<number> {
  return Math.floor(Math.random() * 5000) + 2000;
}

async function getEvents(): Promise<number> {
  return Math.floor(Math.random() * 100000) + 50000;
}

async function getTrendData(): Promise<AnalyticsTrendData[]> {
  const trend: AnalyticsTrendData[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    trend.push({
      date: date.toISOString().split('T')[0],
      pageViews: Math.floor(Math.random() * 8000) + 2000,
      uniquePageViews: Math.floor(Math.random() * 5000) + 1500,
      users: Math.floor(Math.random() * 1200) + 400,
      sessions: Math.floor(Math.random() * 1800) + 600,
      events: Math.floor(Math.random() * 15000) + 5000,
    });
  }
  
  return trend;
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
    console.warn('GA Property ID not configured, using mock data');
    return generateFallbackData();
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
    console.log('Falling back to mock data');
    return generateFallbackData();
  }
}

// 获取实时数据的增强版本
export async function getRealTimeAnalytics(): Promise<{
  activeUsers: number;
  activePages: Array<{ page: string; activeUsers: number }>;
  currentPageViews: number;
  source: 'ga4' | 'mock';
}> {
  const propertyId = getGAPropertyId();
  if (!propertyId) {
    return generateRealTimeMockData();
  }

  try {
    // 这里可以实现GA4的实时API调用
    // 目前返回模拟数据
    return generateRealTimeMockData();
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    return generateRealTimeMockData();
  }
}

// 生成备用数据
function generateFallbackData(): ExtendedAnalyticsData {
  const overview = {
    pageViews: Math.floor(Math.random() * 50000) + 20000,
    uniquePageViews: Math.floor(Math.random() * 30000) + 15000,
    users: Math.floor(Math.random() * 8000) + 3000,
    sessions: Math.floor(Math.random() * 12000) + 5000,
    bounceRate: Math.floor(Math.random() * 30) + 35,
    avgSessionDuration: Math.floor(Math.random() * 180) + 120,
    newUsers: Math.floor(Math.random() * 3000) + 1000,
    returningUsers: Math.floor(Math.random() * 5000) + 2000,
    events: Math.floor(Math.random() * 100000) + 50000,
  };

  const trend: AnalyticsTrendData[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    trend.push({
      date: date.toISOString().split('T')[0],
      pageViews: Math.floor(Math.random() * 8000) + 2000,
      uniquePageViews: Math.floor(Math.random() * 5000) + 1500,
      users: Math.floor(Math.random() * 1200) + 400,
      sessions: Math.floor(Math.random() * 1800) + 600,
      events: Math.floor(Math.random() * 15000) + 5000,
    });
  }

  const topPages = [
    { page: '/', pageViews: Math.floor(Math.random() * 5000) + 2000, uniquePageViews: Math.floor(Math.random() * 3000) + 1500 },
    { page: '/blog', pageViews: Math.floor(Math.random() * 3000) + 1000, uniquePageViews: Math.floor(Math.random() * 2000) + 800 },
    { page: '/about', pageViews: Math.floor(Math.random() * 2000) + 500, uniquePageViews: Math.floor(Math.random() * 1500) + 400 },
    { page: '/contact', pageViews: Math.floor(Math.random() * 1500) + 300, uniquePageViews: Math.floor(Math.random() * 1000) + 250 },
  ];

  const demographics = {
    countries: [
      { country: 'United States', users: Math.floor(Math.random() * 2000) + 1000 },
      { country: 'China', users: Math.floor(Math.random() * 1500) + 800 },
      { country: 'United Kingdom', users: Math.floor(Math.random() * 1000) + 500 },
      { country: 'Germany', users: Math.floor(Math.random() * 800) + 400 },
    ],
    devices: [
      { device: 'desktop', sessions: Math.floor(Math.random() * 5000) + 3000 },
      { device: 'mobile', sessions: Math.floor(Math.random() * 7000) + 4000 },
      { device: 'tablet', sessions: Math.floor(Math.random() * 2000) + 800 },
    ]
  };

  return {
    overview,
    trend,
    topPages,
    demographics,
    source: 'mock'
  };
}

// 生成实时模拟数据
function generateRealTimeMockData() {
  return {
    activeUsers: Math.floor(Math.random() * 200) + 50,
    activePages: [
      { page: '/', activeUsers: Math.floor(Math.random() * 50) + 20 },
      { page: '/blog', activeUsers: Math.floor(Math.random() * 30) + 10 },
      { page: '/products', activeUsers: Math.floor(Math.random() * 25) + 8 },
      { page: '/about', activeUsers: Math.floor(Math.random() * 15) + 5 },
    ],
    currentPageViews: Math.floor(Math.random() * 500) + 100,
    source: 'mock' as const
  };
}

// 导出便捷的数据获取函数，保持向后兼容
export { getRealTimeAnalytics as getRealTimeData };