// frontend/src/components/Analytics/RatingTrendChart.tsx

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { RatingTrendChartProps } from '../../types/common';

Chart.register(...registerables);

export const RatingTrendChart: React.FC<RatingTrendChartProps> = ({ trends, period }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !trends.length) return;

    // Destroy previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trends.map(t => new Date(t.date).toLocaleDateString()),
        datasets: [
          {
            label: 'Average Rating',
            data: trends.map(t => t.averageRating),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
          },
          {
            label: 'Books Read',
            data: trends.map(t => t.count),
            borderColor: '#48bb78',
            backgroundColor: 'rgba(72, 187, 120, 0.1)',
            tension: 0.4,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Rating Trends (${period})`,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            min: 0,
            max: 5,
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [trends, period]);

  return <canvas ref={chartRef}></canvas>;
};