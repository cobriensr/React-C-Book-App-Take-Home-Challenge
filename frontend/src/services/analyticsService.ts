// frontend/src/services/analyticsService.ts

import type { AdvancedStats, RatingTrend, GenreTrend, ReadingHistoryEntry } from '../types/book';
import type { 
  AdvancedAnalyticsDto, 
  RatingTrendDto, 
  GenreTrendDto,
  ReadingHistoryDto,
  MonthlyStatsDto,
  AuthorStatsDto
} from '../types/api-responses';
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
    
    // Get the raw API response (it comes with nested structure)
    const apiData = await this.handleResponse<AdvancedAnalyticsDto>(response);
    
    // Log to see what we're getting (remove this in production)
    console.log('API Response:', apiData);
    
    // Transform the API response to match the AdvancedStats type
    const transformedStats: AdvancedStats = {
      // Map from Overview (with lowercase property names due to C# camelCase serialization)
      totalBooks: apiData.overview?.totalBooks || 0,
      totalFavorites: apiData.overview?.totalFavorites || 0,
      averageRating: apiData.overview?.averageRating || 0,
      booksThisMonth: apiData.overview?.booksAddedThisMonth || 0,
      booksThisYear: apiData.monthlyStats?.reduce((sum: number, month: MonthlyStatsDto) => 
        sum + (month.booksAdded || 0), 0) || 0,
      readingStreak: apiData.readingStats?.currentStreak || 0,
      
      // Map genre data from genreTrends
      booksByGenre: apiData.genreTrends?.reduce((acc: Record<string, number>, trend: GenreTrendDto) => {
        acc[trend.genre] = trend.count;
        return acc;
      }, {}) || {},
      
      // Create rating distribution (simplified - you may need to adjust)
      booksByRating: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      },
      
      // Map rating trends
      ratingTrends: apiData.ratingTrends?.map((trend: RatingTrendDto) => ({
        date: trend.date,
        averageRating: trend.averageRating,
        count: trend.bookCount
      })) || [],
      
      // Map genre trends - now matches the updated GenreTrend type
      genreTrends: apiData.genreTrends?.map((trend: GenreTrendDto) => ({
        genre: trend.genre,
        count: trend.count,
        percentage: trend.percentage,
        averageRating: trend.averageRating,
        totalMinutesRead: trend.totalMinutesRead
      })) || [],
      
      // Map reading velocity
      readingVelocity: {
        booksPerMonth: apiData.overview?.booksReadThisMonth || 0,
        pagesPerDay: apiData.readingStats?.totalPages 
          ? Math.round(apiData.readingStats.totalPages / 30) 
          : 0,
        averageReadTime: apiData.readingStats?.averageSessionMinutes || 0
      },
      
      // Map top authors
      topAuthors: apiData.topAuthors?.map((author: AuthorStatsDto) => ({
        author: author.author,
        bookCount: author.bookCount,
        averageRating: author.averageRating
      })) || [],
      
      // Map favorite genres (from genre trends)
      favoriteGenres: apiData.genreTrends?.map((trend: GenreTrendDto) => ({
        genre: trend.genre,
        count: trend.count,
        percentage: trend.percentage || 0,
        averageRating: trend.averageRating
      })) || []
    };
    
    return transformedStats;
  }

  async getRatingTrends(period: 'week' | 'month' | 'year' = 'month'): Promise<RatingTrend[]> {
    // Convert period to number of months
    const monthsMap = {
      'week': 1,  // Show last month for week view
      'month': 12, // Show last 12 months for month view
      'year': 60   // Show last 5 years for year view
    };
    const months = monthsMap[period];
    
    const response = await fetch(`${API_BASE_URL}/analytics/rating-trends?months=${months}`, {
      headers: this.getHeaders(),
    });
    
    const data = await this.handleResponse<RatingTrendDto[]>(response);
    
    // Transform the response to match RatingTrend type
    return data.map((item: RatingTrendDto) => ({
      date: item.date,
      averageRating: item.averageRating,
      count: item.bookCount  // Note: API returns 'bookCount', but frontend expects 'count'
    }));
  }

  async getGenreTrends(): Promise<GenreTrend[]> {
    const response = await fetch(`${API_BASE_URL}/analytics/genre-trends`, {
      headers: this.getHeaders(),
    });
    
    const data = await this.handleResponse<GenreTrendDto[]>(response);
    
    // Map directly to the GenreTrend type (matches API's GenreTrendDto)
    return data.map((trend: GenreTrendDto) => ({
      genre: trend.genre,
      count: trend.count,
      percentage: trend.percentage,
      averageRating: trend.averageRating,
      totalMinutesRead: trend.totalMinutesRead
    }));
  }

  async getReadingHistory(page: number = 1, pageSize: number = 20): Promise<ReadingHistoryEntry[]> {
    const response = await fetch(`${API_BASE_URL}/analytics/reading-history?page=${page}&pageSize=${pageSize}`, {
      headers: this.getHeaders(),
    });
    
    const data = await this.handleResponse<ReadingHistoryDto[]>(response);
    
    // Transform to match ReadingHistoryEntry type
    return data.map((item: ReadingHistoryDto) => ({
      id: item.id,
      userId: '', // Not provided by API, but required by type
      bookId: item.bookId,
      startedAt: item.startTime,
      finishedAt: item.endTime,
      ratingDate: item.endTime || item.startTime || new Date().toISOString(),
      rating: 0, // The reading session doesn't have a rating, you might need to get this from the book
      book: undefined // Not included in this response
    }));
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