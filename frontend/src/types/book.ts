// frontend/src/types/book.ts

import type { Favorite } from './favorite';
export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  publishedDate: string;
  rating: number;
  userId?: string;
  isFavorite?: boolean;
  favoriteCount?: number;
  averageRating?: number;
  totalRatings?: number;
}

export interface ReadingHistoryEntry {
  id: string;
  userId: string;
  bookId: string;
  startedAt?: string;
  finishedAt?: string;
  ratingDate: string;
  rating: number;
  book?: Book;
}

export interface AdvancedStats {
  totalBooks: number;
  totalFavorites: number;
  averageRating: number;
  booksByGenre: Record<string, number>;
  booksByRating: Record<number, number>;
  ratingTrends: RatingTrend[];
  genreTrends: GenreTrend[];
  readingVelocity: ReadingVelocity;
  topAuthors: AuthorStats[];
  favoriteGenres: GenrePreference[];
  readingStreak: number;
  booksThisMonth: number;
  booksThisYear: number;
}

export interface RatingTrend {
  date: string;
  averageRating: number;
  count: number;
}

// Updated to match API's GenreTrendDto structure
export interface GenreTrend {
  genre: string;
  count: number;
  percentage: number;
  averageRating: number;
  totalMinutesRead: number;
}

export interface ReadingVelocity {
  booksPerMonth: number;
  pagesPerDay: number;
  averageReadTime: number;
}

export interface AuthorStats {
  author: string;
  bookCount: number;
  averageRating: number;
}

export interface GenrePreference {
  genre: string;
  count: number;
  percentage: number;
  averageRating: number;
}

export interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
  showFavoriteButton?: boolean;
}
export interface BookFormData {
  title: string;
  author: string;
  genre: string;
  publishedDate: string;
  rating: number;
}

export interface BookFormProps {
  book?: Book | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export interface BookStats {
  totalBooks: number;
  averageRating: number;
  booksByGenre: Record<string, number>;
  booksByRating: Record<number, number>;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface FavoritesContextType {
  favorites: Favorite[];
  favoriteBookIds: Set<string>;
  loading: boolean;
  error: string | null;
  toggleFavorite: (bookId: string, notes?: string) => Promise<void>;
  updateNotes: (bookId: string, notes: string) => Promise<void>;
  isFavorite: (bookId: string) => boolean;
  refetch: () => Promise<void>;
  isInitialized: boolean;
}