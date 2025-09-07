import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { GenreTrend } from '../../types/book';

Chart.register(...registerables);

interface GenreTrendChartProps {
  trends: GenreTrend[];
}

export const GenreTrendChart: React.FC<GenreTrendChartProps> = ({ trends }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !trends.length) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const allGenres = [...new Set(trends.flatMap(t => Object.keys(t.genres)))];
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#9966FF',
    ];

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: trends.map(t => t.month),
        datasets: allGenres.map((genre, index) => ({
          label: genre,
          data: trends.map(t => t.genres[genre] || 0),
          backgroundColor: colors[index % colors.length],
        })),
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Genre Distribution Over Time',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          x: { stacked: true },
          y: { stacked: true },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [trends]);

  return <canvas ref={chartRef}></canvas>;
};