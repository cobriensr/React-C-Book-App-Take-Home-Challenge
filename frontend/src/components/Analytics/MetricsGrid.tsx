import React from 'react';
import type { AdvancedStats } from '../../types/book';

interface MetricsGridProps {
  stats: AdvancedStats;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ stats }) => {
  const metrics = [
    {
      className: 'primary',
      icon: '📚',
      title: 'Total Books',
      value: stats.totalBooks,
      detail: `${stats.booksThisMonth} this month`,
    },
    {
      className: 'success',
      icon: '⭐',
      title: 'Average Rating',
      value: stats.averageRating.toFixed(2),
      detail: '★'.repeat(Math.round(stats.averageRating)),
    },
    {
      className: 'warning',
      icon: '❤️',
      title: 'Favorites',
      value: stats.totalFavorites,
      detail: `${((stats.totalFavorites / stats.totalBooks) * 100).toFixed(0)}% of library`,
    },
    {
      className: 'info',
      icon: '🔥',
      title: 'Reading Streak',
      value: `${stats.readingStreak} days`,
      detail: `${stats.booksThisYear} books this year`,
    },
  ];

  return (
    <div className="metrics-grid">
      {metrics.map((metric, index) => (
        <div key={index} className={`metric-card ${metric.className}`}>
          <div className="metric-icon">{metric.icon}</div>
          <div className="metric-content">
            <h3>{metric.title}</h3>
            <p className="metric-value">{metric.value}</p>
            <span className={metric.className === 'success' ? 'metric-stars' : 'metric-change'}>
              {metric.detail}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};