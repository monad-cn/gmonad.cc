import { useState, useEffect } from 'react';
import { Button } from 'antd';
import { X } from 'lucide-react';
import styles from './CookieConsent.module.css';

declare global {
  interface Window {
    gtag?: (
      command: 'consent' | 'config' | 'event',
      targetId: string,
      config?: any
    ) => void;
  }
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      // 如果已同意，启用 Google Analytics
      if (consent === 'accepted' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'granted',
        });
      }
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    
    // 启用 Google Analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
    
    // 禁用 Google Analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
      });
    }
  };

  const handleClose = () => {
    // 关闭横幅默认为拒绝
    handleDecline();
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className={styles.banner}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.textContent}>
            <p className={styles.description}>
              我们使用 Cookie 来改善您的浏览体验并分析网站流量。这些 Cookie 帮助我们了解访问者如何使用我们的网站，以便我们可以改进服务。
              您可以选择接受或拒绝非必要的 Cookie。
            </p>
            <p className={styles.additionalInfo}>
              通过点击"接受全部"，您同意存储 Cookie 用于网站分析和改进用户体验。
              {/* 了解更多信息，请查看我们的{' '}
              <a href="/privacy" className={styles.privacyLink}>
                隐私政策
              </a> */}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={styles.closeButton}
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className={styles.buttonGroup}>
          <Button
            type="primary"
            onClick={handleAccept}
            className={styles.acceptButton}
            size="small"
          >
            接受全部
          </Button>
          <Button
            onClick={handleDecline}
            className={styles.declineButton}
            size="small"
          >
            拒绝非必要
          </Button>
        </div>
      </div>
    </div>
  );
}