// frontend/src/hooks/useAdvancedAnalytics.ts

import { useState, useEffect } from 'react';
import type { AdvancedStats, RatingTrend, GenreTrend } from '../types/book';
import analyticsService from '../services/analyticsService';

export const useAdvancedAnalytics = () => {
  const [stats, setStats] = useState<AdvancedStats | null>(null);
  const [ratingTrends, setRatingTrends] = useState<RatingTrend[]>([]);
  const [genreTrends, setGenreTrends] = useState<GenreTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [statsData, ratingData, genreData] = await Promise.all([
          analyticsService.getAdvancedStats(),
          analyticsService.getRatingTrends('month'),
          analyticsService.getGenreTrends(),
        ]);
        
        setStats(statsData);
        setRatingTrends(ratingData);
        setGenreTrends(genreData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const refreshTrends = async (period: 'week' | 'month' | 'year') => {
    try {
      const ratingData = await analyticsService.getRatingTrends(period);
      setRatingTrends(ratingData);
    } catch (err) {
      console.error('Failed to refresh trends:', err);
    }
  };

  return {
    stats,
    ratingTrends,
    genreTrends,
    loading,
    error,
    refreshTrends,
  };
};