# FR-07 · Tasks

## T07.1 Bố cục chỗ ngồi
- [x] Viết `test/web/layout.test.js` cho TC-07.1 đến TC-07.3. Chạy, thấy FAIL.
- [x] Viết `web/scene/layout.js`. Chạy, thấy PASS. Commit.

## T07.2 Máy trạng thái nhân vật và reducer
- [x] Viết `test/web/actorFsm.test.js` cho TC-07.4 đến TC-07.7, và `test/web/reducer.test.js` cho TC-07.8 đến TC-07.10.
- [x] Viết `actorFsm.js` và `reducer.js`. Hai file này là JS thuần, không import `three`. Chạy, thấy PASS. Commit.

## T07.3 Khung trang và chánh điện dựng bằng code
- [x] Viết `web/index.html`:
  - importmap: `three` trỏ tới `/vendor/three/build/three.module.js`, `three/addons/` trỏ tới `/vendor/three/examples/jsm/`;
  - canvas kích thước 1080×1920;
  - các div HUD.
- [x] Viết `main.js` và `hall.js`:
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
- [x] Viết `net.js` (tự kết nối lại mỗi 2 s).
- [x] `main.js` đưa message vào `reducer`, rồi chạy các lệnh vẽ (Cmd).
- [x] Bong bóng: tối đa 12 cái cùng lúc, mờ dần khi hết thời gian.
- [x] Kiểm tra thủ công TC-07.13 và TC-07.14. Commit.

## T07.7 Hiệu ứng và âm thanh
- [x] Viết `fx.js` gồm 6 hiệu ứng. Sprite tạo bằng `CanvasTexture`:
  - cánh hoa: hình elip hồng;
  - sen: cánh hình giọt nước;
  - khói: radial gradient xám;
  - hào quang: vòng vàng;
  - đèn: hộp vàng phát sáng.
- [x] Viết `audio.js`. Âm thanh chỉ phát sau khi `AudioContext` đã resume. LIVE Studio cho tự động phát; với Chrome, có nút "Bật âm thanh" chỉ hiện khi đang test.
- [x] Thêm bloom.
- [x] Kiểm tra thủ công TC-07.15. Commit.

## T07.8 HUD và theme
- [x] Viết `hud.js`: bộ đếm, banner, chân trang, credit.
- [x] Thêm theme `day` và `ram` vào `hall.js`, chuyển mượt trong 2 s.
- [x] Kiểm tra thủ công TC-07.16. Commit.

## T07.9 Hiệu năng
- [ ] Chạy TC-07.17 trên máy chuẩn và ghi kết quả vào `test.md`.
- [ ] Nếu chưa đạt:
  - giảm bóng đổ;
  - giảm số hạt;
  - đặt `MAX_ACTORS=100`;
  - ghi lại quyết định đã chọn.
- [ ] Commit `perf(fr07): ...`.
## T07.10 (v2) Bố cục thảm đỏ, bồ đoàn, chỗ lạy
- [x] Sửa `layout.js` theo plan v2. Viết test TC-07.21 và TC-07.22.
- [x] Sửa `actorFsm.js` và thêm `AltarQueue`. Viết test TC-07.23 đến TC-07.25.
- [x] Dựng thảm đỏ và bồ đoàn trong `hall.js`.
- [x] Commit.

## T07.11 (v2) Model Phật tử áo tràng
- [ ] Tải Quaternius base và animation, kiểm tra license CC0, ghi CREDITS.
- [ ] Làm áo tràng trong Blender, xuất `layman_m.glb` và `layman_f.glb`, tối ưu bằng `gltf-transform`.
- [ ] Gắn vào `actors.js` với 4 skin. Kiểm thử thủ công TC-07.26.
- [ ] Commit.

## T07.12 (v2) HUD: câu đối, tri ân, thẻ người tặng, nhạc
- [x] Làm `hud.js` cho câu đối, bảng tri ân, thẻ người tặng. Làm nhãn lớn và nhãn nhỏ.
- [x] Dùng `music.mp3` trong `audio.js`.
- [ ] Kiểm thử thủ công TC-07.27 và TC-07.28.
- [ ] Commit.
## T07.13 (v2.1) Nhân vật VRoid (thay T07.11)
- [ ] Dựng 4 nhân vật trong VRoid Studio theo plan v2.1, xuất file `.vrm`, ghi CREDITS.
- [x] Cài `@pixiv/three-vrm@3` và thêm mount `/vendor/three-vrm/` vào `server.js` (sửa FR-01).
- [x] Viết `actors.js`: nạp và clone VRM, đặt pose bằng code, gắn nhãn tên.
- [ ] Kiểm thử thủ công TC-07.26 và chạy TC-07.17 (đo hiệu năng). Commit.

## T07.14 (v2.1) Nhạc
- [ ] Tìm 1–2 bản nhạc thiền không lời trên Pixabay Music hoặc Freesound CC0. Lưu link và ảnh chụp license vào `web/assets/audio/LICENSES/`, ghi CREDITS.

## Ghi chú thực hiện (31/10)
- Đã làm theo lựa chọn **placeholder rồi thay**: nhân vật và tượng Phật dựng tạm bằng khối hình học. `actors.js` tự nạp `assets/models/layman_{skin}.vrm`, `hall.js` tự nạp `assets/models/buddha.glb`, `audio.js` tự phát `assets/audio/music.mp3` nếu có file. Còn chờ asset: T07.4, T07.13 (dựng VRoid), T07.14 (nhạc). T07.5 và T07.11 (KayKit, Quaternius) đã bị thay bởi T07.13.
- Mõ và chuông tổng hợp bằng WebAudio, không cần file.
- `net.js` gộp vào `main.js` (6 dòng).
- Rig tạm dùng đúng tên bone humanoid của VRM (rest identity, tay chữ T, nhìn +Z), nên cùng một hàm pose điều khiển cả rig tạm lẫn VRM.
- Nhãn lớn ở bàn thờ là 3 thẻ HUD cố định (`#altar-cards`), không gắn vào nhân vật, nên không chồng nhau và không che tượng.
- `?debug=1` mở `window.stageMsg(msg)` để bắn message tay khi test TC-07.15/16 (chưa có admin FR-09).
- Còn lại: TC-07.11 (LIVE Studio), TC-07.17 (đo 10 phút trên máy chuẩn), TC-07.18, nghe thử âm thanh (TC-07.15, TC-07.28).
