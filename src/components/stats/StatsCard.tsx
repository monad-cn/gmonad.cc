import { TrendingUp, TrendingDown } from 'lucide-react';
import { StatsCardProps } from './types';
import styles from '../../pages/stats/index.module.css';

export function StatsCard({
  title,
  total,
  newThisWeek,
  weeklyGrowth,
  icon,
  color,
}: StatsCardProps) {
  const isPositiveGrowth = weeklyGrowth >= 0;

  return (
    <div className={styles.statsCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon} style={{ backgroundColor: color }}>
          {icon}
        </div>
        <h3 className={styles.cardTitle}>{title}</h3>
      </div>

      <div className={styles.cardTotal}>
        <p className={styles.totalNumber}>{total.toLocaleString()}</p>
        <p className={styles.totalLabel}>总数</p>
      </div>

      <div className={styles.cardNew}>
        <p className={styles.newNumber}>+{newThisWeek.toLocaleString()}</p>
        <p className={styles.newLabel}>本周新增</p>
      </div>

      <div className={styles.cardGrowth}>
        {isPositiveGrowth ? (
          <TrendingUp className={styles.trendIcon} />
        ) : (
          <TrendingDown className={styles.trendIcon} />
        )}
        <span
          className={`${styles.growthText} ${isPositiveGrowth ? styles.positive : styles.negative}`}
        >
          {isPositiveGrowth ? '+' : ''}
          {weeklyGrowth.toFixed(1)}%
        </span>
        <span className={styles.growthLabel}>vs 上周</span>
      </div>
    </div>
  );
}