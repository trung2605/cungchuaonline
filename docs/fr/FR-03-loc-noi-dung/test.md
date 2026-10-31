# FR-03 · Test

`lists = { badwords: ['dm','vcl','do ngu'], triggers: ['nam mo','namo','a di da phat','adida','adidaphat','quan the am','mo phat'] }`

| ID | Loại | Mô tả | Đầu vào | Kỳ vọng | Truy vết |
|---|---|---|---|---|---|
| TC-03.1 | Unit | fold bỏ dấu, gộp chữ lặp | `'Nam Môôô  A Di Đà'` | `'nam mo a di da'` | BR-03.1 |
| TC-03.2 | Unit | fold nối chữ đơn bị tách | `'v.c.l'`, `'n a m mo'` | `'vcl'`, `'nam mo'` | BR-03.1 |
| TC-03.3 | Unit | fold bỏ ký tự vô hình | `'na\u200Bm mo'` | `'nam mo'` | BR-03.1 |
| TC-03.4 | Unit | Kích hoạt đúng | NFD của `'Nam mô A Di Đà Phật'`; `'NAMOOO'`; `'adida 🙏'` | `true` cả 3 | AC-03.1 |
| TC-03.5 | Unit | Không kích hoạt | `'xin chào'`; `'nam môn học'` | `false` cả 2 | AC-03.1 |
| TC-03.6 | Unit | Từ cấm có dấu chấm | `'v.c.l luôn'`; `'đồ dm'` | `null` | AC-03.2 |
| TC-03.7 | Unit | Không khớp nhầm | `'ad mình ơi nam mô'` | Trả nguyên văn | AC-03.2 |
| TC-03.8 | Unit | URL, số điện thoại, mention | `'vào abc.com'`; `'0912 345 678'`; `'@ai đó'`; `'https://x'` | `null` | AC-03.3 |
| TC-03.9 | Unit | Cắt độ dài | `'a'.repeat(60)` | Độ dài 40 | AC-03.4 |
| TC-03.10 | Unit | Giữ dấu, giữ emoji | `'Cầu bình an 🙏'` | `'Cầu bình an 🙏'` | BR-03.5 |
| TC-03.11 | Unit | Tên bỏ emoji, cắt 16 | `'🙏Minh Anh Nguyễn Thị Lan'` | `'Minh Anh Nguyễn'` | AC-03.5 |
| TC-03.12 | Unit | Tên xấu dùng mặc định | `'dm'`; `'🙏🙏'` | `'Phật tử'` | AC-03.5 |
| TC-03.13 | Unit | Tên NFD về NFC | NFD của `'Thảo'` | `'Thảo'` ở dạng NFC | BR-03.6 |
| TC-03.14 | Unit | Sửa danh sách lúc chạy | `lists.badwords.push('xyz')` rồi gọi `cleanBubble('abc xyz')` | `null` | AC-03.6 |
| TC-03.15 | Unit | Save atomically | `saveLists` vào thư mục tạm | File hợp lệ, không còn file `.tmp` | BR-03.7 |
| TC-03.16 | Hiệu năng | 2.000 từ cấm | 10.000 lần `cleanBubble` | Trung bình < 0,2 ms mỗi lần | NFR |
## Bổ sung v2
| ID | Loại | Mô tả | Đầu vào | Kỳ vọng | Truy vết |
|---|---|---|---|---|---|
| TC-03.17 | Unit | Nhận diện lời cầu | 'Cầu tài lộc nam mô'; 'nam mô'; 'binh an va suc khoe' | 'Cầu Tài Lộc'; null; 'Cầu Bình An' | AC-03.7 |
| TC-03.18 | Unit | Lời cầu là câu kích hoạt | 'cầu sức khỏe cho mẹ' | `isTrigger === true` | AC-03.8 |
| TC-03.19 | Unit | Load câu đối | `loadLists()` | Có 5 cặp, mỗi vế ≤ 24 ký tự | BR-03.11 |