import axiosInstance from './axiosInstance';
import {
  getStoredExams,
  saveStoredExams,
  getStoredQuestions,
  getExamStatus,
} from './mockData';

const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true;
};

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const examApi = {
  getAll: async (params = {}) => {
    if (isMockEnabled()) {
      await delay(500);
      let exams = getStoredExams();
      const allQuestions = getStoredQuestions();

      // Enrich with status and dynamic question metrics
      exams = exams.map((exam) => {
        const status = getExamStatus(exam);
        const examQuestions = allQuestions.filter((q) => exam.questionIds?.includes(q.id));
        const totalMarks = examQuestions.reduce((acc, q) => acc + (q.marks || 0), 0) || exam.totalMarks || 0;
        return {
          ...exam,
          status,
          questionCount: exam.questionIds?.length || 0,
          totalMarks,
        };
      });

      const { search, subject, status } = params;

      if (search) {
        const query = search.toLowerCase();
        exams = exams.filter(
          (e) =>
            e.title.toLowerCase().includes(query) ||
            e.subject.toLowerCase().includes(query)
        );
      }

      if (subject && subject !== 'ALL') {
        exams = exams.filter((e) => e.subject.toLowerCase() === subject.toLowerCase());
      }

      if (status && status !== 'ALL') {
        exams = exams.filter((e) => e.status.toUpperCase() === status.toUpperCase());
      }

      return exams;
    }

    const response = await axiosInstance.get('/api/exams', { params });
    return response.data.data || response.data;
  },

  getById: async (id, includeQuestions = true) => {
    if (isMockEnabled()) {
      await delay(400);
      const exams = getStoredExams();
      const exam = exams.find((e) => e.id === id);
      if (!exam) throw new Error('Examination not found');

      const allQuestions = getStoredQuestions();
      const questions = (exam.questionIds || [])
        .map((qid) => allQuestions.find((q) => q.id === qid))
        .filter(Boolean);

      const status = getExamStatus(exam);
      const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0) || exam.totalMarks || 0;

      return {
        ...exam,
        status,
        totalMarks,
        questionCount: questions.length,
        questions: includeQuestions ? questions : undefined,
      };
    }

    const response = await axiosInstance.get(`/api/exams/${id}`);
    return response.data.data || response.data;
  },

  create: async (examData) => {
    if (isMockEnabled()) {
      await delay(500);
      const exams = getStoredExams();
      const allQuestions = getStoredQuestions();

      const selectedQuestions = allQuestions.filter((q) => examData.questionIds?.includes(q.id));
      const totalMarks = selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0) || 0;

      const newExam = {
        ...examData,
        id: `exam_${Date.now()}`,
        totalMarks,
        createdAt: new Date().toISOString(),
      };

      exams.unshift(newExam);
      saveStoredExams(exams);
      return newExam;
    }

    const response = await axiosInstance.post('/api/exams', examData);
    return response.data.data || response.data;
  },

  update: async (id, examData) => {
    if (isMockEnabled()) {
      await delay(500);
      const exams = getStoredExams();
      const index = exams.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Examination not found');

      const allQuestions = getStoredQuestions();
      const selectedQuestions = allQuestions.filter((q) =>
        (examData.questionIds || exams[index].questionIds)?.includes(q.id)
      );
      const totalMarks = selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0) || exams[index].totalMarks;

      const updated = {
        ...exams[index],
        ...examData,
        totalMarks,
        updatedAt: new Date().toISOString(),
      };

      exams[index] = updated;
      saveStoredExams(exams);
      return updated;
    }

    const response = await axiosInstance.put(`/api/exams/${id}`, examData);
    return response.data.data || response.data;
  },

  delete: async (id) => {
    if (isMockEnabled()) {
      await delay(400);
      let exams = getStoredExams();
      exams = exams.filter((e) => e.id !== id);
      saveStoredExams(exams);
      return { success: true, message: 'Exam deleted successfully' };
    }

    const response = await axiosInstance.delete(`/api/exams/${id}`);
    return response.data.data || response.data;
  },

  duplicate: async (id) => {
    if (isMockEnabled()) {
      await delay(400);
      const exams = getStoredExams();
      const target = exams.find((e) => e.id === id);
      if (!target) throw new Error('Source exam not found to duplicate');

      const now = new Date();
      const duplicated = {
        ...target,
        id: `exam_${Date.now()}`,
        title: `Copy of ${target.title}`,
        startTime: new Date(now.getTime() + 24 * 3600 * 1000).toISOString(),
        endTime: new Date(now.getTime() + 26 * 3600 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      exams.unshift(duplicated);
      saveStoredExams(exams);
      return duplicated;
    }

    const response = await axiosInstance.post(`/api/exams/${id}/duplicate`);
    return response.data.data || response.data;
  },
};

export default examApi;
