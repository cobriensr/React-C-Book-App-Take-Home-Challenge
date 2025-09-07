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

export interface Favorite {
  id: string;
  userId: string;
  bookId: string;
  createdAt: string;
  notes?: string;
  book?: Book;
  user?: {
    id: string;
    name: string;
    email: string;
  };
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

export interface GenreTrend {
  month: string;
  genres: Record<string, number>;
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