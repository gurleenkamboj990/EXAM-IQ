package com.examiq.controller;

import com.examiq.dto.request.AiGenerateRequest;
import com.examiq.dto.request.GradeAnswerRequest;
import com.examiq.dto.response.ApiResponse;
import com.examiq.dto.response.QuestionDto;
import com.examiq.service.AiService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI")
public class AiController {

    private final AiService aiService;

    @PostMapping("/generate-questions")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> generateQuestions(
            @Valid @RequestBody AiGenerateRequest request) {
        List<QuestionDto> questions = aiService.generateQuestions(request);
        return ResponseEntity.ok(ApiResponse.success("Questions generated", questions));
    }

    @PostMapping("/grade-answer")
    public ResponseEntity<ApiResponse<Map<String, Object>>> gradeAnswer(
            @RequestBody GradeAnswerRequest request) {
        Map<String, Object> result = aiService.gradeAnswer(request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/feedback/{attemptId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFeedback(
            @PathVariable String attemptId) {
        Map<String, Object> feedback = aiService.generateFeedback(attemptId);
        return ResponseEntity.ok(ApiResponse.success(feedback));
    }

    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateFeedback(
            @RequestBody Map<String, String> body) {
        String attemptId = body.get("attemptId");
        Map<String, Object> feedback = aiService.generateFeedback(attemptId);
        return ResponseEntity.ok(ApiResponse.success(feedback));
    }
}
