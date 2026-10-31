# FR-09 · Admin UI · Spec

## 1. Mục tiêu
Trang quản trị chạy ở `http://127.0.0.1:8788`, dành cho chủ kênh và moderator, có 4 chức năng chính (D-06):

1. Chặn và bỏ chặn user ngay trong lúc live.
2. Sửa danh sách từ cấm và câu kích hoạt.
3. Xem thống kê của phiên.
4. Điều khiển cảnh.

Mọi thay đổi có hiệu lực ngay, không cần khởi động lại.

## 2. Tác nhân
- **Chủ kênh:** toàn quyền.
- **Moderator:** dùng chung mật khẩu với chủ kênh. MVP chưa phân quyền.

## 3. User story
- **US-09.1** Là moderator, tôi thấy danh sách người vừa tương tác (tên, uid, lời mới nhất). Bấm "Chặn" thì nhân vật của người đó rời chánh điện ngay, và lời của họ không hiện nữa cho tới khi tôi bỏ chặn.
- **US-09.2** Là chủ kênh, tôi thêm hoặc xóa từ cấm và câu kích hoạt. Thay đổi áp dụng ngay và vẫn còn sau khi khởi động lại.
- **US-09.3** Là chủ kênh, tôi xem thống kê phiên: thời gian đã live, số người lạy, số lượt lạy, số lần niệm, top lời nguyện, top người dâng lễ, kim cương mỗi giờ, số comment bị lọc, đỉnh người xem, trạng thái từng nguồn event.
- **US-09.4** Là chủ kênh, tôi điều khiển cảnh: đổi theme (ngày, đêm, Rằm), bật hoặc tắt âm thanh, phát banner thủ công, bật hoặc tắt demo.

## 4. Quy tắc nghiệp vụ
| Mã | Quy tắc |
|---|---|
| BR-09.1 | **Truy cập.** Admin chỉ bind `127.0.0.1:8788`. Mọi request phải có HTTP Basic Auth với user `admin` và mật khẩu `ADMIN_PASSWORD` trong `.env`. Thiếu `ADMIN_PASSWORD` thì **không khởi động admin** và in cảnh báo; server chính vẫn chạy bình thường. |
| BR-09.2 | **Chặn user.** Thêm uid vào `blocked`, ghi xuống `server/data/blocked.json` (atomic), và nếu user đang có nhân vật thì phát `leave` ngay. Từ lúc chặn, mọi event của uid đó bị bỏ qua (BR-04.13). |
| BR-09.3 | **Bỏ chặn.** Xóa uid khỏi `blocked` và ghi lại file. Nhân vật không tự quay lại; user phải tương tác lại. |
| BR-09.4 | **Danh sách người gần đây.** Giữ 200 uid tương tác gần nhất (chat, gift, join). Mỗi dòng có tên đã làm sạch, uid, lời gần nhất đã làm sạch (bản gốc chưa lọc chỉ hiện trong admin, có thể ẩn hoặc hiện), thời điểm, và cờ bị chặn. |
| BR-09.5 | **Sửa danh sách từ.** Thêm hoặc xóa trong `lists.badwords` và `lists.triggers`. Từ được fold (FR-03) trước khi lưu, bỏ trùng, bỏ chuỗi rỗng. Ghi qua `saveLists` và có hiệu lực ngay với event tiếp theo. |
| BR-09.6 | **Thống kê phiên** (tính từ lúc process khởi động): |
| | `startedAt`, `uptime` |
| | `uniqueBowers`: số uid khác nhau từng có nhân vật |
| | `bows`: tổng số lạy đã cấp |
| | `namo`: lấy từ FR-06 |
| | `topPrayers`: 10 lời nguyện đã làm sạch xuất hiện nhiều nhất, so sánh bằng bản fold, hiển thị bằng bản gốc đầu tiên |
| | `topDonors`: 10 uid có tổng kim cương cao nhất |
| | `diamonds` (tổng) và `diamondsPerHour` |
| | `filtered`: số comment bị loại bong bóng |
| | `viewersPeak` |
| | `sources`: trạng thái của `tiktok` và `tikfinity` |
| BR-09.7 | **Điều khiển cảnh.** `theme ∈ {day, night, ram}`, `sound` là boolean. Mỗi thay đổi phát `{t:'scene', scene}` tới mọi client render, và snapshot sau đó chứa scene mới. |
| BR-09.8 | **Banner thủ công.** Text chạy qua `cleanBubble` nhưng giới hạn **60** ký tự. Nếu text bị loại thì trả lỗi 400 kèm lý do. Banner phát `{t:'banner', text, ms:5000}`. Text không được chứa các cụm `tặng` + (`để được`, `được lạy`, `phù hộ`, `giải hạn`); có thì trả 400 (theo ràng buộc chung BR-08). |
| BR-09.9 | **Demo.** Bật thì khởi động `startMock` song song với nguồn thật, với `rate` từ 1 đến 50 (mặc định 3). Tắt thì dừng. Event giả có `src:'mock'` và **không** được tính vào thống kê doanh thu (`diamonds`, `topDonors`). |
| BR-09.10 | **Cập nhật giao diện.** Trang admin gọi lại `GET /api/state` mỗi 2 s. Không cần WebSocket. |
| BR-09.11 | **Lưu thống kê.** Khi process tắt bằng SIGINT hoặc sau event `end`, ghi thống kê vào `logs/stats-YYYYMMDD-HHmm.json`. |

## 5. API
| Method | Path | Body | Trả về |
|---|---|---|---|
| GET | `/` | — | `admin/index.html` |
| GET | `/api/state` | — | `{ stats, recent: RecentUser[], blocked: string[], lists, scene, demo: {on, rate} }` |
| POST | `/api/block` | `{ uid }` | `{ ok: true }` |
| DELETE | `/api/block/:uid` | — | `{ ok: true }` |
| PUT | `/api/lists` | `{ badwords?: string[], triggers?: string[] }` | `{ lists }` |
| POST | `/api/scene` | `{ theme?, sound? }` | `{ scene }` |
| POST | `/api/banner` | `{ text }` | `{ ok: true }` hoặc `400 { error }` |
| POST | `/api/demo` | `{ on: boolean, rate?: number }` | `{ demo }` |

## 6. Tiêu chí nghiệm thu
- **AC-09.1** Thiếu auth thì nhận 401. Mật khẩu sai cũng 401. Mật khẩu đúng thì 200.
- **AC-09.2** Chặn một uid đang có nhân vật: trang render nhận `leave` ngay, và comment "nam mô" sau đó của uid này không tạo message nào. Restart server: uid vẫn bị chặn.
- **AC-09.3** Thêm từ "xyz" vào badwords: comment "nam mô xyz" vẫn tạo lượt lạy nhưng không hiện bong bóng, và `filtered` tăng 1.
- **AC-09.4** Xóa trigger "namo": comment "namo" không còn tạo lượt lạy.
- **AC-09.5** Đổi theme sang `ram`: client render nhận `scene`; client kết nối sau đó nhận snapshot có `scene.theme === 'ram'`.
- **AC-09.6** Banner "Tặng hoa để được phù hộ" bị trả 400.
- **AC-09.7** Bật demo với rate 5 trong 10 s: có khoảng 50 event mock, và `diamonds` không đổi.
- **AC-09.8** Thống kê sau kịch bản mẫu (test.md) khớp số kỳ vọng.

## 7. Phi chức năng
- Trang admin dùng được ở chiều rộng 1280 px, chạy trên máy phát hoặc laptop cùng máy.
- `GET /api/state` trả về trong < 20 ms.

## 8. Ngoài phạm vi
- Truy cập từ xa (qua LAN hoặc internet).
- Phân quyền nhiều tài khoản.
- Xuất CSV (để V2).

## 9. Câu hỏi mở
- **Q-09.1** Có cho admin truy cập qua LAN, ví dụ moderator dùng điện thoại? **Mặc định: không**, vì chỉ có Basic Auth qua HTTP, không an toàn khi ra ngoài máy.