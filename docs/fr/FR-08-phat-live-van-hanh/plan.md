# FR-08 · Plan

## Sản phẩm bàn giao
| File | Nội dung |
|---|---|
| `docs/runbook.md` | 1. Chuẩn bị máy (Node 20, GPU, driver). 2. `.env`. 3. Chạy server. 4. Cài đặt LIVE Studio (Link Source, camera, âm thanh, bố cục). 5. Checklist trước live (BR-08.8). 6. Kịch bản người dẫn (BR-08.5). 7. Xử lý sự cố (BR-08.9). 8. Tắt live và lưu log. |
| `docs/incident-log.md` | Mẫu ghi sự cố: thời gian, hiện tượng, hành động, kết quả |
| `scripts/run.cmd` | Vòng lặp tự khởi động lại |
| `scripts/prune-logs.mjs` | Xóa log cũ hơn 30 ngày |
| `scripts/soak.mjs` | Ghi `process.memoryUsage().rss` mỗi 10 phút vào `logs/soak-*.csv`. Bộ nhớ của trang đo bằng Task Manager hoặc DevTools |

## scripts/run.cmd
```bat
@echo off
:loop
node scripts/prune-logs.mjs
node server/index.js %*
echo [%date% %time%] server thoat, khoi dong lai sau 3s >> logs\restarts.log
timeout /t 3 /nobreak >nul
goto loop
```

## Phụ thuộc
- FR-01 đến FR-07.
- Vùng an toàn và vị trí camera ở BR-08.2, BR-08.3 ràng buộc bố cục HUD của FR-07 (T07.8).

## Rủi ro
| Rủi ro | Giảm thiểu |
|---|---|
| CEF trong LIVE Studio quá cũ, thiếu WebGL2 | Chạy TC-07.11 sớm. Phương án B: Window Capture một cửa sổ Chrome kiosk (`chrome --app=http://127.0.0.1:8787 --window-size=1080,1920`) |
| Máy phát quá tải khi vừa render vừa encode | Bật hardware encoder (NVENC) trong LIVE Studio, dùng `?quality=low` |