# FR-03 · Lọc nội dung · Spec

## 1. Mục tiêu
Chữ hiện lên stream gồm tên người xem và bong bóng lời nguyện, đặt ngay trước tượng Phật. Chỉ một câu tục cũng làm phiên live phản cảm, và người bị report là chủ kênh. FR này quyết định ba việc:
- câu nào được tính là **câu niệm kích hoạt**;
- chữ nào **được hiện** lên màn hình;
- **tên hiển thị** sau khi đã làm sạch.

## 2. User story
- **US-03.1** Là người xem, tôi gõ "nam mô", "Nam Mô A Di Đà Phật", "namo" hay "adida", có dấu hay không dấu, đều được tính là niệm Phật.
- **US-03.2** Là chủ kênh, tôi không muốn chữ tục, link, số điện thoại hay @tag hiện lên stream.
- **US-03.3** Là chủ kênh, tôi muốn tên người xem hiện gọn: không emoji, không quá dài.
- **US-03.4** Là chủ kênh (V1, qua FR-09), tôi sửa danh sách từ cấm và câu kích hoạt, và thay đổi có hiệu lực ngay.

## 3. Quy tắc nghiệp vụ
| Mã | Quy tắc |
|---|---|
| BR-03.1 | **Fold** (chuẩn hóa để so khớp), theo thứ tự: NFC → chữ thường → bỏ dấu (đ→d) → bỏ ký tự vô hình (zero-width, control) → gộp chữ lặp liên tiếp (`moooo`→`mo`) → nối các chữ cái đơn bị tách bằng `.`, `_`, `-` hoặc khoảng trắng (`v.c.l`→`vcl`, `n a m`→`nam`) → gộp khoảng trắng. |
| BR-03.2 | **Câu kích hoạt mặc định:** `nam mo`, `namo`, `a di da phat`, `adida`, `adidaphat`, `quan the am`, `mo phat`. Một câu khớp khi fold của nó xuất hiện trong fold của comment, có ranh giới từ ở hai đầu. |
| BR-03.3 | **Từ cấm** lấy từ `server/data/badwords.json` (đã fold sẵn). So khớp theo **nguyên token hoặc chuỗi token** trên văn bản đã fold, có ranh giới từ. Không bỏ khoảng trắng khi so, để "ad mình" không khớp nhầm với "dm". |
| BR-03.4 | **Bong bóng** bị loại (trả `null`) khi: có từ cấm; có URL (dạng `xxx.com`, `.vn`, `.net`, `.org`, `.me`, `.io`, `.xyz`, `http://`, `https://`); có số điện thoại (≥ 8 chữ số, kể cả khi bị ngăn cách bằng khoảng trắng hoặc dấu chấm); có `@mention`; hoặc rỗng sau khi làm sạch. |
| BR-03.5 | **Bong bóng hợp lệ:** NFC, bỏ ký tự vô hình, gộp khoảng trắng, cắt còn **40 code point**. Giữ nguyên dấu tiếng Việt để hiển thị. Emoji giữ lại trong bong bóng. |
| BR-03.6 | **Tên:** NFC, bỏ emoji (`\p{Extended_Pictographic}`), bỏ ký tự vô hình, gộp khoảng trắng, cắt còn **16 code point** rồi trim. Nếu rỗng hoặc chứa từ cấm thì dùng `Phật tử`. |
| BR-03.7 | Danh sách từ cấm và câu kích hoạt là một đối tượng `Lists` dùng chung, sửa được lúc đang chạy. Lần gọi sau dùng ngay danh sách mới. |
| BR-03.8 | Comment bị loại bong bóng **vẫn được tính kích hoạt** nếu nó chứa câu niệm. Việc này do FR-04 quyết định, FR-03 chỉ trả kết quả lọc. |

## 4. Tiêu chí nghiệm thu
- **AC-03.1** "Nam mô A Di Đà Phật" dạng NFD, "NAMOOO", "n.a.m m.o" đều được nhận là câu kích hoạt. "xin chào" và "nam môn học" thì không.
- **AC-03.2** "v.c.l luôn" và "đồ dm" bị loại. "ad mình ơi" thì không bị loại.
- **AC-03.3** "vào abc.com", "0912 345 678", "@ai đó" bị loại.
- **AC-03.4** Chuỗi 60 ký tự 'a' được cắt còn 40.
- **AC-03.5** Tên "🙏Minh Anh Nguyễn Thị Lan" thành "Minh Anh Nguyễn". Tên "dm" thành "Phật tử".
- **AC-03.6** Thêm "xyz" vào `lists.badwords` lúc đang chạy thì lần gọi sau loại "xyz".

## 5. Phi chức năng
Mỗi comment xử lý dưới 0,2 ms với danh sách 2.000 từ cấm. Dùng `Set` cho token đơn, còn cụm nhiều token thì duyệt.

## 6. Ngoài phạm vi
Lọc theo ngữ cảnh bằng AI để V2. Danh sách từ cấm chỉ dựa trên nguồn mở.

## 7. Câu hỏi mở
- **Q-03.1** Danh sách từ cấm khởi tạo từ `vietnamese-offensive-words`, sau đó chủ kênh bổ sung. **Mặc định: làm như vậy.**