export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  publishedDate: string;
  rating: number;
}

export interface BookFormData {
  title: string;
  author: string;
  genre: string;
  publishedDate: string;
  rating: number;
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