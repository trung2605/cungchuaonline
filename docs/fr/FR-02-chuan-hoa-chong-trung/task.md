# FR-02 · Tasks

## T02.1 mapTiktok
- [x] Viết `test/mapTiktok.test.js` (TC-02.1 đến TC-02.7). Fixture dùng đúng tên field đã ghi ở T01.1. Chạy và xác nhận FAIL.
- [x] Viết `mapTiktok`. Chạy và xác nhận PASS.
- [x] Trong `server/index.js`, thay `map` tạm bằng `mapTiktok`.
- [x] Commit `feat(fr02): map tiktok events`.

## T02.2 Chống trùng
- [x] Viết `test/dedupe.test.js` (TC-02.8 đến TC-02.12), dùng `now` giả. Chạy và xác nhận FAIL.
- [x] Viết `dedupeKey` và `createDedupe`. Chạy và xác nhận PASS.
- [x] Commit `feat(fr02): time-window dedupe`.
- [x] Ghi chú: dedupe được gắn vào pipeline ở T04.3.