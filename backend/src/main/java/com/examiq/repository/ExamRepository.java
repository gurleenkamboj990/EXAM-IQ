package com.examiq.repository;

import com.examiq.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRepository extends JpaRepository<Exam, String> {
    List<Exam> findByPublishedTrue();
    List<Exam> findByCreatedByUserId(String userId);
    Optional<Exam> findFirstByTitle(String title);
    boolean existsByTitle(String title);
}
