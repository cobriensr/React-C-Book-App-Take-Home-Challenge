import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

Chart.register(...registerables);

export const AdvancedStatsView: React.FC = () => {
  const { stats, ratingTrends, genreTrends, loading, error } = useAdvancedAnalytics();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  // Chart refs
  const ratingTrendChartRef = useRef<HTMLCanvasElement>(null);
  const genreTrendChartRef = useRef<HTMLCanvasElement>(null);
  const authorChartRef = useRef<HTMLCanvasElement>(null);
  const genrePreferenceChartRef = useRef<HTMLCanvasElement>(null);
  
  // Chart instances
  const chartInstances = useRef<{
    ratingTrend?: Chart;
    genreTrend?: Chart;
    author?: Chart;
    genrePreference?: Chart;
  }>({});

  useEffect(() => {
    if (!stats || !ratingTrends || !genreTrends) return;

    // Cleanup previous charts
    Object.values(chartInstances.current).forEach(chart => chart?.destroy());

    // Rating Trends Line Chart
    if (ratingTrendChartRef.current) {
      const ctx = ratingTrendChartRef.current.getContext('2d');
      if (ctx) {
        chartInstances.current.ratingTrend = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ratingTrends.map(t => new Date(t.date).toLocaleDateString()),
            datasets: [
              {
                label: 'Average Rating',
                data: ratingTrends.map(t => t.averageRating),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
              },
              {
                label: 'Books Read',
                data: ratingTrends.map(t => t.count),
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
                text: `Rating Trends (${selectedPeriod})`,
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
      }
    }

    // Genre Trends Stacked Bar Chart
    if (genreTrendChartRef.current && genreTrends.length > 0) {
      const ctx = genreTrendChartRef.current.getContext('2d');
      if (ctx) {
        const allGenres = [...new Set(genreTrends.flatMap(t => Object.keys(t.genres)))];
        const colors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#9966FF',
        ];

        chartInstances.current.genreTrend = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: genreTrends.map(t => t.month),
            datasets: allGenres.map((genre, index) => ({
              label: genre,
              data: genreTrends.map(t => t.genres[genre] || 0),
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
              x: {
                stacked: true,
              },
              y: {
                stacked: true,
              },
            },
          },
        });
      }
    }

    // Top Authors Horizontal Bar Chart
    if (authorChartRef.current && stats.topAuthors) {
      const ctx = authorChartRef.current.getContext('2d');
      if (ctx) {
        chartInstances.current.author = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: stats.topAuthors.slice(0, 10).map(a => a.author),
            datasets: [
              {
                label: 'Books Read',
                data: stats.topAuthors.slice(0, 10).map(a => a.bookCount),
                backgroundColor: '#667eea',
              },
              {
                label: 'Avg Rating',
                data: stats.topAuthors.slice(0, 10).map(a => a.averageRating),
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
                position: 'right',
                min: 0,
                max: 5,
                grid: {
                  drawOnChartArea: false,
                },
              },
            },
          },
        });
      }
    }

    // Genre Preferences Radar Chart
    if (genrePreferenceChartRef.current && stats.favoriteGenres) {
      const ctx = genrePreferenceChartRef.current.getContext('2d');
      if (ctx) {
        chartInstances.current.genrePreference = new Chart(ctx, {
          type: 'radar',
          data: {
            labels: stats.favoriteGenres.slice(0, 8).map(g => g.genre),
            datasets: [
              {
                label: 'Books Read',
                data: stats.favoriteGenres.slice(0, 8).map(g => g.count),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
              },
              {
                label: 'Average Rating',
                data: stats.favoriteGenres.slice(0, 8).map(g => g.averageRating),
                borderColor: '#48bb78',
                backgroundColor: 'rgba(72, 187, 120, 0.2)',
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
            },
            scales: {
              r: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }

    // Capture the current chart instances for cleanup
    const chartsForCleanup = { ...chartInstances.current };

    return () => {
      Object.values(chartsForCleanup).forEach(chart => chart?.destroy());
    };
  }, [stats, ratingTrends, genreTrends, selectedPeriod]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!stats) return null;

  return (
    <div className="advanced-stats-view">
      <h2>📊 Advanced Analytics Dashboard</h2>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">📚</div>
          <div className="metric-content">
            <h3>Total Books</h3>
            <p className="metric-value">{stats.totalBooks}</p>
            <span className="metric-change">
              {stats.booksThisMonth} this month
            </span>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">⭐</div>
          <div className="metric-content">
            <h3>Average Rating</h3>
            <p className="metric-value">{stats.averageRating.toFixed(2)}</p>
            <span className="metric-stars">
              {'★'.repeat(Math.round(stats.averageRating))}
            </span>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">❤️</div>
          <div className="metric-content">
            <h3>Favorites</h3>
            <p className="metric-value">{stats.totalFavorites}</p>
            <span className="metric-percentage">
              {((stats.totalFavorites / stats.totalBooks) * 100).toFixed(0)}% of library
            </span>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">🔥</div>
          <div className="metric-content">
            <h3>Reading Streak</h3>
            <p className="metric-value">{stats.readingStreak} days</p>
            <span className="metric-detail">
              {stats.booksThisYear} books this year
            </span>
          </div>
        </div>
      </div>

      {/* Reading Velocity */}
      {stats.readingVelocity && (
        <div className="reading-velocity-card">
          <h3>📖 Reading Velocity</h3>
          <div className="velocity-metrics">
            <div className="velocity-item">
              <span className="velocity-label">Books per Month</span>
              <span className="velocity-value">
                {stats.readingVelocity.booksPerMonth.toFixed(1)}
              </span>
            </div>
            <div className="velocity-item">
              <span className="velocity-label">Pages per Day</span>
              <span className="velocity-value">
                {stats.readingVelocity.pagesPerDay.toFixed(0)}
              </span>
            </div>
            <div className="velocity-item">
              <span className="velocity-label">Avg Read Time</span>
              <span className="velocity-value">
                {stats.readingVelocity.averageReadTime} days
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Period Selector for Trends */}
      <div className="period-selector">
        <label htmlFor="period-select">View trends for:</label>
        <select 
          id="period-select"
          value={selectedPeriod} 
          onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-container full-width">
          <canvas ref={ratingTrendChartRef}></canvas>
        </div>

        <div className="chart-container full-width">
          <canvas ref={genreTrendChartRef}></canvas>
        </div>

        <div className="chart-container">
          <canvas ref={authorChartRef}></canvas>
        </div>

        <div className="chart-container">
          <canvas ref={genrePreferenceChartRef}></canvas>
        </div>
      </div>

      {/* Top Lists */}
      <div className="top-lists-grid">
        <div className="top-list">
          <h3>🏆 Most Read Genres</h3>
          <ol className="genre-list">
            {stats.favoriteGenres.slice(0, 5).map((genre) => (
              <li key={genre.genre}>
                <span className="genre-name">{genre.genre}</span>
                <div className="genre-stats">
                  <span className="book-count">{genre.count} books</span>
                  <span className="genre-rating">★ {genre.averageRating.toFixed(1)}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${genre.percentage}%` }}
                  ></div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="top-list">
          <h3>✍️ Favorite Authors</h3>
          <ol className="author-list">
            {stats.topAuthors.slice(0, 5).map((author) => (
              <li key={author.author}>
                <span className="author-name">{author.author}</span>
                <div className="author-stats">
                  <span className="book-count">{author.bookCount} books</span>
                  <span className="author-rating">★ {author.averageRating.toFixed(1)}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};