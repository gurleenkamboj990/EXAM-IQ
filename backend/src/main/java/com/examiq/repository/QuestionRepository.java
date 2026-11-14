package com.examiq.repository;

import com.examiq.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, String> {

    @Query("SELECT q FROM Question q WHERE " +
           "(:topic IS NULL OR q.topic = :topic) AND " +
           "(:difficulty IS NULL OR q.difficulty = :difficulty) AND " +
           "(:type IS NULL OR q.type = :type) AND " +
           "(:search IS NULL OR LOWER(q.text) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Question> findWithFilters(
        @Param("topic") String topic,
        @Param("difficulty") Question.Difficulty difficulty,
        @Param("type") Question.QuestionType type,
        @Param("search") String search,
        Pageable pageable
    );

    List<Question> findAllByIdIn(List<String> ids);

    Optional<Question> findFirstByText(String text);
    boolean existsByText(String text);
}
