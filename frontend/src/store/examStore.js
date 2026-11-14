import { create } from 'zustand';

const getStorageKey = (examId, attemptId) => `examiq_attempt_${examId}_${attemptId}`;

export const useExamStore = create((set, get) => ({
  exam: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  reviewMarked: {},
  attemptId: null,
  isStarted: false,
  isSubmitting: false,
  isSaved: true,

  initAttempt: (exam, questions, attemptId) => {
    const storageKey = getStorageKey(exam.id, attemptId);
    let restoredAnswers = {};
    let restoredReview = {};

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        restoredAnswers = parsed.answers || {};
        restoredReview = parsed.reviewMarked || {};
      }
    } catch (e) {
      console.error('Error loading stored answers:', e);
    }

    set({
      exam,
      questions,
      attemptId,
      currentQuestionIndex: 0,
      answers: restoredAnswers,
      reviewMarked: restoredReview,
      isStarted: false,
      isSubmitting: false,
      isSaved: true,
    });
  },

  startExam: () => {
    set({ isStarted: true });
  },

  setAnswer: (questionId, value) => {
    const { exam, attemptId, answers } = get();
    const updated = { ...answers, [questionId]: value };

    set({ answers: updated, isSaved: false });

    // Autosave to localStorage
    if (exam && attemptId) {
      try {
        const storageKey = getStorageKey(exam.id, attemptId);
        const data = {
          answers: updated,
          reviewMarked: get().reviewMarked,
          savedAt: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
        set({ isSaved: true });
      } catch (err) {
        console.error('Autosave failed:', err);
      }
    }
  },

  clearAnswer: (questionId) => {
    const { exam, attemptId, answers } = get();
    const updated = { ...answers };
    delete updated[questionId];

    set({ answers: updated, isSaved: false });

    if (exam && attemptId) {
      try {
        const storageKey = getStorageKey(exam.id, attemptId);
        const data = {
          answers: updated,
          reviewMarked: get().reviewMarked,
          savedAt: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
        set({ isSaved: true });
      } catch (err) {
        console.error('Autosave failed:', err);
      }
    }
  },

  toggleReview: (questionId) => {
    const { exam, attemptId, reviewMarked } = get();
    const updated = { ...reviewMarked, [questionId]: !reviewMarked[questionId] };

    set({ reviewMarked: updated });

    if (exam && attemptId) {
      try {
        const storageKey = getStorageKey(exam.id, attemptId);
        const data = {
          answers: get().answers,
          reviewMarked: updated,
          savedAt: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (err) {
        console.error('Autosave failed:', err);
      }
    }
  },

  goToQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  setIsSubmitting: (isSubmitting) => {
    set({ isSubmitting });
  },

  resetAttempt: () => {
    const { exam, attemptId } = get();
    if (exam && attemptId) {
      localStorage.removeItem(getStorageKey(exam.id, attemptId));
    }
    set({
      exam: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      reviewMarked: {},
      attemptId: null,
      isStarted: false,
      isSubmitting: false,
      isSaved: true,
    });
  },
}));

export default useExamStore;
