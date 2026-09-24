import { ApiResponse } from '@quality-services/types';
import { TEST_USERS } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api/v1';

export interface RequestOptions {
  params?: Record<string, string | number | boolean | string[] | undefined>;
  headers?: Record<string, string>;
  userId?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private getHeaders(options?: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    let userId = options?.userId;
    if (!userId) {
      try {
        const savedEmail = localStorage.getItem('qs_auth_active_user');
        const user = TEST_USERS.find((u) => u.email === savedEmail) || TEST_USERS[0];
        userId = user?.id;
      } catch {
        userId = TEST_USERS[0]?.id;
      }
    }

    if (userId) {
      headers['x-user-id'] = userId;
    }

    return headers;
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | string[] | undefined>,
  ): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          if (value.length > 0) {
            // Send as comma-separated or repeated params
            url.searchParams.set(key, value.join(','));
          }
        } else {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const fullUrl = this.buildUrl(path, options?.params);
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: this.getHeaders(options),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`API GET request failed (${response.status}): ${errText}`);
    }

    return response.json() as Promise<ApiResponse<T>>;
  }

  async post<T, B = unknown>(path: string, body: B, options?: RequestOptions): Promise<ApiResponse<T>> {
    const fullUrl = this.buildUrl(path, options?.params);
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: this.getHeaders(options),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`API POST request failed (${response.status}): ${errText}`);
    }

    return response.json() as Promise<ApiResponse<T>>;
  }

  async patch<T, B = unknown>(path: string, body: B, options?: RequestOptions): Promise<ApiResponse<T>> {
    const fullUrl = this.buildUrl(path, options?.params);
    const response = await fetch(fullUrl, {
      method: 'PATCH',
      headers: this.getHeaders(options),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`API PATCH request failed (${response.status}): ${errText}`);
    }

    return response.json() as Promise<ApiResponse<T>>;
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const fullUrl = this.buildUrl(path, options?.params);
    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: this.getHeaders(options),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`API DELETE request failed (${response.status}): ${errText}`);
    }

    return response.json() as Promise<ApiResponse<T>>;
  }
}

export const apiClient = new ApiClient();
