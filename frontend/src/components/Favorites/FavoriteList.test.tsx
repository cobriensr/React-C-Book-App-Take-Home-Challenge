// frontend/src/components/Favorites/FavoritesList.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FavoritesList } from './FavoritesList';
import type { Favorite } from '../../types/favorite';

// Mock the useFavorites hook
const mockFavorites: Favorite[] = [
  {
    id: '1',
    userId: 'user1',
    bookId: 'book1',
    notes: 'Amazing story!',
    createdAt: '2023-09-01T00:00:00Z',
    book: {
      id: 'book1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      genre: 'Fiction',
      publishedDate: '2023-01-01',
      rating: 5,
    }
  },
  {
    id: '2',
    userId: 'user1',
    bookId: 'book2',
    notes: undefined,
    createdAt: '2023-09-02T00:00:00Z',
    book: {
      id: 'book2',
      title: '1984',
      author: 'George Orwell',
      genre: 'Science Fiction',
      publishedDate: '2023-02-01',
      rating: 4,
    }
  },
  {
    id: '3',
    userId: 'user1',
    bookId: 'book3',
    notes: 'Must read again!',
    createdAt: '2023-09-03T00:00:00Z',
    book: {
      id: 'book3',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      genre: 'Fiction',
      publishedDate: '2023-03-01',
      rating: 5,
    }
  },
];

const mockRefetch = vi.fn();

let mockUseFavoritesReturn: {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isFavorite: ReturnType<typeof vi.fn>;
  toggleFavorite: ReturnType<typeof vi.fn>;
  updateNotes: ReturnType<typeof vi.fn>;
} = {
  favorites: mockFavorites,
  loading: false,
  error: null,
  refetch: mockRefetch,
  isFavorite: vi.fn(),
  toggleFavorite: vi.fn(),
  updateNotes: vi.fn(),
};

vi.mock('../../hooks/useFavorites', () => ({
  useFavorites: () => mockUseFavoritesReturn
}));

// Mock child components
vi.mock('./FavoriteCard', () => ({
  FavoriteCard: ({ favorite, onRemove }: { favorite: Favorite; onRemove: () => void }) => (
    <div data-testid={`favorite-card-${favorite.id}`}>
      <h3>{favorite.book?.title}</h3>
      <p>{favorite.book?.author}</p>
      {favorite.notes && <p>{favorite.notes}</p>}
      <button onClick={onRemove}>Remove</button>
    </div>
  )
}));

vi.mock('../common/LoadingSpinner', () => ({
  LoadingSpinner: () => <div>Loading...</div>
}));

vi.mock('../common/ErrorMessage', () => ({
  ErrorMessage: ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div>
      <p>Error: {message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  )
}));

describe('FavoritesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFavoritesReturn = {
      favorites: mockFavorites,
      loading: false,
      error: null,
      refetch: mockRefetch,
      isFavorite: vi.fn(),
      toggleFavorite: vi.fn(),
      updateNotes: vi.fn(),
    };
  });

  it('renders all favorite books', () => {
    render(<FavoritesList />);

    expect(screen.getByText('My Favorite Books (3)')).toBeInTheDocument();
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('1984')).toBeInTheDocument();
    expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseFavoritesReturn.loading = true;
    render(<FavoritesList />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error message when error occurs', () => {
    mockUseFavoritesReturn.error = 'Failed to load favorites';
    render(<FavoritesList />);

    expect(screen.getByText('Error: Failed to load favorites')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('calls refetch when retry button is clicked', () => {
    mockUseFavoritesReturn.error = 'Failed to load favorites';
    render(<FavoritesList />);

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('shows empty state when no favorites exist', () => {
    mockUseFavoritesReturn.favorites = [];
    render(<FavoritesList />);

    expect(screen.getByText('My Favorite Books (0)')).toBeInTheDocument();
    expect(screen.getByText('No favorite books yet. Start adding books you love!')).toBeInTheDocument();
  });

  it('filters to show only favorites with notes', () => {
    render(<FavoritesList />);

    const filterSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(filterSelect, { target: { value: 'with-notes' } });

    // Should only show books with notes
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.queryByText('1984')).not.toBeInTheDocument();
    expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
  });

  it('sorts favorites by title', () => {
    render(<FavoritesList />);

    const sortSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(sortSelect, { target: { value: 'title' } });

    const cards = screen.getAllByTestId(/favorite-card-/);
    const titles = cards.map(card => card.querySelector('h3')?.textContent);

    expect(titles[0]).toBe('1984');
    expect(titles[1]).toBe('The Great Gatsby');
    expect(titles[2]).toBe('To Kill a Mockingbird');
  });

  it('sorts favorites by author', () => {
    render(<FavoritesList />);

    const sortSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(sortSelect, { target: { value: 'author' } });

    const cards = screen.getAllByTestId(/favorite-card-/);
    const authors = cards.map(card => card.querySelector('p')?.textContent);

    expect(authors[0]).toBe('F. Scott Fitzgerald');
    expect(authors[1]).toBe('George Orwell');
    expect(authors[2]).toBe('Harper Lee');
  });

  it('sorts favorites by date added (default)', () => {
    render(<FavoritesList />);

    const cards = screen.getAllByTestId(/favorite-card-/);
    const titles = cards.map(card => card.querySelector('h3')?.textContent);

    // Should be in reverse chronological order (newest first)
    expect(titles[0]).toBe('To Kill a Mockingbird'); // Sept 3
    expect(titles[1]).toBe('1984'); // Sept 2
    expect(titles[2]).toBe('The Great Gatsby'); // Sept 1
  });

  it('passes refetch to FavoriteCard onRemove', () => {
    render(<FavoritesList />);

    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles favorites with null books gracefully', () => {
    const favoritesWithNullBook: Favorite[] = [
      ...mockFavorites,
      {
        id: '4',
        userId: 'user1',
        bookId: 'book4',
        notes: undefined,
        createdAt: '2023-09-04T00:00:00Z',
        book: undefined, // Use undefined instead of null to match Favorite type
      }
    ];

    mockUseFavoritesReturn.favorites = favoritesWithNullBook;
    render(<FavoritesList />);

    // Should still render the other books
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('1984')).toBeInTheDocument();
    expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
  });

  it('maintains filter and sort selections', () => {
    render(<FavoritesList />);

    const filterSelect = screen.getAllByRole('combobox')[0];
    const sortSelect = screen.getAllByRole('combobox')[1];

    fireEvent.change(filterSelect, { target: { value: 'with-notes' } });
    fireEvent.change(sortSelect, { target: { value: 'title' } });

    expect(filterSelect).toHaveValue('with-notes');
    expect(sortSelect).toHaveValue('title');
  });

  it('filters out favorites with empty string notes when filter is with-notes', () => {
    const favoritesWithEmptyNotes = [
      ...mockFavorites,
      {
        id: '4',
        userId: 'user1',
        bookId: 'book4',
        notes: '   ', // Only whitespace
        createdAt: '2023-09-04T00:00:00Z',
        updatedAt: '2023-09-04T00:00:00Z',
        book: {
          id: 'book4',
          title: 'Empty Notes Book',
          author: 'Test Author',
          genre: 'Fiction',
          publishedDate: '2023-04-01',
          rating: 3,
        }
      }
    ];

    mockUseFavoritesReturn.favorites = favoritesWithEmptyNotes;
    render(<FavoritesList />);

    const filterSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(filterSelect, { target: { value: 'with-notes' } });

    // Should not show book with empty/whitespace notes
    expect(screen.queryByText('Empty Notes Book')).not.toBeInTheDocument();
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
  });
});