// frontend/src/types/common.ts

import type React from 'react';
import type { AdvancedStats } from './book';

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