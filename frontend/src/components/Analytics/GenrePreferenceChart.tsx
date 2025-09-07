import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { GenrePreference } from '../../types/book';

Chart.register(...registerables);

interface GenrePreferenceChartProps {
  genres: GenrePreference[];
}

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

    const topGenres = genres.slice(0, 8);

    chartInstance.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: topGenres.map(g => g.genre),
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
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Genre Preferences',
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
            position: 'bottom',
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            angleLines: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              backdropColor: 'transparent',
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

  return <canvas ref={chartRef}></canvas>;
};