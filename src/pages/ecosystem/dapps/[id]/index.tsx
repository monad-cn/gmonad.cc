import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { ArrowLeft, Clock, BarChart3, BookOpen, Play, Globe, Plus } from "lucide-react"
import styles from "./index.module.css"
import { getDappById } from "@/pages/api/dapp"
import { SiX } from "react-icons/si"
import { Avatar } from "antd"
import dayjs from "dayjs"
import { useAuth } from "@/contexts/AuthContext"

// Types
interface Tutorial {
    ID: string
    CreatedAt: string
    title: string
    description: string
    tags: string[]
    view_count: number
    publish_time: string
}

export default function DappTutorialsPage() {
    const router = useRouter()
    const { id } = router.query
    const rId = Array.isArray(id) ? id[0] : id

    const [loading, setLoading] = useState(true)
    const [dapp, setDapp] = useState<any | null>(null)
    const [selectedDifficulty, setSelectedDifficulty] = useState<"全部" | "初级" | "中级" | "高级">("全部")

    const { session, status } = useAuth();
    const permissions = session?.user?.permissions || [];

    useEffect(() => {
        if (!router.isReady || !rId) return

        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await getDappById(rId)
                if (response.success && response.data) {
                    setDapp(response.data)
                } else {
                    setDapp(null)
                }
            } catch (error) {
                console.error("获取 DApp 数据失败:", error)
                setDapp(null)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router.isReady, rId])

    const getDifficultyColor = (difficulty: string) => {
        const colors = {
            初级: "#10B981",
            中级: "#F59E0B",
            高级: "#EF4444",
        }
        return colors[difficulty as keyof typeof colors] || "#6366F1"
    }

    if (loading || !dapp) {
        return (
            <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
            </div>
        )
    }

    return (
        <div className={`${styles.container} nav-t-top`}>
            {/* Header */}
            <section className={styles.header}>
                <div className={styles.headerContent}>
                    <Link href="/ecosystem/dapps" className={styles.backButton}>
                        <ArrowLeft className={styles.backIcon} />
                        返回生态系统
                    </Link>

                    <div className={styles.dappInfo}>
                        <div className={styles.dappHeader}>
                            <img src={dapp.logo || "/placeholder.svg"} alt={`${dapp.name} logo`} className={styles.dappLogo} />
                            <div className={styles.dappDetails}>
                                <h1 className={styles.dappName}>{dapp.name}</h1>
                                <p className={styles.dappDescription}>{dapp.description}</p>
                                <div className={styles.dappMeta}>
                                    <span className={styles.category}>{dapp.category?.name}</span>
                                    {dapp.x && (
                                        <Link href={dapp.x} target="_blank" rel="noopener noreferrer" className={styles.xLink}>
                                            <SiX className={styles.actionIcon} />
                                        </Link>
                                    )}
                                    {dapp.site && (
                                        <Link href={dapp.site} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                                            <Globe className={styles.actionIcon} />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tutorials Section */}
            <section className={styles.tutorialsSection}>
                <div className={styles.sectionContainer}>
                    <div className={styles.tutorialsHeader}>
                        <h2 className={styles.tutorialsTitle}>
                            交互教程
                            <span className={styles.tutorialsCount}>({dapp?.tutorials?.length || 0})</span>
                        </h2>

                        {/* Difficulty Filter */}
                        <div className={styles.difficultyFilters}>
                            {/* 新增：添加教程按钮 */}
                            {status === "authenticated" && permissions.includes("tutorial:write") &&
                                <Link
                                    href={`/ecosystem/tutorials/new?dappId=${dapp.ID}`}
                                    className={`${styles.difficultyButton} ${styles.addTutorialButton}`}
                                    style={{
                                        backgroundColor: "#8B5CF6",
                                        borderColor: "#8B5CF6",
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px"
                                    }}
                                >
                                    <Plus size={14} />
                                    添加教程
                                </Link>
                            }

                            {/* {["全部", "初级", "中级", "高级"].map((difficulty) => (
                                <button
                                    key={difficulty}
                                    onClick={() => setSelectedDifficulty(difficulty as any)}
                                    className={`${styles.difficultyButton} ${selectedDifficulty === difficulty ? styles.active : ""}`}
                                    style={
                                        selectedDifficulty === difficulty
                                            ? {
                                                backgroundColor: difficulty === "全部" ? "#6366F1" : getDifficultyColor(difficulty),
                                                borderColor: difficulty === "全部" ? "#6366F1" : getDifficultyColor(difficulty),
                                            }
                                            : {}
                                    }
                                >
                                    {difficulty}
                                </button>
                            ))} */}
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.loadingSpinner}></div>
                        </div>
                    ) : (
                        <div>

                            {/* Tutorials Grid */}
                            <div className={styles.tutorialsGrid}>
                                {dapp.tutorials.map((tutorial: Tutorial, index: number) => (
                                    <TutorialCard
                                        key={tutorial.ID}
                                        tutorial={tutorial}
                                        index={index}
                                        getDifficultyColor={getDifficultyColor}
                                    />
                                ))}
                            </div>

                            {dapp.tutorials.length === 0 && (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>📚</div>
                                    <h3 className={styles.emptyTitle}>暂无教程</h3>
                                    {/* <p className={styles.emptyDescription}>尝试选择其他难度级别查看更多教程。</p> */}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

interface Props {
    tutorial: Tutorial;
    index: number;
    getDifficultyColor: (difficulty: string) => string;
}

function TutorialCard({ tutorial, index, getDifficultyColor }: Props) {
    return (
        <div className={styles.tutorialCard}>
            <div className={styles.cardContent}>
                <h3 className={styles.tutorialTitle}>{tutorial.title}</h3>
                <p className={styles.tutorialDescription}>{tutorial.description}</p>

                <div className={styles.tutorialMeta}>
                    <div className={styles.metaItem}>
                        <Clock className={styles.metaIcon} />
                        <span>{dayjs(tutorial.publish_time || tutorial.CreatedAt).format('YYYY-MM-DD')}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <BarChart3 className={styles.metaIcon} />
                        <span>{tutorial.view_count || 0}</span>
                    </div>
                </div>
            </div>

            <div className={styles.cardFooter}>
                <Link href={`/ecosystem/tutorials/${tutorial.ID}`} className={styles.startButton}>
                    <Play className={styles.startIcon} />
                    开始教程
                </Link>
            </div>
        </div>
    );
}
