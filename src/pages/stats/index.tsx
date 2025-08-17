import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
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
} from 'lucide-react';
import { AnalyticsCard } from '../../components/stats/AnalyticsCard';
import { StatsCard } from '../../components/stats/StatsCard';
import { AnalyticsTrendChart } from '../../components/stats/AnalyticsTrendChart';
import { TrendChart } from '../../components/stats/TrendChart';
import { PageDetailsModal } from '../../components/stats/PageDetailsModal';
import {
  StatsResponse,
  AnalyticsResponse,
  PageData,
} from '../../components/stats/types';

// 保留CalendarPicker组件但暂时不使用
// function CalendarPicker({ onDateRangeChange }: CalendarPickerProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   ... 省略实现细节
// }

// 计算趋势数据（针对有trend数据的字段）
function calculateTrend(
  field: keyof AnalyticsTrendData,
  analyticsData: AnalyticsResponse | null
): number | undefined {
  if (!analyticsData?.trend || analyticsData.trend.length < 2) {
    return undefined;
  }

  const trendData = analyticsData.trend;
  const latestData = trendData[trendData.length - 1];
  const previousData = trendData[trendData.length - 2];

  if (!latestData || !previousData) {
    return undefined;
  }

  const currentValue = latestData[field] as number;
  const previousValue = previousData[field] as number;

  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
}

// 计算仅有overview数据字段的趋势
function calculateTrendForOverviewOnly(
  _field: keyof AnalyticsData,
  analyticsData: AnalyticsResponse | null
): number | undefined {
  if (!analyticsData?.overview) {
    return undefined;
  }

  // 对于只在overview中存在的字段，我们无法获取历史数据进行真实比较
  // 这里返回undefined，表示不显示趋势
  return undefined;
}

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
      // console.log('Using real page data from Google Analytics API:', topPages);
      return topPages.map((page: any) => ({
        page: page.page,
        pageViews: page.pageViews,
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
    const hasDeviceData =
      analyticsData?.overview && (analyticsData as any).demographics?.devices;

    if (hasDeviceData) {
      const devices = (analyticsData as any).demographics.devices;
      return (
        <div className={styles.tooltipContent}>
          <h4 className={styles.tooltipTitle}>设备类型分布</h4>
          <div className={styles.tooltipList}>
            {devices.map((device: any, index: number) => (
              <div key={index} className={styles.tooltipItem}>
                {device.device === 'desktop' && (
                  <Monitor className={styles.tooltipIcon} />
                )}
                {device.device === 'mobile' && (
                  <Smartphone className={styles.tooltipIcon} />
                )}
                {device.device === 'tablet' && (
                  <Activity className={styles.tooltipIcon} />
                )}
                <span className={styles.tooltipPath}>
                  {device.device === 'desktop'
                    ? '桌面端'
                    : device.device === 'mobile'
                      ? '移动端'
                      : '平板'}
                </span>
                <span className={styles.tooltipValue}>
                  {device.sessions.toLocaleString()}
                </span>
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
              trend={calculateTrend('pageViews', analyticsData)}
              tooltip={createPageViewsTooltip()}
              showDetails={getPageData().length > 0}
              onDetailsClick={() => setShowPageDetails(true)}
            />

            <AnalyticsCard
              title="用户交互事件数"
              value={analyticsData.overview?.events ?? 0}
              icon={<MousePointer className={styles.cardIconSvg} />}
              color="#10b981"
              trend={calculateTrend('events', analyticsData)}
              tooltip={createDeviceTooltip()}
            />

            <AnalyticsCard
              title="活跃用户"
              value={analyticsData.overview?.users ?? 0}
              icon={<Users2 className={styles.cardIconSvg} />}
              color="#f59e0b"
              trend={calculateTrend('users', analyticsData)}
            />

            <AnalyticsCard
              title="会话数"
              value={analyticsData.overview?.sessions ?? 0}
              icon={<Activity className={styles.cardIconSvg} />}
              color="#ef4444"
              trend={calculateTrend('sessions', analyticsData)}
            />

            <AnalyticsCard
              title="跳出率"
              value={analyticsData.overview?.bounceRate ?? 0}
              suffix="%"
              icon={<TrendingUpIcon className={styles.cardIconSvg} />}
              color="#8b5cf6"
              trend={calculateTrendForOverviewOnly('bounceRate', analyticsData)}
            />

            <AnalyticsCard
              title="平均会话时长"
              value={Math.floor(
                (analyticsData.overview?.avgSessionDuration ?? 0) / 60
              )}
              suffix="分钟"
              icon={<Clock className={styles.cardIconSvg} />}
              color="#06b6d4"
              trend={calculateTrendForOverviewOnly(
                'avgSessionDuration',
                analyticsData
              )}
            />

            <AnalyticsCard
              title="新用户"
              value={analyticsData.overview?.newUsers ?? 0}
              icon={<UserPlus className={styles.cardIconSvg} />}
              color="#84cc16"
              trend={calculateTrendForOverviewOnly('newUsers', analyticsData)}
            />

            <AnalyticsCard
              title="回访用户"
              value={analyticsData.overview?.returningUsers ?? 0}
              icon={<UserCheck className={styles.cardIconSvg} />}
              color="#f97316"
              trend={calculateTrendForOverviewOnly(
                'returningUsers',
                analyticsData
              )}
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
            <div
              className={styles.modalOverlay}
              onClick={() => setShowPageDetails(false)}
            >
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h3>页面浏览量详情</h3>
                  <button
                    className={styles.closeButton}
                    onClick={() => setShowPageDetails(false)}
                  >
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
