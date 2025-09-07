import React from 'react';
import { GenreDistributionChart } from './GenreDistributionChart';
import { RatingDistributionChart } from './RatingDistributionChart';

interface StatsChartsProps {
  booksByGenre: Record<string, number>;
  booksByRating: Record<number, number>;
}

export const StatsCharts: React.FC<StatsChartsProps> = ({ 
  booksByGenre, 
  booksByRating 
}) => {
  return (
    <div className="charts-container">
      <div className="chart-wrapper">
        <GenreDistributionChart data={booksByGenre} />
      </div>
      <div className="chart-wrapper">
        <RatingDistributionChart data={booksByRating} />
      </div>
    </div>
  );
};