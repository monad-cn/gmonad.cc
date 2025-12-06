import { TrendingUp, TrendingDown, Navigation, Info } from 'lucide-react';
import { Tooltip, Card } from 'antd';
import { AnalyticsCardProps } from './types';
import styles from '../../pages/stats/index.module.css';

export function AnalyticsCard({
  title,
  value,
  suffix = '',
  icon,
  color,
  trend,
  tooltip,
  description,
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
      className={`${trend?styles.analyticsCard:styles.analyticsCardShot}`}
      style={{ '--card-color': color } as any}
      hoverable={showDetails}
      onClick={showDetails ? onDetailsClick : undefined}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon} style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div className={styles.titleContainer}>
          <h3 className={styles.cardTitle}>{title}</h3>
          {description && (
            <Tooltip title={description} placement="top">
              <Info className={styles.infoIcon} size={14} />
            </Tooltip>
          )}
        </div>
      </div>

      <div className={styles.cardTotal}>
        <p className={styles.totalNumber}>
          {formatValue(value)}
          {suffix}
        </p>
      </div>

      {trend !== undefined && (
        <div className={styles.analyticsCardGrowth}>
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
          <span className={styles.analyticsGrowthLabel}>vs 昨日</span>
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

 