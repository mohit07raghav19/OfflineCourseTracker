@echo off
echo ============================================================
echo   Offline Course Tracker - Development Startup
echo ============================================================
echo.

REM Check if node_modules exist
if not exist "frontend\node_modules" (
    echo [Installing dependencies...]
    call npm run install:all
    echo.
)

if not exist "backend\node_modules" (
    echo [Installing dependencies...]
    call npm run install:all
    echo.
)

echo [Starting servers...]
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers
call npm run dev
