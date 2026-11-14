package com.examiq.controller;

import com.examiq.dto.response.ApiResponse;
import com.examiq.dto.response.LeaderboardDto;
import com.examiq.service.LeaderboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
@Tag(name = "Leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaderboardDto>>> getLeaderboard(
            @RequestParam(required = false) String examId,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "false") boolean overall,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean isOverall = "overall".equalsIgnoreCase(type) || overall || (type == null && (examId == null || examId.isBlank()));
        String currentEmail = userDetails != null ? userDetails.getUsername() : null;
        List<LeaderboardDto> data = leaderboardService.getLeaderboard(examId, isOverall, currentEmail);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
