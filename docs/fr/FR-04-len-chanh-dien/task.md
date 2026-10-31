# FR-04 · Tasks

## T04.1 Stage: vào, cập nhật, TTL
- [ ] Viết `test/stage.test.js` cho TC-04.1 đến TC-04.5. Chạy, xác nhận FAIL.
- [ ] Viết `TTL`, `Stage` (constructor, `enter`, `say`, `tick`, `has`, `snapshot`), phần chọn slot và hash skin. Chạy, xác nhận PASS.
- [ ] Commit `feat(fr04): stage slots and ttl`.

## T04.2 Stage: đẩy ra và lên hàng đầu
- [ ] Thêm test TC-04.6 đến TC-04.9.
- [ ] Viết phần chọn nạn nhân và phần lên hàng đầu. Chạy, xác nhận PASS. Commit.

## T04.3 bowRules
- [ ] Viết `test/bowRules.test.js` cho TC-04.10 đến TC-04.16. Dùng `now` giả có thể chỉnh được, và `lists` lấy theo fixture của FR-03.
- [ ] Viết `giftTier` và `createBowRules`. Chạy, xác nhận PASS. Commit.

## T04.4 Pipeline thật
- [ ] Viết `test/pipeline.test.js` cho TC-04.17 đến TC-04.19.
- [ ] Thay stub `server/pipeline.js` bằng `createPipeline` như trong plan.
- [ ] Sửa `server/index.js`:
  - tạo `lists = loadLists()`, `blocked = new Set(JSON.parse(blocked.json))`, `stage`, `dedupe`;
  - truyền `rules = [createBowRules(...)]` (FR-05 và FR-06 sẽ thêm rule sau).
- [ ] Chạy `npm run demo` (TC-04.20). Commit `feat(fr04): real pipeline with bow rules`.