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
public class CertificateDto {
    private String id;
    private String certificateId;
    private String studentId;
    private String studentName;
    private String examId;
    private String examTitle;
    private String subject;
    private double score;
    private int totalMarks;
    private double percentage;
    private String grade;
    private String attemptId;
    private LocalDateTime issuedAt;
}
