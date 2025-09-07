import { useState } from 'react';
import { BookList } from './components/BookList/BookList';
import { BookForm } from './components/BookForm/BookForm';
import { StatsView } from './components/StatsView/StatsView';
import type { Book } from './types/book';
import './App.css';

type View = 'list' | 'form' | 'stats';

function App() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setCurrentView('form');
  };

  const handleFormSuccess = () => {
    setEditingBook(null);
    setCurrentView('list');
    // The BookList component will refetch automatically
  };

  const handleFormCancel = () => {
    setEditingBook(null);
    setCurrentView('list');
  };

  const handleAddNew = () => {
    setEditingBook(null);
    setCurrentView('form');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 Book Library Manager</h1>
        <nav className="app-nav">
          <button
            className={currentView === 'list' ? 'active' : ''}
            onClick={() => setCurrentView('list')}
          >
            Book List
          </button>
          <button
            className={currentView === 'form' ? 'active' : ''}
            onClick={handleAddNew}
          >
            Add Book
          </button>
          <button
            className={currentView === 'stats' ? 'active' : ''}
            onClick={() => setCurrentView('stats')}
          >
            Statistics
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentView === 'list' && (
          <>
            <button onClick={handleAddNew} className="add-button">
              + Add New Book
            </button>
            <BookList onEditBook={handleEditBook} />
          </>
        )}
        {currentView === 'form' && (
          <BookForm
            book={editingBook}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}
        {currentView === 'stats' && <StatsView />}
      </main>
    </div>
  );
}

export default App;