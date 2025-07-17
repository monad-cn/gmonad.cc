import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  
  // Define routes that should hide the navbar
  // const hideNavbarRoutes = [
  //   '/blogs/[id]',
  //   '/events/[id]',
  //   '/blogs/[id]/edit',
  //   '/events/[id]/edit'
  // ];
  
  // // Check if current route should hide navbar
  // const shouldHideNavbar = hideNavbarRoutes.some(route => {
  //   // Convert route pattern to regex
  //   const routeRegex = new RegExp('^' + route.replace(/\[.*?\]/g, '[^/]+') + '$');
  //   return routeRegex.test(router.pathname);
  // });

  return (
    <div className={styles.layout}>
      {/* {!shouldHideNavbar && <Header />} */}
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
