# FR-04 · Lên chánh điện: luật lạy, chỗ ngồi, thời gian ở lại · Spec

## 1. Mục tiêu
Quyết định **ai** có nhân vật trong chánh điện, nhân vật **ngồi ở đâu**, **lạy bao nhiêu lần** và **ở lại bao lâu**. Luật lạy theo D-01: kết hợp, có giới hạn.

## 2. Tác nhân
Người xem (miễn phí), người tặng quà, chủ kênh.

## 3. User story
- **US-04.1** Là người xem, tôi comment câu niệm Phật thì nhân vật mang tên tôi đi vào và lạy 1 lần, không cần tặng quà. Mỗi 10 phút tôi được 1 lượt như vậy.
- **US-04.2** Là người xem đã có nhân vật, tôi comment thêm thì lời của tôi hiện thành bong bóng trên đầu nhân vật.
- **US-04.3** Là người tặng quà, tôi tặng thì nhân vật lên ngay (không phải chờ 10 phút), lạy thêm theo số quà, và ở lại lâu hơn.
- **US-04.4** Là người tặng quà lớn, nhân vật của tôi quỳ ở hàng đầu, gần tượng Phật.
- **US-04.5** Là chủ kênh, tôi muốn chánh điện không quá tải: tối đa 150 nhân vật, và người tặng quà không bị đẩy ra trước người xem miễn phí.

## 4. Quy tắc nghiệp vụ
| Mã | Quy tắc |
|---|---|
| BR-04.1 | **Lượt miễn phí.** Comment có câu kích hoạt (FR-03) được tính là lượt miễn phí nếu uid **chưa từng** dùng lượt miễn phí trong phiên, hoặc lần dùng gần nhất đã cách **≥ 600.000 ms** (10 phút). Khi đó gọi `enter(uid, tier 0, +1 lạy)` và ghi lại thời điểm dùng lượt. |
| BR-04.2 | **Đang trong 10 phút chờ**, comment kích hoạt: nếu nhân vật còn trên màn hình thì chỉ hiện bong bóng, không lạy thêm và không kéo dài thời gian ở lại. Nếu nhân vật không còn thì không hiện gì. Bộ đếm niệm vẫn tăng (FR-06). |
| BR-04.3 | **Comment không kích hoạt:** chỉ hiện bong bóng nếu nhân vật còn trên màn hình. |
| BR-04.4 | **Quà:** `total = diamonds × repeat`; `tier = giftTier(total)`, trong đó `<10 → 0`, `10–999 → 1`, `≥1000 → 2`. Gọi `enter(uid, tier, +min(repeat, 10) lạy)` ngay lập tức. Quà không tính và không làm mới lượt miễn phí. |
| BR-04.5 | **Một uid = một nhân vật.** Uid đã có nhân vật thì chỉ cập nhật: `tier = max(cũ, mới)`, `bows = min(50, bows + thêm)`, `expiresAt = max(expiresAt, now + TTL(tier))`. Nếu tier tăng lên 2 mà nhân vật đang ở hàng thường, nhân vật được chuyển lên hàng đầu khi hàng đầu còn chỗ trống. Việc chuyển phát ra message `{t:'move', id, slot}`: nhân vật đứng dậy, đi thẳng lên chỗ mới rồi quỳ lạy tiếp. |
| BR-04.6 | **Thời gian ở lại (TTL):** tier 0 = 60 s, tier 1 = 120 s, tier 2 = 300 s. |
| BR-04.7 | **Chỗ ngồi:** 150 slot, đánh số từ 0. Slot 0–19 là **hàng đầu, chỉ dành cho tier 2**. Slot 20–149 là hàng thường. Tier 2 lấy slot hàng đầu trống có số nhỏ nhất; hết chỗ thì lấy slot hàng thường. Tier 0 và tier 1 lấy slot hàng thường trống có số nhỏ nhất. |
| BR-04.8 | **Chánh điện đầy.** Người mới được đẩy một nhân vật khác ra, chọn trong vùng slot người mới được phép ngồi. Thứ tự chọn: tier thấp nhất trước, cùng tier thì ai vào sớm nhất (`joinedAt` nhỏ nhất) trước. Chỉ được đẩy nhân vật có **tier ≤ tier người mới**. Không có ai hợp lệ thì người mới **không được vào** (không có message). Nhân vật bị đẩy nhận `leave` trước khi người mới nhận `spawn`. |
| BR-04.9 | **Hết hạn.** `tick()` trả `leave` cho mọi nhân vật có `expiresAt ≤ now`. |
| BR-04.10 | **Skin:** `skin = hash(uid) % 4`, cố định theo uid. Cùng một uid quay lại thì vẫn mặc cùng skin. |
| BR-04.11 | **Bong bóng** dùng `cleanBubble` (FR-03). Kết quả `null` thì không hiện. Thời gian hiện là 6000 ms. Nội dung bong bóng là chính comment (đã làm sạch). |
| BR-04.12 | **Tên nhân vật** là `cleanName(name)`. Lấy một lần lúc nhân vật vào, không cập nhật lại. |
| BR-04.13 | Uid trong danh sách chặn bị bỏ qua hoàn toàn, trước cả bước chống trùng. |

## 5. Tiêu chí nghiệm thu
- **AC-04.1** Lúc t=0, A comment "nam mô" thì có `spawn` (tier 0, bows 1). Lúc t=5 phút, A comment "nam mô" lần nữa thì chỉ có `say`, không có `bow`. Lúc t=10 phút, A comment "nam mô" (sau khi nhân vật cũ đã hết hạn) thì có `spawn` mới.
- **AC-04.2** B đang trong 10 phút chờ, tặng Rose ×3: có `spawn` hoặc `bow` với 3 lạy, nhân vật ở lại 60 s.
- **AC-04.3** C tặng Galaxy (1000 xu): `spawn` với tier 2, slot < 20, TTL 300 s.
- **AC-04.4** A spam trigger 100 lần (đã qua lớp chống trùng): vẫn chỉ có 1 nhân vật và bows không vượt 50.
- **AC-04.5** Chánh điện đầy (150), có 5 nhân vật tier 2, người mới tier 0 vào: nhân vật tier 0 vào sớm nhất bị đẩy ra, không nhân vật tier 2 nào bị đẩy.
- **AC-04.6** 130 slot thường đều là tier 1, người mới tier 0 vào: người mới không được vào, không có message nào.
- **AC-04.7** Nhân vật tier 0 đang ở slot 40, uid đó tặng Galaxy, hàng đầu còn trống: nhân vật chuyển lên slot < 20. Phát `{t:'move', id, slot}` với `slot < 20`, sau đó là `bow`.
- **AC-04.8** Uid bị chặn comment "nam mô": không có message nào.

## 6. Phi chức năng
`enter` chạy O(n) với n ≤ 150. Một lần xử lý event mất dưới 1 ms.

## 7. Ngoài phạm vi
Hiệu ứng quà (FR-05). Bộ đếm và banner (FR-06). Animation (FR-07).

## 8. Câu hỏi mở
- **Q-04.1** Người xem đang trong 10 phút chờ có cần được báo "còn X phút" không? **Đã chốt 31/10: không báo.**
- **Q-04.2** Khi nhân vật được lên hàng đầu: **Đã chốt 31/10: đi thẳng lên, dùng message `move`.**
## Bổ sung v2 (31/10, D-09, D-11)
| Mã | Quy tắc |
|---|---|
| BR-04.14 | **Lời cầu của nhân vật.** Khi chat được cấp lượt lạy, `intent = detectIntent(text) ?? intent hiện có ?? 'Cầu Bình An'`. Quà **không** đổi lời cầu; uid mới tặng quà thì nhân vật nhận lời cầu `Cầu Bình An`. Chat trong 10 phút chờ không đổi lời cầu. |
| BR-04.15 | **Kim cương theo uid.** Mỗi quà cộng `diamonds × repeat` vào tổng của uid trong phiên. Tổng này vẫn được giữ khi nhân vật rời đi rồi quay lại. `Actor.diamonds` lấy giá trị tổng này. Mỗi lần cộng phát ra `{t:'badge', id, diamonds}`, đặt sau message `bow` hoặc `spawn`. |
| BR-04.16 | **Lên bàn thờ.** `spawn` luôn hiểu là nhân vật đi lên bàn thờ trước rồi mới về chỗ (FR-07). Quà tặng cho nhân vật đã có mặt phát `{t:'bow', id, times, visit:true}`. Lượt lạy không do quà thì `visit` là false hoặc không có. |
| BR-04.17 | **Bố cục bồ đoàn** (thay cách diễn giải chỗ ngồi ở BR-04.7, số slot giữ nguyên). Slot 0–19 là 2 hàng bồ đoàn gần bàn thờ nhất, mỗi hàng chia 5 bên trái và 5 bên phải. Slot 20–149 là các hàng sau, mỗi hàng 12 chỗ chia 6 trái và 6 phải. Ở giữa là thảm đỏ, không có slot. |

- **AC-04.9** Comment "cầu tài lộc" lần đầu: `spawn` có `intent:'Cầu Tài Lộc'`. Gift lần đầu: `intent:'Cầu Bình An'`.
- **AC-04.10** Uid tặng Rose ×3, nhân vật rời đi, sau đó tặng Doughnut (30) ×1: `spawn` có `diamonds:33`.
- **AC-04.11** Nhân vật đang ngồi, nhận Rose: có `{t:'bow', times:1, visit:true}` rồi `{t:'badge'}`.