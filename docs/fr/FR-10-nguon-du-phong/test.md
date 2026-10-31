# FR-10 · Test

| ID | Loại | Mô tả | Bước | Kỳ vọng | Truy vết |
|---|---|---|---|---|---|
| TC-10.1 | Unit | Map chat từ TikFinity | Đưa vào fixture `chat.json` | `NormEvent` có `src:'tikfinity'`; các field khác giống bản map từ connector | AC-10.1 |
| TC-10.2 | Unit | Map gift combo | Đưa vào fixture `gift` với `repeatEnd` false, sau đó true | Lần đầu trả `null`, lần sau trả gift có `repeat` | BR-10.2 |
| TC-10.3 | Unit | Thử lại sau 5 s | WS giả phát `close` | `schedule` được gọi với 5000 | BR-10.4 |
| TC-10.4 | Unit | Báo trạng thái | Kết nối, đóng, kết nối lại | `onStatus` nhận lần lượt `('tikfinity','connected')`, `('tikfinity','disconnected')`, `('tikfinity','connected')` | BR-10.5 |
| TC-10.5 | Tích hợp | Chống trùng giữa hai nguồn | Pipeline đầy đủ nhận gift `src:tiktok` lúc t=0 và `src:tikfinity` lúc t=1500 | Chỉ có 1 cặp `bow` + `fx` | AC-10.2 |
| TC-10.6 | Live | Đo độ lệch | Chạy cả hai nguồn, ghi `ts` của 20 event | Độ lệch p95 < 5 s; ghi số đo | R-10.1 |
| TC-10.7 | Thủ công | Mất connector | Cho adapter connector `stop()` | Chat qua TikFinity vẫn tạo nhân vật | AC-10.3 |
| TC-10.8 | Thủ công | Mất TikFinity | Tắt app TikFinity | Không crash; console in `disconnected` rồi thử lại mỗi 5 s | AC-10.4 |