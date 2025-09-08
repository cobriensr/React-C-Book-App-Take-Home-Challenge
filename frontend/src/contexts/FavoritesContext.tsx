// frontend/src/contexts/FavoritesContext.tsx

import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Favorite } from '../types/favorite';
import favoriteService from '../services/favoriteService';
import { FavoritesContext } from '../hooks/useFavoritesContext';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteBookIds, setFavoriteBookIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await favoriteService.getFavorites();
      setFavorites(data);
      setFavoriteBookIds(new Set(data.map(f => f.bookId)));
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
      setIsInitialized(true); // Set initialized even on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(async (bookId: string, notes?: string) => {
    try {
      if (favoriteBookIds.has(bookId)) {
        await favoriteService.removeFavorite(bookId);
        setFavoriteBookIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(bookId);
          return newSet;
        });
        setFavorites(prev => prev.filter(f => f.bookId !== bookId));
      } else {
        const favorite = await favoriteService.addFavorite(bookId, notes);
        setFavoriteBookIds(prev => new Set(prev).add(bookId));
        setFavorites(prev => [...prev, favorite]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
      throw err;
    }
  }, [favoriteBookIds]);

  const updateNotes = useCallback(async (bookId: string, notes: string) => {
    try {
      const updated = await favoriteService.updateFavoriteNotes(bookId, notes);
      setFavorites(prev =>
        prev.map(f => f.bookId === bookId ? updated : f)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notes');
      throw err;
    }
  }, []);

  const isFavorite = useCallback((bookId: string): boolean => {
    return favoriteBookIds.has(bookId);
  }, [favoriteBookIds]);

  const value = React.useMemo(() => ({
    favorites,
    favoriteBookIds,
    loading,
    error,
    toggleFavorite,
    updateNotes,
    isFavorite,
    refetch: fetchFavorites,
    isInitialized
  }), [
    favorites,
    favoriteBookIds,
    loading,
    error,
    toggleFavorite,
    updateNotes,
    isFavorite,
    fetchFavorites,
    isInitialized
  ]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
