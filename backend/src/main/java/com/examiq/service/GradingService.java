package com.examiq.service;

import com.examiq.entity.Attempt;
import com.examiq.entity.AttemptAnswer;
import com.examiq.entity.Question;
import com.examiq.repository.AttemptAnswerRepository;
import com.examiq.repository.AttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GradingService {

    private final AttemptRepository attemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final CertificateService certificateService;

    @Transactional
    public Attempt autoGrade(Attempt attempt, List<Question> questions, List<AttemptAnswer> answers,
                             boolean negativeMarking, double negativeMarkValue) {
        Map<String, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        double totalScore = 0.0;
        int totalMaxMarks = 0;

        for (AttemptAnswer answer : answers) {
            Question question = questionMap.get(answer.getQuestionId());
            if (question == null) continue;

            totalMaxMarks += question.getMarks();

            if (question.getType() == Question.QuestionType.MCQ) {
                if (answer.getSelectedOption() != null && question.getCorrectAnswer() != null) {
                    if (answer.getSelectedOption().equals(question.getCorrectAnswer())) {
                        answer.setCorrect(true);
                        answer.setMarksAwarded(question.getMarks());
                        totalScore += question.getMarks();
                    } else {
                        answer.setCorrect(false);
                        double deduction = negativeMarking ? negativeMarkValue : 0.0;
                        answer.setMarksAwarded(-deduction);
                        totalScore -= deduction;
                    }
                } else {
                    answer.setCorrect(false);
                    answer.setMarksAwarded(0.0);
                }
                answer.setGradingStatus(AttemptAnswer.GradingStatus.AUTO_GRADED);
            } else {
                answer.setGradingStatus(AttemptAnswer.GradingStatus.PENDING_REVIEW);
                answer.setMarksAwarded(0.0);
                answer.setCorrect(null);
            }
        }

        attemptAnswerRepository.saveAll(answers);

        if (totalMaxMarks == 0) totalMaxMarks = attempt.getTotalMarks();
        double finalScore = Math.max(0, totalScore);
        double percentage = totalMaxMarks > 0 ? (finalScore / totalMaxMarks) * 100.0 : 0.0;

        attempt.setScore(finalScore);
        attempt.setTotalMarks(totalMaxMarks);
        attempt.setPercentage(percentage);

        double passingPercentage = 50.0;
        attempt.setPassed(percentage >= passingPercentage);

        attemptRepository.save(attempt);
        log.info("Graded attempt {} — score: {}/{}, percentage: {}%, passed: {}",
                attempt.getId(), finalScore, totalMaxMarks, String.format("%.1f", percentage), attempt.isPassed());

        if (attempt.isPassed()) {
            try {
                certificateService.generateIfNotExists(attempt);
            } catch (Exception e) {
                log.warn("Could not generate certificate for attempt {}: {}", attempt.getId(), e.getMessage());
            }
        }

        return attempt;
    }
}
