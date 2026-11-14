package com.examiq.controller;

import com.examiq.dto.response.ApiResponse;
import com.examiq.dto.response.AttemptDto;
import com.examiq.dto.response.LiveCandidateDto;
import com.examiq.entity.Attempt;
import com.examiq.entity.User;
import com.examiq.repository.AttemptAnswerRepository;
import com.examiq.repository.AttemptRepository;
import com.examiq.repository.ExamQuestionRepository;
import com.examiq.repository.UserRepository;
import com.examiq.service.AttemptService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/monitor")
@RequiredArgsConstructor
@Tag(name = "Monitor")
public class MonitorController {

    private final AttemptRepository attemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final UserRepository userRepository;
    private final AttemptService attemptService;
    private final ObjectMapper objectMapper;

    @GetMapping("/{examId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AttemptDto>>> monitor(@PathVariable String examId) {
        List<AttemptDto> active = attemptRepository
                .findByExamIdAndStatus(examId, Attempt.AttemptStatus.STARTED)
                .stream().map(attemptService::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(active));
    }

    @GetMapping("/exams/{examId}/candidates")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<LiveCandidateDto>>> getLiveCandidates(@PathVariable String examId) {
        List<Attempt> active = attemptRepository.findByExamIdAndStatus(examId, Attempt.AttemptStatus.STARTED);
        int totalQuestions = (int) examQuestionRepository.countByExamId(examId);

        List<LiveCandidateDto> candidates = new ArrayList<>();
        for (Attempt a : active) {
            User student = userRepository.findById(a.getStudentId()).orElse(null);
            String name = student != null ? student.getName() : "Student";
            String email = student != null ? student.getEmail() : "";
            String avatar = student != null ? student.getAvatar() : null;

            int answeredCount = attemptAnswerRepository.countByAttemptId(a.getId());
            List<Object> violations = new ArrayList<>();
            if (a.getViolations() != null && !a.getViolations().isBlank()) {
                try {
                    violations = objectMapper.readValue(a.getViolations(), new TypeReference<List<Object>>() {});
                } catch (Exception e) {
                    violations.add(a.getViolations());
                }
            }

            String riskLevel = a.getRiskScore() >= 70 ? "HIGH" : (a.getRiskScore() >= 30 ? "MEDIUM" : "LOW");

            candidates.add(LiveCandidateDto.builder()
                    .id(a.getId())
                    .studentId(a.getStudentId())
                    .name(name)
                    .email(email)
                    .avatar(avatar)
                    .examId(examId)
                    .answeredCount(answeredCount)
                    .totalQuestions(totalQuestions > 0 ? totalQuestions : 10)
                    .timeRemainingSeconds(1800)
                    .riskScore(a.getRiskScore())
                    .riskLevel(riskLevel)
                    .violationCount(violations.size())
                    .violations(violations)
                    .status("IN_PROGRESS")
                    .lastPing("Just now")
                    .build());
        }

        return ResponseEntity.ok(ApiResponse.success(candidates));
    }
}
