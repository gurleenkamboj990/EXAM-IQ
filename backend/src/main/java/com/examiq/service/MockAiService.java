package com.examiq.service;

import com.examiq.dto.request.AiGenerateRequest;
import com.examiq.dto.request.GradeAnswerRequest;
import com.examiq.dto.response.QuestionDto;
import com.examiq.entity.Question;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class MockAiService implements AiService {

    @Override
    public List<QuestionDto> generateQuestions(AiGenerateRequest request) {
        log.info("AI generating {} questions for topic: {}", request.getCount(), request.getTopic());
        List<QuestionDto> questions = new ArrayList<>();
        String topic = request.getTopic();
        Question.Difficulty difficulty = request.getDifficulty() != null
                ? request.getDifficulty() : Question.Difficulty.MEDIUM;

        for (int i = 0; i < request.getCount(); i++) {
            QuestionDto q = QuestionDto.builder()
                    .id("ai-gen-" + UUID.randomUUID().toString().substring(0, 8))
                    .text(generateQuestionText(topic, i))
                    .type(i % 4 == 3 ? Question.QuestionType.SHORT_ANSWER : Question.QuestionType.MCQ)
                    .topic(topic)
                    .difficulty(difficulty)
                    .marks(difficulty == Question.Difficulty.HARD ? 3 : difficulty == Question.Difficulty.MEDIUM ? 2 : 1)
                    .options(i % 4 == 3 ? null : generateOptions(topic, i))
                    .correctAnswer(i % 4 == 3 ? null : new Random().nextInt(4))
                    .explanation("This question tests understanding of " + topic + " concepts. The correct answer demonstrates mastery of the topic.")
                    .createdAt(java.time.LocalDateTime.now())
                    .build();
            questions.add(q);
        }
        return questions;
    }

    @Override
    public Map<String, Object> gradeAnswer(GradeAnswerRequest request) {
        log.info("AI grading answer for question: {}", request.getQuestionId());
        int score = new Random().nextInt(5) + 5;
        int maxScore = 10;
        String feedback = generateGradingFeedback(request.getAnswer(), score, maxScore);
        return Map.of("score", score, "maxScore", maxScore, "feedback", feedback,
                "percentage", (score * 100.0 / maxScore));
    }

    @Override
    public Map<String, Object> generateFeedback(String attemptId) {
        log.info("AI generating feedback for attempt: {}", attemptId);
        return Map.of(
            "attemptId", attemptId,
            "topicPerformance", List.of(
                Map.of("topic", "Data Structures", "score", 85, "total", 100),
                Map.of("topic", "Algorithms", "score", 70, "total", 100),
                Map.of("topic", "Database", "score", 90, "total", 100),
                Map.of("topic", "Operating Systems", "score", 65, "total", 100)
            ),
            "studySuggestions", List.of(
                "Review time complexity analysis for sorting algorithms",
                "Practice more problems on graph traversal (BFS/DFS)",
                "Revisit normalization concepts in database design",
                "Study process scheduling algorithms in OS"
            ),
            "strongTopics", List.of("Database Management", "Data Structures - Arrays"),
            "weakTopics", List.of("Dynamic Programming", "Process Synchronization"),
            "overallFeedback", "Good performance! Focus on algorithmic problem solving to improve further."
        );
    }

    private String generateQuestionText(String topic, int index) {
        List<String> templates = List.of(
            "What is the time complexity of the most efficient algorithm for %s problem #" + (index + 1) + "?",
            "Which of the following best describes %s in the context of question " + (index + 1) + "?",
            "Explain the fundamental concept of %s as applied in scenario " + (index + 1) + ".",
            "In %s, which approach yields optimal results for case " + (index + 1) + "?",
            "What is the primary advantage of using %s as demonstrated in example " + (index + 1) + "?"
        );
        return String.format(templates.get(index % templates.size()), topic);
    }

    private List<String> generateOptions(String topic, int index) {
        return List.of(
            "O(1) - Constant time for " + topic,
            "O(log n) - Logarithmic approach",
            "O(n) - Linear scanning method",
            "O(n²) - Quadratic comparison"
        );
    }

    private String generateGradingFeedback(String answer, int score, int maxScore) {
        if (answer == null || answer.isBlank()) {
            return "No answer provided. Please attempt all questions for maximum marks.";
        }
        if (score >= 8) {
            return "Excellent answer! You demonstrated a thorough understanding of the concept with clear explanation.";
        } else if (score >= 6) {
            return "Good attempt. The core concept is correct but could include more detail and examples.";
        } else {
            return "Partial credit awarded. The answer touches on some relevant points but misses key aspects. Review the topic for a more complete understanding.";
        }
    }
}
