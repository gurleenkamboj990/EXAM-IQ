package com.examiq.controller;

import com.examiq.dto.request.CreateQuestionRequest;
import com.examiq.dto.response.ApiResponse;
import com.examiq.dto.response.QuestionDto;
import com.examiq.service.QuestionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@Tag(name = "Questions")
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<QuestionDto>>> getAll(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<QuestionDto> result = questionService.getQuestions(topic, difficulty, type, search,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<QuestionDto>> create(@Valid @RequestBody CreateQuestionRequest request,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        QuestionDto q = questionService.create(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Question created", q));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<QuestionDto>> update(@PathVariable String id,
                                                            @Valid @RequestBody CreateQuestionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Question updated", questionService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        questionService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Question deleted"));
    }
}
