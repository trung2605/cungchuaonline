# FR-08 · Phát live qua LIVE Studio và vận hành · Spec

## 1. Mục tiêu
Đưa cảnh chánh điện lên TikTok LIVE theo quy trình lặp lại được: chuẩn bị máy, cài đặt LIVE Studio, kiểm tra trước giờ lên live, dẫn chương trình đúng chính sách, xử lý sự cố, chạy ổn định nhiều giờ.

## 2. Tác nhân
- Chủ kênh / vận hành
- Người dẫn live
- Moderator

## 3. User story
- **US-08.1** Là vận hành, tôi làm theo runbook để lên live trong ≤ 15 phút từ lúc mở máy.
- **US-08.2** Là người dẫn, tôi có kịch bản nên nói gì và không được nói gì, để tránh bị strike.
- **US-08.3** Là vận hành, khi có sự cố (mất event, cảnh đứng hình, chữ phản cảm, TikTok cảnh báo), tôi biết phải làm gì trong vòng 1 phút.
- **US-08.4** Là chủ kênh, tôi muốn hệ thống chạy liên tục 8 giờ không bị rò rỉ bộ nhớ, và tự khởi động lại nếu bị crash.

## 4. Quy tắc nghiệp vụ
| Mã | Quy tắc |
|---|---|
| BR-08.1 | **Điều kiện tài khoản:** chủ kênh từ 18 tuổi, có quyền LIVE Studio (thường cần khoảng 1.000 follower, tùy khu vực; kiểm tra trong app), tài khoản không có strike LIVE đang hiệu lực. |
| BR-08.2 | **Nguồn hình trong LIVE Studio:** dùng Link Source trỏ tới `http://127.0.0.1:8787`, khung 1080×1920. Camera người dẫn đặt **ở góc trên bên trái, khung tròn 300×300**. FR-07 không được đặt HUD vào vùng này. |
| BR-08.3 | **Vùng an toàn.** Giao diện TikTok che khoảng 12% phía trên (thông tin chủ kênh) và khoảng 30% phía dưới bên trái (comment). Thông tin quan trọng của HUD (bộ đếm, banner, chân trang) phải nằm trong dải dọc **12%–70%**, hoặc ở mép phải. FR-07 phải tuân thủ quy tắc này. |
| BR-08.4 | **Người dẫn luôn có mặt** bằng hình hoặc tiếng (BR-10 của research/07). Game không được tự chạy một mình quá **10 phút**. |
| BR-08.5 | **Câu nên nói khi dẫn:** đọc tên người vào lễ, đọc lời nguyện hay, mời mọi người "gõ Nam mô A Di Đà Phật để vào lễ", cảm ơn người tặng quà. **Câu cấm nói:** "tặng X để được lạy, được phù hộ, giải hạn", "ai tặng thì được ưu tiên", "chưa tặng thì chưa được vào". |
| BR-08.6 | **Tự khởi động lại:** chạy server qua `scripts/run.cmd`, script này lặp lại `node server/index.js` khi process thoát bất thường, nghỉ 3 giây giữa mỗi lần. |
| BR-08.7 | **Giữ log:** file `logs/` giữ 30 ngày. Script `scripts/prune-logs.mjs` xóa file cũ hơn 30 ngày, chạy mỗi lần khởi động. |
| BR-08.8 | **Kiểm tra trước live (checklist):** server đang chạy, demo đã chạy được, tắt demo, thấy trạng thái `connected`, Link Source hiện đúng hình, âm thanh có tiếng, camera người dẫn đặt đúng vùng, đã thử từ cấm, có phiên thử riêng tư ≥ 5 phút. |
| BR-08.9 | **Xử lý sự cố:** |
| | (a) Mất event > 60 s: kiểm tra trạng thái kết nối, server tự kết nối lại. Nếu thư viện hỏng, người dẫn chuyển sang nói chuyện trực tiếp, game vẫn hiển thị nhân vật cũ cho tới khi hết thời gian. |
| | (b) Cảnh đứng hình: refresh Link Source. Snapshot sẽ khôi phục cảnh. |
| | (c) Chữ phản cảm lên màn hình: chặn user ngay (V1 làm trên admin; MVP thêm vào `blocked.json` rồi restart), sau đó bổ sung từ cấm. |
| | (d) TikTok gửi cảnh báo hoặc strike: tắt Link Source game, giữ người dẫn, đọc kỹ thông báo, ghi vào nhật ký sự cố. |
| BR-08.10 | **Kiểm thử chạy dài (soak):** chạy mock 20 event/giây trong 8 giờ với Link Source đang mở. Đạt nếu RSS của Node và bộ nhớ của trang render không tăng quá 30% so với giờ thứ nhất. |

## 5. Tiêu chí nghiệm thu
- **AC-08.1** Một người chưa từng làm, đi theo runbook, lên được live thử trong ≤ 15 phút.
- **AC-08.2** Soak 8 giờ đạt BR-08.10. Kết quả ghi trong test.md.
- **AC-08.3** Giết process node: `run.cmd` khởi động lại trong ≤ 5 s, trang render tự nối lại.
- **AC-08.4** Chụp màn hình trong live thử: HUD không bị UI của TikTok che, không chồng lên camera người dẫn.
- **AC-08.5** Phiên live thử 30 phút bằng tài khoản phụ: có chat, like, quà thật hiện đúng trên màn hình; không có cảnh báo từ TikTok.

## 6. Ngoài phạm vi
- Lấy stream key và cấu hình OBS (D-04 đã chọn LIVE Studio).
- Hợp đồng với agency.

## 7. Câu hỏi mở
- **Q-08.1** LIVE Studio có thu âm thanh của Link Source không (xem Q-07.3)? Kiểm tra ở T08.2. Nếu không thu, thêm nguồn "âm thanh hệ thống".