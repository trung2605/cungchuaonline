# FR-01 · Nền tảng server và kết nối nguồn TikTok · Spec

## 1. Mục tiêu
Một tiến trình Node chạy trên máy phát live, làm bốn việc: nhận event từ TikTok LIVE (hoặc event giả), ghi log, đưa event qua pipeline, rồi đẩy `StageMsg` xuống trang render qua WebSocket. Đây là phần nền mà mọi FR khác cắm vào.

## 2. Tác nhân
- **Chủ kênh / vận hành:** chạy `npm start` hoặc `npm run demo`.
- **Trang render (FR-07):** là WebSocket client.
- **TikTok LIVE:** event đến qua `tiktok-live-connector` và Euler Stream.

## 3. User story
- **US-01.1** Là chủ kênh, tôi điền `TIKTOK_USER` trong `.env` rồi chạy `npm start` là kết nối được vào live của kênh. Không phải đăng nhập tài khoản TikTok.
- **US-01.2** Là chủ kênh, tôi chạy `npm run demo` để có event giả khi tập dượt hoặc khi TikTok lỗi.
- **US-01.3** Là vận hành, tôi muốn hệ thống tự kết nối lại khi mạng chập chờn.
- **US-01.4** Là vận hành, khi trang render bị reload (LIVE Studio refresh), tôi muốn mọi nhân vật hiện lại ngay.
- **US-01.5** Là vận hành, tôi muốn có log event theo ngày để tra soát và làm thống kê.

## 4. Quy tắc nghiệp vụ
| Mã | Quy tắc |
|---|---|
| BR-01.1 | HTTP và WebSocket chạy chung cổng **8787**, chỉ bind **127.0.0.1**. |
| BR-01.2 | WS client mới nhận ngay 1 message `snapshot`, trước mọi message khác. |
| BR-01.3 | Mất kết nối thì tự kết nối lại theo backoff. Lần thứ n (n bắt đầu từ 0) chờ `min(60000, 2000·2^n) + jitter(0..1000)` ms. Nối lại thành công thì n quay về 0. |
| BR-01.4 | Khi nhận event `end` (streamEnd) hoặc khi `stop()` được gọi thì dừng kết nối lại. |
| BR-01.5 | Thiếu `TIKTOK_USER` và không có `--mock` thì thoát mã 1, in: `Thiếu TIKTOK_USER trong .env (hoặc chạy npm run demo)`. |
| BR-01.6 | Mỗi `NormEvent` được ghi thêm 1 dòng vào `logs/events-YYYYMMDD.jsonl` (ngày theo giờ máy). Không ghi avatar hay URL ảnh. |
| BR-01.7 | Mỗi **1000 ms** gọi `pipeline.tick()` và broadcast kết quả. |
| BR-01.8 | Chế độ mock: tốc độ chỉnh bằng `--rate N` (event/giây), mặc định 5. |
| BR-01.9 | Phục vụ file tĩnh: thư mục `web/` ở `/`, `node_modules/three/` ở `/vendor/three/`. Path có `..` (kể cả dạng đã mã hóa) trả 404. |
| BR-01.10 | Trạng thái kết nối (`connecting`, `connected`, `disconnected`, `ended`) được in ra console kèm giờ, đồng thời gọi callback `onStatus` (FR-09 dùng). |

## 5. Tiêu chí nghiệm thu
- **AC-01.1** Server đang có 1 nhân vật. Client mới kết nối thì message đầu tiên nhận được là `snapshot` chứa nhân vật đó.
- **AC-01.2** Connector phát `disconnected` 3 lần. Các lần thử lại được hẹn sau khoảng 2s, 4s, 8s (cộng jitter tối đa 1s).
- **AC-01.3** Đã nhận `end`. Sau đó có `disconnected` thì không hẹn kết nối lại.
- **AC-01.4** `GET /../package.json` và `GET /%2e%2e/package.json` đều trả 404.
- **AC-01.5** Ingest 3 event thì file log của ngày có đúng 3 dòng JSON hợp lệ.
- **AC-01.6** Chạy `--mock --rate 5` trong 10s thì sinh khoảng 50 event (±20%).
- **AC-01.7** Không có `TIKTOK_USER` và không có `--mock` thì thoát mã 1, in đúng thông báo ở BR-01.5.

## 6. Phi chức năng
- Chịu được ≥ 200 event/giây mà không rớt event (đo bằng mock).
- Độ trễ từ lúc ingest đến lúc broadcast ≤ 50 ms ở p95.
- Không có secret nào lọt vào log.

## 7. Ngoài phạm vi
Nghiệp vụ pipeline (FR-04 đến FR-06; ở FR-01, `pipeline.js` chỉ là stub), TikFinity (FR-10), admin (FR-09).

## 8. Câu hỏi mở
Không có.