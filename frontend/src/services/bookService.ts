import type { Book, BookFormData, BookStats } from '../types/book';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class BookService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getBooks(): Promise<Book[]> {
    const response = await fetch(`${API_BASE_URL}/books`);
    return this.handleResponse<Book[]>(response);
  }

  async getBook(id: string): Promise<Book> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`);
    return this.handleResponse<Book>(response);
  }

  async createBook(bookData: BookFormData): Promise<Book> {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
    });
    return this.handleResponse<Book>(response);
  }

  async updateBook(id: string, bookData: BookFormData): Promise<Book> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
    });
    return this.handleResponse<Book>(response);
  }

  async deleteBook(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async getBookStats(): Promise<BookStats> {
    const response = await fetch(`${API_BASE_URL}/books/stats`);
    return this.handleResponse<BookStats>(response);
  }
}

export default new BookService();