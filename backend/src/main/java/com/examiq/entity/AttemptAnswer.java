package com.examiq.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attempt_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptAnswer extends BaseEntity {

    @Column(nullable = false, length = 36)
    private String attemptId;

    @Column(nullable = false, length = 36)
    private String questionId;

    private Integer selectedOption;

    @Column(columnDefinition = "TEXT")
    private String textAnswer;

    private Boolean correct;

    @Builder.Default
    private double marksAwarded = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private GradingStatus gradingStatus = GradingStatus.AUTO_GRADED;

    @Column(columnDefinition = "TEXT")
    private String teacherComment;

    public enum GradingStatus {
        AUTO_GRADED, PENDING_REVIEW, MANUALLY_GRADED
    }
}
