// frontend/src/hooks/useFavorites.ts

import { useState, useEffect, useCallback } from 'react';
import type { Favorite } from '../types/favorite';
import favoriteService from '../services/favoriteService';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteBookIds, setFavoriteBookIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await favoriteService.getFavorites();
      setFavorites(data);
      setFavoriteBookIds(new Set(data.map(f => f.bookId)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (bookId: string, notes?: string) => {
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
  };

  const updateNotes = async (bookId: string, notes: string) => {
    try {
      const updated = await favoriteService.updateFavoriteNotes(bookId, notes);
      setFavorites(prev => 
        prev.map(f => f.bookId === bookId ? updated : f)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notes');
      throw err;
    }
  };

  const isFavorite = (bookId: string): boolean => {
    return favoriteBookIds.has(bookId);
  };

  return {
    favorites,
    loading,
    error,
    toggleFavorite,
    updateNotes,
    isFavorite,
    refetch: fetchFavorites,
  };
};