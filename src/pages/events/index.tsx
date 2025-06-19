import { useState, useEffect } from 'react';
import {
  Pagination,
  Input,
  Select,
  Button,
  Tag,
  Card,
  Image,
  Popconfirm,
  message,
  Modal,
} from 'antd';
import dayjs from 'dayjs';
import {
  Calendar,
  Users,
  MapPin,
  Plus,
  Edit,
  Eye,
  Trash2,
  Star,
  Share2,
  Globe,
  LayoutGrid,
  List,
} from 'lucide-react';
import { SiWechat, SiX, SiTelegram, SiDiscord } from 'react-icons/si';
import Link from 'next/link';
import styles from './index.module.css';
import { getEvents, deleteEvent } from '../api/event';
import router from 'next/router';
import { useSession } from 'next-auth/react';

const { Search: AntSearch } = Input;
const { Option } = Select;

type ViewMode = 'grid' | 'list';

export function formatTime(isoTime: string): string {
  return dayjs(isoTime).format('YYYY-MM-DD');
}

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [events, setEvents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [wechatModalVisible, setWechatModalVisible] = useState(false);
  const { data: session, status } = useSession();

  const permissions = session?.user?.permissions || []

  // 新增筛选状态
  const [statusFilter, setStatusFilter] = useState('3');
  const [locationKeyword, setLocationKeyword] = useState('');
  const [eventModeFilter, setEventModeFilter] = useState('');

  // 加载事件列表
  const loadEvents = async (params?: {
    keyword?: string;
    tag?: string;
    order?: 'asc' | 'desc';
    page?: number;
    page_size?: number;
    status?: string | number;
    location?: string;
    event_mode?: string;
  }) => {
    try {
      setLoading(true);

      const queryParams = {
        keyword: params?.keyword || searchKeyword,
        tag: params?.tag || selectedTag,
        order: params?.order || sortOrder,
        page: params?.page || currentPage,
        page_size: params?.page_size || pageSize,
        status: params?.status || statusFilter,
        location: params?.location || locationKeyword,
        event_mode: params?.event_mode || eventModeFilter,
      };


      const result = await getEvents(queryParams);

      if (result.success && result.data) {
        // 处理后端返回的数据结构
        if (result.data.events && Array.isArray(result.data.events)) {
          setEvents(result.data.events);
          setCurrentPage(result.data.page || 1);
          setPageSize(result.data.page_size || 6);
          setTotal(result.data.total || result.data.events.length);
        } else if (Array.isArray(result.data)) {
          setEvents(result.data);
          setTotal(result.data.length);
        } else {
          console.warn('API 返回的数据格式不符合预期:', result.data);
          setEvents([]);
          setTotal(0);
        }
      } else {
        console.error('获取事件列表失败:', result.message);
        setEvents([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('加载事件列表异常:', error);
      setEvents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 搜索事件
  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1); // 重置到第一页
    await loadEvents({ keyword, page: 1 });
  };

  // 按标签筛选
  const handleTagFilter = async (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1); // 重置到第一页
    await loadEvents({ tag, page: 1 });
  };

  // 排序切换
  const handleSortChange = async (order: 'asc' | 'desc') => {
    setSortOrder(order);
    await loadEvents({ order });
  };

  // 状态筛选
  const handleStatusFilter = async (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    await loadEvents({ status, page: 1 });
  };

  // 地址搜索
  const handleLocationSearch = async (location: string) => {
    setLocationKeyword(location);
    setCurrentPage(1);
    await loadEvents({ location, page: 1 });
  };

  // 活动类型筛选
  const handleEventModeFilter = async (event_mode: string) => {
    setEventModeFilter(event_mode);
    setCurrentPage(1);
    await loadEvents({ event_mode, page: 1 });
  };

  // 分页处理
  const handlePageChange = async (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
    await loadEvents({ page, page_size: size || pageSize });
  };

  // 清除筛选
  const handleClearFilters = async () => {
    setSearchKeyword('');
    setSelectedTag('');
    setSortOrder('desc');
    setStatusFilter('3');
    setLocationKeyword('');
    setEventModeFilter('');
    setCurrentPage(1);
    await loadEvents({
      keyword: '',
      tag: '',
      order: 'desc',
      status: '3',
      location: '',
      event_mode: '',
      page: 1,
    });
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadEvents();
  }, []);

  // 计算当前显示的事件
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  const currentEvents = events; // 服务端已经处理了分页

  // 获取事件状态显示文本
  const getStatusText = (event: any) => {
    // const now = dayjs()
    // const startTime = dayjs(event.start_time)
    // const endTime = event.end_time ? dayjs(event.end_time) : null

    // if (endTime && now.isAfter(endTime)) {
    if (event.status === 0) {
      return '未开始';
    } else if (event.status === 1) {
      return '进行中';
    } else {
      return '已结束';
    }
  };

  // 获取事件状态类名
  const getStatusClass = (event: any) => {
    const now = dayjs();
    const startTime = dayjs(event.start_time);
    const endTime = event.end_time ? dayjs(event.end_time) : null;

    if (endTime && now.isAfter(endTime)) {
      return styles.ended;
    } else if (now.isAfter(startTime)) {
      return styles.ongoing;
    } else {
      return styles.upcoming;
    }
  };

  const handleDeleteEvent = async (id: number) => {
    // 调用创建事件接口
    try {
      const result = await deleteEvent(id);
      if (result.success) {
        message.success(result.message);
        loadEvents();
      } else {
        message.error(result.message || '创建活动失败');
      }
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  useEffect(() => {
    if (searchKeyword === '') {
      handleSearch('');
    }

    if (locationKeyword === '') {
      handleLocationSearch('');
    }
  }, [searchKeyword, locationKeyword]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>加载中...</p>
      </div>
    )
  }


  return (
    <div className={styles.container}>
      {/* Title Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>社区活动</h1>
            <p className={styles.subtitle}>发现精彩活动，连接志同道合的人</p>
          </div>
          <div className={styles.headerRightActions}>
            <div className={styles.socialLinks}>
              <a
                href="https://x.com/monad_zw"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialButton}
              >
                <SiX size={18} className={styles.socialIcon} />
                <span className={styles.socialButtonText}>关注 X</span>
              </a>
              <a
                href="https://t.me/Chinads"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialButton}
              >
                <SiTelegram size={18} className={styles.socialIcon} />
                <span className={styles.socialButtonText}>加入 Telegram</span>
              </a>
              <a
                href="https://discord.gg/monad"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialButton}
              >
                <SiDiscord size={18} className={styles.socialIcon} />{' '}
                {/* Lucide 没有 Discord 图标，用 Users 替代 */}
                <span className={styles.socialButtonText}>加入 Discord</span>
              </a>
              <button
                className={styles.socialButton}
                onClick={() => setWechatModalVisible(true)}
              >
                <SiWechat size={18} className={styles.socialIcon} />
                <span className={styles.socialButtonText}>微信群</span>
              </button>
            </div>
            {status === "authenticated" && permissions.includes("event:write") ? (
              <Link href="/events/new" className={styles.createButton}>
                <Plus size={20} />
                创建活动
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <AntSearch
            placeholder="搜索活动标题、描述..."
            allowClear
            size="small"
            enterButton="搜索"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            onClear={() => handleSearch('')}
            loading={loading}
          />
        </div>
        <div className={styles.filterButtons}>
          <Select
            size="small"
            placeholder="选择标签"
            allowClear
            style={{ width: 120 }}
            value={selectedTag || undefined}
            onChange={handleTagFilter}
          >
            <Option value="">所有</Option>
            <Option value="技术分享">技术分享</Option>
            <Option value="工作坊">工作坊</Option>
            <Option value="AMA问答">AMA问答</Option>
            <Option value="社区活动">社区活动</Option>
          </Select>
          <Select
            size="small"
            value={sortOrder}
            style={{ width: 100 }}
            onChange={handleSortChange}
          >
            <Option value="desc">最新</Option>
            <Option value="asc">最早</Option>
          </Select>
          <Select
            placeholder="活动状态"
            allowClear
            size="small"
            style={{ width: 120 }}
            value={statusFilter || undefined}
            onChange={handleStatusFilter}
          >
            <Option value="3">所有</Option>
            <Option value="0">未开始</Option>
            <Option value="1">进行中</Option>
            <Option value="2">已结束</Option>
          </Select>

          <Select
            size="small"
            placeholder="活动形式"
            allowClear
            style={{ width: 120 }}
            value={eventModeFilter}
            onChange={handleEventModeFilter}
          >
            <Option value="">所有</Option>
            <Option value="线上活动">线上活动</Option>
            <Option value="线下活动">线下活动</Option>
          </Select>

          <div className={styles.locationSearch}>
            <Input
              size="small"
              placeholder="活动地点"
              allowClear
              value={locationKeyword}
              onChange={(e) => setLocationKeyword(e.target.value)}
              onPressEnter={() => handleLocationSearch(locationKeyword)}
            />
          </div>
          <Button size="small" onClick={handleClearFilters}>
            清除筛选
          </Button>
        </div>
      </div>

      {/* View Controls */}
      <div className={styles.viewControls}>
        <div className={styles.viewModeToggle}>
          <button
            className={`${styles.viewModeButton} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className={styles.viewModeIcon} />
            卡片视图
          </button>
          <button
            className={`${styles.viewModeButton} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List className={styles.viewModeIcon} />
            列表视图
          </button>
        </div>
        <div className={styles.resultsInfo}>
          显示 {startIndex}-{endIndex} 项，共 {total} 项
        </div>
      </div>

      {/* Events Display */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>加载中...</div>
        </div>
      ) : events.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>📅</div>
          <div className={styles.emptyTitle}>暂无活动</div>
          <div className={styles.emptyDescription}>
            {searchKeyword ||
              selectedTag ||
              statusFilter ||
              locationKeyword ||
              eventModeFilter
              ? '没有找到符合条件的活动'
              : '还没有创建任何活动'}
          </div>
          {!searchKeyword &&
            !selectedTag &&
            !statusFilter &&
            !locationKeyword &&
            !eventModeFilter && (
              <Link href="/events/new" className={styles.createButton}>
                <Plus className={styles.buttonIcon} />
                创建第一个活动
              </Link>
            )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className={styles.eventsGrid}>
          {events.map((event) => (
            <Link
              href={`/events/${event.ID}`}
              key={event.ID}
              className={styles.cardLink}
            >
              <Card
                className={styles.eventCard}
                cover={
                  <div className={styles.cardCover}>
                    <Image
                      alt={event.title}
                      src={
                        event.cover_img ||
                        '/placeholder.svg?height=240&width=400&text=活动封面'
                      }
                      className={styles.coverImage}
                      preview={false}
                    />
                    <div className={styles.coverOverlay}>
                      <Tag
                        className={`${styles.statusTag} ${getStatusClass(event)}`}
                      >
                        {getStatusText(event)}
                      </Tag>
                      <div className={styles.cardActions}>
                        {status === "authenticated" && permissions.includes("event:write") ? (
                          <Button
                            className={styles.actionIconButton}
                            onClick={() => router.push(`/events/${event.ID}/edit`)}
                            icon={<Edit className={styles.actionIcon} />}
                            title="编辑活动"
                          />
                        ) : null}
                        <Button
                          className={styles.actionIconButton}
                          onClick={(e) => {
                            e.preventDefault(); /* 分享逻辑 */
                          }}
                          icon={<Share2 className={styles.actionIcon} />}
                          title="分享活动"
                        />
                        <Button
                          className={styles.actionIconButton}
                          onClick={(e) => {
                            e.preventDefault();
                            if (event.twitter) {
                              window.open(event.twitter, '_blank'); // 打开外部链接
                            }
                          }}
                          icon={<SiX className={styles.actionIcon} />}
                          title="查看推文"
                        />
                      </div>
                    </div>
                  </div>
                }
              // variant={false}
              >
                <div className={styles.cardBody}>
                  <h3 className={styles.eventTitle}>{event.title}</h3>

                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <Calendar className={styles.metaIcon} />
                      <span>{formatTime(event.start_time)}</span>
                    </div>
                    <div className={styles.metaItem}>
                      {event.event_mode === '线上活动' ? (
                        <>
                          <Globe className={styles.metaIcon} />
                          <span className={styles.locationText}>
                            线上活动
                          </span>
                        </>
                      ) : (
                        <>
                          <MapPin className={styles.metaIcon} />
                          <span className={styles.locationText}>
                            {event.location || '未指定地点'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {event.tags && event.tags.length > 0 && (
                    <div className={styles.cardTags}>
                      {event.tags
                        .slice(0, 3)
                        .map((tag: string, index: number) => (
                          <Tag key={index} className={styles.eventTag}>
                            {tag}
                          </Tag>
                        ))}
                      {event.tags.length > 3 && (
                        <Tag className={styles.moreTag}>
                          +{event.tags.length - 3}
                        </Tag>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.listViewContainer}>
          {/* Top Pagination for List View */}

          {/* Events List */}
          <div className={styles.eventsList}>
            <div className={styles.listHeader}>
              <div className={styles.listHeaderCell}>活动信息</div>
              <div className={styles.listHeaderCell}>时间</div>
              <div className={styles.listHeaderCell}>地点</div>
              <div className={styles.listHeaderCell}>参与人数</div>
              <div className={styles.listHeaderCell}>状态</div>
              <div className={styles.listHeaderCell}>操作</div>
            </div>
            {currentEvents.map((event) => (
              <div key={event.ID} className={styles.listRow}>
                <div className={styles.listCell}>
                  <div className={styles.eventInfo}>
                    <div className={styles.eventTitleRow}>
                      <Link
                        href={`/events/${event.ID}`}
                        key={event.ID}
                        className={styles.listLink}
                      >
                        {event.title}
                      </Link>
                      {event.featured && (
                        <Star className={styles.listFeaturedIcon} />
                      )}
                    </div>
                    <p className={styles.listEventDescription}>{event.desc}</p>

                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.timeInfo}>
                    <div className={styles.dateTime}>
                      <Calendar className={styles.listIcon} />
                      <span>{formatTime(event.start_time)}</span>
                    </div>
                    {/* {event.end_time && (
                      <div className={styles.time}>
                        至 {formatTime(event.end_time)}
                      </div>
                    )} */}
                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.locationInfo}>
                    {event.event_mode === '线上活动' ? (
                      <>
                        <Globe className={styles.listIcon} />
                        <span className={styles.locationText}>
                          线上活动
                        </span>
                      </>
                    ) : (
                      <>
                        <MapPin className={styles.listIcon} />
                        <span className={styles.locationText}>
                          {event.location || '未指定地点'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.participantsInfo}>
                    <Users className={styles.listIcon} />
                    <span>{event.participants || 0}</span>
                  </div>
                </div>
                <div className={styles.listCell}>
                  <Tag
                    className={`${styles.listStatusBadge} ${getStatusClass(event)}`}
                  >
                    {getStatusText(event)}
                  </Tag>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.listActions}>
                    {/* <Button
                      type="text"
                      size="small"
                      icon={<Eye className={styles.listActionIcon} />}
                      title="查看详情"
                    /> */}
                    {status === "authenticated" && permissions.includes("event:write") ? (
                      <Button
                        type="text"
                        size="small"
                        icon={<Edit className={styles.listActionIcon} />}
                        title="编辑活动"
                        onClick={() => router.push(`/events/${event.ID}/edit`)}
                      />
                    ) : null}
                    <Button
                      type="text"
                      size="small"
                      icon={<Share2 className={styles.listActionIcon} />}
                      title="分享活动"
                    />
                    {status === "authenticated" && permissions.includes("event:delete") ? (
                      <Popconfirm
                        title="删除活动"
                        description="你确定删除这个活动吗？"
                        okText="是"
                        cancelText="否"
                        onConfirm={() => handleDeleteEvent(event.ID)}
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<Trash2 className={styles.listActionIcon} />}
                          title="删除活动"
                        />
                      </Popconfirm>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.listBottomControls}>
        <div className={styles.bottomPagination}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showQuickJumper={true}
            showTotal={(total, range) =>
              `显示 ${startIndex}-${endIndex} 项，共 ${total} 项`
            }
            className={styles.fullPagination}
          />
        </div>
      </div>
      {/* Stats Section */}
      <div className={styles.statsSection}>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon}>
              <Calendar className={styles.statIconSvg} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statNumber}>12</div>
              <div className={styles.statLabel}>本月活动</div>
            </div>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon}>
              <Users className={styles.statIconSvg} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statNumber}>1,234</div>
              <div className={styles.statLabel}>总参与人数</div>
            </div>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon}>
              <Globe className={styles.statIconSvg} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statNumber}>8</div>
              <div className={styles.statLabel}>线上活动</div>
            </div>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon}>
              <MapPin className={styles.statIconSvg} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statNumber}>4</div>
              <div className={styles.statLabel}>线下活动</div>
            </div>
          </div>
        </Card>
      </div>
      <Modal
        open={wechatModalVisible}
        onCancel={() => setWechatModalVisible(false)}
        footer={null}
        centered
        className={styles.wechatModal}
      >
        <div className={styles.wechatModalContent}>
          <div className={styles.qrCodeSection}>
            <Image
              src="/wechat.png?height=200&width=200"
              alt="小助手二维码"
              width={200}
              height={200}
              preview={false}
            />
            <p>扫码加入微信群</p>
          </div>
          <div className={styles.qrCodeSection}>
            <Image
              src="/monad_cn_gzh.png?height=200&width=200"
              alt="公众号二维码"
              width={200}
              height={200}
              preview={false}
            />
            <p>扫码关注公众号</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
