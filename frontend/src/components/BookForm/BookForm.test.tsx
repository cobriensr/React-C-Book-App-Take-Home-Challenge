// frontend/src/components/BookForm/BookForm.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BookForm } from './BookForm';
import type { Book } from '../../types/book';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

// Helper function to render with Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('BookForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateBook.mockReset();
    mockUpdateBook.mockReset();
    mockOnSuccess.mockReset();
    mockOnCancel.mockReset();
    mockNavigate.mockReset();
  });

  describe('Create Mode', () => {
    it('renders empty form in create mode', () => {
      renderWithRouter(
        <BookForm book={null} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('Add New Book')).toBeInTheDocument();
      expect(screen.getByLabelText(/Title \*/)).toHaveValue('');
      expect(screen.getByLabelText(/Author \*/)).toHaveValue('');
      expect(screen.getByLabelText(/Genre \*/)).toHaveValue('');
    });

    it('validates required fields', async () => {
      renderWithRouter(
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

      renderWithRouter(
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
      renderWithRouter(
        <BookForm book={mockBook} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('Edit Book')).toBeInTheDocument();
      expect(screen.getByLabelText(/Title \*/)).toHaveValue('Existing Book');
      expect(screen.getByLabelText(/Author \*/)).toHaveValue('Existing Author');
      expect(screen.getByLabelText(/Genre \*/)).toHaveValue('Non-Fiction');
      expect(screen.getByLabelText(/Rating/)).toHaveValue('3');
    });

    it('validates rating range', () => {
      renderWithRouter(
        <BookForm book={mockBook} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Test that all valid ratings are available
      const ratingSelect = screen.getByLabelText(/Rating/);
      
      // Updated to match the new star display format
      [5, 4, 3, 2, 1].forEach(rating => {
        const stars = '★'.repeat(rating) + '☆'.repeat(5-rating);
        expect(screen.getByText(`${rating} - ${stars}`)).toBeInTheDocument();
      });

      // Verify the current value
      expect(ratingSelect).toHaveValue('3');
    });

    it('updates book with valid data', async () => {
      mockUpdateBook.mockResolvedValue({});

      renderWithRouter(
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

      // Check for success message and navigation
      await waitFor(() => {
        expect(screen.getByText(/Book updated successfully/)).toBeInTheDocument();
      });

      // Verify navigation happens after timeout
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/books');
      }, { timeout: 2000 });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    renderWithRouter(
      <BookForm book={null} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/books');
  });

  it('clears validation errors when field is modified', async () => {
    renderWithRouter(
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