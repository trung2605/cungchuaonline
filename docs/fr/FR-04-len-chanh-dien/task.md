# FR-04 · Tasks

## T04.1 Stage: vào, cập nhật, TTL
- [x] Viết `test/stage.test.js` cho TC-04.1 đến TC-04.5. Chạy, xác nhận FAIL.
- [x] Viết `TTL`, `Stage` (constructor, `enter`, `say`, `tick`, `has`, `snapshot`), phần chọn slot và hash skin. Chạy, xác nhận PASS.
- [x] Commit `feat(fr04): stage slots and ttl`.

## T04.2 Stage: đẩy ra và lên hàng đầu
- [x] Thêm test TC-04.6 đến TC-04.9.
- [x] Viết phần chọn nạn nhân và phần lên hàng đầu. Chạy, xác nhận PASS. Commit.

## T04.3 bowRules
- [x] Viết `test/bowRules.test.js` cho TC-04.10 đến TC-04.16. Dùng `now` giả có thể chỉnh được, và `lists` lấy theo fixture của FR-03.
- [x] Viết `giftTier` và `createBowRules`. Chạy, xác nhận PASS. Commit.

## T04.4 Pipeline thật
- [x] Viết `test/pipeline.test.js` cho TC-04.17 đến TC-04.19.
- [x] Thay stub `server/pipeline.js` bằng `createPipeline` như trong plan.
- [x] Sửa `server/index.js`:
  - tạo `lists = loadLists()`, `blocked = new Set(JSON.parse(blocked.json))`, `stage`, `dedupe`;
  - truyền `rules = [createBowRules(...)]` (FR-05 và FR-06 sẽ thêm rule sau).
- [x] Chạy `npm run demo` (TC-04.20). Commit `feat(fr04): real pipeline with bow rules`.
## T04.5 (v2) Lời cầu, kim cương, lên bàn thờ
- [x] Thêm test TC-04.21 đến TC-04.24.
- [x] Sửa `Stage.enter`, `bowRules`, `pipeline.tick` và `pipeline.snapshot` theo plan v2.
- [x] Chạy lại toàn bộ test. Commit.