# FR-10 · Tasks

## T10.1 Xác minh định dạng TikFinity
- [ ] Cài TikFinity và bật Events API hoặc WebSocket. Ghi lại URL và cổng.
- [ ] Dùng `wscat` kết nối, lưu 1 mẫu payload cho mỗi loại `chat`, `gift`, `like`, `member`, `roomUser` vào `test/fixtures/tikfinity/*.json`.
- [ ] Cập nhật Q-10.1 trong spec.

## T10.2 mapTikfinity và adapter
- [ ] Viết `test/mapTikfinity.test.js` cho TC-10.1 và TC-10.2, dùng fixture thật từ T10.1. Chạy, thấy FAIL.
- [ ] Viết `mapTikfinity`. Chạy, thấy PASS.
- [ ] Viết `test/tikfinityAdapter.test.js` cho TC-10.3 và TC-10.4, dùng `WebSocketImpl` giả là một EventEmitter.
- [ ] Viết `startTikfinity`. Chạy, thấy PASS. Commit.

## T10.3 Chạy song song
- [ ] Sửa `index.js` và chữ ký `onStatus` theo plan. Cập nhật test FR-01.
- [ ] Viết test tích hợp TC-10.5: pipeline nhận cùng một gift từ hai nguồn.
- [ ] Live thử: đo độ lệch thời gian giữa hai nguồn cho 20 event (TC-10.6). Ghi kết quả vào R-10.1.
- [ ] Commit `feat(fr10): tikfinity parallel source`.