# FR-01 · Test

| ID | Loại | Mô tả | Đầu vào / bước | Kỳ vọng | Truy vết |
|---|---|---|---|---|---|
| TC-01.1 | Tích hợp | Client mới nhận snapshot trước | `getSnapshot` trả 1 actor; client kết nối | Message đầu có `t==='snapshot'`, `actors.length===1` | AC-01.1 |
| TC-01.2 | Tích hợp | Broadcast tới mọi client | 2 client; gọi `broadcast([{t:'banner',text:'x',ms:1}])` | Cả 2 client nhận được | BR-01.2 |
| TC-01.3 | Tích hợp | Chặn path traversal | `GET /../package.json`, `/%2e%2e/package.json`, `/vendor/three/../../package.json` | Cả 3 trả 404 | AC-01.4 |
| TC-01.4 | Tích hợp | MIME đúng | `GET /index.html`, `GET /vendor/three/build/three.module.js` | `text/html`, `text/javascript` | BR-01.9 |
| TC-01.5 | Unit | Ghi 3 dòng | `write` 3 lần | File `events-YYYYMMDD.jsonl` có 3 dòng `JSON.parse` được | AC-01.5 |
| TC-01.6 | Unit | Đổi file khi sang ngày | `now` = 23:59:59, rồi 00:00:01 | 2 file khác ngày | BR-01.6 |
| TC-01.7 | Unit | Tốc độ mock | `rate=5`, tua 10 s | `ingest` được gọi 50 lần | AC-01.6 |
| TC-01.8 | Unit | Event mock hợp lệ | 500 event | Mọi event có `src:'mock'` và `ts`; `kind` thuộc {chat, like, gift, join}; gift có `diamonds>0`, `repeat>=1` | BR-01.8 |
| TC-01.9 | Unit | Công thức backoff | `backoffMs(n, () => 0)` với n = 0, 1, 5, 10 | 2000, 4000, 60000, 60000 | BR-01.3 |
| TC-01.10 | Unit | Backoff tăng dần | FakeConn phát `disconnected` 3 lần, rand = 0 | `schedule` nhận 2000, 4000, 8000 | AC-01.2 |
| TC-01.11 | Unit | n về 0 sau khi nối được | disconnect, rồi `connected`, rồi disconnect | Lần chờ thứ hai là 2000 | BR-01.3 |
| TC-01.12 | Unit | Dừng sau `end` | `map` trả `{kind:'end'}`, sau đó `disconnected` | `schedule` không được gọi | AC-01.3 |
| TC-01.13 | Thủ công | Demo chạy được | `npm run demo`, rồi mở một WS client tới `ws://127.0.0.1:8787` | Nhận được snapshot | AC-01.6 |
| TC-01.14 | Thủ công | Thiếu user | Xóa `TIKTOK_USER`, chạy `npm start` | Thoát mã 1, in đúng thông báo | AC-01.7 |
| TC-01.15 | Hiệu năng | 200 event/giây | `node server/index.js --mock --rate 200`, chạy 60 s | Không lỗi, RSS tăng không quá 20% | NFR |
| TC-01.16 | Thủ công | Kết nối thật | Kênh phụ đang live; chạy `npm start` | Console in `connected`, log có event chat | US-01.1 |