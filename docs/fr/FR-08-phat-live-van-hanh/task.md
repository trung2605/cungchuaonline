# FR-08 · Tasks

## T08.1 Script vận hành
- [x] Viết `scripts/prune-logs.mjs`, kèm test `test/prune.test.js` dùng thư mục tạm (TC-08.1).
- [x] Viết `scripts/run.cmd`.
- [x] Viết `scripts/soak.mjs`.
- [x] Commit.

## T08.2 Cài đặt LIVE Studio
- [ ] Thêm Link Source, cài đặt camera người dẫn theo BR-08.2.
- [ ] Kiểm tra âm thanh (Q-08.1). Ghi kết quả vào runbook.
- [ ] Chụp màn hình bố cục, lưu vào `docs/img/livestudio-layout.png`.

## T08.3 Runbook và kịch bản người dẫn
- [x] Viết `docs/runbook.md` gồm 8 mục như trong plan.
- [x] Viết `docs/incident-log.md`.
- [ ] Nhờ một người chưa từng làm đọc thử runbook (TC-08.4).
- [x] Commit (gộp chung commit FR-08).

## T08.4 Soak và live thử
- [ ] Chạy TC-08.2 (8 giờ) và TC-08.3 (kill process).
- [ ] Ghi kết quả vào `test.md`.
- [ ] Live thử bằng tài khoản phụ (TC-08.5, TC-08.6).
- [ ] Commit.
## Ghi chú thực hiện
- `run.cmd` chỉ bật lại khi exit code ≠ 0. Khi bấm Ctrl+C, `index.js` thoát với mã 0, nên vòng lặp dừng hẳn.
- `soak.mjs` import thẳng `server/index.js` để đọc được `process.memoryUsage()` của chính server. Lệnh chạy: `node scripts/soak.mjs --mock --rate 20` (không chạy qua `run.cmd` như TC-08.2 ghi). `SOAK_EVERY_MS` dùng để đổi chu kỳ lấy mẫu.
- `prune-logs.mjs` xét theo mtime của file, áp dụng cho mọi file trong `logs/`: events, restarts, soak.
- Thêm `.gitattributes` để giữ CRLF cho file `.cmd`.
- T08.2, TC-08.4, T08.4 cần người và tài khoản thật, nên user tự làm.
