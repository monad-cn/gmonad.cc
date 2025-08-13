import { TrendingUp, TrendingDown, Navigation } from 'lucide-react';
import { Tooltip, Card } from 'antd';
import { AnalyticsCardProps } from './types';
import styles from '../index.module.css';

export function AnalyticsCard({
  title,
  value,
  suffix = '',
  icon,
  color,
  trend,
  tooltip,
  showDetails = false,
  onDetailsClick,
}: AnalyticsCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      if (val >= 10000) {
        return (val / 10000).toFixed(1) + 'w';
      }
      return val.toLocaleString();
    }
    return val;
  };

  const cardContent = (
    <Card
      className={styles.analyticsCard}
      style={{ '--card-color': color } as any}
      hoverable={showDetails}
      onClick={showDetails ? onDetailsClick : undefined}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon} style={{ backgroundColor: color }}>
          {icon}
        </div>
        <h3 className={styles.cardTitle}>{title}</h3>
      </div>

      <div className={styles.cardTotal}>
        <p className={styles.totalNumber}>
          {formatValue(value)}
          {suffix}
        </p>
      </div>

      {trend !== undefined && (
        <div className={styles.cardGrowth}>
          {trend >= 0 ? (
            <TrendingUp className={styles.trendIcon} />
          ) : (
            <TrendingDown className={styles.trendIcon} />
          )}
          <span
            className={`${styles.growthText} ${trend >= 0 ? styles.positive : styles.negative}`}
          >
            {trend >= 0 ? '+' : ''}
            {trend.toFixed(1)}%
          </span>
          <span className={styles.growthLabel}>vs 昨日</span>
        </div>
      )}

      {showDetails && (
        <div className={styles.cardDetails}>
          <Navigation className={styles.detailsIcon} />
          <span>查看详情</span>
        </div>
      )}
    </Card>
  );

  return tooltip ? (
    <Tooltip title={tooltip} placement="top" color="#fff">
      {cardContent}
    </Tooltip>
  ) : (
    cardContent
  );
}