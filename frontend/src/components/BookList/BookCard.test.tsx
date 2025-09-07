// frontend/src/components/BookList/BookCard.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookCard } from './BookCard';
import type { Book } from '../../types/book';

// Mock the FavoriteButton component
vi.mock('../Favorites/FavoriteButton', () => ({
  FavoriteButton: () => null
}));

describe('BookCard', () => {
  const mockBook: Book = {
    id: '1',
    title: 'Test Book',
    author: 'Test Author',
    genre: 'Fiction',
    publishedDate: '2023-01-01T00:00:00Z',
    rating: 4,
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  it('renders book information correctly', () => {
    render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('by Test Author')).toBeInTheDocument();
    expect(screen.getByText('Fiction')).toBeInTheDocument();
    expect(screen.getByText('★★★★☆')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockBook);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockBook.id);
  });

  it('formats date correctly', () => {
    const { container } = render(
      <BookCard book={mockBook} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // Cast to HTMLElement
    const dateElement = container.querySelector('.date') as HTMLElement;
    expect(dateElement).toBeInTheDocument();
    // Just check that it contains a valid date format
    expect(dateElement.textContent).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
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
});