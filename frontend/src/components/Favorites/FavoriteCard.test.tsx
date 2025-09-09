// frontend/src/components/Favorites/FavoriteCard.test.tsx

import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FavoriteCard } from './FavoriteCard';
import type { Favorite } from '../../types/favorite';

// Mock the useFavorites hook
const mockToggleFavorite = vi.fn();
const mockUpdateNotes = vi.fn();

vi.mock('../../hooks/useFavorites', () => ({
  useFavorites: () => ({
    toggleFavorite: mockToggleFavorite,
    updateNotes: mockUpdateNotes,
    favorites: [],
    loading: false,
    error: null,
    isFavorite: vi.fn(),
    refetch: vi.fn(),
  })
}));

// Mock window.confirm
global.confirm = vi.fn(() => true);

describe('FavoriteCard', () => {
  const mockFavorite: Favorite = {
    id: '1',
    userId: 'user1',
    bookId: 'book1',
    notes: 'Great book!',
    createdAt: '2023-09-08T00:00:00Z',
    book: {
      id: 'book1',
      title: 'Test Book',
      author: 'Test Author',
      genre: 'Fiction',
      publishedDate: '2023-01-01',
      rating: 4,
    }
  };

  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.confirm as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  it('renders favorite book information correctly', () => {
    render(<FavoriteCard favorite={mockFavorite} onRemove={mockOnRemove} />);

    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('by Test Author')).toBeInTheDocument();
    expect(screen.getByText('Fiction')).toBeInTheDocument();
    expect(screen.getByText('★★★★')).toBeInTheDocument();
    expect(screen.getByText('Great book!')).toBeInTheDocument();
  });

  it('displays formatted date correctly', () => {
    render(<FavoriteCard favorite={mockFavorite} onRemove={mockOnRemove} />);

    // Should show "Added Sep 8, 2023" or similar format
    expect(screen.getByText(/Added/)).toBeInTheDocument();
  });

  it('handles remove favorite when confirmed', async () => {
    mockToggleFavorite.mockResolvedValue(undefined);

    render(<FavoriteCard favorite={mockFavorite} onRemove={mockOnRemove} />);

    const removeButton = screen.getByRole('button', { name: /❌/ });
    fireEvent.click(removeButton);

    expect(global.confirm).toHaveBeenCalledWith('Remove this book from favorites?');
    
    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalledWith('book1');
      expect(mockOnRemove).toHaveBeenCalled();
    });
  });

  it('does not remove favorite when cancelled', () => {
    ((global.confirm as unknown) as MockInstance).mockReturnValue(false);

    render(<FavoriteCard favorite={mockFavorite} onRemove={mockOnRemove} />);

    const removeButton = screen.getByRole('button', { name: /❌/ });
    fireEvent.click(removeButton);

    expect(mockToggleFavorite).not.toHaveBeenCalled();
    expect(mockOnRemove).not.toHaveBeenCalled();
  });

  it('shows add notes button when no notes exist', () => {
    const favoriteWithoutNotes = { ...mockFavorite, notes: undefined };
    render(<FavoriteCard favorite={favoriteWithoutNotes} onRemove={mockOnRemove} />);

    expect(screen.getByText('+ Add Notes')).toBeInTheDocument();
  });

  it('enters edit mode when edit notes is clicked', () => {
    render(<FavoriteCard favorite={mockFavorite} onRemove={mockOnRemove} />);

    const editButton = screen.getByText('Edit Notes');
    fireEvent.click(editButton);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Great book!');
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('updates notes when save is clicked', async () => {
    mockUpdateNotes.mockResolvedValue(undefined);

    render(<FavoriteCard favorite={mockFavorite} onRemove={mockOnRemove} />);

    const editButton = screen.getByText('Edit Notes');
    fireEvent.click(editButton);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated notes!' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateNotes).toHaveBeenCalledWith('book1', 'Updated notes!');
    });
  });

  it('cancels editing when cancel is clicked', () => {
    render(<FavoriteCard favorite={mockFavorite} onRemove={mockOnRemove} />);

    const editButton = screen.getByText('Edit Notes');
    fireEvent.click(editButton);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Changed text' } });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Great book!')).toBeInTheDocument();
    expect(mockUpdateNotes).not.toHaveBeenCalled();
  });

  it('handles error when removing favorite fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockToggleFavorite.mockRejectedValue(new Error('Failed to remove'));

    render(<FavoriteCard favorite={mockFavorite} onRemove={mockOnRemove} />);

    const removeButton = screen.getByRole('button', { name: /❌/ });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to remove favorite:', expect.any(Error));
    });

    expect(mockOnRemove).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles error when updating notes fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockUpdateNotes.mockRejectedValue(new Error('Failed to update'));

    render(<FavoriteCard favorite={mockFavorite} onRemove={mockOnRemove} />);

    const editButton = screen.getByText('Edit Notes');
    fireEvent.click(editButton);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to update notes:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('renders nothing when book is undefined', () => {
    const favoriteWithoutBook = { ...mockFavorite, book: undefined };
    const { container } = render(<FavoriteCard favorite={favoriteWithoutBook} onRemove={mockOnRemove} />);

    expect(container.firstChild).toBeNull();
  });
});