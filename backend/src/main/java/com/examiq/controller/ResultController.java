package com.examiq.controller;

import com.examiq.dto.response.ApiResponse;
import com.examiq.dto.response.ResultDto;
import com.examiq.service.AttemptService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
@Tag(name = "Results")
public class ResultController {

    private final AttemptService attemptService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResultDto>>> getMyResults(
            @RequestParam(required = false) String studentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String targetStudentId = (studentId != null && !studentId.isBlank())
                ? studentId
                : (userDetails != null ? userDetails.getUsername() : "");
        List<ResultDto> results = attemptService.getMyResults(targetStudentId);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ResultDto>>> getMyResultsAlias(
            @RequestParam(required = false) String studentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return getMyResults(studentId, userDetails);
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<ApiResponse<ResultDto>> getResult(@PathVariable String attemptId,
                                                             @AuthenticationPrincipal UserDetails userDetails) {
        String role = userDetails != null && !userDetails.getAuthorities().isEmpty()
                ? userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "")
                : "STUDENT";
        String userId = userDetails != null ? userDetails.getUsername() : "";
        ResultDto result = attemptService.getResult(attemptId, userId, role);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
