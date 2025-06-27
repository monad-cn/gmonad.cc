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
import { SiDiscord } from "react-icons/si"
import { useEffect, useState } from "react"
import { StatisticsUrl } from "../api/api"
import CountUp from "react-countup"
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
                        <Activity size={20} style={{ marginRight: 8, color: "#8b5cf6" }} />
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
                                        value={stat?.validators as number} color="#8b5cf6" showDecimals={false} showSuffix={false} />
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
                                        钱包需在 Ethereum 主网持有 ≥0.03 ETH，且完成 ≥3 笔主网交易；钱包内 MON 数量少于 5。符合条件可每 6 小时领取 0.1 MON。
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

                    <Row gutter={[16, 16]}>
                        {[
                            {
                                name: "XXX",
                                category: "DeFi",
                                icon: TrendingUp,
                                color: "#10b981",
                                description: "去中心化交易所，提供代币交换、流动性挖矿等功能",
                                metric: "TVL: $2.3M",
                            },
                            {
                                name: "XXX",
                                category: "NFT",
                                icon: Star,
                                color: "#8b5cf6",
                                description: "NFT 市场平台，支持创建、交易和展示数字艺术品",
                                metric: "交易量: 1.2K ETH",
                            },
                            {
                                name: "XXXX",
                                category: "游戏",
                                icon: Zap,
                                color: "#3b82f6",
                                description: "区块链游戏平台，玩家可以赚取代币和NFT奖励",
                                metric: "活跃玩家: 5.6K",
                            },
                        ].map((project, index) => (
                            <Col xs={24} sm={12} lg={8} key={index}>
                                <Card size="small" className={styles.projectCard}>
                                    <div className={styles.projectContent}>
                                        <div className={styles.projectHeader}>
                                            <div className={styles.projectIcon} style={{ background: `${project.color}15` }}>
                                                <project.icon size={20} color={project.color} />
                                            </div>
                                            <div className={styles.projectInfo}>
                                                <Text strong className={styles.projectName}>
                                                    {project.name}
                                                </Text>
                                                <Tag style={{ background: `${project.color}15`, color: project.color, border: 0 }}>
                                                    {project.category}
                                                </Tag>
                                            </div>
                                        </div>
                                        <Text type="secondary" className={styles.projectDescription}>
                                            {project.description}
                                        </Text>
                                        <div className={styles.projectFooter}>
                                            <Text type="secondary" className={styles.projectMetric}>
                                                {project.metric}
                                            </Text>
                                            <Button
                                                size="small"
                                                type="link"
                                                className={styles.projectButton}
                                            >
                                                体验 <ExternalLink size={10} />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
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
