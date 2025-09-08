// frontend/src/components/Analytics/AdvancedStatsView.tsx

import React, { useState } from 'react';
import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { MetricsGrid } from './MetricsGrid';
import { ReadingVelocity } from './ReadingVelocity';
import { PeriodSelector } from './PeriodSelector';
import { ChartsSection } from './ChartsSection';
import { TopLists } from './TopLists';
import './AdvancedStatsView.css';

export const AdvancedStatsView: React.FC = () => {
  const { stats, ratingTrends, genreTrends, loading, error, refreshTrends } = useAdvancedAnalytics();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const handlePeriodChange = (period: 'week' | 'month' | 'year') => {
    setSelectedPeriod(period);
    refreshTrends(period);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!stats) return null;

  return (
    <div className="advanced-stats-view">
      <h2>📊 Advanced Analytics Dashboard</h2>
      
      <MetricsGrid stats={stats} />
      
      {stats.readingVelocity && (
        <ReadingVelocity velocity={stats.readingVelocity} />
      )}
      
      <PeriodSelector 
        selectedPeriod={selectedPeriod} 
        onPeriodChange={handlePeriodChange} 
      />
      
      <ChartsSection 
        stats={stats}
        ratingTrends={ratingTrends}
        genreTrends={genreTrends}
        selectedPeriod={selectedPeriod}
      />
      
      <TopLists 
        favoriteGenres={stats.favoriteGenres}
        topAuthors={stats.topAuthors}
      />
    </div>
  );
};