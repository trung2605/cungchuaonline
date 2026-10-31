# FR-07 · Tasks

## T07.1 Bố cục chỗ ngồi
- [ ] Viết `test/web/layout.test.js` cho TC-07.1 đến TC-07.3. Chạy, thấy FAIL.
- [ ] Viết `web/scene/layout.js`. Chạy, thấy PASS. Commit.

## T07.2 Máy trạng thái nhân vật và reducer
- [ ] Viết `test/web/actorFsm.test.js` cho TC-07.4 đến TC-07.7, và `test/web/reducer.test.js` cho TC-07.8 đến TC-07.10.
- [ ] Viết `actorFsm.js` và `reducer.js`. Hai file này là JS thuần, không import `three`. Chạy, thấy PASS. Commit.

## T07.3 Khung trang và chánh điện dựng bằng code
- [ ] Viết `web/index.html`:
  - importmap: `three` trỏ tới `/vendor/three/build/three.module.js`, `three/addons/` trỏ tới `/vendor/three/examples/jsm/`;
  - canvas kích thước 1080×1920;
  - các div HUD.
- [ ] Viết `main.js` và `hall.js`:
  - sàn, cột, bàn thờ, vách, xà, đèn lồng;
  - ánh sáng cho theme `night` (một đèn hướng ấm, các đèn điểm ở nến có nhấp nháy bằng noise);
  - camera theo BR-07.1.
  - Lúc này chưa cần texture.
- [ ] Mở trong Chrome và trong LIVE Studio Link Source để kiểm tra WebGL2 (TC-07.11). Commit.

## T07.4 Thu thập asset và CREDITS
- [ ] Tải và đặt vào `web/assets/`. Cập nhật `CREDITS.md` sau từng file.

  | Asset | Nguồn | License | Thư mục |
  |---|---|---|---|
  | Nhân vật | KayKit Character Pack | CC0 | `models/` |
  | Animation | KayKit Character Animations | CC0 | `models/` |
  | Tượng Phật | Sloyd Buddha Sculpture | CC BY 4.0 | `models/` |
  | 3 texture | Poly Haven | CC0 | `textures/` |
  | 1 HDRI 1k | Poly Haven | CC0 | `hdri/` |
  | Font Be Vietnam Pro | Google Fonts | OFL | `fonts/` |
  | Âm thanh: ambient, mõ, chuông | Freesound | CC0 | `audio/` |

- [ ] Kiểm tra license tại trang gốc của từng asset trước khi tải. Đây là yêu cầu bắt buộc theo BR-07.13.
- [ ] Chạy `gltf-transform optimize` cho từng file glb. Ghi dung lượng trước và sau khi tối ưu.
- [ ] Mở file glb của nhân vật, liệt kê tên bone, mesh tóc và mesh mũ. Ghi vào phần đầu của `actors.js`.
- [ ] Commit.

## T07.5 Nhân vật
- [ ] Viết `actors.js`:
  - nạp nhân vật bằng `GLTFLoader`, ẩn mesh tóc và mũ để thành đầu trọc;
  - tạo 4 bộ material theo skin: áo nâu, áo lam, áo vàng nghệ, áo xám;
  - tư thế quỳ và lạy dùng `bowT01` từ `actorFsm`;
  - nhãn tên dùng `CSS2DObject`.
- [ ] Kiểm tra thủ công TC-07.12. Commit.

## T07.6 Kết nối mạng, bong bóng, snapshot
- [ ] Viết `net.js` (tự kết nối lại mỗi 2 s).
- [ ] `main.js` đưa message vào `reducer`, rồi chạy các lệnh vẽ (Cmd).
- [ ] Bong bóng: tối đa 12 cái cùng lúc, mờ dần khi hết thời gian.
- [ ] Kiểm tra thủ công TC-07.13 và TC-07.14. Commit.

## T07.7 Hiệu ứng và âm thanh
- [ ] Viết `fx.js` gồm 6 hiệu ứng. Sprite tạo bằng `CanvasTexture`:
  - cánh hoa: hình elip hồng;
  - sen: cánh hình giọt nước;
  - khói: radial gradient xám;
  - hào quang: vòng vàng;
  - đèn: hộp vàng phát sáng.
- [ ] Viết `audio.js`. Âm thanh chỉ phát sau khi `AudioContext` đã resume. LIVE Studio cho tự động phát; với Chrome, có nút "Bật âm thanh" chỉ hiện khi đang test.
- [ ] Thêm bloom.
- [ ] Kiểm tra thủ công TC-07.15. Commit.

## T07.8 HUD và theme
- [ ] Viết `hud.js`: bộ đếm, banner, chân trang, credit.
- [ ] Thêm theme `day` và `ram` vào `hall.js`, chuyển mượt trong 2 s.
- [ ] Kiểm tra thủ công TC-07.16. Commit.

## T07.9 Hiệu năng
- [ ] Chạy TC-07.17 trên máy chuẩn và ghi kết quả vào `test.md`.
- [ ] Nếu chưa đạt:
  - giảm bóng đổ;
  - giảm số hạt;
  - đặt `MAX_ACTORS=100`;
  - ghi lại quyết định đã chọn.
- [ ] Commit `perf(fr07): ...`.