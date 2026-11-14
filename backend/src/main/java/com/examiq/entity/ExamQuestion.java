package com.examiq.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exam_questions", uniqueConstraints = @UniqueConstraint(columnNames = {"exam_id", "question_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamQuestion extends BaseEntity {

    @Column(name = "exam_id", nullable = false, length = 36)
    private String examId;

    @Column(name = "question_id", nullable = false, length = 36)
    private String questionId;

    @Column(name = "question_order")
    private int questionOrder;
}
