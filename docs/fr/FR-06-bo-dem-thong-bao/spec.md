# FR-06 · Bộ đếm niệm, số người xem, banner · Spec

## 1. Mục tiêu
Tạo cảm giác "cả chùa cùng niệm":
- bộ đếm số lần niệm của cả phòng;
- số người xem;
- banner thông báo người mới vào, người dâng lễ lớn, và các mốc niệm.

## 2. User story
- **US-06.1** Là người xem, tôi thấy dòng "Đã niệm: N" tăng mỗi khi có người niệm, kể cả người đang trong thời gian chờ 10 phút.
- **US-06.2** Là người xem mới vào, tôi thấy dòng "{tên} vừa vào chùa".
- **US-06.3** Là người tặng quà lớn, tên tôi hiện trên banner.
- **US-06.4** Là chủ kênh, tôi muốn có banner chúc mừng mỗi khi cả phòng đạt mốc niệm, để người xem cùng hưởng ứng.

## 3. Quy tắc nghiệp vụ
| Mã | Quy tắc |
|---|---|
| BR-06.1 | **Bộ đếm niệm.** Mỗi comment có câu kích hoạt (đã qua bước chặn và chống trùng) làm `namo` tăng 1, rồi phát `{t:'counter', key:'namo', value}`. Không phụ thuộc thời gian chờ 10 phút của FR-04. |
| BR-06.2 | **Số người xem.** Nhận event `viewers` thì cập nhật `viewers` và phát `{t:'counter', key:'viewers', value}`. |
| BR-06.3 | **Banner vào chùa.** Event `join` sinh banner `{tên đã làm sạch} vừa vào chùa`, hiển thị 3000 ms. Tối đa **1 banner mỗi 2000 ms** cho toàn phòng; join đến trong khoảng đó thì bỏ qua. |
| BR-06.4 | **Banner dâng lễ.** Quà bậc 2 sinh banner `{tên} dâng {giftName} 🙏`, hiển thị 5000 ms. Banner này có ưu tiên: trong 5000 ms đó **không** phát banner vào chùa. |
| BR-06.5 | **Banner mốc niệm.** Khi `namo` chạm bội số của **1000**, phát banner `Cả chùa đã niệm {N} lần 🙏`, hiển thị 4000 ms. Banner này có cùng mức ưu tiên với BR-06.4. |
| BR-06.6 | Banner không chứa câu chữ mời tặng quà (theo ràng buộc chung). |
| BR-06.7 | Các bộ đếm bắt đầu lại từ 0 mỗi lần khởi động process. Một process tương ứng một phiên. |
| BR-06.8 | `state()` trả `{namo, viewers}`, dùng cho snapshot. |

## 4. Tiêu chí nghiệm thu
- **AC-06.1** 3 comment "nam mô" từ 3 người khác nhau (một người đang trong thời gian chờ) thì `namo = 3`.
- **AC-06.2** 5 event join trong 1 s chỉ tạo 1 banner.
- **AC-06.3** Quà Galaxy lúc t=0, join lúc t=2500: không có banner vào chùa. Join lúc t=5100 thì có.
- **AC-06.4** `namo` đi từ 999 lên 1000: có banner mốc.
- **AC-06.5** Snapshot có `counters` đúng giá trị hiện tại.

## 5. Ngoài phạm vi
- Thống kê phiên chi tiết (FR-09).
- Cách hiển thị banner (FR-07).

## 6. Câu hỏi mở
- **Q-06.1** Bộ đếm niệm có cần giữ qua nhiều phiên không, ví dụ "tổng từ trước tới nay"? **Đã chốt 31/10: chỉ đếm trong phiên.**
## Bổ sung v2 (31/10, D-11)
| Mã | Quy tắc |
|---|---|
| BR-06.9 | **Thẻ người tặng gần nhất.** Mỗi gift (sau khi đã chống trùng) phát `{t:'donor', uid, name, giftName, repeat, diamonds: diamonds×repeat}`. Client hiện mỗi thẻ 6 s, xếp hàng chờ tối đa 5 thẻ, đầy thì bỏ thẻ cũ nhất. |
| BR-06.10 | **Bảng tri ân.** Lấy top 8 uid theo tổng kim cương trong phiên, sắp giảm dần; bằng nhau thì ai đạt mức đó trước đứng trên. Khi bảng thay đổi, phát `{t:'board', top}` **tối đa 1 lần mỗi 2000 ms**. Thay đổi rơi vào lúc đang chờ thì được phát ở `tick()` kế tiếp. Event có `src:'mock'` vẫn hiện trên bảng (để chạy demo), nhưng FR-09 không tính các event này vào doanh thu. |
| BR-06.11 | **Câu đối.** Snapshot gửi kèm `couplets`. Khi admin sửa danh sách (FR-09), phát `{t:'couplets', pairs}`. Client tự đổi câu mỗi **10 s**. |

- **AC-06.6** 3 gift trong 1 s: có 3 message `donor`, nhưng chỉ 1 message `board` ngay lúc đó. Message `board` kế tiếp được phát ở `tick` sau khi đủ 2 s.
- **AC-06.7** Bảng tri ân không bao giờ vượt quá 8 dòng và luôn sắp giảm dần.