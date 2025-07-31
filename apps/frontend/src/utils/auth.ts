import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Create axios instance with default config
const authApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authApi.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration and refresh
authApi.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await authApi.post('/auth/refresh-token', {
            refreshToken,
          });

          const { token: newToken, refreshToken: newRefreshToken } =
            refreshResponse.data;
          localStorage.setItem('authToken', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return authApi(originalRequest);
        } catch (_refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (
            window.location.pathname !== '/login' &&
            window.location.pathname !== '/'
          ) {
            window.location.href = '/login';
          }
        }
      } else {
        // No refresh token, clear everything and redirect
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/'
        ) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Types for API responses
export interface User {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  refreshToken?: string;
  emailSent?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// Auth API functions
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await authApi.post('/auth/login', credentials);
    const { user, token, refreshToken } = response.data;

    // Store tokens in localStorage
    localStorage.setItem('authToken', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  // Register user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await authApi.post('/auth/register', credentials);
    const { user, token, refreshToken } = response.data;

    // Store tokens in localStorage
    localStorage.setItem('authToken', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  // Forgot password
  async forgotPassword(
    email: string
  ): Promise<{ message: string; emailSent?: boolean }> {
    const response = await authApi.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  async resetPassword(
    token: string,
    password: string
  ): Promise<{ message: string }> {
    const response = await authApi.post('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },

  // Verify email
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await authApi.post('/auth/verify-email', { token });
    return response.data;
  },

  // Resend verification email
  async resendVerificationEmail(): Promise<{
    message: string;
    emailSent?: boolean;
  }> {
    const response = await authApi.post('/auth/resend-verification');
    return response.data;
  },

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await authApi.post('/auth/refresh-token', {
      refreshToken,
    });
    const { token, refreshToken: newRefreshToken, user } = response.data;

    // Update stored tokens
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  // Get user profile
  async getProfile(): Promise<{ user: User }> {
    const response = await authApi.get('/auth/profile');
    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      // Call the backend logout endpoint with refresh token
      await authApi.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Even if the backend call fails, we still want to clear local storage
      console.warn(
        'Backend logout failed, but proceeding with local logout:',
        error
      );
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Logout user (local only - for backward compatibility)
  logoutLocal(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  },
};

// Error handler for auth requests
export const handleAuthError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const responseError = error as {
      response?: { data?: { message?: string }; status?: number };
    };
    if (responseError.response?.data?.message) {
      return responseError.response.data.message;
    }
    if (responseError.response?.status === 400) {
      return 'اطلاعات وارد شده نامعتبر است';
    }
    if (responseError.response?.status === 401) {
      return 'نام کاربری یا رمز عبور اشتباه است';
    }
    if (responseError.response?.status === 500) {
      return 'خطای داخلی سرور. لطفاً بعداً تلاش کنید';
    }
  }
  return 'خطای غیرمنتظره. لطفاً دوباره تلاش کنید';
};
