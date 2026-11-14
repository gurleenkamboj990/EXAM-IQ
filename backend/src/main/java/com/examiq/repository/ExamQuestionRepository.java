package com.examiq.repository;

import com.examiq.entity.ExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, String> {
    List<ExamQuestion> findByExamIdOrderByQuestionOrder(String examId);
    void deleteByExamId(String examId);
    boolean existsByExamIdAndQuestionId(String examId, String questionId);
    long countByExamId(String examId);
}
