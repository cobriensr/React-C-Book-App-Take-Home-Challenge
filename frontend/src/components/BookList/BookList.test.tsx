import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookList } from './BookList';
import type { Book } from '../../types/book';

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
    render(<BookList onEditBook={mockOnEditBook} />);

    const searchInput = screen.getByPlaceholderText('Search by title or author...');
    fireEvent.change(searchInput, { target: { value: 'React' } });

    const bookCards = screen.getAllByRole('heading', { level: 3 });
    expect(bookCards).toHaveLength(1);
    expect(bookCards[0]).toHaveTextContent('React Basics');
  });

  it('filters books by genre', () => {
    render(<BookList onEditBook={mockOnEditBook} />);

    const genreSelect = screen.getByLabelText('Genre');
    fireEvent.change(genreSelect, { target: { value: 'Fiction' } });

    const bookCards = screen.getAllByRole('heading', { level: 3 });
    expect(bookCards).toHaveLength(1);
    expect(bookCards[0]).toHaveTextContent('The Great Novel');
  });

  it('filters books by minimum rating', () => {
    render(<BookList onEditBook={mockOnEditBook} />);

    const ratingSelect = screen.getByLabelText('Minimum Rating');
    fireEvent.change(ratingSelect, { target: { value: '4' } });

    const bookCards = screen.getAllByRole('heading', { level: 3 });
    expect(bookCards).toHaveLength(2);
    expect(bookCards[0]).toHaveTextContent('JavaScript Guide');
    expect(bookCards[1]).toHaveTextContent('React Basics');
  });

  it('sorts books by title', () => {
    render(<BookList onEditBook={mockOnEditBook} />);

    const titleSortButton = screen.getByText(/Title/);
    fireEvent.click(titleSortButton);

    const bookCards = screen.getAllByRole('heading', { level: 3 });
    expect(bookCards[0]).toHaveTextContent('JavaScript Guide');
    expect(bookCards[1]).toHaveTextContent('React Basics');
    expect(bookCards[2]).toHaveTextContent('The Great Novel');

    // Click again to reverse sort
    fireEvent.click(titleSortButton);
    const reversedCards = screen.getAllByRole('heading', { level: 3 });
    expect(reversedCards[0]).toHaveTextContent('The Great Novel');
  });

  it('clears all filters', () => {
    render(<BookList onEditBook={mockOnEditBook} />);

    // Apply filters
    const searchInput = screen.getByPlaceholderText('Search by title or author...');
    fireEvent.change(searchInput, { target: { value: 'React' } });

    let bookCards = screen.getAllByRole('heading', { level: 3 });
    expect(bookCards).toHaveLength(1);

    // Clear filters
    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    bookCards = screen.getAllByRole('heading', { level: 3 });
    expect(bookCards).toHaveLength(3);
    expect(searchInput).toHaveValue('');
  });

  it('shows no results message when no books match filters', () => {
    render(<BookList onEditBook={mockOnEditBook} />);

    const searchInput = screen.getByPlaceholderText('Search by title or author...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentBook' } });

    expect(screen.getByText('No books found matching your filters.')).toBeInTheDocument();
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });
});