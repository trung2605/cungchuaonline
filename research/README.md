# Chùa online trên TikTok LIVE: tặng quà, nhân vật lên lạy Phật

Báo cáo nghiên cứu · 31/10/2026

Nội dung gồm: trend đang chạy ở đâu, người xem tương tác ra sao, cách làm kỹ thuật mới nhất và các rủi ro chính sách cần biết trước khi tự build.

- Dựa trên: 2 video mẫu trong project và tra cứu web bằng tiếng Việt, Hàn, Trung, Anh.
- Mục tiêu: tự build.
- Bản web: https://claude.ai/artifact/E1wE3B2UjHsJZc4XkfoAMb

## Mục lục

| File | Nội dung |
|---|---|
| [01-video-mau.md](01-video-mau.md) | Phân tích 2 video mẫu |
| [02-ban-do-trend.md](02-ban-do-trend.md) | Trend đang chạy ở VN, KR, CN và toàn cầu |
| [03-co-che-va-kinh-te.md](03-co-che-va-kinh-te.md) | Event nào sinh ra hành động nào, kinh tế của một lượt lạy |
| [04-ky-thuat.md](04-ky-thuat.md) | Đường ống kỹ thuật, cách bắt event, render, phát, code Node |
| [05-rui-ro-chinh-sach.md](05-rui-ro-chinh-sach.md) | Rủi ro chính sách, pháp lý và cách làm an toàn hơn |
| [06-chua-xac-minh.md](06-chua-xac-minh.md) | Những điểm chưa xác minh được |
| [07-ba-phan-tich-nghiep-vu.md](07-ba-phan-tich-nghiep-vu.md) | **BA:** stakeholder, persona, mô hình doanh thu, KPI, user story, quy tắc nghiệp vụ, phạm vi MVP |
| [08-ky-thuat-chi-tiet.md](08-ky-thuat-chi-tiet.md) | **Kỹ thuật chi tiết:** kiến trúc, schema event, máy trạng thái nhân vật, bộ lọc, render, độ ổn định, kiểm thử |
| [09-quan-sat-live-traigalongson92.md](09-quan-sat-live-traigalongson92.md) | Quan sát live mẫu: bố cục, lời cầu, bảng tri ân, câu đối, vòng đời nhân vật |
| [nguon.md](nguon.md) | Tài liệu tham khảo |

## Tóm tắt

Đây là một **game tương tác trên LIVE** đặt trong bối cảnh chùa. Mỗi quà hoặc comment của người xem tạo ra một nhân vật mang tên người đó. Nhân vật đi lên lạy trước tượng Phật, trên đầu có bong bóng chữ chứa lời nguyện.

- **Cảm hứng:** trang Sansa (산사) của Hàn Quốc nổi lên cuối tháng 10/2026, có khoảng 600 nghìn lượt truy cập trong 3 ngày. Trên trang, người dùng hóa thành chú tiểu và có thể chắp tay, lạy, lần chuỗi hạt.
- **Bản VN trên TikTok:** chuyển cơ chế của Sansa thành game nhận quà. Tặng 1 Hoa hồng (1 xu) là có nhân vật lên lạy. Chưa có báo chí nào viết về hình thức này, nên bằng chứng chính là video mẫu.
- **Kỹ thuật:** giống hệt "弹幕互动游戏" (game tương tác bằng bình luận) của Douyin và các game LIVE dùng TikFinity. Cách làm là bắt event qua thư viện không chính thức, render chánh điện trên trang web, rồi đưa trang đó lên LIVE Studio hoặc OBS.
- **Rủi ro lớn nhất:** nội dung "lạy Phật đổi quà" dễ bị coi là trục lợi tín ngưỡng theo Luật Tín ngưỡng, tôn giáo 2016. Livestream không có người dẫn hoặc phát lặp lại dễ bị TikTok xếp vào nội dung chất lượng thấp và không được nhận quà.
- **Bản cập nhật:**
  - Community Guidelines của TikTok có hiệu lực từ **24/9/2026**. Theo các nguồn thứ cấp, bản này cấm "xin quà cụ thể" và cấm kiểu "tặng cái này thì tôi làm cái kia". Cơ chế "tặng Hoa hồng thì được lạy" khớp đúng mẫu đó.
  - Ở Trung Quốc, **Điều 17 Quy chế dịch vụ thông tin tôn giáo trên Internet** cấm hẳn livestream lạy Phật, thắp hương. Vì vậy trend này khó tồn tại trên Douyin.

## Khuyến nghị chính

**Cho lạy miễn phí, quà chỉ để trang trí.** Ai comment câu niệm Phật hoặc bấm like cũng có nhân vật lên lạy. Quà chỉ thêm hiệu ứng như đèn, hoa, chuông. Phiên live luôn có người thật dẫn. Chi tiết ở [05-rui-ro-chinh-sach.md](05-rui-ro-chinh-sach.md#cách-làm-an-toàn-hơn).
