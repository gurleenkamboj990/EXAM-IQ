import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';
import { API_ENDPOINTS } from '../utils/constants.js';

const baseURL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:8080';

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      if (config.headers?.set) {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        config.headers = { Authorization: `Bearer ${token}` };
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 Single-Attempt Refresh & Auto Logout
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const handleAuthFailure = (err) => {
  useAuthStore.getState().logout();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
  return Promise.reject(err);
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Extract backend error message and attach to error.message for toasts
    const backendMessage =
      (Array.isArray(error.response?.data?.fieldErrors) && error.response.data.fieldErrors.length > 0
        ? error.response.data.fieldErrors.map((fe) => fe.message).filter(Boolean).join(', ')
        : null) ||
      error.response?.data?.message ||
      (typeof error.response?.data === 'string' && error.response.data.trim() ? error.response.data : null) ||
      error.response?.data?.error;

    if (backendMessage && typeof backendMessage === 'string') {
      error.message = backendMessage;
    }

    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Do not attempt refresh on auth endpoints themselves
    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint =
      requestUrl.includes(API_ENDPOINTS.LOGIN) ||
      requestUrl.includes(API_ENDPOINTS.REFRESH) ||
      requestUrl.includes(API_ENDPOINTS.REGISTER) ||
      requestUrl.includes(API_ENDPOINTS.FORGOT_PASSWORD);

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers?.set) {
              originalRequest.headers.set('Authorization', `Bearer ${token}`);
            } else if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            } else {
              originalRequest.headers = { Authorization: `Bearer ${token}` };
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = useAuthStore.getState().refreshToken;

      if (!currentRefreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        return handleAuthFailure(error);
      }

      try {
        const response = await axios.post(
          `${baseURL}${API_ENDPOINTS.REFRESH}`,
          { refreshToken: currentRefreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const resData = response.data?.data || response.data || {};
        const newAccessToken = resData.accessToken;
        const newRefreshToken = resData.refreshToken;

        if (!newAccessToken) {
          throw new Error('Refresh response missing access token');
        }

        if (resData.user) {
          useAuthStore.getState().updateUser(resData.user);
        }
        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken || currentRefreshToken);
        processQueue(null, newAccessToken);

        if (originalRequest.headers?.set) {
          originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        } else if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        } else {
          originalRequest.headers = { Authorization: `Bearer ${newAccessToken}` };
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        const refreshBackendMessage =
          refreshError.response?.data?.message ||
          refreshError.response?.data?.error ||
          refreshError.message;
        if (refreshBackendMessage && typeof refreshBackendMessage === 'string') {
          refreshError.message = refreshBackendMessage;
        }
        processQueue(refreshError, null);
        return handleAuthFailure(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && originalRequest._retry && !isAuthEndpoint) {
      return handleAuthFailure(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
