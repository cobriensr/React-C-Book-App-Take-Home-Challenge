// frontend/src/components/Favorites/FavoritesList.tsx

import React, { useState } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { FavoriteCard } from './FavoriteCard';

export const FavoritesList: React.FC = () => {
  const { favorites, loading, error, refetch } = useFavorites();
  const [filter, setFilter] = useState<'all' | 'with-notes'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'author'>('date');

  const filteredFavorites = favorites.filter(fav => {
    if (filter === 'with-notes') {
      return fav.notes && fav.notes.trim().length > 0;
    }
    return true;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return (a.book?.title || '').localeCompare(b.book?.title || '');
      case 'author':
        return (a.book?.author || '').localeCompare(b.book?.author || '');
      case 'date':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="favorites-list">
      <div className="favorites-header">
        <h2>My Favorite Books ({favorites.length})</h2>
        <div className="favorites-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | 'with-notes')}>
            <option value="all">All Favorites</option>
            <option value="with-notes">With Notes</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'author')}>
            <option value="date">Date Added</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>
        </div>
      </div>

      {sortedFavorites.length === 0 ? (
        <div className="empty-favorites">
          <p>No favorite books yet. Start adding books you love!</p>
        </div>
      ) : (
        <div className="favorites-grid">
          {sortedFavorites.map((favorite) => (
            <FavoriteCard
              key={favorite.id}
              favorite={favorite}
              onRemove={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
};