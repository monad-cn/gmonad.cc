import { useState, useEffect } from "react"
import {
  Play,
  ArrowRight,
  Zap,
  Shield,
  Cpu,
  Users,
  MessageCircle,
  ChevronDown,
  Star,
  Globe,
  Code,
  BookOpen,
  Settings,
  Award,
  TrendingUp,
  Clock,
  Rocket,
  Database,
} from "lucide-react"
import styles from "./index.module.css"
import Link from "next/link"

export default function MonadIntro() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const [scrollY, setScrollY] = useState(0)

  const handlePlay = () => {
    setIsVideoPlaying(true);
  };


  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const founders = [
    {
      name: "Keone Hon",
      role: "CEO",
      background: "曾担任 Jump Crypto 研究主管，是并行执行和量化交易专家",
      avatar: "/avatar/keone.jpg",
      x: "https://x.com/keoneHD",
    },
    {
      name: "James Hunsaker",
      role: "CTO",
      background: "曾任 Jump Trading 高级工程师，也是 Pyth Network 的核心维护者",
      avatar: "/avatar/james.jpg",
      x: "https://x.com/_jhunsaker",
    },
    {
      name: "Eunice Giarta",
      role: "COO",
      background: "具备分布式系统和低延迟编程背景",
      avatar: "/avatar/eunice.jpg",
      x: "https://x.com/0x_eunice",
    },
  ]

  const fundingRounds = [
    {
      date: "2023年2月",
      round: "种子轮",
      amount: "1900万美元",
      lead: "Dragonfly Capital",
      description: "完成种子轮融资，为技术开发奠定基础",
    },
    {
      date: "2024年4月",
      round: "A轮",
      amount: "2.25亿美元",
      lead: "Paradigm",
      description: "当年最大规模的加密融资之一，估值约30亿美元",
    },
  ]

  const techFeatures = [
    {
      icon: <Zap className={styles.techIcon} />,
      title: "乐观并行执行",
      description: "采用乐观并行执行模式，事务并行处理后再验证顺序，提高吞吐能力",
    },
    {
      icon: <Shield className={styles.techIcon} />,
      title: "MonadBFT 共识",
      description: "基于 HotStuff 优化，仅需两阶段通信，显著加快出块速度",
    },
    {
      icon: <Clock className={styles.techIcon} />,
      title: "延迟执行",
      description: "共识与执行分离，异步处理结果，提高效率",
    },
    {
      icon: <Database className={styles.techIcon} />,
      title: "MonadDB",
      description: "针对 EVM State Trie 定制设计，支持高效并行访问",
    },
  ]

  const performanceMetrics = [
    { metric: "TPS（测试网）", value: "≈ 10,000", comparison: "远超 ETH ≈ 15 TPS" },
    { metric: "出块时间", value: "0.5s", comparison: "确认时间 1s 单槽最终确认" },
    { metric: "Gas 费用", value: "近乎零", comparison: "极低手续费" },
    { metric: "节点资源需求", value: "轻量级", comparison: "支持 SSD 存储、轻 RAM 需求" },
  ]

  const whyChooseReasons = [
    {
      icon: <TrendingUp className={styles.reasonIcon} />,
      title: "性能革命",
      description: "高 TPS + 快确认，开启实用级链上应用",
    },
    {
      icon: <Code className={styles.reasonIcon} />,
      title: "EVM 无缝迁移",
      description: "Solidity 合约、以太工具立即可用",
    },
    {
      icon: <Rocket className={styles.reasonIcon} />,
      title: "高拓展性",
      description: "并行架构 + 优化把握未来扩展",
    },
    {
      icon: <Users className={styles.reasonIcon} />,
      title: "开发者友好",
      description: "低门槛、丰富活动支持、轻硬件要求",
    },
  ]

  const getStartedSteps = [
    {
      icon: <BookOpen className={styles.stepIcon} />,
      title: "了解 Monad ",
      description: "快速入门 Monad",
      href: "/monad"
    },
    {
      icon: <Settings className={styles.stepIcon} />,
      title: "参与 Testnet",
      description: "体验生态应用",
      href: "/testnet"
    },
    {
      icon: <MessageCircle className={styles.stepIcon} />,
      title: "加入社群",
      description: "X/中文社群",
      href: "/events"
    },
    {
      icon: <Award className={styles.stepIcon} />,
      title: "参加活动",
      description: "社区活动 & 黑客松 & AMA",
      href: "/events"
    },
  ]

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroParticles}></div>
          <div className={styles.heroGradient}></div>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              <span className={styles.titleGradient}>Monad</span>
              <br />
              下一代高性能区块链
            </h1>
            <p className={styles.heroDescription}>
              突破性的并行执行技术，实现 10,000 TPS的超高性能， 同时保持 100% 的EVM兼容性。重新定义区块链的可能性。
            </p>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>10,000+</div>
                <div className={styles.statLabel}>TPS</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>0.5s</div>
                <div className={styles.statLabel}>确认时间</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>100%</div>
                <div className={styles.statLabel}>EVM兼容</div>
              </div>
            </div>
            <div className={styles.heroActions}>
              <Link href="/testnet" className={styles.primaryButton}>
                开始体验
                <ArrowRight className={styles.buttonIcon} />
              </Link>
              <Link href="https://www.monad.xyz/" target="_blank" className={styles.secondaryButton}>访问官网</Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.centerContainer}>
              <div className={styles.centerLogo}>
                <div className={styles.svgContainer}>
                  <svg
                    width="600"
                    height="600"
                    viewBox="0 0 500 400"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.logoSvg}
                  >
                    <defs>
                      {/* 阴影滤镜 */}
                      <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="8" stdDeviation="15" floodColor="#6E54FF" floodOpacity="0.3" />
                      </filter>
                    </defs>

                    {/* 中间精细 SVG 菱形 - 调整到新的中心位置 */}
                    <path
                      d="M250 50C204.024 50 90.79 163.792 90.79 209.999C90.79 256.206 204.024 370 250 370C295.976 370 409.212 256.204 409.212 209.999C409.212 163.794 295.978 50 250 50ZM225.19 301.492C205.802 296.183 153.676 204.55 158.96 185.066C164.244 165.581 255.424 113.198 274.811 118.508C294.2 123.817 346.325 215.449 341.042 234.934C335.758 254.418 244.577 306.802 225.19 301.492Z"
                      fill="#836EF9"
                      filter="url(#dropShadow)"
                      className={styles.mainDiamond}
                    />

                    {/* 四个轨道 */}
                    <circle className={styles.orbit} cx="250" cy="210" r="100" />
                    <circle className={styles.orbit} cx="250" cy="210" r="140" />
                    <circle className={styles.orbit} cx="250" cy="210" r="180" />
                    <circle className={styles.orbit} cx="250" cy="210" r="220" />

                    {/* 第一个轨道上的小点 */}
                    <g className={styles.group1}>
                      <circle className={styles.dot} cx="350" cy="210" fill="#ff4ecd" />
                    </g>

                    {/* 第二个轨道上的小点 */}
                    <g className={styles.group2}>
                      <circle className={styles.dot} cx="390" cy="210" fill="#00d084" />
                    </g>

                    {/* 第三个轨道上的小点 */}
                    <g className={styles.group3}>
                      <circle className={styles.dot} cx="430" cy="210" fill="#f5a623" />
                    </g>

                    {/* 第四个轨道上的小点 */}
                    <g className={styles.group4}>
                      <circle className={styles.dot} cx="470" cy="210" fill="#6366F1" />
                    </g>

                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className={styles.scrollIndicator}>
          <ChevronDown className={styles.scrollIcon} />
        </div> */}
      </section>

      {/* 视频介绍 Section */}
      {/* 视频介绍 Section */}
      <section className={styles.videoSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionvideoTitle}>观看视频，快速了解 Monad</h2>
          </div>
          {isVideoPlaying ? (
            <div className={styles.videoWrapper}>
              <iframe
                width="100%"
                height="500"
                src="https://www.youtube.com/embed/1kmpncaeaxE?autoplay=1"
                title="Monad Intro Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIframeLoaded(true)}
                className={`${styles.iframeVideo} ${iframeLoaded ? styles.fadeIn : ""}`}
              />
            </div>
          ) : (
            <div className={styles.videoThumbnail}>
              <img
                src="/monadintro.jpg"
                alt="Monad Video Thumbnail"
                className={styles.videoCoverImage}
              />
              <button className={styles.playButton} onClick={handlePlay}>
                <Play className={styles.playIcon} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 团队与创始人 */}
      <section className={styles.founders}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>团队与创始人</h2>
            <p className={styles.sectionDescription}>由三位资深专家共同创立，拥有丰富的区块链和金融科技经验</p>
          </div>
          <div className={styles.foundersGrid}>
            {founders.map((founder, index) => (
              <div key={index} className={styles.founderCard}>
                <Link href={founder.x} target="_blank">
                  <div className={styles.founderAvatar}>
                    <img src={founder.avatar || "/placeholder.svg"} alt={founder.name} />
                  </div>
                </Link>
                <div className={styles.founderInfo}>
                  <h3 className={styles.founderName}>{founder.name}</h3>
                  <div className={styles.founderRole}>{founder.role}</div>
                  <p className={styles.founderBackground}>{founder.background}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 融资历程 */}
      <section className={styles.funding}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>融资历程</h2>
            <p className={styles.sectionDescription}>获得顶级投资机构支持，总融资约2.44亿美元</p>
          </div>
          <div className={styles.fundingTimeline}>
            {fundingRounds.map((round, index) => (
              <div key={index} className={styles.fundingRound}>
                <div className={styles.fundingDate}>{round.date}</div>
                <div className={styles.fundingContent}>
                  <div className={styles.fundingHeader}>
                    <h3 className={styles.fundingRoundTitle}>{round.round}</h3>
                    <div className={styles.fundingAmount}>{round.amount}</div>
                  </div>
                  <div className={styles.fundingLead}>主投：{round.lead}</div>
                  <p className={styles.fundingDescription}>{round.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心技术亮点 */}
      <section className={styles.technology}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>核心技术亮点</h2>
            <p className={styles.sectionDescription}>创新的技术架构，实现前所未有的性能突破</p>
          </div>
          <div className={styles.techGrid}>
            {techFeatures.map((feature, index) => (
              <div key={index} className={styles.techCard}>
                <div className={styles.techCardHeader}>
                  {feature.icon}
                  <h3 className={styles.techCardTitle}>{feature.title}</h3>
                </div>
                <p className={styles.techCardDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 性能指标速览 */}
      <section className={styles.performance}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>性能指标速览</h2>
            <p className={styles.sectionDescription}>卓越的性能表现，重新定义区块链标准</p>
          </div>
          <div className={styles.performanceTable}>
            {performanceMetrics.map((metric, index) => (
              <div key={index} className={styles.performanceRow}>
                <div className={styles.performanceMetric}>{metric.metric}</div>
                <div className={styles.performanceValue}>{metric.value}</div>
                <div className={styles.performanceComparison}>{metric.comparison}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Monad 的生态与计划 */}
      <section className={styles.ecosystem}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Monad 的生态与计划</h2>
            <p className={styles.sectionDescription}>构建完整的开发者生态系统</p>
          </div>
          <div className={styles.ecosystemContent}>
            <div className={styles.ecosystemGrid}>
              <div className={styles.ecosystemCard}>
                <div className={styles.ecosystemIcon}>
                  <Rocket className={styles.cardIcon} />
                </div>
                <h3>测试网进展</h3>
                <p>Monad Testnet 已上线，测试网已进入活跃阶段，技术与生态正同步稳步前进</p>
              </div>
              <div className={styles.ecosystemCard}>
                <div className={styles.ecosystemIcon}>
                  <Award className={styles.cardIcon} />
                </div>
                <h3>Builder 计划</h3>
                <p>Hackathon（如 Blitz）、加速器 Mach、全球项目/Pitch 赛 Monad Madness 等支持计划</p>
              </div>
              <div className={styles.ecosystemCard}>
                <div className={styles.ecosystemIcon}>
                  <Users className={styles.cardIcon} />
                </div>
                <h3>社区活跃</h3>
                <p>覆盖 Discord、X、中文社群等平台，定期举办社区活动</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 为什么选择 Monad */}
      <section className={styles.whyChoose}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>为什么选择 Monad？</h2>
            <p className={styles.sectionDescription}>四大核心优势，引领区块链技术革新</p>
          </div>
          <div className={styles.reasonsGrid}>
            {whyChooseReasons.map((reason, index) => (
              <div key={index} className={styles.reasonCard}>
                <div className={styles.reasonIcon}>{reason.icon}</div>
                <h3 className={styles.reasonTitle}>{reason.title}</h3>
                <p className={styles.reasonDescription}>{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 如何开始 */}
      <section className={styles.getStarted}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>如何开始</h2>
            <p className={styles.sectionDescription}>四个简单步骤，开启您的 Monad 之旅</p>
          </div>
          <div className={styles.stepsGrid}>
            {getStartedSteps.map((step, index) => (
              <div key={index} className={styles.stepCard}>
                <Link href={step.href || '/'}>
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <div className={styles.stepIcon}>{step.icon}</div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContainer}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>准备好体验测试网了吗？</h2>
            <p className={styles.ctaDescription}>立即开始使用 Monad，体验前所未有的区块链性能</p>
            <div className={styles.ctaActions}>
              <Link href="/testnet" className={styles.ctaPrimary}>
                体验测试网
                <ArrowRight className={styles.buttonIcon} />
              </Link>
              <Link href="/events" className={styles.ctaSecondary}>加入中文社区</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
