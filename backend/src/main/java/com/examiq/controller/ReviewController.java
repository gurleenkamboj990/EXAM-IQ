package com.examiq.controller;

import com.examiq.dto.response.ApiResponse;
import com.examiq.dto.response.ReviewDto;
import com.examiq.service.ReviewService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/api/exams/{examId}/reviews")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getExamReviews(@PathVariable String examId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getReviewsForExam(examId)));
    }

    @PutMapping("/api/reviews/{reviewId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ReviewDto>> updateReview(
            @PathVariable String reviewId,
            @RequestBody Map<String, Object> body) {
        Double teacherScore = null;
        if (body.get("teacherScore") != null) {
            teacherScore = ((Number) body.get("teacherScore")).doubleValue();
        }
        String teacherComment = (String) body.get("teacherComment");

        ReviewDto updated = reviewService.updateReview(reviewId, teacherScore, teacherComment);
        return ResponseEntity.ok(ApiResponse.success("Review saved successfully", updated));
    }
}

