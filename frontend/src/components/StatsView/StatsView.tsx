import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useBookStats } from '../../hooks/useBookStats';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

Chart.register(...registerables);

export const StatsView: React.FC = () => {
  const { stats, loading, error } = useBookStats();
  const genreChartRef = useRef<HTMLCanvasElement>(null);
  const ratingChartRef = useRef<HTMLCanvasElement>(null);
  const genreChartInstance = useRef<Chart | null>(null);
  const ratingChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!stats || !genreChartRef.current || !ratingChartRef.current) return;

    // Cleanup previous charts
    if (genreChartInstance.current) {
      genreChartInstance.current.destroy();
    }
    if (ratingChartInstance.current) {
      ratingChartInstance.current.destroy();
    }

    // Genre distribution chart
    const genreCtx = genreChartRef.current.getContext('2d');
    if (genreCtx) {
      genreChartInstance.current = new Chart(genreCtx, {
        type: 'pie',
        data: {
          labels: Object.keys(stats.booksByGenre),
          datasets: [
            {
              data: Object.values(stats.booksByGenre),
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Books by Genre',
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      });
    }

    // Rating distribution chart
    const ratingCtx = ratingChartRef.current.getContext('2d');
    if (ratingCtx) {
      ratingChartInstance.current = new Chart(ratingCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(stats.booksByRating).map((r) => `${r} Stars`),
          datasets: [
            {
              label: 'Number of Books',
              data: Object.values(stats.booksByRating),
              backgroundColor: '#36A2EB',
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Books by Rating',
            },
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    }

    return () => {
      if (genreChartInstance.current) {
        genreChartInstance.current.destroy();
      }
      if (ratingChartInstance.current) {
        ratingChartInstance.current.destroy();
      }
    };
  }, [stats]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!stats) return null;

  return (
    <div className="stats-view">
      <h2>Library Statistics</h2>
      
      <div className="stats-summary">
        <div className="stat-card">
          <h3>Total Books</h3>
          <p className="stat-value">{stats.totalBooks}</p>
        </div>
        <div className="stat-card">
          <h3>Average Rating</h3>
          <p className="stat-value">
            {stats.averageRating.toFixed(1)} ★
          </p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-wrapper">
          <canvas ref={genreChartRef}></canvas>
        </div>
        <div className="chart-wrapper">
          <canvas ref={ratingChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};