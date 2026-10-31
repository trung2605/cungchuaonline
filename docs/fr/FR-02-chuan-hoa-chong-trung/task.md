# FR-02 · Tasks

## T02.1 mapTiktok
- [ ] Viết `test/mapTiktok.test.js` (TC-02.1 đến TC-02.7). Fixture dùng đúng tên field đã ghi ở T01.1. Chạy và xác nhận FAIL.
- [ ] Viết `mapTiktok`. Chạy và xác nhận PASS.
- [ ] Trong `server/index.js`, thay `map` tạm bằng `mapTiktok`.
- [ ] Commit `feat(fr02): map tiktok events`.

## T02.2 Chống trùng
- [ ] Viết `test/dedupe.test.js` (TC-02.8 đến TC-02.12), dùng `now` giả. Chạy và xác nhận FAIL.
- [ ] Viết `dedupeKey` và `createDedupe`. Chạy và xác nhận PASS.
- [ ] Commit `feat(fr02): time-window dedupe`.
- [ ] Ghi chú: dedupe được gắn vào pipeline ở T04.3.