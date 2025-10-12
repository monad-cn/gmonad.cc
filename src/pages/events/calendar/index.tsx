import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAtom } from 'jotai';

import {
  Calendar,
  Badge,
  Card,
  Typography,
  Tag,
  Button,
  Drawer,
  Empty,
  Select,
  Spin,
} from 'antd';
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Globe,
  Eye,
  Plus
} from 'lucide-react';
import TwitterShare, { TwitterSharePresets } from '@/components/social/TwitterShare';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/router';
import { getEvents } from '../../api/event';
import type { Event } from '../../api/event';
import { useAuth } from '@/contexts/AuthContext';
import { selectedDateAtom, statusFilterAtom, currentMonthDayjsAtom } from '@/atoms/calendar';
import styles from './index.module.css';

const { Paragraph } = Typography;
const { Option } = Select;

interface EventsByDate {
  [key: string]: Event[];
}

const EventsCalendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsByDate, setEventsByDate] = useState<EventsByDate>({});
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useAtom(statusFilterAtom);
  const [currentMonth, setCurrentMonth] = useAtom(currentMonthDayjsAtom);
  const [loading, setLoading] = useState(true);
  const [monthLoading, setMonthLoading] = useState(false);
  const [navigating, setNavigating] = useState<string | null>(null);

  const router = useRouter();
  const { session, status } = useAuth();
  const permissions = useMemo(() => session?.user?.permissions || [], [session?.user?.permissions]);

  // 加载事件数据 - 优化为按日期范围查询
  const loadEvents = useCallback(async (targetDate?: Dayjs, isMonthChange = false) => {
    try {
      if (isMonthChange) {
        setMonthLoading(true);
      } else if (!targetDate) {
        setLoading(true);
      }

      const dateToUse = targetDate || currentMonth;
      // 获取当前月份的开始和结束日期
      const startOfMonth = dateToUse.startOf('month').format('YYYY-MM-DD');
      const endOfMonth = dateToUse.endOf('month').format('YYYY-MM-DD');

      console.log(startOfMonth);
      console.log(endOfMonth);

      const result = await getEvents({
        page: 1,
        page_size: 1000,
        publish_status: 2, // 只显示已发布的活动
        status: statusFilter, // 添加状态筛选
        start_date: startOfMonth,
        end_date: endOfMonth,
      });

      if (result.success && result.data) {
        // 使用与 events/index.tsx 相同的数据处理逻辑
        let eventsData: Event[] = [];
        if (result.data.events && Array.isArray(result.data.events)) {
          eventsData = result.data.events;
        } else if (Array.isArray(result.data)) {
          eventsData = result.data;
        } else {
          console.warn('API 返回的数据格式不符合预期:', result.data);
          eventsData = [];
        }

        setEvents(eventsData);

        // 按日期组织事件
        const eventsByDateMap: EventsByDate = {};
        eventsData.forEach((event: Event) => {
          const dateKey = dayjs(event.start_time).format('YYYY-MM-DD');
          if (!eventsByDateMap[dateKey]) {
            eventsByDateMap[dateKey] = [];
          }
          eventsByDateMap[dateKey].push(event);
        });
        setEventsByDate(eventsByDateMap);
      }
    } catch (error) {
      console.error('加载事件失败:', error);
    } finally {
      setLoading(false);
      setMonthLoading(false);
    }
  }, [status, permissions, currentMonth, statusFilter]);

  useEffect(() => {
    // 只有在认证状态稳定后才加载数据，避免多次触发
    if (status === 'loading') return;
    loadEvents();
  }, [status, loadEvents]);

  // 监听路由变化，重置导航状态
  useEffect(() => {
    const handleRouteChange = () => {
      setNavigating(null);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('routeChangeError', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('routeChangeError', handleRouteChange);
    };
  }, [router.events]);

  // 状态筛选处理
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  // 获取事件状态颜色类名
  const getEventStatusClass = (event: Event) => {
    // 简化的状态判断逻辑
    const now = dayjs();
    const startTime = dayjs(event.start_time);
    const endTime = event.end_time ? dayjs(event.end_time) : startTime.add(2, 'hour');

    if (now.isBefore(startTime)) {
      return styles.eventUpcoming; // 未开始
    } else if (now.isAfter(endTime)) {
      return styles.eventEnded; // 已结束
    } else {
      return styles.eventOngoing; // 进行中
    }
  };

  // 获取事件类型颜色 - 紫色风格
  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'hackathon': '#7c3aed',
      'workshop': '#9333ea',
      'ama': '#a855f7',
      'meetup': '#8b5cf6',
    };
    return colors[type] || '#7c3aed';
  };

  // 添加到谷歌日历
  const addToGoogleCalendar = (event: Event) => {
    const startTime = dayjs(event.start_time);
    const endTime = event.end_time ? dayjs(event.end_time) : startTime.add(2, 'hour');
    
    const details = [
      event.description?.replace(/<[^>]*>/g, '') || '',
      '',
      event.event_mode === '线上活动' ? '线上活动' : `地点: ${event.location || '未指定地点'}`,
      event.participants > 0 ? `参与人数: ${event.participants}人` : '',
      '',
      `详情链接: ${typeof window !== 'undefined' ? window.location.origin : ''}/events/${event.ID}`
    ].filter(Boolean).join('\n');

    // 使用正确的谷歌日历URL格式 - 使用本地时间
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startTime.format('YYYYMMDD[T]HHmmss')}/${endTime.format('YYYYMMDD[T]HHmmss')}`,
      details: details
    });
    
    if (event.event_mode !== '线上活动' && event.location) {
      params.set('location', event.location);
    }

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;
    window.open(googleCalendarUrl, '_blank');
  };

  // 日历单元格渲染
  const dateCellRender = (value: Dayjs) => {
    const dateKey = value.format('YYYY-MM-DD');
    const dayEvents = eventsByDate[dateKey] || [];

    if (dayEvents.length === 0) return null;

    return (
      <div className={styles.calendarEvents}>
        {dayEvents.slice(0, 3).map((event) => (
          <div
            key={event.ID}
            className={`${styles.eventItem} ${getEventStatusClass(event)} ${navigating === event.ID.toString() ? styles.navigating : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setNavigating(event.ID.toString());
              router.push(`/events/${event.ID}?from=calendar`);
            }}
          >
            {navigating === event.ID.toString() ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Spin size="small" />
                <span style={{ fontSize: '12px' }}>跳转中...</span>
              </div>
            ) : (
              event.title.length > 12 ? event.title.substring(0, 12) + '...' : event.title
            )}
          </div>
        ))}
        {dayEvents.length > 3 && (
          <div
            className={styles.moreEvents}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDate(value);
              setSelectedEvents(dayEvents);
              setDrawerVisible(true);
            }}
          >
            +{dayEvents.length - 3} 更多
          </div>
        )}
      </div>
    );
  };

  // 月份单元格渲染
  const monthCellRender = (value: Dayjs) => {
    const monthEvents = events.filter(event =>
      dayjs(event.start_time).isSame(value, 'month')
    );
    return monthEvents.length ? (
      <div className="notes-month">
        <Badge count={monthEvents.length} style={{ backgroundColor: '#1890ff' }} />
      </div>
    ) : null;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.calendarWrapper}>
        {/* 标题和筛选器 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className={styles.title}>
            <CalendarIcon className={styles.titleIcon} />
            活动日历
          </h2>
          <Select
            placeholder="活动状态"
            allowClear
            size="large"
            style={{ width: 120 }}
            value={statusFilter || undefined}
            onChange={handleStatusFilter}
            disabled={monthLoading}
          >
            <Option value="3">所有</Option>
            <Option value="0">未开始</Option>
            <Option value="1">进行中</Option>
            <Option value="2">已结束</Option>
          </Select>
        </div>

        {/* 日历主体 */}
        <Spin spinning={monthLoading} tip="加载中...">
          <div className={styles.calendar}>
            <Calendar
              value={selectedDate}
              cellRender={(current, info) => {
                if (info.type === 'date') {
                  return dateCellRender(current);
                }
                if (info.type === 'month') {
                  return monthCellRender(current);
                }
                return info.originNode;
              }}
              onSelect={(date) => {
                setSelectedDate(date);
                const dateKey = date.format('YYYY-MM-DD');
                const dayEvents = eventsByDate[dateKey] || [];
                if (dayEvents.length > 0) {
                  setSelectedEvents(dayEvents);
                  setDrawerVisible(true);
                }
              }}
              onPanelChange={(date, mode) => {
                // 当切换月份或年份时，重新加载当前月份的数据
                if (mode === 'month') {
                  setCurrentMonth(date);
                  loadEvents(date, true);
                }
              }}
            />
          </div>
        </Spin>

        {/* 某日活动列表抽屉 */}
        <Drawer
          title={
            <div className={styles.drawerTitle}>
              <CalendarIcon className={styles.drawerIcon} />
              {selectedDate.format('YYYY年MM月DD日')} 的活动 ({selectedEvents.length}场)
            </div>
          }
          width={600}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
        >
          {selectedEvents.length === 0 ? (
            <Empty description="当日暂无活动" />
          ) : (
            <div style={{ marginTop: '16px' }}>
              {selectedEvents.map((event) => (
                <Card
                  key={event.ID}
                  className={styles.eventCard}
                  hoverable
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      loading={navigating === event.ID.toString()}
                      onClick={() => {
                        setNavigating(event.ID.toString());
                        router.push(`/events/${event.ID}?from=calendar`);
                      }}
                    >
                      <Eye size={16} /> 查看详情
                    </Button>,
                    <Button
                      key="calendar"
                      type="link"
                      onClick={() => addToGoogleCalendar(event)}
                    >
                      <Plus size={16} /> 添加到日历
                    </Button>,
                    <TwitterShare
                      key="share"
                      {...TwitterSharePresets.event(
                        event.title,
                        event.description ?
                          event.description.replace(/<[^>]*>/g, '').slice(0, 80) + '...' :
                          `精彩活动即将开始！时间：${dayjs(event.start_time).format('MM月DD日 HH:mm')}`,
                        `${typeof window !== 'undefined' ? window.location.origin : ''}/events/${event.ID}`
                      )}
                      type="link"

                      buttonText="分享到X"
                    />
                  ]}
                >
                  <div className={styles.eventCardContent}>
                    {/* 标题和类型标签 */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <h3 className={styles.eventTitle}>{event.title}</h3>
                      <Tag color={getEventTypeColor(event.event_type)} style={{marginTop:'0.1rem', marginLeft: '0.5rem', flexShrink: 0 }}>
                        {event.event_type}
                      </Tag>
                    </div>

                    {/* 活动标签 - 显眼位置 */}
                    {event.tags && event.tags.length > 0 && (
                      <div className={styles.eventTags} style={{ marginBottom: '1rem' }}>
                        {event.tags.slice(0, 3).map((tag, index) => (
                          <Tag key={index} className={styles.eventTag}>{tag}</Tag>
                        ))}
                        {event.tags.length > 3 && (
                          <Tag className={styles.eventTag} style={{ background: '#f3f4f6', color: '#6b7280' }}>
                            +{event.tags.length - 3}
                          </Tag>
                        )}
                      </div>
                    )}

                    {/* 描述 */}
                    <Paragraph ellipsis={{ rows: 2 }} className={styles.eventDescription}>
                      {event.description?.replace(/<[^>]*>/g, '') || ''}
                    </Paragraph>

                    {/* 活动信息 */}
                    <div className={styles.eventInfo}>
                      <div className={styles.eventInfoItem}>
                        <CalendarIcon size={14} className={styles.eventInfoIcon} />
                        {dayjs(event.start_time).format('HH:mm')}
                      </div>
                      <div className={styles.eventInfoItem}>
                        {event.event_mode === '线上活动' ? (
                          <>
                            <Globe size={14} className={styles.eventInfoIcon} />
                            线上活动
                          </>
                        ) : (
                          <>
                            <MapPin size={14} className={styles.eventInfoIcon} />
                            {event.location || '未指定地点'}
                          </>
                        )}
                      </div>
                      {event.participants > 0 && (
                        <div className={styles.eventInfoItem}>
                          <Users size={14} className={styles.eventInfoIcon} />
                          {event.participants}人
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Drawer>

      </div>
    </div>
  );
};

export default EventsCalendar;