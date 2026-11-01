# 🎮 Live TikTok — Hệ Sinh Thái Game Tương Tác 3D TikTok LIVE

Dự án **Live TikTok** bao gồm **Admin Tổng (`AdminTong/`)** và **2 tựa game 3D tương tác thời gian thực** dành cho **TikTok LIVE Studio (khung dọc 9:16 - 1080×1920)**, chia sẻ chung bộ lõi kết nối TikTok LIVE (`tiktok-live-connector` + `TikFinity` + khử trùng lặp `dedupe` + lọc từ cấm `filter` + giọng đọc AI tiếng Việt `/tts` + Cơ sở dữ liệu **MongoDB**):

## 📁 Cấu Trúc Thư Mục Đa Game & Admin Tổng

1. **[`AdminTong/`](./AdminTong)** *(Cổng Quản Trị Tổng & Cơ Sở Dữ Liệu MongoDB)*
   - **Địa chỉ Admin Tổng:** `http://127.0.0.1:8791` (Tài khoản: `admin` / Mật khẩu trong `.env`: `chuaonline123`)
   - **Tính năng:**
     - **Quản lý toàn bộ trò chơi:** Theo dõi trạng thái trực tiếp của tất cả game, đổi tài khoản TikTok LIVE (`@adidaphat20266`) một lần áp dụng đồng bộ cho toàn bộ các game, bật/tắt Demo và kích hoạt sự kiện thử nghiệm từ xa.
     - **Quản lý toàn bộ quà tặng livestream:** Ghi nhận thời gian thực mọi phần quà từ tất cả trò chơi, thống kê bảng vàng Top Donors toàn hệ thống, và chỉnh sửa danh mục quà tặng + phần thưởng (`gift_catalog`).
     - **Lưu lịch sử các phần đã làm (`work_logs`):** Lưu vết đầy đủ các hạng mục tính năng, thay đổi cấu hình và nhật ký vận hành.
     - **Kết nối MongoDB (`MONGODB_URI` trong `.env`):** Tự động lưu vào MongoDB khi có `MONGODB_URI`, đồng thời có cơ chế dự phòng lưu tại `logs/master-db.json` và tự động đồng bộ toàn bộ lịch sử lên MongoDB ngay khi kết nối.

2. **[`CungChuaOnline/`](./CungChuaOnline)** *(Đồng bộ cùng thư mục gốc `server/`, `web/`, `admin/`)*
   - **Màn hình 3D Chánh Điện (Render + WebSocket):** `http://127.0.0.1:8787`
   - **Bảng Quản Trị Riêng (Admin UI):** `http://127.0.0.1:8788`
   - **Tính năng:** Phật tử bình luận *"Nam mô A Di Đà Phật"* hoặc tặng quà TikTok để hóa thân thành nhân vật 3D bước lên thảm đỏ dâng hương, lễ Phật, nhận **Áo tràng Vàng (10–999💎)** hoặc **Áo tràng Hoàng Kim + Quỳ Hàng Đầu + Đại Hồng Chung (1000+💎)**.

3. **[`CuocDuaKyThu/`](./CuocDuaKyThu)** *(Tựa game 3D: Cuộc Đua Kỳ Thú - Chạy Vô Hạn Khám Phá Thế Giới)*
   - **Màn hình 3D Đường Đua (Render + WebSocket):** `http://127.0.0.1:8789`
   - **Bảng Quản Trị Riêng (Admin UI):** `http://127.0.0.1:8790`
   - **Tính năng:**
     - Người xem bình luận bất kỳ, thả tim hoặc tặng quà sẽ xuất hiện ngay thành vận động viên 3D trên đại lộ khám phá thế giới chạy liên tục vô hạn.
     - Tự động hiển thị thiệp chào mừng và phát giọng đọc AI tiếng Việt: **`"Chào user [tên] đã tham gia cuộc đua cùng chúng tôi"`**.
     - Hành trình tự động chuyển cảnh mượt mà qua **6 kỳ quan thế giới**: Việt Nam 🇻🇳, Nhật Bản 🇯🇵, Ai Cập 🇪🇬, Pháp 🇫🇷, Mỹ 🇺🇸, Ngân Hà Vũ Trụ 🌌.
     - **4 cấp trang bị tăng tốc 3D theo quà TikTok:** Đôi Cánh Năng Lượng (`1–9💎`), Ván Trượt Hoàng Kim (`10–99💎`), Tên Lửa Tia Chớp (`100–999💎`), Siêu Phi Thuyền Ngân Hà & Vương Miện (`1000+💎`).

---

## 🚀 Cách Khởi Chạy

- **Chạy đồng thời toàn hệ thống (Admin Tổng + Cúng Chùa Online + Cuộc Đua Kỳ Thú):**
  ```bash
  npm start
  ```
- **Chạy kiểm thử tự động (155 Unit & Integration Tests):**
  ```bash
  npm test
  ```
