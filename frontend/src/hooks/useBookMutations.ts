// frontend/src/hooks/useBookMutations.ts

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import bookService from '../services/bookService';
import type { BookFormData } from '../types/book';

export const useBookMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createBook = async (bookData: BookFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newBook = await bookService.createBook(bookData);
      // Invalidate and refetch book queries
      await queryClient.invalidateQueries({ queryKey: ['books'] });
      await queryClient.invalidateQueries({ queryKey: ['bookStats'] });
      return newBook;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create book';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async (id: string, bookData: BookFormData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedBook = await bookService.updateBook(id, bookData);
      // Invalidate and refetch book queries
      await queryClient.invalidateQueries({ queryKey: ['books'] });
      await queryClient.invalidateQueries({ queryKey: ['book', id] });
      await queryClient.invalidateQueries({ queryKey: ['bookStats'] });
      return updatedBook;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update book';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await bookService.deleteBook(id);
      // Invalidate and refetch book queries
      await queryClient.invalidateQueries({ queryKey: ['books'] });
      await queryClient.invalidateQueries({ queryKey: ['bookStats'] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete book';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBook,
    updateBook,
    deleteBook,
    loading,
    error,
  };
};