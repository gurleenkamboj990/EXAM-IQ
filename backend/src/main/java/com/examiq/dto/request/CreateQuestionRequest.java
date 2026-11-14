package com.examiq.dto.request;

import com.examiq.entity.Question;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateQuestionRequest {
    @NotBlank(message = "Question text is required")
    private String text;

    @NotNull(message = "Question type is required")
    private Question.QuestionType type;

    private String topic;

    private Question.Difficulty difficulty;

    @Min(value = 1, message = "Marks must be at least 1")
    private int marks = 1;

    private List<String> options;

    private Integer correctAnswer;

    private String explanation;
}
