@echo off
chcp 65001 >nul
:: ──────────────────────────────────────────────────────────────
::  Claude 사용량 대시보드 — Windows 실행 스크립트
::  사용법: start.bat 더블클릭 또는 cmd에서 실행
:: ──────────────────────────────────────────────────────────────
setlocal EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%backend"
set "ENV_FILE=%BACKEND_DIR%\.env"

echo.
echo   ^◆  Claude 사용량 대시보드
echo.

:: ── Node.js 확인 ──────────────────────────────────────────────
where node >nul 2>&1
if errorlevel 1 (
    echo   [오류] Node.js가 설치되어 있지 않습니다.
    echo          https://nodejs.org 에서 설치 후 다시 실행하세요.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -e "process.stdout.write(process.version)"') do set NODE_VER=%%v
echo   ^✓  Node.js %NODE_VER%

:: ── npm 패키지 설치 ───────────────────────────────────────────
if not exist "%BACKEND_DIR%\node_modules" (
    echo   -^>  패키지 설치 중...
    pushd "%BACKEND_DIR%"
    call npm install --silent
    popd
    echo   ^✓  패키지 설치 완료
)

:: ── API 키 확인 / 설정 ────────────────────────────────────────
if not exist "%ENV_FILE%" (
    echo.
    echo   [!] Anthropic API 키가 필요합니다.
    echo       https://console.anthropic.com 에서 발급받을 수 있습니다.
    echo.
    set /p "API_KEY=  API 키를 입력하세요 (엔터로 건너뛰기): "
    echo.
    if defined API_KEY (
        echo ANTHROPIC_API_KEY=!API_KEY!> "%ENV_FILE%"
        echo PORT=3000>> "%ENV_FILE%"
        echo   ^✓  API 키 저장 완료 (backend\.env^)
    ) else (
        echo   [!] API 키 없이 실행합니다. (Claude 테스트 기능 비활성화^)
        echo PORT=3000> "%ENV_FILE%"
    )
)

:: ── 포트 점유 확인 ────────────────────────────────────────────
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING" 2^>nul') do (
    echo   [!] 포트 3000이 사용 중입니다. 기존 프로세스를 종료합니다.
    taskkill /PID %%p /F >nul 2>&1
    timeout /t 1 /nobreak >nul
)

:: ── 서버 실행 ─────────────────────────────────────────────────
echo.
echo   -^>  서버 시작 중...
echo      Ctrl+C 로 종료
echo.

pushd "%BACKEND_DIR%"
node server.js
popd

pause
