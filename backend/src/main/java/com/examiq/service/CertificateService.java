package com.examiq.service;

import com.examiq.dto.response.CertificateDto;
import com.examiq.entity.Attempt;
import com.examiq.entity.Certificate;
import com.examiq.entity.Exam;
import com.examiq.entity.User;
import com.examiq.repository.AttemptRepository;
import com.examiq.repository.CertificateRepository;
import com.examiq.repository.ExamRepository;
import com.examiq.repository.UserRepository;
import com.examiq.util.CertificateIdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final AttemptRepository attemptRepository;
    private final ExamRepository examRepository;
    private final UserRepository userRepository;

    @Transactional
    public CertificateDto generateIfNotExists(Attempt attempt) {
        return certificateRepository.findByAttemptId(attempt.getId())
                .map(this::toDto)
                .orElseGet(() -> {
                    Exam exam = examRepository.findById(attempt.getExamId()).orElse(null);
                    User student = userRepository.findById(attempt.getStudentId()).orElse(null);
                    if (exam == null || student == null) return null;

                    String certId = generateUniqueCertId();
                    String grade = computeGrade(attempt.getPercentage());

                    Certificate cert = Certificate.builder()
                            .certificateId(certId)
                            .studentId(attempt.getStudentId())
                            .studentName(student.getName())
                            .examId(exam.getId())
                            .examTitle(exam.getTitle())
                            .subject(exam.getSubject() != null ? exam.getSubject() : "Computer Science")
                            .score(attempt.getScore())
                            .totalMarks(attempt.getTotalMarks())
                            .percentage(attempt.getPercentage())
                            .grade(grade)
                            .attemptId(attempt.getId())
                            .issuedAt(LocalDateTime.now())
                            .build();
                    certificateRepository.save(cert);
                    log.info("Generated certificate {} for student {} on exam {}", certId, student.getName(), exam.getTitle());
                    return toDto(cert);
                });
    }

    @Transactional
    public CertificateDto createManual(CertificateDto req, String currentUserId) {
        if (req.getAttemptId() != null) {
            Optional<Certificate> existing = certificateRepository.findByAttemptId(req.getAttemptId());
            if (existing.isPresent()) return toDto(existing.get());
        }

        String studentId = req.getStudentId() != null ? req.getStudentId() : currentUserId;
        String studentName = req.getStudentName();
        if (studentName == null && studentId != null) {
            studentName = userRepository.findById(studentId).map(User::getName).orElse("Student");
        }

        String certId = generateUniqueCertId();
        String grade = req.getGrade() != null ? req.getGrade() : computeGrade(req.getPercentage());

        Certificate cert = Certificate.builder()
                .certificateId(certId)
                .studentId(studentId)
                .studentName(studentName != null ? studentName : "Student")
                .examId(req.getExamId() != null ? req.getExamId() : "exam_manual")
                .examTitle(req.getExamTitle() != null ? req.getExamTitle() : "Assessment")
                .subject(req.getSubject() != null ? req.getSubject() : "General")
                .score(req.getScore())
                .totalMarks(req.getTotalMarks())
                .percentage(req.getPercentage())
                .grade(grade)
                .attemptId(req.getAttemptId() != null ? req.getAttemptId() : "att_" + System.currentTimeMillis())
                .issuedAt(LocalDateTime.now())
                .build();
        certificateRepository.save(cert);
        return toDto(cert);
    }

    public CertificateDto getCertificateByAttempt(String attemptId) {
        return certificateRepository.findByAttemptId(attemptId)
                .map(this::toDto)
                .orElse(null);
    }

    public CertificateDto verify(String certificateId) {
        if (certificateId == null || certificateId.isBlank()) return null;
        return certificateRepository.findByCertificateId(certificateId)
                .or(() -> certificateRepository.findById(certificateId))
                .map(this::toDto)
                .orElse(null);
    }

    public List<CertificateDto> getMyCertificates(String studentIdOrEmail) {
        List<Certificate> certs = certificateRepository.findByStudentId(studentIdOrEmail);
        if (certs.isEmpty() && studentIdOrEmail != null && studentIdOrEmail.contains("@")) {
            userRepository.findByEmail(studentIdOrEmail).ifPresent(u -> {
                certs.addAll(certificateRepository.findByStudentId(u.getId()));
            });
        }
        return certs.stream().map(this::toDto).collect(Collectors.toList());
    }

    public long countAll() {
        return certificateRepository.count();
    }

    private String generateUniqueCertId() {
        String id;
        do {
            id = CertificateIdGenerator.generate();
        } while (certificateRepository.findByCertificateId(id).isPresent());
        return id;
    }

    public String computeGrade(double percentage) {
        if (percentage >= 90) return "A+";
        if (percentage >= 80) return "A";
        if (percentage >= 70) return "B";
        if (percentage >= 60) return "C";
        if (percentage >= 50) return "D";
        return "F";
    }

    public CertificateDto toDto(Certificate c) {
        return CertificateDto.builder()
                .id(c.getCertificateId()) // ID matches certificateId (e.g. EXQ-2026-XXXXXX) for frontend QR/URL/Download
                .certificateId(c.getCertificateId())
                .studentId(c.getStudentId())
                .studentName(c.getStudentName())
                .examId(c.getExamId())
                .examTitle(c.getExamTitle())
                .subject(c.getSubject() != null ? c.getSubject() : "Computer Science")
                .score(c.getScore())
                .totalMarks(c.getTotalMarks())
                .percentage(c.getPercentage())
                .grade(c.getGrade())
                .attemptId(c.getAttemptId())
                .issuedAt(c.getIssuedAt())
                .build();
    }
}
