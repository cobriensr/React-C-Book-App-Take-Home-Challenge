// frontend/src/hooks/useFavorites.ts

import { useFavoritesContext } from './useFavoritesContext';

/**
 * Hook for accessing favorites functionality.
 * This is a convenience wrapper around useFavoritesContext for backward compatibility.
 *
 * @returns The favorites context value
 */
export const useFavorites = () => {
  return useFavoritesContext();
};