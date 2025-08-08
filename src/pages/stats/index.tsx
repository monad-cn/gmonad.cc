import { useState, useEffect, useRef } from 'react'
import { Users, BookOpen, GraduationCap, Calendar, MessageSquare, BarChart3, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import styles from './index.module.css'
import { getStatsOverview } from '../api/stats'

// 类型定义
interface StatsOverview {
    users: {
        total: number
        new_this_Week: number
        new_this_Month: number
        weekly_growth: number
        monthly_growth: number
    }
    blogs: {
        total: number
        new_this_Week: number
        new_this_Month: number
        weekly_growth: number
        monthly_growth: number
    }
    tutorials: {
        total: number
        new_this_Week: number
        new_this_Month: number
        weekly_growth: number
        monthly_growth: number
    }
    events: {
        total: number
        new_this_Week: number
        new_this_Month: number
        weekly_growth: number
        monthly_growth: number
    }
    posts: {
        total: number
        new_this_Week: number
        new_this_Month: number
        weekly_growth: number
        monthly_growth: number
    }
}

interface TimeSeriesData {
    date: string
    users: number
    blogs: number
    tutorials: number
    events: number
    posts: number
}

interface StatsResponse {
    overview: StatsOverview | null
    trend: TimeSeriesData[]
}


// 统计卡片组件
interface StatsCardProps {
    title: string
    total: number
    newThisWeek: number
    weeklyGrowth: number
    icon: React.ReactNode
    color: string
}

function StatsCard({ title, total, newThisWeek, weeklyGrowth, icon, color }: StatsCardProps) {
    const isPositiveGrowth = weeklyGrowth >= 0

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
                <span className={`${styles.growthText} ${isPositiveGrowth ? styles.positive : styles.negative}`}>
                    {isPositiveGrowth ? '+' : ''}{weeklyGrowth.toFixed(1)}%
                </span>
                <span className={styles.growthLabel}>vs 上周</span>
            </div>
        </div>
    )
}

// 趋势图表组件
interface TrendChartProps {
    data: TimeSeriesData[]
}

function TrendChart({ data }: TrendChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!canvasRef.current || !data.length) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 设置画布尺寸
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * window.devicePixelRatio
        canvas.height = rect.height * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

        const width = rect.width
        const height = rect.height
        const padding = 60

        // 清空画布
        ctx.clearRect(0, 0, width, height)

        // 数据处理
        const metrics = ['users', 'blogs', 'tutorials', 'events', 'posts']
        const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

        // 计算最大值用于缩放
        const maxValues = metrics.map(metric =>
            Math.max(...data.map(d => d[metric as keyof TimeSeriesData] as number))
        )
        const globalMax = Math.max(...maxValues)

        // 绘制网格线
        ctx.strokeStyle = '#f3f4f6'
        ctx.lineWidth = 1

        // 水平网格线
        for (let i = 0; i <= 5; i++) {
            const y = padding + (height - 2 * padding) * i / 5
            ctx.beginPath()
            ctx.moveTo(padding, y)
            ctx.lineTo(width - padding, y)
            ctx.stroke()
        }

        // 垂直网格线
        for (let i = 0; i < data.length; i++) {
            const x = padding + (width - 2 * padding) * i / (data.length - 1)
            ctx.beginPath()
            ctx.moveTo(x, padding)
            ctx.lineTo(x, height - padding)
            ctx.stroke()
        }

        // 绘制数据线
        metrics.forEach((metric, metricIndex) => {
            ctx.strokeStyle = colors[metricIndex]
            ctx.lineWidth = 2
            ctx.beginPath()

            data.forEach((point, index) => {
                const x = padding + (width - 2 * padding) * index / (data.length - 1)
                const value = point[metric as keyof TimeSeriesData] as number
                const y = height - padding - (height - 2 * padding) * value / globalMax

                if (index === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }
            })

            ctx.stroke()

            // 绘制数据点
            ctx.fillStyle = colors[metricIndex]
            data.forEach((point, index) => {
                const x = padding + (width - 2 * padding) * index / (data.length - 1)
                const value = point[metric as keyof TimeSeriesData] as number
                const y = height - padding - (height - 2 * padding) * value / globalMax

                ctx.beginPath()
                ctx.arc(x, y, 3, 0, 2 * Math.PI)
                ctx.fill()
            })
        })

        // 绘制Y轴标签
        ctx.fillStyle = '#6b7280'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'

        for (let i = 0; i <= 5; i++) {
            const y = padding + (height - 2 * padding) * i / 5
            const value = Math.round(globalMax * (5 - i) / 5)
            ctx.fillText(value.toString(), padding - 10, y)
        }

        // 绘制X轴标签
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        data.forEach((point, index) => {
            if (index % Math.ceil(data.length / 6) === 0 || index === data.length - 1) {
                const x = padding + (width - 2 * padding) * index / (data.length - 1)
                const date = new Date(point.date)
                const label = `${date.getMonth() + 1}/${date.getDate()}`
                ctx.fillText(label, x, height - padding + 10)
            }
        })

    }, [data])

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>周趋势图</h3>

                <div className={styles.chartLegend}>
                    {['用户', '博客', '教程', '活动', '帖子'].map((label, index) => (
                        <div key={label} className={styles.legendItem}>
                            <div
                                className={styles.legendColor}
                                style={{ backgroundColor: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][index] }}
                            />
                            <span className={styles.legendLabel}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.chartWrapper}>
                <canvas
                    ref={canvasRef}
                    className={styles.chart}
                />
            </div>
        </div>
    )
}

// 日历选择器组件
interface CalendarPickerProps {
    onDateRangeChange: (startDate: Date, endDate: Date) => void
}

function CalendarPicker({ onDateRangeChange }: CalendarPickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days = []

        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const prevDate = new Date(year, month, -i)
            days.push({ date: prevDate, isCurrentMonth: false })
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day)
            days.push({ date: currentDate, isCurrentMonth: true })
        }

        const remainingDays = 42 - days.length
        for (let day = 1; day <= remainingDays; day++) {
            const nextDate = new Date(year, month + 1, day)
            days.push({ date: nextDate, isCurrentMonth: false })
        }

        return days
    }

    const handleDateClick = (date: Date) => {
        setSelectedDate(date)

        // 计算周的开始和结束日期
        const dayOfWeek = date.getDay()
        const startDate = new Date(date)
        startDate.setDate(date.getDate() - dayOfWeek)

        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)

        onDateRangeChange(startDate, endDate)
        setIsOpen(false)
    }

    const handleQuickSelect = (type: 'thisWeek' | 'lastWeek') => {
        const now = new Date()
        let startDate: Date, endDate: Date

        if (type === 'thisWeek') {
            const dayOfWeek = now.getDay()
            startDate = new Date(now)
            startDate.setDate(now.getDate() - dayOfWeek)
            endDate = new Date(startDate)
            endDate.setDate(startDate.getDate() + 6)
        } else {
            const lastWeekStart = new Date(now)
            lastWeekStart.setDate(now.getDate() - now.getDay() - 7)
            const lastWeekEnd = new Date(lastWeekStart)
            lastWeekEnd.setDate(lastWeekStart.getDate() + 6)
            startDate = lastWeekStart
            endDate = lastWeekEnd
        }

        onDateRangeChange(startDate, endDate)
        setIsOpen(false)
    }

    const changeMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev)
            if (direction === 'prev') {
                newMonth.setMonth(prev.getMonth() - 1)
            } else {
                newMonth.setMonth(prev.getMonth() + 1)
            }
            return newMonth
        })
    }

    const days = getDaysInMonth(currentMonth)
    const today = new Date()

    return (
        <div className={styles.calendarPicker} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.calendarButton}
            >
                <Calendar className={styles.calendarIcon} />
                <span className={styles.calendarButtonText}>选择周期</span>
                <ChevronDown className={`${styles.calendarChevron} ${isOpen ? styles.calendarChevronOpen : ''}`} />
            </button>

            {isOpen && (
                <div className={styles.calendarDropdown}>
                    <div className={styles.calendarQuickSelect}>
                        <button
                            onClick={() => handleQuickSelect('thisWeek')}
                            className={styles.quickSelectButton}
                        >
                            本周
                        </button>
                        <button
                            onClick={() => handleQuickSelect('lastWeek')}
                            className={styles.quickSelectButton}
                        >
                            上周
                        </button>
                    </div>

                    <div className={styles.calendarNavigation}>
                        <button
                            onClick={() => changeMonth('prev')}
                            className={styles.navButton}
                        >
                            <ChevronLeft className={styles.navIcon} />
                        </button>
                        <h3 className={styles.monthTitle}>
                            {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
                        </h3>
                        <button
                            onClick={() => changeMonth('next')}
                            className={styles.navButton}
                        >
                            <ChevronRight className={styles.navIcon} />
                        </button>
                    </div>

                    <div className={styles.calendarWeekdays}>
                        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                            <div key={day} className={styles.weekday}>
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className={styles.calendarDays}>
                        {days.map(({ date, isCurrentMonth }, index) => {
                            const isToday = date.toDateString() === today.toDateString()
                            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleDateClick(date)}
                                    className={`${styles.dayButton} ${!isCurrentMonth ? styles.dayButtonInactive : ''
                                        } ${isToday ? styles.dayButtonToday : ''} ${isSelected ? styles.dayButtonSelected : ''
                                        }`}
                                >
                                    {date.getDate()}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

// 主要统计页面组件
export default function StatsIndex() {
    const [data, setData] = useState<StatsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null)

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
            setLoading(true)
            setError(null)

            try {
                const statsResult = await getStatsOverview()
                if (statsResult.success && statsResult.data) {
                    setData(statsResult.data)
                } 
                // 设置默认日期范围（本周）
                const now = new Date()
                const startDate = new Date(now)
                startDate.setDate(now.getDate() - 6)
                setDateRange({ start: startDate, end: now })
            } catch (error) {
                console.error('Failed to fetch initial stats data:', error)
                setError('获取统计数据失败，请重试')
            } finally {
                setLoading(false)
            }
        }

        fetchInitialData()
    }, [])

    // 格式化日期范围显示
    const formatDateRange = () => {
        if (!dateRange) return ''

        const formatDate = (date: Date) => {
            return date.toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric'
            })
        }

        return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
    }

    // 重新加载数据
    // const handleRetry = () => {
    //     if (dateRange) {
    //         handleDateRangeChange(dateRange.start, dateRange.end)
    //     } else {
    //         window.location.reload()
    //     }
    // }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>加载统计数据中...</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className={styles.container}>
                <div className={styles.errorContainer}>
                    <p className={styles.errorText}>{error || '无法加载统计数据'}</p>
                    <button
                        // onClick={handleRetry}
                        className={styles.retryButton}
                    >
                        重新加载
                    </button>
                </div>
            </div>
        )
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
                        <h1 className={styles.title}>数据统计</h1>
                    </div>
                    <p className={styles.subtitle}>Monad中文社区数据概览与趋势分析</p>
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

                {/* 统计卡片 */}
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

                {/* 趋势图表 */}
                <div className={styles.chartSection}>
                    <TrendChart data={data.trend} />
                </div>
            </div>
        </div>
    )
}
