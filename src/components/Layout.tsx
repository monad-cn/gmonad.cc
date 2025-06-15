import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import styles from './Layout.module.css';

import { SessionProvider } from 'next-auth/react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <SessionProvider>{children}</SessionProvider>;
      </main>
      <Footer />
    </div>
  );
}
