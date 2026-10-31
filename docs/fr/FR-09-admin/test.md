# FR-09 · Test

## Kịch bản mẫu cho thống kê (TC-09.3 → TC-09.6)
| t | Event | Ghi chú |
|---|---|---|
| 0s | chat u1 'Nam mô cầu bình an' | u1 được lạy miễn phí |
| 1s | chat u2 'nam mo cầu bình an' | u2 được lạy; lời trùng với u1 khi fold |
| 2s | chat u3 'nam mô dm' | u3 được lạy; bong bóng bị lọc |
| 3s | gift u1 Rose ×3 | 3 kim cương |
| 4s | gift u4 Galaxy ×1 | 1000 kim cương |
| 5s | viewers 120, sau đó viewers 90 | |
| 6s | gift mock Galaxy (`src:'mock'`) | không tính tiền |

**Kỳ vọng:**
- `uniqueBowers` = 4
- `bows` = 1 + 1 + 1 + 3 + 1 = 7
- `filtered` = 1
- `topPrayers[0]` = `{ text: 'Nam mô cầu bình an', count: 2 }`
- `topDonors[0].uid` = `u4`
- `diamonds` = 1003
- `viewersPeak` = 120

| ID | Loại | Mô tả | Bước | Kỳ vọng | Truy vết |
|---|---|---|---|---|---|
| TC-09.1 | Unit | `Stage.remove` | Thêm 'a' rồi `remove('a')`; gọi `remove('x')` | `[{t:'leave', id:'a'}]`; `[]` | BR-09.2 |
| TC-09.2 | Unit | `setScene` | `setScene({theme:'ram'})` | `[{t:'scene', scene:{theme:'ram', sound:true}}]`; snapshot cập nhật | AC-09.5 |
| TC-09.3 | Unit | Đếm người lạy và lượt lạy | Kịch bản mẫu | `uniqueBowers` 4, `bows` 7 | AC-09.8 |
| TC-09.4 | Unit | Top lời nguyện | Kịch bản mẫu | `count: 2`, hiển thị bản gốc đầu tiên | BR-09.6 |
| TC-09.5 | Unit | Tiền: mock không tính | Kịch bản mẫu | `diamonds` 1003, `topDonors[0]` là u4 | BR-09.9 |
| TC-09.6 | Unit | Đỉnh người xem, số bị lọc | Kịch bản mẫu | `viewersPeak` 120, `filtered` 1 | BR-09.6 |
| TC-09.7 | API | Auth | Không có header; sai mật khẩu; đúng mật khẩu | 401, 401, 200 | AC-09.1 |
| TC-09.8 | API | Chặn user | `POST /api/block {uid:'a'}` khi 'a' đang có nhân vật | `broadcast` nhận `leave`; `blocked.json` có 'a' | AC-09.2 |
| TC-09.9 | API | Bỏ chặn | `DELETE /api/block/a` | 'a' không còn trong file | BR-09.3 |
| TC-09.10 | API | Sửa danh sách từ | `PUT /api/lists {badwords:[...,'XYZ ']}` | Lưu thành `'xyz'` (đã fold, đã trim), không trùng | BR-09.5 |
| TC-09.11 | API | Đổi cảnh | `POST /api/scene {theme:'day'}`; gửi theme sai `'abc'` | 200 kèm `broadcast` scene; 400 | BR-09.7 |
| TC-09.12 | API | Banner bị cấm | `POST /api/banner {text:'Tặng hoa để được phù hộ'}` | 400 | AC-09.6 |
| TC-09.13 | API | Banner hợp lệ | `{text:'Chúc cả nhà bình an'}` | 200; `broadcast` nhận banner 5000 ms | BR-09.8 |
| TC-09.14 | API | Body lỗi | Body không phải JSON; body > 64 KB | 400; 413 | Bảo mật |
| TC-09.15 | Tích hợp | Chặn người đang live | Server + admin chạy thật, WS client; chặn uid đang có nhân vật | Client nhận `leave`; chat sau đó của uid này không tạo message | AC-09.2 |
| TC-09.16 | Thủ công | Tên chứa HTML | Mock gửi tên `<img src=x onerror=alert(1)>` | Hiện nguyên chữ, không chạy script | Bảo mật |
| TC-09.17 | Thủ công | Demo | Bật demo rate 5 trong 10 s | Khoảng 50 event mock; `diamonds` không đổi | AC-09.7 |
| TC-09.18 | Thủ công | Thiếu mật khẩu | Xóa `ADMIN_PASSWORD` khỏi env | Admin không chạy, có cảnh báo; server chính vẫn chạy | BR-09.1 |

## Kết quả (31/10)
| ID | Kết quả | Ghi chú |
|---|---|---|
| TC-09.1, TC-09.2 | PASS | `test/stage.test.js`, `test/pipeline.test.js` |
| TC-09.3 → TC-09.6 | PASS | `test/stats.test.js`. Khớp số kỳ vọng của kịch bản mẫu |
| TC-09.7 → TC-09.14, TC-09.19 | PASS | `test/admin.test.js`. Kiểm thêm: AC-09.4, intents, demo, content-type sai → 415, `Host` lạ → 403 |
| TC-09.15 | PASS | Chạy server `--mock` với admin thật và một WS client. Client nhận `leave` ngay. Trong 5 s sau đó không có message nào của uid bị chặn. Bỏ chặn trả 200 |
| AC-09.5 | PASS | Client đang mở nhận `scene`. Client kết nối sau nhận snapshot có `theme: 'ram'` |
| TC-09.16 | PASS | Chèn tên `<img src=x onerror=…>` vào bảng: hiện nguyên chữ, không tạo thẻ `img` nào |
| TC-09.17 | PASS | Bật rồi tắt demo qua API: `diamonds` không đổi |
| TC-09.18 | PASS | Để `ADMIN_PASSWORD` rỗng: server in cảnh báo, cổng 8787 vẫn trả 200, cổng 8788 không mở |
| Phi chức năng | PASS | `GET /api/state` trung bình 0,8 ms. Giao diện ở 1280 px hiển thị ổn |
| AC-09.9 | PASS (qua API) | Server phát `couplets` ngay khi lưu. Trang web đã xử lý message này từ FR-07 |
| BR-09.11 (ghi `stats-*.json`) | **Chưa kiểm** | Script không gửi được SIGINT trên Windows. Cần tự bấm `Ctrl+C` một lần rồi xem thư mục `logs/` |

`npm test`: 141/141 pass.