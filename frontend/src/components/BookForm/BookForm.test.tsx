import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookForm } from './BookForm';
import type { Book } from '../../types/book';

// Mock the useBookMutations hook
vi.mock('../../hooks/useBookMutations', () => ({
  useBookMutations: () => ({
    createBook: vi.fn().mockResolvedValue({}),
    updateBook: vi.fn().mockResolvedValue({}),
    loading: false,
    error: null,
  }),
}));

describe('BookForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('renders empty form in create mode', () => {
      render(
        <BookForm book={null} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('Add New Book')).toBeInTheDocument();
      expect(screen.getByLabelText(/Title/)).toHaveValue('');
      expect(screen.getByLabelText(/Author/)).toHaveValue('');
      expect(screen.getByLabelText(/Genre/)).toHaveValue('');
    });

    it('validates required fields', async () => {
      render(
        <BookForm book={null} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const submitButton = screen.getByText('Add Book');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
        expect(screen.getByText('Author is required')).toBeInTheDocument();
        expect(screen.getByText('Genre is required')).toBeInTheDocument();
      });
    });

    it('submits form with valid data', async () => {
      const { useBookMutations } = await import('../../hooks/useBookMutations');
      const mockCreateBook = vi.fn().mockResolvedValue({});
      
      vi.mocked(useBookMutations).mockReturnValue({
        createBook: mockCreateBook,
        updateBook: vi.fn(),
        deleteBook: vi.fn(),
        loading: false,
        error: null,
      });

      render(
        <BookForm book={null} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByLabelText(/Title/), {
        target: { value: 'New Book' },
      });
      fireEvent.change(screen.getByLabelText(/Author/), {
        target: { value: 'New Author' },
      });
      fireEvent.change(screen.getByLabelText(/Genre/), {
        target: { value: 'Fiction' },
      });
      fireEvent.change(screen.getByLabelText(/Published Date/), {
        target: { value: '2023-01-01' },
      });

      const submitButton = screen.getByText('Add Book');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateBook).toHaveBeenCalledWith({
          title: 'New Book',
          author: 'New Author',
          genre: 'Fiction',
          publishedDate: '2023-01-01',
          rating: 5,
        });
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Edit Mode', () => {
    const mockBook: Book = {
      id: '1',
      title: 'Existing Book',
      author: 'Existing Author',
      genre: 'Non-Fiction',
      publishedDate: '2022-06-15T00:00:00Z',
      rating: 3,
    };

    it('renders form with book data in edit mode', () => {
      render(
        <BookForm book={mockBook} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('Edit Book')).toBeInTheDocument();
      expect(screen.getByLabelText(/Title/)).toHaveValue('Existing Book');
      expect(screen.getByLabelText(/Author/)).toHaveValue('Existing Author');
      expect(screen.getByLabelText(/Genre/)).toHaveValue('Non-Fiction');
      expect(screen.getByLabelText(/Rating/)).toHaveValue('3');
    });

    it('validates rating range', async () => {
      render(
        <BookForm book={mockBook} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const ratingSelect = screen.getByLabelText(/Rating/);
      fireEvent.change(ratingSelect, { target: { value: '6' } });

      await waitFor(() => {
        expect(screen.getByText('Rating must be between 1 and 5')).toBeInTheDocument();
      });

      // Test that all valid ratings are available
      [1, 2, 3, 4, 5].forEach(rating => {
        expect(screen.getByText(`${rating} - ${'★'.repeat(rating)}`)).toBeInTheDocument();
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <BookForm book={null} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});