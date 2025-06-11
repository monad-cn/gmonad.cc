"use client"

import { useState, useEffect } from "react"
import { Pagination, Input, Select, Button, Tag } from "antd"
import dayjs from "dayjs"
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Plus,
  Edit,
  MoreHorizontal,
  Eye,
  Trash2,
  Star,
  Share2,
  Download,
  Settings,
  Video,
  Globe,
  Bookmark,
  ExternalLink,
  LayoutGrid,
  List,
  TagIcon,
} from "lucide-react"
import Link from "next/link"
import styles from "./index.module.css"
import { getEvents } from "../api/event"

const { Search: AntSearch } = Input
const { Option } = Select

type ViewMode = "grid" | "list"

export function formatTime(isoTime: string): string {
  return dayjs(isoTime).format("YYYY-MM-DD HH:mm")
}

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [events, setEvents] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // 加载事件列表
  const loadEvents = async (params?: {
    keyword?: string
    tag?: string
    order?: "asc" | "desc"
    page?: number
    pageSize?: number
  }) => {
    try {
      setLoading(true)

      const queryParams = {
        keyword: params?.keyword || searchKeyword,
        tag: params?.tag || selectedTag,
        order: params?.order || sortOrder,
        page: params?.page || currentPage,
        pageSize: params?.pageSize || pageSize,
      }

      console.log("加载事件列表参数:", queryParams)

      const result = await getEvents(queryParams)

      if (result.success && result.data) {
        // 处理后端返回的数据结构
        if (result.data.events && Array.isArray(result.data.events)) {
          setEvents(result.data.events)
          setCurrentPage(result.data.page || 1)
          setPageSize(result.data.page_size || 10)
          setTotal(result.data.total || result.data.events.length)
        } else if (Array.isArray(result.data)) {
          setEvents(result.data)
          setTotal(result.data.length)
        } else {
          console.warn("API 返回的数据格式不符合预期:", result.data)
          setEvents([])
          setTotal(0)
        }
      } else {
        console.error("获取事件列表失败:", result.message)
        setEvents([])
        setTotal(0)
      }
    } catch (error) {
      console.error("加载事件列表异常:", error)
      setEvents([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }


  // 搜索事件
  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword)
    setCurrentPage(1) // 重置到第一页
    await loadEvents({ keyword, page: 1 })
  }

  // 按标签筛选
  const handleTagFilter = async (tag: string) => {
    setSelectedTag(tag)
    setCurrentPage(1) // 重置到第一页
    await loadEvents({ tag, page: 1 })
  }

  // 排序切换
  const handleSortChange = async (order: "asc" | "desc") => {
    setSortOrder(order)
    await loadEvents({ order })
  }

  // 分页处理
  const handlePageChange = async (page: number, size?: number) => {
    setCurrentPage(page)
    if (size && size !== pageSize) {
      setPageSize(size)
    }
    await loadEvents({ page, pageSize: size || pageSize })
  }

  // 清除筛选
  const handleClearFilters = async () => {
    setSearchKeyword("")
    setSelectedTag("")
    setSortOrder("desc")
    setCurrentPage(1)
    await loadEvents({
      keyword: "",
      tag: "",
      order: "desc",
      page: 1,
    })
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadEvents()
  }, [])

  // 计算当前显示的事件
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, total)

  const currentEvents = events // 服务端已经处理了分页

  // 获取事件类型显示文本
  const getCategoryText = (categary: string) => {
    switch (categary) {
      case "online":
        return "线上活动"
      case "offline":
        return "线下活动"
      default:
        return categary
    }
  }

  // 获取事件状态显示文本
  const getStatusText = (event: any) => {
    const now = dayjs()
    const startTime = dayjs(event.start_time)
    const endTime = event.end_time ? dayjs(event.end_time) : null

    if (endTime && now.isAfter(endTime)) {
      return "已结束"
    } else if (now.isAfter(startTime)) {
      return "进行中"
    } else {
      return "即将开始"
    }
  }

  // 获取事件状态类名
  const getStatusClass = (event: any) => {
    const now = dayjs()
    const startTime = dayjs(event.start_time)
    const endTime = event.end_time ? dayjs(event.end_time) : null

    if (endTime && now.isAfter(endTime)) {
      return styles.ended
    } else if (now.isAfter(startTime)) {
      return styles.ongoing
    } else {
      return styles.upcoming
    }
  }

  useEffect(() => {
    if (searchKeyword === '') {
      handleSearch('');
    }
  }, [searchKeyword]);

  return (
    <div className={styles.container}>
      {/* Title Section */}
      <div className={styles.titleSection}>
        <div className={styles.titleHeader}>
          <div className={styles.titleContent}>
            <h1 className={styles.mainTitle}>社区活动</h1>
            <p className={styles.subtitle}>定期举办各种技术分享会、工作坊和交流活动，为社区成员提供学习和成长的机会</p>
          </div>
          <div className={styles.actionButtons}>
            <Link href="/events/new" className={styles.createButton}>
              <Plus className={styles.buttonIcon} />
              新建活动
            </Link>
            <button className={styles.settingsButton}>
              <Settings className={styles.buttonIcon} />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <AntSearch
            placeholder="搜索活动标题、描述..."
            allowClear
            enterButton="搜索"
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>
        <div className={styles.filterButtons}>
          <Select
            size="large"
            placeholder="选择标签"
            // allowClear
            value={selectedTag || undefined}
            onChange={handleTagFilter}
          >
            <Option value="技术分享">技术分享</Option>
            <Option value="工作坊">工作坊</Option>
            <Option value="AMA问答">AMA问答</Option>
            <Option value="社区活动">社区活动</Option>
          </Select>
          <Select value={sortOrder} style={{ width: 100 }} onChange={handleSortChange}>
            <Option value="desc">最新</Option>
            <Option value="asc">最早</Option>
          </Select>
          <Button onClick={handleClearFilters}>清除筛选</Button>
          <button className={styles.exportButton}>
            <Download className={styles.buttonIcon} />
            导出
          </button>
        </div>
      </div>

      {/* View Controls */}
      <div className={styles.viewControls}>
        <div className={styles.viewModeToggle}>
          <button
            className={`${styles.viewModeButton} ${viewMode === "grid" ? styles.active : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className={styles.viewModeIcon} />
            卡片视图
          </button>
          <button
            className={`${styles.viewModeButton} ${viewMode === "list" ? styles.active : ""}`}
            onClick={() => setViewMode("list")}
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
            {searchKeyword || selectedTag ? "没有找到符合条件的活动" : "还没有创建任何活动"}
          </div>
          {!searchKeyword && !selectedTag && (
            <Link href="/events/new" className={styles.createButton}>
              <Plus className={styles.buttonIcon} />
              创建第一个活动
            </Link>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className={styles.eventsGrid}>
          {events.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderTop}>
                  <div className={styles.statusContainer}>
                    <span className={`${styles.statusBadge} ${getStatusClass(event)}`}>{getStatusText(event)}</span>
                    {event.featured && <Star className={styles.featuredIcon} />}
                  </div>
                  <div className={styles.cardMenu}>
                    <button className={styles.menuButton}>
                      <MoreHorizontal className={styles.menuIcon} />
                    </button>
                  </div>
                </div>

                <h3 className={styles.eventTitle}>{event.title}</h3>
                <p className={styles.eventDescription}>{event.desc}</p>

                {/* 分类标签 */}
                <div className={styles.categoryContainer}>
                  <span
                    className={`${styles.categoryBadge} ${event.categary === "online" ? styles.online : styles.offline}`}
                  >
                    {event.categary === "online" ? (
                      <Video className={styles.categoryIcon} />
                    ) : (
                      <MapPin className={styles.categoryIcon} />
                    )}
                    {getCategoryText(event.categary)}
                  </span>
                </div>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.eventDetails}>
                  <div className={styles.eventDetail}>
                    <Calendar className={styles.detailIcon} />
                    {formatTime(event.start_time)}
                  </div>
                  <div className={styles.eventDetail}>
                    {event.categary === "online" ? (
                      <>
                        <Globe className={styles.detailIcon} />
                        {event.link || "线上活动"}
                      </>
                    ) : (
                      <>
                        <MapPin className={styles.detailIcon} />
                        {event.location || "未指定地点"}
                      </>
                    )}
                  </div>
                  <div className={styles.eventDetail}>
                    <Users className={styles.detailIcon} />
                    {event.participants || 0} 人参与
                  </div>
                </div>

                {/* 标签列表 */}
                {event.tags && event.tags.length > 0 && (
                  <div className={styles.tagsList}>
                    <TagIcon className={styles.tagsIcon} />
                    <div className={styles.tags}>
                      {event.tags.map((tag: string, index: number) => (
                        <Tag key={index} className={styles.tag}>
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.cardActions}>
                  <button className={styles.detailButton}>
                    <Eye className={styles.buttonIcon} />
                    了解详情
                  </button>
                  <div className={styles.actionGroup}>
                    <Link href={`/events/${event.id}/edit`} className={styles.actionButton} title="编辑活动">
                      <Edit className={styles.actionIcon} />
                    </Link>
                    <button className={styles.actionButton} title="分享活动">
                      <Share2 className={styles.actionIcon} />
                    </button>
                    <button className={styles.actionButton} title="收藏活动">
                      <Bookmark className={styles.actionIcon} />
                    </button>
                    <button className={styles.actionButton} title="外部链接">
                      <ExternalLink className={styles.actionIcon} />
                    </button>
                    <button className={`${styles.actionButton} ${styles.deleteButton}`} title="删除活动">
                      <Trash2 className={styles.actionIcon} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.listViewContainer}>
          {/* Top Pagination for List View */}
          <div className={styles.listTopControls}>
            <div className={styles.listInfo}>
              <span className={styles.listInfoText}>共 {events.length} 个活动</span>
            </div>
            <div className={styles.topPagination}>
              <Pagination
                current={currentPage}
                total={events.length}
                pageSize={pageSize}
                onChange={handlePageChange}
                // showQuickJumper={false}
                // size="small"
                // showTotal={false}
                className={styles.compactPagination}
              />
            </div>
          </div>

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
              <div key={event.id} className={styles.listRow}>
                <div className={styles.listCell}>
                  <div className={styles.eventInfo}>
                    <div className={styles.eventTitleRow}>
                      <h3 className={styles.listEventTitle}>{event.title}</h3>
                      {event.featured && <Star className={styles.listFeaturedIcon} />}
                    </div>
                    <p className={styles.listEventDescription}>{event.desc}</p>
                    <div className={styles.eventCategory}>
                      <span
                        className={`${styles.categoryTag} ${event.categary === "online" ? styles.onlineTag : styles.offlineTag}`}
                      >
                        {getCategoryText(event.categary)}
                      </span>

                      {/* 标签列表 */}
                      {event.tags && event.tags.length > 0 && (
                        <div className={styles.listTags}>
                          {event.tags.map((tag: string, index: number) => (
                            <Tag key={index} className={styles.listTag}>
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.timeInfo}>
                    <div className={styles.dateTime}>
                      <Clock className={styles.listIcon} />
                      {formatTime(event.start_time)}
                    </div>
                    {event.end_time && <div className={styles.time}>至 {formatTime(event.end_time)}</div>}
                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.locationInfo}>
                    {event.categary === "online" ? (
                      <>
                        <Globe className={styles.listIcon} />
                        <span className={styles.locationText}>{event.link || "线上活动"}</span>
                      </>
                    ) : (
                      <>
                        <MapPin className={styles.listIcon} />
                        <span className={styles.locationText}>{event.location || "未指定地点"}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.participantsInfo}>
                    <Users className={styles.listIcon} />
                    {event.participants || 0}
                  </div>
                </div>
                <div className={styles.listCell}>
                  <span className={`${styles.listStatusBadge} ${getStatusClass(event)}`}>{getStatusText(event)}</span>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.listActions}>
                    <button className={styles.listActionButton} title="查看详情">
                      <Eye className={styles.listActionIcon} />
                    </button>
                    <Link href={`/events/${event.id}/edit`} className={styles.listActionButton} title="编辑活动">
                      <Edit className={styles.listActionIcon} />
                    </Link>
                    <button className={styles.listActionButton} title="分享活动">
                      <Share2 className={styles.listActionIcon} />
                    </button>
                    <button className={`${styles.listActionButton} ${styles.deleteButton}`} title="删除活动">
                      <Trash2 className={styles.listActionIcon} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Pagination for List View */}
          <div className={styles.listBottomControls}>
            <div className={styles.bottomPagination}>
              <Pagination
                current={currentPage}
                total={events.length}
                pageSize={pageSize}
                onChange={handlePageChange}
                // showQuickJumper={true}
                showTotal={(total, range) => `显示 ${range[0]}-${range[1]} 项，共 ${total} 项`}
                className={styles.fullPagination}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pagination for Grid View */}
      {viewMode === "grid" && (
        <div className={styles.paginationSection}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
            // showQuickJumper={true}
            showSizeChanger={true}
            showTotal={(total, range) => `显示 ${range[0]}-${range[1]} 项，共 ${total} 项`}
            className={styles.fullPagination}
            // loading={loading}
          />
        </div>
      )}

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Calendar className={styles.statIconSvg} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>12</div>
            <div className={styles.statLabel}>本月活动</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users className={styles.statIconSvg} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>1,234</div>
            <div className={styles.statLabel}>总参与人数</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Globe className={styles.statIconSvg} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>8</div>
            <div className={styles.statLabel}>线上活动</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MapPin className={styles.statIconSvg} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>4</div>
            <div className={styles.statLabel}>线下活动</div>
          </div>
        </div>
      </div>
    </div>
  )
}
