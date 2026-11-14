package com.examiq.controller;

import com.examiq.dto.response.AnalyticsDto;
import com.examiq.dto.response.ApiResponse;
import com.examiq.service.AnalyticsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/exams/{examId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AnalyticsDto>> getExamAnalytics(@PathVariable String examId) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getExamAnalytics(examId)));
    }
}
