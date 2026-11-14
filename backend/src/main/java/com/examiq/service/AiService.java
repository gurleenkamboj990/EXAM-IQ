package com.examiq.service;

import com.examiq.dto.request.AiGenerateRequest;
import com.examiq.dto.request.GradeAnswerRequest;
import com.examiq.dto.response.QuestionDto;

import java.util.List;
import java.util.Map;

public interface AiService {
    List<QuestionDto> generateQuestions(AiGenerateRequest request);
    Map<String, Object> gradeAnswer(GradeAnswerRequest request);
    Map<String, Object> generateFeedback(String attemptId);
}
