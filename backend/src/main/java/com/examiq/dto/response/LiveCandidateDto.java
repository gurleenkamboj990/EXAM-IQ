package com.examiq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiveCandidateDto {
    private String id;
    private String studentId;
    private String name;
    private String avatar;
    private String email;
    private String examId;
    private int answeredCount;
    private int totalQuestions;
    private int timeRemainingSeconds;
    private int riskScore;
    private String riskLevel;
    private int violationCount;
    private List<Object> violations;
    private String status;
    private String lastPing;
}

