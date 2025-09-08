// frontend/src/components/Favorites/FavoriteCard.tsx

import React, { useState } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import type { FavoriteCardProps } from '../../types/favorite';

export const FavoriteCard: React.FC<FavoriteCardProps> = ({ favorite, onRemove }) => {
  const { toggleFavorite, updateNotes } = useFavorites();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(favorite.notes || '');

  const handleRemove = async () => {
    if (window.confirm('Remove this book from favorites?')) {
      try {
        await toggleFavorite(favorite.bookId);
        onRemove();
      } catch (error) {
        console.error('Failed to remove favorite:', error);
      }
    }
  };

  const handleUpdateNotes = async () => {
    try {
      await updateNotes(favorite.bookId, notes);
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Failed to update notes:', error);
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

  if (!favorite.book) return null;

  return (
    <div className="favorite-card">
      <div className="favorite-card-header">
        <h3>{favorite.book.title}</h3>
        <button className="remove-favorite" onClick={handleRemove}>
          ❌
        </button>
      </div>
      
      <p className="book-author">by {favorite.book.author}</p>
      <div className="book-meta">
        <span className="genre-tag">{favorite.book.genre}</span>
        <span className="rating">{'★'.repeat(favorite.book.rating)}</span>
      </div>
      
      <div className="favorite-meta">
        <span className="added-date">Added {formatDate(favorite.createdAt)}</span>
      </div>

      <div className="favorite-notes">
        {isEditingNotes ? (
          <div className="notes-editor">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your thoughts about this book..."
              rows={3}
            />
            <div className="notes-actions">
              <button onClick={handleUpdateNotes}>Save</button>
              <button onClick={() => {
                setNotes(favorite.notes || '');
                setIsEditingNotes(false);
              }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {favorite.notes ? (
              <div className="notes-display">
                <p>{favorite.notes}</p>
                <button 
                  className="edit-notes-btn"
                  onClick={() => setIsEditingNotes(true)}
                >
                  Edit Notes
                </button>
              </div>
            ) : (
              <button 
                className="add-notes-btn"
                onClick={() => setIsEditingNotes(true)}
              >
                + Add Notes
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};