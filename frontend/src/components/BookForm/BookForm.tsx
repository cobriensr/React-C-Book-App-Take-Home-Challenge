// frontend/src/components/BookForm/BookForm.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BookFormData, BookFormProps } from '../../types/book';
import { useBookMutations } from '../../hooks/useBookMutations';

export const BookForm: React.FC<BookFormProps> = ({ book, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { createBook, updateBook, loading, error } = useBookMutations();
  const [successMessage, setSuccessMessage] = useState<string>('');
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

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      genre: '',
      publishedDate: '',
      rating: 5,
    });
    setValidationErrors({});
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (book) {
        await updateBook(book.id, formData);
        setSuccessMessage('Book updated successfully!');
        // Call onSuccess to trigger parent refresh
        onSuccess();
        // Navigate back to book list
        setTimeout(() => {
          navigate('/dashboard/books');
        }, 1000);
      } else {
        await createBook(formData);
        setSuccessMessage('Book added successfully! Add another or go back to the list.');
        // Clear form for adding another book
        resetForm();
        // Call onSuccess to trigger parent refresh if needed
        onSuccess();
        
        // Optional: Auto-navigate after a few seconds
        // setTimeout(() => {
        //   navigate('/dashboard/books');
        // }, 2000);
      }
    } catch (err) {
      console.error('Failed to save book:', err);
      setSuccessMessage('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: BookFormData) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
    // Clear validation error when field is modified
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Clear success message when user starts typing again
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
    navigate('/dashboard/books');
  };

  return (
    <div className="book-form-container">
      <h2>{book ? 'Edit Book' : 'Add New Book'}</h2>
      
      {successMessage && (
        <div style={{
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          color: '#155724',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{successMessage}</span>
          <button
            onClick={() => navigate('/dashboard/books')}
            style={{
              background: '#155724',
              color: 'white',
              border: 'none',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            View All Books
          </button>
        </div>
      )}

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
            placeholder="Enter book title"
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
            placeholder="Enter author name"
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
            placeholder="e.g., Fiction, Science Fiction, Romance, Mystery"
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
            max={new Date().toISOString().split('T')[0]}
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
            {[5, 4, 3, 2, 1].map((num) => (
              <option key={num} value={num}>
                {num} - {'★'.repeat(num)}{'☆'.repeat(5-num)}
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
          <button type="button" onClick={handleCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};