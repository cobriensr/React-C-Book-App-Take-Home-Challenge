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
    const response = await fetch(`${API_BASE_URL}/analytics/rating-trends?period=${period}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<RatingTrend[]>(response);
  }

  async getGenreTrends(months: number = 6): Promise<GenreTrend[]> {
    const response = await fetch(`${API_BASE_URL}/analytics/genre-trends?months=${months}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<GenreTrend[]>(response);
  }

  async getReadingHistory(limit: number = 50): Promise<ReadingHistoryEntry[]> {
    const response = await fetch(`${API_BASE_URL}/analytics/reading-history?limit=${limit}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<ReadingHistoryEntry[]>(response);
  }

  async logReading(bookId: string, rating?: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/analytics/log-reading`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ bookId, rating, ratingDate: new Date().toISOString() }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}

export default new AnalyticsService();