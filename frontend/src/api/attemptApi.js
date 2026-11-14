import axiosInstance from './axiosInstance';
import {
  getStoredExams,
  getStoredQuestions,
  getStoredResults,
  saveStoredResults,
} from './mockData';

const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true;
};

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const attemptApi = {
  startAttempt: async (examId, student) => {
    if (isMockEnabled()) {
      await delay(500);
      const exams = getStoredExams();
      const exam = exams.find((e) => e.id === examId);
      if (!exam) throw new Error('Exam not found');

      const allQuestions = getStoredQuestions();
      let questions = (exam.questionIds || [])
        .map((qid) => allQuestions.find((q) => q.id === qid))
        .filter(Boolean);

      if (exam.shuffleQuestions) {
        questions = [...questions].sort(() => Math.random() - 0.5);
      }

      const attemptId = `att_${Date.now()}`;

      return {
        attemptId,
        exam,
        questions,
      };
    }

    const response = await axiosInstance.post(`/api/exams/${examId}/attempt`, { student });
    const payload = response.data.data || response.data;
    if (payload && payload.id && !payload.attemptId) {
      payload.attemptId = payload.id;
    }
    return payload;
  },

  submitAttempt: async (attemptData) => {
    const { attemptId, examId, studentId, studentName, answers = {}, timeSpentSeconds = 0 } = attemptData;

    if (isMockEnabled()) {
      await delay(600);
      const exams = getStoredExams();
      const exam = exams.find((e) => e.id === examId);
      if (!exam) throw new Error('Exam not found for scoring');

      const allQuestions = getStoredQuestions();
      const questions = (exam.questionIds || [])
        .map((qid) => allQuestions.find((q) => q.id === qid))
        .filter(Boolean);

      let totalExamMarks = 0;
      let totalEarnedScore = 0;
      let correctCount = 0;
      let incorrectCount = 0;
      let skippedCount = 0;
      let pendingCount = 0;

      const detailedAnswers = questions.map((q) => {
        totalExamMarks += q.marks || 0;
        const studentAns = answers[q.id];
        const isSkipped = studentAns === undefined || studentAns === null || studentAns === '';

        if (isSkipped) {
          skippedCount++;
          return {
            questionId: q.id,
            questionText: q.text,
            type: q.type,
            marks: q.marks,
            studentAnswer: null,
            correctAnswer: q.type === 'MCQ' ? q.correctAnswer : q.modelAnswer,
            options: q.options,
            isCorrect: false,
            isSkipped: true,
            marksAwarded: 0,
            feedback: 'Question was left unattempted.',
          };
        }

        if (q.type === 'MCQ') {
          const isCorrect = Number(studentAns) === Number(q.correctAnswer);
          let marksAwarded = 0;

          if (isCorrect) {
            correctCount++;
            marksAwarded = q.marks || 0;
          } else {
            incorrectCount++;
            const penalty = exam.negativeMarking ? Number(exam.negativeMarkValue) || 0 : 0;
            marksAwarded = -penalty;
          }

          totalEarnedScore += marksAwarded;

          return {
            questionId: q.id,
            questionText: q.text,
            type: q.type,
            marks: q.marks,
            studentAnswer: Number(studentAns),
            correctAnswer: q.correctAnswer,
            options: q.options,
            isCorrect,
            isSkipped: false,
            marksAwarded,
            feedback: isCorrect
              ? 'Correct answer!'
              : `Incorrect. Correct option: "${q.options?.[q.correctAnswer]}"`,
          };
        }

        // Short Answer Questions (Auto-pending evaluation)
        pendingCount++;
        return {
          questionId: q.id,
          questionText: q.text,
          type: q.type,
          marks: q.marks,
          studentAnswer: String(studentAns),
          correctAnswer: q.modelAnswer,
          isCorrect: null,
          isSkipped: false,
          marksAwarded: 0,
          feedback: 'Submitted. Pending instructor evaluation.',
        };
      });

      // Clamp score to non-negative
      const finalScore = Math.max(0, totalEarnedScore);
      const percentage = totalExamMarks > 0 ? Number(((finalScore / totalExamMarks) * 100).toFixed(1)) : 0;
      const passed = percentage >= (exam.passingPercentage || 50);

      const result = {
        attemptId: attemptId || `att_${Date.now()}`,
        examId: exam.id,
        examTitle: exam.title,
        subject: exam.subject,
        studentId: studentId || 'usr_stud_01',
        studentName: studentName || 'Alex Morgan',
        score: finalScore,
        totalMarks: totalExamMarks,
        percentage,
        passed,
        submittedAt: new Date().toISOString(),
        timeSpentSeconds,
        summary: {
          totalQuestions: questions.length,
          correctCount,
          incorrectCount,
          skippedCount,
          pendingCount,
        },
        answers: detailedAnswers,
      };

      const existingResults = getStoredResults();
      // Remove any prior attempt for this exact attemptId if re-saving
      const filtered = existingResults.filter((r) => r.attemptId !== result.attemptId);
      filtered.unshift(result);
      saveStoredResults(filtered);

      return result;
    }

    const response = await axiosInstance.post(`/api/exams/${examId}/attempt/${attemptId}/submit`, attemptData);
    const payload = response.data.data || response.data;
    if (payload && payload.id && !payload.attemptId) {
      payload.attemptId = payload.id;
    }
    return payload;
  },
};

export default attemptApi;
