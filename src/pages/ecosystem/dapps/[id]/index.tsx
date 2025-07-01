import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { ArrowLeft, Clock, BarChart3, BookOpen, Play, Globe } from "lucide-react"
import styles from "./index.module.css"
import { getDappById } from "@/pages/api/dapp"
import { SiX } from "react-icons/si"

// Types
interface Tutorial {
    id: string
    title: string
    description: string
    difficulty: "初级" | "中级" | "高级"
    estimatedTime: string
    steps: number
}

interface DApp {
    id: string
    name: string
    description: string
    logo: string
    website?: string
    category: string
    tutorials: Tutorial[]
}

export default function DappTutorialsPage() {
    const router = useRouter()
    const { id } = router.query
    const rId = Array.isArray(id) ? id[0] : id

    const [loading, setLoading] = useState(true)
    const [dapp, setDapp] = useState<any | null>(null)
    const [selectedDifficulty, setSelectedDifficulty] = useState<"全部" | "初级" | "中级" | "高级">("全部")

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
        return colors[difficulty as keyof typeof colors] || "#8B5CF6"
    }

    if (loading) {
        return <div className={styles.loading}>加载中...</div>
    }

    if (!dapp) {
        return <div className={styles.notFound}>未找到 DApp 数据</div>
    }

    // const filteredTutorials = dapp.tutorials.filter((tutorial: { difficulty: string }) => {
    //     if (selectedDifficulty === "全部") return true
    //     return tutorial.difficulty === selectedDifficulty
    // })

    return (
        <div className={styles.container}>
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
                                             <SiX />
                                        </Link>
                                    )}
                                    {dapp.site && (
                                        <Link href={dapp.site} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                                            <Globe  />
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
                            {["全部", "初级", "中级", "高级"].map((difficulty) => (
                                <button
                                    key={difficulty}
                                    onClick={() => setSelectedDifficulty(difficulty as any)}
                                    className={`${styles.difficultyButton} ${selectedDifficulty === difficulty ? styles.active : ""}`}
                                    style={
                                        selectedDifficulty === difficulty
                                            ? {
                                                backgroundColor: difficulty === "全部" ? "#8B5CF6" : getDifficultyColor(difficulty),
                                                borderColor: difficulty === "全部" ? "#8B5CF6" : getDifficultyColor(difficulty),
                                            }
                                            : {}
                                    }
                                >
                                    {difficulty}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tutorials Grid */}
                    {/* <div className={styles.tutorialsGrid}>
                        {filteredTutorials.map((tutorial, index) => (
                            <TutorialCard
                                key={tutorial.id}
                                tutorial={tutorial}
                                index={index}
                                getDifficultyColor={getDifficultyColor}
                            />
                        ))}
                    </div>

                    {filteredTutorials.length === 0 && (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📚</div>
                            <h3 className={styles.emptyTitle}>暂无该难度的教程</h3>
                            <p className={styles.emptyDescription}>尝试选择其他难度级别查看更多教程。</p>
                        </div>
                    )} */}
                </div>
            </section>
        </div>
    )
}

function TutorialCard({
    tutorial,
    index,
    getDifficultyColor,
}: {
    tutorial: Tutorial
    index: number
    getDifficultyColor: (difficulty: string) => string
}) {
    return (
        <div className={styles.tutorialCard}>
            <div className={styles.cardHeader}>
                <div className={styles.tutorialNumber}>{index + 1}</div>
                <div className={styles.cardActions}>
                    <div className={styles.difficultyBadge} style={{ backgroundColor: getDifficultyColor(tutorial.difficulty) }}>
                        {tutorial.difficulty}
                    </div>
                </div>
            </div>

            <div className={styles.cardContent}>
                <h3 className={styles.tutorialTitle}>{tutorial.title}</h3>
                <p className={styles.tutorialDescription}>{tutorial.description}</p>

                <div className={styles.tutorialMeta}>
                    <div className={styles.metaItem}>
                        <Clock className={styles.metaIcon} />
                        <span>{tutorial.estimatedTime}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <BookOpen className={styles.metaIcon} />
                        <span>{tutorial.steps} 个步骤</span>
                    </div>
                    <div className={styles.metaItem}>
                        <BarChart3 className={styles.metaIcon} />
                        <span>{tutorial.difficulty}</span>
                    </div>
                </div>
            </div>

            <div className={styles.cardFooter}>
                <button className={styles.startButton}>
                    <Play className={styles.startIcon} />
                    开始教程
                </button>
            </div>
        </div>
    )
}
