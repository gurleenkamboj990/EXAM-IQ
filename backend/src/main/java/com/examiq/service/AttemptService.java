package com.examiq.service;

import com.examiq.dto.request.SaveAnswerRequest;
import com.examiq.dto.request.SubmitAttemptRequest;
import com.examiq.dto.response.AttemptDto;
import com.examiq.dto.response.CertificateDto;
import com.examiq.dto.response.ResultDto;
import com.examiq.entity.*;
import com.examiq.exception.BadRequestException;
import com.examiq.exception.ResourceNotFoundException;
import com.examiq.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final GradingService gradingService;
    private final CertificateService certificateService;
    private final ObjectMapper objectMapper;

    @Transactional
    public AttemptDto startAttempt(String examId, String studentId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", examId));

        if (!exam.isPublished()) throw new BadRequestException("Exam is not available");

        boolean alreadySubmitted = attemptRepository.existsByExamIdAndStudentIdAndStatus(
                examId, studentId, Attempt.AttemptStatus.SUBMITTED);
        if (alreadySubmitted) throw new BadRequestException("You have already completed this exam");

        Optional<Attempt> existing = attemptRepository.findByExamIdAndStudentIdAndStatus(
                examId, studentId, Attempt.AttemptStatus.STARTED);
        if (existing.isPresent()) return toDto(existing.get());

        Attempt attempt = Attempt.builder()
                .examId(examId)
                .studentId(studentId)
                .startedAt(LocalDateTime.now())
                .status(Attempt.AttemptStatus.STARTED)
                .totalMarks(exam.getTotalMarks())
                .build();
        attemptRepository.save(attempt);
        log.info("Student {} started attempt {} for exam {}", studentId, attempt.getId(), examId);
        return toDto(attempt);
    }

    @Transactional
    public AttemptDto saveAnswers(String examId, String attemptId, String studentId, Object answers) {
        Attempt attempt = getAttemptForStudent(attemptId, studentId);
        if (attempt.getStatus() == Attempt.AttemptStatus.SUBMITTED) {
            throw new BadRequestException("Attempt already submitted");
        }
        processAndSaveAnswers(attemptId, answers);
        return toDto(attempt);
    }

    @Transactional
    public ResultDto submitAttempt(String examId, String attemptId, String studentId,
                                   SubmitAttemptRequest request) {
        Attempt attempt = getAttemptForStudent(attemptId, studentId);
        if (attempt.getStatus() == Attempt.AttemptStatus.SUBMITTED) {
            throw new BadRequestException("Attempt already submitted");
        }

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", examId));

        if (request.getAnswers() != null) {
            processAndSaveAnswers(attemptId, request.getAnswers());
        }

        if (request.getViolations() != null) {
            try {
                if (request.getViolations() instanceof String) {
                    attempt.setViolations((String) request.getViolations());
                } else {
                    attempt.setViolations(objectMapper.writeValueAsString(request.getViolations()));
                }
            } catch (Exception e) {
                attempt.setViolations(request.getViolations().toString());
            }
        }

        attempt.setRiskScore(request.getRiskScore());
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setStatus(Attempt.AttemptStatus.SUBMITTED);
        attemptRepository.save(attempt);

        List<ExamQuestion> eqs = examQuestionRepository.findByExamIdOrderByQuestionOrder(examId);
        List<String> questionIds = eqs.stream().map(ExamQuestion::getQuestionId).collect(Collectors.toList());
        List<Question> questions = questionRepository.findAllByIdIn(questionIds);
        List<AttemptAnswer> savedAnswers = attemptAnswerRepository.findByAttemptId(attemptId);

        double passingPct = exam.getPassingPercentage();
        Attempt graded = gradingService.autoGrade(attempt, questions, savedAnswers,
                exam.isNegativeMarking(), exam.getNegativeMarkValue());

        graded.setPassed(graded.getPercentage() >= passingPct);
        attemptRepository.save(graded);

        // Auto-create certificate if passed
        if (graded.isPassed()) {
            certificateService.generateIfNotExists(graded);
        }

        return buildResult(graded, exam, questions, savedAnswers, studentId);
    }

    public List<AttemptDto> getMyAttempts(String studentId) {
        return attemptRepository.findByStudentIdOrderByCreatedAtDesc(studentId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ResultDto> getMyResults(String studentId) {
        List<Attempt> submitted = attemptRepository.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
                .filter(a -> a.getStatus() == Attempt.AttemptStatus.SUBMITTED)
                .collect(Collectors.toList());

        return submitted.stream().map(a -> {
            Exam exam = examRepository.findById(a.getExamId()).orElse(null);
            String title = exam != null ? exam.getTitle() : "Examination";
            String subject = exam != null ? exam.getSubject() : "General";
            CertificateDto cert = a.isPassed() ? certificateService.getCertificateByAttempt(a.getId()) : null;

            return ResultDto.builder()
                    .id(a.getId())
                    .attemptId(a.getId())
                    .examId(a.getExamId())
                    .examTitle(title)
                    .subject(subject)
                    .studentId(studentId)
                    .score(a.getScore())
                    .totalMarks(a.getTotalMarks())
                    .percentage(a.getPercentage())
                    .passed(a.isPassed())
                    .grade(computeGrade(a.getPercentage()))
                    .submittedAt(a.getSubmittedAt())
                    .riskScore(a.getRiskScore())
                    .certificate(cert)
                    .build();
        }).collect(Collectors.toList());
    }

    public ResultDto getResult(String attemptId, String userId, String role) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt", attemptId));

        if ("STUDENT".equals(role) && !attempt.getStudentId().equals(userId)) {
            throw new BadRequestException("Not authorized to view this result");
        }

        Exam exam = examRepository.findById(attempt.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam", attempt.getExamId()));

        List<ExamQuestion> eqs = examQuestionRepository.findByExamIdOrderByQuestionOrder(attempt.getExamId());
        List<String> questionIds = eqs.stream().map(ExamQuestion::getQuestionId).collect(Collectors.toList());
        List<Question> questions = questionRepository.findAllByIdIn(questionIds);
        List<AttemptAnswer> answers = attemptAnswerRepository.findByAttemptId(attemptId);

        return buildResult(attempt, exam, questions, answers, attempt.getStudentId());
    }

    private ResultDto buildResult(Attempt attempt, Exam exam, List<Question> questions,
                                   List<AttemptAnswer> answers, String studentId) {
        Map<String, AttemptAnswer> answerMap = answers.stream()
                .collect(Collectors.toMap(AttemptAnswer::getQuestionId, Function.identity(),
                        (a, b) -> a));

        String studentName = userRepository.findById(studentId)
                .map(User::getName).orElse("Unknown");

        String grade = computeGrade(attempt.getPercentage());

        int correctCount = 0;
        int incorrectCount = 0;
        int skippedCount = 0;
        int pendingCount = 0;

        List<ResultDto.QuestionReviewDto> reviews = new ArrayList<>();

        for (Question q : questions) {
            AttemptAnswer ans = answerMap.get(q.getId());
            boolean isSkipped = (ans == null || (ans.getSelectedOption() == null && (ans.getTextAnswer() == null || ans.getTextAnswer().isBlank())));
            Boolean isCorrect = ans != null ? ans.getCorrect() : null;
            double marksAwarded = ans != null ? ans.getMarksAwarded() : 0.0;

            if (isSkipped) {
                skippedCount++;
            } else if (Boolean.TRUE.equals(isCorrect)) {
                correctCount++;
            } else if (Boolean.FALSE.equals(isCorrect)) {
                incorrectCount++;
            } else {
                pendingCount++;
            }

            Object studentAns = null;
            if (ans != null) {
                if (ans.getSelectedOption() != null) {
                    studentAns = ans.getSelectedOption();
                } else if (ans.getTextAnswer() != null) {
                    studentAns = ans.getTextAnswer();
                }
            }

            String feedback;
            if (isSkipped) {
                feedback = "Question was left unattempted.";
            } else if (Boolean.TRUE.equals(isCorrect)) {
                feedback = "Correct answer!";
            } else if (Boolean.FALSE.equals(isCorrect)) {
                feedback = q.getExplanation() != null ? q.getExplanation() : "Incorrect answer.";
            } else {
                feedback = "Submitted. Evaluation pending.";
            }

            reviews.add(ResultDto.QuestionReviewDto.builder()
                    .questionId(q.getId())
                    .questionText(q.getText())
                    .type(q.getType().name())
                    .questionType(q.getType().name())
                    .options(q.getOptions())
                    .correctAnswer(q.getCorrectAnswer())
                    .selectedOption(ans != null ? ans.getSelectedOption() : null)
                    .textAnswer(ans != null ? ans.getTextAnswer() : null)
                    .studentAnswer(studentAns)
                    .isCorrect(isCorrect)
                    .isSkipped(isSkipped)
                    .marksAwarded(marksAwarded)
                    .marks(q.getMarks())
                    .maxMarks(q.getMarks())
                    .explanation(q.getExplanation())
                    .feedback(feedback)
                    .gradingStatus(ans != null ? ans.getGradingStatus() : null)
                    .teacherComment(ans != null ? ans.getTeacherComment() : null)
                    .build());
        }

        ResultDto.ResultSummaryDto summary = ResultDto.ResultSummaryDto.builder()
                .totalQuestions(questions.size())
                .correctCount(correctCount)
                .incorrectCount(incorrectCount)
                .skippedCount(skippedCount)
                .pendingCount(pendingCount)
                .build();

        CertificateDto certDto = null;
        if (attempt.isPassed()) {
            certDto = certificateService.getCertificateByAttempt(attempt.getId());
        }

        List<Object> parsedViolations = new ArrayList<>();
        if (attempt.getViolations() != null && !attempt.getViolations().isBlank()) {
            try {
                parsedViolations = objectMapper.readValue(attempt.getViolations(), new TypeReference<List<Object>>() {});
            } catch (Exception e) {
                parsedViolations.add(attempt.getViolations());
            }
        }

        String riskLevel = attempt.getRiskScore() >= 70 ? "HIGH" : (attempt.getRiskScore() >= 30 ? "MEDIUM" : "LOW");

        return ResultDto.builder()
                .id(attempt.getId())
                .attemptId(attempt.getId())
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .subject(exam.getSubject() != null ? exam.getSubject() : "Computer Science")
                .studentId(studentId)
                .studentName(studentName)
                .score(attempt.getScore())
                .totalMarks(attempt.getTotalMarks())
                .percentage(attempt.getPercentage())
                .passed(attempt.isPassed())
                .grade(grade)
                .submittedAt(attempt.getSubmittedAt())
                .riskScore(attempt.getRiskScore())
                .riskLevel(riskLevel)
                .violations(parsedViolations)
                .summary(summary)
                .answers(reviews)
                .questionReview(reviews)
                .certificate(certDto)
                .build();
    }

    private void processAndSaveAnswers(String attemptId, Object answersObj) {
        if (answersObj == null) return;

        if (answersObj instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) answersObj;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                String questionId = String.valueOf(entry.getKey());
                Object val = entry.getValue();
                if (val == null) continue;

                Optional<AttemptAnswer> existing = attemptAnswerRepository.findByAttemptIdAndQuestionId(attemptId, questionId);
                AttemptAnswer aa = existing.orElseGet(() -> AttemptAnswer.builder().attemptId(attemptId).questionId(questionId).build());

                if (val instanceof Number) {
                    aa.setSelectedOption(((Number) val).intValue());
                } else {
                    String strVal = val.toString().trim();
                    try {
                        aa.setSelectedOption(Integer.parseInt(strVal));
                    } catch (NumberFormatException e) {
                        aa.setTextAnswer(strVal);
                    }
                }
                attemptAnswerRepository.save(aa);
            }
        } else if (answersObj instanceof List) {
            List<?> list = (List<?>) answersObj;
            for (Object item : list) {
                if (item instanceof Map) {
                    Map<?, ?> m = (Map<?, ?>) item;
                    String qId = (String) m.get("questionId");
                    if (qId == null) continue;

                    Optional<AttemptAnswer> existing = attemptAnswerRepository.findByAttemptIdAndQuestionId(attemptId, qId);
                    AttemptAnswer aa = existing.orElseGet(() -> AttemptAnswer.builder().attemptId(attemptId).questionId(qId).build());

                    if (m.get("selectedOption") != null) {
                        aa.setSelectedOption(((Number) m.get("selectedOption")).intValue());
                    }
                    if (m.get("textAnswer") != null) {
                        aa.setTextAnswer((String) m.get("textAnswer"));
                    }
                    attemptAnswerRepository.save(aa);
                } else if (item instanceof SaveAnswerRequest) {
                    SaveAnswerRequest ar = (SaveAnswerRequest) item;
                    if (ar.getQuestionId() == null) continue;
                    Optional<AttemptAnswer> existing = attemptAnswerRepository.findByAttemptIdAndQuestionId(attemptId, ar.getQuestionId());
                    AttemptAnswer aa = existing.orElseGet(() -> AttemptAnswer.builder().attemptId(attemptId).questionId(ar.getQuestionId()).build());
                    aa.setSelectedOption(ar.getSelectedOption());
                    aa.setTextAnswer(ar.getTextAnswer());
                    attemptAnswerRepository.save(aa);
                }
            }
        }
    }

    private Attempt getAttemptForStudent(String attemptId, String studentId) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt", attemptId));
        if (!attempt.getStudentId().equals(studentId)) {
            throw new BadRequestException("Not authorized to access this attempt");
        }
        return attempt;
    }

    private String computeGrade(double percentage) {
        if (percentage >= 90) return "A+";
        if (percentage >= 80) return "A";
        if (percentage >= 70) return "B";
        if (percentage >= 60) return "C";
        if (percentage >= 50) return "D";
        return "F";
    }

    public AttemptDto toDto(Attempt a) {
        String examTitle = "";
        String subject = "";
        if (a.getExamId() != null) {
            Optional<Exam> examOpt = examRepository.findById(a.getExamId());
            if (examOpt.isPresent()) {
                examTitle = examOpt.get().getTitle();
                subject = examOpt.get().getSubject();
            }
        }

        String riskLevel = a.getRiskScore() >= 70 ? "HIGH" : (a.getRiskScore() >= 30 ? "MEDIUM" : "LOW");

        return AttemptDto.builder()
                .id(a.getId())
                .attemptId(a.getId())
                .examId(a.getExamId())
                .examTitle(examTitle)
                .subject(subject)
                .studentId(a.getStudentId())
                .startedAt(a.getStartedAt())
                .submittedAt(a.getSubmittedAt())
                .score(a.getScore())
                .totalMarks(a.getTotalMarks())
                .percentage(a.getPercentage())
                .passed(a.isPassed())
                .riskScore(a.getRiskScore())
                .riskLevel(riskLevel)
                .violations(a.getViolations())
                .status(a.getStatus())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
