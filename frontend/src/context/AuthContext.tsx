/// <reference types="vite/client" />
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { User, AuthResponse, LoginForm, SignUpForm } from '../types/index';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (credentials: LoginForm) => Promise<AuthResponse>;
  signUp: (data: SignUpForm) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (old: string, newPassword: string) => Promise<void>;
  refreshToken: () => Promise<boolean>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create API instance
export const createAPIClient = (): AxiosInstance => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 30000, // 30s — Render free tier cold-start can take up to 30s
    withCredentials: true,
  });

  // Request interceptor - attach token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor - handle token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && originalRequest) {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          try {
            const response = await axios.post(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
              { refreshToken }
            );

            const { token, refreshToken: newRefreshToken } = response.data.data;
            localStorage.setItem('accessToken', token);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh failed - logout user
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};

const API = createAPIClient();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch {
            // Invalid stored user, try fetching from API
            if (token) {
              const response = await API.get('/auth/me');
              setUser(response.data.data);
              localStorage.setItem('user', JSON.stringify(response.data.data));
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signIn = useCallback(async (credentials: LoginForm): Promise<AuthResponse> => {
    try {
      clearError();
      
      const response = await API.post<any>('/auth/login', credentials);
      const { token, refreshToken: newRefreshToken, user: responseUser } = response.data.data || response.data;

      if (!token || !responseUser) {
        throw new Error('Invalid response from server. Please try again.');
      }

      localStorage.setItem('accessToken', token);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      localStorage.setItem('user', JSON.stringify(responseUser));

      setUser(responseUser);
      return response.data.data || response.data;
    } catch (err: any) {
      // Surface the real server error message
      const errorMessage =
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED' ? 'Server is waking up, please try again in 30 seconds.' : null) ||
        (err.message === 'Network Error' ? 'Cannot reach server. Check your internet or the backend may be down.' : null) ||
        err.message ||
        'Sign in failed. Please try again.';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const signUp = useCallback(async (data: SignUpForm): Promise<AuthResponse> => {
    try {
      clearError();
      const { confirmPassword, ...signUpData } = data;

      if (data.password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await API.post<any>('/auth/register', signUpData);
      const { token, refreshToken: newRefreshToken, user: responseUser } = response.data.data || response.data;

      localStorage.setItem('accessToken', token);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      localStorage.setItem('user', JSON.stringify(responseUser));

      setUser(responseUser);
      return response.data.data || response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Sign up failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      clearError();
      const response = await API.patch('/auth/profile', data);
      const updatedUser = response.data.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Update failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    try {
      clearError();
      await API.post('/auth/change-password', { oldPassword, newPassword, confirmPassword: newPassword });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Change password failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const refreshTokenFn = useCallback(async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('refreshToken');
      if (!token) return false;

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
        { refreshToken: token }
      );

      const { token: newToken, refreshToken: newRefreshToken } = response.data.data;
      localStorage.setItem('accessToken', newToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      return true;
    } catch (err) {
      logout();
      return false;
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || false,
    signIn,
    signUp,
    logout,
    updateProfile,
    changePassword,
    refreshToken: refreshTokenFn,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { API };
