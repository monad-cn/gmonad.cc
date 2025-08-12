import { useState, useEffect, useRef } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  MessageSquare,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Tooltip, Card } from 'antd';
import styles from './index.module.css';
import {
  getStatsOverview,
  getAnalyticsData,
  AnalyticsData,
  AnalyticsTrendData,
} from '../api/stats';
import {
  Eye,
  Users2,
  MousePointer,
  Clock,
  UserPlus,
  UserCheck,
  Activity,
  TrendingUp as TrendingUpIcon,
  Globe,
  Smartphone,
  Monitor,
  Navigation,
} from 'lucide-react';

// 类型定义
interface StatsOverview {
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

interface TimeSeriesData {
  date: string;
  users: number;
  blogs: number;
  tutorials: number;
  events: number;
  posts: number;
}

interface StatsResponse {
  overview: StatsOverview | null;
  trend: TimeSeriesData[] | null;
}

interface AnalyticsResponse {
  overview: AnalyticsData | null;
  trend: AnalyticsTrendData[] | null;
}

// 页面数据接口
interface PageData {
  page: string; // 与API保持一致
  pageViews: number;
  uniquePageViews: number;
  bounceRate?: number; // 可选，API中可能没有
  avgTimeOnPage?: number; // 可选，API中可能没有
}

// 运营数据统计卡片组件
interface AnalyticsCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  tooltip?: React.ReactNode;
  showDetails?: boolean;
  onDetailsClick?: () => void;
}

function AnalyticsCard({
  title,
  value,
  suffix = '',
  icon,
  color,
  trend,
  tooltip,
  showDetails = false,
  onDetailsClick,
}: AnalyticsCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      if (val >= 10000) {
        return (val / 10000).toFixed(1) + 'w';
      }
      return val.toLocaleString();
    }
    return val;
  };

  const cardContent = (
    <Card
      className={styles.analyticsCard}
      style={{ '--card-color': color } as any}
      hoverable={showDetails}
      onClick={showDetails ? onDetailsClick : undefined}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon} style={{ backgroundColor: color }}>
          {icon}
        </div>
        <h3 className={styles.cardTitle}>{title}</h3>
      </div>

      <div className={styles.cardTotal}>
        <p className={styles.totalNumber}>
          {formatValue(value)}
          {suffix}
        </p>
      </div>

      {trend !== undefined && (
        <div className={styles.cardGrowth}>
          {trend >= 0 ? (
            <TrendingUp className={styles.trendIcon} />
          ) : (
            <TrendingDown className={styles.trendIcon} />
          )}
          <span
            className={`${styles.growthText} ${trend >= 0 ? styles.positive : styles.negative}`}
          >
            {trend >= 0 ? '+' : ''}
            {trend.toFixed(1)}%
          </span>
          <span className={styles.growthLabel}>vs 昨日</span>
        </div>
      )}

      {showDetails && (
        <div className={styles.cardDetails}>
          <Navigation className={styles.detailsIcon} />
          <span>点击查看详情</span>
        </div>
      )}
    </Card>
  );

  return tooltip ? (
    <Tooltip title={tooltip} placement="top" color="#fff">
      {cardContent}
    </Tooltip>
  ) : (
    cardContent
  );
}

// 统计卡片组件
interface StatsCardProps {
  title: string;
  total: number;
  newThisWeek: number;
  weeklyGrowth: number;
  icon: React.ReactNode;
  color: string;
}

function StatsCard({
  title,
  total,
  newThisWeek,
  weeklyGrowth,
  icon,
  color,
}: StatsCardProps) {
  const isPositiveGrowth = weeklyGrowth >= 0;

  return (
    <div className={styles.statsCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon} style={{ backgroundColor: color }}>
          {icon}
        </div>
        <h3 className={styles.cardTitle}>{title}</h3>
      </div>

      <div className={styles.cardTotal}>
        <p className={styles.totalNumber}>{total.toLocaleString()}</p>
        <p className={styles.totalLabel}>总数</p>
      </div>

      <div className={styles.cardNew}>
        <p className={styles.newNumber}>+{newThisWeek.toLocaleString()}</p>
        <p className={styles.newLabel}>本周新增</p>
      </div>

      <div className={styles.cardGrowth}>
        {isPositiveGrowth ? (
          <TrendingUp className={styles.trendIcon} />
        ) : (
          <TrendingDown className={styles.trendIcon} />
        )}
        <span
          className={`${styles.growthText} ${isPositiveGrowth ? styles.positive : styles.negative}`}
        >
          {isPositiveGrowth ? '+' : ''}
          {weeklyGrowth.toFixed(1)}%
        </span>
        <span className={styles.growthLabel}>vs 上周</span>
      </div>
    </div>
  );
}

// 运营数据趋势图表组件
interface AnalyticsTrendChartProps {
  data: AnalyticsTrendData[];
}

function AnalyticsTrendChart({ data }: AnalyticsTrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 60;

    ctx.clearRect(0, 0, width, height);

    const metrics = ['pageViews', 'uniquePageViews', 'users', 'sessions'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    const maxValues = metrics.map((metric) =>
      Math.max(
        ...data.map((d) => d[metric as keyof AnalyticsTrendData] as number)
      )
    );
    const globalMax = Math.max(...maxValues);

    // 绘制网格线
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - 2 * padding) * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    for (let i = 0; i < data.length; i++) {
      const x = padding + ((width - 2 * padding) * i) / (data.length - 1);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // 绘制数据线
    metrics.forEach((metric, metricIndex) => {
      ctx.strokeStyle = colors[metricIndex];
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding + ((width - 2 * padding) * index) / (data.length - 1);
        const value = point[metric as keyof AnalyticsTrendData] as number;
        const y =
          height - padding - ((height - 2 * padding) * value) / globalMax;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // 绘制数据点
      ctx.fillStyle = colors[metricIndex];
      data.forEach((point, index) => {
        const x = padding + ((width - 2 * padding) * index) / (data.length - 1);
        const value = point[metric as keyof AnalyticsTrendData] as number;
        const y =
          height - padding - ((height - 2 * padding) * value) / globalMax;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // Y轴标签
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - 2 * padding) * i) / 5;
      const value = Math.round((globalMax * (5 - i)) / 5);
      ctx.fillText(value.toString(), padding - 10, y);
    }

    // X轴标签
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    data.forEach((point, index) => {
      if (
        index % Math.ceil(data.length / 6) === 0 ||
        index === data.length - 1
      ) {
        const x = padding + ((width - 2 * padding) * index) / (data.length - 1);
        const date = new Date(point.date);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        ctx.fillText(label, x, height - padding + 10);
      }
    });
  }, [data]);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>运营数据趋势</h3>

        <div className={styles.chartLegend}>
          {['页面浏览量', '独立页面浏览量', '用户数', '会话数'].map(
            (label, index) => (
              <div key={label} className={styles.legendItem}>
                <div
                  className={styles.legendColor}
                  style={{
                    backgroundColor: [
                      '#3b82f6',
                      '#10b981',
                      '#f59e0b',
                      '#ef4444',
                    ][index],
                  }}
                />
                <span className={styles.legendLabel}>{label}</span>
              </div>
            )
          )}
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <canvas ref={canvasRef} className={styles.chart} />
      </div>
    </div>
  );
}

// 趋势图表组件
interface TrendChartProps {
  data: TimeSeriesData[];
}

function TrendChart({ data }: TrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 60;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 数据处理
    const metrics = ['users', 'blogs', 'tutorials', 'events', 'posts'];
    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

    // 计算最大值用于缩放
    const maxValues = metrics.map((metric) =>
      Math.max(...data.map((d) => d[metric as keyof TimeSeriesData] as number))
    );
    const globalMax = Math.max(...maxValues);

    // 绘制网格线
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;

    // 水平网格线
    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - 2 * padding) * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // 垂直网格线
    for (let i = 0; i < data.length; i++) {
      const x = padding + ((width - 2 * padding) * i) / (data.length - 1);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // 绘制数据线
    metrics.forEach((metric, metricIndex) => {
      ctx.strokeStyle = colors[metricIndex];
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding + ((width - 2 * padding) * index) / (data.length - 1);
        const value = point[metric as keyof TimeSeriesData] as number;
        const y =
          height - padding - ((height - 2 * padding) * value) / globalMax;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // 绘制数据点
      ctx.fillStyle = colors[metricIndex];
      data.forEach((point, index) => {
        const x = padding + ((width - 2 * padding) * index) / (data.length - 1);
        const value = point[metric as keyof TimeSeriesData] as number;
        const y =
          height - padding - ((height - 2 * padding) * value) / globalMax;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // 绘制Y轴标签
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - 2 * padding) * i) / 5;
      const value = Math.round((globalMax * (5 - i)) / 5);
      ctx.fillText(value.toString(), padding - 10, y);
    }

    // 绘制X轴标签
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    data.forEach((point, index) => {
      if (
        index % Math.ceil(data.length / 6) === 0 ||
        index === data.length - 1
      ) {
        const x = padding + ((width - 2 * padding) * index) / (data.length - 1);
        const date = new Date(point.date);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        ctx.fillText(label, x, height - padding + 10);
      }
    });
  }, [data]);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>周趋势图</h3>

        <div className={styles.chartLegend}>
          {['用户', '博客', '教程', '活动', '帖子'].map((label, index) => (
            <div key={label} className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{
                  backgroundColor: [
                    '#8b5cf6',
                    '#06b6d4',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                  ][index],
                }}
              />
              <span className={styles.legendLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <canvas ref={canvasRef} className={styles.chart} />
      </div>
    </div>
  );
}

// 日历选择器组件接口（暂时保留但未使用）
// interface CalendarPickerProps {
//   onDateRangeChange: (startDate: Date, endDate: Date) => void;
// }

// 页面详情浮窗组件
interface PageDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  data: PageData[];
}

function PageDetailsModal({ visible, onClose, data }: PageDetailsModalProps) {
  if (!visible) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>页面浏览量详情</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.pageList}>
            {data.map((page, index) => (
              <div key={index} className={styles.pageItem}>
                <div className={styles.pageItemHeader}>
                  <Globe className={styles.pageIcon} />
                  <span className={styles.pagePath}>{page.page}</span>
                </div>
                <div className={styles.pageStats}>
                  <div className={styles.pageStat}>
                    <Eye className={styles.statIcon} />
                    <span>{page.pageViews.toLocaleString()}</span>
                    <span className={styles.statLabel}>浏览量</span>
                  </div>
                  <div className={styles.pageStat}>
                    <Users2 className={styles.statIcon} />
                    <span>{page.uniquePageViews.toLocaleString()}</span>
                    <span className={styles.statLabel}>独立浏览量</span>
                  </div>
                  {page.bounceRate !== undefined && (
                    <div className={styles.pageStat}>
                      <TrendingUp className={styles.statIcon} />
                      <span>{page.bounceRate.toFixed(1)}%</span>
                      <span className={styles.statLabel}>跳出率</span>
                    </div>
                  )}
                  {page.avgTimeOnPage !== undefined && (
                    <div className={styles.pageStat}>
                      <Clock className={styles.statIcon} />
                      <span>
                        {Math.floor(page.avgTimeOnPage / 60)}m{' '}
                        {page.avgTimeOnPage % 60}s
                      </span>
                      <span className={styles.statLabel}>停留时间</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 保留CalendarPicker组件但暂时不使用
// function CalendarPicker({ onDateRangeChange }: CalendarPickerProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   ... 省略实现细节
// }

// 主要统计页面组件
export default function StatsIndex() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  // 暂时注释掉未使用的dateRange
  // const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(
  //   null
  // );
  const [showPageDetails, setShowPageDetails] = useState(false);

  // 从API获取真实页面数据
  const getPageData = (): PageData[] => {
    // 只使用真实的Google Analytics API数据
    if (analyticsData?.overview && (analyticsData as any).topPages) {
      const topPages = (analyticsData as any).topPages;
      console.log('Using real page data from Google Analytics API:', topPages);
      return topPages.map((page: any) => ({
        page: page.page,
        pageViews: page.pageViews,
        uniquePageViews: page.uniquePageViews,
      }));
    }

    // 如果没有API数据，返回空数组
    console.log('No page data available from Google Analytics API');
    return [];
  };

  // 处理日期范围变化
  // const handleDateRangeChange = async (startDate: Date, endDate: Date) => {
  //     setLoading(true)
  //     setError(null)
  //     setDateRange({ start: startDate, end: endDate })

  //     try {
  //         const statsData = await getStatsData(startDate, endDate, 'week')
  //         setData(statsData)
  //     } catch (error) {
  //         console.error('Failed to fetch stats data:', error)
  //         setError('获取统计数据失败，请重试')
  //     } finally {
  //         setLoading(false)
  //     }
  // }

  // 初始化数据
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setAnalyticsLoading(true);
      setError(null);
      setAnalyticsError(null);

      try {
        // 并行获取内容数据和运营数据
        const [statsResult, analyticsResult] = await Promise.all([
          getStatsOverview(),
          getAnalyticsData(),
        ]);

        if (statsResult.success && statsResult.data) {
          console.log(statsResult.data);

          setData(statsResult.data);
        } else {
          setError(statsResult.message);
        }

        if (analyticsResult.success && analyticsResult.data) {
          setAnalyticsData(analyticsResult.data);
        } else {
          setAnalyticsError(analyticsResult.message);
        }

        // 暂时注释掉日期范围设置
        // const now = new Date();
        // const startDate = new Date(now);
        // startDate.setDate(now.getDate() - 6);
        // setDateRange({ start: startDate, end: now });
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        setError('获取统计数据失败，请重试');
        setAnalyticsError('获取运营数据失败，请重试');
      } finally {
        setLoading(false);
        setAnalyticsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // 创建页面浏览量的详细信息工具提示
  const createPageViewsTooltip = () => {
    const pageData = getPageData();
    if (pageData.length === 0) {
      return null; // 没有数据时不显示工具提示
    }
    
    const topPages = pageData.slice(0, 3);
    return (
      <div className={styles.tooltipContent}>
        <h4 className={styles.tooltipTitle}>热门页面</h4>
        <div className={styles.tooltipList}>
          {topPages.map((page, index) => (
            <div key={index} className={styles.tooltipItem}>
              <Globe className={styles.tooltipIcon} />
              <span className={styles.tooltipPath}>{page.page}</span>
              <span className={styles.tooltipValue}>
                {page.pageViews.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.tooltipFooter}>点击查看所有页面详情</div>
      </div>
    );
  };

  // 创建设备类型工具提示（使用API数据）
  const createDeviceTooltip = () => {
    // 检查是否有真实的设备数据
    const hasDeviceData = analyticsData?.overview && (analyticsData as any).demographics?.devices;
    
    if (hasDeviceData) {
      const devices = (analyticsData as any).demographics.devices;
      return (
        <div className={styles.tooltipContent}>
          <h4 className={styles.tooltipTitle}>设备类型分布</h4>
          <div className={styles.tooltipList}>
            {devices.map((device: any, index: number) => (
              <div key={index} className={styles.tooltipItem}>
                {device.device === 'desktop' && <Monitor className={styles.tooltipIcon} />}
                {device.device === 'mobile' && <Smartphone className={styles.tooltipIcon} />}
                {device.device === 'tablet' && <Activity className={styles.tooltipIcon} />}
                <span className={styles.tooltipPath}>
                  {device.device === 'desktop' ? '桌面端' : 
                   device.device === 'mobile' ? '移动端' : '平板'}
                </span>
                <span className={styles.tooltipValue}>{device.sessions.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return null; // 没有数据时不显示工具提示
  };

  if (loading && analyticsLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>加载统计数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} nav-t-top`}>
      <div className={styles.content}>
        {/* 页面标题 */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <div className={styles.titleIcon}>
              <BarChart3 className={styles.titleIconSvg} />
            </div>
            <h1 className={styles.title}>数据统计中心</h1>
          </div>
          <p className={styles.subtitle}>Monad中文社区内容数据与运营数据概览</p>
        </div>

        {/* 日历选择器和当前选择显示 */}
        {/* <div className={styles.controlSection}>
                    <div className={styles.controls}>
                        <CalendarPicker onDateRangeChange={handleDateRangeChange} />

                        {dateRange && (
                            <div className={styles.dateDisplay}>
                                <Calendar className={styles.dateIcon} />
                                <span className={styles.dateText}>当前选择: {formatDateRange()}</span>
                            </div>
                        )}
                    </div>
                </div> */}

        {/* 内容数据统计 */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>内容数据统计</h2>
        </div>

        {error || !data ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>
              {error || '无法加载内容统计数据'}
            </p>
          </div>
        ) : (
          <div className={styles.statsGrid}>
            <StatsCard
              title="用户"
              total={data.overview?.users.total ?? 0}
              newThisWeek={data.overview?.users.new_this_Week ?? 0}
              weeklyGrowth={data.overview?.users.weekly_growth ?? 0}
              icon={<Users className={styles.cardIconSvg} />}
              color="#8b5cf6"
            />

            <StatsCard
              title="博客"
              total={data.overview?.blogs.total ?? 0}
              newThisWeek={data.overview?.blogs.new_this_Week ?? 0}
              weeklyGrowth={data.overview?.blogs.weekly_growth ?? 0}
              icon={<BookOpen className={styles.cardIconSvg} />}
              color="#06b6d4"
            />

            <StatsCard
              title="教程"
              total={data.overview?.tutorials.total ?? 0}
              newThisWeek={data.overview?.tutorials.new_this_Week ?? 0}
              weeklyGrowth={data.overview?.tutorials.weekly_growth ?? 0}
              icon={<GraduationCap className={styles.cardIconSvg} />}
              color="#10b981"
            />

            <StatsCard
              title="活动"
              total={data.overview?.events.total ?? 0}
              newThisWeek={data.overview?.events.new_this_Week ?? 0}
              weeklyGrowth={data.overview?.events.weekly_growth ?? 0}
              icon={<Calendar className={styles.cardIconSvg} />}
              color="#f59e0b"
            />

            <StatsCard
              title="帖子"
              total={data.overview?.posts.total ?? 0}
              newThisWeek={data.overview?.posts.new_this_Week ?? 0}
              weeklyGrowth={data.overview?.posts.weekly_growth ?? 0}
              icon={<MessageSquare className={styles.cardIconSvg} />}
              color="#ef4444"
            />
          </div>
        )}

        {/* 内容数据趋势图表 */}
        {Array.isArray(data?.trend) && data.trend.length > 0 && (
          <div className={styles.chartSection}>
            <TrendChart data={data.trend} />
          </div>
        )}

        {/* 运营数据统计 */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>运营数据统计</h2>
          <p className={styles.sectionSubtitle}>
            基于Google Analytics的网站流量与用户行为数据
            {analyticsData?.overview && (
              <span className={styles.dataSource}>
                {process.env.NEXT_PUBLIC_GA_ID ? ' • 实时数据' : ' • 示例数据'}
              </span>
            )}
          </p>
        </div>

        {analyticsError || !analyticsData ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>
              {analyticsError || '无法加载运营数据'}
            </p>
          </div>
        ) : (
          <div className={styles.analyticsGrid}>
            <AnalyticsCard
              title="页面浏览量"
              value={analyticsData.overview?.pageViews ?? 0}
              icon={<Eye className={styles.cardIconSvg} />}
              color="#3b82f6"
              tooltip={createPageViewsTooltip()}
              showDetails={getPageData().length > 0}
              onDetailsClick={() => setShowPageDetails(true)}
            />

            <AnalyticsCard
              title="独立页面浏览量"
              value={analyticsData.overview?.uniquePageViews ?? 0}
              icon={<MousePointer className={styles.cardIconSvg} />}
              color="#10b981"
              tooltip={createDeviceTooltip()}
            />

            <AnalyticsCard
              title="活跃用户"
              value={analyticsData.overview?.users ?? 0}
              icon={<Users2 className={styles.cardIconSvg} />}
              color="#f59e0b"
            />

            <AnalyticsCard
              title="会话数"
              value={analyticsData.overview?.sessions ?? 0}
              icon={<Activity className={styles.cardIconSvg} />}
              color="#ef4444"
            />

            <AnalyticsCard
              title="跳出率"
              value={analyticsData.overview?.bounceRate ?? 0}
              suffix="%"
              icon={<TrendingUpIcon className={styles.cardIconSvg} />}
              color="#8b5cf6"
            />

            <AnalyticsCard
              title="平均会话时长"
              value={Math.floor(
                (analyticsData.overview?.avgSessionDuration ?? 0) / 60
              )}
              suffix="分钟"
              icon={<Clock className={styles.cardIconSvg} />}
              color="#06b6d4"
            />

            <AnalyticsCard
              title="新用户"
              value={analyticsData.overview?.newUsers ?? 0}
              icon={<UserPlus className={styles.cardIconSvg} />}
              color="#84cc16"
            />

            <AnalyticsCard
              title="回访用户"
              value={analyticsData.overview?.returningUsers ?? 0}
              icon={<UserCheck className={styles.cardIconSvg} />}
              color="#f97316"
            />
          </div>
        )}

        {/* 页面详情浮窗 */}
        {getPageData().length > 0 ? (
          <PageDetailsModal
            visible={showPageDetails}
            onClose={() => setShowPageDetails(false)}
            data={getPageData()}
          />
        ) : (
          showPageDetails && (
            <div className={styles.modalOverlay} onClick={() => setShowPageDetails(false)}>
              <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h3>页面浏览量详情</h3>
                  <button className={styles.closeButton} onClick={() => setShowPageDetails(false)}>
                    ×
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.emptyText}>
                    暂无页面数据。请配置Google Analytics API以获取真实数据。
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* 运营数据趋势图表 */}
        {Array.isArray(analyticsData?.trend) &&
          analyticsData.trend.length > 0 && (
            <div className={styles.chartSection}>
              <AnalyticsTrendChart data={analyticsData.trend} />
            </div>
          )}
      </div>
    </div>
  );
}
