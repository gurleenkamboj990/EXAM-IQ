package com.examiq.repository;

import com.examiq.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, String> {
    List<Exam> findByPublishedTrue();
    List<Exam> findByCreatedByUserId(String userId);
}
