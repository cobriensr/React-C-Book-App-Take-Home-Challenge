import React, { useState } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import type { FavoriteButtonProps } from '../../types/favorite';

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  bookId,
  showCount = false,
  favoriteCount = 0,
  onToggle,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isToggling, setIsToggling] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');

  const handleToggle = async () => {
    if (!isFavorite(bookId) && showNotesModal) {
      setShowNotesModal(true);
      return;
    }

    setIsToggling(true);
    try {
      await toggleFavorite(bookId, notes);
      onToggle?.();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsToggling(false);
      setShowNotesModal(false);
      setNotes('');
    }
  };

  const handleAddWithNotes = async () => {
    setIsToggling(true);
    try {
      await toggleFavorite(bookId, notes);
      onToggle?.();
      setShowNotesModal(false);
      setNotes('');
    } catch (error) {
      console.error('Failed to add favorite:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <button
        className={`favorite-button ${isFavorite(bookId) ? 'favorited' : ''}`}
        onClick={handleToggle}
        disabled={isToggling}
        title={isFavorite(bookId) ? 'Remove from favorites' : 'Add to favorites'}
      >
        <span className="heart-icon">
          {isFavorite(bookId) ? '❤️' : '🤍'}
        </span>
        {showCount && (
          <span className="favorite-count">{favoriteCount}</span>
        )}
      </button>

      {showNotesModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add to Favorites</h3>
            <textarea
              placeholder="Add notes about why you love this book... (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            <div className="modal-actions">
              <button onClick={handleAddWithNotes} disabled={isToggling}>
                Add to Favorites
              </button>
              <button onClick={() => setShowNotesModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};