# FR-07 · Test

## Unit (node:test, chỉ test các module thuần)
| ID | Mô tả | Bước | Kỳ vọng | Truy vết |
|---|---|---|---|---|
| TC-07.1 | Slot không trùng nhau | `slotPosition(0..149)` | 150 cặp (x, z) khác nhau, mọi cặp cách nhau ≥ 0,9 | BR-07.2 |
| TC-07.2 | Hàng đầu gần bàn thờ hơn | So `z` của i<20 với `z` của i≥20 | `max z(front) < min z(general)` | BR-07.2 |
| TC-07.3 | Không che tượng | Mọi slot | `z > ALTAR.z + 2` và `|x| ≤ 7` | AC-07.5 |
| TC-07.4 | Thời lượng các pha | Nhân vật mới, rồi bước tới t = 2000, 2500, 3300 | Pha lần lượt: `kneel`, `bow`, `idle` (với 1 lạy) | BR-07.3 |
| TC-07.5 | Cộng thêm lạy | `addBows(st, 2)` khi đang ở idle | Quay lại `bow` thêm 2 × 800 ms | BR-07.3 |
| TC-07.6 | Rời đi từ bất kỳ pha nào | `leave` khi đang `enter` | Pha `leave`, sau 2000 ms thì `done` | BR-07.3 |
| TC-07.7 | Khởi tạo từ snapshot | `createActorState(a, {idle: true})` | Pha `idle` ngay, đứng tại vị trí slot | BR-07.4 |
| TC-07.8 | Reducer xử lý snapshot | `applyMsg` với snapshot 3 actor | Lệnh `reset`, sau đó 3 lệnh `add` với `idle: true` | AC-07.2 |
| TC-07.9 | Hiệu ứng thiếu nhân vật | fx có `at: 'khongco'` | Lệnh fx đặt vị trí ở `ALTAR` | BR-07.7 |
| TC-07.20 | Di chuyển lên hàng đầu | `move(st, 3, t)` khi đang idle ở slot 40 | Pha `move` kéo dài 2000 ms, vị trí nội suy từ slot 40 sang slot 3, sau đó `kneel` | BR-07.3 |
| TC-07.10 | Tối đa 12 bong bóng | 13 message `say` khác id | Có lệnh ẩn bong bóng cũ nhất | BR-07.6 |

## Thủ công / trực quan
| ID | Mô tả | Bước | Kỳ vọng | Truy vết |
|---|---|---|---|---|
| TC-07.11 | WebGL2 trong LIVE Studio | Link Source trỏ tới `http://127.0.0.1:8787` | Cảnh hiện đúng, không lỗi | Rủi ro |
| TC-07.12 | Nhân vật | `npm run demo` | Đầu trọc, 4 màu áo, quỳ và lạy tự nhiên, tên đủ dấu (thử `Nguyễn Thị Ánh Tuyết`) | AC-07.1 |
| TC-07.13 | Reload trang | Có khoảng 100 nhân vật, bấm F5 | Cả 100 hiện ngay ở pha idle | AC-07.2 |
| TC-07.14 | Mất server | Tắt server rồi bật lại | Cảnh không đứng hình, nối lại trong ≤ 3 s | AC-07.6 |
| TC-07.15 | 6 hiệu ứng | Bắn từng loại fx bằng mock hoặc script | Đúng như mô tả ở BR-07.7; có chuông và mõ | AC-07.4 |
| TC-07.16 | HUD và theme | Gửi message `scene` với theme `day`, `ram`, `night` | Chuyển mượt trong 2 s; chân trang đúng câu chữ | BR-07.8, BR-07.10 |
| TC-07.17 | Hiệu năng | `--mock --rate 50`, 150 nhân vật, mở `?fps=1`, chạy 10 phút trên máy chuẩn | FPS trung bình ≥ 30, p5 ≥ 25 (ghi số thực đo) | AC-07.3 |
| TC-07.18 | Tôn nghiêm | Người duyệt xem 5 phút | Tượng không bị che hay cắt khung; không có chi tiết phản cảm | BR-07.12 |
| TC-07.19 | Credit | So danh sách `ls web/assets -R` với `CREDITS.md` | Khớp 100% | AC-07.7 |

## Kết quả đo (điền khi chạy)
| Ngày | Máy | Số nhân vật | FPS trung bình | FPS p5 | Ghi chú |
|---|---|---|---|---|---|
| | | | | | |