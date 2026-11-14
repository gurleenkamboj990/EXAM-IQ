# ExamIQ Backend

A Spring Boot REST API for the ExamIQ intelligent examination platform.

## Quick Start (Dev — zero setup, H2 in-memory)

**Prerequisites:** JDK 21 (Temurin / Adoptium).  
*(No Maven installation needed — the project bundles a self-contained Maven Wrapper and Maven 3.9.9 under `.tools/`)*.

### Option A: Using `run.bat` (Easiest on Windows)
Simply double-click or run from PowerShell / cmd:
```cmd
cd backend
run.bat
```

### Option B: Using the Maven Wrapper
```powershell
cd backend

# Run all tests (16 tests, 100% passing)
.\mvnw.cmd clean test


# Start the Spring Boot backend
.\mvnw.cmd spring-boot:run
```

The server starts on **http://localhost:8080**.

## Demo Credentials

| Role    | Email                   | Password  |
|---------|-------------------------|-----------|
| Admin   | admin@examiq.com        | Demo@123  |
| Teacher | teacher@examiq.com      | Demo@123  |
| Student | student@examiq.com      | Demo@123  |

## Swagger / API Docs

- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/v3/api-docs
- **H2 Console (dev):** http://localhost:8080/h2-console  
  JDBC URL: `jdbc:h2:mem:examiq` · User: `sa` · Password: *(empty)*

## Production (Docker + PostgreSQL)

```bash
docker-compose up --build
```

Customize via environment variables in `docker-compose.yml`:

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | *(dev default)* | HS256 key — must be ≥ 32 chars in prod |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |
| `LLM_API_KEY` | *(empty)* | Optional — enables real AI grading/generation |

## Endpoint Reference

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register (STUDENT or TEACHER) |
| POST | `/api/auth/login` | Public | Login → `{ accessToken, refreshToken, user }` |
| POST | `/api/auth/refresh` | Public | Rotate tokens |
| POST | `/api/auth/logout` | Public | Revoke refresh token |
| POST | `/api/auth/forgot-password` | Public | Send reset link |
| GET  | `/api/users/me` | Any | Current user profile |

### Questions
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/questions` | Teacher/Admin | List with filter + pagination |
| POST | `/api/questions` | Teacher/Admin | Create question |
| GET | `/api/questions/{id}` | Teacher/Admin | Get question |
| PUT | `/api/questions/{id}` | Teacher/Admin | Update question |
| DELETE | `/api/questions/{id}` | Teacher/Admin | Delete question |

### Exams
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/exams` | Any | List (students see published only) |
| POST | `/api/exams` | Teacher/Admin | Create exam |
| GET | `/api/exams/{id}` | Any | Get exam detail |
| PUT | `/api/exams/{id}` | Teacher/Admin | Update exam |
| DELETE | `/api/exams/{id}` | Teacher/Admin | Delete exam |
| POST | `/api/exams/{id}/duplicate` | Teacher/Admin | Duplicate exam |

### Attempts & Results
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/exams/{id}/attempt` | Student | Start attempt |
| PUT | `/api/exams/{id}/attempt/{attemptId}/answers` | Student | Auto-save answers |
| POST | `/api/exams/{id}/attempt/{attemptId}/submit` | Student | Submit & grade |
| GET | `/api/results` | Student | My results list |
| GET | `/api/results/{attemptId}` | Student/Teacher | Full result + review |
| PUT | `/api/results/{attemptId}/review` | Teacher | Override subjective score |

### AI
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/ai/generate-questions` | Teacher/Admin | AI question generation |
| POST | `/api/ai/feedback` | Any | AI feedback on answer |
| POST | `/api/ai/grade-answer` | Teacher/Admin | AI grade short answer |

### Analytics & Leaderboard
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/analytics/exams/{id}` | Teacher/Admin | Exam analytics |
| GET | `/api/leaderboard` | Any | Overall leaderboard |
| GET | `/api/leaderboard/{examId}` | Any | Per-exam leaderboard |

### Certificates
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/certificates` | Student | My certificates |
| GET | `/api/certificates/verify/{id}` | **Public** | Verify certificate |

### Admin
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/users` | Admin | List all users |
| POST | `/api/admin/users` | Admin | Add user |
| PUT | `/api/admin/users/{id}/role` | Admin | Change role |
| PUT | `/api/admin/users/{id}/status` | Admin | Activate/deactivate |
| DELETE | `/api/admin/users/{id}` | Admin | Delete user |
| GET | `/api/admin/exams` | Admin | All exams |
| DELETE | `/api/admin/exams/{id}` | Admin | Delete exam |

### Notifications
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | Any | My notifications |
| PUT | `/api/notifications/{id}/read` | Any | Mark read |
| PUT | `/api/notifications/read-all` | Any | Mark all read |

### Live Monitor
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/monitor/{examId}` | Teacher/Admin | Live exam monitor data |
| WS  | `/ws` (STOMP) | — | Subscribe `/topic/exams/{id}` |

## Stack

- **Java 21**, Spring Boot 3.2.5
- **Spring Security** — stateless JWT (jjwt 0.12.6)
- **Spring Data JPA** — H2 (dev) / PostgreSQL (prod)
- **springdoc-openapi** 2.5.0
- **Lombok**, **Jakarta Validation**

## Project Structure

```
src/main/java/com/examiq/
├── config/          SecurityConfig, CorsConfig, OpenApiConfig, DataSeeder
├── controller/      REST controllers (Auth, Exam, Question, Attempt, ...)
├── dto/             Request + Response DTOs
├── entity/          JPA entities (never exposed directly)
├── exception/       GlobalExceptionHandler, custom exceptions
├── repository/      Spring Data JPA interfaces
├── security/        JwtTokenProvider, JwtAuthenticationFilter
└── service/         Business logic
```

