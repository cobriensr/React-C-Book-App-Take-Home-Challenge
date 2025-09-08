// frontend/src/types/common.ts

import type React from 'react';
import type { AdvancedStats, RatingTrend, GenrePreference, AuthorStats, ReadingVelocity as VelocityType } from './book';

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export interface MetricsGridProps {
  stats: AdvancedStats;
}

export interface StatsChartsProps {
  booksByRating: Record<number, number>;
}

export interface StatsSummaryProps {
  totalBooks: number;
  averageRating: number;
}

export interface RatingDistributionChartProps {
  data: Record<number, number>;
}

export interface PeriodSelectorProps {
  selectedPeriod: 'week' | 'month' | 'year';
  onPeriodChange: (period: 'week' | 'month' | 'year') => void;
}

export interface RatingTrendChartProps {
  trends: RatingTrend[];
  period: 'week' | 'month' | 'year';
}

export interface ReadingVelocityProps {
  velocity: VelocityType;
}

export interface TopListsProps {
  favoriteGenres: GenrePreference[];
  topAuthors: AuthorStats[];
}