import type { Book, BookFormData, BookStats } from '../types/book';
import authService from './authService';

const API_BASE_URL = 'https://book-app-api.wittydesert-f0d21091.centralus.azurecontainerapps.io/api';

class BookService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const token = authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getBooks(): Promise<Book[]> {
    const response = await fetch(`${API_BASE_URL}/books`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Book[]>(response);
  }

  async getBook(id: string): Promise<Book> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Book>(response);
  }

  async createBook(bookData: BookFormData): Promise<Book> {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(bookData),
    });
    return this.handleResponse<Book>(response);
  }

  async updateBook(id: string, bookData: BookFormData): Promise<Book> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(bookData),
    });
    return this.handleResponse<Book>(response);
  }

  async deleteBook(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        window.location.href = '/login';
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async getBookStats(): Promise<BookStats> {
    const response = await fetch(`${API_BASE_URL}/books/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<BookStats>(response);
  }
}

export default new BookService();