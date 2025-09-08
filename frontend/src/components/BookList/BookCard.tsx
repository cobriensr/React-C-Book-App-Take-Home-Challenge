// frontend/src/components/BookList/BookCard.tsx

import React, { useEffect, useState } from 'react';
import { useFavoritesContext } from '../../hooks/useFavoritesContext';
import type { BookCardProps } from '../../types/book';
import './BookCard.css';

export const BookCard: React.FC<BookCardProps> = ({ book, onEdit, onDelete }) => {
  const { isFavorite, toggleFavorite, loading: favoritesLoading, isInitialized } = useFavoritesContext();
  const [isCurrentlyFavorite, setIsCurrentlyFavorite] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [localFavoriteCount, setLocalFavoriteCount] = useState(book.favoriteCount || 0);

  // Update favorite state when favorites are initialized or book changes
  useEffect(() => {
    if (isInitialized) {
      const favorited = isFavorite(book.id);
      setIsCurrentlyFavorite(favorited);
    }
  }, [book.id, isFavorite, isInitialized]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    
    if (isToggling || !isInitialized) return;
    
    setIsToggling(true);
    try {
      await toggleFavorite(book.id);
      
      // Optimistically update UI
      const newFavoriteState = !isCurrentlyFavorite;
      setIsCurrentlyFavorite(newFavoriteState);
      
      // Update local count
      if (newFavoriteState) {
        setLocalFavoriteCount(prev => prev + 1);
      } else {
        setLocalFavoriteCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Revert on error
      setIsCurrentlyFavorite(isFavorite(book.id));
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      onDelete(book.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading state for favorite button while initializing
  const renderFavoriteButton = () => {
    if (!isInitialized && favoritesLoading) {
      return (
        <button className="favorite-btn" disabled>
          <span style={{ opacity: 0.5 }}>⏳</span>
        </button>
      );
    }

    return (
      <button
        className={`favorite-btn ${isCurrentlyFavorite ? 'active' : ''}`}
        onClick={handleToggleFavorite}
        disabled={isToggling}
        aria-label={isCurrentlyFavorite ? 'Remove from favorites' : 'Add to favorites'}
        title={isCurrentlyFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <span className="heart-icon">
          {isToggling ? '⏳' : (isCurrentlyFavorite ? '❤️' : '🤍')}
        </span>
        <span className="favorite-count">{localFavoriteCount}</span>
      </button>
    );
  };

  return (
    <div className="book-card">
      <div className="book-card-header">
        <h3>{book.title}</h3>
        {renderFavoriteButton()}
      </div>
      
      <p className="book-author">by {book.author}</p>
      
      <div className="book-meta">
        <span className="genre-badge">{book.genre}</span>
        <span className="rating">
          {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
        </span>
      </div>
      
      <p className="book-date">Published: {formatDate(book.publishedDate)}</p>
      
      <div className="book-actions">
        <button className="edit-btn" onClick={() => onEdit(book)}>
          Edit
        </button>
        <button className="delete-btn" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};