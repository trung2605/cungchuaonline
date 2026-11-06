# Cây Bồ Đề Ước Nguyện 3D (Sacred Wish Bodhi Tree) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng tính năng "Cây Bồ Đề Ước Nguyện 3D" trong chánh điện Cúng Chùa Online: Cây bồ đề cổ thụ tỏa ánh hoàng kim, tự động treo dải lụa đỏ thắm khắc tên và lời ước của Phật tử bay lên cành cây, đung đưa theo gió kèm tiếng phong linh thanh tịnh.

**Architecture:** 
1. Module 3D `web/scene/bodhiTree.js`: Dựng cây bồ đề cổ thụ 3D (thân vỏ cổ thụ, chậu đá hoa sen, tán lá bồ đề tim ngọc, hào quang ánh vàng và bụi đom đóm), quản lý mảng dải lụa 3D vật lý gió (`PlaneGeometry` nhiều đốt uốn lượn) và animation dải lụa bay từ người quỳ lễ lên cành cây.
2. Server Engine `server/stage.js` & `server/bowRules.js`: Quản lý danh sách ước nguyện (`wishes`), phát sinh sự kiện `wish_ribbon` khi có bình luận cầu an/lễ vật, đồng bộ snapshot cho người xem mới.
3. Audio `web/scene/audio.js`: Bổ sung âm thanh phong linh / chuông gió ngân vang thanh khiết khi dải lụa bay lên buộc vào cành.
4. UI & Admin: Hiển thị huy hiệu dải lụa trên HUD chánh điện, danh sách sớ lụa ước nguyện, và bảng điều khiển Cây Bồ Đề trong Admin Tổng.

**Tech Stack:** Three.js, GSAP 3, WebGL Canvas Texture, Web Audio API, Node.js Test Runner.

**Spec:** `docs/superpowers/plans/2026-11-05-cay-bo-de-uoc-nguyen.md`

## Global Constraints
- Không làm giảm FPS trên thiết bị yếu; dải lụa dùng geometry tái sử dụng tối ưu, canvas texture vẽ theo lô.
- Toàn bộ vị trí 3D không chắn tầm nhìn tượng Phật, câu đối và bàn thờ chính.
- Giữ vững 100% test contract hiện có, các lệnh PowerShell dùng `;` thay vì `&&`.
- Giao tiếp và nhãn tiếng Việt trang nghiêm, đậm nét văn hóa Phật giáo Việt Nam.

## Review Focus
1. Dải lụa bay uốn lượn mượt mà bằng GSAP curve, không bị giật lag khi có nhiều người cùng chat.
2. Canvas texture hiển thị tên và điều ước chữ vàng sắc nét, không bị nhòe trên mobile.
3. Khi người xem mới vào phòng live, cây bồ đề đã có sẵn các dải lụa của những người trước đó (không bị trống trơn).
4. Hệ thống chống spam: Giới hạn số dải lụa tối đa trên cây (35-50 dải lụa), luân chuyển dải lụa cũ một cách duyên dáng.
5. Admin Tổng có nút kích hoạt dải lụa mẫu và reset cây về trạng thái ban đầu.

---

## Tasks

### Task 1: Server Wish Registry & Event Protocol
- [x] Viết test `test/bodhiTree.test.js` kiểm tra thêm lời ước nguyện, giới hạn tối đa dải lụa, tạo sự kiện `wish_ribbon` và snapshot.
- [x] Cập nhật `server/stage.js`: Bổ sung `wishes` map/queue, hàm `addWish(uid, name, wish, tier, diamonds)` và đưa vào `snapshot()`.
- [x] Cập nhật `server/bowRules.js`: Khi Phật tử niệm Phật, gửi lời cầu an hoặc dâng lễ, tự động kích hoạt lời ước vào Cây Bồ Đề.
- [x] Chạy `node --test test/bodhiTree.test.js` xác nhận đạt 100%.

### Task 2: 3D Procedural Bodhi Tree & Wind Ribbon Engine
- [x] Tạo module `web/scene/bodhiTree.js`:
  - Dựng chậu đá sen cổ, thân cây bồ đề cổ thụ xoắn rễ uy nghiêm tại góc sân chánh điện (`x: 5.6`, `z: -2.8`, `y: 0`).
  - Dựng các cành cây vươn nhẹ nhàng, tán lá bồ đề tim ngọc với ánh hào quang vàng kim ấm áp.
  - Tạo hệ thống hạt bụi sáng / đom đóm thần tiên lơ lửng quanh tán lá bồ đề.
- [x] Xây dựng bộ dựng Dải Lụa Đỏ Ước Nguyện:
  - Tạo texture dải lụa đỏ thêu viền vàng, chữ thư pháp tên Phật tử + lời ước.
  - Geometry dải lụa nhiều đốt uốn lượn tự nhiên theo sóng gió (sin wave physics).
  - Hàm `flyRibbon({ name, wish, tier, fromPos })` tạo hoạt cảnh dải lụa phát sáng bay từ vị trí người lễ lượn sóng lên cành bồ đề.
- [x] Tích hợp `bodhiTree` vào `web/scene/hall.js` hoặc `web/main.js`.

### Task 3: Sacred Wind Chime Audio & Ribbon Sound Effects
- [x] Bổ sung âm thanh phong linh / chuông gió thánh thót trong `web/scene/audio.js` (`audio.windChime()`).
- [x] Kích hoạt âm thanh khi dải lụa vừa chạm và buộc vào cành cây bồ đề.

### Task 4: UI Wish Ribbon Pill & Inspection View
- [x] Cập nhật `web/index.html` và `web/hud.js`:
  - Thêm huy hiệu trang nhã `🌳 Cây Bồ Đề: [N] Dải Lụa` trên HUD.
  - Popup danh sách lời ước gần nhất khi người xem muốn đọc các điều ước tốt lành.
- [x] Cập nhật góc máy chiêm bái Cây Bồ Đề mềm mại qua GSAP camera transition.

### Task 5: Admin Tổng Management & Simulation Controls
- [x] Thêm cụm điều khiển Cây Bồ Đề trong `AdminTong/index.html` và `AdminTong/public/js/admin.js`:
  - Thống kê số dải lụa trên cây bồ đề.
  - Nút "Treo Dải Lụa Ước Nguyện (Mẫu)".
  - Nút "Làm Mới Cây Bồ Đề".
- [x] Cập nhật `server/admin.js` và `api/index.js` hỗ trợ các route `/api/bodhi/wish`, `/api/bodhi/clear`.

### Task 6: End-to-End Verification, Test Suite & Deployment
- [x] Chạy toàn bộ test suite `node --test` đảm bảo 100% pass.
- [x] Khởi động test server, kiểm tra tải trang `/chua`, kiểm tra sự kiện dải lụa bay và đung đưa trên trình duyệt.
- [x] Commit và push lên `master` và `main` để triển khai tự động lên Vercel.
