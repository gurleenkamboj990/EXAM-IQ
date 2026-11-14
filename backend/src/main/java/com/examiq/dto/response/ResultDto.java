package com.examiq.dto.response;

import com.examiq.entity.AttemptAnswer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultDto {
    private String id;
    private String attemptId;
    private String examId;
    private String examTitle;
    private String subject;
    private String studentId;
    private String studentName;
    private double score;
    private int totalMarks;
    private double percentage;
    private boolean passed;
    private String grade;
    private LocalDateTime submittedAt;
    private int timeSpentSeconds;
    private int riskScore;
    private String riskLevel;
    private List<Object> violations;
    private ResultSummaryDto summary;
    private List<QuestionReviewDto> answers;
    private List<QuestionReviewDto> questionReview;
    private CertificateDto certificate;

    public String getAttemptId() {
        return attemptId != null ? attemptId : id;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResultSummaryDto {
        private int totalQuestions;
        private int correctCount;
        private int incorrectCount;
        private int skippedCount;
        private int pendingCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionReviewDto {
        private String questionId;
        private String questionText;
        private String type;
        private String questionType;
        private List<String> options;
        private Object correctAnswer;
        private Object studentAnswer;
        private Integer selectedOption;
        private String textAnswer;
        private Boolean isCorrect;
        private boolean isSkipped;
        private double marksAwarded;
        private int marks;
        private int maxMarks;
        private String explanation;
        private String feedback;
        private AttemptAnswer.GradingStatus gradingStatus;
        private String teacherComment;
    }
}
