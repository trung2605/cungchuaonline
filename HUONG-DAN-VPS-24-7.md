# ☁️ Hướng Dẫn Chi Tiết Treo Livestream TikTok 3D 24/7 Trên VPS Windows

Phương thức **thuê VPS Windows (Cloud PC) chạy cả dự án 3D + TikTok LIVE Studio trên cùng 1 máy ảo** là phương thức **ổn định và hiệu quả nhất hiện nay**, vì:
1. Toàn bộ kết nối giữa **Server 3D (`127.0.0.1:8787`)** và **TikTok LIVE Studio** diễn ra nội bộ (`localhost`) nên độ trễ bằng `0ms`, không tốn băng thông mạng trung gian.
2. Mạng cáp quang tại trung tâm dữ liệu (Data Center) ổn định 24/24, không sợ mất điện hay rớt Wi-Fi ở nhà.
3. Bạn có thể tắt hoàn toàn máy tính cá nhân và chỉ cần mở điện thoại xem Live hoặc vào Remote Desktop khi muốn chỉnh Admin.

---

## 1. Cấu Hình VPS Cần Thuê (Rất Quan Trọng)

Vì **TikTok LIVE Studio** và **Cảnh Chùa 3D (Three.js WebGL)** cần vẽ đồ họa 3D liên tục ở 30 FPS, khi thuê VPS bạn hãy chọn gói **VPS Windows Có GPU (VPS Treo Game / Livestream)**:

| Thông số | Cấu hình tối thiểu | Cấu hình khuyến nghị (Mượt 24/7) |
| :--- | :--- | :--- |
| **Vị trí máy chủ (Location)** | **Việt Nam** (Hà Nội / TP.HCM) | **Việt Nam** (Để trùng IP Việt Nam với kênh TikTok) |
| **Hệ điều hành** | Windows 10 Pro 64-bit | Windows 10 / 11 Pro 64-bit |
| **CPU** | 4 vCPU | 4 – 6 vCPU |
| **RAM** | 6 GB – 8 GB | 8 GB – 12 GB |
| **Card đồ họa (GPU)** | Có GPU ảo/rời (GTX 1050 / P4 / T4...) | GPU rời/chia sẻ 2GB – 4GB VRAM |
| **Ổ cứng & Mạng** | 50 GB SSD · 100 Mbps+ | 60 GB NVMe · 200 Mbps+ |

> **⚠️ Lưu ý khi chọn thuê**: Hãy hỏi nhà cung cấp VPS câu này trước khi thuê: *"VPS này có GPU để mở TikTok LIVE Studio và chạy WebGL 3D không?"* (Không thuê VPS chỉ có CPU thường giá rẻ 80k–100k vì VPS không có GPU sẽ không mở được bộ mã hóa video của TikTok LIVE Studio).

---

## 2. Quy Trình 4 Bước Cài Đặt Trên VPS (Chỉ Làm 1 Lần Đầu)

### Bước 1: Cài Loa Ảo (VB-Cable) Để Giữ Âm Thanh Chuông Chùa & Giọng Đọc AI 24/7
Mặc định trên VPS, khi bạn tắt cửa sổ Remote Desktop thì Windows sẽ ngắt loa khiến Live bị mất tiếng. Để luôn có tiếng 24/7:
1. Mở trình duyệt trên VPS, tải phần mềm miễn phí **VB-CABLE Virtual Audio Device** tại: https://vb-audio.com/Cable/
2. Giải nén → Chuột phải vào `VBCABLE_Setup_x64.exe` → chọn **Run as administrator** → bấm **Install Driver** → Khởi động lại VPS.
3. Sau khi cài xong, VPS luôn có 1 chiếc loa ảo tên là **`CABLE Input (VB-Audio Virtual Cable)`** hoạt động 24/7 kể cả khi bạn đã thoát Remote Desktop.

### Bước 2: Chép Dự Án Lên VPS & Chạy File Cài Đặt Tự Động
1. Copy thư mục dự án `cungchuaonline` lên màn hình Desktop của VPS (hoặc dùng `git clone`).
2. Bấm đúp chạy file **`1-setup-vps-windows.bat`** (Chuột phải → **Run as administrator**).
   - File này sẽ tự động tắt chế độ Sleep của Windows, tối ưu Remote Desktop, cài đặt Node.js LTS (nếu chưa có) và chạy `npm install`.

### Bước 3: Khởi Động Hệ Thống Live 24/7 & Ghép Vào TikTok LIVE Studio
1. Bấm đúp vào file **`2-start-live-24-7.bat`**.
   - Cửa sổ Watchdog 24/7 sẽ bật cả 3 dịch vụ (`:8787`, `:8789`, `:8791`) và tự động khởi động lại trong 3 giây nếu có bất kỳ dịch vụ nào bị ngắt.
2. Mở **TikTok LIVE Studio** trên VPS và đăng nhập kênh TikTok của bạn:
   - Chọn **Add source (Thêm nguồn)** → **Link (Liên kết)**.
   - Nhập đường dẫn:
     - Bản đầy đủ hiệu ứng: **`http://127.0.0.1:8787`**
     - Hoặc bản siêu nhẹ tiết kiệm GPU khi treo nhiều ngày: **`http://127.0.0.1:8787/?quality=low`**
   - Độ phân giải: **`1080 x 1920`** (Dọc 9:16), FPS: **`30`**.
3. Bấm **Go LIVE** trên TikTok LIVE Studio.

### Bước 4: Thoát VPS Để Tắt Máy Tính Cá Nhân Mà Không Bị Đen Màn Hình 3D
> **❗ CỰC KỲ QUAN TRỌNG**: Khi muốn thoát cửa sổ điều khiển từ xa (Remote Desktop) để tắt máy tính ở nhà, **TUYỆT ĐỐI KHÔNG bấm nút `[X]` ở góc trên cùng của cửa sổ Remote Desktop** (vì bấm `[X]` sẽ khóa màn hình Windows trên VPS làm đứng hình 3D).

- Thay vào đó, hãy **bấm đúp vào file `3-thoat-vps-giu-live.bat`** ngay trên màn hình VPS!
- File này sẽ tự động ngắt kết nối Remote Desktop của bạn nhưng **vẫn giữ màn hình Windows bên trong VPS mở sáng bình thường**, giúp cảnh Chùa 3D và TikTok LIVE Studio chạy mượt 24/7.
- Sau khi cửa sổ Remote Desktop tự đóng lại, bạn có thể **tắt hẳn máy tính cá nhân (Shut down)** đi ngủ thoải mái!
