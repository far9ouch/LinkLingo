@echo off
echo =========================
echo LinkLingo GitHub Updater
echo =========================
color 0A

:: Show current date and time
echo Current Time: %date% %time%
echo.

:: Check for debug log and delete
if exist firebase-debug.log (
    echo Cleaning debug log...
    del /f /q firebase-debug.log
    echo Done.
)
echo.

:: Show status before update
echo Current Status:
git status
echo.

:: Add files one by one with status
echo Adding files...
echo.

echo Adding public files...
git add public\*.* 

echo Adding server files...
git add netlify\functions\*.* 

echo Adding configuration files...
git add package.json
git add netlify.toml
git add .gitignore
git add *.bat

echo.
echo Files added successfully.
echo.

:: Get commit message
set /p commit_msg="Enter update message (or press Enter for timestamp): "
if "%commit_msg%"=="" (
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
    set datetime=%datetime:~0,8%-%datetime:~8,6%
    git commit -m "Data Update %datetime%"
) else (
    git commit -m "%commit_msg%"
)

:: Push changes
echo.
echo Pushing updates to GitHub...
git push origin main

:: Show final status
echo.
echo Final Status:
git status

echo.
echo =========================
echo Update Complete!
echo =========================
pause 