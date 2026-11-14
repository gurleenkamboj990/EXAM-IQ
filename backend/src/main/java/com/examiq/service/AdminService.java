package com.examiq.service;

import com.examiq.dto.response.AdminStatsDto;
import com.examiq.entity.Attempt;
import com.examiq.entity.Exam;
import com.examiq.entity.User;
import com.examiq.repository.AttemptRepository;
import com.examiq.repository.CertificateRepository;
import com.examiq.repository.ExamRepository;
import com.examiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ExamRepository examRepository;
    private final CertificateRepository certificateRepository;

    public AdminStatsDto getStats() {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();

        Map<String, Long> usersByRole = new HashMap<>();
        usersByRole.put("ADMIN", users.stream().filter(u -> u.getRole() == User.Role.ADMIN).count());
        usersByRole.put("TEACHER", users.stream().filter(u -> u.getRole() == User.Role.TEACHER).count());
        usersByRole.put("STUDENT", users.stream().filter(u -> u.getRole() == User.Role.STUDENT).count());

        List<Exam> exams = examRepository.findAll();
        long totalExams = exams.size();

        LocalDateTime now = LocalDateTime.now();
        long activeExams = exams.stream().filter(e -> {
            if (e.getStartTime() != null && now.isBefore(e.getStartTime())) return false;
            if (e.getEndTime() != null && now.isAfter(e.getEndTime())) return false;
            return e.isPublished();
        }).count();

        long certs = certificateRepository.count();

        // Monthly growth: last 6 months
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy");
        List<AdminStatsDto.MonthlyGrowth> monthlyGrowth = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);
            String label = monthStart.format(fmt);
            long cnt = users.stream().filter(u -> u.getCreatedAt() != null &&
                    !u.getCreatedAt().isBefore(monthStart) && u.getCreatedAt().isBefore(monthEnd)).count();
            monthlyGrowth.add(new AdminStatsDto.MonthlyGrowth(label, cnt));
        }

        Map<String, Long> examsByStatus = new HashMap<>();
        examsByStatus.put("UPCOMING", exams.stream().filter(e -> e.getStartTime() != null && now.isBefore(e.getStartTime())).count());
        examsByStatus.put("LIVE", activeExams);
        examsByStatus.put("COMPLETED", exams.stream().filter(e -> e.getEndTime() != null && now.isAfter(e.getEndTime())).count());

        return AdminStatsDto.builder()
                .totalUsers(totalUsers)
                .usersByRole(usersByRole)
                .totalExams(totalExams)
                .activeExams(activeExams)
                .certificatesIssued(certs)
                .monthlyUserGrowth(monthlyGrowth)
                .examsByStatus(examsByStatus)
                .build();
    }
}
