# ExamIQ 🎓

> An AI-powered, proctored online examination and academic assessment platform featuring automated grading, real-time candidate monitoring, deep analytics, and cryptographic certificate verification.

---

## 🚀 Overview

**ExamIQ** is an enterprise-grade digital assessment platform designed for educational institutions, universities, and certification bodies. Built on a resilient **Spring Boot 3** backend and a reactive **React + Tailwind CSS** frontend, ExamIQ delivers secure, fair, and high-performance testing experiences with intelligent automated grading, real-time proctoring telemetry, and academic analytics.

---

## ✨ Features

- **🔐 Robust JWT Authentication & RBAC**: Stateless access and refresh token rotation with granular role-based permissions (`ADMIN`, `TEACHER`, `STUDENT`). Includes user profile management, session recovery, and security guards.
- **📚 Question Bank & Tagging**: Multi-format question repository (Single-choice MCQ, Multi-choice, Subjective/Short Answer) with topic classification, empirical difficulty tracking, explanations, and pagination filters.
- **⏱️ Timed Assessments & Autosave**: Timed exam execution with continuous background autosave, question state navigation (answered, marked for review, skipped), and automated submission upon countdown expiration.
- **⚡ Instant Auto-Grading & Subjective Evaluation**: Immediate automated scoring for objective questions with configurable negative marking penalties, alongside dedicated instructor review queues for subjective evaluations and manual score overrides.
- **🤖 AI Question Generator**: On-demand curriculum-aligned question generation tailored by subject, topic, target difficulty, and question type.
- **🎯 Adaptive Testing Engine**: Dynamic difficulty calibration adapting consecutive questions in real-time based on student response accuracy.
- **👁️ AI & Camera Proctoring with Risk Scoring**: Webcam-assisted proctoring and browser telemetry tracking tab switches, window blur events, full-screen violations, and multi-face detections into a calculated cumulative risk score.
- **📊 Comprehensive Examination Analytics**: Visualized cohort performance metrics including class mean, pass rates, score distribution histograms, Item Response Theory (IRT) question accuracy rates, and one-click Gradebook exports to Excel (`.xlsx`) and PDF.
- **🏆 Academic Hall of Fame & Leaderboard**: Global cohort standings and assessment-specific rankings featuring medalist badges (🥇 Gold, 🥈 Silver, 🥉 Bronze), average scores, and candidate profile cards.
- **📜 Tamper-Proof Certificates & QR Verification**: Automated digital certificate generation upon meeting passing thresholds, featuring unique identifiers (e.g. `EXQ-2026-MATH01`), embedded QR verification codes, and a public verification portal without requiring authentication.
- **🛡️ Comprehensive Admin Dashboard**: Administrative control over platform KPIs, exam lifecycles, and user directories with account activation toggles, role reassignment, duplicate email prevention, and self-deletion safeguards.
- **📡 Real-Time Live Proctoring Monitor**: Live supervisor dashboard powered by WebSocket (STOMP) connections displaying active candidate progress, risk indicators, violation alerts, and heartbeat telemetry.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Auth & Theme stores)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Document & Spreadsheet Export**: [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable), [XLSX](https://sheetjs.com/)
- **HTTP Client**: [Axios](https://axios-http.com/) with automatic token refresh interceptors

### Backend
- **Framework**: [Spring Boot 3.2.5](https://spring.io/projects/spring-boot)
- **Runtime**: Java 21 LTS
- **Security**: Spring Security 6 with JWT (HS256) stateless authentication
- **Persistence**: Spring Data JPA & Hibernate 6
- **Database**: In-memory H2 (Development & Testing) / PostgreSQL-ready schema (Production)
- **Real-Time Communication**: Spring WebSocket with STOMP message broker
- **API Documentation**: SpringDoc OpenAPI 3 / Swagger UI (`/swagger-ui.html`)
- **Build Tool**: Apache Maven Wrapper (`mvnw`)

---

## 🏃 Getting Started

### Prerequisites
- **Java**: JDK 21 LTS (e.g. [Eclipse Adoptium Temurin 21](https://adoptium.net/))
- **Node.js**: v18.x or higher & `npm`

---

### 1. Running the Backend

The backend is pre-configured with the `dev` profile, using an in-memory H2 database that automatically seeds idempotent demonstration data on startup.

#### On Windows:
```cmd
cd backend
run.bat
```
*Alternatively, using the Maven Wrapper:*
```powershell
cd backend
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
.\mvnw.cmd spring-boot:run
```

#### On Linux / macOS:
```bash
cd backend
./mvnw spring-boot:run
```

- **API Base URL**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **H2 Console**: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:examiq`, User: `sa`, Password: *empty*)

---

### 2. Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

- **Application URL**: `http://localhost:5173`

---

## 🔑 Demo Credentials

The backend seeds demonstration accounts automatically on initial startup:

| Role | Email | Password | Preloaded Access |
| :--- | :--- | :--- | :--- |
| **Platform Admin** | `admin@examiq.com` | `Demo@123` | Platform analytics, user directory, exam management, global KPIs |
| **Teacher / Lecturer** | `teacher@examiq.com` | `Demo@123` | Exam wizard, question bank, live monitor, subjective review, gradebook |
| **Student / Candidate** | `student@examiq.com` | `Demo@123` | Live exam attempts, results review, AI feedback, leaderboard, certificates |

---

## ⚙️ Mock Mode vs. Real Backend

ExamIQ supports both live backend communication and an isolated client-side mock mode for offline demonstration or frontend design:

Configure your setting in [`frontend/.env`](./frontend/.env):

```env
# Set to 'false' to communicate with the Spring Boot backend on localhost:8080
VITE_USE_MOCK=false

# Backend API Base URL
VITE_API_URL=http://localhost:8080
```

- **`VITE_USE_MOCK=false` (Production / Real Mode)**: Frontend makes real REST requests via Axios to `http://localhost:8080`, with authentic JWT tokens, live database persistence, and real-time validations.
- **`VITE_USE_MOCK=true` (Offline Mock Mode)**: All API calls are simulated using in-memory mock datasets in `frontend/src/api/mockData.js`, requiring no running backend.

---

## 🧪 Testing

### Backend Unit & Integration Tests
Run the comprehensive test suite (including JPA integration and security test cases):
```powershell
cd backend
.\mvnw.cmd clean test
```

### End-to-End API Flow Verification
To run the automated PowerShell audit suite covering all 47 endpoints and workflows:
```powershell
powershell -ExecutionPolicy Bypass -File "test_all_flows.ps1"
```

### Frontend Production Build
Verify compilation, module resolution, and asset bundling:
```bash
cd frontend
npm run build
```

---

## 📸 Screenshots

*(Place application UI screenshots in `docs/screenshots/`)*

| Live Exam Attempt with Proctoring | Teacher Analytics & IRT Stats |
| :---: | :---: |
| ![Live Attempt Placeholder](https://placehold.co/600x380/0f172a/38bdf8?text=ExamIQ+Live+Attempt+%2B+Proctoring) | ![Analytics Placeholder](https://placehold.co/600x380/0f172a/38bdf8?text=Exam+Analytics+%26+Gradebook) |

| Real-Time Live Supervisor Monitor | Verifiable Digital Certificate |
| :---: | :---: |
| ![Live Monitor Placeholder](https://placehold.co/600x380/0f172a/38bdf8?text=Live+Candidate+Monitor) | ![Certificate Placeholder](https://placehold.co/600x380/0f172a/38bdf8?text=Certificate+with+QR+Verification) |

---

## 📂 Project Structure

```
EXAM IQ/
├── backend/
│   ├── .mvn/wrapper/                 # Maven wrapper configuration & binaries
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/examiq/
│   │   │   │   ├── config/           # SecurityConfig, CorsConfig, WebSocketConfig, DataSeeder
│   │   │   │   ├── controller/       # Auth, Exam, Attempt, Result, Monitor, Analytics, Certificate, Admin
│   │   │   │   ├── dto/              # Request & Response payload definitions
│   │   │   │   ├── entity/           # JPA Entities (User, Exam, Question, Attempt, Certificate, etc.)
│   │   │   │   ├── exception/        # Global exception handler & custom exceptions
│   │   │   │   ├── repository/       # Spring Data JPA repositories
│   │   │   │   ├── security/         # JWT filter, UserDetailsService, TokenProvider
│   │   │   │   └── service/          # Core business logic, auto-grading, analytics aggregation
│   │   │   └── resources/
│   │   │       ├── application.yml   # Multi-profile application configuration
│   │   │       └── schema.sql        # Database initialization schema
│   │   └── test/java/com/examiq/     # Controller & Service unit/integration test suites
│   ├── pom.xml                       # Maven dependencies & build plugins
│   ├── mvnw.cmd                      # Windows Maven wrapper
│   └── run.bat                       # One-click Windows launch script
│
├── frontend/
│   ├── src/
│   │   ├── api/                      # Axios client, auth interceptors, API service modules
│   │   ├── components/               # Reusable UI library (Buttons, Cards, Modals, Tables, Topbar)
│   │   ├── pages/
│   │   │   ├── admin/                # Admin Dashboard, User Directory, Exam Overview
│   │   │   ├── student/              # Available Exams, Attempt Interface, Results, Leaderboard, Certificates
│   │   │   └── teacher/              # Teacher Dashboard, Exam Wizard, Question Bank, Live Monitor, Analytics
│   │   ├── store/                    # Zustand stores (authentication, UI theme state)
│   │   ├── routes/                   # Protected route wrappers and application routing
│   │   ├── App.jsx                   # Main React entry & toast provider
│   │   └── main.jsx                  # React DOM mount point
│   ├── package.json                  # NPM packages & build scripts
│   ├── vite.config.js                # Vite build and server settings
│   └── tailwind.config.js            # Tailwind typography and theme design tokens
│
├── test_all_flows.ps1                # Automated 47-point end-to-end integration test script
└── README.md                         # Main repository documentation
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
