// frontend/src/services/analyticsService.ts

import type { AdvancedStats, RatingTrend, GenreTrend, ReadingHistoryEntry } from '../types/book';
import authService from './authService';

const API_BASE_URL = 'https://book-app-api.wittydesert-f0d21091.centralus.azurecontainerapps.io/api';

class AnalyticsService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const token = authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getAdvancedStats(): Promise<AdvancedStats> {
    const response = await fetch(`${API_BASE_URL}/analytics/advanced`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<AdvancedStats>(response);
  }

  async getRatingTrends(period: 'week' | 'month' | 'year' = 'month'): Promise<RatingTrend[]> {
    // Convert period to number of months
    const monthsMap = {
      'week': 1,    // Show last month for week view
      'month': 12,  // Show last 12 months for month view
      'year': 60    // Show last 5 years for year view
    };
    
    const months = monthsMap[period];
    
    const response = await fetch(`${API_BASE_URL}/analytics/rating-trends?months=${months}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<RatingTrend[]>(response);
  }

  async getGenreTrends(): Promise<GenreTrend[]> {
    const response = await fetch(`${API_BASE_URL}/analytics/genre-trends`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<GenreTrend[]>(response);
  }

  async getReadingHistory(page: number = 1, pageSize: number = 20): Promise<ReadingHistoryEntry[]> {
    const response = await fetch(`${API_BASE_URL}/analytics/reading-history?page=${page}&pageSize=${pageSize}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<ReadingHistoryEntry[]>(response);
  }

  async logReading(bookId: string, startTime: Date, endTime: Date, pagesRead?: number, notes?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/analytics/log-reading`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ 
        bookId, 
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        pagesRead: pagesRead || 0,
        notes: notes || ''
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }
  }
}

export default new AnalyticsService();