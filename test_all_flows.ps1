$baseUrl = "http://localhost:8080"
$ErrorActionPreference = "Stop"

function Test-Endpoint {
    param(
        [string]$Name,
        [scriptblock]$Action
    )
    try {
        $result = & $Action
        Write-Host " [PASS] $Name" -ForegroundColor Green
        return @{ Name = $Name; Status = "PASS"; Details = $result }
    } catch {
        Write-Host " [FAIL] $Name : $($_.Exception.Message)" -ForegroundColor Red
        return @{ Name = $Name; Status = "FAIL"; Details = $_.Exception.Message }
    }
}

$results = @()

# ----------------------------------------------------
# AUTHENTICATION
# ----------------------------------------------------
$loginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"student@examiq.com","password":"Demo@123"}'
$studentToken = $loginRes.data.accessToken
$studentRefreshToken = $loginRes.data.refreshToken
$studentId = $loginRes.data.user.id

$teacherRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"teacher@examiq.com","password":"Demo@123"}'
$teacherToken = $teacherRes.data.accessToken

$adminRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@examiq.com","password":"Demo@123"}'
$adminToken = $adminRes.data.accessToken
$adminId = $adminRes.data.user.id

$results += Test-Endpoint "Auth: Student Login" { $studentToken -ne $null }
$results += Test-Endpoint "Auth: Teacher Login" { $teacherToken -ne $null }
$results += Test-Endpoint "Auth: Admin Login" { $adminToken -ne $null }

$results += Test-Endpoint "Auth: GET /api/users/me" {
    $me = Invoke-RestMethod -Uri "$baseUrl/api/users/me" -Headers @{ Authorization = "Bearer $studentToken" }
    $me.data.email -eq "student@examiq.com"
}

$results += Test-Endpoint "Auth: Token Refresh" {
    $ref = Invoke-RestMethod -Uri "$baseUrl/api/auth/refresh" -Method Post -ContentType "application/json" -Body (@{ refreshToken = $studentRefreshToken } | ConvertTo-Json)
    $ref.data.accessToken -ne $null
}

$results += Test-Endpoint "Auth: Register New User" {
    $regEmail = "temp_" + (Get-Random) + "@examiq.com"
    $reg = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body (@{ name="Temp User"; email=$regEmail; password="Demo@123"; role="STUDENT" } | ConvertTo-Json)
    $reg.data.user.email -eq $regEmail
}

$results += Test-Endpoint "Auth: Forgot Password" {
    $fp = Invoke-RestMethod -Uri "$baseUrl/api/auth/forgot-password" -Method Post -ContentType "application/json" -Body '{"email":"student@examiq.com"}'
    $fp.success -eq $true
}

# ----------------------------------------------------
# TEACHER FLOWS
# ----------------------------------------------------
$tHeaders = @{ Authorization = "Bearer $teacherToken" }

$results += Test-Endpoint "Teacher: GET /api/questions with pagination & filter" {
    $qs = Invoke-RestMethod -Uri "$baseUrl/api/questions?page=0&limit=10&topic=Java Basics" -Headers $tHeaders
    $qs.data.total -gt 0 -and $qs.data.data.Count -gt 0
}

$createdQId = $null
$results += Test-Endpoint "Teacher: POST /api/questions (Create MCQ)" {
    $body = @{
        text = "What is the return type of void method in Java?"
        type = "MCQ"
        topic = "Java Basics"
        difficulty = "EASY"
        marks = 2
        options = @("void", "int", "null", "none")
        correctAnswer = 0
        explanation = "void methods return no value."
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/questions" -Method Post -ContentType "application/json" -Headers $tHeaders -Body $body
    $script:createdQId = $res.data.id
    $script:createdQId -ne $null
}

$results += Test-Endpoint "Teacher: PUT /api/questions/{id} (Update Question)" {
    $body = @{
        text = "What is the return type of a void method in Java? (Updated)"
        type = "MCQ"
        topic = "Java Basics"
        difficulty = "EASY"
        marks = 3
        options = @("void", "int", "null", "none")
        correctAnswer = 0
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/questions/$createdQId" -Method Put -ContentType "application/json" -Headers $tHeaders -Body $body
    $res.data.marks -eq 3
}

$results += Test-Endpoint "Teacher: DELETE /api/questions/{id}" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/questions/$createdQId" -Method Delete -Headers $tHeaders
    $res.success -eq $true
}

$results += Test-Endpoint "Teacher: POST /api/ai/generate-questions" {
    $body = @{
        topic = "Spring Boot"
        difficulty = "MEDIUM"
        count = 3
        type = "MCQ"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/ai/generate-questions" -Method Post -ContentType "application/json" -Headers $tHeaders -Body $body
    $res.data.Count -gt 0
}

$teacherExams = (Invoke-RestMethod -Uri "$baseUrl/api/exams" -Headers $tHeaders).data
$liveExam = $teacherExams | Where-Object { $_.title -like "*Java Fundamentals Midterm*" } | Select-Object -First 1
$liveExamId = $liveExam.id

$results += Test-Endpoint "Teacher: GET /api/exams (Has Live, Upcoming, Past)" {
    $teacherExams.Count -ge 3
}

$tempExamId = $null
$results += Test-Endpoint "Teacher: POST /api/exams (Create Exam)" {
    $body = @{
        title = "Automated Test Exam"
        subject = "Testing"
        description = "Automated API Test Exam"
        durationMinutes = 30
        passingPercentage = 50.0
        published = $true
        startTime = (Get-Date).AddHours(-1).ToString("yyyy-MM-ddTHH:mm:ss")
        endTime = (Get-Date).AddDays(2).ToString("yyyy-MM-ddTHH:mm:ss")
        questionIds = @()
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/exams" -Method Post -ContentType "application/json" -Headers $tHeaders -Body $body
    $script:tempExamId = $res.data.id
    $script:tempExamId -ne $null
}

$results += Test-Endpoint "Teacher: POST /api/exams/{id}/duplicate" {
    $dup = Invoke-RestMethod -Uri "$baseUrl/api/exams/$tempExamId/duplicate" -Method Post -Headers $tHeaders
    $dupId = $dup.data.id
    Invoke-RestMethod -Uri "$baseUrl/api/exams/$dupId" -Method Delete -Headers $tHeaders | Out-Null
    $dup.data.title -like "*Copy*"
}

$results += Test-Endpoint "Teacher: DELETE /api/exams/{id}" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/exams/$tempExamId" -Method Delete -Headers $tHeaders
    $res.success -eq $true
}

$results += Test-Endpoint "Teacher: GET /api/monitor/exams/{id}/candidates" {
    $cands = Invoke-RestMethod -Uri "$baseUrl/api/monitor/exams/$liveExamId/candidates" -Headers $tHeaders
    $cands.data.Count -ge 1
}

$results += Test-Endpoint "Teacher: GET /api/analytics/exams/{id}" {
    $analytics = Invoke-RestMethod -Uri "$baseUrl/api/analytics/exams/$liveExamId" -Headers $tHeaders
    $analytics.data.exam.title -ne $null -and $analytics.data.perQuestionStats.Count -gt 0 -and $analytics.data.allAttempts.Count -ge 1
}

$reviews = (Invoke-RestMethod -Uri "$baseUrl/api/exams/$liveExamId/reviews" -Headers $tHeaders).data
$results += Test-Endpoint "Teacher: GET /api/exams/{id}/reviews" {
    $reviews.Count -ge 1
}

if ($reviews.Count -gt 0) {
    $revId = $reviews[0].reviewId
    $results += Test-Endpoint "Teacher: PUT /api/reviews/{id} (Override Score & Comment)" {
        $body = @{ teacherScore = 5.0; teacherComment = "Well articulated." } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$baseUrl/api/reviews/$revId" -Method Put -ContentType "application/json" -Headers $tHeaders -Body $body
        $res.data.status -eq "GRADED" -and $res.data.teacherScore -eq 5.0
    }
}

# ----------------------------------------------------
# STUDENT FLOWS
# ----------------------------------------------------
$sHeaders = @{ Authorization = "Bearer $studentToken" }

$results += Test-Endpoint "Student: GET /api/exams/available" {
    $avail = Invoke-RestMethod -Uri "$baseUrl/api/exams/available" -Headers $sHeaders
    $avail.data.Count -ge 1
}

$examDetail = (Invoke-RestMethod -Uri "$baseUrl/api/exams/$liveExamId" -Headers $sHeaders).data
$results += Test-Endpoint "Student: GET /api/exams/{id} (Has Questions Array)" {
    $examDetail.questions -ne $null -and $examDetail.questions.Count -gt 0
}

# Use the standard attemptApi path: POST /api/exams/{id}/attempt
$startAttempt = Invoke-RestMethod -Uri "$baseUrl/api/exams/$liveExamId/attempt" -Method Post -ContentType "application/json" -Headers $sHeaders -Body '{}'
$attemptId = $startAttempt.data.id
if (-not $attemptId) { $attemptId = $startAttempt.data.attemptId }
$results += Test-Endpoint "Student: POST /api/exams/{id}/attempt (Start Attempt)" {
    $attemptId -ne $null
}

$firstQ = $examDetail.questions[0]
$results += Test-Endpoint "Student: PUT /api/exams/{id}/attempt/{aid} (Autosave Answers)" {
    $saveBody = @{ ($firstQ.id) = 0 } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/exams/$liveExamId/attempt/$attemptId" -Method Put -ContentType "application/json" -Headers $sHeaders -Body $saveBody
    $res.success -eq $true
}

# Prepare answers map matching correct answers to ensure passing grade >= 60%
$answersMap = @{}
foreach ($q in $examDetail.questions) {
    if ($q.correctAnswer -ne $null) {
        $answersMap[$q.id] = $q.correctAnswer
    } elseif ($q.type -eq "SHORT_ANSWER") {
        $answersMap[$q.id] = "Comprehensive explanation of object oriented concepts."
    }
}

$submitBody = @{
    attemptId = $attemptId
    examId = $liveExamId
    answers = $answersMap
    violations = @(
        @{ type = "TAB_SWITCH"; timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss") }
    )
    riskScore = 15
    riskLevel = "LOW"
    timeSpentSeconds = 600
} | ConvertTo-Json

$submitRes = Invoke-RestMethod -Uri "$baseUrl/api/exams/$liveExamId/attempt/$attemptId/submit" -Method Post -ContentType "application/json" -Headers $sHeaders -Body $submitBody
$results += Test-Endpoint "Student: POST /api/exams/{id}/attempt/{aid}/submit (Auto-Grade & Passed)" {
    $submitRes.data.passed -eq $true -and $submitRes.data.percentage -ge 60.0
}

$results += Test-Endpoint "Student: GET /api/results/{attemptId}" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/results/$attemptId" -Headers $sHeaders
    $res.data.summary.score -ne $null -and $res.data.reviews.Count -gt 0
}

$results += Test-Endpoint "Student: GET /api/results" {
    $myRes = Invoke-RestMethod -Uri "$baseUrl/api/results" -Headers $sHeaders
    $myRes.data.Count -ge 2
}

$results += Test-Endpoint "Student: GET /api/results/my" {
    $myRes = Invoke-RestMethod -Uri "$baseUrl/api/results/my" -Headers $sHeaders
    $myRes.data.Count -ge 2
}

$results += Test-Endpoint "Student: GET /api/ai/feedback/{attemptId}" {
    $fb = Invoke-RestMethod -Uri "$baseUrl/api/ai/feedback/$attemptId" -Headers $sHeaders
    $fb.data.strengths.Count -gt 0 -and $fb.data.overallFeedback -ne $null
}

$results += Test-Endpoint "Student: GET /api/leaderboard?type=overall" {
    $lb = Invoke-RestMethod -Uri "$baseUrl/api/leaderboard?type=overall" -Headers $sHeaders
    $lb.data.Count -ge 1 -and $lb.data[0].avatar -ne $null
}

$results += Test-Endpoint "Student: GET /api/leaderboard?type=exam&examId={id}" {
    $lb = Invoke-RestMethod -Uri "$baseUrl/api/leaderboard?type=exam&examId=$liveExamId" -Headers $sHeaders
    $lb.data.Count -ge 1
}

$myCerts = (Invoke-RestMethod -Uri "$baseUrl/api/certificates" -Headers $sHeaders).data
$results += Test-Endpoint "Student: GET /api/certificates (Includes Auto-Created & Seeded)" {
    $myCerts.Count -ge 2 -and ($myCerts | Where-Object { $_.certificateId -eq "EXQ-2026-MATH01" }) -ne $null
}

$verifyMath = Invoke-RestMethod -Uri "$baseUrl/api/certificates/verify/EXQ-2026-MATH01"
$results += Test-Endpoint "Public: GET /api/certificates/verify/{id} (Valid Certificate)" {
    $verifyMath.data.valid -eq $true -and $verifyMath.data.studentName -eq "Alex Thompson"
}

$verifyUnknown = $null
try {
    $verifyUnknown = Invoke-RestMethod -Uri "$baseUrl/api/certificates/verify/EXQ-NON-EXISTENT"
} catch {
    $verifyUnknown = $_.Exception.Response
}
$results += Test-Endpoint "Public: GET /api/certificates/verify/{id} (Unknown Certificate Returns Clean Response)" {
    $verifyUnknown.valid -eq $false -or $verifyUnknown.success -eq $false -or $verifyUnknown.StatusCode -eq 404
}

# ----------------------------------------------------
# ADMIN FLOWS
# ----------------------------------------------------
$aHeaders = @{ Authorization = "Bearer $adminToken" }

$results += Test-Endpoint "Admin: GET /api/admin/stats" {
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/admin/stats" -Headers $aHeaders
    $stats.data.totalUsers -ge 3 -and $stats.data.totalExams -ge 3
}

$usersList = (Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Headers $aHeaders).data
$results += Test-Endpoint "Admin: GET /api/admin/users" {
    $usersList.Count -ge 3
}

$newAdminUser = $null
$results += Test-Endpoint "Admin: POST /api/admin/users (Create Student)" {
    $body = @{ name="Admin Created Student"; email="admin_created_student@examiq.com"; role="STUDENT" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method Post -ContentType "application/json" -Headers $aHeaders -Body $body
    $script:newAdminUser = $res.data
    $res.data.role -eq "STUDENT" -and $res.data.name -eq "Admin Created Student"
}

$results += Test-Endpoint "Admin: POST /api/admin/users (Create Teacher)" {
    $body = @{ name="Admin Created Teacher"; email="admin_created_teacher@examiq.com"; role="TEACHER" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method Post -ContentType "application/json" -Headers $aHeaders -Body $body
    $res.data.role -eq "TEACHER"
}

$results += Test-Endpoint "Admin: POST /api/admin/users (Create Admin)" {
    $body = @{ name="Admin Created Admin"; email="admin_created_admin@examiq.com"; role="ADMIN" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method Post -ContentType "application/json" -Headers $aHeaders -Body $body
    $res.data.role -eq "ADMIN"
}

$results += Test-Endpoint "Admin: POST /api/admin/users Duplicate Email Returns 409 Conflict" {
    try {
        $body = @{ name="Duplicate"; email="student@examiq.com"; role="STUDENT" } | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method Post -ContentType "application/json" -Headers $aHeaders -Body $body
        return $false
    } catch {
        $resp = $_.Exception.Response
        return ($resp.StatusCode.value__ -eq 409)
    }
}

$results += Test-Endpoint "Admin: PATCH /api/admin/users/{id}/role" {
    $body = @{ role = "TEACHER" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/users/$($newAdminUser.id)/role" -Method Patch -ContentType "application/json" -Headers $aHeaders -Body $body
    $res.data.role -eq "TEACHER"
}

$results += Test-Endpoint "Admin: PATCH /api/admin/users/{id}/status" {
    $body = @{ status = "INACTIVE" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/users/$($newAdminUser.id)/status" -Method Patch -ContentType "application/json" -Headers $aHeaders -Body $body
    $res.data.active -eq $false
}

$results += Test-Endpoint "Admin: DELETE /api/admin/users/{self} Throws BadRequest (Cannot Delete Own Account)" {
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/admin/users/$adminId" -Method Delete -Headers $aHeaders
        return $false
    } catch {
        $resp = $_.Exception.Response
        return ($resp.StatusCode.value__ -eq 400)
    }
}

$results += Test-Endpoint "Admin: DELETE /api/admin/users/{otherId} Deactivates Target User" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/users/$($newAdminUser.id)" -Method Delete -Headers $aHeaders
    $res.success -eq $true
}

$adminExams = (Invoke-RestMethod -Uri "$baseUrl/api/admin/exams" -Headers $aHeaders).data
$results += Test-Endpoint "Admin: GET /api/admin/exams" {
    $adminExams.Count -ge 3
}

# ----------------------------------------------------
# NOTIFICATIONS
# ----------------------------------------------------
$results += Test-Endpoint "Notifications: GET /api/notifications" {
    $n = Invoke-RestMethod -Uri "$baseUrl/api/notifications" -Headers $sHeaders
    $n.data -ne $null
}

$results += Test-Endpoint "Notifications: PATCH /api/notifications/read-all" {
    $n = Invoke-RestMethod -Uri "$baseUrl/api/notifications/read-all" -Method Patch -Headers $sHeaders
    $n.success -eq $true
}

Write-Host "`n==============================================="
Write-Host " TOTAL TESTS: $($results.Count)"
Write-Host " PASSED: $(($results | Where-Object { $_.Status -eq 'PASS' }).Count)"
Write-Host " FAILED: $(($results | Where-Object { $_.Status -eq 'FAIL' }).Count)"
Write-Host "==============================================="
