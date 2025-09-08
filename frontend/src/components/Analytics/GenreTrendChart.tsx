// frontend/src/components/Analytics/GenreTrendChart.tsx

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { GenreTrendChartProps } from '../../types/common';

Chart.register(...registerables);

export const GenreTrendChart: React.FC<GenreTrendChartProps> = ({ trends }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !trends?.length) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Since GenreTrend now represents individual genres, not monthly data,
    // we'll create a different visualization
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#9966FF',
    ];

    // Sort trends by count for better visualization
    const sortedTrends = [...trends].sort((a, b) => b.count - a.count);

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedTrends.map(t => t.genre),
        datasets: [
          {
            label: 'Number of Books',
            data: sortedTrends.map(t => t.count),
            backgroundColor: colors,
            borderColor: colors.map(c => c),
            borderWidth: 1
          },
          {
            label: 'Average Rating',
            data: sortedTrends.map(t => t.averageRating),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            type: 'line',
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Genre Distribution & Ratings',
            font: {
              size: 16
            }
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                if (context.datasetIndex === 0) {
                  const trend = sortedTrends[context.dataIndex];
                  return [
                    `Percentage: ${trend.percentage.toFixed(1)}%`,
                    `Reading Time: ${formatMinutes(trend.totalMinutesRead)}`
                  ];
                }
                return [];
              }
            }
          },
          legend: {
            display: true,
            position: 'top' as const,
          }
        },
        scales: {
          y: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            title: {
              display: true,
              text: 'Number of Books'
            }
          },
          y1: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            title: {
              display: true,
              text: 'Average Rating'
            },
            min: 0,
            max: 5,
            grid: {
              drawOnChartArea: false,
            },
          },
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [trends]);

  // Helper function to format minutes
  function formatMinutes(minutes: number): string {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  return (
    <div style={{ position: 'relative', height: '400px', width: '100%' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};