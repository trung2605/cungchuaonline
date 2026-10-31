# FR-09 · Tasks

## T09.1 Thay đổi ở FR-03 và FR-04
- [ ] Thêm tham số `max` vào `cleanBubble`. Thêm test với max = 60.
- [ ] Thêm `Stage.remove`, cùng test TC-09.1.
- [ ] Thêm `pipeline.setScene`, cùng test TC-09.2.
- [ ] Cho `bowRules` gọi `stats` (tùy chọn): `noteBow`, `noteFiltered`.
- [ ] Chạy lại toàn bộ test. Commit.

## T09.2 Stats
- [ ] Viết `test/stats.test.js` cho TC-09.3 đến TC-09.6 (kịch bản mẫu). Chạy, xác nhận FAIL.
- [ ] Viết `createStats`. Chạy, xác nhận PASS. Commit.

## T09.3 Admin API
- [ ] Viết `test/admin.test.js` cho TC-09.7 đến TC-09.14, dùng `fetch` vào cổng 18788 với `ctx` giả. Chạy, xác nhận FAIL.
- [ ] Viết `startAdmin`: Basic Auth, các route, kiểm tra body (giới hạn 64 KB, phải là JSON).
- [ ] Chạy, xác nhận PASS. Commit.

## T09.4 Nối vào index.js
- [ ] Sửa `index.js` theo plan: `stats`, `demo`, `status`, `startAdmin`, ghi thống kê khi tắt.
- [ ] Test tích hợp TC-09.15: chặn user thì client render nhận `leave`.
- [ ] Commit.

## T09.5 Giao diện admin
- [ ] Viết `admin/index.html` gồm 4 tab theo plan, dùng `textContent`.
- [ ] Kiểm tra thủ công TC-09.16 đến TC-09.18.
- [ ] Commit `feat(fr09): admin ui`.