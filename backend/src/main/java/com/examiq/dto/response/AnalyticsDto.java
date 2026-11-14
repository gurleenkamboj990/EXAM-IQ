package com.examiq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDto {
    private String examId;
    private String examTitle;
    private ExamSummaryDto exam;
    private int totalAttempts;
    private double averageScore;
    private double highestScore;
    private double lowestScore;
    private double passRate;
    private List<ScoreBucket> scoreDistribution;
    private List<ScoreBucket> distribution;
    private List<QuestionStat> perQuestionStats;
    private List<LeaderboardDto> topPerformers;
    private List<LeaderboardDto> bottomPerformers;
    private List<AttemptAnalyticsDto> allAttempts;

    public List<ScoreBucket> getDistribution() {
        return distribution != null ? distribution : scoreDistribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExamSummaryDto {
        private String id;
        private String title;
        private String subject;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreBucket {
        private String range;
        private int count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionStat {
        private String questionId;
        private int questionNumber;
        private String text;
        private String questionText;
        private String topic;
        private String configuredDifficulty;
        private String computedDifficulty;
        private double percentageCorrect;
        private double correctPercentage;
        private int correctCount;
        private int totalAttempts;

        public String getText() {
            return text != null ? text : questionText;
        }

        public double getPercentageCorrect() {
            return percentageCorrect != 0.0 ? percentageCorrect : correctPercentage;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttemptAnalyticsDto {
        private String attemptId;
        private String studentId;
        private String studentName;
        private String email;
        private String avatar;
        private double score;
        private int totalMarks;
        private double percentage;
        private boolean passed;
        private int riskScore;
        private String riskLevel;
        private int violationCount;
        private String submittedAt;
    }
}
