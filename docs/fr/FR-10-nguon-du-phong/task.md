# FR-10 · Tasks

## T10.1 Xác minh định dạng TikFinity
- [ ] Cài TikFinity và bật Events API hoặc WebSocket. Ghi lại URL và cổng.
- [ ] Dùng `wscat` kết nối, lưu 1 mẫu payload cho mỗi loại `chat`, `gift`, `like`, `member`, `roomUser` vào `test/fixtures/tikfinity/*.json`.
- [ ] Cập nhật Q-10.1 trong spec.

## T10.2 mapTikfinity và adapter
- [x] Viết `test/mapTikfinity.test.js` cho TC-10.1 và TC-10.2, dùng fixture thật từ T10.1. Chạy, thấy FAIL.
- [x] Viết `mapTikfinity`. Chạy, thấy PASS.
- [x] Viết `test/tikfinityAdapter.test.js` cho TC-10.3 và TC-10.4, dùng `WebSocketImpl` giả là một EventEmitter.
- [x] Viết `startTikfinity`. Chạy, thấy PASS. Commit.

## T10.3 Chạy song song
- [x] Sửa `index.js` (xem ghi chú: không đổi chữ ký `onStatus` của `startTiktok`).
- [x] Viết test tích hợp TC-10.5: pipeline nhận cùng một gift từ hai nguồn.
- [ ] Live thử: đo độ lệch thời gian giữa hai nguồn cho 20 event (TC-10.6). Ghi kết quả vào R-10.1.
- [x] Commit `feat(fr10): tikfinity parallel source`.

## Ghi chú khi làm
- **Fixture** trong `test/fixtures/tikfinity/` là mẫu giả định (kiểu phẳng v1). T10.1 còn phải thay bằng payload thật.
- **Chữ ký `onStatus`** của cả hai adapter giữ là `(state, err)`. `index.js` gắn tên nguồn qua `onStatus(src, label)` và ghi vào `status = { tiktok, tikfinity }` cho FR-09. Không phải sửa adapter và test FR-01.
- **Log trạng thái TikFinity** chỉ in khi trạng thái đổi. Khi app tắt, console in `disconnected` một lần, vẫn thử lại mỗi 5 s nhưng không in lặp.
- **Chế độ `--mock`** không bật TikFinity, để demo không bị trộn event thật.
- Sửa thêm: log `[tiktok] error` in `err.info` thay vì cả object lỗi.
