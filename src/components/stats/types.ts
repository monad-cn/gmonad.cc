import { AnalyticsData, AnalyticsTrendData } from  '../../pages/api/stats';

// 统计概览数据类型
export interface StatsOverview {
  users: {
    total: number;
    new_this_Week: number;
    new_this_Month: number;
    weekly_growth: number;
    monthly_growth: number;
  };
  blogs: {
    total: number;
    new_this_Week: number;
    new_this_Month: number;
    weekly_growth: number;
    monthly_growth: number;
  };
  tutorials: {
    total: number;
    new_this_Week: number;
    new_this_Month: number;
    weekly_growth: number;
    monthly_growth: number;
  };
  events: {
    total: number;
    new_this_Week: number;
    new_this_Month: number;
    weekly_growth: number;
    monthly_growth: number;
  };
  posts: {
    total: number;
    new_this_Week: number;
    new_this_Month: number;
    weekly_growth: number;
    monthly_growth: number;
  };
}

// 时间序列数据
export interface TimeSeriesData {
  date: string;
  users: number;
  blogs: number;
  tutorials: number;
  events: number;
  posts: number;
}

// 统计响应数据
export interface StatsResponse {
  overview: StatsOverview | null;
  trend: TimeSeriesData[] | null;
}

// 运营数据响应
export interface AnalyticsResponse {
  overview: AnalyticsData | null;
  trend: AnalyticsTrendData[] | null;
}

// 页面数据接口
export interface PageData {
  page: string;
  pageViews: number;
  bounceRate?: number;
  avgTimeOnPage?: number;
}

// 运营数据统计卡片组件接口
export interface AnalyticsCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  tooltip?: React.ReactNode;
  description?: string;
  showDetails?: boolean;
  onDetailsClick?: () => void;
}

// 统计卡片组件接口
export interface StatsCardProps {
  title: string;
  total: number;
  newThisWeek: number;
  weeklyGrowth: number;
  icon: React.ReactNode;
  color: string;
}

// 运营数据趋势图表组件接口
export interface AnalyticsTrendChartProps {
  data: AnalyticsTrendData[];
}

// 趋势图表组件接口
export interface TrendChartProps {
  data: TimeSeriesData[];
}

// 页面详情浮窗组件接口
export interface PageDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  data: PageData[];
}

// 工具提示数据接口
export interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  date: string;
  values: {
    pageViews: number;
    users: number;
    sessions: number;
  };
}

