package com.examiq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardDto {
    private int rank;
    private String studentId;
    private String studentName;
    private String name;
    private String avatar;
    private String examId;
    private double score;
    private int totalMarks;
    private double percentage;
    private double averageScore;
    private int examsTaken;
    private int examsCompleted;
    private String attemptId;
    private String badge;
    private boolean isCurrentUser;
    private String submittedAt;
    private int riskScore;
    private boolean passed;

    public String getName() {
        return name != null ? name : studentName;
    }
}
