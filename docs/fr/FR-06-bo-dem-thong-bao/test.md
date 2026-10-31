# FR-06 · Test

| ID | Loại | Mô tả | Bước | Kỳ vọng | Truy vết |
|---|---|---|---|---|---|
| TC-06.1 | Unit | Đếm niệm không phụ thuộc thời gian chờ | Comment 'nam mô' từ u1, u2, rồi u1 lần nữa ở t=30s | `state().namo === 3`, có 3 message counter | AC-06.1 |
| TC-06.2 | Unit | Comment không kích hoạt | Comment 'xin chào' | Không có counter | BR-06.1 |
| TC-06.3 | Unit | Giới hạn banner vào chùa | 5 join trong khoảng t=0..900 | Đúng 1 banner | AC-06.2 |
| TC-06.4 | Unit | Ưu tiên banner dâng lễ | Gift bậc 2 ở t=0; join ở t=2500; join ở t=5100 | Lần join đầu không có banner; lần sau có | AC-06.3 |
| TC-06.5 | Unit | Banner mốc niệm | Đặt namo = 999, thêm 1 trigger | Có banner với text `Cả chùa đã niệm 1000 lần 🙏` | AC-06.4 |
| TC-06.6 | Unit | Số người xem | Event viewers 3500 | `{t:'counter', key:'viewers', value:3500}` | BR-06.2 |
| TC-06.7 | Tích hợp | Snapshot có counters | Pipeline + 2 trigger | `snapshot().counters.namo === 2` | AC-06.5 |
| TC-06.8 | Unit | Tên trên banner đã làm sạch | Join với tên `'🙏dm'` | Text là `Phật tử vừa vào chùa` | BR-06.3 |
## Bổ sung v2
| ID | Loại | Mô tả | Bước | Kỳ vọng | Truy vết |
|---|---|---|---|---|---|
| TC-06.9 | Unit | Thẻ người tặng | gift Rose ×3 | `{t:'donor', giftName:'Rose', repeat:3, diamonds:3}` | BR-06.9 |
| TC-06.10 | Unit | Giới hạn tần suất bảng tri ân | 3 gift lúc t=0, 300, 600; tick lúc t=2100 | 1 message `board` lúc t=0, 1 message `board` lúc tick | AC-06.6 |
| TC-06.11 | Unit | Top 8 sắp giảm dần | 12 người tặng với mức khác nhau | Đúng 8 dòng, giảm dần, bằng nhau thì ai đến trước đứng trên | AC-06.7 |