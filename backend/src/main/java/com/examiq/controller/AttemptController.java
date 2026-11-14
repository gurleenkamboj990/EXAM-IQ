package com.examiq.controller;

import com.examiq.dto.request.SubmitAttemptRequest;
import com.examiq.dto.response.ApiResponse;
import com.examiq.dto.response.AttemptDto;
import com.examiq.dto.response.ResultDto;
import com.examiq.service.AttemptService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Attempts")
public class AttemptController {

    private final AttemptService attemptService;

    @PostMapping("/api/exams/{examId}/attempt")
    public ResponseEntity<ApiResponse<AttemptDto>> start(@PathVariable String examId,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        AttemptDto attempt = attemptService.startAttempt(examId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Attempt started", attempt));
    }

    @PutMapping("/api/exams/{examId}/attempt/{attemptId}")
    public ResponseEntity<ApiResponse<AttemptDto>> autoSave(@PathVariable String examId,
                                                             @PathVariable String attemptId,
                                                             @RequestBody Object answers,
                                                             @AuthenticationPrincipal UserDetails userDetails) {
        AttemptDto attempt = attemptService.saveAnswers(examId, attemptId, userDetails.getUsername(), answers);
        return ResponseEntity.ok(ApiResponse.success("Answers saved", attempt));
    }

    @PostMapping("/api/exams/{examId}/attempt/{attemptId}/submit")
    public ResponseEntity<ApiResponse<ResultDto>> submit(@PathVariable String examId,
                                                          @PathVariable String attemptId,
                                                          @RequestBody SubmitAttemptRequest request,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        ResultDto result = attemptService.submitAttempt(examId, attemptId, userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Exam submitted successfully", result));
    }

    // Direct /api/attempts convenience aliases
    @PostMapping("/api/attempts/start")
    public ResponseEntity<ApiResponse<AttemptDto>> startDirect(@RequestBody Map<String, String> body,
                                                               @AuthenticationPrincipal UserDetails userDetails) {
        String examId = body.get("examId");
        AttemptDto attempt = attemptService.startAttempt(examId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Attempt started", attempt));
    }

    @PostMapping("/api/attempts/autosave")
    public ResponseEntity<ApiResponse<AttemptDto>> autoSaveDirect(@RequestBody Map<String, Object> body,
                                                                  @AuthenticationPrincipal UserDetails userDetails) {
        String attemptId = (String) body.get("attemptId");
        Object answers = body.get("answers");
        AttemptDto attempt = attemptService.saveAnswers(null, attemptId, userDetails.getUsername(), answers);
        return ResponseEntity.ok(ApiResponse.success("Answers saved", attempt));
    }

    @PostMapping("/api/attempts/submit")
    public ResponseEntity<ApiResponse<ResultDto>> submitDirect(@RequestBody SubmitAttemptRequest request,
                                                               @AuthenticationPrincipal UserDetails userDetails) {
        ResultDto result = attemptService.submitAttempt(request.getExamId(), request.getAttemptId(), userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Exam submitted successfully", result));
    }

    @GetMapping("/api/attempts/{attemptId}/result")
    public ResponseEntity<ApiResponse<ResultDto>> getResultDirect(@PathVariable String attemptId,
                                                                  @AuthenticationPrincipal UserDetails userDetails) {
        String role = userDetails != null && !userDetails.getAuthorities().isEmpty()
                ? userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "")
                : "STUDENT";
        String userId = userDetails != null ? userDetails.getUsername() : "";
        ResultDto result = attemptService.getResult(attemptId, userId, role);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
