import type React from "react"
import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Star, ExternalLink, BookOpen, BarChart3 } from "lucide-react"
import styles from "./index.module.css"

// Types
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

// Data
const categories: DAppCategory[] = ["DeFi", "基础设施", "游戏", "NFT", "社交", "开发工具", "AI", "DePIN", "RWA", "支付"]

const dappsData: DApp[] = [
  {
    id: "uniswap",
    name: "Uniswap",
    description: "以太坊上最大的去中心化交易协议，通过流动性池实现自动化代币交换。",
    logo: "/placeholder.svg?height=60&width=60&text=UNI",
    website: "",
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
    website: "",
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
    id: "chainlink",
    name: "Chainlink",
    description: "去中心化预言机网络，为多个区块链上的智能合约提供真实世界数据。",
    logo: "/placeholder.svg?height=60&width=60&text=LINK",
    website: "",
    category: "基础设施",
    subcategories: ["预言机", "数据"],
    tutorials: [
      {
        id: "price-feeds",
        title: "使用价格数据源",
        description: "将 Chainlink 价格数据源集成到您的智能合约中",
        difficulty: "高级",
        estimatedTime: "15 分钟",
        steps: 8,
      },
    ],
  },
  {
    id: "opensea",
    name: "OpenSea",
    description: "最大的 NFT 市场，用于购买、销售和发现数字收藏品和艺术品。",
    logo: "/placeholder.svg?height=60&width=60&text=OS",
    website: "",
    category: "NFT",
    subcategories: ["市场", "交易"],
    tutorials: [
      {
        id: "buy-nft",
        title: "购买您的第一个 NFT",
        description: "在 OpenSea 上购买 NFT 的分步指南",
        difficulty: "初级",
        estimatedTime: "8 分钟",
        steps: 6,
      },
      {
        id: "create-collection",
        title: "创建 NFT 合集",
        description: "学习如何创建和管理您自己的 NFT 合集",
        difficulty: "中级",
        estimatedTime: "20 分钟",
        steps: 10,
      },
    ],
  },
  {
    id: "compound",
    name: "Compound",
    description: "算法货币市场协议，让用户赚取利息或以抵押品借入资产。",
    logo: "/placeholder.svg?height=60&width=60&text=COMP",
    website: "",
    category: "DeFi",
    subcategories: ["借贷", "利息"],
    tutorials: [
      {
        id: "earn-interest",
        title: "赚取利息",
        description: "开始在您的加密资产上赚取利息",
        difficulty: "初级",
        estimatedTime: "6 分钟",
        steps: 4,
      },
    ],
  },
  {
    id: "metamask",
    name: "MetaMask",
    description: "领先的加密钱包浏览器扩展和移动应用，用于与以太坊区块链交互。",
    logo: "/placeholder.svg?height=60&width=60&text=MM",
    website: "",
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

export default function EcosystemPage() {
  const [selectedCategory, setSelectedCategory] = useState<DAppCategory | "全部">("全部")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDapps = useMemo(() => {
    return dappsData.filter((dapp) => {
      const matchesCategory =
        selectedCategory === "全部" ||
        dapp.category === selectedCategory ||
        dapp.subcategories?.includes(selectedCategory as string)

      const matchesSearch =
        dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dapp.description.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

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
    totalDapps: dappsData.length,
    totalTutorials: dappsData.reduce((acc, dapp) => acc + dapp.tutorials.length, 0),
    categories: categories.length,
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Monad 生态系统</h1>
          <p className={styles.heroDescription}>
            探索基于 Monad 构建的去中心化应用生态系统。从 DeFi 协议到基础设施工具，通过交互式教程开始体验。
          </p>

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
              onClick={() => setSelectedCategory("全部")}
              className={`${styles.categoryButton} ${selectedCategory === "全部" ? styles.active : ""}`}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ""}`}
                style={
                  {
                    "--category-color": getCategoryColor(category),
                  } as React.CSSProperties
                }
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Header */}
      <section className={styles.resultsSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>
              {selectedCategory === "全部" ? "所有 DApps" : `${selectedCategory} DApps`}
              <span className={styles.resultsCount}>({filteredDapps.length})</span>
            </h2>
          </div>

          {/* DApps Grid */}
          <div className={styles.dappsGrid}>
            {filteredDapps.map((dapp) => (
              <DAppCard key={dapp.id} dapp={dapp} getCategoryColor={getCategoryColor} />
            ))}
          </div>

          {filteredDapps.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3 className={styles.emptyTitle}>未找到 DApps</h3>
              <p className={styles.emptyDescription}>尝试调整您的搜索或筛选条件来找到您要寻找的内容。</p>
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
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderTop}>
          <div className={styles.logoContainer}>
            <img src={dapp.logo || "/placeholder.svg"} alt={`${dapp.name} logo`} className={styles.logo} />
          </div>
          <div className={styles.cardActions}>
            {dapp.featured && (
              <div className={styles.featuredBadge}>
                <Star className={styles.featuredIcon} />
              </div>
            )}
            {dapp.website && (
              <a href={dapp.website} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                <ExternalLink className={styles.actionIcon} />
              </a>
            )}
          </div>
        </div>

        <div className={styles.cardContent}>
          <h3 className={styles.dappName}>{dapp.name}</h3>
          <p className={styles.dappDescription}>{dapp.description}</p>

          <div className={styles.categories}>
            <span className={styles.primaryCategory} style={{ backgroundColor: getCategoryColor(dapp.category) }}>
              {dapp.category}
            </span>
            {dapp.subcategories?.slice(0, 2).map((sub) => (
              <span key={sub} className={styles.subCategory} style={{ borderColor: getCategoryColor(sub) }}>
                {sub}
              </span>
            ))}
          </div>
        </div>
      </div>

      {dapp.tutorials.length > 0 && (
        <div className={styles.cardFooter}>
          <div className={styles.tutorialsInfo}>
            <BookOpen className={styles.tutorialIcon} />
            <span className={styles.tutorialCount}>{dapp.tutorials.length} 个教程</span>
          </div>
          <Link href={`/ecosystem/dapps/${dapp.id}/tutorials`} className={styles.tutorialsButton}>
            查看教程
          </Link>
        </div>
      )}
    </div>
  )
}
