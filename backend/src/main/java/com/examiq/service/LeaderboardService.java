package com.examiq.service;

import com.examiq.dto.response.LeaderboardDto;
import com.examiq.entity.Attempt;
import com.examiq.entity.User;
import com.examiq.repository.AttemptRepository;
import com.examiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final AttemptRepository attemptRepository;
    private final UserRepository userRepository;

    public List<LeaderboardDto> getLeaderboard(String examId, boolean overall, String currentEmail) {
        if (overall) {
            return getOverallLeaderboard(currentEmail);
        } else {
            return getExamLeaderboard(examId, currentEmail);
        }
    }

    private List<LeaderboardDto> getExamLeaderboard(String examId, String currentEmail) {
        List<Attempt> attempts;
        if (examId != null && !examId.isBlank()) {
            attempts = attemptRepository.findByExamIdAndStatus(examId, Attempt.AttemptStatus.SUBMITTED);
        } else {
            attempts = attemptRepository.findAll().stream()
                    .filter(a -> a.getStatus() == Attempt.AttemptStatus.SUBMITTED)
                    .collect(Collectors.toList());
        }

        List<Attempt> sorted = attempts.stream()
                .sorted(Comparator.comparingDouble(Attempt::getPercentage).reversed())
                .collect(Collectors.toList());

        DateTimeFormatter dtf = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        List<LeaderboardDto> result = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            Attempt a = sorted.get(i);
            User user = userRepository.findById(a.getStudentId()).orElse(null);
            String name = user != null ? user.getName() : "Unknown";
            String avatar = user != null && user.getAvatar() != null ? user.getAvatar() : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + a.getStudentId();
            boolean isCur = currentEmail != null && user != null && currentEmail.equalsIgnoreCase(user.getEmail());
            String badge = i == 0 ? "gold" : i == 1 ? "silver" : i == 2 ? "bronze" : null;
            String subAt = a.getSubmittedAt() != null ? a.getSubmittedAt().format(dtf) : "";

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
                    .averageScore(a.getPercentage())
                    .examsTaken(1)
                    .examsCompleted(1)
                    .attemptId(a.getId())
                    .badge(badge)
                    .isCurrentUser(isCur)
                    .submittedAt(subAt)
                    .riskScore(a.getRiskScore())
                    .passed(a.isPassed())
                    .build());
        }
        return result;
    }

    private List<LeaderboardDto> getOverallLeaderboard(String currentEmail) {
        List<Attempt> submitted = attemptRepository.findAll().stream()
                .filter(a -> a.getStatus() == Attempt.AttemptStatus.SUBMITTED)
                .collect(Collectors.toList());

        Map<String, List<Attempt>> byStudent = submitted.stream()
                .collect(Collectors.groupingBy(Attempt::getStudentId));

        class StudentStats {
            String studentId;
            int examsTaken;
            double totalScore;
            double totalMarks;
            double avgPercentage;
        }

        List<StudentStats> statsList = new ArrayList<>();
        for (Map.Entry<String, List<Attempt>> entry : byStudent.entrySet()) {
            StudentStats s = new StudentStats();
            s.studentId = entry.getKey();
            s.examsTaken = entry.getValue().size();
            s.totalScore = entry.getValue().stream().mapToDouble(Attempt::getScore).sum();
            s.totalMarks = entry.getValue().stream().mapToDouble(Attempt::getTotalMarks).sum();
            s.avgPercentage = Math.round(entry.getValue().stream().mapToDouble(Attempt::getPercentage).average().orElse(0.0) * 10.0) / 10.0;
            statsList.add(s);
        }

        statsList.sort(Comparator.comparingDouble((StudentStats s) -> s.avgPercentage).reversed());

        List<LeaderboardDto> result = new ArrayList<>();
        for (int i = 0; i < statsList.size(); i++) {
            StudentStats s = statsList.get(i);
            User user = userRepository.findById(s.studentId).orElse(null);
            String name = user != null ? user.getName() : "Unknown";
            String avatar = user != null && user.getAvatar() != null ? user.getAvatar() : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + s.studentId;
            boolean isCur = currentEmail != null && user != null && currentEmail.equalsIgnoreCase(user.getEmail());
            String badge = i == 0 ? "gold" : i == 1 ? "silver" : i == 2 ? "bronze" : null;

            result.add(LeaderboardDto.builder()
                    .rank(i + 1)
                    .studentId(s.studentId)
                    .studentName(name)
                    .name(name)
                    .avatar(avatar)
                    .score(s.totalScore)
                    .totalMarks((int) s.totalMarks)
                    .percentage(s.avgPercentage)
                    .averageScore(s.avgPercentage)
                    .examsTaken(s.examsTaken)
                    .examsCompleted(s.examsTaken)
                    .badge(badge)
                    .isCurrentUser(isCur)
                    .build());
        }
        return result;
    }
}
