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
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './index.module.css';
import { SiDiscord, SiTelegram } from 'react-icons/si';
import EventSection from './events/section'

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    members: 1000,
    activities: 50,
    projects: 20,
    commits: 1250,
  });

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
      description: '并行执行引擎，TPS达到10,000+，为DeFi应用提供无与伦比的速度',
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

  const activities = [
    {
      title: 'Monad 技术分享会',
      date: '2024年12月15日',
      location: '线上直播',
      description: '深入探讨Monad区块链的技术架构和创新特性',
      status: '即将开始',
      participants: 156,
    },
    {
      title: '开发者工作坊',
      date: '2024年11月28日',
      location: '北京·中关村',
      description: 'Monad智能合约开发实战训练营',
      status: '已结束',
      participants: 89,
    },
    {
      title: '社区AMA问答',
      date: '2024年11月10日',
      location: 'Discord语音频道',
      description: '与Monad核心团队直接对话，解答技术疑问',
      status: '已结束',
      participants: 234,
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
    { name: 'Lewis', twitter: 'https://x.com/Lewis8888888' },
    { name: 'Spark', twitter: 'https://x.com/0x_xifeng' },
    { name: 'Russell', twitter: 'https://x.com/brocoliwang' },
    { name: 'Mier', twitter: 'https://x.com/luoli94448559' },
    { name: 'Dream', twitter: 'https://x.com/Dreamer117Zz' },
    { name: 'Van1sa', twitter: 'https://x.com/Van1saXXM' },
    { name: 'Huan', twitter: 'https://x.com/XHOYH' },
    { name: 'CHEN', twitter: 'https://x.com/jaychen981111' },
    { name: '4Y', twitter: 'https://x.com/4y_ffff' },
    { name: 'SSWeb3', twitter: 'https://x.com/SSWeb3_' },
    { name: 'Cash', twitter: 'https://x.com/cashwscott' },
    { name: 'Pizza', twitter: 'https://x.com/peppertat1' },
    { name: 'Sky', twitter: 'https://x.com/0xsky66' },
    { name: 'Hao', twitter: 'https://x.com/hao2web3' },
    { name: 'Chine', twitter: 'https://x.com/0xChine' },
    { name: 'Potato King', twitter: 'https://x.com/0xpotatoking' },
    { name: 'Picano', twitter: 'https://x.com/Pican0_o' },
    { name: 'Mumu', twitter: 'https://x.com/Mony_Chen265' },
    { name: 'Polly', twitter: 'https://x.com/Polly_r7' },
    { name: 'pinecats', twitter: 'https://x.com/pinecats3_1' },
    { name: 'Susu', twitter: 'https://x.com/Susu9527' },
    { name: '波波', twitter: 'https://x.com/shihaibo4' },
    { name: 'Zai Lai', twitter: 'https://x.com/ZaiLai_' },
    { name: '肥肥', twitter: 'https://x.com/lumaonvqishi' },
    { name: 'Sophia', twitter: 'https://x.com/SophiaXie410811' },
    { name: 'Eryi', twitter: 'https://x.com/qzmak53747555' },
    { name: 'Gengar', twitter: 'https://x.com/Genggar0x' },
    { name: 'Hyu', twitter: 'https://x.com/hyuuu_hyu' },
    { name: 'CactusDoggy', twitter: 'https://x.com/cactus_doggy' },
    { name: 'Oldsix', twitter: 'https://x.com/Old_6_' },
    { name: '迪仔', twitter: 'https://x.com/0xdizai' },
    { name: 'Sonic', twitter: 'https://x.com/SonicFiringZ' },
    { name: 'Freedom', twitter: 'https://x.com/zhangru83864846' },
    { name: 'Coin Pulse', twitter: 'https://x.com/wangni88' },
    { name: 'Kristina', twitter: 'https://x.com/_Kristina8888' },
    { name: 'Hanna', twitter: 'https://x.com/HhhhHannah' },
    { name: 'Taotao', twitter: 'https://x.com/TTZENG2' },
    { name: 'Soar', twitter: 'https://x.com/lpr55499568' },
    { name: 'Iny', twitter: 'https://x.com/Iny1127Iny' },
  ];

  const duplicatedMembers = [...members, ...members];

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
          <div
            className={`${styles.heroContent} ${isVisible ? styles.heroVisible : ''}`}
          >
            <div className={styles.heroBadge}>🚀 下一代区块链技术</div>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleSecondary}>Monad中文社区</span>
            </h1>
            <p className={styles.heroSubtitle}>
              <span className={styles.heroHighlight}>
                加入我们，和 Nads 一起了解、参与、构建 Monad
              </span>
            </p>
            <div className={styles.heroButtons}>
              <Link href="/events" className={styles.heroPrimaryButton}>
                <Users className={styles.buttonIcon} />
                加入社区
              </Link>
              <button className={styles.heroSecondaryButton}>
                <Globe className={styles.buttonIcon} />
                体验测试网
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
              {
                label: '社区成员',
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
      </section>

      {/* Activities Section */}
      <EventSection />
      
      {/* Milestones Section */}
      <section className={styles.milestones}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>里程碑</h2>
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
              Monad采用创新的并行执行引擎和优化的共识机制，为开发者提供前所未有的性能体验
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
            <h2 className={styles.sectionTitle}>社区成员</h2>
            <p className={styles.sectionDescription}>
              我们的团队由经验丰富的区块链专家和社区建设者组成
            </p>
          </div>

          <div className={styles.membersContainer}>
            <div className={styles.membersGradientLeft}></div>
            <div className={styles.membersGradientRight}></div>
            <div className={styles.membersScroll}>
              {duplicatedMembers.map((member, index) => (
                <div key={index} className={styles.memberItem}>
                  <a
                    href={member.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <h3 className={styles.memberName}>{member.name}</h3>
                    <div className={styles.memberTwitter}>
                      @{member.twitter.split('/').pop()}
                    </div>
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
                href="https://discord.gg/monad"
                target="_blank"
                className={styles.ctaPrimaryButton}
              >
                <SiDiscord className={styles.buttonIcon} />
                加入 Discord
              </Link>
              <Link
                href="https://www.monad.xyz/"
                target="_blank"
                className={styles.ctaSecondaryButton}
              >
                <Globe className={styles.buttonIcon} />
                访问官方网站
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
