// frontend/src/components/Analytics/ChartsSection.tsx

import React from 'react';
import type { AdvancedStats, RatingTrend, GenreTrend } from '../../types/book';
import { RatingTrendChart } from './RatingTrendChart';
import { GenreTrendChart } from './GenreTrendChart';
import { AuthorChart } from './AuthorChart';
import { GenrePreferenceChart } from './GenrePreferenceChart';

interface ChartsSectionProps {
  stats: AdvancedStats;
  ratingTrends: RatingTrend[];
  genreTrends: GenreTrend[];
  selectedPeriod: 'week' | 'month' | 'year';
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  stats,
  ratingTrends,
  genreTrends,
  selectedPeriod,
}) => {
  return (
    <div className="charts-grid">
      <div className="chart-container full-width">
        <RatingTrendChart 
          trends={ratingTrends} 
          period={selectedPeriod} 
        />
      </div>

      <div className="chart-container full-width">
        <GenreTrendChart trends={genreTrends} />
      </div>

      <div className="chart-container">
        <AuthorChart authors={stats.topAuthors} />
      </div>

      <div className="chart-container">
        <GenrePreferenceChart genres={stats.favoriteGenres} />
      </div>
    </div>
  );
};