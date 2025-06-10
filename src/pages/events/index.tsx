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
} from "lucide-react"
import styles from "./index.module.css"
import Link from "next/link"

const events = [
  {
    id: 1,
    title: "Monad 技术分享会",
    description: "深入探讨Monad区块链的技术架构和创新特性",
    status: "upcoming",
    statusText: "即将开始",
    participants: 156,
    date: "2024年12月15日",
    location: "线上直播",
    type: "online",
    featured: true,
  },
  {
    id: 2,
    title: "开发者工作坊",
    description: "Monad智能合约开发实战训练营",
    status: "ended",
    statusText: "已结束",
    participants: 89,
    date: "2024年11月28日",
    location: "北京 中关村",
    type: "offline",
    featured: false,
  },
  {
    id: 3,
    title: "社区AMA问答",
    description: "与Monad核心团队直接对话，解答技术疑问",
    status: "ended",
    statusText: "已结束",
    participants: 234,
    date: "2024年11月10日",
    location: "Discord语音频道",
    type: "online",
    featured: true,
  },
]

export default function EventsPage() {
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

      {/* Events Grid */}
      <div className={styles.eventsGrid}>
        {events.map((event) => (
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
                  {event.date}
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
                  <button className={styles.actionButton} title="编辑活动">
                    <Edit className={styles.actionIcon} />
                  </button>
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

      {/* Load More Button */}
      <div className={styles.loadMoreSection}>
        <button className={styles.loadMoreButton}>
          <Calendar className={styles.buttonIcon} />
          查看更多活动
        </button>
      </div>

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
