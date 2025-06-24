import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Image } from 'antd';
import styles from '../styles/Header.module.css';
import Link from 'next/link';
import { Dropdown, Menu } from 'antd';
import Auth from './Auth';

export default function Header() {
  const [showNewsBanner, setShowNewsBanner] = useState(true);
  // useEffect(() => {
  //   const handleScroll = () => {
  //     const scrollY = window.scrollY
  //     setShowNewsBanner(scrollY < 50) // 滚动超过50px时隐藏新闻栏
  //   }

  //   window.addEventListener("scroll", handleScroll)

  //   return () => {
  //     window.removeEventListener("scroll", handleScroll)
  //   }
  // }, [])

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <Link href="/" passHref>
            <div className={styles.logo} style={{ cursor: 'pointer' }}>
              <Image preview={false} width={38} src="/logo.png" className={styles.logo}/>
              <span className={styles.logoTitle}>Monad 中文社区</span>
            </div>
          </Link>
          <nav className={styles.nav}>
            <Dropdown
              menu={{
                items: [
                  { key: 'projects', label: <Link href="/community">社区项目</Link> },
                  { key: 'tools', label: <Link href="/">开发工具</Link> },
                  { key: 'explorer', label: <Link href="https://testnet.monadexplorer.com" target='_blank'>区块浏览器</Link> },
                ],
              }}
              placement="bottom"
              trigger={['hover']}
            >
              <div className={styles.navItem}>
                <span>生态系统</span>
                <ChevronDown className={styles.navIcon} />
              </div>
            </Dropdown>
            <Dropdown
              menu={{
                items: [
                  { key: 'docs', label: <Link href="/">开发文档</Link> },
                  { key: 'examples', label: <Link href="/">示例代码</Link> },
                  { key: 'sdk', label: <Link href="/">SDK 工具</Link> },
                ],
              }}
              placement="bottom"
              trigger={['hover']}
            >
              <div className={styles.navItem}>
                <span>开发者</span>
                <ChevronDown className={styles.navIcon} />
              </div>
            </Dropdown>
            <Dropdown
              menu={{
                items: [
                  { key: 'blog', label: <Link href="/blogs">博客</Link> },
                  { key: 'events', label: <Link href="/events">活动</Link> },
                  { key: 'faq', label: <Link href="/">常见问题</Link> },
                ],
              }}
              placement="bottom"
              trigger={['hover']}
            >
              <div className={styles.navItem}>
                <span>资源</span>
                <ChevronDown className={styles.navIcon} />
              </div>
            </Dropdown>

            <Auth />
          </nav>
        </div>
      </div>
      {/* Floating News Banner */}
      {/* {showNewsBanner && (
        <div className={styles.floatingNewsBanner}>
          <div className={styles.newsSlider}>
            <div className={styles.newsSlide}>
              <span className={styles.newsBadge}>🔥 热门</span>
              <span className={styles.newsText}>Monad测试网即将上线！</span>
            </div>
          </div>
        </div>
      )} */}
    </header>
  );
}
