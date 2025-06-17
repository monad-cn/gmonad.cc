import { Calendar, MapPin, Users, Video } from 'lucide-react';
import Link from 'next/link';
import styles from './section.module.css';
import { Key, useEffect, useState } from 'react';
import { getEvents } from '../api/event';
import dayjs from 'dayjs';


const activities = [
    {
        title: 'Web3 开发者工作坊',
        description: '探索 Solidity 和链上交互的实践技巧。',
        status: '即将开始',
        participants: '25人已报名',
        date: '2025年6月25日',
        location: '线上 Zoom',
    },
    {
        title: '社区AMA：以太坊未来发展',
        description: '与核心开发者畅聊 Ethereum 的未来。',
        status: '已结束',
        participants: '78人参与',
        date: '2025年5月15日',
        location: 'Twitter Space',
    },
];

export function formatTime(isoTime: string): string {
    return dayjs(isoTime).format('YYYY年M月D日');
}


export default function EventSection() {
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [events, setEvents] = useState<any[]>([])

    const loadEvents = async (params?: {
        keyword?: string
        tag?: string
        order?: "asc" | "desc"
        page?: number
        page_size?: number
        status?: string | number
        location?: string
        event_mode?: string
    }) => {
        try {
            const queryParams = {
                keyword: '',
                tag: '',
                order: sortOrder,
                page: 1,
                page_size: 3,
                status: 3,
                location: '',
                event_mode: '',
            }

            const result = await getEvents(queryParams)

            if (result.success && result.data) {
                // 处理后端返回的数据结构
                if (result.data.events && Array.isArray(result.data.events)) {
                    setEvents(result.data.events)
                } else if (Array.isArray(result.data)) {
                    setEvents(result.data)
                } else {
                    console.warn("API 返回的数据格式不符合预期:", result.data)
                    setEvents([])
                }
            } else {
                setEvents([])
            }
        } catch (error) {
            console.error("加载活动列表异常:", error)
            setEvents([])
        }
    }

    // 组件挂载时加载数据
    useEffect(() => {
        loadEvents()
    }, [])

    return (
        <section className={styles.activities}>
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>社区活动</h2>
                    <p className={styles.sectionDescription}>
                        发现精彩活动，链接更多 Nads
                    </p>
                </div>
                <div className={styles.activitiesGrid}>
                    {events.map((event, index) => (
                        <div key={index} className={styles.activityCard}>
                            <div className={styles.activityCardGlow}></div>
                            <div className={styles.activityCardHeader}>
                                <div className={styles.activityMeta}>
                                    <span
                                        className={`${styles.activityBadge} ${event.status === 0
                                            ? styles.activityBadgeInactive
                                            : event.status === 1
                                                ? styles.activityBadgeActive
                                                : styles.activityBadgeEnded
                                            }`}
                                    >
                                        {event.status === 0
                                            ? '未开始'
                                            : event.status === 1
                                                ? '进行中'
                                                : '已结束'}
                                    </span>
                                    <div className={styles.activityParticipants}>
                                        <Users className={styles.activityIcon} />
                                        158
                                    </div>
                                </div>
                                <h3 className={styles.activityTitle}>{event.title}</h3>
                                {/* <p className={styles.activityDescription}>{event.description}</p> */}
                            </div>
                            <div className={styles.activityCardContent}>
                                <div className={styles.activityInfo}>
                                    <div className={styles.activityInfoItem}>
                                        <Calendar className={styles.activityIcon} />
                                        {formatTime(event.date)}
                                    </div>
                                    <div className={styles.activityInfoItem}>
                                        {event.event_mode === '线上活动' ? (
                                            <Video className={styles.activityIcon} />
                                        ) : (
                                            <MapPin className={styles.activityIcon} />
                                        )}
                                        {event.event_mode}
                                    </div>
                                </div>
                                {/* 标签展示区 */}
                                <div className={styles.tagsContainer}>
                                    {(Array.isArray(event.tags) ? event.tags : event.tags?.split(','))?.map((tag: string, idx: Key | null | undefined) => (
                                        <span key={idx} className={styles.tag}>
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                                <Link href={`/events/${event.ID}`} passHref>
                                    <button className={styles.activityButton}>了解详情</button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.sectionFooter}>
                    <Link href="/events">
                        <button className={styles.moreButton}>
                            <Calendar className={styles.buttonIcon} />
                            查看更多活动
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
