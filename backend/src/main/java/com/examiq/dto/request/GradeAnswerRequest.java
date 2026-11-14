package com.examiq.dto.request;

import lombok.Data;

@Data
public class GradeAnswerRequest {
    private String questionId;
    private String answer;
}
