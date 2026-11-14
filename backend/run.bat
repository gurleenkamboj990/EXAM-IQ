@echo off
setlocal
cd /d "%~dp0"

if not defined JAVA_HOME (
    if exist "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot" (
        set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
    )
)

echo ========================================================
echo  Starting ExamIQ Spring Boot Backend (Java 21, Port 8080)
echo ========================================================
call mvnw.cmd spring-boot:run

