import axiosInstance from './axiosInstance';

const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true;
};

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

// Template bank for intelligent contextual question synthesis
const TOPIC_TEMPLATES = {
  java: [
    { text: 'Which Java memory area is allocated per-thread and stores local primitive variables and method call stack frames?', options: ['Stack Memory', 'Heap Memory', 'Metaspace', 'Code Cache'], correct: 0, diff: 'MEDIUM', marks: 3 },
    { text: 'What is the contract between equals() and hashCode() methods in Java?', options: ['If equals() is true, hashCode() must return the same integer', 'If hashCode() is equal, equals() must be true', 'They have no strict relation', 'hashCode() is only called in TreeSets'], correct: 0, diff: 'MEDIUM', marks: 3 },
    { text: 'Which feature introduced in Java 8 enables functional-style operations on streams of elements?', options: ['Stream API & Lambdas', 'Project Loom', 'Virtual Threads', 'Sealed Classes'], correct: 0, diff: 'EASY', marks: 2 },
    { text: 'Explain the difference between fail-fast and fail-safe iterators in Java Collections.', type: 'SHORT_ANSWER', model: 'Fail-fast iterators throw ConcurrentModificationException if the collection is structurally modified during iteration. Fail-safe iterators operate on a clone or snapshot (e.g. CopyOnWriteArrayList) and never throw this exception.', diff: 'HARD', marks: 5 },
  ],
  dbms: [
    { text: 'Which isolation level prevents Dirty Reads and Non-Repeatable Reads, but may permit Phantom Reads in ANSI SQL?', options: ['Repeatable Read', 'Read Committed', 'Read Uncommitted', 'Serializable'], correct: 0, diff: 'HARD', marks: 4 },
    { text: 'In database normalization, what dependency does Boyce-Codd Normal Form (BCNF) eliminate that 3NF may retain?', options: ['Functional dependency where determinant is not a superkey', 'Multivalued dependency', 'Transitive dependency of non-prime attributes', 'Partial dependency on composite keys'], correct: 0, diff: 'HARD', marks: 4 },
    { text: 'What is the primary trade-off when adding a B-Tree secondary index to a heavily updated table?', options: ['Speeds up SELECT queries but slows down INSERT, UPDATE, and DELETE operations', 'Reduces disk space but increases CPU load', 'Eliminates deadlocks but causes table locks', 'Forces all joins to use nested loops'], correct: 0, diff: 'MEDIUM', marks: 3 },
  ],
  math: [
    { text: 'What is the value of the integral of e^(2x) dx from x = 0 to x = 1?', options: ['(e^2 - 1) / 2', 'e^2 / 2', '2 * (e^2 - 1)', 'e^2 - 1'], correct: 0, diff: 'MEDIUM', marks: 3 },
    { text: 'A square matrix A is invertible if and only if:', options: ['det(A) ≠ 0', 'trace(A) = 0', 'A is symmetric', 'A has only positive eigenvalues'], correct: 0, diff: 'EASY', marks: 2 },
    { text: 'If a random variable follows a normal distribution N(μ, σ²), what percentage of data falls within 2 standard deviations?', options: ['Approximately 95.4%', 'Approximately 68.2%', 'Approximately 99.7%', 'Exactly 90.0%'], correct: 0, diff: 'EASY', marks: 2 },
  ],
  physics: [
    { text: 'What physical law states that the net electric flux through any closed Gaussian surface is proportional to enclosed charge?', options: ['Gauss\'s Law', 'Ampère\'s Law', 'Faraday\'s Law of Induction', 'Coulomb\'s Inverse Square Law'], correct: 0, diff: 'MEDIUM', marks: 3 },
    { text: 'In special relativity, as an object\'s velocity approaches the speed of light c, its relativistic momentum approaches:', options: ['Infinity', 'Zero', 'A constant finite ceiling', 'The rest mass times c'], correct: 0, diff: 'HARD', marks: 4 },
  ],
};

export const aiApi = {
  generateQuestions: async ({ topic = '', notes = '', count = 5, difficulty = 'MEDIUM', type = 'MCQ' }) => {
    if (isMockEnabled()) {
      await delay(900);

      const targetTopic = topic.trim() || 'Computer Science';
      const countNum = Math.min(20, Math.max(1, Number(count) || 5));
      const topicLower = targetTopic.toLowerCase();

      // Find best match in templates
      let templates = [];
      if (topicLower.includes('java') || topicLower.includes('oop') || topicLower.includes('code')) {
        templates = TOPIC_TEMPLATES.java;
      } else if (topicLower.includes('db') || topicLower.includes('sql') || topicLower.includes('data')) {
        templates = TOPIC_TEMPLATES.dbms;
      } else if (topicLower.includes('math') || topicLower.includes('calculus') || topicLower.includes('algebra')) {
        templates = TOPIC_TEMPLATES.math;
      } else if (topicLower.includes('phy') || topicLower.includes('mechanic') || topicLower.includes('quantum')) {
        templates = TOPIC_TEMPLATES.physics;
      } else {
        templates = [...TOPIC_TEMPLATES.java, ...TOPIC_TEMPLATES.dbms, ...TOPIC_TEMPLATES.math];
      }

      const generated = [];

      for (let i = 0; i < countNum; i++) {
        const template = templates[i % templates.length];
        const itemDifficulty = difficulty === 'MIXED' ? ['EASY', 'MEDIUM', 'HARD'][i % 3] : difficulty;
        const itemType = type === 'MIXED' ? (i % 3 === 0 ? 'SHORT_ANSWER' : 'MCQ') : type;

        const marks = itemDifficulty === 'HARD' ? 4 : itemDifficulty === 'MEDIUM' ? 3 : 2;

        if (itemType === 'SHORT_ANSWER') {
          generated.push({
            id: `ai_gen_${Date.now()}_${i}`,
            text: template.type === 'SHORT_ANSWER' ? template.text : `Critically explain the core principles of ${targetTopic} regarding: "${template.text.replace('?', '')}".`,
            type: 'SHORT_ANSWER',
            topic: targetTopic,
            difficulty: itemDifficulty,
            marks,
            modelAnswer: template.model || `Comprehensive theoretical explanation covering foundational definitions, mathematical derivations, and edge cases in ${targetTopic}.`,
            isAiGenerated: true,
            createdAt: new Date().toISOString(),
          });
        } else {
          // MCQ
          const baseOptions = template.options || [
            `Primary optimal implementation in ${targetTopic}`,
            `Secondary fallback structure with overhead`,
            `Deprecating pattern in high-throughput workloads`,
            `Non-deterministic execution outcome`,
          ];

          // Shuffle options so correct answer isn't always at index 0
          const shuffled = [...baseOptions];
          const targetCorrect = shuffled[template.correct || 0];
          // Randomize
          shuffled.sort(() => Math.random() - 0.5);
          const correctIndex = shuffled.indexOf(targetCorrect);

          generated.push({
            id: `ai_gen_${Date.now()}_${i}`,
            text: i === 0 && notes ? `According to your study notes: ${template.text}` : template.text,
            type: 'MCQ',
            topic: targetTopic,
            difficulty: itemDifficulty,
            marks,
            options: shuffled,
            correctAnswer: correctIndex,
            explanation: `ExamIQ AI synthesis: option "${targetCorrect}" accurately reflects standard definitions in ${targetTopic}.`,
            isAiGenerated: true,
            createdAt: new Date().toISOString(),
          });
        }
      }

      return generated;
    }

    const response = await axiosInstance.post('/api/ai/generate-questions', {
      topic,
      notes,
      count,
      difficulty,
      type,
    });
    return response.data.data || response.data;
  },

  gradeShortAnswer: async ({ questionText, modelAnswer, studentAnswer, maxMarks = 5 }) => {
    if (isMockEnabled()) {
      await delay(700);

      if (!studentAnswer || studentAnswer.trim().length < 5) {
        return {
          suggestedScore: 0,
          confidence: 99,
          feedback: 'No substantive answer provided. Score 0.',
        };
      }

      // Simple semantic heuristic for mock grading
      const studentWords = studentAnswer.toLowerCase().split(/\s+/);
      const modelWords = modelAnswer.toLowerCase().split(/\s+/);

      const overlap = studentWords.filter((w) => modelWords.includes(w) && w.length > 3).length;
      const ratio = Math.min(1, overlap / Math.max(4, modelWords.length * 0.4));

      const suggestedScore = Number((Math.max(1, ratio * maxMarks)).toFixed(1));
      const confidence = Math.floor(85 + Math.random() * 12);

      let feedback = '';
      if (suggestedScore >= maxMarks * 0.8) {
        feedback = 'Excellent conceptual clarity. Accurately touches upon key terms, core mechanisms, and expected edge-case handling.';
      } else if (suggestedScore >= maxMarks * 0.5) {
        feedback = 'Good foundational grasp. Student articulates primary principles but omits technical distinctions or quantitative formulation.';
      } else {
        feedback = 'Partial explanation provided. Lacks key theoretical terminology and does not sufficiently address the prompt requirements.';
      }

      return {
        suggestedScore,
        confidence,
        feedback,
      };
    }

    const response = await axiosInstance.post('/api/ai/grade-answer', {
      questionText,
      modelAnswer,
      studentAnswer,
      maxMarks,
    });
    return response.data.data || response.data;
  },

  getPersonalizedFeedback: async ({ attemptId, result }) => {
    if (isMockEnabled()) {
      await delay(800);

      // Analyze answers by topic
      const topicStats = {};
      (result.answers || []).forEach((ans) => {
        const topic = ans.topic || result.subject || 'General Concepts';
        if (!topicStats[topic]) {
          topicStats[topic] = { total: 0, correct: 0 };
        }
        topicStats[topic].total += ans.marks || 1;
        if (ans.isCorrect) {
          topicStats[topic].correct += ans.marksAwarded || 1;
        }
      });

      const topicBreakdown = Object.entries(topicStats).map(([topic, stats]) => {
        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 50;
        return { topic, accuracy, total: stats.total, correct: stats.correct };
      });

      // Default if single topic
      if (topicBreakdown.length < 2) {
        topicBreakdown.push(
          { topic: 'Theoretical Principles', accuracy: 88, total: 10, correct: 8.8 },
          { topic: 'Problem Solving & Nuances', accuracy: 55, total: 10, correct: 5.5 },
          { topic: 'Complexity & Edge Cases', accuracy: 40, total: 8, correct: 3.2 }
        );
      }

      const strongTopics = topicBreakdown.filter((t) => t.accuracy >= 70).map((t) => t.topic);
      const weakTopics = topicBreakdown.filter((t) => t.accuracy < 70).map((t) => t.topic);

      return {
        overallScore: result.percentage || 78,
        topicBreakdown,
        strongTopics: strongTopics.length > 0 ? strongTopics : ['Foundational Recall'],
        weakTopics: weakTopics.length > 0 ? weakTopics : ['Advanced Multi-Step Proofs'],
        recommendations: [
          'Review runtime complexity trade-offs and worst-case scenarios where standard assumptions degrade.',
          'Practice 10-15 timed numerical problems to improve speed during competitive exam windows.',
          'Consolidate handwritten revision cheat sheets for key formulas and isolation properties.',
          'Leverage active recall flashcards on terms where negative marking deductions occurred.',
        ],
        generatedAt: new Date().toISOString(),
      };
    }

    const response = await axiosInstance.get(`/api/ai/feedback/${attemptId}`);
    return response.data.data || response.data;
  },
};

export default aiApi;

