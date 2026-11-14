import axiosInstance from './axiosInstance';
import { API_ENDPOINTS, ROLES } from '../utils/constants';
import { MOCK_USERS, MOCK_PASSWORDS } from './mockData';

const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true;
};

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  login: async (credentials) => {
    if (isMockEnabled()) {
      await delay(600);
      const email = credentials.email?.trim().toLowerCase();
      const password = credentials.password;

      const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email);

      if (!user) {
        throw new Error('User not found. Try one of the demo accounts.');
      }

      const expectedPassword = MOCK_PASSWORDS[user.email] || 'Demo@123';
      if (password !== expectedPassword) {
        throw new Error('Invalid credentials. Password is case sensitive.');
      }

      const timestamp = Date.now();
      const mockAccessToken = `mock-access-token-${user.role.toLowerCase()}-${timestamp}`;
      const mockRefreshToken = `mock-refresh-token-${user.role.toLowerCase()}-${timestamp}`;

      return {
        user,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      };
    }

    const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, credentials);
    return response.data.data || response.data;
  },

  register: async (registrationData) => {
    if (isMockEnabled()) {
      await delay(600);
      const email = registrationData.email?.trim().toLowerCase();

      const existingUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email);
      if (existingUser) {
        throw new Error('An account with this email address already exists.');
      }

      const newUser = {
        id: `usr_new_${Date.now()}`,
        name: registrationData.name,
        email: registrationData.email,
        role: registrationData.role || ROLES.STUDENT,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        title: registrationData.role === ROLES.TEACHER ? 'Faculty Instructor' : 'Registered Student',
        department: 'Academic Division',
      };

      return {
        success: true,
        message: 'Account created successfully. You can now log in.',
        user: newUser,
      };
    }

    const response = await axiosInstance.post(API_ENDPOINTS.REGISTER, registrationData);
    return response.data.data || response.data;
  },

  refreshToken: async (refreshToken) => {
    if (isMockEnabled()) {
      await delay(400);
      return {
        accessToken: `mock-access-token-refreshed-${Date.now()}`,
        refreshToken: `mock-refresh-token-refreshed-${Date.now()}`,
      };
    }

    const response = await axiosInstance.post(API_ENDPOINTS.REFRESH, { refreshToken });
    return response.data.data || response.data;
  },

  forgotPassword: async (data) => {
    if (isMockEnabled()) {
      await delay(600);
      return {
        success: true,
        message: `Password reset instructions have been dispatched to ${data.email}.`,
      };
    }

    const response = await axiosInstance.post(API_ENDPOINTS.FORGOT_PASSWORD, data);
    return response.data.data || response.data;
  },

  logout: async () => {
    if (isMockEnabled()) {
      await delay(200);
      return { success: true };
    }
    try {
      const response = await axiosInstance.post('/api/auth/logout');
      return response.data;
    } catch {
      return { success: true };
    }
  },
};

export default authApi;

