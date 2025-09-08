// frontend/src/types/api-responses.ts

export interface OverviewStatsDto {
  totalBooks: number;
  totalFavorites: number;
  averageRating: number;
  totalReadingSessions: number;
  totalMinutesRead: number;
  totalPagesRead: number;
  booksReadThisMonth: number;
  booksAddedThisMonth: number;
}

export interface RatingTrendDto {
  date: string;
  averageRating: number;
  bookCount: number;
}

export interface GenreTrendDto {
  genre: string;
  count: number;
  percentage: number;
  averageRating: number;
  totalMinutesRead: number;
}

export interface ReadingStatsDto {
  totalSessions: number;
  totalMinutes: number;
  totalPages: number;
  averageSessionMinutes: number;
  averagePagesPerSession: number;
  mostReadGenre: string;
  longestReadBook: string;
  currentStreak: number;
  longestStreak: number;
}

export interface TopBookDto {
  bookId: string;
  title: string;
  author: string;
  rating: number;
  readingSessions: number;
  totalMinutesRead: number;
}

export interface AuthorStatsDto {
  author: string;
  bookCount: number;
  averageRating: number;
  totalMinutesRead: number;
}

export interface MonthlyStatsDto {
  month: string;
  year: number;
  booksAdded: number;
  booksRead: number;
  minutesRead: number;
  averageRating: number;
}

export interface AdvancedAnalyticsDto {
  overview: OverviewStatsDto;
  ratingTrends: RatingTrendDto[];
  genreTrends: GenreTrendDto[];
  readingStats: ReadingStatsDto;
  topBooks: TopBookDto[];
  topAuthors: AuthorStatsDto[];
  monthlyStats: MonthlyStatsDto[];
}

export interface ReadingHistoryDto {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  pagesRead: number;
  notes?: string;
}