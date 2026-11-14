package com.examiq.repository;

import com.examiq.entity.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, String> {
    List<Attempt> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<Attempt> findByExamIdAndStatus(String examId, Attempt.AttemptStatus status);
    List<Attempt> findByExamId(String examId);
    Optional<Attempt> findByExamIdAndStudentIdAndStatus(String examId, String studentId, Attempt.AttemptStatus status);
    boolean existsByExamIdAndStudentIdAndStatus(String examId, String studentId, Attempt.AttemptStatus status);
}
