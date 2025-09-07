import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookList } from './BookList/BookList';
import { BookForm } from './BookForm/BookForm';
import { StatsView } from './StatsView/StatsView';
import { FavoritesList } from './Favorites/FavoritesList';
import { AdvancedStatsView } from './Analytics/AdvancedStatsView';
import type { Book } from '../types/book';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
  };

  const handleFormSuccess = () => {
    setEditingBook(null);
  };

  const handleFormCancel = () => {
    setEditingBook(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>📚 Book Library Manager</h1>
          <div className="user-info">
            <span>Welcome, {user?.name}!</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
        <nav className="app-nav">
          <NavLink to="/dashboard/books" className={({ isActive }) => isActive ? 'active' : ''}>
            Book List
          </NavLink>
          <NavLink to="/dashboard/favorites" className={({ isActive }) => isActive ? 'active' : ''}>
            ❤️ Favorites
          </NavLink>
          <NavLink to="/dashboard/add" className={({ isActive }) => isActive ? 'active' : ''}>
            Add Book
          </NavLink>
          <NavLink to="/dashboard/stats" className={({ isActive }) => isActive ? 'active' : ''}>
            Statistics
          </NavLink>
          <NavLink to="/dashboard/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
            📊 Analytics
          </NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="books" element={<BookList onEditBook={handleEditBook} />} />
          <Route path="favorites" element={<FavoritesList />} />
          <Route
            path="add"
            element={
              <BookForm
                book={editingBook}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            }
          />
          <Route path="stats" element={<StatsView />} />
          <Route path="analytics" element={<AdvancedStatsView />} />
          <Route path="/" element={<Navigate to="books" replace />} />
        </Routes>
      </main>
    </div>
  );
};