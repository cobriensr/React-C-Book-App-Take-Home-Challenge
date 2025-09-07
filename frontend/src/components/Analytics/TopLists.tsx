import React from 'react';
import type { GenrePreference, AuthorStats } from '../../types/book';

interface TopListsProps {
  favoriteGenres: GenrePreference[];
  topAuthors: AuthorStats[];
}

export const TopLists: React.FC<TopListsProps> = ({ favoriteGenres, topAuthors }) => {
  return (
    <div className="top-lists-grid">
      <GenreList genres={favoriteGenres.slice(0, 5)} />
      <AuthorList authors={topAuthors.slice(0, 5)} />
    </div>
  );
};

const GenreList: React.FC<{ genres: GenrePreference[] }> = ({ genres }) => (
  <div className="top-list">
    <h3>🏆 Most Read Genres</h3>
    <ol className="genre-list">
      {genres.map((genre) => (
        <li key={genre.genre}>
          <span className="genre-name">{genre.genre}</span>
          <div className="genre-stats">
            <span className="book-count">{genre.count} books</span>
            <span className="genre-rating">★ {genre.averageRating.toFixed(1)}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${genre.percentage}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  </div>
);

const AuthorList: React.FC<{ authors: AuthorStats[] }> = ({ authors }) => (
  <div className="top-list">
    <h3>✍️ Favorite Authors</h3>
    <ol className="author-list">
      {authors.map((author) => (
        <li key={author.author}>
          <span className="author-name">{author.author}</span>
          <div className="author-stats">
            <span className="book-count">{author.bookCount} books</span>
            <span className="author-rating">★ {author.averageRating.toFixed(1)}</span>
          </div>
        </li>
      ))}
    </ol>
  </div>
);