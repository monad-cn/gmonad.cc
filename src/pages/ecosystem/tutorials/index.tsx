import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Input, Select, Card, Tag, Empty, Spin } from "antd"
import { Search, Clock, BookOpen, Star, Filter } from "lucide-react"
import styles from "./index.module.css"
import { getBlogs } from "@/pages/api/blog"

const { Option } = Select

interface Tutorial {
    id: string
    title: string
    description: string
    dappName: string
    category: string
    difficulty: "beginner" | "intermediate" | "advanced"
    duration: string
    image: string
    tags: string[]
    dappId: string
}

export default function TutorialsPage() {
    const [tutorials, setTutorials] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [selectedDifficulty, setSelectedDifficulty] = useState("all")
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [publishStatus, setPublishStatus] = useState(2);

    const categories = ["all", "DeFi", "NFT", "钱包", "游戏", "工具"]
    const difficulties = ["all", "beginner", "intermediate", "advanced"]

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case "beginner":
                return "初级"
            case "intermediate":
                return "中级"
            case "advanced":
                return "高级"
            default:
                return difficulty
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "beginner":
                return "success"
            case "intermediate":
                return "warning"
            case "advanced":
                return "error"
            default:
                return "default"
        }
    }
    const fetchTutorials = async (params?: {
        keyword?: string;
        tag?: string;
        order?: 'asc' | 'desc';
        page?: number;
        page_size?: number;
        publish_status?: number;
    }) => {
        try {
            setLoading(true);

            const queryParams = {
                keyword: params?.keyword ?? searchKeyword,
                order: params?.order ?? sortOrder,
                page: params?.page ?? currentPage,
                page_size: params?.page_size ?? pageSize,
                publish_status: params?.publish_status ?? publishStatus,
            };

            const result = await getBlogs(queryParams);
            if (result.success && result.data) {
                // 处理后端返回的数据结构
                if (result.data.blogs && Array.isArray(result.data.blogs)) {
                    console.log(result.data.blogs);
                    setTutorials(result.data.blogs);
                    setCurrentPage(result.data.page || 1);
                    setPageSize(result.data.page_size || 6);
                    setTotal(result.data.total || result.data.blogs.length);
                } else {
                    console.warn('API 返回的数据格式不符合预期:', result.data);
                    setTutorials([]);
                    setTotal(0);
                }
            } else {
                console.error('获取博客列表失败:', result.message);
                setTutorials([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('加载博客列表异常:', error);
            setTutorials([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTutorials()
    }, [selectedCategory, selectedDifficulty, searchKeyword, selectedTag])

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>
                        <BookOpen className={styles.titleIcon} />
                        DApp 交互教程
                    </h1>
                    <p className={styles.subtitle}>
                        从基础到进阶，掌握各种 DApp 的使用技巧。跟随我们的详细教程，轻松上手区块链应用，探索 Web3 世界的无限可能。
                    </p>
                </div>
            </div>

            <div className={styles.content}>
                <Card className={styles.filters}>
                    <div className={styles.searchBox}>
                        <Input
                            size="large"
                            placeholder="搜索教程、DApp 名称或关键词..."
                            prefix={<Search size={20} />}
                            // value={searchTerm}
                            // onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <div className={styles.filterItem}>
                            <Filter size={16} className={styles.filterIcon} />
                            <span className={styles.filterLabel}>分类：</span>
                            <Select value={selectedCategory} onChange={setSelectedCategory} className={styles.select} size="middle">
                                {categories.map((category) => (
                                    <Option key={category} value={category}>
                                        {category === "all" ? "全部分类" : category}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <div className={styles.filterItem}>
                            <Star size={16} className={styles.filterIcon} />
                            <span className={styles.filterLabel}>难度：</span>
                            <Select
                                value={selectedDifficulty}
                                onChange={setSelectedDifficulty}
                                className={styles.select}
                                size="middle"
                            >
                                {difficulties.map((difficulty) => (
                                    <Option key={difficulty} value={difficulty}>
                                        {difficulty === "all" ? "全部难度" : getDifficultyLabel(difficulty)}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {/* <div className={styles.filterItem}>
                            <Clock size={16} className={styles.filterIcon} />
                            <span className={styles.filterLabel}>排序：</span>
                            <Select value={sortBy} onChange={setSortBy} className={styles.select} size="middle">
                                <Option value="latest">最新发布</Option>
                                <Option value="popular">最受欢迎</Option>
                            </Select>
                        </div> */}
                    </div>
                </Card>

                {loading ? (
                    <div className={styles.loading}>
                        <Spin size="large" />
                    </div>
                ) : tutorials.length > 0 ? (
                    <div className={styles.tutorialGrid}>
                        {tutorials.map((tutorial) => (
                            <Link key={tutorial.ID} href={`/ecosystem/tutorials/${tutorial.ID}`} className={styles.tutorialLink}>
                                <Card
                                    hoverable
                                    className={styles.tutorialCard}
                                    cover={
                                        <div className={styles.cardImage}>
                                            <Image
                                                src={tutorial.cover_img || "/placeholder.svg"}
                                                alt={tutorial.title}
                                                width={280}
                                                height={160}
                                                className={styles.image}
                                            />
                                            {/* <div className={styles.cardOverlay}>
                                                <Tag icon={<Clock size={12} />} className={styles.duration}>
                                                    {tutorial.duration}
                                                </Tag>
                                            </div> */}
                                        </div>
                                    }
                                >
                                    <div className={styles.cardContent}>
                                        <div className={styles.cardHeader}>
                                            <h3 className={styles.cardTitle}>{tutorial.title}</h3>
                                            <div className={styles.cardMeta}>
                                                <span className={styles.dappName}>{tutorial.dapp.name}</span>
                                                {/* <Tag color={getDifficultyColor(tutorial.difficulty)} className={styles.difficulty}>
                                                    {getDifficultyLabel(tutorial.difficulty)}
                                                </Tag> */}
                                            </div>
                                        </div>

                                        <p className={styles.cardDescription}>{tutorial.description}</p>

                                        <div className={styles.cardFooter}>
                                            <div className={styles.tags}>
                                                {tutorial.tags.slice(0, 2).map((tag: any) => (
                                                    <Tag key={tag} className={styles.tag}>
                                                        {tag}
                                                    </Tag>
                                                ))}
                                            </div>
                                            {/* <Tag color="purple" className={styles.category}>
                                                {tutorial.category}
                                            </Tag> */}
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div>
                                    <h3>未找到相关教程</h3>
                                    <p>请尝试调整搜索条件或筛选器</p>
                                </div>
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
