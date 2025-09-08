// frontend/src/components/StatsView/StatsView.tsx

import React from 'react';
import { useBookStats } from '../../hooks/useBookStats';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { StatsSummary } from './StatsSummary';
import { StatsCharts } from './StatsCharts';
import './StatsView.css';

export const StatsView: React.FC = () => {
  const { stats, loading, error } = useBookStats();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!stats) return null;

  return (
    <div className="stats-view">
      <h2>Library Statistics</h2>
      <StatsSummary 
        totalBooks={stats.totalBooks} 
        averageRating={stats.averageRating} 
      />
      <StatsCharts 
        booksByRating={stats.booksByRating}
      />
    </div>
  );
};