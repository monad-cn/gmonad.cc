import { useState, useEffect, useRef } from 'react';
import { AnalyticsTrendData } from '../../pages/api/stats';
import { AnalyticsTrendChartProps, TooltipData,  } from './types';
import styles from '../../pages/stats/index.module.css';

export function AnalyticsTrendChart({ data }: AnalyticsTrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData>({
    visible: false,
    x: 0,
    y: 0,
    date: '',
    values: { pageViews: 0, users: 0, sessions: 0 }
  });

  useEffect(() => {
    if (!canvasRef.current || !data || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 60;

    ctx.clearRect(0, 0, width, height);

    const metrics = ['pageViews', 'users', 'sessions'];
    const colors = ['#3b82f6', '#f59e0b', '#ef4444'];

    const maxValues = metrics.map((metric) =>
      Math.max(
        ...data.map((d) => d[metric as keyof AnalyticsTrendData] as number)
      )
    );
    const globalMax = Math.max(...maxValues);

    // 绘制网格线
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - 2 * padding) * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

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
        const value = point[metric as keyof AnalyticsTrendData] as number;
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
        const value = point[metric as keyof AnalyticsTrendData] as number;
        const y =
          height - padding - ((height - 2 * padding) * value) / globalMax;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // Y轴标签
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - 2 * padding) * i) / 5;
      const value = Math.round((globalMax * (5 - i)) / 5);
      ctx.fillText(value.toString(), padding - 10, y);
    }

    // X轴标签
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

  // 处理鼠标移动事件
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !data || !data.length) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const width = rect.width;
    const height = rect.height;
    const padding = 60;
    
    // 检查鼠标是否在图表区域内
    if (mouseX < padding || mouseX > width - padding || 
        mouseY < padding || mouseY > height - padding) {
      setTooltip(prev => ({ ...prev, visible: false }));
      return;
    }
    
    // 计算最接近的数据点
    const chartWidth = width - 2 * padding;
    const relativeX = mouseX - padding;
    const dataIndex = Math.round((relativeX / chartWidth) * (data.length - 1));
    
    if (dataIndex >= 0 && dataIndex < data.length) {
      const dataPoint = data[dataIndex];
      const date = new Date(dataPoint.date);
      const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日`;
      
      setTooltip({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        date: formattedDate,
        values: {
          pageViews: dataPoint.pageViews,
          users: dataPoint.users,
          sessions: dataPoint.sessions
        }
      });
    }
  };

  // 处理鼠标离开事件
  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>运营数据趋势</h3>

        <div className={styles.chartLegend}>
          {['页面浏览量', '用户数', '会话数'].map(
            (label, index) => (
              <div key={label} className={styles.legendItem}>
                <div
                  className={styles.legendColor}
                  style={{
                    backgroundColor: [
                      '#3b82f6',
                      '#f59e0b',
                      '#ef4444',
                    ][index],
                  }}
                />
                <span className={styles.legendLabel}>{label}</span>
              </div>
            )
          )}
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <canvas 
          ref={canvasRef} 
          className={styles.chart}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        {tooltip.visible && (
          <div 
            className={styles.chartTooltip}
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              position: 'fixed',
              zIndex: 1000
            }}
          >
            <div className={styles.tooltipHeader}>{tooltip.date}</div>
            <div className={styles.tooltipContent}>
              <div className={styles.tooltipItem}>
                <div className={styles.tooltipColor} style={{ backgroundColor: '#3b82f6' }}></div>
                <span>页面浏览量: {tooltip.values.pageViews.toLocaleString()}</span>
              </div>
              <div className={styles.tooltipItem}>
                <div className={styles.tooltipColor} style={{ backgroundColor: '#f59e0b' }}></div>
                <span>用户数: {tooltip.values.users.toLocaleString()}</span>
              </div>
              <div className={styles.tooltipItem}>
                <div className={styles.tooltipColor} style={{ backgroundColor: '#ef4444' }}></div>
                <span>会话数: {tooltip.values.sessions.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}