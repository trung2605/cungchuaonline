@echo off
chcp 65001 >nul
title [2/3] Live TikTok 24/7 Watchdog Server (:8787 / :8789 / :8791)
color 0A

cd /d "%~dp0"

echo ============================================================================
echo   HE THONG LIVE TIKTOK 3D 24/7 (CUNG CHUA ONLINE ^& CUOC DUA KY THU)
echo ============================================================================
echo   * Link dan vao TikTok LIVE Studio (Add Source -^> Link):
echo     - Cung Chua Online 3D (Chuan):  http://127.0.0.1:8787
echo     - Cung Chua Online 3D (Nhe GPU): http://127.0.0.1:8787/?quality=low
echo     - Cuoc Dua Ky Thu 3D (Chuan):   http://127.0.0.1:8789
echo     - Cuoc Dua Ky Thu 3D (Nhe GPU): http://127.0.0.1:8789/?quality=low
echo.
echo   * Trang Quan Tri Admin Tong:      http://127.0.0.1:8791
echo     (Tai khoan: admin  ^|  Mat khau xem trong file .env)
echo ============================================================================
echo.

:: Tu dong mo trang Admin Tong sau 3 giay
start "" cmd /c "timeout /t 3 >nul & start http://127.0.0.1:8791"

:loop
echo [%DATE% %TIME%] Dang khoi chay he thong Live TikTok 24/7...
node scripts/start-all.mjs
echo [%DATE% %TIME%] Tien trinh chinh dung bat ngo! Tu dong khoi dong lai sau 3 giay...
timeout /t 3 >nul
goto loop
