package com.examiq.config;

import com.examiq.entity.*;
import com.examiq.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final AttemptRepository attemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final CertificateRepository certificateRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@examiq.com")) {
            log.info("Database already seeded — skipping.");
            return;
        }
        log.info("Seeding database with demo data...");

        // ── Users ──────────────────────────────────────────────────────────────
        String pwd = passwordEncoder.encode("Demo@123");

        User admin = userRepository.save(User.builder()
                .name("Admin User").email("admin@examiq.com").password(pwd)
                .role(User.Role.ADMIN).title("Platform Administrator")
                .department("IT").avatar("https://api.dicebear.com/7.x/avataaars/svg?seed=admin").build());

        User teacher = userRepository.save(User.builder()
                .name("Dr. Sarah Johnson").email("teacher@examiq.com").password(pwd)
                .role(User.Role.TEACHER).title("Senior Lecturer")
                .department("Computer Science").avatar("https://api.dicebear.com/7.x/avataaars/svg?seed=teacher").build());

        User student = userRepository.save(User.builder()
                .name("Alex Thompson").email("student@examiq.com").password(pwd)
                .role(User.Role.STUDENT).title("Student")
                .department("Computer Science").avatar("https://api.dicebear.com/7.x/avataaars/svg?seed=student").build());

        User priya = userRepository.save(User.builder()
                .name("Priya Patel").email("priya@examiq.com").password(pwd)
                .role(User.Role.STUDENT).title("Student")
                .department("Computer Science").avatar("https://api.dicebear.com/7.x/avataaars/svg?seed=priya").build());

        User rahul = userRepository.save(User.builder()
                .name("Rahul Sharma").email("rahul@examiq.com").password(pwd)
                .role(User.Role.STUDENT).title("Student")
                .department("Computer Science").avatar("https://api.dicebear.com/7.x/avataaars/svg?seed=rahul").build());

        User liam = userRepository.save(User.builder()
                .name("Liam Chen").email("liam@examiq.com").password(pwd)
                .role(User.Role.STUDENT).title("Student")
                .department("Computer Science").avatar("https://api.dicebear.com/7.x/avataaars/svg?seed=liam").build());

        log.info("Created demo users (admin / teacher / student + cohort)");

        // ── Questions – Java Fundamentals ───────────────────────────────────
        Question q1 = questionRepository.save(Question.builder()
                .text("Which keyword is used to define a class in Java?")
                .type(Question.QuestionType.MCQ).topic("Java Basics")
                .difficulty(Question.Difficulty.EASY).marks(2)
                .options(Arrays.asList("class", "define", "object", "struct"))
                .correctAnswer(0).explanation("'class' is the Java keyword for class definitions.")
                .createdByUserId(teacher.getId()).build());

        Question q2 = questionRepository.save(Question.builder()
                .text("What is the size of an int in Java?")
                .type(Question.QuestionType.MCQ).topic("Java Basics")
                .difficulty(Question.Difficulty.EASY).marks(2)
                .options(Arrays.asList("8 bits", "16 bits", "32 bits", "64 bits"))
                .correctAnswer(2).explanation("Java int is always 32 bits (4 bytes).")
                .createdByUserId(teacher.getId()).build());

        Question q3 = questionRepository.save(Question.builder()
                .text("Which of the following is NOT an OOP principle?")
                .type(Question.QuestionType.MCQ).topic("OOP")
                .difficulty(Question.Difficulty.MEDIUM).marks(3)
                .options(Arrays.asList("Encapsulation", "Inheritance", "Compilation", "Polymorphism"))
                .correctAnswer(2).explanation("Compilation is not an OOP principle.")
                .createdByUserId(teacher.getId()).build());

        Question q4 = questionRepository.save(Question.builder()
                .text("Which interface must a class implement to be a Runnable thread?")
                .type(Question.QuestionType.MCQ).topic("Concurrency")
                .difficulty(Question.Difficulty.MEDIUM).marks(3)
                .options(Arrays.asList("Serializable", "Runnable", "Comparable", "Iterable"))
                .correctAnswer(1).explanation("java.lang.Runnable defines the run() method for threads.")
                .createdByUserId(teacher.getId()).build());

        Question q5 = questionRepository.save(Question.builder()
                .text("What does JVM stand for?")
                .type(Question.QuestionType.MCQ).topic("Java Basics")
                .difficulty(Question.Difficulty.EASY).marks(2)
                .options(Arrays.asList("Java Virtual Machine", "Java Variable Method", "Java Verified Module", "Java Value Map"))
                .correctAnswer(0).explanation("JVM = Java Virtual Machine, which executes Java bytecode.")
                .createdByUserId(teacher.getId()).build());

        Question q6 = questionRepository.save(Question.builder()
                .text("Which collection preserves insertion order and allows duplicates?")
                .type(Question.QuestionType.MCQ).topic("Collections")
                .difficulty(Question.Difficulty.MEDIUM).marks(3)
                .options(Arrays.asList("HashSet", "TreeSet", "ArrayList", "HashMap"))
                .correctAnswer(2).explanation("ArrayList is ordered and allows duplicate elements.")
                .createdByUserId(teacher.getId()).build());

        Question q7 = questionRepository.save(Question.builder()
                .text("What is the output of: System.out.println(1 + 2 + \"3\")?")
                .type(Question.QuestionType.MCQ).topic("Java Basics")
                .difficulty(Question.Difficulty.MEDIUM).marks(3)
                .options(Arrays.asList("123", "33", "6", "Compilation error"))
                .correctAnswer(1).explanation("1+2 = 3 (int), then 3+\"3\" = \"33\" (string concatenation).")
                .createdByUserId(teacher.getId()).build());

        Question q8 = questionRepository.save(Question.builder()
                .text("Which access modifier makes a member visible only within the same class?")
                .type(Question.QuestionType.MCQ).topic("OOP")
                .difficulty(Question.Difficulty.EASY).marks(2)
                .options(Arrays.asList("public", "protected", "default", "private"))
                .correctAnswer(3).explanation("'private' restricts access to the declaring class only.")
                .createdByUserId(teacher.getId()).build());

        Question q9 = questionRepository.save(Question.builder()
                .text("Which Java keyword prevents a variable from being reassigned?")
                .type(Question.QuestionType.MCQ).topic("Java Basics")
                .difficulty(Question.Difficulty.EASY).marks(2)
                .options(Arrays.asList("static", "final", "const", "immutable"))
                .correctAnswer(1).explanation("'final' prevents reassignment of a variable.")
                .createdByUserId(teacher.getId()).build());

        Question q10 = questionRepository.save(Question.builder()
                .text("What is the default value of a boolean field in a Java class?")
                .type(Question.QuestionType.MCQ).topic("Java Basics")
                .difficulty(Question.Difficulty.EASY).marks(2)
                .options(Arrays.asList("true", "false", "null", "0"))
                .correctAnswer(1).explanation("Instance boolean fields default to false.")
                .createdByUserId(teacher.getId()).build());

        // Short-answer questions
        Question q11 = questionRepository.save(Question.builder()
                .text("Explain the difference between == and .equals() in Java.")
                .type(Question.QuestionType.SHORT_ANSWER).topic("Java Basics")
                .difficulty(Question.Difficulty.MEDIUM).marks(5)
                .explanation("== compares object references, while .equals() compares the actual content/state of the objects.")
                .createdByUserId(teacher.getId()).build());

        Question q12 = questionRepository.save(Question.builder()
                .text("What is method overloading? Give one example.")
                .type(Question.QuestionType.SHORT_ANSWER).topic("OOP")
                .difficulty(Question.Difficulty.MEDIUM).marks(5)
                .explanation("Defining multiple methods with the same name but different parameter lists in the same class.")
                .createdByUserId(teacher.getId()).build());

        // Data Structures questions
        Question q13 = questionRepository.save(Question.builder()
                .text("What is the time complexity of binary search?")
                .type(Question.QuestionType.MCQ).topic("Algorithms")
                .difficulty(Question.Difficulty.MEDIUM).marks(3)
                .options(Arrays.asList("O(n)", "O(log n)", "O(n²)", "O(1)"))
                .correctAnswer(1).explanation("Binary search halves the search space each step → O(log n).")
                .createdByUserId(teacher.getId()).build());

        Question q14 = questionRepository.save(Question.builder()
                .text("Which data structure uses LIFO ordering?")
                .type(Question.QuestionType.MCQ).topic("Data Structures")
                .difficulty(Question.Difficulty.EASY).marks(2)
                .options(Arrays.asList("Queue", "Stack", "Deque", "LinkedList"))
                .correctAnswer(1).explanation("Stack = Last-In-First-Out (LIFO).")
                .createdByUserId(teacher.getId()).build());

        Question q15 = questionRepository.save(Question.builder()
                .text("What is a HashMap's average time complexity for get()?")
                .type(Question.QuestionType.MCQ).topic("Data Structures")
                .difficulty(Question.Difficulty.MEDIUM).marks(3)
                .options(Arrays.asList("O(1)", "O(log n)", "O(n)", "O(n log n)"))
                .correctAnswer(0).explanation("HashMap get() is O(1) amortized with a good hash function.")
                .createdByUserId(teacher.getId()).build());

        log.info("Created 15 seed questions");

        // ── Exam 1: Java Fundamentals Midterm (LIVE NOW) ─────────────────────
        int javaTotal = q1.getMarks()+q2.getMarks()+q3.getMarks()+q4.getMarks()+
                q5.getMarks()+q6.getMarks()+q7.getMarks()+q8.getMarks()+
                q9.getMarks()+q10.getMarks()+q11.getMarks()+q12.getMarks();

        Exam javaExam = examRepository.save(Exam.builder()
                .title("Java Fundamentals Midterm")
                .subject("Computer Science")
                .description("A comprehensive midterm exam covering core Java concepts, OOP, and collections.")
                .instructions("Read each question carefully. No external resources. 60 minutes.")
                .durationMinutes(60).passingPercentage(60.0)
                .negativeMarking(false).shuffleQuestions(false)
                .proctoringEnabled(true)
                .startTime(LocalDateTime.now().minusHours(2))
                .endTime(LocalDateTime.now().plusDays(7))
                .totalMarks(javaTotal)
                .createdByUserId(teacher.getId())
                .published(true).build());

        List<Question> javaQs = Arrays.asList(q1,q2,q3,q4,q5,q6,q7,q8,q9,q10,q11,q12);
        for (int i = 0; i < javaQs.size(); i++) {
            examQuestionRepository.save(ExamQuestion.builder()
                    .examId(javaExam.getId()).questionId(javaQs.get(i).getId())
                    .questionOrder(i+1).build());
        }

        // Cohort attempt 1: Priya (Submitted, 90%, passed)
        Attempt priyaAttempt = attemptRepository.save(Attempt.builder()
                .examId(javaExam.getId())
                .studentId(priya.getId())
                .startedAt(LocalDateTime.now().minusHours(2))
                .submittedAt(LocalDateTime.now().minusHours(1))
                .score(javaTotal * 0.90)
                .totalMarks(javaTotal)
                .percentage(90.0)
                .passed(true)
                .riskScore(12)
                .status(Attempt.AttemptStatus.SUBMITTED)
                .build());

        // Save an answer for q11 (short answer) with PENDING_REVIEW for teacher grading review!
        attemptAnswerRepository.save(AttemptAnswer.builder()
                .attemptId(priyaAttempt.getId())
                .questionId(q11.getId())
                .textAnswer("== compares memory references of the objects, whereas .equals() evaluates value equivalence based on class implementation.")
                .gradingStatus(AttemptAnswer.GradingStatus.PENDING_REVIEW)
                .marksAwarded(4.5)
                .correct(true)
                .build());

        // Cohort attempt 2: Rahul (Submitted, 75%, passed)
        Attempt rahulAttempt = attemptRepository.save(Attempt.builder()
                .examId(javaExam.getId())
                .studentId(rahul.getId())
                .startedAt(LocalDateTime.now().minusHours(2))
                .submittedAt(LocalDateTime.now().minusMinutes(50))
                .score(javaTotal * 0.75)
                .totalMarks(javaTotal)
                .percentage(75.0)
                .passed(true)
                .riskScore(35)
                .violations("[{\"type\":\"TAB_SWITCH\",\"timestamp\":\"2026-11-14T20:45:00\"}]")
                .status(Attempt.AttemptStatus.SUBMITTED)
                .build());

        // Cohort attempt 3: Liam (STARTED -> Active in Live Proctoring Monitor!)
        attemptRepository.save(Attempt.builder()
                .examId(javaExam.getId())
                .studentId(liam.getId())
                .startedAt(LocalDateTime.now().minusMinutes(25))
                .totalMarks(javaTotal)
                .riskScore(42)
                .violations("[{\"type\":\"MULTIPLE_FACES\",\"timestamp\":\"2026-11-14T21:55:00\"}]")
                .status(Attempt.AttemptStatus.STARTED)
                .build());

        // ── Exam 2: Data Structures Quiz (UPCOMING) ───────────────────────────
        int dsTotal = q13.getMarks()+q14.getMarks()+q15.getMarks();
        Exam dsExam = examRepository.save(Exam.builder()
                .title("Data Structures Quiz")
                .subject("Computer Science")
                .description("Quick quiz on fundamental data structures and algorithms.")
                .instructions("Answer all questions. 20 minutes allowed.")
                .durationMinutes(20).passingPercentage(50.0)
                .negativeMarking(true).negativeMarkValue(0.25)
                .shuffleQuestions(true)
                .startTime(LocalDateTime.now().plusDays(2))
                .endTime(LocalDateTime.now().plusDays(9))
                .totalMarks(dsTotal)
                .createdByUserId(teacher.getId())
                .published(true).build());

        List<Question> dsQs = Arrays.asList(q13,q14,q15);
        for (int i = 0; i < dsQs.size(); i++) {
            examQuestionRepository.save(ExamQuestion.builder()
                    .examId(dsExam.getId()).questionId(dsQs.get(i).getId())
                    .questionOrder(i+1).build());
        }

        // ── Exam 3: OOP Basics (PAST / COMPLETED) ────────────────────────────
        int pastTotal = q1.getMarks()+q2.getMarks()+q5.getMarks()+q8.getMarks()+q9.getMarks();
        Exam pastExam = examRepository.save(Exam.builder()
                .title("OOP Basics — End of Term")
                .subject("Computer Science")
                .description("Past exam on object-oriented programming basics.")
                .instructions("Answer all questions.")
                .durationMinutes(45).passingPercentage(55.0)
                .negativeMarking(false)
                .startTime(LocalDateTime.now().minusDays(14))
                .endTime(LocalDateTime.now().minusDays(7))
                .totalMarks(pastTotal)
                .createdByUserId(teacher.getId())
                .published(true).build());

        List<Question> pastQs = Arrays.asList(q1,q2,q5,q8,q9);
        for (int i = 0; i < pastQs.size(); i++) {
            examQuestionRepository.save(ExamQuestion.builder()
                    .examId(pastExam.getId()).questionId(pastQs.get(i).getId())
                    .questionOrder(i+1).build());
        }

        // Alex Thompson submitted pastExam with 80%
        Attempt alexPastAttempt = attemptRepository.save(Attempt.builder()
                .examId(pastExam.getId())
                .studentId(student.getId())
                .startedAt(LocalDateTime.now().minusDays(8))
                .submittedAt(LocalDateTime.now().minusDays(8).plusMinutes(40))
                .score(pastTotal * 0.80)
                .totalMarks(pastTotal)
                .percentage(80.0)
                .passed(true)
                .riskScore(5)
                .status(Attempt.AttemptStatus.SUBMITTED)
                .build());

        // ── Exam 4: Web & Cloud Architecture (PAST / COMPLETED) ──────────────
        int csTotal = 10;
        Exam csExam = examRepository.save(Exam.builder()
                .title("Web & Cloud Architecture")
                .subject("Software Engineering")
                .description("Assessment on modern cloud microservices, REST APIs and HTTP.")
                .instructions("Answer all questions.")
                .durationMinutes(45).passingPercentage(60.0)
                .negativeMarking(false)
                .startTime(LocalDateTime.now().minusDays(20))
                .endTime(LocalDateTime.now().minusDays(10))
                .totalMarks(csTotal)
                .createdByUserId(teacher.getId())
                .published(true).build());

        // Alex Thompson submitted csExam with 90%
        Attempt alexCsAttempt = attemptRepository.save(Attempt.builder()
                .examId(csExam.getId())
                .studentId(student.getId())
                .startedAt(LocalDateTime.now().minusDays(12))
                .submittedAt(LocalDateTime.now().minusDays(12).plusMinutes(35))
                .score(9.0)
                .totalMarks(csTotal)
                .percentage(90.0)
                .passed(true)
                .riskScore(8)
                .status(Attempt.AttemptStatus.SUBMITTED)
                .build());

        log.info("Created 4 seed exams (live, upcoming, past 1, past 2)");

        // ── Demo Certificates for student@examiq.com ─────────────────────────
        certificateRepository.save(Certificate.builder()
                .certificateId("EXQ-2026-MATH01")
                .studentId(student.getId())
                .studentName(student.getName())
                .examId(pastExam.getId())
                .examTitle(pastExam.getTitle())
                .subject(pastExam.getSubject())
                .score(pastTotal * 0.80)
                .totalMarks(pastTotal)
                .percentage(80.0)
                .grade("A")
                .attemptId(alexPastAttempt.getId())
                .issuedAt(LocalDateTime.now().minusDays(7))
                .build());

        certificateRepository.save(Certificate.builder()
                .certificateId("EXQ-2026-CS8821")
                .studentId(student.getId())
                .studentName(student.getName())
                .examId(csExam.getId())
                .examTitle(csExam.getTitle())
                .subject(csExam.getSubject())
                .score(9.0)
                .totalMarks(csTotal)
                .percentage(90.0)
                .grade("A+")
                .attemptId(alexCsAttempt.getId())
                .issuedAt(LocalDateTime.now().minusDays(11))
                .build());

        log.info("Created 2 seed certificates (EXQ-2026-MATH01 and EXQ-2026-CS8821)");
        log.info("Seeding complete. Login with admin@examiq.com / teacher@examiq.com / student@examiq.com — password: Demo@123");
    }
}
