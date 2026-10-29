@echo off
title Push to GitHub - CinePass
echo ========================================================
echo   Push CinePass to GitHub (chaanakya-reddy/movie_ticket_booking-)
echo ========================================================
echo.

cd /d "%~dp0"

set "GIT_EXE=C:\Users\user\.gemini\antigravity\scratch\mingit\cmd\git.exe"
if not exist "%GIT_EXE%" (
    set "GIT_EXE=git"
)

echo [1/3] Adding all files...
"%GIT_EXE%" add -A

echo [2/3] Committing changes...
"%GIT_EXE%" commit -m "Update CinePass Movie Ticket Booking Platform with real posters and UPI"

echo [3/3] Pushing to https://github.com/chaanakya-reddy/movie_ticket_booking-.git ...
echo (If prompted, sign in to your GitHub account in your browser or enter your token)
echo.
"%GIT_EXE%" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! Pushed successfully to GitHub!
    echo   Visit: https://github.com/chaanakya-reddy/movie_ticket_booking-
    echo ========================================================
) else (
    echo.
    echo If GitHub asks for a password, note that GitHub requires a Personal Access Token (PAT).
    echo Generate one at: https://github.com/settings/tokens
)

echo.
pause
