@echo off
chcp 65001 >nul
title [1/3] Setup VPS Windows 24/7 - Live TikTok Studio
color 0B

echo ============================================================================
echo   CAI DAT TU DONG MOI TRUONG VPS WINDOWS 24/7 CHO LIVE TIKTOK 3D
echo ============================================================================
echo.

:: 1. Tat che do Sleep / Hibernate / Tat man hinh tren Windows VPS
echo [1/4] Dang cau hinh Windows khong bao gio Sleep / Tat man hinh...
powercfg /change monitor-timeout-ac 0 >nul 2>&1
powercfg /change monitor-timeout-dc 0 >nul 2>&1
powercfg /change standby-timeout-ac 0 >nul 2>&1
powercfg /change standby-timeout-dc 0 >nul 2>&1
powercfg /change hibernate-timeout-ac 0 >nul 2>&1
powercfg /change hibernate-timeout-dc 0 >nul 2>&1
powercfg /h off >nul 2>&1
echo       -^> Da tat Sleep, Hibernate va Screen Timeout!

:: 2. Cau hinh Remote Desktop khong ngat phien GPU khi mat ket noi tam thoi
echo [2/4] Dang toi uu Registry cho Remote Desktop (Giu khung hinh 3D 24/7)...
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services" /v KeepAliveEnable /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services" /v KeepAliveInterval /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services" /v MaxDisconnectionTime /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services" /v fResetBroken /t REG_DWORD /d 0 /f >nul 2>&1
echo       -^> Da cau hinh giu phien(Session) chay lien tuc 24/7!

:: 3. Kiem tra Node.js (Neu chua co thi tu dong tai va cai Node.js 20 LTS)
echo [3/4] Dang kiem tra Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo       -^> Chua co Node.js! Dang tu dong cai dat Node.js LTS...
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    if %ERRORLEVEL% NEQ 0 (
        echo       -^> Dang tai bộ cai Node.js v20 LTS truc tiep...
        powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi' -OutFile '$env:TEMP\node-lts.msi'; Start-Process msiexec.exe -Wait -ArgumentList '/i $env:TEMP\node-lts.msi /qn'"
    )
    set "PATH=%PATH%;C:\Program Files\nodejs"
)
for /f "delims=" %%v in ('node -v 2^>nul') do echo       -^> Node.js da san sang: %%v

:: 4. Cai dat thu vien du an (npm install)
echo [4/4] Dang cai dat thu vien du an (npm install)...
cd /d "%~dp0"
call npm install
echo.
echo ============================================================================
echo   HOAN TAT CAI DAT VPS!
echo   - Tiep theo: Chay file "2-start-live-24-7.bat" de bat Server 3D + Admin
echo   - LƯU Y AM THANH VPS: Neu VPS cua ban chua co Loa ao (Audio Output),
echo     hay cai VB-Cable (mien phi tai https://vb-audio.com/Cable/) de
echo     TikTok LIVE Studio thu duoc tieng chuong chua & giong doc AI 24/7!
echo ============================================================================
pause
