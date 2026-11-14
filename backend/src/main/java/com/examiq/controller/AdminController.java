package com.examiq.controller;

import com.examiq.dto.request.CreateUserRequest;
import com.examiq.dto.response.AdminStatsDto;
import com.examiq.dto.response.ApiResponse;
import com.examiq.dto.response.ExamDto;
import com.examiq.dto.response.UserDto;
import com.examiq.entity.User;
import com.examiq.exception.BadRequestException;
import com.examiq.service.AdminService;
import com.examiq.service.ExamService;
import com.examiq.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin")
public class AdminController {

    private final UserService userService;
    private final ExamService examService;
    private final AdminService adminService;

    @GetMapping("/ping")
    public ResponseEntity<ApiResponse<String>> ping() {
        return ResponseEntity.ok(ApiResponse.success("pong"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDto created = userService.createUser(request);
        return ResponseEntity.ok(ApiResponse.success("User created successfully", created));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(@PathVariable String id,
                                                            @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUser(id, request)));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserDto>> updateUserRole(@PathVariable String id,
                                                               @RequestBody Map<String, String> body) {
        String roleStr = body.get("role");
        if (roleStr == null || roleStr.isBlank()) {
            throw new BadRequestException("Role is required");
        }
        try {
            User.Role role = User.Role.valueOf(roleStr.toUpperCase());
            return ResponseEntity.ok(ApiResponse.success("User role updated", userService.updateRole(id, role)));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + roleStr);
        }
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(@PathVariable String id,
                                                                 @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        if (statusStr == null || statusStr.isBlank()) {
            throw new BadRequestException("Status is required");
        }
        boolean active = "ACTIVE".equalsIgnoreCase(statusStr);
        return ResponseEntity.ok(ApiResponse.success("User status updated", userService.updateStatus(id, active)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable String id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        String currentEmail = userDetails != null ? userDetails.getUsername() : null;
        userService.deleteUser(id, currentEmail);
        return ResponseEntity.ok(ApiResponse.success("User deactivated"));
    }

    @GetMapping("/exams")
    public ResponseEntity<ApiResponse<List<ExamDto>>> getExams() {
        return ResponseEntity.ok(ApiResponse.success(examService.getAllExams("ADMIN", null)));
    }

    @DeleteMapping("/exams/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExam(@PathVariable String id) {
        examService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Exam deleted successfully"));
    }
}
