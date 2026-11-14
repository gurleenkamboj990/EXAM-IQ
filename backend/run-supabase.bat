@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

if not exist ".env.supabase" (
    echo ===================================================================
    echo  [ERROR] .env.supabase file not found in:
    echo  %~dp0
    echo.
    echo  Please copy .env.supabase.example to .env.supabase and fill in
    echo  your Supabase PostgreSQL database credentials.
    echo ===================================================================
    exit /b 1
)

for /f "usebackq tokens=1* delims==" %%A in (".env.supabase") do (
    set "key=%%A"
    set "val=%%B"
    if defined key (
        set "firstchar=!key:~0,1!"
        if not "!firstchar!"=="#" (
            for /f "tokens=* delims= " %%K in ("!key!") do set "key=%%K"
            for /f "tokens=* delims= " %%V in ("!val!") do set "val=%%V"
            set "!key!=!val!"
        )
    )
)

if exist "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot" (
    set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
)

set "SPRING_PROFILES_ACTIVE=supabase"

echo ===================================================================
echo  Starting ExamIQ Spring Boot Backend (Profile: supabase)
echo  Database Host: !SUPABASE_DB_HOST!
echo  Database Port: !SUPABASE_DB_PORT!
echo  Database Name: !SUPABASE_DB_NAME!
echo  Database User: !SUPABASE_DB_USER!
echo  Java Home:     %JAVA_HOME%
echo ===================================================================

call .\mvnw.cmd spring-boot:run
