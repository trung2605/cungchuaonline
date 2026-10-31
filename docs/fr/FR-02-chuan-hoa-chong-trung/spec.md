# FR-02 · Chuẩn hóa event và chống trùng · Spec

## 1. Mục tiêu
- Đưa mọi event thô (connector; sau này có thêm TikFinity ở FR-10) về một dạng chung `NormEvent`.
- Bỏ event trùng. Event trùng có thể xuất hiện khi kết nối lại, khi chạy song song 2 nguồn, hoặc khi người xem spam.
- Nhờ vậy, phần nghiệp vụ phía sau không phụ thuộc vào nguồn event.

## 2. User story
- **US-02.1** Là dev, tôi muốn các FR phía sau chỉ làm việc với `NormEvent`. Khi TikTok đổi field, chỉ phải sửa một file.
- **US-02.2** Là chủ kênh, tôi không muốn một món quà bị tính hai lần khi hệ thống kết nối lại hoặc chạy song song hai nguồn.
- **US-02.3** Là chủ kênh, tôi muốn quà combo (Hoa hồng ×N) chỉ được tính **một lần, khi combo kết thúc**.

## 3. Quy tắc nghiệp vụ
| Mã | Quy tắc |
|---|---|
| BR-02.1 | Ánh xạ tên event: `chat→chat`, `like→like`, `gift→gift`, `member→join`, `roomUser→viewers`, `streamEnd→end`. Event khác trả `null`. |
| BR-02.2 | `uid = user.displayId` (handle `@uniqueId`; rỗng thì lấy `user.id`). `name = user.nickname`; nếu nickname rỗng thì lấy `uid`. Chat lấy `text = content`. `ts` mặc định là thời điểm nhận. `src = 'tiktok'`. |
| BR-02.3 | Quà combo (`gift.type === 1`) chỉ được map khi `repeatEnd` khác 0, với `repeat = repeatCount`. Quà không combo thì map ngay, với `repeat = repeatCount \|\| 1`. |
| BR-02.4 | `diamonds` là giá của **một** quà (`diamondCount`). Tổng giá trị là `diamonds × repeat`, được tính ở FR-04 và FR-05. |
| BR-02.5 | `like.count = count \|\| 1`. `viewers.count = Number(roomUser.total)`. `diamonds = gift.diamondCount`, `giftName = gift.name`, `giftId = Number(giftId)`. |
| BR-02.6 | Khóa chống trùng có dạng `kind\|uid\|payload`. Payload: chat là `text`, gift là `giftId:repeat`, like là `count`. Join chỉ dùng `kind\|uid`. `viewers` và `end` không chống trùng. |
| BR-02.7 | Một khóa đã gặp trong vòng **≤ 5000 ms** thì event bị **bỏ**. Khóa không chứa `src`, nên cùng một event đến từ hai nguồn chỉ được giữ một lần. |
| BR-02.8 | Bộ nhớ chống trùng tự dọn các khóa cũ hơn 5000 ms. |

## 4. Tiêu chí nghiệm thu
- **AC-02.1** Payload chat mẫu cho ra `{kind:'chat', src:'tiktok', uid, name, text, ts}`.
- **AC-02.2** Nhịp combo giữa chừng cho ra `null`. Nhịp cuối cho ra `repeat` bằng `repeatCount`.
- **AC-02.3** Cùng một chat đến hai lần cách nhau 4 s thì lần sau bị bỏ. Cách nhau 5,1 s thì được giữ.
- **AC-02.4** Cùng một gift đến từ `tiktok` và `tikfinity` cách nhau 300 ms thì chỉ giữ một.
- **AC-02.5** Nạp 10.000 khóa khác nhau, tua 6 s, rồi nạp thêm 1 event: kích thước bộ nhớ chống trùng ≤ 1.

## 5. Phi chức năng
Mỗi event xử lý O(1). Chi phí dọn bộ nhớ chia đều cho các lần gọi.

## 6. Ngoài phạm vi
Ánh xạ event TikFinity (FR-10). Lọc nội dung (FR-03).

## 7. Ghi chú nghiệp vụ
Spam cùng một câu niệm trong 5 s chỉ tính một lần, cho cả bộ đếm niệm lẫn lượt lạy. Đây là chủ ý để chống spam, nhất quán với D-01 (lạy có giới hạn).