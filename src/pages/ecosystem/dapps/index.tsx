import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Star, ExternalLink, BookOpen, BarChart3, Plus, Globe } from "lucide-react"
import { Spin, Pagination } from "antd"
import styles from "./index.module.css"
import { getDapps } from "@/pages/api/dapp"
import { SiX } from "react-icons/si"

type DAppCategory = "DeFi" | "基础设施" | "游戏" | "NFT" | "社交" | "开发工具" | "AI" | "DePIN" | "RWA" | "支付"

interface Tutorial {
    id: string
    title: string
    description: string
    difficulty: "初级" | "中级" | "高级"
    estimatedTime: string
    steps: number
}

interface Category {
    ID: number
    name: string
}

interface DApp {
    ID: string
    name: string
    description: string
    logo: string
    cover_img: string
    site: string
    category: Category
    x?: string
    tags: string[]
    featured?: boolean
    tutorials: Tutorial[]
    subcategories?: string[]
}

const categories: DAppCategory[] = ["DeFi", "基础设施", "游戏", "NFT", "社交", "开发工具", "AI", "DePIN", "RWA", "支付"]

export default function EcosystemPage() {
    const [selectedCategory, setSelectedCategory] = useState<DAppCategory | "all">("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [dapps, setDapps] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(8)

    useEffect(() => {
        const fetchDapps = async () => {
            try {
                setLoading(true)

                const params: any = {
                    page: currentPage,
                    page_size: pageSize,
                }
                if (searchQuery) {
                    params.keyword = searchQuery
                }
                if (selectedCategory !== "all") {
                    params.category = selectedCategory
                }

                const result = await getDapps(params)
                if (result.success && result.data && result.data.dapps && Array.isArray(result.data.dapps)) {
                    setDapps(result.data.dapps)
                    setTotal(result.data.total || 0)
                } else {
                    setDapps([])
                    setTotal(0)
                }
            } catch (error) {
                console.error("加载 DApps 列表异常:", error)
                setDapps([])
                setTotal(0)
            } finally {
                setLoading(false)
            }
        }

        fetchDapps()
    }, [searchQuery, selectedCategory, currentPage, pageSize])

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            DeFi: "#8B5CF6",
            基础设施: "#06B6D4",
            游戏: "#F59E0B",
            NFT: "#EF4444",
            社交: "#10B981",
            开发工具: "#6366F1",
            AI: "#EC4899",
            DePIN: "#84CC16",
            RWA: "#F97316",
            支付: "#3B82F6",
        }
        return colors[category] || "#8B5CF6"
    }

    const stats = {
        totalDapps: total,
        totalTutorials: dapps.reduce((acc, dapp) => acc + (dapp.tutorials?.length || 0), 0),
        categories: categories.length,
    }

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.heroHeader}>
                        <div className={styles.heroText}>
                            <h1 className={styles.heroTitle}>Monad 生态系统</h1>
                            <p className={styles.heroDescription}>
                                探索基于 Monad 构建的去中心化应用生态系统。从 DeFi 协议到基础设施工具，通过交互式教程开始体验和使用。
                            </p>
                        </div>
                        <Link href="/ecosystem/dapps/new" className={styles.addDappButton}>
                            <Plus className={styles.addIcon} />
                            添加 DApp
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <BarChart3 className={styles.statIconSvg} />
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statNumber}>{stats.totalDapps}</div>
                                <div className={styles.statLabel}>DApps</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <BookOpen className={styles.statIconSvg} />
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statNumber}>{stats.totalTutorials}</div>
                                <div className={styles.statLabel}>教程</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <Star className={styles.statIconSvg} />
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statNumber}>{stats.categories}</div>
                                <div className={styles.statLabel}>分类</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search and Filters */}
            <section className={styles.filtersSection}>
                <div className={styles.sectionContainer}>
                    <div className={styles.searchContainer}>
                        <div className={styles.searchBar}>
                            <Search className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="搜索 DApps..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                    </div>

                    <div className={styles.categoryFilters}>
                        <button
                            onClick={() => {
                                setSelectedCategory("all")
                                setCurrentPage(1)
                            }}
                            className={`${styles.categoryButton} ${selectedCategory === "all" ? styles.active : ""}`}
                        >
                            全部
                        </button>
                        {categories.map((category) => (
                            <button
                                // key={category.ID}
                                onClick={() => {
                                    setSelectedCategory(category)
                                    setCurrentPage(1)
                                }}
                                className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ""}`}
                                style={{ "--category-color": getCategoryColor(category) } as React.CSSProperties}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Results */}
            <section className={styles.resultsSection}>
                <div className={styles.sectionContainer}>
                    <div className={styles.resultsHeader}>
                        <h2 className={styles.resultsTitle}>
                            {selectedCategory === "all" ? "所有 DApps" : `${selectedCategory} DApps`}
                            <span className={styles.resultsCount}>({total})</span>
                        </h2>
                    </div>
                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.loadingSpinner}></div>
                        </div>
                    ) : (
                        <div className={styles.dappsGrid}>
                            {dapps.map((dapp) => (
                                <DAppCard key={dapp.ID} dapp={dapp} getCategoryColor={getCategoryColor} />
                            ))}
                        </div>
                    )}

                    {dapps.length === 0 && !loading && (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🔍</div>
                            <h3 className={styles.emptyTitle}>未找到 DApps</h3>
                            <p className={styles.emptyDescription}>尝试调整您的搜索或筛选条件来找到您要寻找的内容。</p>
                        </div>
                    )}
                    {/* Pagination */}
                    {total > pageSize && (
                        <div className={styles.paginationWrapper}>
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={total}
                                onChange={(page, size) => {
                                    setCurrentPage(page)
                                    setPageSize(size!)
                                }}
                                showSizeChanger
                                showQuickJumper
                            />
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

function DAppCard({ dapp, getCategoryColor }: { dapp: DApp; getCategoryColor: (category: string) => string }) {
    return (
        <div className={styles.dappCard}>
            {/* 封面图 */}
            {dapp.cover_img && (
                <div className={styles.coverContainer}>
                    <img src={dapp.cover_img} alt={`${dapp.name} cover`} className={styles.coverImage} />

                    {/* 新增 tags 区域 */}

                </div>
            )}
            {dapp.tags?.length > 0 && (
                <div className={styles.coverTags}>
                    {dapp.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className={styles.tagItem}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}
            {/* 顶部区域 */}
            <div className={styles.cardTop}>
                <div className={styles.logoContainer}>
                    <img src={dapp.logo || "/placeholder.svg"} alt={`${dapp.name} logo`} className={styles.logo} />
                </div>
                <div className={styles.cardActions}>
                    {dapp.featured && (
                        <div className={styles.featuredBadge}>
                            <Star className={styles.featuredIcon} />
                        </div>
                    )}
                    {dapp.x && (
                        <a href={dapp.x} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                            <SiX className={styles.actionIcon} />
                        </a>
                    )}
                    {dapp.site && (
                        <a href={dapp.site} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                            <Globe className={styles.actionIcon} />
                        </a>
                    )}
                </div>
            </div>

            {/* 内容 */}
            <div className={styles.cardContent}>
                <h3 className={styles.dappName}>{dapp.name}</h3>
                <p className={styles.dappDescription}>{dapp.description}</p>

                <div className={styles.categories}>
                    <span className={styles.primaryCategory}>
                        {dapp.category?.name}
                    </span>
                    {dapp.subcategories?.slice(0, 2).map((sub) => (
                        <span key={sub} className={styles.subCategory} style={{ borderColor: getCategoryColor(sub) }}>
                            {sub}
                        </span>
                    ))}
                </div>
            </div>

            {/* 教程按钮 */}
            {/* {dapp.tutorials && dapp.tutorials.length > 0 && ( */}
            <div className={styles.cardFooter}>
                <div className={styles.tutorialsInfo}>
                    <BookOpen className={styles.tutorialIcon} />
                    <span className={styles.tutorialCount}>{dapp?.tutorials?.length || 0} 个教程</span>
                </div>
                <Link href={`/ecosystem/dapps/${dapp.ID}`} className={styles.tutorialsButton}>
                    查看教程
                </Link>
            </div>
            {/* )} */}
        </div>
    )
}
