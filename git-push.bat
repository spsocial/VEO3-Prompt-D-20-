@echo off
echo ========================================
echo   VEO3 Prompt D(20+) - Git Auto Push
echo ========================================
echo.

REM Add all changes
echo [1/3] Adding all changes...
git add -A

REM Get commit message
set /p message="Enter commit message: "

REM Commit with message
echo.
echo [2/3] Committing changes...
git commit -m "%message%"

REM Push to GitHub
echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   Push completed successfully!
echo ========================================
pause