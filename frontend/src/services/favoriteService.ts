import type { Book } from '../types/book';
import type { Favorite } from '../types/favorite';
import authService from './authService';

const API_BASE_URL = 'https://book-app-api.wittydesert-f0d21091.centralus.azurecontainerapps.io/api';

class FavoriteService {
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

  async getFavorites(): Promise<Favorite[]> {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Favorite[]>(response);
  }

  async addFavorite(bookId: string, notes?: string): Promise<Favorite> {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ bookId, notes }),
    });
    return this.handleResponse<Favorite>(response);
  }

  async removeFavorite(bookId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/favorites/${bookId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async updateFavoriteNotes(bookId: string, notes: string): Promise<Favorite> {
    const response = await fetch(`${API_BASE_URL}/favorites/${bookId}/notes`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ notes }),
    });
    return this.handleResponse<Favorite>(response);
  }

  async getPopularFavorites(limit: number = 10): Promise<Book[]> {
    const response = await fetch(`${API_BASE_URL}/favorites/popular?limit=${limit}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Book[]>(response);
  }

  async getUsersWhoFavorited(bookId: string): Promise<Array<{ id: string; name: string; email: string }>> {
    const response = await fetch(`${API_BASE_URL}/favorites/book/${bookId}/users`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Array<{ id: string; name: string; email: string }>>(response);
  }
}

export default new FavoriteService();