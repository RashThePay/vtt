import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Create axios instance with default config
const authApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is expired or invalid, clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login page if we're not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
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
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
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
    const { user, token } = response.data;
    
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // Register user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await authApi.post('/auth/register', credentials);
    const { user, token } = response.data;
    
    // Store token in localStorage
    localStorage.setItem('authToken', token);
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
      // Call the backend logout endpoint (optional, for consistency)
      await authApi.post('/auth/logout');
    } catch (error) {
      // Even if the backend call fails, we still want to clear local storage
      console.warn('Backend logout failed, but proceeding with local logout:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  // Logout user (local only - for backward compatibility)
  logoutLocal(): void {
    localStorage.removeItem('authToken');
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
  }
};

// Error handler for auth requests
export const handleAuthError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.status === 400) {
    return 'اطلاعات وارد شده نامعتبر است';
  }
  if (error.response?.status === 401) {
    return 'نام کاربری یا رمز عبور اشتباه است';
  }
  if (error.response?.status === 500) {
    return 'خطای داخلی سرور. لطفاً بعداً تلاش کنید';
  }
  return 'خطای غیرمنتظره. لطفاً دوباره تلاش کنید';
};