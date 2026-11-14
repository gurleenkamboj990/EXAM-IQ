package com.examiq.service;

import com.examiq.dto.request.CreateExamRequest;
import com.examiq.dto.response.ExamDto;
import com.examiq.dto.response.QuestionDto;
import com.examiq.entity.Exam;
import com.examiq.entity.ExamQuestion;
import com.examiq.entity.Question;
import com.examiq.entity.User;
import com.examiq.exception.BadRequestException;
import com.examiq.exception.ResourceNotFoundException;
import com.examiq.repository.ExamQuestionRepository;
import com.examiq.repository.ExamRepository;
import com.examiq.repository.QuestionRepository;
import com.examiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    public List<ExamDto> getAllExams(String role, String userId) {
        List<Exam> exams;
        if ("STUDENT".equals(role)) {
            exams = examRepository.findByPublishedTrue();
        } else {
            exams = examRepository.findAll();
        }
        return exams.stream().map(this::toDto).collect(Collectors.toList());
    }

    public ExamDto getById(String id, String role) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", id));
        if ("STUDENT".equals(role) && !exam.isPublished()) {
            throw new ResourceNotFoundException("Exam", id);
        }
        ExamDto dto = toDto(exam);
        if (dto.getQuestionIds() != null && !dto.getQuestionIds().isEmpty()) {
            List<Question> qs = questionRepository.findAllByIdIn(dto.getQuestionIds());
            Map<String, Question> map = qs.stream().collect(Collectors.toMap(Question::getId, q -> q, (a, b) -> a));
            List<QuestionDto> qDtos = dto.getQuestionIds().stream()
                    .map(map::get)
                    .filter(Objects::nonNull)
                    .map(QuestionDto::from)
                    .collect(Collectors.toList());
            dto.setQuestions(qDtos);
        } else {
            dto.setQuestions(List.of());
        }
        return dto;
    }

    @Transactional
    public ExamDto create(CreateExamRequest req, String createdByUserId) {
        List<String> questionIds = req.getQuestionIds() != null ? req.getQuestionIds() : List.of();
        int totalMarks = computeTotalMarks(questionIds);

        Exam exam = Exam.builder()
                .title(req.getTitle())
                .subject(req.getSubject())
                .description(req.getDescription())
                .instructions(req.getInstructions())
                .durationMinutes(req.getDurationMinutes())
                .passingPercentage(req.getPassingPercentage())
                .negativeMarking(req.isNegativeMarking())
                .negativeMarkValue(req.getNegativeMarkValue())
                .shuffleQuestions(req.isShuffleQuestions())
                .adaptiveMode(req.isAdaptiveMode())
                .proctoringEnabled(req.isProctoringEnabled())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .totalMarks(totalMarks)
                .createdByUserId(createdByUserId)
                .published(req.isPublished())
                .build();

        examRepository.save(exam);
        saveExamQuestions(exam.getId(), questionIds);
        return toDto(exam);
    }

    @Transactional
    public ExamDto update(String id, CreateExamRequest req, String userId, String role) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", id));

        if ("TEACHER".equals(role) && !exam.getCreatedByUserId().equals(userId)) {
            throw new BadRequestException("Not authorized to update this exam");
        }

        if (req.getTitle() != null) exam.setTitle(req.getTitle());
        if (req.getSubject() != null) exam.setSubject(req.getSubject());
        if (req.getDescription() != null) exam.setDescription(req.getDescription());
        if (req.getInstructions() != null) exam.setInstructions(req.getInstructions());
        if (req.getDurationMinutes() > 0) exam.setDurationMinutes(req.getDurationMinutes());
        exam.setPassingPercentage(req.getPassingPercentage());
        exam.setNegativeMarking(req.isNegativeMarking());
        exam.setNegativeMarkValue(req.getNegativeMarkValue());
        exam.setShuffleQuestions(req.isShuffleQuestions());
        exam.setAdaptiveMode(req.isAdaptiveMode());
        exam.setProctoringEnabled(req.isProctoringEnabled());
        if (req.getStartTime() != null) exam.setStartTime(req.getStartTime());
        if (req.getEndTime() != null) exam.setEndTime(req.getEndTime());
        exam.setPublished(req.isPublished());

        if (req.getQuestionIds() != null) {
            examQuestionRepository.deleteByExamId(id);
            saveExamQuestions(id, req.getQuestionIds());
            exam.setTotalMarks(computeTotalMarks(req.getQuestionIds()));
        }

        examRepository.save(exam);
        return toDto(exam);
    }

    public void delete(String id) {
        if (!examRepository.existsById(id)) throw new ResourceNotFoundException("Exam", id);
        examQuestionRepository.deleteByExamId(id);
        examRepository.deleteById(id);
    }

    @Transactional
    public ExamDto duplicate(String id, String userId) {
        Exam original = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", id));

        LocalDateTime now = LocalDateTime.now();
        Exam copy = Exam.builder()
                .title("Copy of " + original.getTitle())
                .subject(original.getSubject())
                .description(original.getDescription())
                .instructions(original.getInstructions())
                .durationMinutes(original.getDurationMinutes())
                .passingPercentage(original.getPassingPercentage())
                .negativeMarking(original.isNegativeMarking())
                .negativeMarkValue(original.getNegativeMarkValue())
                .shuffleQuestions(original.isShuffleQuestions())
                .adaptiveMode(original.isAdaptiveMode())
                .proctoringEnabled(original.isProctoringEnabled())
                .startTime(now.plusDays(1))
                .endTime(now.plusDays(2))
                .totalMarks(original.getTotalMarks())
                .createdByUserId(userId)
                .published(false)
                .build();

        examRepository.save(copy);

        List<ExamQuestion> originalQuestions = examQuestionRepository.findByExamIdOrderByQuestionOrder(id);
        List<ExamQuestion> copyQuestions = originalQuestions.stream()
                .map(eq -> ExamQuestion.builder()
                        .examId(copy.getId())
                        .questionId(eq.getQuestionId())
                        .questionOrder(eq.getQuestionOrder())
                        .build())
                .collect(Collectors.toList());
        examQuestionRepository.saveAll(copyQuestions);

        return toDto(copy);
    }

    private void saveExamQuestions(String examId, List<String> questionIds) {
        List<ExamQuestion> eqs = new ArrayList<>();
        for (int i = 0; i < questionIds.size(); i++) {
            eqs.add(ExamQuestion.builder()
                    .examId(examId)
                    .questionId(questionIds.get(i))
                    .questionOrder(i)
                    .build());
        }
        examQuestionRepository.saveAll(eqs);
    }

    private int computeTotalMarks(List<String> questionIds) {
        if (questionIds == null || questionIds.isEmpty()) return 0;
        List<Question> qs = questionRepository.findAllByIdIn(questionIds);
        return qs.stream().mapToInt(Question::getMarks).sum();
    }

    public ExamDto toDto(Exam exam) {
        List<ExamQuestion> eqs = examQuestionRepository.findByExamIdOrderByQuestionOrder(exam.getId());
        List<String> questionIds = eqs.stream().map(ExamQuestion::getQuestionId).collect(Collectors.toList());

        String teacherName = "";
        if (exam.getCreatedByUserId() != null) {
            teacherName = userRepository.findById(exam.getCreatedByUserId())
                    .map(User::getName).orElse("");
        }

        return ExamDto.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .subject(exam.getSubject())
                .description(exam.getDescription())
                .instructions(exam.getInstructions())
                .durationMinutes(exam.getDurationMinutes())
                .passingPercentage(exam.getPassingPercentage())
                .negativeMarking(exam.isNegativeMarking())
                .negativeMarkValue(exam.getNegativeMarkValue())
                .shuffleQuestions(exam.isShuffleQuestions())
                .adaptiveMode(exam.isAdaptiveMode())
                .proctoring(exam.isProctoringEnabled())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .totalMarks(exam.getTotalMarks())
                .createdBy(exam.getCreatedByUserId())
                .teacherName(teacherName)
                .createdAt(exam.getCreatedAt())
                .published(exam.isPublished())
                .questionIds(questionIds)
                .questionCount(questionIds.size())
                .status(computeStatus(exam))
                .build();
    }

    private String computeStatus(Exam exam) {
        LocalDateTime now = LocalDateTime.now();
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) return "UPCOMING";
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) return "COMPLETED";
        return "LIVE";
    }
}
