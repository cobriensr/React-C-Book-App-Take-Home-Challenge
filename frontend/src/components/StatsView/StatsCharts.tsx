// frontend/src/components/StatsView/StatsCharts.tsx

import React from 'react';
import { RatingDistributionChart } from './RatingDistributionChart';
import type { StatsChartsProps } from '../../types/common';

export const StatsCharts: React.FC<StatsChartsProps> = ({ 
  booksByRating 
}) => {
  return (
    <div className="charts-container">
      <div className="chart-wrapper">
        <RatingDistributionChart data={booksByRating} />
      </div>
    </div>
  );
};