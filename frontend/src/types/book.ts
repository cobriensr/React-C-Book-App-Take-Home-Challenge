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

export interface BookFormProps {
  book?: Book | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
}

export interface BookListProps {
  onEditBook: (book: Book) => void;
}