package com.examiq.repository;

import com.examiq.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, String> {
    Optional<Certificate> findByCertificateId(String certificateId);
    Optional<Certificate> findByAttemptId(String attemptId);
    List<Certificate> findByStudentId(String studentId);
}
