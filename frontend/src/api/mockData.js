import { ROLES } from '../utils/constants';

export const MOCK_USERS = [
  {
    id: 'usr_admin_01',
    name: 'Alexander Wright',
    email: 'admin@examiq.com',
    role: ROLES.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Super Administrator',
    department: 'Platform Operations',
  },
  {
    id: 'usr_teach_01',
    name: 'Prof. Sarah Jenkins',
    email: 'teacher@examiq.com',
    role: ROLES.TEACHER,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'Senior Faculty - Computer Science',
    department: 'School of Computing',
  },
  {
    id: 'usr_stud_01',
    name: 'Alex Morgan',
    email: 'student@examiq.com',
    role: ROLES.STUDENT,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    title: 'Undergraduate Learner',
    department: 'B.Tech Computer Science, Year 3',
  },
];

export const MOCK_PASSWORDS = {
  'admin@examiq.com': 'Demo@123',
  'teacher@examiq.com': 'Demo@123',
  'student@examiq.com': 'Demo@123',
};

// 34 Comprehensive Mock Questions
export const INITIAL_QUESTIONS = [
  // --- MATHEMATICS (6) ---
  {
    id: 'q_math_01',
    text: 'What is the determinant of a 2x2 identity matrix?',
    type: 'MCQ',
    topic: 'Mathematics',
    difficulty: 'EASY',
    marks: 2,
    options: ['0', '1', '-1', 'Undefined'],
    correctAnswer: 1, // index of '1'
    explanation: 'The determinant of an identity matrix of any order is always 1.',
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'q_math_02',
    text: 'Evaluate the limit of (sin x) / x as x approaches 0.',
    type: 'MCQ',
    topic: 'Mathematics',
    difficulty: 'EASY',
    marks: 2,
    options: ['0', '1', 'Infinity', 'Does not exist'],
    correctAnswer: 1,
    explanation: 'By standard calculus limits (or L’Hôpital’s Rule), lim(x->0) sin(x)/x = 1.',
    createdAt: '2026-10-02T10:00:00Z',
  },
  {
    id: 'q_math_03',
    text: 'What is the derivative of f(x) = ln(3x^2 + 5)?',
    type: 'MCQ',
    topic: 'Mathematics',
    difficulty: 'MEDIUM',
    marks: 3,
    options: [
      '6x / (3x^2 + 5)',
      '1 / (3x^2 + 5)',
      '6x * (3x^2 + 5)',
      '3 / (3x^2 + 5)',
    ],
    correctAnswer: 0,
    explanation: 'Using the chain rule: d/dx[ln(u)] = (1/u) * u\'. Here u = 3x^2 + 5, so u\' = 6x.',
    createdAt: '2026-10-03T10:00:00Z',
  },
  {
    id: 'q_math_04',
    text: 'Explain the geometric interpretation of the eigenvalues and eigenvectors of a linear transformation matrix.',
    type: 'SHORT_ANSWER',
    topic: 'Mathematics',
    difficulty: 'MEDIUM',
    marks: 5,
    modelAnswer: 'An eigenvector represents a non-zero vector whose direction remains unchanged (only scaled) after applying the transformation. The corresponding eigenvalue is the scalar factor by which the eigenvector is stretched, shrunk, or flipped.',
    createdAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'q_math_05',
    text: 'What is the sum of eigenvalues of a square matrix equal to?',
    type: 'MCQ',
    topic: 'Mathematics',
    difficulty: 'HARD',
    marks: 3,
    options: [
      'The determinant of the matrix',
      'The trace of the matrix (sum of main diagonal elements)',
      'The rank of the matrix',
      'Zero',
    ],
    correctAnswer: 1,
    explanation: 'The sum of all eigenvalues of a matrix is equal to the trace of the matrix.',
    createdAt: '2026-10-05T10:00:00Z',
  },
  {
    id: 'q_math_06',
    text: 'State Bayes\' Theorem and outline its significance in conditional probability.',
    type: 'SHORT_ANSWER',
    topic: 'Mathematics',
    difficulty: 'HARD',
    marks: 5,
    modelAnswer: 'Bayes\' Theorem: P(A|B) = [P(B|A) * P(A)] / P(B). It calculates the posterior probability of an event given prior knowledge of conditions related to the event.',
    createdAt: '2026-10-06T10:00:00Z',
  },

  // --- PHYSICS (6) ---
  {
    id: 'q_phy_01',
    text: 'What is the SI unit of magnetic flux density?',
    type: 'MCQ',
    topic: 'Physics',
    difficulty: 'EASY',
    marks: 2,
    options: ['Weber', 'Tesla', 'Henry', 'Gauss'],
    correctAnswer: 1,
    explanation: 'Tesla (T) is the SI unit of magnetic flux density (Weber per square meter).',
    createdAt: '2026-10-07T10:00:00Z',
  },
  {
    id: 'q_phy_02',
    text: 'According to Newton\'s third law of motion, the action and reaction forces act on:',
    type: 'MCQ',
    topic: 'Physics',
    difficulty: 'EASY',
    marks: 2,
    options: [
      'The same body in the same direction',
      'The same body in opposite directions',
      'Two different bodies in opposite directions',
      'Any body in perpendicular directions',
    ],
    correctAnswer: 2,
    explanation: 'Action and reaction forces always act on two distinct interacting bodies.',
    createdAt: '2026-10-08T10:00:00Z',
  },
  {
    id: 'q_phy_03',
    text: 'A Carnot engine operates between reservoirs at 500 K and 300 K. What is its theoretical thermal efficiency?',
    type: 'MCQ',
    topic: 'Physics',
    difficulty: 'MEDIUM',
    marks: 3,
    options: ['60%', '40%', '50%', '37.5%'],
    correctAnswer: 1,
    explanation: 'Efficiency = 1 - (Tc / Th) = 1 - (300 / 500) = 0.40 or 40%.',
    createdAt: '2026-10-09T10:00:00Z',
  },
  {
    id: 'q_phy_04',
    text: 'What phenomenon causes the sky to appear blue during clear daylight?',
    type: 'MCQ',
    topic: 'Physics',
    difficulty: 'MEDIUM',
    marks: 2,
    options: [
      'Rayleigh scattering of shorter wavelengths',
      'Mie scattering by atmospheric dust',
      'Refraction through the ozone layer',
      'Dispersion of light in raindrops',
    ],
    correctAnswer: 0,
    explanation: 'Rayleigh scattering is inversely proportional to the fourth power of wavelength, causing shorter blue wavelengths to scatter much more than red.',
    createdAt: '2026-10-10T10:00:00Z',
  },
  {
    id: 'q_phy_05',
    text: 'State the Heisenberg Uncertainty Principle and its physical implication for quantum particles.',
    type: 'SHORT_ANSWER',
    topic: 'Physics',
    difficulty: 'HARD',
    marks: 5,
    modelAnswer: 'The principle states that the position and momentum of a particle cannot be simultaneously determined with arbitrary precision: Δx * Δp >= h / (4π). It implies that quantum entities do not have simultaneously well-defined positions and trajectories.',
    createdAt: '2026-10-11T10:00:00Z',
  },
  {
    id: 'q_phy_06',
    text: 'Explain how Lenz\'s law relates to the principle of conservation of energy in electromagnetic induction.',
    type: 'SHORT_ANSWER',
    topic: 'Physics',
    difficulty: 'MEDIUM',
    marks: 4,
    modelAnswer: 'Lenz\'s law states the induced EMF always opposes the change that produces it. If it didn\'t, energy would be created from nothing, violating the conservation of energy.',
    createdAt: '2026-10-12T10:00:00Z',
  },

  // --- JAVA PROGRAMMING (8) ---
  {
    id: 'q_java_01',
    text: 'Which keyword in Java prevents a method from being overridden by subclasses?',
    type: 'MCQ',
    topic: 'Java',
    difficulty: 'EASY',
    marks: 2,
    options: ['static', 'final', 'abstract', 'const'],
    correctAnswer: 1,
    explanation: 'The `final` keyword when applied to a method prevents method overriding in child classes.',
    createdAt: '2026-10-13T10:00:00Z',
  },
  {
    id: 'q_java_02',
    text: 'What is the default initial capacity of an ArrayList in Java 8+?',
    type: 'MCQ',
    topic: 'Java',
    difficulty: 'EASY',
    marks: 2,
    options: ['0 (until first element added, then 10)', '16', '32', '8'],
    correctAnswer: 0,
    explanation: 'ArrayList initializes with an empty buffer (0) and expands to 10 upon first element addition.',
    createdAt: '2026-10-14T10:00:00Z',
  },
  {
    id: 'q_java_03',
    text: 'What will String s1 = "Hello"; String s2 = new String("Hello"); evaluate for (s1 == s2) and s1.equals(s2)?',
    type: 'MCQ',
    topic: 'Java',
    difficulty: 'MEDIUM',
    marks: 3,
    options: [
      'true and true',
      'false and true',
      'true and false',
      'false and false',
    ],
    correctAnswer: 1,
    explanation: '`==` compares memory references (different heap vs pool objects), while `.equals()` compares character contents.',
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'q_java_04',
    text: 'Which interface must a class implement to allow its instances to be sorted using Collections.sort(list)?',
    type: 'MCQ',
    topic: 'Java',
    difficulty: 'MEDIUM',
    marks: 3,
    options: [
      'java.lang.Comparable',
      'java.util.Sortable',
      'java.lang.Cloneable',
      'java.io.Serializable',
    ],
    correctAnswer: 0,
    explanation: '`Comparable<T>` defines natural ordering via `compareTo(T o)`. Alternatively, a `Comparator` can be passed.',
    createdAt: '2026-10-16T10:00:00Z',
  },
  {
    id: 'q_java_05',
    text: 'Explain the difference between HashMap and ConcurrentHashMap in terms of thread safety and locking mechanisms.',
    type: 'SHORT_ANSWER',
    topic: 'Java',
    difficulty: 'HARD',
    marks: 5,
    modelAnswer: 'HashMap is non-thread-safe and can cause race conditions or infinite loops during resizing. ConcurrentHashMap provides thread safety using bucket-level / synchronized node locking and CAS operations without locking the entire table.',
    createdAt: '2026-10-17T10:00:00Z',
  },
  {
    id: 'q_java_06',
    text: 'What happens when a finally block executes after a return statement inside a try block in Java?',
    type: 'MCQ',
    topic: 'Java',
    difficulty: 'MEDIUM',
    marks: 3,
    options: [
      'The finally block is skipped completely',
      'The finally block executes before the method actually returns',
      'An IllegalStateException is thrown at runtime',
      'The return statement terminates the JVM immediately',
    ],
    correctAnswer: 1,
    explanation: 'The `finally` block always executes just before the method returns, ensuring resource cleanup.',
    createdAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'q_java_07',
    text: 'What is the purpose of the `volatile` keyword in Java multi-threaded programming?',
    type: 'SHORT_ANSWER',
    topic: 'Java',
    difficulty: 'MEDIUM',
    marks: 4,
    modelAnswer: 'The volatile keyword guarantees memory visibility across threads: reads and writes go directly to main memory rather than thread-local CPU caches, and it prevents compiler instruction reordering.',
    createdAt: '2026-10-19T10:00:00Z',
  },
  {
    id: 'q_java_08',
    text: 'Which Java Garbage Collection algorithm separates the heap into Young and Old generations and uses pause-prediction models?',
    type: 'MCQ',
    topic: 'Java',
    difficulty: 'HARD',
    marks: 3,
    options: ['Serial GC', 'G1 (Garbage-First) GC', 'Epsilon GC', 'CMS without compaction'],
    correctAnswer: 1,
    explanation: 'G1 GC divides the heap into equal regions and prioritizes collecting regions with the most garbage within a target pause time.',
    createdAt: '2026-10-20T10:00:00Z',
  },

  // --- DATABASE MANAGEMENT SYSTEMS (DBMS) (8) ---
  {
    id: 'q_db_01',
    text: 'What property in ACID guarantees that a database transaction will either complete entirely or fail with no partial state?',
    type: 'MCQ',
    topic: 'DBMS',
    difficulty: 'EASY',
    marks: 2,
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    correctAnswer: 0,
    explanation: 'Atomicity ensures "all-or-nothing" execution of database transactions.',
    createdAt: '2026-10-21T10:00:00Z',
  },
  {
    id: 'q_db_02',
    text: 'Which normal form addresses transitive dependency between non-prime attributes and the primary key?',
    type: 'MCQ',
    topic: 'DBMS',
    difficulty: 'MEDIUM',
    marks: 3,
    options: ['1NF', '2NF', '3NF', '4NF'],
    correctAnswer: 2,
    explanation: '3NF requires 2NF plus no transitive functional dependencies of non-key attributes on the candidate key.',
    createdAt: '2026-10-22T10:00:00Z',
  },
  {
    id: 'q_db_03',
    text: 'In SQL, what is the key difference between `WHERE` and `HAVING` clauses?',
    type: 'SHORT_ANSWER',
    topic: 'DBMS',
    difficulty: 'EASY',
    marks: 4,
    modelAnswer: '`WHERE` filters individual rows before any grouping or aggregation takes place. `HAVING` filters aggregated groups after the `GROUP BY` clause has been processed.',
    createdAt: '2026-10-23T10:00:00Z',
  },
  {
    id: 'q_db_04',
    text: 'Which indexing data structure is most widely used by relational database storage engines for range scans?',
    type: 'MCQ',
    topic: 'DBMS',
    difficulty: 'MEDIUM',
    marks: 2,
    options: ['Hash Index', 'B+ Tree', 'Binary Search Tree', 'Inverted Index'],
    correctAnswer: 1,
    explanation: 'B+ Trees store all data/pointers in leaves connected by linked lists, making range queries and disk block reads optimal.',
    createdAt: '2026-10-24T10:00:00Z',
  },
  {
    id: 'q_db_05',
    text: 'What anomaly occurs when transaction T1 reads data modified by uncommitted transaction T2, and T2 subsequently rolls back?',
    type: 'MCQ',
    topic: 'DBMS',
    difficulty: 'MEDIUM',
    marks: 3,
    options: [
      'Dirty Read',
      'Non-repeatable Read',
      'Phantom Read',
      'Lost Update',
    ],
    correctAnswer: 0,
    explanation: 'A Dirty Read happens when reading uncommitted data that later gets aborted or rolled back.',
    createdAt: '2026-10-25T10:00:00Z',
  },
  {
    id: 'q_db_06',
    text: 'Explain the Two-Phase Locking (2PL) protocol and how it guarantees serializability.',
    type: 'SHORT_ANSWER',
    topic: 'DBMS',
    difficulty: 'HARD',
    marks: 5,
    modelAnswer: '2PL consists of a Growing Phase (where locks are acquired and none released) and a Shrinking Phase (where locks are released and none acquired). It guarantees conflict-serializable schedules by preventing cyclic lock acquisitions.',
    createdAt: '2026-10-26T10:00:00Z',
  },
  {
    id: 'q_db_07',
    text: 'In SQL, which join returns all rows from the left table even if there is no match in the right table?',
    type: 'MCQ',
    topic: 'DBMS',
    difficulty: 'EASY',
    marks: 2,
    options: ['INNER JOIN', 'LEFT OUTER JOIN', 'CROSS JOIN', 'NATURAL JOIN'],
    correctAnswer: 1,
    explanation: 'LEFT JOIN (or LEFT OUTER JOIN) preserves all rows from the left relation, filling unmatched right columns with NULL.',
    createdAt: '2026-10-27T10:00:00Z',
  },
  {
    id: 'q_db_08',
    text: 'What is Write-Ahead Logging (WAL) and how does it ensure Durability in DBMS?',
    type: 'SHORT_ANSWER',
    topic: 'DBMS',
    difficulty: 'HARD',
    marks: 5,
    modelAnswer: 'WAL ensures that log records describing data changes are flushed to non-volatile disk storage before the actual dirty database pages are written. Upon crash recovery, REDO and UNDO passes restore the exact consistent state.',
    createdAt: '2026-10-28T10:00:00Z',
  },

  // --- COMPUTER NETWORKS & ALGORITHMS (6) ---
  {
    id: 'q_cs_01',
    text: 'What is the average and worst-case time complexity of QuickSort?',
    type: 'MCQ',
    topic: 'Algorithms',
    difficulty: 'MEDIUM',
    marks: 3,
    options: [
      'O(n log n) average, O(n^2) worst case',
      'O(n log n) average, O(n log n) worst case',
      'O(n) average, O(n log n) worst case',
      'O(n^2) average, O(n^2) worst case',
    ],
    correctAnswer: 0,
    explanation: 'QuickSort runs in O(n log n) on average, but degrades to O(n^2) when poor pivots are repeatedly chosen.',
    createdAt: '2026-10-29T10:00:00Z',
  },
  {
    id: 'q_cs_02',
    text: 'Which transport layer protocol provides reliable, connection-oriented byte-stream delivery with congestion control?',
    type: 'MCQ',
    topic: 'Networks',
    difficulty: 'EASY',
    marks: 2,
    options: ['UDP', 'TCP', 'ICMP', 'IGMP'],
    correctAnswer: 1,
    explanation: 'TCP (Transmission Control Protocol) handles three-way handshake, retransmission, and flow/congestion control.',
    createdAt: '2026-10-30T10:00:00Z',
  },
  {
    id: 'q_cs_03',
    text: 'Explain the Dijkstra algorithm and state its limitation regarding negative weight edges.',
    type: 'SHORT_ANSWER',
    topic: 'Algorithms',
    difficulty: 'MEDIUM',
    marks: 5,
    modelAnswer: 'Dijkstra finds single-source shortest paths in weighted graphs using a greedy priority queue approach. It fails on graphs with negative weight edges because it assumes previously finalized shortest paths cannot be shortened.',
    createdAt: '2026-10-31T10:00:00Z',
  },
  {
    id: 'q_cs_04',
    text: 'What is the primary role of DNS (Domain Name System) in Internet networking?',
    type: 'MCQ',
    topic: 'Networks',
    difficulty: 'EASY',
    marks: 2,
    options: [
      'To encrypt web requests via SSL/TLS',
      'To map human-readable domain names to numerical IP addresses',
      'To dynamically assign IP addresses via DHCP',
      'To route packets across autonomous systems via BGP',
    ],
    correctAnswer: 1,
    explanation: 'DNS acts as the phonebook of the Internet, mapping domains (e.g., examiq.com) to IP addresses.',
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'q_cs_05',
    text: 'What data structure is used to implement Breadth-First Search (BFS) in graph traversal?',
    type: 'MCQ',
    topic: 'Algorithms',
    difficulty: 'EASY',
    marks: 2,
    options: ['Stack', 'Queue', 'Priority Queue', 'Disjoint Set'],
    correctAnswer: 1,
    explanation: 'BFS explores vertices level by level using a FIFO Queue.',
    createdAt: '2026-11-02T10:00:00Z',
  },
  {
    id: 'q_cs_06',
    text: 'Explain the TCP Three-Way Handshake process for establishing a connection.',
    type: 'SHORT_ANSWER',
    topic: 'Networks',
    difficulty: 'MEDIUM',
    marks: 4,
    modelAnswer: '1) Client sends SYN packet with an initial sequence number. 2) Server responds with SYN-ACK packet acknowledging client seq and providing server seq. 3) Client returns ACK packet confirming server seq. Connection is then ESTABLISHED.',
    createdAt: '2026-11-03T10:00:00Z',
  },
];

// Helper to compute dynamic relative dates for mock exams
const now = new Date();
const hours = (h) => new Date(now.getTime() + h * 3600 * 1000).toISOString();
const days = (d) => new Date(now.getTime() + d * 24 * 3600 * 1000).toISOString();

export const INITIAL_EXAMS = [
  {
    id: 'exam_live_01',
    title: 'Advanced Data Structures & Algorithms Midterm',
    subject: 'Computer Science',
    description: 'Comprehensive mid-semester examination evaluating algorithm complexity, graph traversal, and dynamic programming concepts.',
    instructions: '1. Ensure stable internet connection throughout the attempt.\n2. Do not switch browser tabs or minimize the window.\n3. Negative marking applies (-0.5 marks for wrong MCQs).\n4. Unanswered questions do not incur penalties.',
    questionIds: ['q_cs_01', 'q_cs_03', 'q_cs_05', 'q_math_03', 'q_java_02', 'q_java_03'],
    duration: 45, // in minutes
    passingPercentage: 60,
    negativeMarking: true,
    negativeMarkValue: 0.5,
    shuffleQuestions: true,
    adaptiveMode: false,
    proctoring: false,
    startTime: hours(-1), // Started 1 hour ago (Live Now)
    endTime: hours(4),    // Ends in 4 hours
    totalMarks: 17,
    createdBy: 'usr_teach_01',
    createdAt: days(-5),
  },
  {
    id: 'exam_live_02',
    title: 'Database Architecture & Concurrency Control',
    subject: 'DBMS',
    description: 'Assessing relational theory, ACID guarantees, transaction isolation levels, indexing, and recovery logging.',
    instructions: '1. Read all questions thoroughly before answering.\n2. Short answers will be graded by course instructor.\n3. Autosave is enabled.\n4. Click Submit once satisfied with answers.',
    questionIds: ['q_db_01', 'q_db_02', 'q_db_03', 'q_db_04', 'q_db_05', 'q_db_06', 'q_db_07', 'q_db_08'],
    duration: 60,
    passingPercentage: 65,
    negativeMarking: false,
    negativeMarkValue: 0,
    shuffleQuestions: false,
    adaptiveMode: false,
    proctoring: false,
    startTime: hours(-0.5), // Started 30 mins ago (Live Now)
    endTime: hours(2.5),    // Ends in 2.5 hours
    totalMarks: 28,
    createdBy: 'usr_teach_01',
    createdAt: days(-4),
  },
  {
    id: 'exam_upcom_01',
    title: 'Modern Java Architecture & JVM Internals',
    subject: 'Java',
    description: 'In-depth evaluation on garbage collection algorithms, memory models, multithreading, and collections framework.',
    instructions: '1. This exam will unlock at the scheduled start time.\n2. Ensure your workspace is distraction-free.\n3. Late arrivals will not receive time extensions.',
    questionIds: ['q_java_01', 'q_java_02', 'q_java_03', 'q_java_04', 'q_java_05', 'q_java_06', 'q_java_07', 'q_java_08'],
    duration: 50,
    passingPercentage: 70,
    negativeMarking: true,
    negativeMarkValue: 1.0,
    shuffleQuestions: true,
    adaptiveMode: false,
    proctoring: false,
    startTime: days(2), // Starts in 2 days (Upcoming)
    endTime: days(2.1),
    totalMarks: 25,
    createdBy: 'usr_teach_01',
    createdAt: days(-2),
  },
  {
    id: 'exam_upcom_02',
    title: 'Applied Engineering Mathematics: Linear Algebra',
    subject: 'Mathematics',
    description: 'Eigenvalues, vector spaces, matrix factorizations, and systems of linear equations.',
    instructions: 'Calculators are allowed. Graphing software is strictly prohibited.',
    questionIds: ['q_math_01', 'q_math_02', 'q_math_03', 'q_math_04', 'q_math_05', 'q_math_06'],
    duration: 60,
    passingPercentage: 50,
    negativeMarking: false,
    negativeMarkValue: 0,
    shuffleQuestions: true,
    adaptiveMode: false,
    proctoring: false,
    startTime: days(5), // Starts in 5 days (Upcoming)
    endTime: days(5.2),
    totalMarks: 20,
    createdBy: 'usr_teach_01',
    createdAt: days(-1),
  },
  {
    id: 'exam_comp_01',
    title: 'General Physics: Mechanics & Thermodynamics',
    subject: 'Physics',
    description: 'Foundational examination covering classical dynamics, Carnot cycles, optics, and wave-particle duality.',
    instructions: 'Exam duration was 45 minutes.',
    questionIds: ['q_phy_01', 'q_phy_02', 'q_phy_03', 'q_phy_04', 'q_phy_05', 'q_phy_06'],
    duration: 45,
    passingPercentage: 60,
    negativeMarking: true,
    negativeMarkValue: 0.5,
    startTime: days(-3), // Completed 3 days ago
    endTime: days(-2.8),
    totalMarks: 18,
    createdBy: 'usr_teach_01',
    createdAt: days(-10),
  },
  {
    id: 'exam_comp_02',
    title: 'Computer Networks & Internet Protocols',
    subject: 'Networks',
    description: 'Protocol stack layers, routing protocols, flow control, and domain services.',
    instructions: 'Past evaluation paper for benchmark review.',
    questionIds: ['q_cs_02', 'q_cs_04', 'q_cs_06'],
    duration: 30,
    passingPercentage: 60,
    negativeMarking: false,
    negativeMarkValue: 0,
    startTime: days(-7), // Completed 7 days ago
    endTime: days(-6.9),
    totalMarks: 8,
    createdBy: 'usr_teach_01',
    createdAt: days(-15),
  },
];

// Initial mock results for student Alex Morgan
export const INITIAL_RESULTS = [
  {
    attemptId: 'att_res_101',
    examId: 'exam_comp_01',
    examTitle: 'General Physics: Mechanics & Thermodynamics',
    subject: 'Physics',
    studentId: 'usr_stud_01',
    studentName: 'Alex Morgan',
    score: 15.5,
    totalMarks: 18,
    percentage: 86.1,
    passed: true,
    submittedAt: days(-3),
    timeSpentSeconds: 2180,
    summary: {
      totalQuestions: 6,
      correctCount: 4,
      incorrectCount: 1,
      skippedCount: 0,
      pendingCount: 1, // short answer pending evaluation
    },
    answers: [
      {
        questionId: 'q_phy_01',
        studentAnswer: 1,
        isCorrect: true,
        marksAwarded: 2,
        feedback: 'Correct! Tesla is the SI unit.',
      },
      {
        questionId: 'q_phy_02',
        studentAnswer: 2,
        isCorrect: true,
        marksAwarded: 2,
        feedback: 'Correct! Action and reaction act on different bodies.',
      },
      {
        questionId: 'q_phy_03',
        studentAnswer: 1,
        isCorrect: true,
        marksAwarded: 3,
        feedback: 'Correct! Efficiency is 40%.',
      },
      {
        questionId: 'q_phy_04',
        studentAnswer: 0,
        isCorrect: true,
        marksAwarded: 2,
        feedback: 'Correct! Rayleigh scattering causes the blue color.',
      },
      {
        questionId: 'q_phy_05',
        studentAnswer: 'The uncertainty principle means we cannot simultaneously measure both the position and momentum of a subatomic particle with total accuracy.',
        isCorrect: null, // pending review
        marksAwarded: 0,
        feedback: 'Short answer recorded. Pending instructor evaluation.',
      },
      {
        questionId: 'q_phy_06',
        studentAnswer: 'Lenz\'s law prevents free energy creation.',
        isCorrect: true,
        marksAwarded: 4,
        feedback: 'Good explanation.',
      },
    ],
  },
  {
    attemptId: 'att_res_102',
    examId: 'exam_comp_02',
    examTitle: 'Computer Networks & Internet Protocols',
    subject: 'Networks',
    studentId: 'usr_stud_01',
    studentName: 'Alex Morgan',
    score: 7,
    totalMarks: 8,
    percentage: 87.5,
    passed: true,
    submittedAt: days(-7),
    timeSpentSeconds: 1420,
    summary: {
      totalQuestions: 3,
      correctCount: 2,
      incorrectCount: 0,
      skippedCount: 0,
      pendingCount: 1,
    },
    answers: [
      {
        questionId: 'q_cs_02',
        studentAnswer: 1,
        isCorrect: true,
        marksAwarded: 2,
        feedback: 'Correct! TCP is reliable and connection-oriented.',
      },
      {
        questionId: 'q_cs_04',
        studentAnswer: 1,
        isCorrect: true,
        marksAwarded: 2,
        feedback: 'Correct! DNS maps domain names to IP addresses.',
      },
      {
        questionId: 'q_cs_06',
        studentAnswer: 'SYN, SYN-ACK, ACK sequence initializes TCP connection.',
        isCorrect: null,
        marksAwarded: 0,
        feedback: 'Recorded for teacher review.',
      },
    ],
  },
];

// Persistent LocalStorage Store Helpers
const STORAGE_KEYS = {
  QUESTIONS: 'examiq_mock_questions_v2',
  EXAMS: 'examiq_mock_exams_v2',
  RESULTS: 'examiq_mock_results_v2',
};

export const getStoredQuestions = () => {
  if (typeof window === 'undefined') return INITIAL_QUESTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_QUESTIONS;
  }
};

export const saveStoredQuestions = (questions) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed to save questions to localStorage:', err);
  }
};

export const getStoredExams = () => {
  if (typeof window === 'undefined') return INITIAL_EXAMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
      return INITIAL_EXAMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EXAMS;
  }
};

export const saveStoredExams = (exams) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  } catch (err) {
    console.error('Failed to save exams to localStorage:', err);
  }
};

export const getStoredResults = () => {
  if (typeof window === 'undefined') return INITIAL_RESULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(INITIAL_RESULTS));
      return INITIAL_RESULTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_RESULTS;
  }
};

export const saveStoredResults = (results) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
  } catch (err) {
    console.error('Failed to save results to localStorage:', err);
  }
};

// Exam Status Computation
export const getExamStatus = (exam) => {
  const currentTime = new Date().getTime();
  const start = new Date(exam.startTime).getTime();
  const end = new Date(exam.endTime).getTime();

  if (currentTime < start) return 'UPCOMING';
  if (currentTime >= start && currentTime <= end) return 'LIVE';
  return 'COMPLETED';
};

// Notifications Mock
export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'Exam Window Opened',
    message: 'CS301 Advanced Data Structures & Algorithms is now live!',
    time: '15 minutes ago',
    read: false,
    type: 'success',
  },
  {
    id: 'notif_2',
    title: 'New Assessment Scheduled',
    message: 'Java Architecture exam scheduled for Friday, 10:00 UTC.',
    time: '2 hours ago',
    read: false,
    type: 'info',
  },
  {
    id: 'notif_3',
    title: 'System Audit Clean',
    message: 'Zero suspicious activity detected in last 24-hour cycle.',
    time: '1 day ago',
    read: true,
    type: 'info',
  },
];

// Admin Dashboard Exports
export const ADMIN_STATS = [
  {
    id: 'adm_1',
    title: 'Total Students',
    value: '3,842',
    change: '+14.2%',
    trend: 'up',
    description: 'vs. previous semester',
    iconName: 'Users',
    color: 'brand',
  },
  {
    id: 'adm_2',
    title: 'Live & Active Exams',
    value: '34',
    change: '+6 today',
    trend: 'up',
    description: 'across 8 departments',
    iconName: 'FileCheck',
    color: 'emerald',
  },
  {
    id: 'adm_3',
    title: 'Completed Attempts',
    value: '28,490',
    change: '+22.5%',
    trend: 'up',
    description: 'all-time verified submissions',
    iconName: 'Award',
    color: 'indigo',
  },
  {
    id: 'adm_4',
    title: 'Platform Health',
    value: '99.98%',
    change: '+0.03%',
    trend: 'up',
    description: 'average latency 42ms',
    iconName: 'Activity',
    color: 'amber',
  },
];

export const ADMIN_CHART_DATA = [
  { month: 'Nov', attempts: 3200, passRate: 82, integrityScore: 98 },
  { month: 'Dec', attempts: 4800, passRate: 85, integrityScore: 97 },
  { month: 'Jan', attempts: 2900, passRate: 80, integrityScore: 99 },
  { month: 'Feb', attempts: 5400, passRate: 88, integrityScore: 98 },
  { month: 'Mar', attempts: 6800, passRate: 86, integrityScore: 96 },
  { month: 'Apr', attempts: 8900, passRate: 89, integrityScore: 99 },
];

export const ADMIN_RECENT_ACTIVITIES = [
  {
    id: 'act_1',
    user: 'Prof. Sarah Jenkins',
    action: 'published new midterm examination',
    target: 'CS301: Advanced Algorithms',
    time: '12 minutes ago',
    type: 'exam',
  },
  {
    id: 'act_2',
    user: 'Security Sentinel',
    action: 'flagged 0 anomalies during live window',
    target: 'MAT204: Linear Algebra',
    time: '45 minutes ago',
    type: 'security',
  },
  {
    id: 'act_3',
    user: 'Dr. Robert Chen',
    action: 'enrolled 120 new candidates',
    target: 'Bioinformatics Cohort B',
    time: '2 hours ago',
    type: 'user',
  },
  {
    id: 'act_4',
    user: 'System Automated Backup',
    action: 'archived 4,500 encrypted submissions',
    target: 'Cold Storage Vault',
    time: '4 hours ago',
    type: 'system',
  },
];

// Teacher Dashboard Chart Export
export const TEACHER_CHART_DATA = [
  { gradeRange: '90-100% (A)', students: 94, benchmark: 80 },
  { gradeRange: '80-89% (B)', students: 146, benchmark: 130 },
  { gradeRange: '70-79% (C)', students: 112, benchmark: 120 },
  { gradeRange: '60-69% (D)', students: 48, benchmark: 60 },
  { gradeRange: '< 60% (F)', students: 28, benchmark: 38 },
];

// ==========================================
// PHASE 3: AI & SMART FEATURES MOCK DATA
// ==========================================

export const MOCK_STUDENT_COHORT = [
  { id: 'usr_stud_01', name: 'Alex Morgan', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', email: 'student@examiq.com' },
  { id: 'usr_stud_02', name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', email: 'elena.r@examiq.com' },
  { id: 'usr_stud_03', name: 'Rahul Sharma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', email: 'rahul.s@examiq.com' },
  { id: 'usr_stud_04', name: 'Zackary Chen', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', email: 'zack.c@examiq.com' },
  { id: 'usr_stud_05', name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', email: 'priya.p@examiq.com' },
  { id: 'usr_stud_06', name: 'Marcus Johnson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', email: 'marcus.j@examiq.com' },
  { id: 'usr_stud_07', name: 'Sophia Kim', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', email: 'sophia.k@examiq.com' },
  { id: 'usr_stud_08', name: 'David Alaba', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', email: 'david.a@examiq.com' },
  { id: 'usr_stud_09', name: 'Ananya Roy', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', email: 'ananya.r@examiq.com' },
  { id: 'usr_stud_10', name: 'Liam O\'Connor', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', email: 'liam.o@examiq.com' },
  { id: 'usr_stud_11', name: 'Amina Diallo', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', email: 'amina.d@examiq.com' },
  { id: 'usr_stud_12', name: 'Ethan Garcia', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', email: 'ethan.g@examiq.com' },
  { id: 'usr_stud_13', name: 'Chloe Dubois', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', email: 'chloe.d@examiq.com' },
  { id: 'usr_stud_14', name: 'Arjun Mehta', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', email: 'arjun.m@examiq.com' },
  { id: 'usr_stud_15', name: 'Emma Watson-Reid', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', email: 'emma.w@examiq.com' },
  { id: 'usr_stud_16', name: 'Lucas Silva', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', email: 'lucas.s@examiq.com' },
  { id: 'usr_stud_17', name: 'Fatima Zahra', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', email: 'fatima.z@examiq.com' },
  { id: 'usr_stud_18', name: 'Noah Becker', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', email: 'noah.b@examiq.com' },
  { id: 'usr_stud_19', name: 'Mia Tanaka', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150', email: 'mia.t@examiq.com' },
  { id: 'usr_stud_20', name: 'Oliver Twist-Smith', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', email: 'oliver.t@examiq.com' },
  { id: 'usr_stud_21', name: 'Sara Lindqvist', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', email: 'sara.l@examiq.com' },
  { id: 'usr_stud_22', name: 'Tariq Mansoor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', email: 'tariq.m@examiq.com' },
  { id: 'usr_stud_23', name: 'Hannah Schmidt', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', email: 'hannah.s@examiq.com' },
  { id: 'usr_stud_24', name: 'Daniel Park', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', email: 'daniel.p@examiq.com' },
  { id: 'usr_stud_25', name: 'Zoe Kravitz-Young', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', email: 'zoe.k@examiq.com' },
];

// Helper to generate 25 realistic mock attempts for an exam
export const generateExamAnalyticsData = (examId) => {
  const allExams = getStoredExams();
  const exam = allExams.find((e) => e.id === examId) || allExams[0];
  const allQuestions = getStoredQuestions();
  const examQuestions = (exam.questionIds || []).map((qid) => allQuestions.find((q) => q.id === qid)).filter(Boolean);

  const totalMarks = examQuestions.reduce((sum, q) => sum + (q.marks || 0), 0) || 20;

  // Generate results for 22 students
  const attempts = MOCK_STUDENT_COHORT.slice(0, 22).map((stud, idx) => {
    // Generate varied distribution
    let percentage;
    if (idx < 3) percentage = Math.floor(90 + Math.random() * 9); // top performers (90-98%)
    else if (idx < 10) percentage = Math.floor(80 + Math.random() * 9); // B+ (80-88%)
    else if (idx < 17) percentage = Math.floor(68 + Math.random() * 11); // C to B (68-78%)
    else if (idx < 20) percentage = Math.floor(55 + Math.random() * 10); // borderline (55-64%)
    else percentage = Math.floor(38 + Math.random() * 12); // fail (<50%)

    const score = Number(((percentage / 100) * totalMarks).toFixed(1));
    const passed = percentage >= (exam.passingPercentage || 60);

    // Proctoring & Risk metrics
    let riskScore = 0;
    let riskLevel = 'LOW';
    const violations = [];

    if (idx === 2) {
      // Rahul Sharma has violations
      riskScore = 65;
      riskLevel = 'HIGH';
      violations.push({ timestamp: '10:14 AM', type: 'TAB_SWITCH', message: 'Candidate switched tabs for 18 seconds', weight: 20 });
      violations.push({ timestamp: '10:22 AM', type: 'MULTIPLE_FACES', message: 'Two faces detected in camera frame', weight: 25 });
      violations.push({ timestamp: '10:35 AM', type: 'FULLSCREEN_EXIT', message: 'Exited full-screen environment', weight: 15 });
    } else if (idx === 7) {
      // David Alaba medium risk
      riskScore = 35;
      riskLevel = 'MEDIUM';
      violations.push({ timestamp: '11:05 AM', type: 'FACE_NOT_DETECTED', message: 'Candidate face moved out of camera range', weight: 10 });
      violations.push({ timestamp: '11:18 AM', type: 'WINDOW_BLUR', message: 'Window lost focus', weight: 15 });
    } else if (idx % 4 === 0) {
      riskScore = 15;
      riskLevel = 'LOW';
      violations.push({ timestamp: '10:40 AM', type: 'WINDOW_BLUR', message: 'Temporary window focus change', weight: 10 });
    }

    return {
      attemptId: `att_${exam.id}_${stud.id}`,
      examId: exam.id,
      examTitle: exam.title,
      studentId: stud.id,
      studentName: stud.name,
      avatar: stud.avatar,
      email: stud.email,
      score,
      totalMarks,
      percentage,
      passed,
      submittedAt: new Date(Date.now() - (idx * 3600 * 1000 + 1800 * 1000)).toISOString(),
      timeSpentSeconds: (exam.duration || 45) * 60 - Math.floor(Math.random() * 600),
      riskScore,
      riskLevel,
      violationCount: violations.length,
      violations,
    };
  });

  // Calculate aggregates
  const totalAttempts = attempts.length;
  const scores = attempts.map((a) => a.score);
  const percentages = attempts.map((a) => a.percentage);

  const averageScore = Number((percentages.reduce((a, b) => a + b, 0) / totalAttempts).toFixed(1));
  const highestScore = Math.max(...percentages);
  const lowestScore = Math.min(...percentages);
  const passedCount = attempts.filter((a) => a.passed).length;
  const passRate = Number(((passedCount / totalAttempts) * 100).toFixed(1));

  // Score distribution histogram
  const distribution = [
    { range: '0-40%', count: attempts.filter((a) => a.percentage <= 40).length },
    { range: '41-60%', count: attempts.filter((a) => a.percentage > 40 && a.percentage <= 60).length },
    { range: '61-75%', count: attempts.filter((a) => a.percentage > 60 && a.percentage <= 75).length },
    { range: '76-90%', count: attempts.filter((a) => a.percentage > 75 && a.percentage <= 90).length },
    { range: '91-100%', count: attempts.filter((a) => a.percentage > 90).length },
  ];

  // Per-question difficulty analysis
  const perQuestionStats = examQuestions.map((q, qIdx) => {
    // Generate realistic correct rates
    const baseRate = q.difficulty === 'EASY' ? 82 : q.difficulty === 'MEDIUM' ? 64 : 44;
    const rate = Math.min(95, Math.max(30, baseRate + ((qIdx % 3) * 5 - 4)));
    const correctCount = Math.round((rate / 100) * totalAttempts);

    let computedDifficulty = 'MEDIUM';
    if (rate >= 75) computedDifficulty = 'EASY';
    else if (rate < 50) computedDifficulty = 'HARD';

    return {
      questionId: q.id,
      questionNumber: qIdx + 1,
      text: q.text,
      topic: q.topic,
      type: q.type,
      marks: q.marks,
      configuredDifficulty: q.difficulty,
      computedDifficulty,
      correctCount,
      totalAttempts,
      percentageCorrect: rate,
    };
  });

  // Top & bottom performers
  const sortedByScore = [...attempts].sort((a, b) => b.score - a.score);
  const topPerformers = sortedByScore.slice(0, 5);
  const bottomPerformers = [...sortedByScore].reverse().slice(0, 5);

  return {
    exam,
    totalAttempts,
    averageScore,
    highestScore,
    lowestScore,
    passRate,
    distribution,
    perQuestionStats,
    topPerformers,
    bottomPerformers,
    allAttempts: sortedByScore,
  };
};

// Live Exam Monitor Mock Candidates
export const MOCK_LIVE_CANDIDATES = [
  {
    id: 'cand_1',
    studentId: 'usr_stud_03',
    name: 'Rahul Sharma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    email: 'rahul.s@examiq.com',
    examId: 'exam_live_01',
    answeredCount: 4,
    totalQuestions: 6,
    timeRemainingSeconds: 1420,
    riskScore: 75,
    riskLevel: 'HIGH',
    violationCount: 4,
    violations: [
      { id: 'v1', timestamp: 'Just now', type: 'FACE_NOT_DETECTED', message: 'Candidate head turned away from screen', weight: 15 },
      { id: 'v2', timestamp: '3m ago', type: 'TAB_SWITCH', message: 'Switched to unauthorized external browser tab', weight: 25 },
      { id: 'v3', timestamp: '8m ago', type: 'MULTIPLE_FACES', message: 'Second person observed in background webcam frame', weight: 20 },
      { id: 'v4', timestamp: '14m ago', type: 'CLIPBOARD_PASTE', message: 'Attempted external clipboard paste into answer field', weight: 15 },
    ],
    status: 'IN_PROGRESS',
    lastPing: '2s ago',
  },
  {
    id: 'cand_2',
    studentId: 'usr_stud_01',
    name: 'Alex Morgan',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    email: 'student@examiq.com',
    examId: 'exam_live_01',
    answeredCount: 5,
    totalQuestions: 6,
    timeRemainingSeconds: 1180,
    riskScore: 8,
    riskLevel: 'LOW',
    violationCount: 0,
    violations: [],
    status: 'IN_PROGRESS',
    lastPing: '1s ago',
  },
  {
    id: 'cand_3',
    studentId: 'usr_stud_02',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    email: 'elena.r@examiq.com',
    examId: 'exam_live_01',
    answeredCount: 6,
    totalQuestions: 6,
    timeRemainingSeconds: 840,
    riskScore: 12,
    riskLevel: 'LOW',
    violationCount: 1,
    violations: [
      { id: 'v5', timestamp: '12m ago', type: 'WINDOW_BLUR', message: 'Window focus changed briefly', weight: 10 },
    ],
    status: 'IN_PROGRESS',
    lastPing: '3s ago',
  },
  {
    id: 'cand_4',
    studentId: 'usr_stud_08',
    name: 'David Alaba',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    email: 'david.a@examiq.com',
    examId: 'exam_live_01',
    answeredCount: 3,
    totalQuestions: 6,
    timeRemainingSeconds: 1650,
    riskScore: 45,
    riskLevel: 'MEDIUM',
    violationCount: 2,
    violations: [
      { id: 'v6', timestamp: '5m ago', type: 'FULLSCREEN_EXIT', message: 'Exited lockdown full-screen mode', weight: 20 },
      { id: 'v7', timestamp: '11m ago', type: 'FACE_NOT_DETECTED', message: 'Face undetected for 8 seconds', weight: 15 },
    ],
    status: 'IN_PROGRESS',
    lastPing: '4s ago',
  },
  {
    id: 'cand_5',
    studentId: 'usr_stud_05',
    name: 'Priya Patel',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    email: 'priya.p@examiq.com',
    examId: 'exam_live_01',
    answeredCount: 6,
    totalQuestions: 6,
    timeRemainingSeconds: 210,
    riskScore: 5,
    riskLevel: 'LOW',
    violationCount: 0,
    violations: [],
    status: 'SUBMITTED',
    lastPing: '10s ago',
  },
];

// Mock Subjective Submissions Pending Review
export const MOCK_PENDING_REVIEWS = [
  {
    reviewId: 'rev_01',
    examId: 'exam_comp_01',
    examTitle: 'General Physics: Mechanics & Thermodynamics',
    studentId: 'usr_stud_01',
    studentName: 'Alex Morgan',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    questionId: 'q_phy_05',
    questionText: 'State the Heisenberg Uncertainty Principle and its physical implication for quantum particles.',
    maxMarks: 5,
    modelAnswer: 'The principle states that the position and momentum of a particle cannot be simultaneously determined with arbitrary precision: Δx * Δp >= h / (4π). It implies that quantum entities do not have simultaneously well-defined positions and trajectories.',
    studentAnswer: 'The uncertainty principle means we cannot simultaneously measure both the position and momentum of a subatomic particle with total accuracy. The more accurately we measure position, the less we know about momentum.',
    aiScore: 4.5,
    aiConfidence: 92,
    aiFeedback: 'Accurately articulates the trade-off between position and momentum precision. Lacks explicit mathematical formulation (Δx * Δp >= h / 4π), but conceptually sound.',
    teacherScore: null,
    teacherComment: '',
    status: 'PENDING',
    submittedAt: '3 days ago',
  },
  {
    reviewId: 'rev_02',
    examId: 'exam_comp_01',
    examTitle: 'General Physics: Mechanics & Thermodynamics',
    studentId: 'usr_stud_03',
    studentName: 'Rahul Sharma',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    questionId: 'q_phy_06',
    questionText: 'Explain how Lenz\'s law relates to the principle of conservation of energy in electromagnetic induction.',
    maxMarks: 4,
    modelAnswer: 'Lenz\'s law states the induced EMF always opposes the change that produces it. If it didn\'t, energy would be created from nothing, violating the conservation of energy.',
    studentAnswer: 'Lenz law says induced current opposes magnetic change so energy is preserved.',
    aiScore: 2.5,
    aiConfidence: 85,
    aiFeedback: 'Mentions opposition to change and energy preservation, but answer is brief and lacks thermodynamic derivation.',
    teacherScore: null,
    teacherComment: '',
    status: 'PENDING',
    submittedAt: '3 days ago',
  },
  {
    reviewId: 'rev_03',
    examId: 'exam_comp_02',
    examTitle: 'Computer Networks & Internet Protocols',
    studentId: 'usr_stud_01',
    studentName: 'Alex Morgan',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    questionId: 'q_cs_06',
    questionText: 'Explain the TCP Three-Way Handshake process for establishing a connection.',
    maxMarks: 4,
    modelAnswer: '1) Client sends SYN packet with an initial sequence number. 2) Server responds with SYN-ACK packet acknowledging client seq and providing server seq. 3) Client returns ACK packet confirming server seq. Connection is then ESTABLISHED.',
    studentAnswer: 'The client sends a SYN packet, the server responds with a SYN-ACK packet acknowledging it, and then the client sends an ACK packet back. The connection is then open for two-way communication.',
    aiScore: 4.0,
    aiConfidence: 98,
    aiFeedback: 'Complete and accurate three-step sequencing. Full marks recommended.',
    teacherScore: null,
    teacherComment: '',
    status: 'PENDING',
    submittedAt: '7 days ago',
  },
];

// Leaderboard Mock Dataset
export const MOCK_LEADERBOARD_OVERALL = [
  { rank: 1, studentId: 'usr_stud_02', name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', examsTaken: 6, averageScore: 95.4, totalPoints: 114, badge: 'gold' },
  { rank: 2, studentId: 'usr_stud_07', name: 'Sophia Kim', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', examsTaken: 6, averageScore: 92.1, totalPoints: 110, badge: 'silver' },
  { rank: 3, studentId: 'usr_stud_04', name: 'Zackary Chen', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', examsTaken: 5, averageScore: 90.8, totalPoints: 98, badge: 'bronze' },
  { rank: 4, studentId: 'usr_stud_01', name: 'Alex Morgan', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', examsTaken: 5, averageScore: 88.7, totalPoints: 95, badge: null, isCurrentUser: true },
  { rank: 5, studentId: 'usr_stud_05', name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', examsTaken: 6, averageScore: 86.5, totalPoints: 92, badge: null },
  { rank: 6, studentId: 'usr_stud_12', name: 'Ethan Garcia', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', examsTaken: 4, averageScore: 84.0, totalPoints: 82, badge: null },
  { rank: 7, studentId: 'usr_stud_11', name: 'Amina Diallo', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', examsTaken: 5, averageScore: 82.3, totalPoints: 80, badge: null },
  { rank: 8, studentId: 'usr_stud_09', name: 'Ananya Roy', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', examsTaken: 4, averageScore: 80.5, totalPoints: 78, badge: null },
  { rank: 9, studentId: 'usr_stud_06', name: 'Marcus Johnson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', examsTaken: 5, averageScore: 79.2, totalPoints: 75, badge: null },
  { rank: 10, studentId: 'usr_stud_10', name: 'Liam O\'Connor', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', examsTaken: 4, averageScore: 77.0, totalPoints: 72, badge: null },
];


// ============================================================
// PHASE 4 ADDITIONS — do NOT remove anything above this line
// ============================================================

// Alias so adminApi.js can import MOCK_EXAMS
export const MOCK_EXAMS = INITIAL_EXAMS;

// ─── MOCK_ADMIN_USERS ────────────────────────────────────────
export const MOCK_ADMIN_USERS = [
  // Admins (2)
  {
    id: 'usr_admin_01',
    name: 'Alexander Wright',
    email: 'admin@examiq.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-01-15T08:00:00Z',
    lastLogin: '2026-11-13T18:30:00Z',
    avatar: null,
  },
  {
    id: 'usr_admin_02',
    name: 'Maria Santos',
    email: 'maria.santos@examiq.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-02-01T09:00:00Z',
    lastLogin: '2026-11-12T10:00:00Z',
    avatar: null,
  },
  // Teachers (4)
  {
    id: 'usr_teach_01',
    name: 'Prof. Sarah Jenkins',
    email: 'teacher@examiq.com',
    role: 'TEACHER',
    status: 'ACTIVE',
    createdAt: '2026-02-10T10:00:00Z',
    lastLogin: '2026-11-13T09:00:00Z',
    avatar: null,
  },
  {
    id: 'usr_teach_02',
    name: 'Dr. Robert Chen',
    email: 'robert.chen@examiq.com',
    role: 'TEACHER',
    status: 'ACTIVE',
    createdAt: '2026-03-01T10:00:00Z',
    lastLogin: '2026-11-11T14:00:00Z',
    avatar: null,
  },
  {
    id: 'usr_teach_03',
    name: 'Prof. Ayaan Kapoor',
    email: 'ayaan.kapoor@examiq.com',
    role: 'TEACHER',
    status: 'ACTIVE',
    createdAt: '2026-03-15T10:00:00Z',
    lastLogin: '2026-11-10T11:00:00Z',
    avatar: null,
  },
  {
    id: 'usr_teach_04',
    name: 'Dr. Laura Martinez',
    email: 'laura.martinez@examiq.com',
    role: 'TEACHER',
    status: 'INACTIVE',
    createdAt: '2026-04-01T10:00:00Z',
    lastLogin: '2026-10-20T15:00:00Z',
    avatar: null,
  },
  // Students (11)
  {
    id: 'usr_stud_01',
    name: 'Alex Morgan',
    email: 'student@examiq.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: '2026-06-01T10:00:00Z',
    lastLogin: '2026-11-13T20:00:00Z',
    avatar: null,
  },
  {
    id: 'usr_stud_02',
    name: 'Elena Rostova',
    email: 'elena.r@examiq.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: '2026-06-02T10:00:00Z',
    lastLogin: '2026-11-12T19:00:00Z',
    avatar: null,
  },
  {
    id: 'usr_stud_03',
    name: 'Rahul Sharma',
    email: 'rahul.s@examiq.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: '2026-06-03T10:00:00Z',
    lastLogin: '2026-11-11T18:00:00Z',
    avatar: null,
  },
  {
    id: 'usr_stud_04',
    name: 'Zackary Chen',
    email: 'zack.c@examiq.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: '2026-07-01T10:00:00Z',
    lastLogin: '2026-11-10T17:00:00Z',
    avatar: null,
  },
  {
    id: 'usr_stud_05',
    name: 'Priya Patel',
    email: 'priya.p@examiq.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: '2026-07-05T10:00:00Z',
    lastLogin: '2026-11-09T16:00:00Z',
    avatar: null,
  },
  {
    id: 'usr_stud_06',
    name: 'Marcus Johnson',
    email: 'marcus.j@examiq.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: '2026-08-01T10:00:00Z',
    lastLogin: '2026-11-08T15:00:00Z',
    avatar: null,
  },
  {
    id: 'usr_stud_07',
    name: 'Sophia Kim',
    email: 'sophia.k@examiq.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: '2026-08-10T10:00:00Z',
    lastLogin: '2026-11-07T14:00:00Z',
    avatar: null,
  },
  {
    id: 'usr_stud_08',
    name: 'James Okafor',
    email: 'james.o@examiq.com',
    role: 'STUDENT',
    status: 'INACTIVE',
    createdAt: '2026-09-01T10:00:00Z',
    lastLogin: '2026-10-15T13:00:00Z',
    avatar: null,
  },
  {
    id: 'usr_stud_09',
    name: 'Ananya Roy',
    email: 'ananya.r@examiq.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: '2026-09-10T10:00:00Z',
    lastLogin: '2026-11-06T12:00:00Z',
    avatar: null,
  },
  {
    id: 'usr_stud_10',
    name: "Liam O'Connor",
    email: 'liam.o@examiq.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: '2026-10-01T10:00:00Z',
    lastLogin: '2026-11-05T11:00:00Z',
    avatar: null,
  },
  {
    id: 'usr_stud_11',
    name: 'Amina Diallo',
    email: 'amina.d@examiq.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: '2026-10-10T10:00:00Z',
    lastLogin: '2026-11-04T10:00:00Z',
    avatar: null,
  },
  {
    id: 'usr_stud_12',
    name: 'Ethan Garcia',
    email: 'ethan.g@examiq.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: '2026-11-01T10:00:00Z',
    lastLogin: '2026-11-13T09:00:00Z',
    avatar: null,
  },
];

// ─── MOCK_CERTIFICATES ───────────────────────────────────────
export const MOCK_CERTIFICATES = [
  {
    id: 'EXQ-2026-MATH01',
    studentId: 'usr_stud_01',
    studentName: 'Alex Morgan',
    examId: 'exam_comp_01',
    examTitle: 'General Physics: Mechanics & Thermodynamics',
    subject: 'Physics',
    score: 82,
    percentage: 82,
    totalMarks: 100,
    grade: 'A',
    attemptId: 'attempt_result_01',
    issuedAt: '2026-11-06T12:00:00Z',
    isValid: true,
  },
  {
    id: 'EXQ-2026-JAVA02',
    studentId: 'usr_stud_01',
    studentName: 'Alex Morgan',
    examId: 'exam_comp_02',
    examTitle: 'Advanced Java Programming & OOP',
    subject: 'Java',
    score: 91,
    percentage: 91,
    totalMarks: 100,
    grade: 'A+',
    attemptId: 'attempt_result_02',
    issuedAt: '2026-10-30T12:00:00Z',
    isValid: true,
  },
  {
    id: 'EXQ-2026-DB03',
    studentId: 'usr_stud_01',
    studentName: 'Alex Morgan',
    examId: 'exam_comp_03',
    examTitle: 'Database Management Systems & SQL',
    subject: 'DBMS',
    score: 78,
    percentage: 78,
    totalMarks: 100,
    grade: 'B+',
    attemptId: 'attempt_result_03',
    issuedAt: '2026-10-20T12:00:00Z',
    isValid: true,
  },
  {
    id: 'EXQ-2026-NET04',
    studentId: 'usr_stud_02',
    studentName: 'Elena Rostova',
    examId: 'exam_comp_01',
    examTitle: 'Computer Networks & Internet Protocols',
    subject: 'Networks',
    score: 95,
    percentage: 95,
    totalMarks: 100,
    grade: 'A+',
    attemptId: 'attempt_elena_01',
    issuedAt: '2026-11-01T12:00:00Z',
    isValid: true,
  },
  {
    id: 'EXQ-2026-MATH05',
    studentId: 'usr_stud_02',
    studentName: 'Elena Rostova',
    examId: 'exam_comp_02',
    examTitle: 'Engineering Mathematics II',
    subject: 'Mathematics',
    score: 88,
    percentage: 88,
    totalMarks: 100,
    grade: 'A',
    attemptId: 'attempt_elena_02',
    issuedAt: '2026-10-15T12:00:00Z',
    isValid: true,
  },
];

// ─── MOCK_INVALID_CERT_IDS ────────────────────────────────────
export const MOCK_INVALID_CERT_IDS = [
  'EXQ-2026-REVOKD',
  'EXQ-2026-FAKEXX',
  'EXQ-2024-EXPIRD',
];

// ─── MOCK_ADMIN_STATS ─────────────────────────────────────────
export const MOCK_ADMIN_STATS = {
  totalUsers: 17,
  usersByRole: { ADMIN: 2, TEACHER: 4, STUDENT: 11 },
  totalExams: 6,
  activeExams: 1,
  certificatesIssued: 12,
  monthlyUserGrowth: [
    { month: 'Jun', count: 3 },
    { month: 'Jul', count: 6 },
    { month: 'Aug', count: 9 },
    { month: 'Sep', count: 12 },
    { month: 'Oct', count: 15 },
    { month: 'Nov', count: 17 },
  ],
  examsByStatus: { UPCOMING: 2, LIVE: 1, COMPLETED: 3 },
};
