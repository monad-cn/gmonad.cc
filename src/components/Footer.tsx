import { Github, Twitter, Globe } from "lucide-react"
import styles from "../styles/Footer.module.css"

export default function Footer() {
  return (
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
  )
}

