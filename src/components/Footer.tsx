import { SiGithub, SiX, SiTelegram } from 'react-icons/si';
import styles from "../styles/Footer.module.css"
import Link from "next/link"
import { Image } from 'antd'


export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <div className={styles.footerLogo}>
                <Image preview={false} width={24} src="/logo.png" className={styles.logo} />
              <span className={styles.footerLogoTitle}>Monad 中文社区</span>
            </div>
            <p className={styles.footerDescription}>Monad 中文社区是连接生态参与者的桥梁，在这里，与 Nads 一起交流、分享、 建设 Monad。</p>
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
              <Link className={styles.socialButton} href="https://github.com/monad-cn/gmonad.cc" target="_blank">
                <SiGithub className={styles.socialIcon} />
              </Link>
              <Link className={styles.socialButton} href="https://x.com/monad_zw" target="_blank">
                <SiX className={styles.socialIcon} />
              </Link>
              <Link className={styles.socialButton} href="https://t.me/Chinads" target="_blank">
                <SiTelegram className={styles.socialIcon} />
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.footerCopyright}>
            &copy; 2025 Monad 中文社区。 由 <Link href="https://openbuild.xyz/" className={styles.toOpenBuild}>OpenBuild</Link> 支持
          </p>
          {/* <Link href="/privacy">隐私政策</Link> ·{' '} */}
          {/* <Link href="/terms">服务条款</Link> */}
        </div>
      </div>
    </footer>
  )
}

