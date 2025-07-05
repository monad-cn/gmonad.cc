import Link from "next/link"
import { Card, Button, Typography, Row, Col, Space, message, Statistic, Tag, Divider } from "antd"
import {
    ArrowLeft,
    Globe,
    ExternalLink,
    Server,
    Users,
    Activity,
    Copy,
    Wallet,
    Droplets,
    Star,
    TrendingUp,
    Zap,
    CheckCircle,
    Clock,
    Calendar,
    Settings,
    Shield,
    Code,
    Layers,
    NotebookText,
    Book,
    Notebook,
    Timer,
} from "lucide-react"
import styles from "./index.module.css"
import { SiDiscord, SiX } from "react-icons/si"
import { useEffect, useRef, useState } from "react"
import { StatisticsUrl } from "../api/api"
import CountUp from "react-countup"
import { getDapps } from "../api/dapp"
const { Title, Paragraph, Text } = Typography


interface DynamicStatisticProps {
    title: string | React.ReactNode;
    value: number | string;
    color?: string;
    showDecimals?: boolean;
    showSuffix?: boolean;
    suffix?: string;
    duration?: number;
}

function DynamicStatistic({
    title,
    value,
    color = '#f59e0b',
    showDecimals = true,
    showSuffix = true,
    suffix = 's',
    duration = 1.5,
}: DynamicStatisticProps) {
    const numValue =
        typeof value === 'number'
            ? value
            : typeof value === 'string'
                ? parseFloat(value.replace(/[^\d.]/g, '')) || 0
                : 0;

    return (
        <Statistic
            title={title}
            valueRender={() => (
                <CountUp
                    end={numValue}
                    decimals={showDecimals ? 1 : 0}
                    duration={duration}
                    suffix={showSuffix ? suffix : ''}
                    preserveValue={true}
                />
            )}
            valueStyle={{ color, fontWeight: '600' }}
        />
    );
}

interface Stat {
    block_num: number;
    avg_block_time: string;
    validators: number;
    timestamp: number;
}


export default function TestnetPage() {
    const [messageApi, contextHolder] = message.useMessage()
    const [stat, setStat] = useState<Stat | null>(null);
    const [dapps, setDapps] = useState<any[]>([])
    const scrollRef = useRef<HTMLDivElement | null>(null)
    const [startedScroll, setStartedScroll] = useState(false)

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text)
            messageApi.success(`${label} 已复制到剪贴板`)
        } catch (err) {
            messageApi.error("复制失败")
        }
    }

    const addToMetaMask = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: "0x279F",
                            chainName: "Monad Testnet",
                            nativeCurrency: {
                                name: "MONAD",
                                symbol: "MON",
                                decimals: 18,
                            },
                            rpcUrls: ["https://testnet-rpc.monad.xyz/"],
                            blockExplorerUrls: ["https://testnet.monadexplorer.com/"],
                        },
                    ],
                })
                messageApi.success("网络已添加到 MetaMask")
            } catch (error) {
                messageApi.error("添加网络失败")
            }
        } else {
            messageApi.warning("请先安装 MetaMask 钱包")
        }
    }

    useEffect(() => {
        const eventSource = new EventSource(StatisticsUrl);

        eventSource.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data);
                setStat(parsed);
            } catch (err) {
                console.error('解析 SSE 数据失败:', err);
            }
        };

        eventSource.onerror = (err) => {
            console.error('SSE 连接错误:', err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);


    useEffect(() => {
        const eventSource = new EventSource(StatisticsUrl);
        eventSource.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data);
                setStat(parsed);
            } catch (err) {
                console.error('解析 SSE 数据失败:', err);
            }
        };
        eventSource.onerror = () => {
            eventSource.close();
        };
        return () => {
            eventSource.close();
        };
    }, []);

    useEffect(() => {
        const fetchDapps = async () => {
            try {
                const params: any = {
                    page: 1,
                    page_size: 20, // 你可以根据需要修改数量
                }
                const result = await getDapps(params)
                if (result.success && result.data && Array.isArray(result.data.dapps)) {
                    setDapps(result.data.dapps)
                }
            } catch (error) {
                console.error("获取 DApps 失败:", error)
            }
        }
        fetchDapps()
    }, [])

    // 滚动监听
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !startedScroll) {
                    setStartedScroll(true)
                    autoScroll()
                }
            },
            { threshold: 0.3 }
        )
        if (scrollRef.current) {
            observer.observe(scrollRef.current)
        }
        return () => {
            observer.disconnect()
        }
    }, [startedScroll])

    const autoScroll = () => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        let step = 1;

        const scroll = () => {
            container.scrollLeft += step;
            if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
                container.scrollLeft = 0; // 到底后回到最左侧
            }
            requestAnimationFrame(scroll);
        };
        scroll();
    };

    return (
        <div className={styles.container}>
            {contextHolder}

            <div className={styles.content}>
                {/* Hero Section */}
                <div className={styles.heroSection}>
                    <div className={styles.heroBackground}>
                        <div className={styles.heroGlow}></div>
                    </div>
                    <div className={styles.heroContent}>
                        <Title level={1} className={styles.heroTitle}>
                            <span className={styles.titleGradient}>在 Monad 测试网尽情体验、尝试与构建</span>
                        </Title>
                        {/* <Paragraph className={styles.heroDescription}>
              在 Monad 测试网尽情体验、尝试与构建
            </Paragraph> */}
                        <div className={styles.heroActions}>
                            <Button
                                type="primary"
                                size="large"
                                className={styles.primaryButton}
                                onClick={() => {
                                    const element = document.getElementById('faucetSection');
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            >
                                领取测试币
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                className={styles.primaryButton}
                                onClick={() => {
                                    const element = document.getElementById('dappSection');
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            >
                                体验 DApp
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Network Status */}
                <div className={styles.statusSection}>
                    <Title level={3} className={styles.sectionTitle}>
                        <Activity size={20} style={{ marginRight: 8, color: "#6366F1" }} />
                        网络实时状态
                    </Title>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={12} md={6}>
                            <Card className={`${styles.statusCard} ${styles.statusCardGreen}`}>
                                <div className={styles.statusCardContent}>
                                    <div className={styles.statusIconWrapper}>
                                        <div className={styles.statusIcon}>
                                            <CheckCircle size={24} />
                                        </div>
                                        <div className={styles.statusPulse}></div>
                                    </div>
                                    <Statistic
                                        title="网络状态"
                                        value="运行中"
                                        valueStyle={{ color: "#10b981", fontSize: "18px", fontWeight: "600" }}
                                    />
                                    {/* <Tag color="success" className={styles.statusTag}>
                                        正常运行
                                    </Tag> */}
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                            <Card className={`${styles.statusCard} ${styles.statusCardPurple}`}>
                                <Link href="https://gmonads.com/" target="_blank">
                                    <ExternalLink
                                        size={16}
                                        className={styles.externalIcon}
                                    />
                                </Link>
                                <div className={styles.statusCardContent}>
                                    <div className={styles.statusIconWrapper}>
                                        <div className={styles.statusIcon}>
                                            <Server size={24} />
                                        </div>
                                    </div>
                                    {/* <ExternalLink size={14} style={{ marginLeft: 4 }} /> */}
                                    <DynamicStatistic
                                        title={<span style={{ display: 'flex', marginLeft: 40, gap: 2 }}>
                                            验证者节点
                                            <Tag className={styles.validatorTag} style={{ borderRadius: 10 }}>Testnet-1</Tag>
                                        </span>}
                                        value={stat?.validators as number} color="#6366F1" showDecimals={false} showSuffix={false} />
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                            <Card className={`${styles.statusCard} ${styles.statusCardBlue}`}>
                                <Link href="https://testnet.monadexplorer.com/" target="_blank">
                                    <ExternalLink
                                        size={16}
                                        className={styles.externalIcon}
                                    />
                                </Link>
                                <div className={styles.statusCardContent}>
                                    <div className={styles.statusIconWrapper}>
                                        <div className={styles.statusIcon}>
                                            <Layers size={24} />
                                        </div>
                                    </div>
                                    <DynamicStatistic title="区块高度" value={stat?.block_num.toLocaleString() as string} color="#3b82f6" showDecimals={false} showSuffix={false} />
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                            <Card className={`${styles.statusCard} ${styles.statusCardOrange}`}>
                                <Link href="https://testnet.monadexplorer.com/" target="_blank">
                                    <ExternalLink
                                        size={16}
                                        className={styles.externalIcon}
                                    />
                                </Link>
                                <div className={styles.statusCardContent}>
                                    <div className={styles.statusIconWrapper}>
                                        <div className={styles.statusIcon}>
                                            <Timer size={24} />
                                        </div>
                                    </div>
                                    <DynamicStatistic title="出块时间" value={stat?.avg_block_time as string} color="#f59e0b" />
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* Network Info */}
                <Row gutter={[24, 24]} className={styles.infoSection}>
                    {/* About Testnet */}
                    <Col xs={24} lg={12}>
                        <Card className={styles.infoCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardIcon}>
                                    <Globe size={20} />
                                </div>
                                <Title level={4} style={{ margin: 0 }}>
                                    关于测试网
                                </Title>
                            </div>
                            <Divider style={{ margin: "16px 0" }} />

                            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                <div className={styles.infoItem}>
                                    <div className={styles.infoItemHeader}>
                                        <Calendar size={24} />
                                        <Text strong className={styles.phaseText}>Testnet-1：<span className={styles.phaseTime}>2025年2月19日</span></Text>
                                    </div>
                                    <div className={styles.launchInfo}>
                                        <Text type="secondary">1、首次上线于 2025 年 2 月 19 日，提供安全的无风险环境供开发者调试和用户体验社区 dApp（如 Uniswap、Fantasy Top、Dialect’s Blinks 等）。<br />
                                            2、官方建议用户尝试众多生态应用，并通过钱包（Phantom、OKX、Backpack 等）连接网络、获取测试代币并参与交互。</Text>
                                    </div>
                                </div>

                                <div className={styles.infoItem}>
                                    <div className={styles.infoItemHeader}>
                                        <Clock size={24} />
                                        <Text strong className={styles.phaseText}> Testnet-2：Validator（验证者）招募</Text>
                                        <Tag color="processing" className={styles.phaseTag}>
                                            100 - 150 名验证者
                                        </Tag>
                                    </div>
                                    <div className={styles.launchInfo}>
                                        <Text type="secondary">1、于2025年5月底启动，历时约10周，面向验证者选拔阶段。<br />
                                            2、目标数量：100–150 名验证者，旨在提升整体网络抗压与节点多样性。<br />
                                            3、官方强调：此阶段仅限验证者参与，普通用户的体验不受影响。</Text>
                                    </div>
                                </div>

                                <div className={styles.infoItem}>
                                    <div className={styles.infoItemHeader}>
                                        <NotebookText size={24} />
                                        <Text strong className={styles.phaseText}>核心须知</Text>
                                    </div>
                                    <div className={styles.launchInfo}>
                                        <Text type="secondary">1、Testnet-1 与 Testnet-2 同时运行，保证普通用户与验证者能够各自独立进行测试，不互相干扰。<br />
                                            2、验证者节点优先考虑地理多样性，提升全球网络节点的分布广度。<br />
                                            3、Testnet-2 本质是“预主网演练”，强调验证者硬件配备与运维能力，并借此为主网做准备。</Text>
                                    </div>
                                </div>
                            </Space>
                        </Card>
                    </Col>

                    {/* Network Configuration */}
                    <Col xs={24} lg={12}>
                        <Card className={styles.infoCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardIcon}>
                                    <Settings size={20} />
                                </div>
                                <Title level={4} style={{ margin: 0 }}>
                                    网络配置
                                </Title>
                            </div>
                            <Divider style={{ margin: "16px 0" }} />

                            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                <div className={styles.configItem}>
                                    <Text strong className={styles.configLabel}>
                                        网络名称
                                    </Text>
                                    <div className={styles.configRow}>
                                        <code className={styles.configCode}>Monad Testnet</code>
                                        <Button
                                            size="small"
                                            icon={<Copy size={14} />}
                                            onClick={() => copyToClipboard("Monad Testnet", "网络名称")}
                                            className={styles.copyButton}
                                        />
                                    </div>
                                </div>
                                <div className={styles.configItem}>
                                    <Text strong className={styles.configLabel}>
                                        链 ID
                                    </Text>
                                    <div className={styles.configRow}>
                                        <code className={styles.configCode}>10143</code>
                                        <Button
                                            size="small"
                                            icon={<Copy size={14} />}
                                            onClick={() => copyToClipboard("10143", "链 ID")}
                                            className={styles.copyButton}
                                        />
                                    </div>
                                </div>

                                <div className={styles.configItem}>
                                    <Text strong className={styles.configLabel}>
                                        RPC URL
                                    </Text>
                                    <div className={styles.configRow}>
                                        <code className={styles.configCode}>https://testnet-rpc.monad.xyz/</code>
                                        <Button
                                            size="small"
                                            icon={<Copy size={14} />}
                                            onClick={() => copyToClipboard("https://testnet-rpc.monad.xyz/", "RPC URL")}
                                            className={styles.copyButton}
                                        />
                                    </div>
                                </div>

                                <div className={styles.configItem}>
                                    <Text strong className={styles.configLabel}>
                                        区块链浏览器
                                    </Text>
                                    <div className={styles.configRow}>
                                        <code className={styles.configCode}>https://testnet.monadexplorer.com/</code>
                                        <Button
                                            size="small"
                                            icon={<Copy size={14} />}
                                            onClick={() => copyToClipboard("https://testnet.monadexplorer.com/", "区块浏览器")}
                                            className={styles.copyButton}
                                        />
                                    </div>
                                </div>

                                <div className={styles.configItem}>
                                    <Text strong className={styles.configLabel}>
                                        代币名称
                                    </Text>
                                    <div className={styles.configRow}>
                                        <code className={styles.configCode}>MON</code>
                                        <Button
                                            size="small"
                                            icon={<Copy size={14} />}
                                            onClick={() => copyToClipboard("MON", "代币名称")}
                                            className={styles.copyButton}
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    icon={<Wallet size={18} style={{ marginTop: '5px' }} />}
                                    onClick={addToMetaMask}
                                    className={styles.walletButton}
                                >
                                    添加到 MetaMask
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                </Row>

                {/* Faucets */}
                <Card className={styles.faucetCard} id="faucetSection">
                    <div className={styles.cardHeader}>
                        <div className={styles.cardIcon}>
                            <Droplets size={20} />
                        </div>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>
                                测试币水龙头
                            </Title>
                            <Text type="secondary">获取免费的测试币来体验测试网</Text>
                        </div>
                    </div>
                    <Divider style={{ margin: "20px 0" }} />

                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <Card size="small" className={`${styles.faucetItem} ${styles.faucetItemRecommended}`}>
                                <div className={styles.faucetContent}>
                                    <div className={styles.faucetHeader}>
                                        <Text strong className={styles.faucetText}>官方水龙头</Text>
                                        <Tag className={styles.recommendedTag}>
                                            推荐
                                        </Tag>
                                    </div>
                                    <Text type="secondary" className={styles.faucetDescription}>
                                        钱包需在 Ethereum 主网持有 ≥0.03 ETH，且完成 ≥3 笔主网交易；钱包内 MON 数量少于 5。符合条件可每 6 小时领取 2 MON。
                                    </Text>
                                    <Button
                                        type="primary"
                                        size="small"
                                        block
                                        onClick={() => window.open("https://faucet.monad.xyz/", "_blank")}
                                        className={styles.faucetButton}
                                    >
                                        领取测试币
                                        <ExternalLink size={16} style={{ marginLeft: 4 }} />
                                    </Button>
                                </div>
                            </Card>
                        </Col>

                        {/* <Col xs={24} md={8}>
                            <Card size="small" className={styles.faucetItem}>
                                <div className={styles.faucetContent}>
                                    <div className={styles.faucetHeader}>
                                        <Text strong className={styles.faucetText}>社区水龙头</Text>
                                        <Tag className={styles.communityTag}>社区</Tag>
                                    </div>
                                    <Text type="secondary" className={styles.faucetDescription}>
                                        每12小时可领取 0.1 GMON
                                    </Text>
                                    <Button
                                        size="small"
                                        block
                                        className={styles.faucetButtonSecondary}
                                    >
                                        领取测试币
                                        <ExternalLink size={16} style={{ marginLeft: 4 }} />
                                    </Button>
                                </div>
                            </Card>
                        </Col> */}

                        <Col xs={24} md={8}>
                            <Card size="small" className={styles.faucetItem}>
                                <div className={styles.faucetContent}>
                                    <div className={styles.faucetHeader}>
                                        <Text strong className={styles.faucetText}>开发者水龙头</Text>
                                        <Tag color="orange" className={styles.devTag}>
                                            开发
                                        </Tag>
                                    </div>
                                    <Text type="secondary" className={styles.faucetDescription}>
                                        登录后绑定 GitHub 账号，根据 GitHub 账号等级每日可领 0.1-1 MON。<br />
                                        <div style={{ display: 'flex', gap: '16px', marginTop: 4 }}>
                                            <span><strong>S</strong>: 1 MON</span>
                                            <span><strong>A</strong>: 0.4 MON</span>
                                            <span><strong>B</strong>: 0.3 MON</span>
                                            <span><strong>C</strong>: 0.1 MON</span>
                                        </div>
                                    </Text>
                                    <Button
                                        size="small"
                                        block
                                        onClick={() => window.open("https://faucet.openbuild.xyz/monad", "_blank")}
                                        className={styles.faucetButtonSecondary}
                                    >
                                        领取测试币
                                        <ExternalLink size={16} style={{ marginLeft: 4 }} />
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Card>

                {/* Ecosystem Projects */}
                <Card className={styles.ecosystemCard} id="dappSection">
                    <div className={styles.cardHeader}>
                        <div className={styles.cardIcon}>
                            <Star size={20} />
                        </div>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>
                                体验热门项目
                            </Title>
                            <Text type="secondary">探索在 Monad 测试网上构建的优秀项目</Text>
                        </div>
                    </div>
                    <Divider style={{ margin: "20px 0" }} />

                    <div className={styles.dappsScrollContainer} ref={scrollRef}>
                        {dapps.map((dapp) => (
                            <div key={dapp.ID} className={styles.dappCard}>
                                <div className={styles.coverContainer}>
                                    <img src={dapp.cover_img} alt={`${dapp.name} cover`} className={styles.coverImage} />
                                    <div className={styles.cardTop}>
                                        <div className={styles.cardActions}>
                                            {dapp.featured && (
                                                <div className={styles.featuredBadge}>
                                                    <Star className={styles.featuredIcon} />
                                                </div>
                                            )}
                                            {dapp.x && (
                                                <Link href={dapp.x} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                                                    <SiX size={20} />
                                                </Link>
                                            )}
                                            {dapp.site && (
                                                <Link href={dapp.site} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                                                    <Globe size={20} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.logoContainer}>
                                    <img src={dapp.logo || "/placeholder.svg"} alt={`${dapp.name} logo`} className={styles.logo} />
                                </div>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.dappName}>{dapp.name}</h3>
                                    <p className={styles.dappDescription}>{dapp.description}</p>
                                    <div className={styles.category}>
                                        <Tag className={styles.tag}>{dapp.category?.name}</Tag>
                                    </div>
                                </div>
                                <div className={styles.cardFooter}>
                                    <div className={styles.tutorialsInfo}>
                                        <Book size={16} />
                                        <span className={styles.tutorialCount}>{dapp.tutorials?.length || 0} 个教程</span>
                                    </div>
                                    <Link href={`/ecosystem/dapps/${dapp.ID}`} className={styles.tutorialsButton}>
                                        查看教程
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
                {/* Call to Action */}
                <div className={styles.ctaSection}>
                    <div className={styles.ctaStars}>
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className={styles.star}
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 3}s`,
                                }}
                            />
                        ))}
                    </div>
                    <div className={styles.ctaContent}>
                        <Title level={2} className={styles.ctaTitle}>
                            准备好加入 Monad 生态系统了吗？
                        </Title>
                        <Paragraph className={styles.ctaDescription}>与全球开发者一起构建去中心化的未来</Paragraph>
                        <Space size="middle" className={styles.ctaActions}>
                            <Button
                                size="large"
                                onClick={() => window.open("https://developers.monad.xyz/#quick-start", "_blank")}
                                className={styles.ctaWhiteButton}
                            >
                                快速开始
                            </Button>
                            <Button
                                size="large"
                                onClick={() => window.open("https://docs.monad.xyz/", "_blank")}
                                className={styles.ctaTransparentButton}
                            >
                                开发文档
                            </Button>
                        </Space>
                    </div>
                </div>
            </div>
        </div>
    )
}
