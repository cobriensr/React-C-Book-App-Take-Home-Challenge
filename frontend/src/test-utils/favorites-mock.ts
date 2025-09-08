// frontend/src/test-utils/favorites-mock.ts

import { vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import type { FavoritesContextType } from '../types/book';
import { FavoritesContext } from '../hooks/useFavoritesContext';

export const createMockFavoritesContext = (overrides?: Partial<FavoritesContextType>): FavoritesContextType => ({
  favorites: [],
  favoriteBookIds: new Set(),
  loading: false,
  error: null,
  toggleFavorite: vi.fn(),
  updateNotes: vi.fn(),
  isFavorite: vi.fn(() => false),
  refetch: vi.fn(),
  isInitialized: true,
  ...overrides,
});

// Helper to render components with FavoritesProvider
export const renderWithFavorites = (
  ui: React.ReactElement,
  contextValue?: Partial<FavoritesContextType>
) => {
  const mockContext = createMockFavoritesContext(contextValue);
  
  return render(
    React.createElement(FavoritesContext.Provider, { value: mockContext }, ui)
  );
};