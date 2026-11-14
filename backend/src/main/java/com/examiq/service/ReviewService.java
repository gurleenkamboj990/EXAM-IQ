package com.examiq.service;

import com.examiq.dto.response.ReviewDto;
import com.examiq.entity.*;
import com.examiq.exception.ResourceNotFoundException;
import com.examiq.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final AttemptAnswerRepository attemptAnswerRepository;
    private final AttemptRepository attemptRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final CertificateService certificateService;

    public List<ReviewDto> getReviewsForExam(String examId) {
        List<Attempt> attempts = attemptRepository.findByExamIdAndStatus(examId, Attempt.AttemptStatus.SUBMITTED);
        List<ReviewDto> reviews = new ArrayList<>();

        Exam exam = examRepository.findById(examId).orElse(null);
        String examTitle = exam != null ? exam.getTitle() : "Exam";

        for (Attempt att : attempts) {
            List<AttemptAnswer> answers = attemptAnswerRepository.findByAttemptId(att.getId());
            User student = userRepository.findById(att.getStudentId()).orElse(null);
            String studentName = student != null ? student.getName() : "Student";
            String avatar = student != null ? student.getAvatar() : null;

            for (AttemptAnswer ans : answers) {
                Question q = questionRepository.findById(ans.getQuestionId()).orElse(null);
                if (q != null && q.getType() == Question.QuestionType.SHORT_ANSWER) {
                    String status = ans.getGradingStatus() == AttemptAnswer.GradingStatus.MANUALLY_GRADED
                            ? "GRADED"
                            : "PENDING";

                    reviews.add(ReviewDto.builder()
                            .reviewId(ans.getId())
                            .examId(examId)
                            .examTitle(examTitle)
                            .studentId(att.getStudentId())
                            .studentName(studentName)
                            .studentAvatar(avatar)
                            .questionId(q.getId())
                            .questionText(q.getText())
                            .maxMarks(q.getMarks())
                            .modelAnswer(q.getExplanation() != null ? q.getExplanation() : "Model answer expected.")
                            .studentAnswer(ans.getTextAnswer() != null ? ans.getTextAnswer() : "No answer submitted.")
                            .aiScore(ans.getMarksAwarded())
                            .aiConfidence(90)
                            .aiFeedback("Conceptual articulation aligned with core tenets.")
                            .teacherScore(ans.getGradingStatus() == AttemptAnswer.GradingStatus.MANUALLY_GRADED ? ans.getMarksAwarded() : null)
                            .teacherComment(ans.getTeacherComment())
                            .status(status)
                            .submittedAt(att.getSubmittedAt())
                            .build());
                }
            }
        }
        return reviews;
    }

    @Transactional
    public ReviewDto updateReview(String reviewId, Double teacherScore, String teacherComment) {
        AttemptAnswer ans = attemptAnswerRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review record", reviewId));

        double score = teacherScore != null ? teacherScore : 0.0;
        ans.setMarksAwarded(score);
        ans.setTeacherComment(teacherComment);
        ans.setGradingStatus(AttemptAnswer.GradingStatus.MANUALLY_GRADED);
        ans.setCorrect(score > 0);
        attemptAnswerRepository.save(ans);

        // Recalculate attempt score
        Attempt attempt = attemptRepository.findById(ans.getAttemptId()).orElse(null);
        if (attempt != null) {
            List<AttemptAnswer> allAnswers = attemptAnswerRepository.findByAttemptId(attempt.getId());
            double totalScore = allAnswers.stream().mapToDouble(AttemptAnswer::getMarksAwarded).sum();
            attempt.setScore(Math.max(0, totalScore));
            if (attempt.getTotalMarks() > 0) {
                double pct = (attempt.getScore() / attempt.getTotalMarks()) * 100.0;
                attempt.setPercentage(Math.round(pct * 10.0) / 10.0);
            }

            Exam exam = examRepository.findById(attempt.getExamId()).orElse(null);
            double passingPct = exam != null ? exam.getPassingPercentage() : 50.0;
            attempt.setPassed(attempt.getPercentage() >= passingPct);
            attemptRepository.save(attempt);

            if (attempt.isPassed()) {
                certificateService.generateIfNotExists(attempt);
            }
        }

        Question q = questionRepository.findById(ans.getQuestionId()).orElse(null);
        Exam exam = attempt != null ? examRepository.findById(attempt.getExamId()).orElse(null) : null;
        User student = attempt != null ? userRepository.findById(attempt.getStudentId()).orElse(null) : null;

        return ReviewDto.builder()
                .reviewId(ans.getId())
                .examId(attempt != null ? attempt.getExamId() : "")
                .examTitle(exam != null ? exam.getTitle() : "")
                .studentId(attempt != null ? attempt.getStudentId() : "")
                .studentName(student != null ? student.getName() : "")
                .studentAvatar(student != null ? student.getAvatar() : null)
                .questionId(q != null ? q.getId() : "")
                .questionText(q != null ? q.getText() : "")
                .maxMarks(q != null ? q.getMarks() : 5)
                .modelAnswer(q != null ? q.getExplanation() : "")
                .studentAnswer(ans.getTextAnswer())
                .aiScore(score)
                .teacherScore(score)
                .teacherComment(teacherComment)
                .status("GRADED")
                .submittedAt(attempt != null ? attempt.getSubmittedAt() : null)
                .build();
    }
}

