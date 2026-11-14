@echo off
setlocal

if not defined JAVA_HOME (
    if exist "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot" (
        set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
    )
)

set "DIR=%~dp0"

if exist "%DIR%.tools\apache-maven-3.9.9\bin\mvn.cmd" (
    call "%DIR%.tools\apache-maven-3.9.9\bin\mvn.cmd" %*
    exit /b %ERRORLEVEL%
)

where mvn >NUL 2>&1
if %ERRORLEVEL% equ 0 (
    call mvn %*
    exit /b %ERRORLEVEL%
)

echo ERROR: Maven not found in .tools or PATH.
exit /b 1
