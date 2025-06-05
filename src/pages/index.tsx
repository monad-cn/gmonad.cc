import {
  Calendar,
  Users,
  Github,
  Twitter,
  Globe,
  MapPin,
  Zap,
  Rocket,
  Star,
  Code,
  Shield,
  Cpu,
  Database,
  BookOpen,
  GitBranch,
  ChevronDown,
} from "lucide-react"
import { useEffect, useState } from "react"
import styles from "./monad-community.module.css"

export default function MonadCommunity() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState({
    members: 1000,
    activities: 50,
    projects: 20,
    commits: 1250,
  })

  const [showNewsBanner, setShowNewsBanner] = useState(true)

  useEffect(() => {
    setIsVisible(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleScroll = () => {
      const scrollY = window.scrollY
      setShowNewsBanner(scrollY < 50) // 滚动超过50px时隐藏新闻栏
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("scroll", handleScroll)

    // 模拟实时数据更新
    const interval = setInterval(() => {
      setStats((prev) => ({
        members: prev.members + Math.floor(Math.random() * 3),
        activities: prev.activities,
        projects: prev.projects,
        commits: prev.commits + Math.floor(Math.random() * 5),
      }))
    }, 5000)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
      clearInterval(interval)
    }
  }, [])

  const features = [
    {
      icon: <Zap className={styles.featureIcon} />,
      title: "极致性能",
      description: "并行执行引擎，TPS达到10,000+，为DeFi应用提供无与伦比的速度",
    },
    {
      icon: <Shield className={styles.featureIcon} />,
      title: "EVM兼容",
      description: "完全兼容以太坊虚拟机，现有DApp可无缝迁移",
    },
    {
      icon: <Cpu className={styles.featureIcon} />,
      title: "智能优化",
      description: "自适应共识算法，动态调节性能，确保网络稳定运行",
    },
    {
      icon: <Database className={styles.featureIcon} />,
      title: "可扩展性",
      description: "模块化架构设计，支持水平扩展，满足大规模应用需求",
    },
  ]

  const activities = [
    {
      title: "Monad 技术分享会",
      date: "2024年12月15日",
      location: "线上直播",
      description: "深入探讨Monad区块链的技术架构和创新特性",
      status: "即将开始",
      participants: 156,
    },
    {
      title: "开发者工作坊",
      date: "2024年11月28日",
      location: "北京·中关村",
      description: "Monad智能合约开发实战训练营",
      status: "已结束",
      participants: 89,
    },
    {
      title: "社区AMA问答",
      date: "2024年11月10日",
      location: "Discord语音频道",
      description: "与Monad核心团队直接对话，解答技术疑问",
      status: "已结束",
      participants: 234,
    },
  ]

  const milestones = [
    {
      date: "2024年10月",
      title: "社区正式成立",
      description: "Monad中文社区正式启动，建立官方交流渠道",
      icon: "🚀",
    },
    {
      date: "2024年11月",
      title: "首次技术分享",
      description: "举办第一次技术分享会，吸引200+开发者参与",
      icon: "⚡",
    },
    {
      date: "2024年12月",
      title: "开发者工具发布",
      description: "发布中文版开发文档和工具包",
      icon: "🛠️",
    },
    {
      date: "2025年Q1",
      title: "测试网启动",
      description: "计划启动Monad测试网络，开放社区测试",
      icon: "🌐",
    },
  ]

  const resources = [
    {
      title: "开发文档",
      description: "完整的API文档和开发指南",
      icon: <BookOpen className={styles.resourceIcon} />,
      link: "#",
    },
    {
      title: "代码示例",
      description: "丰富的智能合约示例代码",
      icon: <Code className={styles.resourceIcon} />,
      link: "#",
    },
    {
      title: "开发工具",
      description: "专业的开发工具和SDK",
      icon: <Cpu className={styles.resourceIcon} />,
      link: "#",
    },
    {
      title: "测试网络",
      description: "免费的测试网络环境",
      icon: <Globe className={styles.resourceIcon} />,
      link: "#",
    },
  ]

  const members = [
    { name: "张伟", avatar: "/placeholder.svg?height=60&width=60" },
    { name: "李小明", avatar: "/placeholder.svg?height=60&width=60" },
    { name: "王芳", avatar: "/placeholder.svg?height=60&width=60" },
    { name: "陈浩", avatar: "/placeholder.svg?height=60&width=60" },
    { name: "刘敏", avatar: "/placeholder.svg?height=60&width=60" },
    { name: "赵强", avatar: "/placeholder.svg?height=60&width=60" },
    { name: "孙丽", avatar: "/placeholder.svg?height=60&width=60" },
    { name: "周杰", avatar: "/placeholder.svg?height=60&width=60" },
    { name: "吴磊", avatar: "/placeholder.svg?height=60&width=60" },
    { name: "郑雪", avatar: "/placeholder.svg?height=60&width=60" },
    { name: "马云飞", avatar: "/placeholder.svg?height=60&width=60" },
    { name: "林晓", avatar: "/placeholder.svg?height=60&width=60" },
  ]

  const duplicatedMembers = [...members, ...members]

  return (
    <div className={styles.homepage}>
      {/* News Banner */}
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <span className={styles.logoText}>M</span>
                <div className={styles.logoGlow}></div>
              </div>
              <span className={styles.logoTitle}>Monad中文社区</span>
            </div>
            <nav className={styles.nav}>
              <div className={styles.navItem}>
                <span>生态系统</span>
                <ChevronDown className={styles.navIcon} />
              </div>
              <div className={styles.navItem}>
                <span>开发者</span>
                <ChevronDown className={styles.navIcon} />
              </div>
              <div className={styles.navItem}>
                <span>资源</span>
                <ChevronDown className={styles.navIcon} />
              </div>
              <button className={styles.navButton}>加入测试网</button>
            </nav>
          </div>
        </div>
        {/* Floating News Banner */}
        {showNewsBanner && (
          <div className={styles.floatingNewsBanner}>
            <div className={styles.newsSlider}>
              <div className={styles.newsSlide}>
                <span className={styles.newsBadge}>🔥 热门</span>
                <span className={styles.newsText}>Monad测试网即将上线！</span>
              </div>
              <div className={styles.newsSlide}>
                <span className={styles.newsBadge}>📢 公告</span>
                <span className={styles.newsText}>社区开发者大会报名开始</span>
              </div>
              <div className={styles.newsSlide}>
                <span className={styles.newsBadge}>⚡ 更新</span>
                <span className={styles.newsText}>新版本SDK已发布，性能提升50%</span>
              </div>
              <div className={styles.newsSlide}>
                <span className={styles.newsBadge}>🎉 活动</span>
                <span className={styles.newsText}>技术分享会本周五举行</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Cool Effects */}
      <section className={styles.hero}>
        {/* Animated Background */}
        <div className={styles.heroBackground}>
          <div className={styles.heroGradient}></div>
          <div
            className={styles.mouseGradient}
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.15), transparent 40%)`,
            }}
          ></div>
          <div className={styles.particles}>
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className={styles.particle}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className={styles.container}>
          <div className={`${styles.heroContent} ${isVisible ? styles.heroVisible : ""}`}>
            <div className={styles.heroBadge}>🚀 下一代区块链技术</div>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitlePrimary}>欢迎来到</span>
              <br />
              <span className={styles.heroTitleSecondary}>Monad中文社区</span>
            </h1>
            <p className={styles.heroSubtitle}>
              探索高性能区块链的无限可能，与顶尖开发者一起构建去中心化的未来。
              <br />
              <span className={styles.heroHighlight}>加入我们，成为区块链革命的先锋。</span>
            </p>
            <div className={styles.heroButtons}>
              <button className={styles.heroPrimaryButton}>
                <Zap className={styles.buttonIcon} />
                开始构建
              </button>
              <button className={styles.heroSecondaryButton}>
                <Globe className={styles.buttonIcon} />
                工作原理
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {[
              { label: "社区成员", value: stats.members, icon: <Users className={styles.statIcon} /> },
              { label: "技术分享", value: stats.activities, icon: <Star className={styles.statIcon} /> },
              { label: "开源项目", value: stats.projects, icon: <Rocket className={styles.statIcon} /> },
              { label: "代码提交", value: stats.commits, icon: <GitBranch className={styles.statIcon} /> },
            ].map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <div className={styles.statIconWrapper}>
                  <div className={styles.statIconGlow}></div>
                  <div className={styles.statIconContainer}>{stat.icon}</div>
                </div>
                <div className={styles.statValue}>{stat.value.toLocaleString()}+</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>技术特色</h2>
            <p className={styles.sectionDescription}>
              Monad采用创新的并行执行引擎和优化的共识机制，为开发者提供前所未有的性能体验
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureCardGlow}></div>
                <div className={styles.featureCardContent}>
                  <div className={styles.featureIconWrapper}>{feature.icon}</div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className={styles.activities}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>社区活动</h2>
            <p className={styles.sectionDescription}>
              定期举办各种技术分享会、工作坊和交流活动，为社区成员提供学习和成长的机会
            </p>
          </div>
          <div className={styles.activitiesGrid}>
            {activities.map((activity, index) => (
              <div key={index} className={styles.activityCard}>
                <div className={styles.activityCardGlow}></div>
                <div className={styles.activityCardHeader}>
                  <div className={styles.activityMeta}>
                    <span
                      className={`${styles.activityBadge} ${
                        activity.status === "即将开始" ? styles.activityBadgeActive : styles.activityBadgeInactive
                      }`}
                    >
                      {activity.status}
                    </span>
                    <div className={styles.activityParticipants}>
                      <Users className={styles.activityIcon} />
                      {activity.participants}
                    </div>
                  </div>
                  <h3 className={styles.activityTitle}>{activity.title}</h3>
                  <p className={styles.activityDescription}>{activity.description}</p>
                </div>
                <div className={styles.activityCardContent}>
                  <div className={styles.activityInfo}>
                    <div className={styles.activityInfoItem}>
                      <Calendar className={styles.activityIcon} />
                      {activity.date}
                    </div>
                    <div className={styles.activityInfoItem}>
                      <MapPin className={styles.activityIcon} />
                      {activity.location}
                    </div>
                  </div>
                  <button className={styles.activityButton}>了解详情</button>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.sectionFooter}>
            <button className={styles.moreButton}>
              <Calendar className={styles.buttonIcon} />
              查看更多活动
            </button>
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className={styles.milestones}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>项目里程碑</h2>
            <p className={styles.sectionDescription}>
              见证Monad中文社区的成长历程，每一个里程碑都标志着我们向前迈进的重要一步
            </p>
          </div>
          <div className={styles.timeline}>
            <div className={styles.timelineLine}></div>
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`${styles.milestoneItem} ${index % 2 === 0 ? styles.milestoneLeft : styles.milestoneRight}`}
              >
                <div className={styles.milestoneContent}>
                  <div className={styles.milestoneCard}>
                    <div className={styles.milestoneCardGlow}></div>
                    <div className={styles.milestoneDate}>
                      <div className={styles.milestoneDateBadge}>
                        <Calendar className={styles.milestoneDateIcon} />
                        <span>{milestone.date}</span>
                      </div>
                    </div>
                    <h3 className={styles.milestoneTitle}>{milestone.title}</h3>
                    <p className={styles.milestoneDescription}>{milestone.description}</p>
                  </div>
                </div>
                <div className={styles.milestoneIcon}>
                  <div className={styles.milestoneIconContent}>{milestone.icon}</div>
                  <div className={styles.milestoneIconGlow}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className={styles.resources}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>开发者资源</h2>
            <p className={styles.sectionDescription}>为开发者提供完整的工具链和资源，让你快速上手Monad开发</p>
          </div>
          <div className={styles.resourcesGrid}>
            {resources.map((resource, index) => (
              <div key={index} className={styles.resourceCard}>
                <div className={styles.resourceCardGlow}></div>
                <div className={styles.resourceCardHeader}>
                  <div className={styles.resourceIconWrapper}>{resource.icon}</div>
                  <h3 className={styles.resourceTitle}>{resource.title}</h3>
                  <p className={styles.resourceDescription}>{resource.description}</p>
                </div>
                <div className={styles.resourceCardFooter}>
                  <button className={styles.resourceButton}>立即使用</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Members Section */}
      <section className={styles.members}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>社区成员</h2>
            <p className={styles.sectionDescription}>我们的团队由经验丰富的区块链专家和社区建设者组成</p>
          </div>

          <div className={styles.membersContainer}>
            <div className={styles.membersGradientLeft}></div>
            <div className={styles.membersGradientRight}></div>
            <div className={styles.membersScroll}>
              {duplicatedMembers.map((member, index) => (
                <div key={index} className={styles.memberItem}>
                  <div className={styles.memberAvatar}>
                    <img src={member.avatar || "/placeholder.svg"} alt={member.name} className={styles.memberImage} />
                    <div className={styles.memberAvatarGlow}></div>
                  </div>
                  <h3 className={styles.memberName}>{member.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaBackground}>
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={styles.ctaParticle}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            ></div>
          ))}
        </div>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>准备好加入Monad中文社区了吗？</h2>
            <p className={styles.ctaSubtitle}>与志同道合的开发者一起探索区块链技术的前沿，共同构建去中心化的未来</p>
            <div className={styles.ctaButtons}>
              <button className={styles.ctaPrimaryButton}>
                <Users className={styles.buttonIcon} />
                加入Discord社区
              </button>
              <button className={styles.ctaSecondaryButton}>
                <Globe className={styles.buttonIcon} />
                访问官方网站
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <div className={styles.footerLogo}>
                <div className={styles.footerLogoIcon}>
                  <span className={styles.footerLogoText}>M</span>
                  <div className={styles.footerLogoGlow}></div>
                </div>
                <span className={styles.footerLogoTitle}>Monad中文社区</span>
              </div>
              <p className={styles.footerDescription}>致力于为中文开发者提供最优质的Monad技术支持和交流平台</p>
            </div>
            <div className={styles.footerSection}>
              <h3 className={styles.footerSectionTitle}>生态系统</h3>
              <ul className={styles.footerLinks}>
                <li>
                  <a href="#" className={styles.footerLink}>
                    DeFi协议
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.footerLink}>
                    NFT市场
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.footerLink}>
                    游戏应用
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.footerLink}>
                    基础设施
                  </a>
                </li>
              </ul>
            </div>
            <div className={styles.footerSection}>
              <h3 className={styles.footerSectionTitle}>开发者</h3>
              <ul className={styles.footerLinks}>
                <li>
                  <a href="#" className={styles.footerLink}>
                    开发文档
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.footerLink}>
                    API参考
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.footerLink}>
                    SDK工具
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.footerLink}>
                    测试网络
                  </a>
                </li>
              </ul>
            </div>
            <div className={styles.footerSection}>
              <h3 className={styles.footerSectionTitle}>联系我们</h3>
              <div className={styles.footerSocial}>
                <button className={styles.socialButton}>
                  <Github className={styles.socialIcon} />
                </button>
                <button className={styles.socialButton}>
                  <Twitter className={styles.socialIcon} />
                </button>
                <button className={styles.socialButton}>
                  <Globe className={styles.socialIcon} />
                </button>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerCopyright}>&copy; 2024 Monad中文社区. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

