// frontend/src/components/BookList/BookList.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookList } from './BookList';
import type { Book } from '../../types/book';

// Mock the useBooks hook
const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    publishedDate: '2023-01-01',
    rating: 5,
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    genre: 'Science Fiction',
    publishedDate: '2023-02-01',
    rating: 4,
  },
  {
    id: '3',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    publishedDate: '2023-03-01',
    rating: 3,
  },
];

const mockRefetch = vi.fn();

vi.mock('../../hooks/useBooks', () => ({
  useBooks: () => ({
    books: mockBooks,
    loading: false,
    error: null,
    refetch: mockRefetch,
  }),
}));

// Mock the useBookMutations hook
const mockDeleteBook = vi.fn();

vi.mock('../../hooks/useBookMutations', () => ({
  useBookMutations: () => ({
    deleteBook: mockDeleteBook,
    createBook: vi.fn(),
    updateBook: vi.fn(),
    loading: false,
    error: null,
  }),
}));

// Mock the FavoritesContext
vi.mock('../../hooks/useFavoritesContext', () => ({
  useFavoritesContext: () => ({
    isFavorite: vi.fn(() => false),
    toggleFavorite: vi.fn(),
    loading: false,
    isInitialized: true,
    favorites: [],
    favoriteBookIds: new Set(),
    error: null,
    updateNotes: vi.fn(),
    refetch: vi.fn(),
  })
}));

// Mock window.confirm
global.confirm = vi.fn(() => true);

describe('BookList', () => {
  const mockOnEditBook = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all books', () => {
    render(<BookList onEditBook={mockOnEditBook} />);
    
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('1984')).toBeInTheDocument();
    expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
  });

  it('handles book deletion', async () => {
    mockDeleteBook.mockResolvedValue(undefined);
    
    render(<BookList onEditBook={mockOnEditBook} />);
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(mockDeleteBook).toHaveBeenCalledWith('1');
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Filtering and Sorting', () => {
    it('filters books by search query', () => {
      render(<BookList onEditBook={mockOnEditBook} />);
      
      const searchInput = screen.getByPlaceholderText(/search by title or author/i);
      fireEvent.change(searchInput, { target: { value: 'Gatsby' } });
      
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      expect(screen.queryByText('1984')).not.toBeInTheDocument();
      expect(screen.queryByText('To Kill a Mockingbird')).not.toBeInTheDocument();
    });

    it('filters books by genre', () => {
      render(<BookList onEditBook={mockOnEditBook} />);
      
      const genreSelect = screen.getByLabelText(/genre/i);
      fireEvent.change(genreSelect, { target: { value: 'Fiction' } });
      
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      expect(screen.queryByText('1984')).not.toBeInTheDocument();
      expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
    });

    it('filters books by minimum rating', () => {
      render(<BookList onEditBook={mockOnEditBook} />);
      
      const ratingSelect = screen.getByLabelText(/minimum rating/i);
      fireEvent.change(ratingSelect, { target: { value: '4' } });
      
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      expect(screen.getByText('1984')).toBeInTheDocument();
      expect(screen.queryByText('To Kill a Mockingbird')).not.toBeInTheDocument();
    });

    it('sorts books by title', () => {
      render(<BookList onEditBook={mockOnEditBook} />);
      
      const titleSortButton = screen.getByRole('button', { name: /title/i });
      fireEvent.click(titleSortButton);
      
      const bookTitles = screen.getAllByRole('heading', { level: 3 })
        .map(el => el.textContent);
      
      expect(bookTitles[0]).toBe('1984');
      expect(bookTitles[1]).toBe('The Great Gatsby');
      expect(bookTitles[2]).toBe('To Kill a Mockingbird');
    });

    it('clears all filters', () => {
      render(<BookList onEditBook={mockOnEditBook} />);
      
      // Apply filters
      const searchInput = screen.getByPlaceholderText(/search by title or author/i);
      fireEvent.change(searchInput, { target: { value: 'Gatsby' } });
      
      // Clear filters
      const clearButton = screen.getByText(/clear filters/i);
      fireEvent.click(clearButton);
      
      // All books should be visible again
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      expect(screen.getByText('1984')).toBeInTheDocument();
      expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
    });

    it('shows no results message when no books match filters', () => {
      render(<BookList onEditBook={mockOnEditBook} />);
      
      const searchInput = screen.getByPlaceholderText(/search by title or author/i);
      fireEvent.change(searchInput, { target: { value: 'Nonexistent Book' } });
      
      expect(screen.getByText(/no books found matching your filters/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
    });
  });
});