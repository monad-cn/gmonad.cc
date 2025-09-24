import React from 'react';
import { SiTelegram, SiX } from 'react-icons/si';
import { ArrowRight, HelpCircle, Mail, Megaphone } from 'lucide-react';
import styles from './index.module.css';

export default function NewsletterSection() {
  const announcements = [
    {
      title: 'Monad 基金会成立',
      date: '2024年12月16日',
      link: '#',
    },
    {
      title: '公共测试网上线',
      date: '2025年2月19日',
      link: '#',
    },
    {
      title: '深度解析：Monad 与 Rollups',
      date: '2023年3月29日',
      link: '#',
    },
  ];

  const faqs = [
    'MonadDB 与其他数据库有何不同？',
    'Monad 客户端是用什么语言开发的？',
    '为什么 Monad 选择开发为 L1 区块链？',
  ];

  return (
    <section className={styles.newsletter}>
      <div className={styles.container}>
        {/* Subscription Section */}
        <div className={styles.subscriptionBox}>
          <div className={styles.subscriptionIcon}>
            <Mail size={32} />
          </div>
          <h2 className={styles.sectionTitle}>订阅 Monad 中文社区通讯</h2>
          <p className={styles.sectionDescription}>
            加入我们，与数千名 Monad 开发者、研究员和爱好者同行。每周，我们将为您精选最重要的技术进展、生态更新和社区动态。
          </p>
          <form className={styles.subscriptionForm}>
            <input
              type="email"
              placeholder="在此输入您的电子邮件地址"
              className={styles.emailInput}
              required
            />
            <button type="submit" className={styles.subscribeButton}>
              订阅
            </button>
          </form>
        </div>

        {/* Announcements Section */}
        <div className={styles.announcementsSection}>
           <div className={styles.sectionHeader}>
            <Megaphone className={styles.headerIcon} />
            <h3 className={styles.sectionTitleSmall}>社区精选与近期公告</h3>
          </div>
          <p className={styles.sectionDescription}>
            深入了解我们的最新公告、前沿见解和行业趋势。
          </p>
          <div className={styles.announcementsGrid}>
            {announcements.map((item, index) => (
              <a href={item.link} key={index} className={styles.announcementCard}>
                <h4 className={styles.announcementTitle}>{item.title}</h4>
                <p className={styles.announcementDate}>{item.date}</p>
              </a>
            ))}
          </div>
          <div className={styles.viewAllWrapper}>
            <a href="#" className={styles.viewAllButton}>
              查看所有公告 <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* FAQ and Community CTA Section */}
        <div className={styles.faqSection}>
          <div className={styles.sectionHeader}>
            <HelpCircle className={styles.headerIcon} />
            <h3 className={styles.sectionTitleSmall}>常见技术问题 (FAQ)</h3>
          </div>
          <ul className={styles.faqList}>
            {faqs.map((faq, index) => (
              <li key={index} className={styles.faqItem}>
                {faq}
              </li>
            ))}
          </ul>
          <div className={styles.communityCta}>
            <p className={styles.ctaText}>还有其他问题吗？立即加入 Monad 中文社区，参与我们的技术讨论。</p>
            <div className={styles.ctaButtons}>
              <a href="https://t.me/Chinads" target="_blank" rel="noopener noreferrer" className={styles.ctaPrimaryButton}>
                <SiTelegram />
                加入 Telegram
              </a>
              <a href="https://x.com/monad_zw" target="_blank" rel="noopener noreferrer" className={styles.ctaSecondaryButton}>
                <SiX />
                关注 X (Twitter)
              </a>
            </div>
          </div>
        </div>

        {/* Monad Memo / Footer Links */}
        <div className={styles.memoSection}>
           <h2 className={styles.memoTitle}>Monad Memo</h2>
           <div className={styles.memoGrid}>
              <div className={styles.memoColumn}>
                <h4>社区资源</h4>
                <ul>
                  <li><a href="/">首页</a></li>
                  <li><a href="/monad">了解 Monad</a></li>
                  <li><a href="/events">社区活动</a></li>
                </ul>
              </div>
              <div className={styles.memoColumn}>
                <h4>开发者</h4>
                <ul>
                  <li><a href="#">文档</a></li>
                  <li><a href="#">Monad 测试网</a></li>
                </ul>
              </div>
              <div className={styles.memoColumn}>
                <h4>生态项目</h4>
                <ul>
                  <li><a href="/ecosystem/dapps">精选 DApps</a></li>
                  <li><a href="#">Monad Madness</a></li>
                  <li><a href="#">加速器计划</a></li>
                </ul>
              </div>
           </div>
        </div>
        
        <footer className={styles.newsletterFooter}>
            <p>© 2025 Monad 中文社区. 保留所有权利.</p>
        </footer>
      </div>
    </section>
  );
}