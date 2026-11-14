package com.examiq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    private String reviewId;
    private String examId;
    private String examTitle;
    private String studentId;
    private String studentName;
    private String studentAvatar;
    private String questionId;
    private String questionText;
    private int maxMarks;
    private String modelAnswer;
    private String studentAnswer;
    private Double aiScore;
    private Integer aiConfidence;
    private String aiFeedback;
    private Double teacherScore;
    private String teacherComment;
    private String status;
    private LocalDateTime submittedAt;
}

