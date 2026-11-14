# ExamIQ — Frontend

> An online examination platform built with **React 19 + Vite + Tailwind CSS v3**.  
> Currently at **Phase 4** (Certificates, Public Verification & Admin Pages).

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19, Vite 8 |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS v3 (dark-mode `class`) |
| State | Zustand (persisted with localStorage) |
| Forms | React Hook Form + Zod |
| HTTP | Axios (with JWT auto-attach + 401 refresh retry) |
| Charts | Recharts |
| Toast | React Hot Toast |
| Export | jspdf + html2canvas (PDF), xlsx (Excel) |
| QR Code | qrcode.react |
| Real-time | @stomp/stompjs (STOMP/WebSocket, mock emitter in dev) |
| Icons | Lucide React |

---

## Quick Start

```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:8080, VITE_USE_MOCK=true
npm install
npm run dev                 # http://localhost:5173
```

### Mock Credentials (password: `Demo@123`)

| Role | Email |
|---|---|
| Admin | admin@examiq.com |
| Teacher | teacher@examiq.com |
| Student | student@examiq.com |

---

## Project Structure

```
src/
├── api/            # Axios instance + all API modules (mock + real)
│   ├── axiosInstance.js       JWT interceptor, 401 refresh retry
│   ├── authApi.js             Login, register, forgot-password
│   ├── questionApi.js         CRUD question bank
│   ├── examApi.js             CRUD exams, duplicate
│   ├── attemptApi.js          Start / save / submit attempts
│   ├── resultApi.js           Fetch student results
│   ├── aiApi.js               AI question generation, grading, feedback
│   ├── analyticsApi.js        Exam analytics & leaderboard
│   ├── monitorApi.js          Live candidate monitor & subjective review
│   ├── certificateApi.js      Certificate generation & verification
│   ├── adminApi.js            Admin user management, exam overview, stats
│   └── mockData.js            In-memory + localStorage mock data engine
│
├── components/
│   ├── ui/                    Button, Input, Select, Modal, Table, Badge,
│   │                          Card, Tabs, Skeleton, EmptyState, ConfirmDialog, StatCard
│   ├── layout/                AdminLayout, TeacherLayout, StudentLayout,
│   │                          Sidebar, Topbar, MobileBottomNav
│   ├── certificate/           Certificate.jsx (print-ready, QR code)
│   ├── exam/                  AIFeedback (topic radar + study tips)
│   └── proctoring/            WebcamThumbnail, ProctoringWarningModal
│
├── pages/
│   ├── auth/                  Login, Register, ForgotPassword
│   ├── public/                Landing, NotFound, VerifyCertificate
│   ├── admin/                 AdminDashboard, UserManagement, AllExams
│   ├── teacher/               TeacherDashboard, QuestionBank, ExamWizard,
│   │                          ExamList, AiQuestionGenerator, LiveMonitor,
│   │                          ExamAnalytics, SubjectiveReview
│   └── student/               StudentDashboard, AvailableExams, ExamAttempt,
│                              MyResults, ExamResult, Leaderboard, MyCertificates
│
├── routes/         AppRoutes.jsx, ProtectedRoute.jsx, RoleRoute.jsx
├── store/          authStore.js (Zustand), themeStore.js
└── utils/          constants.js, validators.js, formatters.js
```

---

## Route Map

### Public (no login required)
| Path | Component |
|---|---|
| `/` | Landing |
| `/login` | Login |
| `/register` | Register |
| `/forgot-password` | ForgotPassword |
| `/verify` | VerifyCertificate (search form) |
| `/verify/:certificateId` | VerifyCertificate (auto-verify ID) |

### Admin (`/admin/*`, role: ADMIN)
| Path | Component | Phase |
|---|---|---|
| `/admin/dashboard` | AdminDashboard (stats + charts) | 1 / **4** |
| `/admin/users` | UserManagement | **4** |
| `/admin/exams` | AllExams | **4** |

### Teacher (`/teacher/*`, role: TEACHER)
| Path | Component | Phase |
|---|---|---|
| `/teacher/dashboard` | TeacherDashboard | 1 |
| `/teacher/questions` | QuestionBank | 2 |
| `/teacher/exams` | ExamList | 2 |
| `/teacher/exams/new` | ExamWizard | 2 |
| `/teacher/exams/:id/edit` | ExamWizard | 2 |
| `/teacher/ai-generator` | AiQuestionGenerator | 3 |
| `/teacher/monitor` | LiveMonitor | 3 |
| `/teacher/monitor/:examId` | LiveMonitor (filtered) | 3 |
| `/teacher/exams/:id/analytics` | ExamAnalytics | 3 |
| `/teacher/exams/:id/review` | SubjectiveReview | 3 |
| `/teacher/review` | SubjectiveReview (global) | 3 |

### Student (`/student/*`, role: STUDENT)
| Path | Component | Phase |
|---|---|---|
| `/student/dashboard` | StudentDashboard | 1 |
| `/student/exams` | AvailableExams | 2 |
| `/student/exams/:id/attempt` | ExamAttempt (fullscreen) | 2 |
| `/student/results` | MyResults | 2 |
| `/student/results/:attemptId` | ExamResult | 2+3 |
| `/student/leaderboard` | Leaderboard | 3 |
| `/student/certificates` | MyCertificates | **4** |

---

## Phase 4 — Certificates, Verification & Admin

### Digital Certificates (Student)

- When a student **passes** an exam, a certificate with a unique ID (`EXQ-2026-XXXXXX`) is auto-generated and stored in localStorage.
- **Certificate component** (`components/certificate/Certificate.jsx`): 1056×748 print-style design with ExamIQ branding, student name, exam title, score/grade, issue date, certificate ID, signature area, and a QR code pointing to `/verify/{id}`.
- **My Certificates page** (`/student/certificates`): responsive grid of certificate cards; each card shows the exam, score, grade, and date. Preview in a modal; **Download PDF** (html2canvas → jsPDF, landscape A4).
- On the **Result page** a "View Certificate" button appears when the student passed.
- Sidebar and mobile bottom-nav links added.

### Public Verification (`/verify/:certificateId`)

- No login or sidebar required — fully public.
- **Green VALID state**: student name, exam, score/grade, date, certificate ID.
- **Red INVALID state**: "Certificate not found" for revoked or non-existent IDs.
- Loading skeleton while verifying; search box to verify another ID manually.
- URL updates when a new ID is searched so the page is shareable/bookmarkable.

### Admin Pages

#### User Management (`/admin/users`)
- Full-featured table: search (name/email), role filter, status filter, pagination (10/page).
- **Change role** via inline `<select>` — calls `updateUserRole`.
- **Deactivate/Activate** with ConfirmDialog — calls `setUserStatus`.
- **Delete** with ConfirmDialog — calls `deleteUser`.
- Self-protection: an admin cannot deactivate or delete their own account.
- **Add User** modal — name, email, role with Zod validation.

#### All Exams Overview (`/admin/exams`)
- Table of all platform exams: title, teacher, subject, computed status badge (Upcoming/Live/Completed), duration, start date.
- Search (title/teacher) + status filter + pagination.
- **View Details** modal with full exam info.
- **Delete** exam with ConfirmDialog.

#### Admin Dashboard (updated)
- Stat cards fetched from `getAdminStats()`: total users, teachers, students, certificates issued.
- Two new Recharts charts: monthly user growth (BarChart) and exams-by-status (PieChart).
- Quick action cards linking to `/admin/users` and `/admin/exams`.
- Loading skeletons while stats load.

---

## Phase 3 — AI & Smart Features

### Teacher

#### AI Question Generator (`/teacher/ai-generator`)
- Enter topic, paste notes, pick count (1–20), difficulty, format
- Animated "Synthesizing..." skeleton while the mock AI runs (~900 ms)
- Preview as editable cards; select/deselect and delete; **Regenerate** button
- **Save selected to Question Bank** persists to mock localStorage store

#### Live Exam Monitor (`/teacher/monitor`, `/teacher/monitor/:examId`)
- Real-time candidate table: name, progress bar, time left, risk badge, violation count
- Powered by `useWebSocket` hook — mock emitter fires every 5 s in dev; connects to STOMP `/topic/exam.{id}` in production
- Live Alerts feed with severity colour coding; click any row → violation drawer

#### Exam Analytics (`/teacher/exams/:id/analytics`)
- Stat cards: class average, highest, lowest, pass rate, total attempts
- Recharts: score distribution histogram, per-question accuracy bars, score trend line
- Top-5 / Bottom-5 performer tables; per-question item table
- **Export**: `.xlsx` (xlsx package), `.pdf` (jspdf + jspdf-autotable)

#### Subjective Answer Review (`/teacher/exams/:id/review`)
- Lists all short-answer responses with student answer vs model answer
- **Grade with AI** (mock) — returns suggested score + semantic feedback
- Teacher can override score and add a comment, then save (persists to localStorage)

### Student

#### Smart Proctoring (inside ExamAttempt)
> ⚠️ **Camera permission required.** The browser will ask for webcam access on the pre-exam screen.

- Pre-exam camera preview; floating webcam thumbnail during exam
- Detects: tab switch, window blur, fullscreen exit, copy, paste, right-click
- Each violation shows a warning modal/toast; cheating-risk score 0–100
- **Auto-submit after 5 violations** with a clear warning message

#### Adaptive Testing (inside ExamAttempt)
- Starts at MEDIUM; correct → HARD; wrong → EASY
- Difficulty-level indicator; forward-only navigation

#### AI Feedback Panel (ExamResult)
- Topic-by-topic accuracy bars, strong/weak topics, 4–5 personalised study suggestions
- **Regenerate feedback** button

#### Leaderboard (`/student/leaderboard`)
- Overall tab and Per-Exam tab; gold/silver/bronze badges; current student highlighted

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | Backend base URL |
| `VITE_USE_MOCK` | `true` | Use in-memory mock data instead of real API |

---

## Switching to the Real Spring Boot Backend

```bash
# .env
VITE_API_URL=http://localhost:8080
VITE_USE_MOCK=false
```

### Expected REST Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Login → JWT |
| POST | `/api/auth/register` | Register → user |
| POST | `/api/auth/refresh` | Refresh JWT |
| POST | `/api/auth/forgot-password` | Reset email |
| GET/POST | `/api/questions` | List / create questions |
| PUT/DELETE | `/api/questions/:id` | Update / delete question |
| GET/POST | `/api/exams` | List / create exams |
| PUT/DELETE | `/api/exams/:id` | Update / delete exam |
| POST | `/api/exams/:id/attempt` | Start attempt |
| PUT | `/api/exams/:id/attempt/:aId` | Save progress |
| POST | `/api/exams/:id/attempt/:aId/submit` | Submit attempt |
| GET | `/api/results` | Student result list |
| GET | `/api/results/:attemptId` | Single result |
| POST | `/api/ai/generate-questions` | AI question generation |
| POST | `/api/ai/grade-answer` | AI short-answer grading |
| GET | `/api/ai/feedback/:attemptId` | AI personalised feedback |
| GET | `/api/analytics/exams/:id` | Exam analytics data |
| GET | `/api/leaderboard` | Global leaderboard |
| WS | `/ws` (STOMP) | Live monitor socket |
| GET/POST | `/api/certificates` | List / create certificates |
| GET | `/api/certificates/:id` | Get single certificate |
| GET | `/api/certificates/verify/:id` | Public verify |
| GET | `/api/admin/users` | Admin: list users |
| POST | `/api/admin/users` | Admin: create user |
| PATCH | `/api/admin/users/:id/role` | Admin: change role |
| PATCH | `/api/admin/users/:id/status` | Admin: set status |
| DELETE | `/api/admin/users/:id` | Admin: delete user |
| GET | `/api/admin/exams` | Admin: all exams |
| DELETE | `/api/admin/exams/:id` | Admin: delete exam |
| GET | `/api/admin/stats` | Admin: platform stats |

---

## Screenshots

> _Screenshots placeholder — add images to `docs/screenshots/` and link them here._

---

## Build & Dev

```bash
npm run build     # Production build → dist/
npm run dev       # Dev server at http://localhost:5173
npm run preview   # Preview the production build locally
```

> Large chunks (ExamAnalytics, jspdf, html2canvas) are expected. Consider dynamic `import()` inside handlers if initial load time becomes a concern.
