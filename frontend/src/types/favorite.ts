export interface FavoriteButtonProps {
  bookId: string;
  showCount?: boolean;
  favoriteCount?: number;
  onToggle?: () => void;
}