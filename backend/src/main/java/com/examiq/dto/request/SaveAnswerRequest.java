package com.examiq.dto.request;

import lombok.Data;

@Data
public class SaveAnswerRequest {
    private String questionId;
    private Integer selectedOption;
    private String textAnswer;
}
