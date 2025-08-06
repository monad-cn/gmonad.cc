import {
  Users,
  Calendar,
  MapPin,
  Zap,
  Star,
  Code,
  Shield,
  Cpu,
  Database,
  BookOpen,
  Globe,
  GitBranch,
  Rocket,
  DollarSign,
  Handshake,
  Lock,
  Network,
  Activity,
  Server,
  ServerCog,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './index.module.css';
import { SiDiscord, SiTelegram, SiX } from 'react-icons/si';
import { Avatar } from 'antd';
import EventSection from './events/section';
import { getDapps } from './api/dapp';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [dapps, setDapps] = useState<any[]>([]);
  const pageSize = 20;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const [stats, setStats] = useState({
    members: 1000,
    activities: 50,
    projects: 20,
    commits: 1250,
  });

  const scrollGallery = (direction: 'left' | 'right') => {
    const container = document.querySelector(`.${styles.galleryContainer}`) as HTMLElement;
    if (container) {
      const scrollAmount = 312; // Width of one image (280px) plus gap (32px)
      const currentScroll = container.scrollLeft;

      let targetScroll;
      if (direction === 'left') {
        // Scroll to absolute left if we're close to the beginning
        if (currentScroll <= scrollAmount) {
          targetScroll = 0;
        } else {
          targetScroll = currentScroll - scrollAmount;
        }
      } else {
        const maxScroll = container.scrollWidth - container.clientWidth;
        targetScroll = Math.min(maxScroll, currentScroll + scrollAmount);
      }

      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchDapps = async () => {
      try {
        const params = {
          is_feature: 1,
          page: 1,
          page_size: pageSize,
        };
        const result = await getDapps(params);
        if (result.success && result.data && Array.isArray(result.data.dapps)) {
          setDapps(result.data.dapps);
        }
      } catch (error) {
        console.error("获取 DApps 列表失败:", error);
      }
    };
    fetchDapps();
  }, []);

  useEffect(() => {
    let animationFrame: number;
    const scrollContainer = scrollRef.current;

    const scroll = () => {
      if (scrollContainer && !isHovering) {
        scrollContainer.scrollLeft += 0.5; // 每帧增加 0.5px，可根据需要调整
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollLeft = 0; // 回到开头循环滚动
        }
      }
      animationFrame = requestAnimationFrame(scroll);
    };

    animationFrame = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrame);
  }, [isHovering]);


  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 模拟实时数据更新
    const interval = setInterval(() => {
      setStats((prev) => ({
        members: prev.members + Math.floor(Math.random() * 3),
        activities: prev.activities,
        projects: prev.projects,
        commits: prev.commits + Math.floor(Math.random() * 5),
      }));
    }, 5000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  const features = [
    {
      icon: <Zap className={styles.featureIcon} />,
      title: '极致性能',
      description: '并行执行引擎，TPS达到10,000+, 出块时间达0.5s',
    },
    {
      icon: <Shield className={styles.featureIcon} />,
      title: 'EVM兼容',
      description: '完全兼容以太坊虚拟机，现有DApp可无缝迁移',
    },
    {
      icon: <Cpu className={styles.featureIcon} />,
      title: '智能优化',
      description: '自适应共识算法，动态调节性能，确保网络稳定运行',
    },
    {
      icon: <Database className={styles.featureIcon} />,
      title: '可扩展性',
      description: '模块化架构设计，支持水平扩展，满足大规模应用需求',
    },
  ];


  const milestones = [
    {
      date: '2022年2月',
      title: 'Monad Labs 正式成立',
      description:
        '由 Keone Hon、James Hunsaker 和 Eunice Giarta 联合创办，开启高性能 EVM 链研究。',
      src: '',
      icon: <Rocket className={styles.icon} />,
    },
    {
      date: '2023年2月',
      title: '完成 1,900 万美元种子轮融资',
      description: 'Dragonfly 等投资加持，为初期团队建设与闭测提供资力。',
      src: 'https://monadxyz.substack.com/p/monad-raises-19m-to-build-the-fundamentally-optimized-evm-212aa066b84f',
      icon: <DollarSign className={styles.icon} />,
    },
    {
      date: '2024年4月9日',
      title: '获得 Paradigm 领投 2.25 亿美元 A 轮融资',
      description: '成为当年区块链领域亮眼融资，推进生态与协议落地。',
      src: 'https://www.theblockbeats.info/en/flash/245409',
      icon: <Handshake className={styles.icon} />,
    },
    // {
    //   date: "2024年Q4",
    //   title: "启动封闭测试网",
    //   description: "面向早期开发者，试运行并行执行与 MonadBFT 核心功能。",
    //   icon: <Lock className={styles.icon} />,
    // },
    {
      date: '2025年2月9日',
      title: '公共测试网上线',
      description: '向所有开发者开放，支持 10,000 TPS、1 秒单槽确认。',
      src: 'https://tokeninsight.com/zh/news/monad-to-roll-out-a-public-testnet-on-feb.-19',
      icon: <Network className={styles.icon} />,
    },
    {
      date: '2025年2月下旬',
      title: '测试网交易破 1 亿笔',
      description: '开放后短期内钱包数量激增，交易量激发生态动能。',
      src: 'https://www.gate.com/zh/blog/6259/Monad-Testnet-Breaks-100-Million-Transactions--The-Rise-of-a-High-Performance-Monad-Crypto-Blockchaind',
      icon: <Activity className={styles.icon} />,
    },
    {
      date: '2025年5月5日',
      title: '启动测试网‑2 验证者阶段',
      description:
        'Monad 推出验证者专属 Testnet‑2，将于年底前为主网上线做准备。',
      src: 'https://www.binance.com/zh-CN/square/post/24006186094818',
      icon: <ShieldCheck className={styles.icon} />,
    },
  ];

  const resources = [
    {
      title: '开发文档',
      description: '完整的API文档和开发指南',
      icon: <BookOpen className={styles.resourceIcon} />,
      link: '#',
    },
    {
      title: '代码示例',
      description: '丰富的智能合约示例代码',
      icon: <Code className={styles.resourceIcon} />,
      link: '#',
    },
    {
      title: '开发工具',
      description: '专业的开发工具和SDK',
      icon: <Cpu className={styles.resourceIcon} />,
      link: '#',
    },
    {
      title: '测试网络',
      description: '免费的测试网络环境',
      icon: <Globe className={styles.resourceIcon} />,
      link: '#',
    },
  ];

  const members = [
    {
      name: 'luluisangry',
      twitter: 'https://x.com/lulu70191243',
      avatar: "lulu.jpg",
    },
    {
      name: 'Harvey C',
      twitter: 'https://x.com/Harveycww',
      avatar: "harvey.jpg",
    },
    {
      name: 'Michael',
      twitter: 'https://x.com/michael_lwy',
      avatar: "michael.jpg",
    },
    {
      name: 'Box',
      twitter: 'https://x.com/BoxMrChen',
      avatar: "box.jpg",
    },
    {
      name: 'Seven',
      twitter: 'https://x.com/_Seven7777777',
      avatar: "seven.jpg",
    },
    {
      name: '大大黄',
      twitter: 'https://x.com/Alger779503577',
      avatar: "ddh.jpg",
    },
    {
      name: '小符',
      twitter: 'https://x.com/Phoouze',
      avatar: "phoouze.jpg",
    },
    {
      name: 'hannah',
      twitter: 'https://x.com/HhhhHannah',
      avatar: "hannah.jpg",
    }
  ];

  const duplicatedMembers = [...members];

  return (
    <div className={styles.homepage}>
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
        </div>

        <div className={styles.container}>
          <div
            className={`${styles.heroContent} ${isVisible ? styles.heroVisible : ''}`}
          >
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleSecondary}>Monad中文社区</span>
            </h1>

            {/* 标题装饰 */}
            <div className={styles.titleDecoration}>
              <div className={styles.decorationGradient}></div>
              <div className={styles.decorationLine}></div>
            </div>
            <p className={styles.heroSubtitle}>
              <span className={styles.heroHighlight}>
                加入我们，和 Nads 一起了解、参与、构建 Monad
              </span>
            </p>
            {/* 图片画廊 */}
            <div className={styles.heroGallery}>
              <button
                className={`${styles.galleryNavigation} ${styles.galleryNavPrev}`}
                onClick={() => scrollGallery('left')}
                aria-label="Previous images"
              >
                <ChevronLeft className={styles.galleryNavIcon} />
              </button>

              <div className={styles.galleryContainer}>
                <div className={styles.galleryImage}>
                  <img src="/community/cp1.jpg" alt="Monad社区活动1" />
                </div>
                <div className={styles.galleryImage}>
                  <img src="/community/cp2.jpg" alt="Monad社区活动2" />
                </div>
                <div className={styles.galleryImage}>
                  <img src="/community/cp3.jpg" alt="Monad社区活动3" />
                </div>
                <div className={styles.galleryImage}>
                  <img src="/community/cp4.jpg" alt="Monad社区活动4" />
                </div>
                <div className={styles.galleryImage}>
                  <img src="/community/cp6.jpg" alt="Monad社区活动5" />
                </div>
                <div className={styles.galleryImage}>
                  <img src="/community/cp7.jpg" alt="Monad社区活动6" />
                </div>
                <div className={styles.galleryImage}>
                  <img src="/community/cp8.jpg" alt="Monad社区活动7" />
                </div>
                <div className={styles.galleryImage}>
                  <img src="/community/cp9.jpg" alt="Monad社区活动8" />
                </div>
                <div className={styles.galleryImage}>
                  <img src="/community/cp10.jpg" alt="Monad社区活动9" />
                </div>
              </div>

              <button
                className={`${styles.galleryNavigation} ${styles.galleryNavNext}`}
                onClick={() => scrollGallery('right')}
                aria-label="Next images"
              >
                <ChevronRight className={styles.galleryNavIcon} />
              </button>
            </div>

            <div className={styles.heroButtons}>
              <Link href="/monad" className={styles.heroPrimaryButton}>
                <Globe className={styles.buttonIcon} />
                了解 Monad
              </Link>
              <Link href="/events" className={styles.heroSecondaryButton}>
                <Users className={styles.buttonIcon} />
                加入社区
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className={styles.stats}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {[
              {
                label: '贡献者',
                value: stats.members,
                icon: <Users className={styles.statIcon} />,
              },
              {
                label: '技术分享',
                value: stats.activities,
                icon: <Star className={styles.statIcon} />,
              },
              {
                label: '开源项目',
                value: stats.projects,
                icon: <Rocket className={styles.statIcon} />,
              },
              {
                label: '代码提交',
                value: stats.commits,
                icon: <GitBranch className={styles.statIcon} />,
              },
            ].map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <div className={styles.statIconWrapper}>
                  <div className={styles.statIconGlow}></div>
                  <div className={styles.statIconContainer}>{stat.icon}</div>
                </div>
                <div className={styles.statValue}>
                  {stat.value.toLocaleString()}+
                </div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Activities Section */}
      <EventSection />

      {/* Milestones Section */}
      <section className={styles.milestones}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Monad 里程碑</h2>
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
                    <p className={styles.milestoneDescription}>
                      {milestone.description}
                    </p>
                  </div>
                </div>
                <div className={styles.milestoneIcon}>
                  <div className={styles.milestoneIconContent}>
                    {milestone.icon}
                  </div>
                  <div className={styles.milestoneIconGlow}></div>
                </div>
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
              Monad 采用创新的并行执行引擎和优化的共识机制，为开发者提供前所未有的性能体验
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureCardGlow}></div>
                <div className={styles.featureCardContent}>
                  <div className={styles.featureIconWrapper}>
                    {feature.icon}
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DApp Showcase Section */}
      <section className={styles.dappShowcase}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>生态 DApps</h2>
            <p className={styles.sectionDescription}>
              探索正在 Monad 测试网构建和活跃的优秀 DApp 项目
            </p>
          </div>
          <div className={styles.dappsScrollContainer}
            ref={scrollRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {dapps.map((dapp) => (
              <Link href={`/ecosystem/dapps/${dapp.ID}`}>
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
                          <Link href={dapp.x} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={styles.actionButton}>
                            <SiX className={styles.actionIcon} />
                          </Link>
                        )}
                        {dapp.site && (
                          <Link href={dapp.site} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={styles.actionButton}>
                            <Globe className={styles.actionIcon} />
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className={styles.viewMoreWrapper}>
            <Link href="/ecosystem/dapps" className={styles.viewMoreButton}>
              查看更多 DApps →
            </Link>
          </div>
        </div>
      </section>


      {/* Resources Section */}
      <section className={styles.resources}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>开发者资源</h2>
            <p className={styles.sectionDescription}>
              为开发者提供完整的工具链和资源，让你快速上手Monad开发
            </p>
          </div>
          <div className={styles.resourcesGrid}>
            {resources.map((resource, index) => (
              <div key={index} className={styles.resourceCard}>
                <div className={styles.resourceCardGlow}></div>
                <div className={styles.resourceCardHeader}>
                  <div className={styles.resourceIconWrapper}>
                    {resource.icon}
                  </div>
                  <h3 className={styles.resourceTitle}>{resource.title}</h3>
                  <p className={styles.resourceDescription}>
                    {resource.description}
                  </p>
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
            <h2 className={styles.sectionTitle}>贡献者</h2>
            <p className={styles.sectionDescription}>
              感谢每一位贡献者，并期待更多热爱 Monad 的朋友加入我们，一起共建 Monad。
            </p>
          </div>

          <div className={styles.membersContainer}>
            <div className={styles.membersGradientLeft}></div>
            <div className={styles.membersGradientRight}></div>
            <div
              // className={
              //   duplicatedMembers.length <= 6
              //     ? styles.membersScrollStatic
              //     : styles.membersScrollAuto
              // }
              className={styles.membersScrollStatic}
            >
              {duplicatedMembers.map((member, index) => (
                <div key={index} className={styles.memberItem}>
                  <a
                    href={member.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className={styles.avatar}>
                      <Avatar
                        size={60}
                        src={`/avatar/${member.avatar}`}
                        alt={member.name}
                      />
                    </div>

                    {/* <h3 className={styles.memberName}>{member.name}</h3> */}
                    <div className={styles.memberTwitter}>{member.name}</div>
                  </a>
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
            <h2 className={styles.ctaTitle}>准备好加入 Monad 中文社区了吗？</h2>
            <div className={styles.ctaButtons}>
              <Link
                href="https://x.com/monad_zw"
                target="_blank"
                className={styles.ctaPrimaryButton}
              >
                <SiX className={styles.buttonIconX}  />
                关注 X
              </Link>
              <Link
                href="https://t.me/Chinads"
                target="_blank"
                className={styles.ctaSecondaryButton}
              >
                <SiTelegram className={styles.buttonIcon} />
                加入 Telegram
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
