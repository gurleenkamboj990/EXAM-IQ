package com.examiq.dto.request;

import lombok.Data;

@Data
public class SubmitAttemptRequest {
    private Object answers;
    private Object violations;
    private int riskScore;
    private String riskLevel;
    private int timeSpentSeconds;
    private String studentId;
    private String studentName;
    private String examId;
    private String attemptId;
}
