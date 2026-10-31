@echo off
rem BR-08.6: restart the server 3 s after an abnormal exit. Ctrl+C (exit 0) stops the loop.
rem Usage: scripts\run.cmd [--mock --rate 20]
cd /d "%~dp0.."
if not exist logs mkdir logs
:loop
node scripts/prune-logs.mjs
node server/index.js %*
if %errorlevel%==0 goto :eof
echo [%date% %time%] server thoat (ma %errorlevel%), khoi dong lai sau 3s >> logs\restarts.log
echo Server thoat (ma %errorlevel%), khoi dong lai sau 3s...
timeout /t 3 /nobreak >nul
goto loop
