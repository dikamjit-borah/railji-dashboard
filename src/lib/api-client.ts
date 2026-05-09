import { getAuthHeader, isTokenExpired, clearSession } from './auth';

// Global event emitter for token expiration
let tokenExpiredCallback: (() => void) | null = null;

export function setTokenExpiredCallback(callback: () => void) {
  tokenExpiredCallback = callback;
}

function handleTokenExpired() {
  clearSession();
  if (tokenExpiredCallback) {
    tokenExpiredCallback();
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
  error?: string;
  timestamp?: string;
  path?: string;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

/**
 * Extract the most appropriate error message from an API response
 */
export function getErrorMessage(result: ApiResponse): string {
  if (result.message) return result.message;
  if (result.error) return result.error;
  if (result.statusCode) return `HTTP ${result.statusCode} Error`;
  return 'An unknown error occurred';
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

    // Check if token is expired before making the request
    if (requireAuth && isTokenExpired()) {
      handleTokenExpired();
      return {
        success: false,
        message: 'Session expired. Please log in again.',
        statusCode: 401,
      };
    }

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
      
      // Handle 401 Unauthorized - token expired
      if (response.status === 401 && requireAuth) {
        handleTokenExpired();
        return {
          success: false,
          message: 'Session expired. Please log in again.',
          statusCode: 401,
        };
      }
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // Handle different response types
    let responseData: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // If response is OK, return the actual API response (don't wrap it)
    if (response.ok) {
      // If the API already returns a standardized format, pass it through
      if (responseData && typeof responseData === 'object' && 'success' in responseData) {
        return responseData;
      }
      // Otherwise, wrap it in our standard format
      return {
        success: true,
        data: responseData,
        statusCode: response.status,
      };
    } else {
      // For errors, check if API already returns standardized error format
      if (responseData && typeof responseData === 'object' && 'success' in responseData) {
        // API already returns standardized format, pass it through
        return responseData;
      }
      // Otherwise, create standardized error format
      const errorMessage = responseData?.message || responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
      return {
        success: false,
        message: errorMessage,
        statusCode: response.status,
        data: responseData,
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