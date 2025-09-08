// frontend/src/components/Analytics/GenrePreferenceChart.tsx

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { GenrePreferenceChartProps } from '../../types/common';

Chart.register(...registerables);

export const GenrePreferenceChart: React.FC<GenrePreferenceChartProps> = ({ genres }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !genres?.length) return;

    // Destroy previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const topGenres = genres.slice(0, 6); // Reduced to 6 for better visibility

    chartInstance.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: topGenres.map(g => {
          // Truncate long genre names for radar chart
          const name = g.genre;
          return name.length > 12 ? name.substring(0, 12) + '...' : name;
        }),
        datasets: [
          {
            label: 'Books Read',
            data: topGenres.map(g => g.count),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#667eea',
            pointRadius: 5,
            pointHoverRadius: 7,
          },
          {
            label: 'Average Rating',
            data: topGenres.map(g => g.averageRating),
            borderColor: '#48bb78',
            backgroundColor: 'rgba(72, 187, 120, 0.2)',
            pointBackgroundColor: '#48bb78',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#48bb78',
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 20,
            bottom: 20,
            left: 20,
            right: 20
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Genre Preferences',
            padding: 20,
            font: {
              size: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.dataset.label === 'Average Rating') {
                  return `${context.dataset.label}: ${context.parsed.r.toFixed(1)} ★`;
                }
                return `${context.dataset.label}: ${context.parsed.r}`;
              }
            }
          },
          legend: {
            position: 'bottom' as const,
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
              circular: true
            },
            angleLines: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              backdropColor: 'transparent',
              font: {
                size: 10
              }
            },
            pointLabels: {
              font: {
                size: 11
              },
              padding: 10
            }
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [genres]);

  return (
    <div style={{ position: 'relative', height: '350px', width: '100%' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};