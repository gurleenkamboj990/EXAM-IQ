package com.examiq.service;

import com.examiq.entity.*;
import com.examiq.repository.AttemptAnswerRepository;
import com.examiq.repository.AttemptRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GradingServiceTest {

    @Mock AttemptRepository attemptRepository;
    @Mock AttemptAnswerRepository attemptAnswerRepository;
    @Mock CertificateService certificateService;

    @InjectMocks GradingService gradingService;

    private Attempt attempt;
    private Question mcqQ;
    private Question shortQ;

    @BeforeEach
    void setUp() {
        attempt = Attempt.builder()
                .examId("exam-1")
                .studentId("student-1")
                .totalMarks(10)
                .status(Attempt.AttemptStatus.SUBMITTED)
                .build();
        setId(attempt, "attempt-1");

        mcqQ = Question.builder()
                .text("What is 2+2?")
                .type(Question.QuestionType.MCQ)
                .marks(4)
                .correctAnswer(1)
                .build();
        setId(mcqQ, "q-1");

        shortQ = Question.builder()
                .text("Explain OOP.")
                .type(Question.QuestionType.SHORT_ANSWER)
                .marks(6)
                .build();
        setId(shortQ, "q-2");

        when(attemptAnswerRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
        when(attemptRepository.save(any(Attempt.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private void setId(Object entity, String id) {
        try {
            var f = com.examiq.entity.BaseEntity.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(entity, id);
        } catch (Exception ignored) {}
    }

    @Test
    void mcq_correctAnswer_fullMarks() {
        AttemptAnswer answer = AttemptAnswer.builder()
                .attemptId("attempt-1").questionId("q-1").selectedOption(1).build();

        Attempt result = gradingService.autoGrade(attempt, List.of(mcqQ), List.of(answer), false, 0.0);

        assertThat(answer.getCorrect()).isTrue();
        assertThat(answer.getMarksAwarded()).isEqualTo(4.0);
        assertThat(result.getScore()).isEqualTo(4.0);
        assertThat(result.getPercentage()).isEqualTo(100.0);
        assertThat(result.isPassed()).isTrue();
    }

    @Test
    void mcq_wrongAnswer_zeroMarksNoNegative() {
        AttemptAnswer answer = AttemptAnswer.builder()
                .attemptId("attempt-1").questionId("q-1").selectedOption(2).build();

        Attempt result = gradingService.autoGrade(attempt, List.of(mcqQ), List.of(answer), false, 0.0);

        assertThat(answer.getCorrect()).isFalse();
        assertThat(answer.getMarksAwarded()).isEqualTo(0.0);
        assertThat(result.getScore()).isEqualTo(0.0);
    }

    @Test
    void mcq_wrongAnswer_withNegativeMarking() {
        AttemptAnswer answer = AttemptAnswer.builder()
                .attemptId("attempt-1").questionId("q-1").selectedOption(0).build();

        Attempt result = gradingService.autoGrade(attempt, List.of(mcqQ), List.of(answer), true, 0.25);

        assertThat(answer.getMarksAwarded()).isEqualTo(-0.25);
        assertThat(result.getScore()).isEqualTo(0.0); // clamped to 0
    }

    @Test
    void shortAnswer_markedPendingReview() {
        AttemptAnswer answer = AttemptAnswer.builder()
                .attemptId("attempt-1").questionId("q-2").textAnswer("OOP is...").build();

        gradingService.autoGrade(attempt, List.of(shortQ), List.of(answer), false, 0.0);

        assertThat(answer.getGradingStatus()).isEqualTo(AttemptAnswer.GradingStatus.PENDING_REVIEW);
        assertThat(answer.getCorrect()).isNull();
        assertThat(answer.getMarksAwarded()).isEqualTo(0.0);
    }

    @Test
    void mixedExam_partialScore() {
        AttemptAnswer mcqAns = AttemptAnswer.builder()
                .attemptId("attempt-1").questionId("q-1").selectedOption(1).build(); // correct
        AttemptAnswer shortAns = AttemptAnswer.builder()
                .attemptId("attempt-1").questionId("q-2").textAnswer("Some answer").build();

        Attempt result = gradingService.autoGrade(
                attempt, Arrays.asList(mcqQ, shortQ), Arrays.asList(mcqAns, shortAns), false, 0.0);

        // MCQ correct = 4 pts; short answer = 0 pending; total max = 10
        assertThat(result.getScore()).isEqualTo(4.0);
        assertThat(result.getPercentage()).isEqualTo(40.0);
        assertThat(result.isPassed()).isFalse();
    }
}

