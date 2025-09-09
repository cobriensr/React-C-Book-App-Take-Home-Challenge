// frontend/src/components/Favorites/FavoriteButton.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FavoriteButton } from './FavoriteButton';

// Mock the useFavorites hook
const mockIsFavorite = vi.fn();
const mockToggleFavorite = vi.fn();

vi.mock('../../hooks/useFavorites', () => ({
  useFavorites: () => ({
    isFavorite: mockIsFavorite,
    toggleFavorite: mockToggleFavorite,
    favorites: [],
    loading: false,
    error: null,
    updateNotes: vi.fn(),
    refetch: vi.fn(),
  })
}));

describe('FavoriteButton', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsFavorite.mockReturnValue(false);
  });

  it('renders unfavorited state correctly', () => {
    render(<FavoriteButton bookId="book1" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('🤍')).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Add to favorites');
  });

  it('renders favorited state correctly', () => {
    mockIsFavorite.mockReturnValue(true);

    render(<FavoriteButton bookId="book1" />);

    const button = screen.getByRole('button');
    expect(screen.getByText('❤️')).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Remove from favorites');
  });

  it('displays favorite count when showCount is true', () => {
    render(<FavoriteButton bookId="book1" showCount={true} favoriteCount={5} />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('toggles favorite on click', async () => {
    mockToggleFavorite.mockResolvedValue(undefined);

    render(<FavoriteButton bookId="book1" onToggle={mockOnToggle} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalledWith('book1', '');
      expect(mockOnToggle).toHaveBeenCalled();
    });
  });

  it('updates favorite count when toggling', async () => {
    mockToggleFavorite.mockResolvedValue(undefined);

    const { rerender } = render(
      <FavoriteButton bookId="book1" showCount={true} favoriteCount={5} />
    );

    expect(screen.getByText('5')).toBeInTheDocument();

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalled();
    });

    // After favoriting, count should increase
    mockIsFavorite.mockReturnValue(true);
    rerender(<FavoriteButton bookId="book1" showCount={true} favoriteCount={5} />);
    
    // Component should show 6 (optimistic update)
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('decreases count when removing favorite', async () => {
    mockIsFavorite.mockReturnValue(true);
    mockToggleFavorite.mockResolvedValue(undefined);

    render(<FavoriteButton bookId="book1" showCount={true} favoriteCount={5} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalled();
    });

    // After removing favorite, count should decrease
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('disables button while toggling', async () => {
    mockToggleFavorite.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<FavoriteButton bookId="book1" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('handles toggle error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockToggleFavorite.mockRejectedValue(new Error('Failed to toggle'));

    render(<FavoriteButton bookId="book1" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle favorite:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('updates when bookId changes', () => {
    mockIsFavorite.mockReturnValue(false);

    const { rerender } = render(<FavoriteButton bookId="book1" />);
    expect(screen.getByText('🤍')).toBeInTheDocument();

    mockIsFavorite.mockReturnValue(true);
    rerender(<FavoriteButton bookId="book2" />);
    
    expect(mockIsFavorite).toHaveBeenCalledWith('book2');
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  it('provides proper aria-label with count information', () => {
    render(<FavoriteButton bookId="book1" showCount={true} favoriteCount={1} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('1 person has favorited'));
  });

  it('provides proper aria-label with plural count', () => {
    render(<FavoriteButton bookId="book1" showCount={true} favoriteCount={5} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('5 people have favorited'));
  });

  it('handles favoriteCount of 0', () => {
    render(<FavoriteButton bookId="book1" showCount={true} favoriteCount={0} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('prevents negative favorite count', async () => {
    mockIsFavorite.mockReturnValue(true);
    mockToggleFavorite.mockResolvedValue(undefined);

    render(<FavoriteButton bookId="book1" showCount={true} favoriteCount={0} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalled();
    });

    // Count should not go below 0
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});