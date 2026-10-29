@echo off
title CinePass Cinema Server
echo ==============================================
echo   CinePass India - Cinema Ticket Booking
echo ==============================================
echo Starting local web server...
cd /d "%~dp0"
start "" "http://localhost:8080"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8080
if %ERRORLEVEL% NEQ 0 (
    echo Opening directly in default browser...
    start "" "%~dp0index.html"
)
pause
