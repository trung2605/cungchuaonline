# FR-03 · Tasks

## T03.1 fold và matchesAny
- [x] Viết `test/filter.test.js` cho TC-03.1 đến TC-03.3. Chạy, thấy FAIL.
- [x] Viết `fold` và `matchesAny` theo thuật toán trong plan. Chạy, thấy PASS. Commit.

## T03.2 isTrigger
- [x] Thêm test TC-03.4 và TC-03.5.
- [x] Viết `isTrigger(text, lists)`. Tạo `server/data/triggers.json`. Chạy, thấy PASS. Commit.

## T03.3 cleanBubble
- [x] Thêm test TC-03.6 đến TC-03.10.
- [x] Seed `server/data/badwords.json`:
  - lấy từ `vietnamese-offensive-words`;
  - fold từng từ, bỏ trùng;
  - ghi nguồn vào `server/data/README.md`.
- [x] Viết `cleanBubble`. Chạy, thấy PASS. Commit.

## T03.4 cleanName
- [x] Thêm test TC-03.11 đến TC-03.13.
- [x] Viết `cleanName`. Chạy, thấy PASS. Commit.

## T03.5 Lists (load, save, sửa lúc chạy)
- [x] Thêm test TC-03.14 (sửa lúc chạy) và TC-03.15 (save atomically: ghi xong file tạm rồi mới rename).
- [x] Viết `server/lists.js`. Chạy, thấy PASS.
- [x] Commit `feat(fr03): content filter and lists`.
## T03.6 (v2) Lời cầu và câu đối
- [x] Thêm test TC-03.17 đến TC-03.19.
- [x] Viết `detectIntent`. Sửa `isTrigger`. Tạo `intents.json` và `couplets.json`. Sửa `loadLists` và `saveLists`.
- [x] Chạy test, thấy PASS. Commit.