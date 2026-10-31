# FR-01 · Tasks

> Chạy test: `npm test`. Commit sau mỗi task.

## T01.1 Khởi tạo dự án
- [x] Ở gốc repo, chạy:
  ```
  git init
  npm init -y
  npm i ws@8 tiktok-live-connector@2.5.0 dotenv@16 three@0.170.0
  ```
- [x] Sửa `package.json`: thêm `"type":"module"`, `"engines":{"node":">=20"}` và các scripts như trong plan.
- [x] Tạo `.gitignore` và `.env.example`.
- [x] Đọc `node_modules/tiktok-live-connector/dist/types/` và ghi lại tên chính xác vào mục "Ghi chú version" của [FR-02 plan](../FR-02-chuan-hoa-chong-trung/plan.md):
  - enum `WebcastEvent`;
  - class `TikTokLiveConnection` và các option (`signApiKey`, `enableExtendedGiftInfo`);
  - field của chat, gift, like, member và roomUser.
- [x] Commit `chore: scaffold project`.

## T01.2 Log JSONL
- [x] Viết `test/log.test.js` cho TC-01.5 và TC-01.6. Chạy và thấy FAIL.
- [x] Viết `createLog`. Chạy và thấy PASS.
- [x] Commit `feat(fr01): jsonl event log`.

## T01.3 Server static + WebSocket
- [x] Viết `test/server.test.js` cho TC-01.1 đến TC-01.4. Dùng cổng 18787 và một `webRoot` tạm có sẵn `index.html`. Chạy và thấy FAIL.
- [x] Viết `startServer`. Chạy và thấy PASS.
- [x] Commit `feat(fr01): static + ws server with snapshot`.

## T01.4 Mock adapter
- [x] Viết `test/mock.test.js` cho TC-01.7 và TC-01.8, dùng `mock.timers.enable({ apis: ['setInterval', 'Date'] })` (mock tính số event theo thời gian trôi, vì timer Windows thô ~15ms). Chạy và thấy FAIL.
- [x] Viết `startMock` theo các thông số sau:
  - **Nguồn:** mọi event có `src:'mock'`.
  - **Tỉ lệ loại event:** chat 60% (một nửa có câu niệm Phật), like 30%, gift 8%, join 2%.
  - **Người xem giả:** 200 uid dạng `mock{n}`, mỗi uid có một tên tiếng Việt.
  - **Quà:** Rose (1 xu) 80%, Finger Heart (5 xu) 10%, Doughnut (30 xu) 7%, Galaxy (1000 xu) 3%.
- [x] Chạy và thấy PASS. Commit.

## T01.5 TikTok adapter + kết nối lại
- [x] Viết `test/tiktok.test.js` cho TC-01.9 đến TC-01.12. Dùng một `class FakeConn extends EventEmitter` có `connect()` và `disconnect()`, và một `schedule` giả để ghi lại số ms đã hẹn. Chạy và thấy FAIL.
- [x] Viết `backoffMs` và `startTiktok`:
  - Đăng ký các event `chat`, `like`, `gift`, `member`, `roomUser`, `streamEnd`, `disconnected`, `error`, dùng tên lấy được ở T01.1.
  - Mỗi event đi qua `map(name, data)`. Kết quả khác `null` thì gọi `ingest`.
  - Kết quả có `kind:'end'` thì đặt `ended = true`.
- [x] Chạy và thấy PASS. Commit `feat(fr01): tiktok adapter with backoff reconnect`.

## T01.6 Pipeline stub + index.js
- [x] Viết `server/pipeline.js` dạng stub:
  - `handle` và `tick` trả `[]`.
  - `snapshot` trả `{t:'snapshot', actors:[], counters:{namo:0,viewers:0}, scene:{theme:'night',sound:true}}`.
- [x] Viết `server/index.js`:
  1. `import 'dotenv/config'`, đọc `--mock` và `--rate`.
  2. Tạo `log` và `pipeline`, gọi `srv = await startServer({ getSnapshot: () => pipeline.snapshot() })`.
  3. Định nghĩa `ingest = e => { log.write(e); srv.broadcast(pipeline.handle(e)); }`.
  4. Gọi `setInterval(() => srv.broadcast(pipeline.tick()), 1000)`.
  5. Chọn nguồn: mock nếu có `--mock`, ngược lại TikTok với `Connection` lấy từ thư viện. Trước khi FR-02 xong, `map` tạm là `() => null`.
  6. Thiếu user thì xử lý theo BR-01.5.
  7. Bắt `SIGINT`: dừng adapter, đóng log và server.
- [x] Kiểm thử thủ công TC-01.13 và TC-01.14.
- [x] Commit `feat(fr01): cli wiring`.