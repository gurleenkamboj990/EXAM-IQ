import axiosInstance from './axiosInstance';
import { getStoredResults } from './mockData';

const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true;
};

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const resultApi = {
  getAll: async (params = {}) => {
    if (isMockEnabled()) {
      await delay(400);
      let results = getStoredResults();
      const { studentId, search } = params;

      if (studentId) {
        results = results.filter((r) => r.studentId === studentId);
      }

      if (search) {
        const query = search.toLowerCase();
        results = results.filter(
          (r) =>
            r.examTitle.toLowerCase().includes(query) ||
            r.subject?.toLowerCase().includes(query)
        );
      }

      return results;
    }

    const response = await axiosInstance.get('/api/results', { params });
    return response.data.data || response.data;
  },

  getById: async (attemptId) => {
    if (isMockEnabled()) {
      await delay(400);
      const results = getStoredResults();
      const result = results.find((r) => r.attemptId === attemptId);
      if (!result) throw new Error('Result record not found');
      return result;
    }

    const response = await axiosInstance.get(`/api/results/${attemptId}`);
    return response.data.data || response.data;
  },
};

export default resultApi;
