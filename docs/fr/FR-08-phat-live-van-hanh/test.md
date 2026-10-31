# FR-08 · Test

| ID | Loại | Mô tả | Bước | Kỳ vọng | Truy vết |
|---|---|---|---|---|---|
| TC-08.1 | Unit | Xóa log cũ | Tạo file log ngày D-31 và D-29 | Chỉ file D-31 bị xóa | BR-08.7 |
| TC-08.2 | Soak | Chạy 8 giờ | `run.cmd --mock --rate 20` với Link Source mở; chạy `soak.mjs` | RSS ở giờ thứ 8 không vượt 1,3 lần giờ thứ 1; bộ nhớ trang cũng vậy | AC-08.2 |
| TC-08.3 | Thủ công | Tự khởi động lại | Kill `node.exe` trong Task Manager | Server lên lại trong ≤ 5 s, trang tự nối lại | AC-08.3 |
| TC-08.4 | Thủ công | Đọc runbook | Một người mới làm theo runbook | Lên live thử trong ≤ 15 phút; ghi lại các bước bị vướng | AC-08.1 |
| TC-08.5 | Live | Vùng an toàn | Chụp màn hình từ điện thoại người xem | HUD không bị che, không chồng lên camera | AC-08.4 |
| TC-08.6 | Live | Event thật | 30 phút với tài khoản phụ; nhờ 3 người comment, like, tặng 1 Rose | Mọi event hiện đúng; không có cảnh báo | AC-08.5 |
| TC-08.7 | Live | Tình huống chữ phản cảm | Người thử comment một từ cấm | Không có bong bóng; nhân vật vẫn lạy nếu comment chứa câu niệm | FR-03 |

## Kết quả soak (điền khi chạy)
| Giờ | RSS node (MB) | Bộ nhớ trang (MB) | FPS | Ghi chú |
|---|---|---|---|---|
| 1 | | | | |
| 8 | | | | |
## Kết quả đã chạy (31/10/2026, máy dev)
| ID | Kết quả |
|---|---|
| TC-08.1 | Pass (`test/prune.test.js`) |
| TC-08.3 | Pass một phần. Kill PID node của `run.cmd --mock`: server lên lại sau **2,1 s**, `logs/restarts.log` có dòng `server thoat (ma -1)`, tab Chrome đang mở tự nối lại. Chưa thử với Link Source. |
| TC-08.2 | Mới smoke 7 s (`SOAK_EVERY_MS=2000`): CSV ghi đúng, RSS khoảng 60 MB. Chưa chạy 8 giờ. |
| TC-08.4–08.7 | Chưa làm, cần LIVE Studio và tài khoản phụ. |
