// frontend/src/components/BookList/BookList.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
    
    // Books are sorted alphabetically by default, so "1984" appears first
    // Find the specific book card for "1984" and click its delete button
    const book1984 = screen.getByText('1984').closest('.book-card') as HTMLElement;
    const deleteButton = within(book1984).getByText('Delete');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(mockDeleteBook).toHaveBeenCalledWith('2'); // '1984' has id '2'
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
      
      // Initially books are sorted by title in ascending order
      // Verify initial order first
      const booksGridInitial = document.querySelector('.books-grid');
      if (booksGridInitial) {
        const initialTitles = Array.from(booksGridInitial.querySelectorAll('h3'))
          .map(el => el.textContent);
        
        // Initial order should be ascending
        expect(initialTitles[0]).toBe('1984');
        expect(initialTitles[1]).toBe('The Great Gatsby');
        expect(initialTitles[2]).toBe('To Kill a Mockingbird');
      }
      
      // Click title button to toggle to descending order
      const titleSortButton = screen.getByRole('button', { name: /title/i });
      fireEvent.click(titleSortButton);
      
      // After clicking, order should be descending
      const booksGrid = document.querySelector('.books-grid');
      
      if (booksGrid) {
        const titles = Array.from(booksGrid.querySelectorAll('h3'))
          .map(el => el.textContent);
        
        // Descending order
        expect(titles[0]).toBe('To Kill a Mockingbird');
        expect(titles[1]).toBe('The Great Gatsby');
        expect(titles[2]).toBe('1984');
      } else {
        // Fallback: Get all h3 elements and filter out non-book titles
        const allHeadings = screen.getAllByRole('heading', { level: 3 });
        const bookHeadings = allHeadings.filter(h => 
          !h.textContent?.includes('Filters') && 
          !h.textContent?.includes('Search')
        );
        const titles = bookHeadings.map(h => h.textContent);
        
        // Descending order
        expect(titles[0]).toBe('To Kill a Mockingbird');
        expect(titles[1]).toBe('The Great Gatsby');
        expect(titles[2]).toBe('1984');
      }
    });

    it('clears all filters', () => {
      render(<BookList onEditBook={mockOnEditBook} />);
      
      // Apply filters
      const searchInput = screen.getByPlaceholderText(/search by title or author/i);
      fireEvent.change(searchInput, { target: { value: 'Gatsby' } });
      
      // Clear filters - get the one in the filters section
      const filtersSection = screen.getByText('Filters & Search').closest('.filters-section') as HTMLElement;
      const clearButton = within(filtersSection).getByText(/clear filters/i);
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
      
      // Get the clear button in the no-results section specifically
      const noResultsSection = screen.getByText(/no books found/i).closest('.no-results') as HTMLElement | null;
      if (noResultsSection) {
        const clearButton = within(noResultsSection).getByRole('button', { name: /clear filters/i });
        expect(clearButton).toBeInTheDocument();
      } else {
        // Alternative: get all clear buttons and check there's at least one
        const clearButtons = screen.getAllByRole('button', { name: /clear filters/i });
        expect(clearButtons.length).toBeGreaterThan(0);
      }
    });
  });
});