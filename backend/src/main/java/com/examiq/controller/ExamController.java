package com.examiq.controller;

import com.examiq.dto.request.CreateExamRequest;
import com.examiq.dto.response.ApiResponse;
import com.examiq.dto.response.ExamDto;
import com.examiq.service.ExamService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@Tag(name = "Exams")
public class ExamController {

    private final ExamService examService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExamDto>>> getAll(@AuthenticationPrincipal UserDetails userDetails) {
        String role = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        String userId = userDetails.getUsername();
        return ResponseEntity.ok(ApiResponse.success(examService.getAllExams(role, userId)));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<ExamDto>>> getAvailable(@AuthenticationPrincipal UserDetails userDetails) {
        String role = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        String userId = userDetails.getUsername();
        return ResponseEntity.ok(ApiResponse.success(examService.getAllExams(role, userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExamDto>> getById(@PathVariable String id,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        String role = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return ResponseEntity.ok(ApiResponse.success(examService.getById(id, role)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamDto>> create(@Valid @RequestBody CreateExamRequest request,
                                                        @AuthenticationPrincipal UserDetails userDetails) {
        ExamDto exam = examService.create(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Exam created", exam));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamDto>> update(@PathVariable String id,
                                                        @RequestBody CreateExamRequest request,
                                                        @AuthenticationPrincipal UserDetails userDetails) {
        String role = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return ResponseEntity.ok(ApiResponse.success("Exam updated",
                examService.update(id, request, userDetails.getUsername(), role)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        examService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Exam deleted"));
    }

    @PostMapping("/{id}/duplicate")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamDto>> duplicate(@PathVariable String id,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Exam duplicated",
                examService.duplicate(id, userDetails.getUsername())));
    }
}
