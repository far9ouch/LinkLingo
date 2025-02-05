@echo off
echo =========================
echo LinkLingo Server Manager
echo =========================
echo.

:menu
echo Select an option:
echo 1. Start Development Server
echo 2. Install Dependencies
echo 3. Update Project Files
echo 4. Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto start_server
if "%choice%"=="2" goto install_deps
if "%choice%"=="3" goto update_files
if "%choice%"=="4" goto end

echo Invalid choice, please try again
echo.
goto menu

:start_server
echo Starting development server...
echo.
if not exist "node_modules" (
  echo Node modules not found. Installing dependencies first...
  npm install
)
node server.js
goto end

:install_deps
echo Installing dependencies...
echo.
npm install
goto menu

:update_files
echo Updating project files...
echo.

:: Create public folder if it doesn't exist
if not exist "public" (
  echo Creating public folder...
  mkdir public
)

:: Move files to public folder
echo Moving files to public folder...
move /Y index.html public >nul
move /Y chat.html public >nul
move /Y style.css public >nul
move /Y chat.css public >nul
move /Y chat.js public >nul

echo Files updated successfully!
echo.
goto menu

:end
echo Exiting...
exit 