import axiosInstance from './axiosInstance';
import { getStoredQuestions, saveStoredQuestions } from './mockData';

const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true;
};

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const questionApi = {
  getAll: async (params = {}) => {
    if (isMockEnabled()) {
      await delay(500);
      let questions = [...getStoredQuestions()];

      const {
        search = '',
        topic = 'ALL',
        difficulty = 'ALL',
        type = 'ALL',
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = params;

      // Filtering
      if (search) {
        const query = search.toLowerCase();
        questions = questions.filter(
          (q) =>
            q.text.toLowerCase().includes(query) ||
            q.topic.toLowerCase().includes(query)
        );
      }

      if (topic && topic !== 'ALL') {
        questions = questions.filter((q) => q.topic.toLowerCase() === topic.toLowerCase());
      }

      if (difficulty && difficulty !== 'ALL') {
        questions = questions.filter((q) => q.difficulty.toUpperCase() === difficulty.toUpperCase());
      }

      if (type && type !== 'ALL') {
        questions = questions.filter((q) => q.type.toUpperCase() === type.toUpperCase());
      }

      // Sorting
      questions.sort((a, b) => {
        let valA = a[sortBy] ?? '';
        let valB = b[sortBy] ?? '';
        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });

      // Pagination
      const total = questions.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginatedData = questions.slice(startIndex, startIndex + limit);

      return {
        data: paginatedData,
        total,
        page,
        limit,
        totalPages,
      };
    }

    const response = await axiosInstance.get('/api/questions', { params });
    const payload = response.data.data || response.data;
    if (payload && Array.isArray(payload.content)) {
      return {
        data: payload.content,
        total: payload.totalElements ?? payload.total ?? payload.content.length,
        totalPages: payload.totalPages ?? 1,
        page: (payload.number != null ? payload.number + 1 : params.page) || 1,
        limit: payload.size ?? params.limit ?? 10,
      };
    }
    if (payload && Array.isArray(payload.data)) {
      return {
        data: payload.data,
        total: payload.total ?? payload.data.length,
        totalPages: payload.totalPages ?? 1,
        page: payload.page ?? params.page ?? 1,
        limit: payload.limit ?? params.limit ?? 10,
      };
    }
    if (Array.isArray(payload)) {
      return {
        data: payload,
        total: payload.length,
        totalPages: 1,
        page: 1,
        limit: payload.length,
      };
    }
    return payload;
  },

  getById: async (id) => {
    if (isMockEnabled()) {
      await delay(400);
      const questions = getStoredQuestions();
      const question = questions.find((q) => q.id === id);
      if (!question) throw new Error('Question not found');
      return question;
    }

    const response = await axiosInstance.get(`/api/questions/${id}`);
    return response.data.data || response.data;
  },

  create: async (questionData) => {
    if (isMockEnabled()) {
      await delay(500);
      const questions = getStoredQuestions();
      const newQuestion = {
        ...questionData,
        id: `q_${Date.now()}`,
        marks: Number(questionData.marks) || 2,
        createdAt: new Date().toISOString(),
      };
      questions.unshift(newQuestion);
      saveStoredQuestions(questions);
      return newQuestion;
    }

    const response = await axiosInstance.post('/api/questions', questionData);
    return response.data.data || response.data;
  },

  update: async (id, questionData) => {
    if (isMockEnabled()) {
      await delay(500);
      const questions = getStoredQuestions();
      const index = questions.findIndex((q) => q.id === id);
      if (index === -1) throw new Error('Question not found');

      const updated = {
        ...questions[index],
        ...questionData,
        marks: Number(questionData.marks) || questions[index].marks,
        updatedAt: new Date().toISOString(),
      };
      questions[index] = updated;
      saveStoredQuestions(questions);
      return updated;
    }

    const response = await axiosInstance.put(`/api/questions/${id}`, questionData);
    return response.data.data || response.data;
  },

  delete: async (id) => {
    if (isMockEnabled()) {
      await delay(400);
      let questions = getStoredQuestions();
      questions = questions.filter((q) => q.id !== id);
      saveStoredQuestions(questions);
      return { success: true, message: 'Question deleted successfully' };
    }

    const response = await axiosInstance.delete(`/api/questions/${id}`);
    return response.data.data || response.data;
  },
};

export default questionApi;
