import axiosInstance from './axiosInstance';
import {
  generateExamAnalyticsData,
  MOCK_LEADERBOARD_OVERALL,
  getStoredExams,
} from './mockData';

const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true;
};

const delay = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyticsApi = {
  getExamAnalytics: async (examId) => {
    if (isMockEnabled()) {
      await delay(700);
      const data = generateExamAnalyticsData(examId);
      return data;
    }

    const response = await axiosInstance.get(`/api/analytics/exams/${examId}`);
    return response.data.data || response.data;
  },

  getLeaderboard: async ({ examId, type = 'overall' } = {}) => {
    if (isMockEnabled()) {
      await delay(600);

      if (type === 'exam' && examId) {
        // Filter or rank candidates specifically for this exam
        const analytics = generateExamAnalyticsData(examId);
        const ranks = analytics.allAttempts.slice(0, 10).map((att, idx) => ({
          rank: idx + 1,
          studentId: att.studentId,
          name: att.studentName,
          avatar: att.avatar,
          score: att.score,
          totalMarks: att.totalMarks,
          percentage: att.percentage,
          submittedAt: att.submittedAt,
          badge: idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : null,
          isCurrentUser: att.studentId === 'usr_stud_01',
        }));
        return ranks;
      }

      return MOCK_LEADERBOARD_OVERALL;
    }

    const response = await axiosInstance.get('/api/leaderboard', { params: { examId, type } });
    return response.data.data || response.data;
  },
};

export default analyticsApi;

