@echo off
echo Starting auto-update process...

:: Check if .git exists, if not initialize repository
if not exist .git (
    echo Initializing Git repository...
    git init
    git remote add origin https://github.com/far9ouch/LinkLingo.git
    git branch -M main
)

:: Configure Git (run only first time)
git config --global user.email "far9ouch@gmail.com"
git config --global user.name "far9ouch"

:: Pull latest changes
git pull origin main

:: Add all changes
git add .

:: Get current date and time for default commit message
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set datetime=%datetime:~0,8%-%datetime:~8,6%

:: Ask for commit message
set /p commit_msg="Enter commit message (or press Enter for default): "

:: Use custom message or default timestamp
if "%commit_msg%"=="" (
    git commit -m "Auto update %datetime%"
) else (
    git commit -m "%commit_msg%"
)

:: Push to GitHub
git push origin main

echo Update complete!
pause 