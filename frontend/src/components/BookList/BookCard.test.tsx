// frontend/src/components/BookList/BookCard.test.tsx

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookCard } from './BookCard';
import type { Book } from '../../types/book';

// Mock the FavoritesContext hook
const mockToggleFavorite = vi.fn();
const mockIsFavorite = vi.fn();

// Create a mock function that can be overridden
let mockUseFavoritesContext = () => ({
  isFavorite: mockIsFavorite,
  toggleFavorite: mockToggleFavorite,
  loading: false,
  isInitialized: true,
  favorites: [],
  favoriteBookIds: new Set(),
  error: null,
  updateNotes: vi.fn(),
  refetch: vi.fn(),
});

vi.mock('../../hooks/useFavoritesContext', () => ({
  useFavoritesContext: () => mockUseFavoritesContext()
}));

// Mock window.confirm with proper typing
global.confirm = vi.fn() as Mock;

describe('BookCard', () => {
  const mockBook: Book = {
    id: '1',
    title: 'Test Book',
    author: 'Test Author',
    genre: 'Fiction',
    publishedDate: '2023-01-01T00:00:00Z',
    rating: 4,
    favoriteCount: 5,
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsFavorite.mockReturnValue(false);
    (global.confirm as Mock).mockReturnValue(true);
    // Reset to default mock
    mockUseFavoritesContext = () => ({
      isFavorite: mockIsFavorite,
      toggleFavorite: mockToggleFavorite,
      loading: false,
      isInitialized: true,
      favorites: [],
      favoriteBookIds: new Set(),
      error: null,
      updateNotes: vi.fn(),
      refetch: vi.fn(),
    });
  });

  it('renders book information correctly', () => {
    render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('by Test Author')).toBeInTheDocument();
    expect(screen.getByText('Fiction')).toBeInTheDocument();
    expect(screen.getByText('★★★★☆')).toBeInTheDocument();
  });

  it('displays favorite button with correct state', () => {
    render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const favoriteBtn = screen.getByRole('button', { name: /add to favorites/i });
    expect(favoriteBtn).toBeInTheDocument();
    expect(screen.getByText('🤍')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // favorite count
  });

  it('displays filled heart when book is favorited', () => {
    mockIsFavorite.mockReturnValue(true);

    render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const favoriteBtn = screen.getByRole('button', { name: /remove from favorites/i });
    expect(favoriteBtn).toBeInTheDocument();
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  it('toggles favorite when heart button is clicked', async () => {
    mockToggleFavorite.mockResolvedValue(undefined);

    render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const favoriteBtn = screen.getByRole('button', { name: /add to favorites/i });
    fireEvent.click(favoriteBtn);

    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalledWith('1');
    });
  });

  it('handles favorite toggle error gracefully', async () => {
    mockToggleFavorite.mockRejectedValue(new Error('Failed to toggle'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const favoriteBtn = screen.getByRole('button', { name: /add to favorites/i });
    fireEvent.click(favoriteBtn);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle favorite:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockBook);
  });

  it('calls onDelete when delete button is clicked and confirmed', () => {
    (global.confirm as Mock).mockReturnValue(true);

    render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Test Book"?');
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('does not call onDelete when delete is cancelled', () => {
    (global.confirm as Mock).mockReturnValue(false);

    render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('formats date correctly', () => {
    render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // Look for the published date text
    expect(screen.getByText(/Published:/)).toBeInTheDocument();
    
    // The date might be Dec 31, 2022 or Jan 1, 2023 depending on timezone
    // Just check that the date is formatted and displayed
    const dateElement = screen.getByText(/Published:/);
    expect(dateElement.textContent).toMatch(/Published:\s+\w+\s+\d+,\s+\d{4}/);
  });

  it('renders correct number of stars for rating', () => {
    const testCases = [
      { rating: 1, expected: '★☆☆☆☆' },
      { rating: 3, expected: '★★★☆☆' },
      { rating: 5, expected: '★★★★★' },
    ];

    testCases.forEach(({ rating, expected }) => {
      const { rerender } = render(
        <BookCard
          book={{ ...mockBook, rating }}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
      rerender(<></>);
    });
  });

  it('shows loading state when favorites are not initialized', () => {
    // Override the mock for this specific test
    mockUseFavoritesContext = () => ({
      isFavorite: mockIsFavorite,
      toggleFavorite: mockToggleFavorite,
      loading: true,
      isInitialized: false,
      favorites: [],
      favoriteBookIds: new Set(),
      error: null,
      updateNotes: vi.fn(),
      refetch: vi.fn(),
    });

    render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // The component shows ⏳ emoji when loading and not initialized
    expect(screen.getByText('⏳')).toBeInTheDocument();
    
    // The button should also be disabled - get it by class name since it has no aria-label when loading
    const favoriteBtn = document.querySelector('.favorite-btn') as HTMLButtonElement;
    expect(favoriteBtn).toBeDisabled();
  });

  it('disables favorite button while toggling', async () => {
    mockToggleFavorite.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const favoriteBtn = screen.getByRole('button', { name: /add to favorites/i });
    fireEvent.click(favoriteBtn);

    // Button should be disabled while toggling
    expect(favoriteBtn).toBeDisabled();

    await waitFor(() => {
      expect(favoriteBtn).not.toBeDisabled();
    });
  });

  it('updates favorite count when toggling', async () => {
    mockToggleFavorite.mockResolvedValue(undefined);
    const { rerender } = render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('5')).toBeInTheDocument(); // initial count

    const favoriteBtn = screen.getByRole('button', { name: /add to favorites/i });
    fireEvent.click(favoriteBtn);

    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalled();
    });

    // After toggling to favorite, count should increase
    mockIsFavorite.mockReturnValue(true);
    rerender(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // The component should now show 6 (optimistic update)
    expect(screen.getByText('6')).toBeInTheDocument();
  });
});