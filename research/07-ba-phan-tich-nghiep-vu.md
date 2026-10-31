# Phần 7 · Phân tích nghiệp vụ (BA)

Tài liệu BA cho sản phẩm "Chùa online LIVE": một game tương tác chạy trên TikTok LIVE, trong đó người xem có nhân vật lên lạy Phật trong chánh điện ảo.

Ghi chú về số liệu: số có nguồn ghi rõ nguồn. Số **giả định** dùng để tính toán, cần đo lại khi chạy thật.

---

## 1. Bài toán và cơ hội

| Mục | Nội dung |
|---|---|
| **Nhu cầu người xem** | Muốn đi chùa nhanh, nằm nhà cũng làm được. Muốn thấy tên và lời nguyện của mình "được ghi nhận". Sansa (KR) chứng minh nhu cầu này: khoảng 600 nghìn lượt trong 3 ngày, có lúc phải xếp hàng chờ vào. |
| **Nhu cầu chủ kênh** | Cần một định dạng LIVE giữ chân người xem lâu và có doanh thu từ quà. Game tương tác hợp với nhu cầu đó vì mỗi người xem đều có "vai". |
| **Khoảng trống** | Ở VN chưa có sản phẩm chuyên cho bối cảnh chùa. Tool VN hiện có (HTSLive, TikLive Manager, TikGami) chỉ là hiệu ứng hoặc game chung chung. |
| **Thời điểm** | Trend đang nóng (10/2026), nhưng sẽ hạ nhiệt nhanh. Cần ra MVP trong vài tuần. |
| **Rào cản** | Chính sách TikTok ngày 24/9/2026 về xin quà, Luật Tín ngưỡng, tôn giáo, và việc TikTok không có API chính thức. Chi tiết ở [05](05-rui-ro-chinh-sach.md). |

## 2. Các bên liên quan

| Bên | Vai trò | Quan tâm |
|---|---|---|
| Chủ kênh / người dẫn live | Mở phiên live, dẫn chương trình, điều hành | Doanh thu, an toàn tài khoản, dễ vận hành |
| Người xem | Comment, like, tặng quà, xem nhân vật của mình | Thấy tên mình, thấy lời nguyện, cảm giác bình an hoặc giải trí |
| Người tặng quà lớn | Tặng Universe, Lion… | Được tôn vinh: vị trí đầu, hiệu ứng riêng, tên giữ lâu |
| Moderator | Lọc comment, chặn người phá | Có công cụ ẩn bong bóng hoặc chặn user nhanh |
| Dev / vận hành | Duy trì server, kết nối, cập nhật thư viện | Kết nối ổn định, có log, dễ sửa khi TikTok đổi giao thức |
| TikTok | Nền tảng | Tuân thủ Community Guidelines, LIVE Monetization Guidelines |
| Agency (nếu có) | Quản lý creator, hỗ trợ quyền LIVE Studio/stream key | Doanh thu creator, giờ live, chỉ số tương tác |
| Cộng đồng Phật giáo / cơ quan quản lý | Gián tiếp | Không xúc phạm tín ngưỡng, không trục lợi |

## 3. Persona

**P1 · "Người xem tò mò" (18–25 tuổi)**
- Vào live qua For You, thấy vui thì comment "nam mô" cho có nhân vật.
- Hiếm khi tặng quà, nếu có thì 1 Hoa hồng đổi từ phần thưởng hoạt động.
- Là số đông, tạo cảnh đông người.

**P2 · "Người cầu nguyện" (25–45 tuổi)**
- Gửi lời nguyện thật: thi cử, sức khỏe, tiền tài.
- Sẵn sàng tặng quà nhỏ để lời nguyện hiện rõ hơn.
- Cần cảm giác trang nghiêm, không bị trêu.

**P3 · "Đại gia phòng live"**
- Thỉnh thoảng tặng quà lớn để được chú ý.
- Cần được tôn vinh: tên to, vị trí đầu, người dẫn đọc tên.

**P4 · "Chủ kênh"**
- Có thể không phải dev. Cần cài đặt đơn giản và một bảng điều khiển để chỉnh cảnh, lọc từ, xem thống kê.

## 4. Giá trị mang lại

- **Cho người xem:** "Đi chùa 1 phút, tên bạn hiện trước tượng Phật, cả nghìn người cùng niệm."
- **Cho chủ kênh:** một định dạng LIVE có sẵn, chạy được nhiều giờ, mỗi người xem đều được tham gia. Người xem tương tác nhiều thì TikTok đề xuất phiên live nhiều hơn.

## 5. Mô hình kinh doanh

### 5.1 Các nguồn doanh thu

| Nguồn | Cách hoạt động | Ghi chú |
|---|---|---|
| **Quà LIVE** (chính) | Người xem tặng quà, creator nhận khoảng 50% giá trị dưới dạng kim cương | Theo [03](03-co-che-va-kinh-te.md). Phải tránh kiểu "tặng X thì được Y". |
| **Bán tool / license** cho kênh khác | Bán phần mềm "chánh điện" cho các kênh khác chạy | Giống mô hình HTSLive, TikGami, game trên itch.io, hoặc thuê bao khoảng $5/tháng như TikFinity |
| **Làm theo yêu cầu** | Dựng cảnh riêng cho chùa hoặc kênh khác | Giống các dev VN nhận làm trên Fiverr |
| **Phiên bản web như Sansa** | Trang web miễn phí, có nút ủng hộ | Không phụ thuộc TikTok. Sansa thêm nút "gạo cúng" theo yêu cầu người dùng. |

### 5.2 Ước tính doanh thu quà (giả định)

Công thức: `doanh thu creator/giờ ≈ số xu được tặng/giờ × 300 đ × 50%`.

| Kịch bản | Người xem cùng lúc | Xu/giờ (giả định) | Creator nhận/giờ |
|---|---|---|---|
| Thấp | ~300 | 2.000 | ~300 nghìn đ |
| Trung bình | ~1.500 | 10.000 | ~1,5 triệu đ |
| Cao (giống video 1) | ~3.500 | 50.000 | ~7,5 triệu đ |

- Mức xu/giờ là giả định để minh họa, không phải dữ liệu đo được.
- Nếu đi qua agency, agency có thể lấy một phần. Ví dụ, một agency VN ghi mức 15% doanh thu từ creator trực thuộc (tin tuyển dụng Mavis Entertainment, 2026).
- Nguồn thứ ba ước tính creator trung bình có $50–$200 cho mỗi phiên 1–2 giờ. Top streamer gaming đạt $3.000–$20.000/tháng chỉ từ quà, nhưng mẫu khảo sát chỉ 72 người.

### 5.3 Chi phí

| Hạng mục | Ước tính | Ghi chú |
|---|---|---|
| Asset: chánh điện, chú tiểu chibi, hiệu ứng, âm thanh | Tự làm hoặc thuê họa sĩ | Bắt buộc tự làm hoặc có license |
| Dev MVP | 2–4 tuần cho 1 dev | Phạm vi ở mục 9 |
| Euler Stream (token ký) | Gói miễn phí $0 cho lượng nhỏ, gói trả phí để nâng giới hạn | Chưa có bảng giá cụ thể |
| Máy chạy live | 1 PC Windows có GPU | LIVE Studio hiện chỉ có bản Windows; bản macOS đang beta (nguồn còn mâu thuẫn) |
| Người dẫn live | Theo giờ | Bắt buộc để không bị xếp vào nội dung chất lượng thấp |
| Server (nếu làm bản web như Sansa) | Tăng theo lượng truy cập | Sansa từng quá tải và gặp khó vì chi phí server |

## 6. KPI

| Nhóm | KPI | Cách đo |
|---|---|---|
| Tăng trưởng | Người xem cùng lúc (trung bình, đỉnh), tổng lượt xem | Event `roomUser` + LIVE Analytics |
| Tương tác | Tỉ lệ người comment / người xem; số nhân vật lên lạy mỗi giờ; số lần "nam mô" | Đếm từ event `chat`, `like` |
| Giữ chân | Thời gian xem trung bình | LIVE Analytics trong app |
| Doanh thu | Kim cương/giờ, số người tặng, quà lớn/giờ | Event `gift` (`diamondCount`) |
| Chất lượng | Số comment bị lọc, số report, số strike | Log bộ lọc, thông báo từ TikTok |
| Kỹ thuật | Thời gian kết nối ổn định, số lần mất kết nối, FPS cảnh render | Log server, đo FPS trên trang render |

## 7. User story

**Người xem**
- US-01. Là người xem, tôi comment câu niệm Phật để **nhân vật mang tên tôi** đi vào và lạy. Không cần tặng quà.
- US-02. Là người xem, tôi muốn **lời nguyện** của mình hiện thành bong bóng trên đầu nhân vật.
- US-03. Là người xem, tôi bấm like để thấy **khói nhang hoặc hoa sen** tăng lên.
- US-04. Là người tặng quà, tôi muốn **hiệu ứng tương ứng với món quà**, ví dụ đèn, hoa, chuông. Quà càng lớn thì hiệu ứng càng nổi.
- US-05. Là người tặng quà lớn, tôi muốn nhân vật của mình **quỳ hàng đầu**, tên được giữ lâu, người dẫn đọc tên.
- US-06. Là người xem, tôi muốn thấy **bộ đếm** "cả phòng đã niệm N lần".

**Chủ kênh / moderator**
- US-07. Là chủ kênh, tôi nhập `@username` rồi bấm "Bắt đầu" là kết nối được. Không phải đăng nhập tài khoản TikTok.
- US-08. Là moderator, tôi **ẩn bong bóng hoặc chặn user** chỉ bằng một nút.
- US-09. Là chủ kênh, tôi **sửa danh sách từ cấm** và danh sách câu kích hoạt (nam mô, A Di Đà Phật…).
- US-10. Là chủ kênh, tôi xem **thống kê phiên**: số người lạy, top lời nguyện, quà.
- US-11. Là chủ kênh, tôi bật **chế độ demo** với event giả để tập dượt trước khi lên live.

## 8. Quy tắc nghiệp vụ

| Mã | Quy tắc |
|---|---|
| BR-01 | Ai comment có câu kích hoạt (không phân biệt dấu và hoa thường) hoặc like lần đầu trong phiên thì được tạo nhân vật. **Quà không phải điều kiện để được lạy.** |
| BR-02 | Mỗi user chỉ có 1 nhân vật trên màn hình. Gửi tiếp thì nhân vật được làm mới (lạy thêm hoặc ở lâu hơn), không tạo nhân vật mới. |
| BR-03 | Trên màn hình có tối đa N nhân vật (mặc định 150). Khi đầy, nhân vật cũ nhất rời đi. Người tặng quà lớn được ưu tiên chỗ. |
| BR-04 | Quà tạo hiệu ứng theo bậc: nhỏ (<10 xu) là hoa hoặc nhang; vừa (10–999) là đèn; lớn (≥1.000) là chuông, hào quang, vị trí hàng đầu. |
| BR-05 | Quà combo chỉ xử lý khi combo kết thúc (`repeatEnd`). Hiệu ứng nhân theo `repeatCount`, có giới hạn trên. |
| BR-06 | Bong bóng chữ phải qua bộ lọc từ cấm, tối đa 40 ký tự, hiện tối đa 6 giây. Không hiện link hay số điện thoại. |
| BR-07 | Tên hiển thị dùng `nickname`, cắt còn 16 ký tự và cũng qua bộ lọc. |
| BR-08 | Không có câu chữ nào trên màn hình kiểu "Tặng X để được phù hộ/giải hạn". Chỉ dùng "Gửi lời nguyện", "Thắp nén nhang". |
| BR-09 | User bị chặn thì không tạo nhân vật, không hiện bong bóng, trong suốt phiên. |
| BR-10 | Người dẫn live phải có mặt. Không chạy game liên tục quá số giờ quy định mà không có người dẫn. |

## 9. Phạm vi MVP và lộ trình

| Giai đoạn | Phạm vi | Thời gian (ước tính) |
|---|---|---|
| **MVP** | Kết nối 1 kênh qua tiktok-live-connector. Có `chat`, `like`, `gift`, `member`. Cảnh 2D (nền tĩnh, chú tiểu với 3 động tác đi, quỳ, lạy). Có bong bóng chữ, bộ lọc từ cấm, bộ đếm "nam mô", hiệu ứng quà 3 bậc. Chế độ demo phát event giả. | 2–4 tuần |
| **V1** | Trang admin: chặn user, sửa từ cấm, thống kê. Nguồn event dự phòng TikFinity. Âm thanh chuông, mõ. Nhiều bối cảnh (ngày, đêm, lễ Rằm). | +2–3 tuần |
| **V2** | Bán license cho nhiều kênh: đăng nhập, cấu hình riêng mỗi kênh, cho thay skin. | +4–6 tuần |
| **Tùy chọn** | Bản web kiểu Sansa, không qua TikTok | Riêng |

**Không làm trong MVP:**
- 3D.
- Hỗ trợ nhiều kênh cùng lúc.
- Thanh toán.
- Bản cho Douyin (bị cấm theo Điều 17).

## 10. So sánh đối thủ

| Tiêu chí | Kênh trong video 1 | Sansa | Tool VN (HTSLive, TikGami) | Sản phẩm đề xuất |
|---|---|---|---|---|
| Nền tảng | TikTok LIVE | Web | TikTok LIVE | TikTok LIVE |
| Lạy cần quà? | Có vẻ cần (quan sát từ video) | Không | Tùy game | **Không** |
| Chat | Bong bóng | Không có | Tùy game | Bong bóng có lọc |
| Bối cảnh chùa | Có | Có | Không chuyên | Có |
| Rủi ro chính sách | Cao | Thấp | Trung bình | Thấp hơn |

## 11. Giả định cần kiểm chứng

1. Người xem VN vẫn tặng quà khi lạy đã miễn phí, tức là quà thuần để trang trí. Kiểm chứng bằng A/B giữa các phiên.
2. Tỉ lệ comment khi có câu kích hoạt đủ cao để tạo cảnh đông người.
3. TikTok không xếp game kèm người dẫn vào nhóm nội dung chất lượng thấp.
4. Kênh dùng để chạy có đủ điều kiện LIVE Studio. Mốc phổ biến là 1.000 follower và từ 18 tuổi, nhưng thay đổi theo khu vực.
