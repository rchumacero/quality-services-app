import { ApiResponse } from '@quality-services/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API GET request failed with status: ${response.status}`);
    }

    return response.json() as Promise<ApiResponse<T>>;
  }

  async post<T, B = unknown>(path: string, body: B): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API POST request failed with status: ${response.status}`);
    }

    return response.json() as Promise<ApiResponse<T>>;
  }
}

export const apiClient = new ApiClient();
