package com.examiq.dto.response;

import com.examiq.entity.Attempt;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptDto {
    private String id;
    private String attemptId;
    private String examId;
    private String examTitle;
    private String subject;
    private String studentId;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private double score;
    private int totalMarks;
    private double percentage;
    private boolean passed;
    private int riskScore;
    private String riskLevel;
    private String violations;
    private Attempt.AttemptStatus status;
    private LocalDateTime createdAt;

    public String getAttemptId() {
        return id != null ? id : attemptId;
    }
}
