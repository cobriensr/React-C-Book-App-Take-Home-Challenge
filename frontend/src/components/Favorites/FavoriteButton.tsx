// frontend/src/components/Favorites/FavoriteButton.tsx

import React, { useState, useEffect } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import type { FavoriteButtonProps } from '../../types/favorite';

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  bookId,
  showCount = false,
  favoriteCount: initialCount = 0,
  onToggle,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isToggling, setIsToggling] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [localFavoriteCount, setLocalFavoriteCount] = useState(initialCount);
  const [isCurrentlyFavorite, setIsCurrentlyFavorite] = useState(false);

  // Initialize and sync favorite state
  useEffect(() => {
    setIsCurrentlyFavorite(isFavorite(bookId));
  }, [bookId, isFavorite]);

  // Update local count when initial count changes
  useEffect(() => {
    setLocalFavoriteCount(initialCount);
  }, [initialCount]);

  const handleToggle = async () => {
    // If not favorited and we want to show notes modal
    if (!isCurrentlyFavorite && showNotesModal) {
      setShowNotesModal(true);
      return;
    }

    setIsToggling(true);
    try {
      await toggleFavorite(bookId, notes);
      
      // Update local count based on action
      if (isCurrentlyFavorite) {
        // Removing favorite - decrease count
        setLocalFavoriteCount(prev => Math.max(0, prev - 1));
        setIsCurrentlyFavorite(false);
      } else {
        // Adding favorite - increase count
        setLocalFavoriteCount(prev => prev + 1);
        setIsCurrentlyFavorite(true);
      }
      
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
      
      // Adding favorite with notes - increase count
      setLocalFavoriteCount(prev => prev + 1);
      setIsCurrentlyFavorite(true);
      
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
        className={`favorite-button ${isCurrentlyFavorite ? 'favorited' : ''}`}
        onClick={handleToggle}
        disabled={isToggling}
        title={isCurrentlyFavorite ? 'Remove from favorites' : 'Add to favorites'}
        aria-label={`${isCurrentlyFavorite ? 'Remove from' : 'Add to'} favorites. ${localFavoriteCount} ${localFavoriteCount === 1 ? 'person has' : 'people have'} favorited this book`}
      >
        <span className="heart-icon">
          {isCurrentlyFavorite ? '❤️' : '🤍'}
        </span>
        {showCount && (
          <span className="favorite-count">{localFavoriteCount}</span>
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