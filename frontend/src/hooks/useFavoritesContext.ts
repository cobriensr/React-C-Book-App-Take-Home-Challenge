// frontend/src/hooks/useFavoritesContext.ts

import { useContext, createContext } from 'react';
import type { FavoritesContextType } from '../types/book';

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);
export const useFavoritesContext = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
};