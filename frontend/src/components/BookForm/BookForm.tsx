import React, { useState, useEffect } from 'react';
import type { Book, BookFormData } from '../../types/book';
import { useBookMutations } from '../../hooks/useBookMutations';

interface BookFormProps {
  book?: Book | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BookForm: React.FC<BookFormProps> = ({ book, onSuccess, onCancel }) => {
  const { createBook, updateBook, loading, error } = useBookMutations();
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    genre: '',
    publishedDate: '',
    rating: 5,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        genre: book.genre,
        publishedDate: book.publishedDate.split('T')[0],
        rating: book.rating,
      });
    }
  }, [book]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.author.trim()) {
      errors.author = 'Author is required';
    }
    if (!formData.genre.trim()) {
      errors.genre = 'Genre is required';
    }
    if (!formData.publishedDate) {
      errors.publishedDate = 'Published date is required';
    }
    if (formData.rating < 1 || formData.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (book) {
        await updateBook(book.id, formData);
      } else {
        await createBook(formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save book:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
    // Clear validation error when field is modified
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="book-form-container">
      <h2>{book ? 'Edit Book' : 'Add New Book'}</h2>
      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={validationErrors.title ? 'error' : ''}
          />
          {validationErrors.title && (
            <span className="error-message">{validationErrors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="author">Author *</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className={validationErrors.author ? 'error' : ''}
          />
          {validationErrors.author && (
            <span className="error-message">{validationErrors.author}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="genre">Genre *</label>
          <input
            type="text"
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            className={validationErrors.genre ? 'error' : ''}
          />
          {validationErrors.genre && (
            <span className="error-message">{validationErrors.genre}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="publishedDate">Published Date *</label>
          <input
            type="date"
            id="publishedDate"
            name="publishedDate"
            value={formData.publishedDate}
            onChange={handleChange}
            className={validationErrors.publishedDate ? 'error' : ''}
          />
          {validationErrors.publishedDate && (
            <span className="error-message">{validationErrors.publishedDate}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="rating">Rating (1-5) *</label>
          <select
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} - {'★'.repeat(num)}
              </option>
            ))}
          </select>
          {validationErrors.rating && (
            <span className="error-message">{validationErrors.rating}</span>
          )}
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Saving...' : book ? 'Update Book' : 'Add Book'}
          </button>
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};