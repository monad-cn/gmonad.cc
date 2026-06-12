import Head from 'next/head';
import Image from 'next/image';
import Auth from '@/components/Auth';
import { useAuth } from '@/contexts/AuthContext';
import styles from './index.module.css';

export default function LoginPage() {
  const { status } = useAuth();

  return (
    <>
      <Head>
        <title>登录 - Monad 中文社区</title>
      </Head>
      <div className={styles.page}>
        <section className={styles.panel}>
          <div className={styles.brand}>
            <Image
              src="/logo.png"
              alt="Monad 中文社区"
              width={44}
              height={44}
              className={styles.logo}
              priority
            />
            <div>
              <h1 className={styles.title}>登录</h1>
              <p className={styles.subtitle}>Monad 中文社区</p>
            </div>
          </div>

          <div className={styles.action}>
            <Auth />
          </div>

          {status === 'authenticated' && (
            <p className={styles.hint}>已登录，可通过头像菜单进入个人页面。</p>
          )}
        </section>
      </div>
    </>
  );
}
