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
| 31/10 | Laptop dev, Chrome (DevTools MCP), cửa sổ 540×960, rig tạm | 37–99 | 84–101 | — | Đo nhanh, chưa phải TC-07.17. Lúc mưa sen ~48 fps với 87 nhân vật. Cần đo 10 phút trên máy chuẩn |
## Bổ sung v2
| ID | Loại | Mô tả | Bước | Kỳ vọng | Truy vết |
|---|---|---|---|---|---|
| TC-07.21 | Unit | Không slot nào nằm trên thảm | `slotPosition(0..149)` | Mọi slot có `|x| ≥ 1.5` | BR-07.16 |
| TC-07.22 | Unit | Chia đều hai bên | Đếm slot có x < 0 và x > 0 | Mỗi bên 75 | BR-04.17 |
| TC-07.23 | Unit | Hàng chờ chỗ lạy | 5 nhân vật cùng `requestAltar` | 3 người được chỗ, 2 người ở pha `queue`; khi một người xong thì người vào hàng chờ trước được chỗ | AC-07.9 |
| TC-07.24 | Unit | Vòng đời đầy đủ | Spawn với 2 lạy, chạy `step` qua thời gian | Lần lượt `enter`, `altar` (1,6 s), `toSeat`, `kneel`, `idle` | BR-07.17 |
| TC-07.25 | Unit | Lên lại bàn thờ khi có quà | Đang `idle`, nhận `bow` với `visit:true` | `standUp`, rồi `enter`, rồi `altar`, … , rồi `idle` | BR-07.17 |
| TC-07.26 | Thủ công | Model | `npm run demo` | Có nam và nữ mặc áo tràng lam, quỳ lạy tự nhiên, không bị xuyên mesh rõ rệt | BR-07.15 |
| TC-07.27 | Thủ công | HUD | Cho mock tặng quà liên tục | Câu đối đổi mỗi 10 s; bảng tri ân và thẻ người tặng đúng nội dung; nhãn lớn không chồng nhau | AC-07.10 |
| TC-07.28 | Thủ công | Nhạc | Bật và tắt `scene.sound` | Nhạc không lời phát lặp; tắt `scene.sound` thì im lặng hoàn toàn | BR-07.23 |
## Kết quả chạy (31/10)
- Unit: 17 test trong `test/web/` pass (TC-07.1–07.3, 07.5–07.10, 07.20–07.25). Toàn bộ `npm test`: 107/107.
- TC-07.13 (reload): đạt, 99 nhân vật hiện ngay ở pha idle đúng chỗ.
- TC-07.14 (mất server): đạt, cảnh chạy tiếp ~93 fps khi server tắt; bật lại thì nhận snapshot sau ~0,6 s.
- TC-07.15 (hình): đạt phần hình cho lotus, bell, halo, smoke, flower, lamp (qua `?debug=1`). Chưa nghe thử âm thanh.
- TC-07.16: đạt, chuyển night → ram → day mượt; chân trang đúng câu chữ.
- Lưu ý: TC-03.16 (test hiệu năng bộ lọc) có thể fail khi máy đang bận (demo + Chrome chạy cùng lúc). Chạy riêng thì pass.
