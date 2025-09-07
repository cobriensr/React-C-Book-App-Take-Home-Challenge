import { useState } from 'react';
import type { BookFormData } from '../types/book';
import bookService from '../services/bookService';

export const useBookMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBook = async (bookData: BookFormData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookService.createBook(bookData);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create book');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async (id: string, bookData: BookFormData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookService.updateBook(id, bookData);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update book');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await bookService.deleteBook(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book');
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