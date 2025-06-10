import { useState } from "react"
import { Pagination } from "antd"
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Plus,
  Edit,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Star,
  Share2,
  Download,
  Settings,
  ChevronDown,
  Video,
  Globe,
  Bookmark,
  ExternalLink,
  LayoutGrid,
  List,
} from "lucide-react"
import Link from "next/link"
import styles from "./index.module.css"

const allEvents = [
  {
    id: 1,
    title: "Monad 技术分享会",
    description: "深入探讨Monad区块链的技术架构和创新特性",
    status: "upcoming",
    statusText: "即将开始",
    participants: 156,
    date: "2024年12月15日",
    time: "14:00",
    location: "线上直播",
    type: "online",
    featured: true,
    category: "技术分享",
  },
  {
    id: 2,
    title: "开发者工作坊",
    description: "Monad智能合约开发实战训练营",
    status: "ended",
    statusText: "已结束",
    participants: 89,
    date: "2024年11月28日",
    time: "10:00",
    location: "北京 中关村",
    type: "offline",
    featured: false,
    category: "工作坊",
  },
  {
    id: 3,
    title: "社区AMA问答",
    description: "与Monad核心团队直接对话，解答技术疑问",
    status: "ended",
    statusText: "已结束",
    participants: 234,
    date: "2024年11月10日",
    time: "20:00",
    location: "Discord语音频道",
    type: "online",
    featured: true,
    category: "AMA问答",
  },
  {
    id: 4,
    title: "区块链入门讲座",
    description: "面向新手的区块链基础知识讲解",
    status: "upcoming",
    statusText: "即将开始",
    participants: 78,
    date: "2024年12月20日",
    time: "19:00",
    location: "腾讯会议",
    type: "online",
    featured: false,
    category: "技术分享",
  },
  {
    id: 5,
    title: "DeFi 协议深度解析",
    description: "深入分析主流DeFi协议的技术实现和经济模型",
    status: "upcoming",
    statusText: "即将开始",
    participants: 145,
    date: "2024年12月22日",
    time: "15:30",
    location: "上海 浦东新区",
    type: "offline",
    featured: true,
    category: "技术分享",
  },
  {
    id: 6,
    title: "NFT 创作工作坊",
    description: "学习如何创建和发布自己的NFT作品",
    status: "ended",
    statusText: "已结束",
    participants: 67,
    date: "2024年11月15日",
    time: "13:00",
    location: "深圳 南山区",
    type: "offline",
    featured: false,
    category: "工作坊",
  },
  {
    id: 7,
    title: "Web3 安全审计工作坊",
    description: "学习智能合约安全审计的最佳实践",
    status: "upcoming",
    statusText: "即将开始",
    participants: 92,
    date: "2024年12月25日",
    time: "16:00",
    location: "广州 天河区",
    type: "offline",
    featured: false,
    category: "工作坊",
  },
  {
    id: 8,
    title: "Layer 2 扩容方案解析",
    description: "深入了解各种 Layer 2 解决方案的技术原理",
    status: "upcoming",
    statusText: "即将开始",
    participants: 178,
    date: "2024年12月28日",
    time: "19:30",
    location: "Zoom 会议",
    type: "online",
    featured: true,
    category: "技术分享",
  },
]

type ViewMode = "grid" | "list"

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 4
  // 计算分页数据
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentEvents = allEvents.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

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
          <Search className={styles.searchIcon} />
          <input type="text" placeholder="搜索活动..." className={styles.searchInput} />
        </div>
        <div className={styles.filterButtons}>
          <button className={styles.filterButton}>
            <Filter className={styles.buttonIcon} />
            筛选
            <ChevronDown className={styles.chevronIcon} />
          </button>
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
          显示 {startIndex + 1}-{Math.min(endIndex, allEvents.length)} 项，共 {allEvents.length} 项
        </div>
        <div className={styles.topPagination}>
          <Pagination
            current={currentPage}
            total={allEvents.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            showQuickJumper={false}
            // size="small"
            // showTotal={false}
            className={styles.compactPagination}
          />
        </div>
      </div>

      {/* Events Display */}
      {viewMode === "grid" ? (
        <div className={styles.eventsGrid}>
          {currentEvents.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderTop}>
                  <div className={styles.statusContainer}>
                    <span
                      className={`${styles.statusBadge} ${event.status === "upcoming" ? styles.upcoming : styles.ended}`}
                    >
                      {event.statusText}
                    </span>
                    {event.featured && <Star className={styles.featuredIcon} />}
                  </div>
                  <div className={styles.cardMenu}>
                    <button className={styles.menuButton}>
                      <MoreHorizontal className={styles.menuIcon} />
                    </button>
                  </div>
                </div>

                <h3 className={styles.eventTitle}>{event.title}</h3>
                <p className={styles.eventDescription}>{event.description}</p>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.eventDetails}>
                  <div className={styles.eventDetail}>
                    <Clock className={styles.detailIcon} />
                    {event.date} {event.time}
                  </div>
                  <div className={styles.eventDetail}>
                    {event.type === "online" ? (
                      <Video className={styles.detailIcon} />
                    ) : (
                      <MapPin className={styles.detailIcon} />
                    )}
                    {event.location}
                  </div>
                  <div className={styles.eventDetail}>
                    <Users className={styles.detailIcon} />
                    {event.participants} 人参与
                  </div>
                </div>

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
                    <p className={styles.listEventDescription}>{event.description}</p>
                    <div className={styles.eventCategory}>
                      <span className={styles.categoryTag}>{event.category}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.timeInfo}>
                    <div className={styles.dateTime}>
                      <Clock className={styles.listIcon} />
                      {event.date}
                    </div>
                    <div className={styles.time}>{event.time}</div>
                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.locationInfo}>
                    {event.type === "online" ? (
                      <Video className={styles.listIcon} />
                    ) : (
                      <MapPin className={styles.listIcon} />
                    )}
                    <span className={styles.locationText}>{event.location}</span>
                  </div>
                </div>
                <div className={styles.listCell}>
                  <div className={styles.participantsInfo}>
                    <Users className={styles.listIcon} />
                    {event.participants}
                  </div>
                </div>
                <div className={styles.listCell}>
                  <span
                    className={`${styles.listStatusBadge} ${event.status === "upcoming" ? styles.upcoming : styles.ended}`}
                  >
                    {event.statusText}
                  </span>
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
                total={allEvents.length}
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
            total={allEvents.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            // showQuickJumper={true}
            showTotal={(total, range) => `显示 ${range[0]}-${range[1]} 项，共 ${total} 项`}
            className={styles.fullPagination}
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
