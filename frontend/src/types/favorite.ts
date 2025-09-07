import type { Book } from './book';

export interface FavoriteButtonProps {
  bookId: string;
  showCount?: boolean;
  favoriteCount?: number;
  onToggle?: () => void;
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

export interface FavoriteCardProps {
  favorite: Favorite;
  onRemove: () => void;
}