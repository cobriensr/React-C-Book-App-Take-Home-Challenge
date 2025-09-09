// frontend/src/components/BookList/BookList.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useBooks } from '../../hooks/useBooks';
import { useBookMutations } from '../../hooks/useBookMutations';
import type { Book } from '../../types/book';
import { BookCard } from './BookCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface BookListProps {
  onEditBook: (book: Book) => void;
}

type SortField = 'title' | 'author' | 'rating' | 'publishedDate';
type SortOrder = 'asc' | 'desc';

export const BookList: React.FC<BookListProps> = ({ onEditBook }) => {
  const { books, loading, error, refetch } = useBooks();
  const { deleteBook } = useBookMutations();
  const [view, setView] = useState<'grid' | 'table'>('grid');
  
  // Add state to track if we're refreshing after a favorite action
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filtering states
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sorting states
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Listen for favorite changes and refetch books
  useEffect(() => {
    const handleBooksNeedRefresh = (event: CustomEvent) => {
      console.log('Books refresh triggered by favorite action:', event.detail);
      setIsRefreshing(true);
      
      // Small delay to ensure backend has processed the change
      setTimeout(() => {
        refetch().finally(() => setIsRefreshing(false));
      }, 300);
    };

    // Listen for the custom event from FavoritesContext
    window.addEventListener('booksNeedRefresh', handleBooksNeedRefresh as EventListener);
    
    return () => {
      window.removeEventListener('booksNeedRefresh', handleBooksNeedRefresh as EventListener);
    };
  }, [refetch]);

  // Extract unique genres for filter dropdown
  const genres = useMemo(() => {
    const uniqueGenres = new Set(books.map(book => book.genre));
    return Array.from(uniqueGenres).sort((a, b) => a.localeCompare(b));
  }, [books]);

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = [...books];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply genre filter
    if (genreFilter !== 'all') {
      filtered = filtered.filter(book => book.genre === genreFilter);
    }

    // Apply rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(book => book.rating >= ratingFilter);
    }

    // Apply date range filter
    if (dateFilter.start) {
      filtered = filtered.filter(book => 
        new Date(book.publishedDate) >= new Date(dateFilter.start)
      );
    }
    if (dateFilter.end) {
      filtered = filtered.filter(book => 
        new Date(book.publishedDate) <= new Date(dateFilter.end)
      );
    }

    // Sort books
    filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sortField];
      let bValue: string | number | Date = b[sortField];

      if (sortField === 'publishedDate') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else if (typeof aValue === 'string') {
        aValue = (aValue).toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [books, searchQuery, genreFilter, ratingFilter, dateFilter, sortField, sortOrder]);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setGenreFilter('all');
    setRatingFilter(0);
    setDateFilter({ start: '', end: '' });
    setSearchQuery('');
  };

  // Show loading only on initial load, not during refresh
  if (loading && !isRefreshing) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="book-list">
      {/* Filters Section */}
      <div className="filters-section">
        <h3>Filters & Search</h3>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="book-search-input">Search</label>
            <input
              id="book-search-input"
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="genre-filter-select">Genre</label>
            <select
              id="genre-filter-select"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
            >
              <option value="all">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="minimum-rating-select">Minimum Rating</label>
            <select
              id="minimum-rating-select"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(Number(e.target.value))}
            >
              <option value="0">All Ratings</option>
              {[1, 2, 3, 4, 5].map(rating => (
                <option key={rating} value={rating}>
                  {rating}+ Stars
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="published-after-input">Published After</label>
            <input
              id="published-after-input"
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="published-before-input">Published Before</label>
            <input
              id="published-before-input"
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>

          <div className="filter-group">
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Sorting Section */}
      <div className="sorting-section">
        <div className="sort-buttons">
          <span>Sort by:</span>
          <button
            className={sortField === 'title' ? 'active' : ''}
            onClick={() => handleSort('title')}
          >
            Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={sortField === 'author' ? 'active' : ''}
            onClick={() => handleSort('author')}
          >
            Author {sortField === 'author' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={sortField === 'rating' ? 'active' : ''}
            onClick={() => handleSort('rating')}
          >
            Rating {sortField === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={sortField === 'publishedDate' ? 'active' : ''}
            onClick={() => handleSort('publishedDate')}
          >
            Date {sortField === 'publishedDate' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* List Header */}
      <div className="list-header">
        <h2>Books ({filteredAndSortedBooks.length} of {books.length})</h2>
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

      {/* Books Display */}
      {filteredAndSortedBooks.length === 0 ? (
        <div className="no-results">
          <p>No books found matching your filters.</p>
          <button onClick={clearFilters}>Clear Filters</button>
        </div>
      ) : (
        <>
          {view === 'grid' ? (
            <div className="books-grid">
              {filteredAndSortedBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onEdit={onEditBook}
                  onDelete={handleDelete}
                  // Remove this line - BookCard handles favorites internally
                  // onFavoriteToggle={() => handleFavoriteToggle(book.id)}
                />
              ))}
            </div>
          ) : (
            <table className="books-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('title')} className="sortable">
                    Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('author')} className="sortable">
                    Author {sortField === 'author' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Genre</th>
                  <th onClick={() => handleSort('publishedDate')} className="sortable">
                    Published {sortField === 'publishedDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('rating')} className="sortable">
                    Rating {sortField === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedBooks.map((book) => (
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
        </>
      )}
    </div>
  );
};