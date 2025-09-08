// frontend/src/components/Analytics/AuthorChart.tsx

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { AuthorChartProps } from '../../types/common';

Chart.register(...registerables);

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

    const topAuthors = authors.slice(0, 5); // Reduced to 5 for better visibility

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topAuthors.map(a => {
          // Truncate long author names
          const name = a.author;
          return name.length > 20 ? name.substring(0, 20) + '...' : name;
        }),
        datasets: [
          {
            label: 'Books Read',
            data: topAuthors.map(a => a.bookCount),
            backgroundColor: '#667eea',
            borderRadius: 4,
          },
          {
            label: 'Avg Rating',
            data: topAuthors.map(a => a.averageRating),
            backgroundColor: '#48bb78',
            yAxisID: 'y1',
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 10,
            right: 50, // Extra padding for the rating axis
            top: 10,
            bottom: 10
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Top Authors',
            padding: 20,
            font: {
              size: 16
            }
          },
          legend: {
            display: true,
            position: 'bottom' as const,
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
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              padding: 5,
              font: {
                size: 11
              }
            },
            grid: {
              display: false
            }
          },
          y1: {
            type: 'linear' as const,
            display: true,
            position: 'top' as const,
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

  return (
    <div style={{ position: 'relative', height: '350px', width: '100%' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};