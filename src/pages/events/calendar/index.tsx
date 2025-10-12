import React, { useState, useEffect, useCallback, useMemo } from 'react';

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
} from 'antd';
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Globe,
  Eye,
  Share2
} from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getEvents } from '../../api/event';
import type { Event } from '../../api/event';
import { useAuth } from '@/contexts/AuthContext';
import styles from './index.module.css';

const { Paragraph } = Typography;
const { Option } = Select;

interface EventsByDate {
  [key: string]: Event[];
}

const EventsCalendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsByDate, setEventsByDate] = useState<EventsByDate>({});
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('3'); // 默认显示所有状态

  const router = useRouter();
  const { session, status } = useAuth();
  const permissions = useMemo(() => session?.user?.permissions || [], [session?.user?.permissions]);

  // 加载事件数据 - 优化为按日期范围查询
  const loadEvents = useCallback(async (currentDate?: Dayjs) => {
    try {
      const targetDate = currentDate || selectedDate;
      // 获取当前月份的开始和结束日期
      const startOfMonth = targetDate.startOf('month').format('YYYY-MM-DD');
      const endOfMonth = targetDate.endOf('month').format('YYYY-MM-DD');

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
    }
  }, [status, permissions, selectedDate, statusFilter]);

  useEffect(() => {
    loadEvents();
  }, [status, loadEvents]);

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

  // 获取事件类型颜色
  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'hackathon': '#722ed1',
      'workshop': '#13c2c2',
      'ama': '#eb2f96',
      'meetup': '#52c41a',
    };
    return colors[type] || '#1890ff';
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
            className={`${styles.eventItem} ${getEventStatusClass(event)}`}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/events/${event.ID}?from=calendar`);
            }}
          >
            {event.title.length > 12 ? event.title.substring(0, 12) + '...' : event.title}
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
          >
            <Option value="3">所有</Option>
            <Option value="0">未开始</Option>
            <Option value="1">进行中</Option>
            <Option value="2">已结束</Option>
          </Select>
        </div>

        {/* 日历主体 */}
        <div className={styles.calendar}>
          <Calendar
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
              const dateKey = date.format('YYYY-MM-DD');
              const dayEvents = eventsByDate[dateKey] || [];
              if (dayEvents.length > 0) {
                setSelectedDate(date);
                setSelectedEvents(dayEvents);
                setDrawerVisible(true);
              }
            }}
            onPanelChange={(date, mode) => {
              // 当切换月份或年份时，重新加载当前月份的数据
              if (mode === 'month') {
                setSelectedDate(date);
                loadEvents(date);
              }
            }}
          />
        </div>

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
                    <Link href={`/events/${event.ID}?from=calendar`} key="view">
                      <Eye size={16} /> 查看详情
                    </Link>,
                    <Button
                      key="share"
                      type="text"
                      icon={<Share2 size={16} />}
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/events/${event.ID}`);
                      }}
                    >
                      分享
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className={styles.eventTitle}>{event.title}</span>
                        <Tag color={getEventTypeColor(event.event_type)}>
                          {event.event_type}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Paragraph ellipsis={{ rows: 2 }} className={styles.eventDescription}>
                          {event.description}
                        </Paragraph>
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
                        {event.tags && event.tags.length > 0 && (
                          <div className={styles.eventTags}>
                            {event.tags.map((tag, index) => (
                              <Tag key={index} className={styles.eventTag}>{tag}</Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    }
                  />
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