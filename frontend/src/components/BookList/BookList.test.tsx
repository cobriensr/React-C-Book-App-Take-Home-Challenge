// frontend/src/components/BookList/BookList.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BookList } from './BookList';
import type { Book } from '../../types/book';

// Mock the FavoriteButton component to avoid dependency issues
vi.mock('../Favorites/FavoriteButton', () => ({
  FavoriteButton: () => null
}));

// Mock the hooks
vi.mock('../../hooks/useBooks', () => ({
  useBooks: () => ({
    books: mockBooks,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../hooks/useBookMutations', () => ({
  useBookMutations: () => ({
    deleteBook: vi.fn(),
    loading: false,
    error: null,
  }),
}));

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'JavaScript Guide',
    author: 'John Doe',
    genre: 'Programming',
    publishedDate: '2023-01-01T00:00:00Z',
    rating: 5,
  },
  {
    id: '2',
    title: 'React Basics',
    author: 'Jane Smith',
    genre: 'Programming',
    publishedDate: '2022-06-15T00:00:00Z',
    rating: 4,
  },
  {
    id: '3',
    title: 'The Great Novel',
    author: 'Bob Johnson',
    genre: 'Fiction',
    publishedDate: '2021-03-20T00:00:00Z',
    rating: 3,
  },
];

describe('BookList Filtering and Sorting', () => {
  const mockOnEditBook = vi.fn();

  it('filters books by search query', () => {
    const { container } = render(<BookList onEditBook={mockOnEditBook} />);

    const searchInput = screen.getByPlaceholderText('Search by title or author...');
    fireEvent.change(searchInput, { target: { value: 'React' } });

    // Cast to HTMLElement
    const booksGrid = container.querySelector('.books-grid') as HTMLElement;
    expect(booksGrid).toBeInTheDocument();
    
    // Get book titles within the grid
    const bookTitles = within(booksGrid).getAllByRole('heading', { level: 3 });
    
    expect(bookTitles).toHaveLength(1);
    expect(bookTitles[0]).toHaveTextContent('React Basics');
  });

  it('filters books by genre', () => {
    const { container } = render(<BookList onEditBook={mockOnEditBook} />);

    const genreSelect = screen.getByLabelText('Genre');
    fireEvent.change(genreSelect, { target: { value: 'Fiction' } });

    const booksGrid = container.querySelector('.books-grid') as HTMLElement;
    expect(booksGrid).toBeInTheDocument();
    
    const bookTitles = within(booksGrid).getAllByRole('heading', { level: 3 });
    
    expect(bookTitles).toHaveLength(1);
    expect(bookTitles[0]).toHaveTextContent('The Great Novel');
  });

  it('filters books by minimum rating', () => {
    const { container } = render(<BookList onEditBook={mockOnEditBook} />);

    const ratingSelect = screen.getByLabelText('Minimum Rating');
    fireEvent.change(ratingSelect, { target: { value: '4' } });

    const booksGrid = container.querySelector('.books-grid') as HTMLElement;
    expect(booksGrid).toBeInTheDocument();
    
    const bookTitles = within(booksGrid).getAllByRole('heading', { level: 3 });
    
    expect(bookTitles).toHaveLength(2);
    expect(bookTitles[0]).toHaveTextContent('JavaScript Guide');
    expect(bookTitles[1]).toHaveTextContent('React Basics');
  });

  it('sorts books by title', () => {
    const { container } = render(<BookList onEditBook={mockOnEditBook} />);

    const booksGrid = container.querySelector('.books-grid') as HTMLElement;
    let bookTitles = within(booksGrid).getAllByRole('heading', { level: 3 });
    
    // Books start pre-sorted by title ascending
    expect(bookTitles[0]).toHaveTextContent('JavaScript Guide');
    expect(bookTitles[1]).toHaveTextContent('React Basics');
    expect(bookTitles[2]).toHaveTextContent('The Great Novel');

    // Click to toggle to descending
    const sortButtons = container.querySelector('.sort-buttons') as HTMLElement;
    const titleSortButton = within(sortButtons).getByText(/Title/);
    fireEvent.click(titleSortButton);
    
    bookTitles = within(booksGrid).getAllByRole('heading', { level: 3 });
    expect(bookTitles[0]).toHaveTextContent('The Great Novel');
    expect(bookTitles[1]).toHaveTextContent('React Basics');
    expect(bookTitles[2]).toHaveTextContent('JavaScript Guide');
  });

  it('clears all filters', () => {
    const { container } = render(<BookList onEditBook={mockOnEditBook} />);

    // Apply filters
    const searchInput = screen.getByPlaceholderText('Search by title or author...');
    fireEvent.change(searchInput, { target: { value: 'React' } });

    let booksGrid = container.querySelector('.books-grid') as HTMLElement;
    expect(booksGrid).toBeInTheDocument();
    
    let bookTitles = within(booksGrid).getAllByRole('heading', { level: 3 });
    expect(bookTitles).toHaveLength(1);

    // Clear filters using the button in the filters section
    const filtersSection = container.querySelector('.filters-section') as HTMLElement;
    expect(filtersSection).toBeInTheDocument();
    
    const clearButton = within(filtersSection).getByText('Clear Filters');
    fireEvent.click(clearButton);

    booksGrid = container.querySelector('.books-grid') as HTMLElement;
    expect(booksGrid).toBeInTheDocument();
    
    bookTitles = within(booksGrid).getAllByRole('heading', { level: 3 });
    expect(bookTitles).toHaveLength(3);
    expect(searchInput).toHaveValue('');
  });

  it('shows no results message when no books match filters', () => {
    render(<BookList onEditBook={mockOnEditBook} />);

    const searchInput = screen.getByPlaceholderText('Search by title or author...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentBook' } });

    expect(screen.getByText('No books found matching your filters.')).toBeInTheDocument();
    
    // Use getAllByText since there are multiple "Clear Filters" buttons
    const clearButtons = screen.getAllByText('Clear Filters');
    expect(clearButtons.length).toBeGreaterThan(0);
  });
});