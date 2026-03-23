import { getAuthHeader } from './auth';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

/**
 * Centralized API client for making HTTP requests with automatic authentication
 * and standardized error handling.
 * 
 * @example
 * // GET request
 * const result = await apiClient.get('/api/users');
 * 
 * // POST request with body
 * const result = await apiClient.post('/api/users', { name: 'John', email: 'john@example.com' });
 * 
 * // Request without authentication
 * const result = await apiClient.post('/api/login', { email, password }, { requireAuth: false });
 */
class ApiClient {
  private baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  /**
   * Make an HTTP request with automatic authentication and error handling
   * 
   * @param url - The URL to request
   * @param options - Request options including method, body, headers, and auth requirements
   * @returns Promise resolving to standardized API response
   */
  async request<T = any>(
    url: string, 
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      requireAuth = true,
    } = options;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      ...this.baseHeaders,
      ...headers,
    };

    // Add authorization header if required
    if (requireAuth) {
      const authHeader = getAuthHeader();
      if (authHeader) {
        requestHeaders['Authorization'] = authHeader;
      }
    }

    // Prepare request config
    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestConfig.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestConfig);
      
      // Handle different response types
      let responseData: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Return standardized response
      if (response.ok) {
        return {
          success: true,
          data: responseData,
          statusCode: response.status,
        };
      } else {
        return {
          success: false,
          message: responseData?.message || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        };
      }
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Convenience methods
  async get<T = any>(url: string, options: Omit<ApiRequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = any>(url: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  async put<T = any>(url: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  async patch<T = any>(url: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PATCH', body });
  }

  async delete<T = any>(url: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE', body });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();