package com.examiq.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateExamRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String subject;
    private String description;
    private String instructions;

    @Min(value = 1, message = "Duration must be at least 1 minute")
    private int durationMinutes = 60;

    private double passingPercentage = 50.0;
    private boolean negativeMarking = false;
    private double negativeMarkValue = 0.25;
    private boolean shuffleQuestions = false;
    private boolean adaptiveMode = false;
    private boolean proctoringEnabled = false;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private List<String> questionIds;

    private boolean published = true;
}
