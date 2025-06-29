"use client"

import { useState, useEffect } from "react"
import {
  Play,
  ArrowRight,
  Zap,
  Shield,
  Cpu,
  Users,
  Github,
  Twitter,
  MessageCircle,
  ChevronDown,
  Star,
  Globe,
  Code,
} from "lucide-react"
import styles from "./index.module.css"
import Link from "next/link"

export default function MonadIntro() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const features = [
    {
      icon: <Zap className={styles.featureIcon} />,
      title: "极致性能",
      description: "10,000 TPS 的超高吞吐量，0.5 秒确认时间",
      details: "Monad 通过并行执行和优化的状态访问实现了前所未有的性能表现",
    },
    {
      icon: <Shield className={styles.featureIcon} />,
      title: "EVM 兼容",
      description: "100% 兼容以太坊虚拟机，无缝迁移",
      details: "开发者可以直接部署现有的以太坊智能合约，无需任何修改",
    },
    {
      icon: <Cpu className={styles.featureIcon} />,
      title: "创新架构",
      description: "并行执行引擎，革命性的区块链设计",
      details: "采用乐观并行执行和延迟状态访问，突破传统区块链性能瓶颈",
    },
    {
      icon: <Users className={styles.featureIcon} />,
      title: "开发者友好",
      description: "完整的工具链和丰富的文档支持",
      details: "提供熟悉的开发环境和强大的调试工具，让开发更加高效",
    },
  ]

  const roadmapItems = [
    { phase: "Phase 1", title: "测试网上线", status: "completed", date: "2024 Q1" },
    { phase: "Phase 2", title: "生态扩展", status: "upcoming", date: "2024 Q3" },
    { phase: "Phase 3", title: "跨链互操作", status: "upcoming", date: "2024 Q4" },
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
                        <feDropShadow dx="0" dy="8" stdDeviation="15" floodColor="#7c3aed" floodOpacity="0.3" />
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
                      <circle className={styles.dot} cx="470" cy="210" fill="#8b5cf6" />
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

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>核心特性</h2>
            <p className={styles.sectionDescription}>Monad 通过创新技术，为区块链行业带来革命性突破</p>
          </div>
          <div className={styles.featuresGrid}>
            <div className={styles.featuresNav}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`${styles.featureNavItem} ${activeFeature === index ? styles.active : ""}`}
                  onClick={() => setActiveFeature(index)}
                >
                  {feature.icon}
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.featureContent}>
              <div className={styles.featureDetails}>
                <h3>{features[activeFeature].title}</h3>
                <p>{features[activeFeature].details}</p>
                <div className={styles.featureMetrics}>
                  <div className={styles.metric}>
                    <div className={styles.metricValue}>99.9%</div>
                    <div className={styles.metricLabel}>正常运行时间</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricValue}>0.001s</div>
                    <div className={styles.metricLabel}>延迟</div>
                  </div>
                </div>
              </div>
              <div className={styles.featureVisualization}>
                <img
                  src={`/placeholder.svg?height=400&width=600&query=${features[activeFeature].title} blockchain technology visualization`}
                  alt={features[activeFeature].title}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className={styles.videoSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.videoContainer}>
            <div className={styles.videoWrapper}>
              {!isVideoPlaying ? (
                <div className={styles.videoThumbnail}>
                  <img
                    src="/placeholder.svg?height=600&width=1000"
                    alt="Video Thumbnail"
                  />
                  <button
                    className={styles.playButton}
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    <Play className={styles.playIcon} />
                  </button>
                  <div className={styles.videoInfo}>
                    <h3>Monad 技术演示</h3>
                    <p>深入了解 Monad 的并行执行原理</p>
                  </div>
                </div>
              ) : (
                <div className={styles.iframeWrapper}>
                  <iframe
                    width="100%"
                    height="600"
                    src="https://www.youtube.com/embed/dLmtXXFv3Ro?autoplay=1"
                    title="Monad 技术演示"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Architecture Section */}
      <section className={styles.architecture}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>技术架构</h2>
            <p className={styles.sectionDescription}>创新的并行执行引擎和优化的共识机制</p>
          </div>
          <div className={styles.architectureGrid}>
            <div className={styles.architectureCard}>
              <div className={styles.cardHeader}>
                <Code className={styles.cardIcon} />
                <h3>并行执行引擎</h3>
              </div>
              <p>通过乐观并行执行，同时处理多个交易，大幅提升吞吐量</p>
              <div className={styles.cardMetric}>
                <span className={styles.metricNumber}>1000x</span>
                <span className={styles.metricText}>性能提升</span>
              </div>
            </div>
            <div className={styles.architectureCard}>
              <div className={styles.cardHeader}>
                <Shield className={styles.cardIcon} />
                <h3>优化共识</h3>
              </div>
              <p>改进的BFT共识算法，确保网络安全性和最终性</p>
              <div className={styles.cardMetric}>
                <span className={styles.metricNumber}>0.5s</span>
                <span className={styles.metricText}>最终确认</span>
              </div>
            </div>
            <div className={styles.architectureCard}>
              <div className={styles.cardHeader}>
                <Cpu className={styles.cardIcon} />
                <h3>状态管理</h3>
              </div>
              <p>延迟状态访问和智能缓存，最大化执行效率</p>
              <div className={styles.cardMetric}>
                <span className={styles.metricNumber}>90%</span>
                <span className={styles.metricText}>缓存命中率</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className={styles.roadmap}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>发展路线图</h2>
            <p className={styles.sectionDescription}>Monad的发展历程和未来规划</p>
          </div>
          <div className={styles.roadmapTimeline}>
            {roadmapItems.map((item, index) => (
              <div key={index} className={`${styles.roadmapItem} ${styles[item.status]}`}>
                <div className={styles.roadmapMarker}>
                  <div className={styles.roadmapDot}></div>
                </div>
                <div className={styles.roadmapContent}>
                  <div className={styles.roadmapPhase}>{item.phase}</div>
                  <h3 className={styles.roadmapTitle}>{item.title}</h3>
                  <div className={styles.roadmapDate}>{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className={styles.community}>
        <div className={styles.sectionContainer}>
          <div className={styles.communityContent}>
            <div className={styles.communityText}>
              <h2 className={styles.sectionTitle}>加入Monad社区</h2>
              <p className={styles.sectionDescription}>与全球开发者和用户一起，共同构建下一代区块链生态系统</p>
              <div className={styles.communityStats}>
                <div className={styles.communityStat}>
                  <Star className={styles.statIcon} />
                  <div>
                    <div className={styles.statValue}>50K+</div>
                    <div className={styles.statLabel}>社区成员</div>
                  </div>
                </div>
                <div className={styles.communityStat}>
                  <Code className={styles.statIcon} />
                  <div>
                    <div className={styles.statValue}>1000+</div>
                    <div className={styles.statLabel}>开发者</div>
                  </div>
                </div>
                <div className={styles.communityStat}>
                  <Globe className={styles.statIcon} />
                  <div>
                    <div className={styles.statValue}>100+</div>
                    <div className={styles.statLabel}>项目</div>
                  </div>
                </div>
              </div>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink}>
                  <Twitter className={styles.socialIcon} />
                  <span>Twitter</span>
                </a>
                <a href="#" className={styles.socialLink}>
                  <MessageCircle className={styles.socialIcon} />
                  <span>Discord</span>
                </a>
                <a href="#" className={styles.socialLink}>
                  <Github className={styles.socialIcon} />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
            <div className={styles.communityVisual}>
              <img src="/placeholder.svg?height=500&width=600" alt="Community" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContainer}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>准备好体验未来了吗？</h2>
            <p className={styles.ctaDescription}>立即开始使用Monad，体验前所未有的区块链性能</p>
            <div className={styles.ctaActions}>
              <button className={styles.ctaPrimary}>
                启动测试网
                <ArrowRight className={styles.buttonIcon} />
              </button>
              <button className={styles.ctaSecondary}>开发者文档</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
