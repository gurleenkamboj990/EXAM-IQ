package com.examiq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamDto {
    private String id;
    private String title;
    private String subject;
    private String description;
    private String instructions;
    private int durationMinutes;
    private double passingPercentage;
    private boolean negativeMarking;
    private double negativeMarkValue;
    private boolean shuffleQuestions;
    private boolean adaptiveMode;
    private boolean proctoring;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int totalMarks;
    private String createdBy;
    private String teacherName;
    private LocalDateTime createdAt;
    private boolean published;
    private List<String> questionIds;
    private int questionCount;
    private String status;
    private List<QuestionDto> questions;
}
