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
- **Chạy kiểm thử tự động (193 Unit & Integration Tests — 100% Pass):**
  ```bash
  npm test
  ```

---

## 🧪 Ma Trận Kiểm Thử Toàn Diện (193/193 Ca Kiểm Thử — Đạt 100%)

Toàn bộ tài liệu đặc tả kiểm thử tại [`docs/fr/FR-01..FR-10/test.md`](./docs/fr/README.md) và [`docs/superpowers/plans/2026-11-05-cay-bo-de-uoc-nguyen.md`](./docs/superpowers/plans/2026-11-05-cay-bo-de-uoc-nguyen.md) được kiểm chứng tự động qua 24 bộ test (`test/*.test.js`):

1. **Đồng bộ & Đối sánh 100% giữa bản Gốc (Non-BK: `server/`, `web/`, `admin/`) và bản Dự phòng (`CungChuaOnline/` — BK):**
   - Kiểm tra đồng nhất danh sách file và mã băm MD5 100% giữa `server/`, `web/`, `admin/` và `CungChuaOnline/server/`, `CungChuaOnline/web/`, `CungChuaOnline/admin/` (`TC-BK-01`).
   - Chạy song song toàn bộ Pipeline, Stage, BowRules, Filter, Effects, Counters, Stats, World Reducer, ActorFSM, TrendEngine, HTTP/WebSocket Server và Admin API trên cả bản Non-BK và bản BK (`TC-BK-02` .. `TC-BK-05`).
2. **Kiểm thử Chế độ PK (Đối kháng / Đua Top) & Non-PK (Tâm linh / Tương tác bình luận):**
   - **PK / Đua Top:** `CuocDuaKyThu` (soán ngôi Top 1 Vua Hành Trình `overtookKing`, mở Kho Báu Lễ Hội, 63 đặc sản tỉnh thành, 12 kỳ quan) và Trend `#5: Đại Chiến Gia Tộc 3D` (`dai-chien`) (`test/race.test.js`, `TC-PK-01`, `TC-PK-02`).
   - **Non-PK:** `Cúng Chùa Online 3D` (Chánh điện, Cây Bồ Đề Ước Nguyện 3D 50 dải lụa FIFO) và 9 Website 3D Bắt Trend TikTok còn lại (`test/bodhiTree.test.js`, `test/trendEngine.test.js`).
3. **Kiểm thử Tách biệt Nguồn Giả lập (`src: 'mock'`) & Nguồn Thật (`src: 'tiktok'` / `src: 'tikfinity'`):**
   - Quà tặng và bình luận từ `mock` vẫn hiển thị hiệu ứng 3D trên sân khấu nhưng **tuyệt đối không cộng vào doanh thu Kim cương thật hay Bảng Vàng Tri Ân thật** ở cả 3 hệ thống (`TC-06.6`, `TC-09.5`, `TC-MASTER-01`, `TC-PK-01`, `TC-VERCEL-03`).
4. **Kiểm thử Toàn bộ 10 FR (`FR-01` → `FR-10`), Admin Tổng (21 Biểu đồ ApexCharts) & Unified Vercel Runtime (`api/index.js`):**
   - Bao phủ đầy đủ `TC-01.*` đến `TC-10.*`, kiểm thử chống XSS (`TC-09.16`), kiểm thử `CREDITS.md` (`TC-07.19`), và kiểm thử tích hợp Serverless (`test/vercel.test.js`, `test/masterAdmin.test.js`).
