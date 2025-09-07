import React from 'react';
import type { BookCardProps } from '../../types/book';
import { FavoriteButton } from '../Favorites/FavoriteButton';

export const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  onEdit, 
  onDelete,
  showFavoriteButton = true 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="book-card">
      <div className="book-card-header">
        <h3>{book.title}</h3>
        {showFavoriteButton && (
          <FavoriteButton 
            bookId={book.id} 
            showCount={true}
            favoriteCount={book.favoriteCount}
          />
        )}
      </div>
      
      <p className="author">by {book.author}</p>
      <div className="book-details">
        <span className="genre">{book.genre}</span>
        <span className="date">{formatDate(book.publishedDate)}</span>
      </div>
      <div className="rating">
        {renderStars(book.rating)}
        {book.totalRatings && (
          <span className="rating-count">({book.totalRatings} ratings)</span>
        )}
      </div>
      <div className="book-actions">
        <button onClick={() => onEdit(book)} className="edit-button">
          Edit
        </button>
        <button onClick={() => onDelete(book.id)} className="delete-button">
          Delete
        </button>
      </div>
    </div>
  );
};