// frontend/src/components/Analytics/AuthorChart.tsx

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { AuthorChartProps } from '../../types/common';

Chart.register(...registerables);

export const AuthorChart: React.FC<AuthorChartProps> = ({ authors }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !authors?.length) return;

    // Destroy previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Take only top 5 authors
    const topAuthors = authors.slice(0, 5);

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topAuthors.map(a => a.author),
        datasets: [
          {
            label: 'Books',
            data: topAuthors.map(a => a.bookCount),
            backgroundColor: 'rgba(102, 126, 234, 0.8)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 1,
          }
        ],
      },
      options: {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Top Authors by Book Count',
            padding: {
              top: 10,
              bottom: 30
            },
            font: {
              size: 14
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const author = topAuthors[context.dataIndex];
                return `Avg Rating: ${author.averageRating.toFixed(1)} ★`;
              }
            }
          }
        },
        layout: {
          padding: {
            left: 20,
            right: 20,
            top: 0,
            bottom: 0
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              precision: 0
            },
            title: {
              display: true,
              text: 'Number of Books'
            }
          },
          y: {
            ticks: {
              autoSkip: false,
              callback: function(_, index) {
                const label = this.getLabelForValue(index as number);
                // Truncate very long names
                if (label && label.length > 25) {
                  return label.substring(0, 22) + '...';
                }
                return label;
              }
            }
          }
        }
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [authors]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '300px',
        position: 'relative',
        padding: '10px'
      }}
    >
      <canvas ref={chartRef}></canvas>
    </div>
  );
};