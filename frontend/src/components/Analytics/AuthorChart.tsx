import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { AuthorStats } from '../../types/book';

Chart.register(...registerables);

interface AuthorChartProps {
  authors: AuthorStats[];
}

export const AuthorChart: React.FC<AuthorChartProps> = ({ authors }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !authors?.length) return;

    // Destroy previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const topAuthors = authors.slice(0, 10);

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topAuthors.map(a => a.author),
        datasets: [
          {
            label: 'Books Read',
            data: topAuthors.map(a => a.bookCount),
            backgroundColor: '#667eea',
          },
          {
            label: 'Avg Rating',
            data: topAuthors.map(a => a.averageRating),
            backgroundColor: '#48bb78',
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Top 10 Authors',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.dataset.label === 'Avg Rating') {
                  return `${context.dataset.label}: ${context.parsed.x.toFixed(1)} ★`;
                }
                return `${context.dataset.label}: ${context.parsed.x}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Books Read',
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'top',
            min: 0,
            max: 5,
            grid: {
              drawOnChartArea: false,
            },
            title: {
              display: true,
              text: 'Average Rating',
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
  }, [authors]);

  return <canvas ref={chartRef}></canvas>;
};