package com.examiq.service;

import com.examiq.dto.response.AnalyticsDto;
import com.examiq.dto.response.LeaderboardDto;
import com.examiq.entity.Attempt;
import com.examiq.entity.AttemptAnswer;
import com.examiq.entity.ExamQuestion;
import com.examiq.entity.Question;
import com.examiq.entity.User;
import com.examiq.exception.ResourceNotFoundException;
import com.examiq.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AttemptRepository attemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    public AnalyticsDto getExamAnalytics(String examId) {
        var exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", examId));

        AnalyticsDto.ExamSummaryDto examSummary = AnalyticsDto.ExamSummaryDto.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .subject(exam.getSubject())
                .build();

        List<Attempt> submitted = attemptRepository.findByExamIdAndStatus(examId, Attempt.AttemptStatus.SUBMITTED);

        // Per-question stats
        List<ExamQuestion> eqs = examQuestionRepository.findByExamIdOrderByQuestionOrder(examId);
        List<String> qIds = eqs.stream().map(ExamQuestion::getQuestionId).collect(Collectors.toList());
        List<Question> questions = questionRepository.findAllByIdIn(qIds);
        Map<String, Question> questionMap = questions.stream().collect(Collectors.toMap(Question::getId, q -> q));

        List<AnalyticsDto.QuestionStat> qStats = new ArrayList<>();
        for (int i = 0; i < eqs.size(); i++) {
            ExamQuestion eq = eqs.get(i);
            Question q = questionMap.get(eq.getQuestionId());
            if (q == null) continue;

            List<AttemptAnswer> qAnswers = submitted.stream()
                    .flatMap(a -> attemptAnswerRepository.findByAttemptId(a.getId()).stream())
                    .filter(aa -> q.getId().equals(aa.getQuestionId()))
                    .collect(Collectors.toList());

            long correctCount = qAnswers.stream().filter(aa -> Boolean.TRUE.equals(aa.getCorrect())).count();
            double pct = qAnswers.isEmpty() ? 0.0 : Math.round(((double) correctCount / qAnswers.size() * 100.0) * 10.0) / 10.0;
            String computedDiff = pct >= 75.0 ? "EASY" : pct >= 45.0 ? "MEDIUM" : "HARD";

            qStats.add(AnalyticsDto.QuestionStat.builder()
                    .questionId(q.getId())
                    .questionNumber(i + 1)
                    .text(q.getText())
                    .questionText(q.getText())
                    .topic(q.getTopic() != null ? q.getTopic() : "General")
                    .configuredDifficulty(q.getDifficulty() != null ? q.getDifficulty().name() : "MEDIUM")
                    .computedDifficulty(computedDiff)
                    .percentageCorrect(pct)
                    .correctPercentage(pct)
                    .correctCount((int) correctCount)
                    .totalAttempts(qAnswers.size())
                    .build());
        }

        if (submitted.isEmpty()) {
            return AnalyticsDto.builder()
                    .examId(examId)
                    .examTitle(exam.getTitle())
                    .exam(examSummary)
                    .totalAttempts(0)
                    .averageScore(0)
                    .highestScore(0)
                    .lowestScore(0)
                    .passRate(0)
                    .scoreDistribution(List.of())
                    .distribution(List.of())
                    .perQuestionStats(qStats)
                    .topPerformers(List.of())
                    .bottomPerformers(List.of())
                    .allAttempts(List.of())
                    .build();
        }

        double avg = Math.round(submitted.stream().mapToDouble(Attempt::getPercentage).average().orElse(0) * 10.0) / 10.0;
        double high = Math.round(submitted.stream().mapToDouble(Attempt::getPercentage).max().orElse(0) * 10.0) / 10.0;
        double low = Math.round(submitted.stream().mapToDouble(Attempt::getPercentage).min().orElse(0) * 10.0) / 10.0;
        long passed = submitted.stream().filter(Attempt::isPassed).count();
        double passRate = Math.round(((double) passed / submitted.size() * 100.0) * 10.0) / 10.0;

        // Score distribution in buckets of 10
        List<AnalyticsDto.ScoreBucket> distribution = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            final int lo = i * 10, hi = lo + 10;
            long count = submitted.stream()
                    .filter(a -> a.getPercentage() >= lo && (hi == 100 ? a.getPercentage() <= 100 : a.getPercentage() < hi))
                    .count();
            distribution.add(new AnalyticsDto.ScoreBucket(lo + "-" + hi + "%", (int) count));
        }

        // Top 5 and bottom 5
        List<LeaderboardDto> ranked = rankAttempts(submitted);
        List<LeaderboardDto> top5 = ranked.stream().limit(5).collect(Collectors.toList());
        List<LeaderboardDto> bottom5 = new ArrayList<>(ranked);
        Collections.reverse(bottom5);
        bottom5 = bottom5.stream().limit(5).collect(Collectors.toList());

        // All attempts for export
        DateTimeFormatter dtf = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        List<AnalyticsDto.AttemptAnalyticsDto> allAttempts = ranked.stream().map(att -> {
            Attempt a = submitted.stream().filter(s -> s.getId().equals(att.getAttemptId())).findFirst().orElse(null);
            User u = userRepository.findById(att.getStudentId()).orElse(null);
            String email = u != null ? u.getEmail() : "";
            int vCount = 0;
            if (a != null && a.getViolations() != null && !a.getViolations().isBlank()) {
                vCount = a.getViolations().split("type").length - 1;
                if (vCount <= 0) vCount = 1;
            }
            int rScore = a != null ? a.getRiskScore() : 0;
            String rLevel = rScore >= 60 ? "HIGH" : rScore >= 30 ? "MEDIUM" : "LOW";
            String subAt = a != null && a.getSubmittedAt() != null ? a.getSubmittedAt().format(dtf) : "";

            return AnalyticsDto.AttemptAnalyticsDto.builder()
                    .attemptId(att.getAttemptId())
                    .studentId(att.getStudentId())
                    .studentName(att.getStudentName())
                    .email(email)
                    .avatar(att.getAvatar())
                    .score(att.getScore())
                    .totalMarks((int) att.getTotalMarks())
                    .percentage(att.getPercentage())
                    .passed(att.isPassed())
                    .riskScore(rScore)
                    .riskLevel(rLevel)
                    .violationCount(vCount)
                    .submittedAt(subAt)
                    .build();
        }).collect(Collectors.toList());

        return AnalyticsDto.builder()
                .examId(examId)
                .examTitle(exam.getTitle())
                .exam(examSummary)
                .totalAttempts(submitted.size())
                .averageScore(avg)
                .highestScore(high)
                .lowestScore(low)
                .passRate(passRate)
                .scoreDistribution(distribution)
                .distribution(distribution)
                .perQuestionStats(qStats)
                .topPerformers(top5)
                .bottomPerformers(bottom5)
                .allAttempts(allAttempts)
                .build();
    }

    private List<LeaderboardDto> rankAttempts(List<Attempt> attempts) {
        List<Attempt> sorted = attempts.stream()
                .sorted(Comparator.comparingDouble(Attempt::getPercentage).reversed())
                .collect(Collectors.toList());
        List<LeaderboardDto> result = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            Attempt a = sorted.get(i);
            User user = userRepository.findById(a.getStudentId()).orElse(null);
            String name = user != null ? user.getName() : "Unknown";
            String avatar = user != null && user.getAvatar() != null ? user.getAvatar() : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + a.getStudentId();
            result.add(LeaderboardDto.builder()
                    .rank(i + 1)
                    .studentId(a.getStudentId())
                    .studentName(name)
                    .name(name)
                    .avatar(avatar)
                    .examId(a.getExamId())
                    .score(a.getScore())
                    .totalMarks(a.getTotalMarks())
                    .percentage(a.getPercentage())
                    .passed(a.isPassed())
                    .riskScore(a.getRiskScore())
                    .attemptId(a.getId())
                    .build());
        }
        return result;
    }
}
