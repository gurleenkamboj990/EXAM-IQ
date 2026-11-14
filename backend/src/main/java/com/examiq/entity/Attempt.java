package com.examiq.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attempt extends BaseEntity {

    @Column(nullable = false, length = 36)
    private String examId;

    @Column(nullable = false, length = 36)
    private String studentId;

    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;

    @Builder.Default
    private double score = 0.0;

    @Builder.Default
    private int totalMarks = 0;

    @Builder.Default
    private double percentage = 0.0;

    @Builder.Default
    private boolean passed = false;

    @Builder.Default
    private int riskScore = 0;

    @Column(columnDefinition = "TEXT")
    private String violations;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AttemptStatus status = AttemptStatus.STARTED;

    public enum AttemptStatus {
        STARTED, SUBMITTED
    }
}
