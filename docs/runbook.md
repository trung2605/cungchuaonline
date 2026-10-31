# Runbook · Phát live Chùa Online

Làm lần lượt từ mục 1 đến mục 5 trước mỗi buổi live. Mục tiêu: từ lúc mở máy đến lúc lên live không quá 15 phút (AC-08.1).

## 1. Chuẩn bị máy (chỉ làm lần đầu)
1. Cài **Node.js 20 trở lên** (https://nodejs.org, bản LTS). Mở PowerShell, gõ `node -v` để kiểm tra.
2. Cập nhật driver card đồ họa (NVIDIA/AMD/Intel) lên bản mới nhất.
3. Cài **TikTok LIVE Studio** và đăng nhập bằng tài khoản kênh. Điều kiện tài khoản (BR-08.1): chủ kênh từ 18 tuổi, đã có quyền LIVE Studio (thường cần khoảng 1.000 follower), không có strike LIVE đang hiệu lực.
4. Mở thư mục dự án trong PowerShell rồi chạy `npm ci`.

## 2. File `.env` (chỉ làm lần đầu)
Copy `.env.example` thành `.env`, rồi điền:

| Biến | Giá trị |
|---|---|
| `TIKTOK_USER` | Tên kênh, **không có** dấu @. Ví dụ `chuaonline` |
| `EULER_KEY` | Không bắt buộc. Có key thì kết nối ổn định hơn |
| `ADMIN_PASSWORD` | Mật khẩu trang admin http://127.0.0.1:8788 (đăng nhập user `admin`). Để trống thì không chạy admin |
| `MAX_ACTORS` | Để `150`. Nếu máy yếu thì giảm xuống `80` |
| `TIKFINITY_WS` | Không bắt buộc. Nguồn dự phòng: mở app TikFinity, bật WebSocket, điền URL (thường `ws://127.0.0.1:21213/`). Để trống thì không dùng |

**Không bao giờ điền mật khẩu TikTok vào bất cứ đâu.** Hệ thống chỉ đọc sự kiện công khai của phiên live.

## 3. Chạy server
1. **Chạy thử bằng demo.** Gõ `npm run demo`, mở Chrome vào http://127.0.0.1:8787, thấy người vào lễ là được. Bấm `Ctrl+C` để tắt demo.
2. **Chạy thật** (sau khi đã bấm Go LIVE ở mục 4, hoặc ngay trước đó): gõ `scripts\run.cmd`.
   - Server bị crash thì `run.cmd` tự bật lại sau 3 giây và ghi một dòng vào `logs\restarts.log`.
   - Muốn tắt hẳn thì bấm `Ctrl+C`, sau đó trả lời `Y` nếu được hỏi.
3. Đợi dòng `tiktok @<kênh>: connected`. Nếu kênh **chưa live**, server sẽ thử kết nối lại liên tục; khi bấm Go LIVE thì trạng thái chuyển sang `connected`.
4. Log sự kiện được ghi vào `logs/events-YYYYMMDD.jsonl`. File cũ hơn 30 ngày tự xóa mỗi khi khởi động.

## 4. Cài đặt LIVE Studio (cài một lần, LIVE Studio tự lưu)
1. **Bố cục dọc.** Chọn khung **dọc 9:16 (1080×1920)**.
2. **Link Source:**
   - Thêm nguồn → *Link Source* (có thể tên là *Browser/Web*).
   - URL: `http://127.0.0.1:8787`, kích thước **1080 × 1920**.
   - Kéo nguồn phủ kín khung. Máy yếu thì đổi URL thành `http://127.0.0.1:8787/?quality=low`.
3. **Camera người dẫn:**
   - Thêm nguồn camera, đặt ở **góc trên bên trái**, khung **tròn 300×300 px** (BR-08.2).
   - Camera phải nằm **trên** Link Source trong danh sách nguồn.
   - Không đặt camera ở chỗ khác, vì HUD của game đã chừa đúng góc này.
4. **Âm thanh** (Q-08.1, *chưa xác minh, điền kết quả vào đây sau T08.2*):
   - Trong lúc chạy demo, bật live thử riêng tư và nghe từ điện thoại xem có tiếng mõ không.
   - Nếu **không** có tiếng: thêm nguồn **âm thanh hệ thống / desktop audio**.
   - Kết quả: `……`
5. **Encoder:** trong cài đặt, chọn hardware encoder (NVENC nếu là card NVIDIA).
6. **Phương án dự phòng** (khi Link Source đen màn hình hoặc báo lỗi WebGL):
   - Chạy `chrome --app=http://127.0.0.1:8787 --window-size=1080,1920`.
   - Trong LIVE Studio, dùng **Window Capture** để thu cửa sổ đó.
   - Trong cửa sổ Chrome này, phải bấm nút "Bật âm thanh" một lần.

## 5. Checklist trước live (BR-08.8)
- [ ] Đã chạy demo được, và **đã tắt demo** (không còn cửa sổ `npm run demo`).
- [ ] `scripts\run.cmd` đang chạy.
- [ ] Link Source hiện đúng chánh điện. Footer ghi `Gõ "Nam mô A Di Đà Phật" để vào lễ Phật`.
- [ ] Nghe được tiếng mõ/chuông trên luồng live (xem mục 4.4).
- [ ] Camera ở góc trên trái và không che bộ đếm, banner.
- [ ] Đã thử một từ cấm trong phiên thử: không có bong bóng chữ.
- [ ] **Lần đầu dùng máy mới hoặc bản mới:** live thử riêng tư ít nhất 5 phút.
- [ ] Bấm Go LIVE, rồi kiểm tra console hiện `connected`.

## 6. Kịch bản người dẫn (BR-08.4, BR-08.5)
**Luôn có mặt**, bằng hình hoặc bằng tiếng. Không để game tự chạy một mình quá **10 phút**.

**Nên nói:**
- "Mời quý Phật tử gõ *Nam mô A Di Đà Phật* để vào lễ."
- "Thêm *cầu bình an* (hoặc tài lộc, sức khỏe…) để gửi lời cầu nguyện."
- Đọc tên người đang lên lạy và lời cầu của họ: "Bạn Lan đang cầu bình an cho gia đình."
- Cảm ơn người tặng quà bằng tên: "Cảm ơn bạn Minh đã dâng hoa."

**Cấm nói** (dễ bị strike):
- "Tặng X để được lạy", "tặng để được phù hộ / giải hạn / may mắn".
- "Ai tặng thì được ưu tiên", "chưa tặng thì chưa được vào".
- Mọi câu hứa hẹn kết quả tâm linh nếu tặng quà.

Lượt lạy miễn phí luôn có: mỗi người 1 lượt mỗi 10 phút. Khi có người hỏi, người dẫn nói đúng như vậy.

## 7. Xử lý sự cố (BR-08.9)
Mỗi sự cố phải ghi vào `docs/incident-log.md`.

| Hiện tượng | Làm ngay (trong 1 phút) |
|---|---|
| **Không có người mới vào lễ hơn 60 giây** dù chat vẫn chạy | Xem console: nếu đang `reconnecting` thì server đang tự nối lại, cứ đợi. Nếu lỗi kéo dài trên 3 phút, người dẫn chuyển sang nói chuyện trực tiếp; các nhân vật cũ vẫn ở trên màn hình cho đến khi hết giờ. |
| **Cảnh đứng hình** hoặc màn hình đen | Chuột phải Link Source → *Refresh*. Cảnh tự khôi phục từ snapshot. |
| **Console báo server thoát** | `run.cmd` tự bật lại trong khoảng 3 giây, trang tự nối lại, không cần làm gì. Nếu server cứ thoát liên tục, chụp màn hình console, tắt Link Source và báo kỹ thuật. |
| **Chữ phản cảm lên màn hình** | 1. Mở admin http://127.0.0.1:8788, tab *Người dùng*, bấm **Chặn** ở dòng người đó: nhân vật rời chánh điện ngay. 2. Thêm từ đó vào tab *Danh sách từ* → *Lưu*, có hiệu lực ngay. (Không có admin thì thêm `uniqueId` vào `server/data/blocked.json` rồi khởi động lại `scripts\run.cmd`.) |
| **TikTok gửi cảnh báo hoặc strike** | Tắt (ẩn) Link Source game ngay. Người dẫn vẫn tiếp tục. Đọc kỹ thông báo, chụp màn hình, ghi vào nhật ký. Không bật lại game cho đến khi biết lý do. |

## 8. Tắt live và lưu log
1. Nói lời kết, rồi bấm **End LIVE** trong LIVE Studio.
2. Bấm `Ctrl+C` trong cửa sổ `run.cmd`, rồi trả lời `Y`.
3. Log của buổi nằm ở `logs/events-YYYYMMDD.jsonl` và được giữ 30 ngày. Nếu có sự cố thì giữ thêm bản sao.
4. Ghi sự cố (nếu có) vào `docs/incident-log.md`.

## Phụ lục · Kiểm thử chạy dài (soak, BR-08.10)
```
node scripts/soak.mjs --mock --rate 20
```
- Mở http://127.0.0.1:8787 trong Chrome (hoặc trong Link Source) và để chạy 8 giờ.
- Script ghi RSS của Node vào `logs/soak-*.csv` mỗi 10 phút.
- Bộ nhớ của trang: đọc trong Chrome → *Task Manager* (Shift+Esc) ở giờ 1 và giờ 8.
- Đạt nếu cả hai số ở giờ 8 không vượt 1,3 lần giờ 1. Ghi kết quả vào `docs/fr/FR-08-phat-live-van-hanh/test.md`.
