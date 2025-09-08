// frontend/src/components/Dashboard.tsx
import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookList } from './BookList/BookList';
import { BookForm } from './BookForm/BookForm';
import { StatsView } from './StatsView/StatsView';
import { FavoritesList } from './Favorites/FavoritesList';
import { AdvancedStatsView } from './Analytics/AdvancedStatsView';
import type { Book } from '../types/book';

export const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    navigate('/dashboard/add');
  };

  const handleFormSuccess = () => {
    setEditingBook(null);
    // Increment refresh key to force BookList to re-render and fetch new data
    setRefreshKey(prev => prev + 1);
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
          <Route 
            path="books" 
            element={<BookList key={refreshKey} onEditBook={handleEditBook} />} 
          />
          <Route 
            path="favorites" 
            element={<FavoritesList key={refreshKey} />} 
          />
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
          <Route 
            path="stats" 
            element={<StatsView key={refreshKey} />} 
          />
          <Route 
            path="analytics" 
            element={<AdvancedStatsView key={refreshKey} />} 
          />
          <Route path="/" element={<Navigate to="books" replace />} />
        </Routes>
      </main>
    </div>
  );
};