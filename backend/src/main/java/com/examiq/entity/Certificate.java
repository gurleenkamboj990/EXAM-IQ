package com.examiq.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate extends BaseEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String certificateId;

    @Column(nullable = false, length = 36)
    private String studentId;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false, length = 36)
    private String examId;

    @Column(nullable = false)
    private String examTitle;

    private String subject;

    private double score;
    private int totalMarks;
    private double percentage;
    private String grade;

    @Column(nullable = false, length = 36)
    private String attemptId;

    private LocalDateTime issuedAt;
}
