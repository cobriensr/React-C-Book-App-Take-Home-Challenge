// frontend/src/components/BookForm/BookForm.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookForm } from './BookForm';
import type { Book } from '../../types/book';

// Mock the useBookMutations hook
const mockCreateBook = vi.fn();
const mockUpdateBook = vi.fn();

vi.mock('../../hooks/useBookMutations', () => ({
  useBookMutations: () => ({
    createBook: mockCreateBook,
    updateBook: mockUpdateBook,
    loading: false,
    error: null,
  }),
}));

describe('BookForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateBook.mockReset();
    mockUpdateBook.mockReset();
    mockOnSuccess.mockReset();
    mockOnCancel.mockReset();
  });

  describe('Create Mode', () => {
    it('renders empty form in create mode', () => {
      render(
        <BookForm book={null} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('Add New Book')).toBeInTheDocument();
      expect(screen.getByLabelText(/Title \*/)).toHaveValue('');
      expect(screen.getByLabelText(/Author \*/)).toHaveValue('');
      expect(screen.getByLabelText(/Genre \*/)).toHaveValue('');
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

      // Verify that onSuccess was not called
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('submits form with valid data', async () => {
      mockCreateBook.mockResolvedValue({});

      render(
        <BookForm book={null} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/Title \*/), {
        target: { value: 'New Book' },
      });
      fireEvent.change(screen.getByLabelText(/Author \*/), {
        target: { value: 'New Author' },
      });
      fireEvent.change(screen.getByLabelText(/Genre \*/), {
        target: { value: 'Fiction' },
      });
      fireEvent.change(screen.getByLabelText(/Published Date \*/), {
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
      expect(screen.getByLabelText(/Title \*/)).toHaveValue('Existing Book');
      expect(screen.getByLabelText(/Author \*/)).toHaveValue('Existing Author');
      expect(screen.getByLabelText(/Genre \*/)).toHaveValue('Non-Fiction');
      expect(screen.getByLabelText(/Rating/)).toHaveValue('3');
    });

    it('validates rating range', () => {
      render(
        <BookForm book={mockBook} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Test that all valid ratings are available
      const ratingSelect = screen.getByLabelText(/Rating/);
      
      [1, 2, 3, 4, 5].forEach(rating => {
        expect(screen.getByText(`${rating} - ${'★'.repeat(rating)}`)).toBeInTheDocument();
      });

      // Verify the current value
      expect(ratingSelect).toHaveValue('3');
    });

    it('updates book with valid data', async () => {
      mockUpdateBook.mockResolvedValue({});

      render(
        <BookForm book={mockBook} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Modify a field
      fireEvent.change(screen.getByLabelText(/Title \*/), {
        target: { value: 'Updated Book Title' },
      });

      const submitButton = screen.getByText('Update Book');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateBook).toHaveBeenCalledWith('1', {
          title: 'Updated Book Title',
          author: 'Existing Author',
          genre: 'Non-Fiction',
          publishedDate: '2022-06-15',
          rating: 3,
        });
        expect(mockOnSuccess).toHaveBeenCalled();
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

  it('clears validation errors when field is modified', async () => {
    render(
      <BookForm book={null} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    // Trigger validation errors
    const submitButton = screen.getByText('Add Book');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    // Type in the title field
    fireEvent.change(screen.getByLabelText(/Title \*/), {
      target: { value: 'A' },
    });

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });
});