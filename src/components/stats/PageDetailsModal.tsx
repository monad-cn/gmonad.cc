import {
  Eye,
  Users2,
  TrendingUp,
  Clock,
  Globe,
} from 'lucide-react';
import { PageDetailsModalProps } from './types';
import styles from '../../pages/stats/index.module.css';

export function PageDetailsModal({ visible, onClose, data }: PageDetailsModalProps) {
  if (!visible) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>页面浏览量详情</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.pageList}>
            {data.map((page, index) => (
              <div key={index} className={styles.pageItem}>
                <div className={styles.pageItemHeader}>
                  <Globe className={styles.pageIcon} />
                  <span className={styles.pagePath}>{page.page}</span>
                </div>
                <div className={styles.pageStats}>
                  <div className={styles.pageStat}>
                    <Eye className={styles.statIcon} />
                    <span>{page.pageViews.toLocaleString()}</span>
                    <span className={styles.statLabel}>浏览量</span>
                  </div>
                  {/* {page.bounceRate !== undefined && (
                    <div className={styles.pageStat}>
                      <TrendingUp className={styles.statIcon} />
                      <span>{page.bounceRate.toFixed(1)}%</span>
                      <span className={styles.statLabel}>跳出率</span>
                    </div>
                  )}
                  {page.avgTimeOnPage !== undefined && (
                    <div className={styles.pageStat}>
                      <Clock className={styles.statIcon} />
                      <span>
                        {Math.floor(page.avgTimeOnPage / 60)}m{' '}
                        {page.avgTimeOnPage % 60}s
                      </span>
                      <span className={styles.statLabel}>停留时间</span>
                    </div>
                  )} */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}