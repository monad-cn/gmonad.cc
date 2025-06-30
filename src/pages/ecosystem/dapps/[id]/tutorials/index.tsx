import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { ArrowLeft, Clock, BarChart3, BookOpen, Play } from "lucide-react"
import { notFound } from "next/navigation"
import styles from "./index.module.css"

// Types (same as in main page)
type DAppCategory = "DeFi" | "基础设施" | "游戏" | "NFT" | "社交" | "开发工具" | "AI" | "DePIN" | "RWA" | "支付"

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
    category: DAppCategory
    subcategories?: string[]
    featured?: boolean
    tutorials: Tutorial[]
}

// Mock data (same as in main page)
const dappsData: DApp[] = [
    {
        id: "uniswap",
        name: "Uniswap",
        description: "以太坊上最大的去中心化交易协议，通过流动性池实现自动化代币交换。",
        logo: "/placeholder.svg?height=60&width=60&text=UNI",
        website: "https://uniswap.org",
        category: "DeFi",
        subcategories: ["DEX", "AMM"],
        featured: true,
        tutorials: [
            {
                id: "swap-tokens",
                title: "如何交换代币",
                description: "学习如何在 Uniswap 上以最低费用交换代币",
                difficulty: "初级",
                estimatedTime: "5 分钟",
                steps: 4,
            },
            {
                id: "provide-liquidity",
                title: "提供流动性",
                description: "通过为交易对提供流动性来赚取手续费",
                difficulty: "中级",
                estimatedTime: "10 分钟",
                steps: 6,
            },
        ],
    },
    {
        id: "aave",
        name: "Aave",
        description: "去中心化借贷协议，用户可以在没有中介的情况下借出和借入加密货币。",
        logo: "/placeholder.svg?height=60&width=60&text=AAVE",
        website: "https://aave.com",
        category: "DeFi",
        subcategories: ["借贷", "存款"],
        tutorials: [
            {
                id: "supply-assets",
                title: "存入资产赚取收益",
                description: "学习如何存入资产并赚取利息",
                difficulty: "初级",
                estimatedTime: "7 分钟",
                steps: 5,
            },
        ],
    },
    {
        id: "metamask",
        name: "MetaMask",
        description: "领先的加密钱包浏览器扩展和移动应用，用于与以太坊区块链交互。",
        logo: "/placeholder.svg?height=60&width=60&text=MM",
        website: "https://metamask.io",
        category: "基础设施",
        subcategories: ["钱包", "浏览器扩展"],
        featured: true,
        tutorials: [
            {
                id: "setup-wallet",
                title: "设置 MetaMask",
                description: "安装和配置 MetaMask 的完整指南",
                difficulty: "初级",
                estimatedTime: "10 分钟",
                steps: 7,
            },
            {
                id: "add-network",
                title: "添加自定义网络",
                description: "学习如何向 MetaMask 添加自定义网络",
                difficulty: "中级",
                estimatedTime: "5 分钟",
                steps: 3,
            },
        ],
    },
]

export default function DappTutorialsPage() {
    const router = useRouter()
    const { id } = router.query

    const [selectedDifficulty, setSelectedDifficulty] = useState<"全部" | "初级" | "中级" | "高级">("全部")
    const [dapp, setDapp] = useState<any>(null)

    useEffect(() => {
        if (id && typeof id === "string") {
            const found = dappsData.find((d) => d.id === id)
            setDapp(found || null)
        }
    }, [id])

    // 等待 query ready 时显示 loading
    if (!router.isReady) {
        return <p>Loading...</p>
    }

    if (!dapp) {
        return <p>未找到对应的 Dapp</p>
    }

    const filteredTutorials = dapp.tutorials.filter((tutorial: { difficulty: string }) => {
        if (selectedDifficulty === "全部") return true
        return tutorial.difficulty === selectedDifficulty
    })

    const getDifficultyColor = (difficulty: string) => {
        const colors = {
            初级: "#10B981",
            中级: "#F59E0B",
            高级: "#EF4444",
        }
        return colors[difficulty as keyof typeof colors] || "#8B5CF6"
    }

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
                                    <span className={styles.category}>{dapp.category}</span>
                                    {dapp.website && (
                                        <a href={dapp.website} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                                            访问网站
                                        </a>
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
                            <span className={styles.tutorialsCount}>({dapp.tutorials.length})</span>
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
                    <div className={styles.tutorialsGrid}>
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
                    )}
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
