import React, { useState } from 'react';
import { useBooks } from '../../hooks/useBooks';
import { useBookMutations } from '../../hooks/useBookMutations';
import type { Book } from '../../types/book';
import { BookCard } from './BookCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface BookListProps {
  onEditBook: (book: Book) => void;
}

export const BookList: React.FC<BookListProps> = ({ onEditBook }) => {
  const { books, loading, error, refetch } = useBooks();
  const { deleteBook } = useBookMutations();
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook(id);
        refetch();
      } catch (err) {
        console.error('Failed to delete book:', err);
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="book-list">
      <div className="list-header">
        <h2>Books ({books.length})</h2>
        <div className="view-toggle">
          <button
            className={view === 'grid' ? 'active' : ''}
            onClick={() => setView('grid')}
          >
            Grid
          </button>
          <button
            className={view === 'table' ? 'active' : ''}
            onClick={() => setView('table')}
          >
            Table
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="books-grid">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={onEditBook}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <table className="books-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Genre</th>
              <th>Published</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.genre}</td>
                <td>{new Date(book.publishedDate).toLocaleDateString()}</td>
                <td>{'★'.repeat(book.rating)}</td>
                <td>
                  <button onClick={() => onEditBook(book)}>Edit</button>
                  <button onClick={() => handleDelete(book.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};