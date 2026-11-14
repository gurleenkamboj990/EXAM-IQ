package com.examiq.dto.request;

import com.examiq.entity.Question;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AiGenerateRequest {
    @NotBlank(message = "Topic is required")
    private String topic;

    @NotNull
    @Min(value = 1)
    private int count = 5;

    private Question.Difficulty difficulty;

    private String subject;
}
