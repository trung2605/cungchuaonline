# FR-09 · Tasks

## T09.1 Thay đổi ở FR-03 và FR-04
- [x] Thêm tham số `max` vào `cleanBubble`. Thêm test với max = 60.
- [x] Thêm `Stage.remove`, cùng test TC-09.1.
- [x] Thêm `pipeline.setScene`, cùng test TC-09.2.
- [x] Cho `bowRules` gọi `stats` (tùy chọn): `noteBow`, `noteFiltered`.
- [x] Chạy lại toàn bộ test. Commit.

## T09.2 Stats
- [x] Viết `test/stats.test.js` cho TC-09.3 đến TC-09.6 (kịch bản mẫu). Chạy, xác nhận FAIL.
- [x] Viết `createStats`. Chạy, xác nhận PASS. Commit.

## T09.3 Admin API
- [x] Viết `test/admin.test.js` cho TC-09.7 đến TC-09.14, dùng `fetch` vào cổng 18788 với `ctx` giả. Chạy, xác nhận FAIL.
- [x] Viết `startAdmin`: Basic Auth, các route, kiểm tra body (giới hạn 64 KB, phải là JSON).
- [x] Chạy, xác nhận PASS. Commit.

## T09.4 Nối vào index.js
- [x] Sửa `index.js` theo plan: `stats`, `demo`, `status`, `startAdmin`, ghi thống kê khi tắt.
- [x] Test tích hợp TC-09.15: chặn user thì client render nhận `leave`.
- [x] Commit.

## T09.5 Giao diện admin
- [x] Viết `admin/index.html` gồm 4 tab theo plan, dùng `textContent`.
- [x] Kiểm tra thủ công TC-09.16 đến TC-09.18.
- [x] Commit `feat(fr09): admin ui`.

## Ghi chú thực hiện (31/10)
- **Mock không vào thống kê.** Event `src:'mock'` không được tính vào:
  - `bows`, `uniqueBowers`;
  - `filtered`, `topPrayers`;
  - tiền (`diamonds`, `topDonors`);
  - `viewersPeak`.

  Lý do: kịch bản mẫu kỳ vọng `bows` = 7 và `uniqueBowers` = 4, nghĩa là gift mock cũng không được tính là lạy. Riêng `namo` lấy từ FR-06 nên vẫn đếm cả mock. Danh sách người gần đây vẫn hiện user mock để thử chặn khi demo.
- **Lời nguyện** là comment vừa là câu kích hoạt vừa qua được `cleanBubble`.
- **Bảo mật thêm (ngoài spec):**
  - Body POST/PUT phải có `content-type: application/json`, sai thì trả 415. Nhờ đó trang web khác không gửi form được bằng Basic Auth mà trình duyệt đã lưu.
  - Header `Host` phải là `127.0.0.1` hoặc `localhost`, sai thì trả 403. Cách này chặn DNS rebinding.
- **Cách fold khi lưu:** từ cấm giữ dấu (giống `badwords.json`). Câu kích hoạt và khóa lời cầu bỏ dấu.
- **Ghi file:** `lists.js` có thêm `saveBlocked`, dùng chung hàm ghi atomic với `saveLists`.
- **Gọi API từ trang admin:** trang dùng `fetch(location.origin + path)`. Nếu mở trang bằng URL dạng `http://admin:pass@127.0.0.1:8788`, Chrome sẽ chặn fetch theo đường dẫn tương đối.
- **Commit:** cả FR-09 nằm trong một commit, theo quy ước mỗi FR một commit.