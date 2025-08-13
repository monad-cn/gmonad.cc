import { useEffect, useRef } from 'react';
import { TrendChartProps, TimeSeriesData } from './types';
import styles from '../../pages/stats/index.module.css';

export function TrendChart({ data }: TrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 60;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 数据处理
    const metrics = ['users', 'blogs', 'tutorials', 'events', 'posts'];
    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

    // 计算最大值用于缩放
    const maxValues = metrics.map((metric) =>
      Math.max(...data.map((d) => d[metric as keyof TimeSeriesData] as number))
    );
    const globalMax = Math.max(...maxValues);

    // 绘制网格线
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;

    // 水平网格线
    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - 2 * padding) * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // 垂直网格线
    for (let i = 0; i < data.length; i++) {
      const x = padding + ((width - 2 * padding) * i) / (data.length - 1);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // 绘制数据线
    metrics.forEach((metric, metricIndex) => {
      ctx.strokeStyle = colors[metricIndex];
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding + ((width - 2 * padding) * index) / (data.length - 1);
        const value = point[metric as keyof TimeSeriesData] as number;
        const y =
          height - padding - ((height - 2 * padding) * value) / globalMax;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // 绘制数据点
      ctx.fillStyle = colors[metricIndex];
      data.forEach((point, index) => {
        const x = padding + ((width - 2 * padding) * index) / (data.length - 1);
        const value = point[metric as keyof TimeSeriesData] as number;
        const y =
          height - padding - ((height - 2 * padding) * value) / globalMax;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // 绘制Y轴标签
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - 2 * padding) * i) / 5;
      const value = Math.round((globalMax * (5 - i)) / 5);
      ctx.fillText(value.toString(), padding - 10, y);
    }

    // 绘制X轴标签
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    data.forEach((point, index) => {
      if (
        index % Math.ceil(data.length / 6) === 0 ||
        index === data.length - 1
      ) {
        const x = padding + ((width - 2 * padding) * index) / (data.length - 1);
        const date = new Date(point.date);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        ctx.fillText(label, x, height - padding + 10);
      }
    });
  }, [data]);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>周趋势图</h3>

        <div className={styles.chartLegend}>
          {['用户', '博客', '教程', '活动', '帖子'].map((label, index) => (
            <div key={label} className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{
                  backgroundColor: [
                    '#8b5cf6',
                    '#06b6d4',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                  ][index],
                }}
              />
              <span className={styles.legendLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <canvas ref={canvasRef} className={styles.chart} />
      </div>
    </div>
  );
}