package com.examiq.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "exams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam extends BaseEntity {

    @Column(nullable = false)
    private String title;

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(nullable = false)
    private int durationMinutes;

    @Builder.Default
    private double passingPercentage = 50.0;

    @Builder.Default
    private boolean negativeMarking = false;

    @Builder.Default
    private double negativeMarkValue = 0.25;

    @Builder.Default
    private boolean shuffleQuestions = false;

    @Builder.Default
    private boolean adaptiveMode = false;

    @Builder.Default
    private boolean proctoringEnabled = false;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Builder.Default
    private int totalMarks = 0;

    @Column(length = 36)
    private String createdByUserId;

    @Builder.Default
    private boolean published = true;
}
