// frontend/src/components/Analytics/MetricsGrid.tsx

import React from 'react';
import type { MetricsGridProps } from '../../types/common';

export const MetricsGrid: React.FC<MetricsGridProps> = ({ stats }) => {
  const totalBooks = stats?.totalBooks || 0;
  const totalFavorites = stats?.totalFavorites || 0;
  const averageRating = stats?.averageRating || 0;
  const booksThisMonth = stats?.booksThisMonth || 0;
  const booksThisYear = stats?.booksThisYear || 0;
  const readingStreak = stats?.readingStreak || 0;
  
  const metrics = [
    {
      className: 'primary',
      icon: '📚',
      title: 'Total Books',
      value: totalBooks.toString(),
      detail: `${booksThisMonth} this month`,
    },
    {
      className: 'success',
      icon: '⭐',
      title: 'Average Rating',
      value: averageRating.toFixed(2),
      detail: averageRating > 0 ? '★'.repeat(Math.round(averageRating)) : 'No ratings yet',
    },
    {
      className: 'warning',
      icon: '❤️',
      title: 'Favorites',
      value: totalFavorites.toString(),
      detail: totalBooks > 0 
        ? `${((totalFavorites / totalBooks) * 100).toFixed(0)}% of library`
        : '0% of library',
    },
    {
      className: 'info',
      icon: '🔥',
      title: 'Reading Streak',
      value: `${readingStreak} days`,
      detail: `${booksThisYear} books this year`,
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