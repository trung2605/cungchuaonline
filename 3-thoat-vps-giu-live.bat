@echo off
chcp 65001 >nul
title [3/3] Ngat Ket Noi Remote Desktop Ma Khong Tat Man Hinh 3D (Keep-Alive 24/7)
color 0E

:: Kiem tra quyen Administrator (tscon can quyen Admin de chuyen Session ve Console)
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Dang xin quyen Administrator de giu man hinh 3D khong bi khoa...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ============================================================================
echo   NGAT KET NOI REMOTE DESKTOP ^& GIU LIVE 3D CHAY 24/7 TREN VPS
echo ============================================================================
echo   Lenh nay se ngat cua so Remote Desktop cua ban nhung VAN GIU man hinh
echo   Windows ben trong VPS mo sang de TikTok LIVE Studio va do hoa 3D
echo   chay muot 24/7 ma khong bi den man hinh.
echo ============================================================================
timeout /t 2 >nul

for /f "skip=1 tokens=3" %%s in ('query user %USERNAME%') do (
    tscon %%s /dest:console
)
tscon rdp-tcp#0 /dest:console >nul 2>&1
tscon 1 /dest:console >nul 2>&1
tscon 2 /dest:console >nul 2>&1
