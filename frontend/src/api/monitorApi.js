import axiosInstance from './axiosInstance';
import {
  MOCK_LIVE_CANDIDATES,
  MOCK_PENDING_REVIEWS,
  getStoredResults,
  saveStoredResults,
} from './mockData';

const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true;
};

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory / persistent review cache
const getStoredReviews = () => {
  if (typeof window === 'undefined') return MOCK_PENDING_REVIEWS;
  try {
    const raw = localStorage.getItem('examiq_subjective_reviews_v3');
    if (!raw) {
      localStorage.setItem('examiq_subjective_reviews_v3', JSON.stringify(MOCK_PENDING_REVIEWS));
      return MOCK_PENDING_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return MOCK_PENDING_REVIEWS;
  }
};

const saveStoredReviews = (revs) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('examiq_subjective_reviews_v3', JSON.stringify(revs));
  } catch (err) {
    console.error('Failed to save reviews:', err);
  }
};

export const monitorApi = {
  getLiveCandidates: async (examId) => {
    if (isMockEnabled()) {
      await delay(500);
      return MOCK_LIVE_CANDIDATES;
    }

    const response = await axiosInstance.get(`/api/monitor/exams/${examId}/candidates`);
    return response.data.data || response.data;
  },

  getSubjectiveReviews: async (examId) => {
    if (isMockEnabled()) {
      await delay(600);
      let reviews = getStoredReviews();
      if (examId) {
        reviews = reviews.filter((r) => r.examId === examId);
      }
      return reviews;
    }

    const response = await axiosInstance.get(`/api/exams/${examId}/reviews`);
    return response.data.data || response.data;
  },

  saveSubjectiveReview: async (reviewId, { teacherScore, teacherComment }) => {
    if (isMockEnabled()) {
      await delay(500);
      const reviews = getStoredReviews();
      const idx = reviews.findIndex((r) => r.reviewId === reviewId);
      if (idx === -1) throw new Error('Review record not found');

      reviews[idx] = {
        ...reviews[idx],
        teacherScore: Number(teacherScore),
        teacherComment,
        status: 'GRADED',
        reviewedAt: new Date().toISOString(),
      };
      saveStoredReviews(reviews);

      // Also update student's saved result in storage
      const results = getStoredResults();
      const studentResultIdx = results.findIndex(
        (res) => res.studentId === reviews[idx].studentId && res.examId === reviews[idx].examId
      );

      if (studentResultIdx !== -1) {
        const studentResult = results[studentResultIdx];
        const newScore = studentResult.score + Number(teacherScore);
        const newPct = Number(((newScore / studentResult.totalMarks) * 100).toFixed(1));

        studentResult.score = newScore;
        studentResult.percentage = newPct;
        studentResult.passed = newPct >= 60;
        if (studentResult.summary && studentResult.summary.pendingCount > 0) {
          studentResult.summary.pendingCount -= 1;
        }

        saveStoredResults(results);
      }

      return reviews[idx];
    }

    const response = await axiosInstance.put(`/api/reviews/${reviewId}`, {
      teacherScore,
      teacherComment,
    });
    return response.data.data || response.data;
  },
};

export default monitorApi;

