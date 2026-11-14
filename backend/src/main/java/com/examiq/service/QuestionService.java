package com.examiq.service;

import com.examiq.dto.request.CreateQuestionRequest;
import com.examiq.dto.response.QuestionDto;
import com.examiq.entity.Question;
import com.examiq.exception.ResourceNotFoundException;
import com.examiq.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;

    public Page<QuestionDto> getQuestions(String topic, String difficulty, String type, String search, Pageable pageable) {
        Question.Difficulty diff = difficulty != null ? Question.Difficulty.valueOf(difficulty.toUpperCase()) : null;
        Question.QuestionType qType = type != null ? Question.QuestionType.valueOf(type.toUpperCase()) : null;
        return questionRepository.findWithFilters(topic, diff, qType, search, pageable)
                .map(QuestionDto::from);
    }

    public QuestionDto getById(String id) {
        return QuestionDto.from(questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", id)));
    }

    public QuestionDto create(CreateQuestionRequest req, String createdByUserId) {
        Question q = Question.builder()
                .text(req.getText())
                .type(req.getType())
                .topic(req.getTopic())
                .difficulty(req.getDifficulty())
                .marks(req.getMarks())
                .options(req.getOptions() != null ? req.getOptions() : List.of())
                .correctAnswer(req.getCorrectAnswer())
                .explanation(req.getExplanation())
                .createdByUserId(createdByUserId)
                .build();
        return QuestionDto.from(questionRepository.save(q));
    }

    public QuestionDto update(String id, CreateQuestionRequest req) {
        Question q = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", id));
        if (req.getText() != null) q.setText(req.getText());
        if (req.getType() != null) q.setType(req.getType());
        if (req.getTopic() != null) q.setTopic(req.getTopic());
        if (req.getDifficulty() != null) q.setDifficulty(req.getDifficulty());
        if (req.getMarks() > 0) q.setMarks(req.getMarks());
        if (req.getOptions() != null) q.setOptions(req.getOptions());
        if (req.getCorrectAnswer() != null) q.setCorrectAnswer(req.getCorrectAnswer());
        if (req.getExplanation() != null) q.setExplanation(req.getExplanation());
        return QuestionDto.from(questionRepository.save(q));
    }

    public void delete(String id) {
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Question", id);
        }
        questionRepository.deleteById(id);
    }
}
