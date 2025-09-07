import React from 'react';
import type { Book } from '../../types/book';

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="book-card">
      <h3>{book.title}</h3>
      <p className="author">by {book.author}</p>
      <div className="book-details">
        <span className="genre">{book.genre}</span>
        <span className="date">{formatDate(book.publishedDate)}</span>
      </div>
      <div className="rating">{renderStars(book.rating)}</div>
      <div className="book-actions">
        <button onClick={() => onEdit(book)} className="edit-button">
          Edit
        </button>
        <button onClick={() => onDelete(book.id)} className="delete-button">
          Delete
        </button>
      </div>
    </div>
  );
};