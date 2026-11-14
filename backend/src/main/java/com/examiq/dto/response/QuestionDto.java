package com.examiq.dto.response;

import com.examiq.entity.Question;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {
    private String id;
    private String text;
    private Question.QuestionType type;
    private String topic;
    private Question.Difficulty difficulty;
    private int marks;
    private List<String> options;
    private Integer correctAnswer;
    private String explanation;
    private String createdByUserId;
    private LocalDateTime createdAt;

    public static QuestionDto from(Question q) {
        return QuestionDto.builder()
                .id(q.getId())
                .text(q.getText())
                .type(q.getType())
                .topic(q.getTopic())
                .difficulty(q.getDifficulty())
                .marks(q.getMarks())
                .options(q.getOptions())
                .correctAnswer(q.getCorrectAnswer())
                .explanation(q.getExplanation())
                .createdByUserId(q.getCreatedByUserId())
                .createdAt(q.getCreatedAt())
                .build();
    }
}
