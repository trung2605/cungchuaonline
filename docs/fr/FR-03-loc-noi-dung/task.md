# FR-03 · Tasks

## T03.1 fold và matchesAny
- [ ] Viết `test/filter.test.js` cho TC-03.1 đến TC-03.3. Chạy, thấy FAIL.
- [ ] Viết `fold` và `matchesAny` theo thuật toán trong plan. Chạy, thấy PASS. Commit.

## T03.2 isTrigger
- [ ] Thêm test TC-03.4 và TC-03.5.
- [ ] Viết `isTrigger(text, lists)`. Tạo `server/data/triggers.json`. Chạy, thấy PASS. Commit.

## T03.3 cleanBubble
- [ ] Thêm test TC-03.6 đến TC-03.10.
- [ ] Seed `server/data/badwords.json`:
  - lấy từ `vietnamese-offensive-words`;
  - fold từng từ, bỏ trùng;
  - ghi nguồn vào `server/data/README.md`.
- [ ] Viết `cleanBubble`. Chạy, thấy PASS. Commit.

## T03.4 cleanName
- [ ] Thêm test TC-03.11 đến TC-03.13.
- [ ] Viết `cleanName`. Chạy, thấy PASS. Commit.

## T03.5 Lists (load, save, sửa lúc chạy)
- [ ] Thêm test TC-03.14 (sửa lúc chạy) và TC-03.15 (save atomically: ghi xong file tạm rồi mới rename).
- [ ] Viết `server/lists.js`. Chạy, thấy PASS.
- [ ] Commit `feat(fr03): content filter and lists`.
## T03.6 (v2) Lời cầu và câu đối
- [ ] Thêm test TC-03.17 đến TC-03.19.
- [ ] Viết `detectIntent`. Sửa `isTrigger`. Tạo `intents.json` và `couplets.json`. Sửa `loadLists` và `saveLists`.
- [ ] Chạy test, thấy PASS. Commit.