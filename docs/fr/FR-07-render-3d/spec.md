# FR-07 · Render chánh điện 3D (Three.js) và asset · Spec

## 1. Mục tiêu
Trang web dựng cảnh chánh điện 3D theo khung dọc 1080×1920. Trang nhận luồng `StageMsg` qua WebSocket và diễn hoạt cho từng nhân vật: đi vào, quỳ, lạy, ngồi, đi ra. Cảnh có bong bóng lời nguyện, hiệu ứng, âm thanh và HUD. Trang này được đưa vào LIVE Studio bằng Link Source (D-04).

## 2. User story
- **US-07.1** Là người xem, tôi thấy chú tiểu mang tên tôi đi từ cổng vào, quỳ xuống trước tượng Phật và lạy.
- **US-07.2** Là người xem, tôi thấy lời nguyện của mình hiện thành bong bóng trên đầu chú tiểu.
- **US-07.3** Là người tặng quà, tôi thấy hiệu ứng (hoa, đèn, chuông, hào quang) ngay tại chú tiểu của tôi.
- **US-07.4** Là chủ kênh, khi tôi reload trang thì mọi nhân vật hiện lại đúng chỗ ngay lập tức.
- **US-07.5** Là chủ kênh, cảnh phải trang nghiêm và đẹp, chạy mượt ≥ 30 fps với 150 nhân vật trên máy phát.

## 3. Quy tắc nghiệp vụ và hiển thị
| Mã | Quy tắc |
|---|---|
| BR-07.1 | **Khung và camera.** Canvas 1080×1920. Camera perspective cố định, đặt ở phía cổng, hơi cao, nhìn về bàn thờ: tượng Phật nằm ở 1/3 trên của khung, các hàng nhân vật ở 2/3 dưới. Camera có thể chao rất nhẹ (biên độ ≤ 1°, chu kỳ ≥ 20 s). |
| BR-07.2 | **Bố cục chỗ ngồi.** Hàng đầu có slot 0–19, chia 2 hàng × 10, sát bàn thờ. Hàng thường có slot 20–149, chia 10 hàng × 13. Vị trí mỗi slot tính bằng hàm thuần `slotPosition(i)`. Hàng sau xa camera hơn nên trông nhỏ hơn, đó là phối cảnh tự nhiên. |
| BR-07.3 | **Vòng đời nhân vật (phía client).** ENTERING: đi từ cổng tới slot trong 2,0 s. KNEELING: 0,5 s. BOWING: mỗi lạy 0,8 s, cúi người rồi đứng thẳng lại. IDLE: ngồi chắp tay, thở nhẹ. LEAVING: đứng dậy và đi ra cổng trong 2,0 s, sau đó biến mất. Message `bow` cộng thêm số lạy vào hàng chờ. Message `leave` chuyển sang LEAVING từ bất kỳ trạng thái nào. Message `move`: MOVING gồm đứng dậy 0,5 s, đi tới slot mới 1,5 s, rồi KNEELING, sau đó lạy tiếp số lạy còn trong hàng chờ. |
| BR-07.4 | **Snapshot.** Xóa toàn bộ cảnh, rồi đặt mọi nhân vật ở trạng thái IDLE ngay tại slot của mình, không chạy animation đi vào. HUD lấy giá trị từ `counters`. |
| BR-07.5 | **Nhãn tên.** Tên luôn hiện trên đầu nhân vật, font hỗ trợ đủ tiếng Việt. Nhân vật tier 2 có nhãn màu vàng và viền. |
| BR-07.6 | **Bong bóng.** Bong bóng hiện trên nhãn tên trong `ms` mili giây rồi mờ dần. Mỗi nhân vật chỉ có một bong bóng; bong bóng mới thay bong bóng cũ. Màn hình có tối đa 12 bong bóng cùng lúc; vượt quá thì bong bóng cũ nhất bị ẩn. |
| BR-07.7 | **Hiệu ứng.** `flower`: cánh hoa rơi quanh nhân vật. `lamp`: một đèn hoa đăng bay lên từ nhân vật. `bell`: phát tiếng chuông kèm sóng ánh sáng lan từ bàn thờ. `halo`: vòng hào quang vàng sau lưng nhân vật trong 5 s. `smoke`: khói nhang dày hơn trong 3 s, tỉ lệ với `power`. `lotus`: mưa cánh sen toàn cảnh trong 6 s. Hiệu ứng nào có `at` mà nhân vật không tồn tại thì đặt ở bàn thờ. |
| BR-07.8 | **HUD.** Góc trên phải hiện `Đã niệm: N`. Một dải banner nằm dưới mép trên. Chân trang cố định: `Gõ "Nam mô A Di Đà Phật" để vào lễ Phật`. Góc dưới có dòng credit nhỏ cho asset có license CC BY. Mọi phần tử HUD phải nằm trong vùng an toàn của FR-08 (BR-08.3: dải dọc 12–70% hoặc mép phải) và không được đè lên vùng camera người dẫn (BR-08.2: khung tròn 300×300 ở góc trên trái). |
| BR-07.9 | **Âm thanh.** Có nhạc nền tụng niệm hoặc ambient chạy lặp ở âm lượng thấp, tiếng mõ mỗi khi có lượt lạy (giới hạn 4 lần/giây), và tiếng chuông cho `bell`. Message `scene.sound = false` tắt toàn bộ âm thanh. |
| BR-07.10 | **Theme.** `night` là mặc định của MVP (đèn nến ấm). Có thêm `day` (sáng, nắng chiếu qua cửa) và `ram` (đèn lồng, trăng tròn, nhiều hoa sen). Đổi theme khi nhận message `scene`, chuyển mượt trong 2 s. |
| BR-07.11 | **Mất kết nối WS.** Thử kết nối lại mỗi 2 s, cảnh vẫn chạy tiếp. Khi nối lại sẽ nhận snapshot mới. |
| BR-07.12 | **Tôn nghiêm.** Tượng Phật không bị cắt khung, không bị nhân vật che, không có hiệu ứng hài hước. Chú tiểu theo phong cách chibi trang nhã. Không dùng hình ảnh người thật hay tăng ni thật. |
| BR-07.13 | **Asset.** Mọi asset phải là CC0, CC BY (có ghi công), tự làm, hoặc do AI tạo kèm quyền sử dụng thương mại. Mỗi file được ghi vào `web/assets/CREDITS.md` gồm: nguồn, tác giả, license, link. |
| BR-07.14 | **Tham số URL.** `?fps=1` hiện bộ đếm FPS. `?bloom=0` tắt bloom. `?quality=low` giảm bóng đổ và số hạt hiệu ứng. |

## 4. Tiêu chí nghiệm thu
- **AC-07.1** Chạy `npm run demo` và mở trang: nhân vật đi vào, quỳ, lạy đúng thời lượng; tên tiếng Việt hiện đủ dấu.
- **AC-07.2** Reload trang khi đang có 100 nhân vật: cả 100 hiện lại ngay ở IDLE, đúng slot.
- **AC-07.3** Mock chạy 50 event/giây trong 10 phút với 150 nhân vật trên máy chuẩn (mục 5): FPS trung bình ≥ 30, p5 ≥ 25.
- **AC-07.4** Đủ 6 loại hiệu ứng, mỗi loại hiện đúng như mô tả ở BR-07.7.
- **AC-07.5** Không nhân vật hay bong bóng nào che tượng Phật trong khung hình.
- **AC-07.6** Tắt server: trang vẫn chạy cảnh. Bật lại server: trong ≤ 3 s trang tự nối lại và nhận snapshot.
- **AC-07.7** `CREDITS.md` liệt kê 100% file trong `web/assets/`.

## 5. Phi chức năng
- **Máy chuẩn:** Windows 10/11, GPU từ GTX 1650 / RX 6500 trở lên, 16 GB RAM, Chrome hoặc CEF bản mới.
- **Dung lượng tải:** tổng asset ≤ 40 MB. Trang tải xong trong ≤ 5 s từ localhost.
- **Bộ nhớ:** chạy 8 giờ không bị rò rỉ (xem FR-08).

## 6. Ngoài phạm vi
- Tương tác click (trang chỉ để xem).
- Giao diện mobile.
- Bản WebGPU.

## 7. Câu hỏi mở
- **Q-07.1 Tượng Phật.** (a) Dùng mẫu Sloyd "Buddha Sculpture" CC BY 4.0, có ghi công. (b) Tạo bằng AI image-to-3D. (c) Dựng thủ công bằng primitive. **Đã chốt 31/10: (a) Sloyd CC BY 4.0, ghi công ở góc màn hình.**
- **Q-07.2 Âm thanh.** Nguồn là CC0 từ Freesound, hoặc tự thu tiếng chuông và mõ. Nhạc tụng kinh có người hát dễ dính bản quyền. **Đã chốt 31/10: ambient, chuông và mõ CC0, không có giọng tụng.**
- **Q-07.3 Âm thanh qua Link Source.** Chưa xác minh được LIVE Studio có thu âm thanh từ Link Source hay không. Nếu không thu, phải thêm nguồn âm thanh desktop trong LIVE Studio (ghi trong runbook FR-08).
## Bổ sung v2 (31/10, D-10, D-11, D-12). Phần này thay các mục tương ứng ở trên.

| Mã | Quy tắc |
|---|---|
| BR-07.15 | **Nhân vật (thay chú tiểu chibi).** Nhân vật là Phật tử tại gia mặc **áo tràng lam**: áo dài tới gần mắt cá, tay rộng, màu lam xám `#7F93AD` hoặc lam nhạt `#9DB0C8`. Tỉ lệ người thật. Có 4 skin: skin 0 và 1 là **nam** (tóc ngắn), skin 2 và 3 là **nữ** (tóc búi). `skin = hash(uid) % 4` (BR-04.10), nên giới tính được gán ngẫu nhiên nhưng cố định theo uid. Không dùng hình tăng ni. |
| BR-07.16 | **Bố cục.** Thảm đỏ chạy dọc chính giữa, từ cổng tới bậc bàn thờ. Bồ đoàn đỏ xếp hai bên thảm theo BR-04.17. Bồ đoàn trống vẫn được vẽ. Trước bàn thờ có **3 chỗ lạy**: trái, giữa, phải. |
| BR-07.17 | **Vòng đời nhân vật v2 (thay BR-07.3).** |
| | ENTERING: đi theo thảm đỏ từ cổng lên chỗ lạy trống, mất 2,5 s. Nếu cả 3 chỗ lạy đều bận thì đứng chờ trên thảm, xếp hàng theo FIFO. |
| | ALTAR_BOW: lạy hết số lạy trong hàng chờ, mỗi lạy 0,8 s. Lúc này hiện **nhãn lớn** gồm tên và "🙏 {intent}". |
| | TO_SEAT: đi tới bồ đoàn của mình, mất 1,5 s. |
| | KNEELING: 0,5 s. |
| | IDLE: quỳ chắp tay. Hiện **nhãn nhỏ** gồm tên, và huy hiệu 💎N nếu `diamonds > 0`. |
| | Khi nhận `bow` có `visit:true`: đứng dậy (0,5 s), quay lại ENTERING bắt đầu từ chỗ đang ngồi (đi lên thảm rồi lên bàn thờ), lạy, rồi về chỗ. |
| | Khi nhận `bow` không có `visit`: lạy ngay tại bồ đoàn. |
| | Khi nhận `move`: đổi bồ đoàn. |
| | Khi nhận `leave`: đứng dậy, đi ra cổng theo thảm. |
| BR-07.18 | **Nhãn lớn.** Hình tròn chứa chữ cái đầu của tên (không tải avatar từ TikTok), tên, và lời cầu. Khu bàn thờ hiện tối đa 3 nhãn lớn cùng lúc, các nhãn **không được chồng lên nhau** (cải thiện so với live mẫu, research/09). |
| BR-07.19 | **Câu đối.** Hai băng đỏ dọc đặt hai bên tượng, chữ vàng viết dọc. Mỗi 10 s đổi sang cặp câu kế tiếp, có hiệu ứng mờ dần 0,8 s. Danh sách lấy từ `couplets` trong snapshot, và cập nhật khi nhận message `couplets`. |
| BR-07.20 | **Bảng tri ân.** Khung ở mép phải, tiêu đề "TRI ÂN", hiện tối đa 8 dòng dạng `tên · 💎N`. Cập nhật khi nhận `board`. |
| BR-07.21 | **Thẻ người tặng gần nhất.** Đặt ở mép phải, phía trên bảng tri ân. Thẻ gồm hình tròn chữ cái đầu, tên, và dòng "{giftName} ×{repeat}". **Không** ghi lời cầu lên thẻ, vì quà không gắn với lời cầu (D-09). Mỗi thẻ hiện 6 s và lấy từ hàng chờ. |
| BR-07.22 | **Hướng dẫn ở chân trang (thay câu chân trang cũ).** Hai dòng: `Gõ "Nam mô A Di Đà Phật" để vào lễ` và `Thêm "cầu bình an / tài lộc / sức khỏe / tình duyên / gia đạo / học hành / công danh" để gửi lời cầu`. Vẫn đặt trong vùng an toàn của FR-08. |
| BR-07.23 | **Nhạc Phật (thay ambient ở BR-07.9).** Phát lặp `audio/music.mp3` là nhạc thiền **không lời**, âm lượng 0,35. File phải có license dùng thương mại; nếu chủ kênh tự cung cấp thì ghi rõ nguồn trong CREDITS. Tiếng mõ và chuông giữ như cũ. `scene.sound = false` tắt toàn bộ âm thanh. |

- **AC-07.8** Một uid mới được spawn: nhân vật đi trên thảm, lạy trước bàn thờ với nhãn lớn có lời cầu, rồi về đúng bồ đoàn của mình và hiện nhãn nhỏ.
- **AC-07.9** 10 nhân vật được spawn cùng lúc: tối đa 3 người ở chỗ lạy, số còn lại xếp hàng trên thảm. Không có nhãn lớn nào chồng lên nhau.
- **AC-07.10** Câu đối đổi mỗi 10 s. Bảng tri ân và thẻ người tặng cập nhật đúng theo message.

### Câu hỏi mở v2
- **Q-07.4 Nguồn model Phật tử áo tràng.** Có 3 phương án:
  - (a) **Quaternius Universal Base Characters / Ultimate Modular Men & Women** (CC0, glTF, có rig). Áo tràng làm thêm trong Blender bằng cách kéo dài vạt áo. Người làm: artist, hoặc chủ kênh tự làm.
  - (b) **VRoid Studio**: tự dựng nhân vật có áo dài, xuất VRM, tải bằng `@pixiv/three-vrm`. Phong cách hơi anime.
  - (c) Thuê ngoài.

  **Đã chốt 31/10: (b) VRoid Studio.**
- **Q-07.5 Nhạc Phật.** Lấy nhạc thiền không lời có license thương mại, hay chủ kênh tự cung cấp? **Đã chốt 31/10: tìm nhạc royalty-free có license thương mại** (Pixabay Music hoặc Freesound CC0), lưu bản chụp trang license vào `web/assets/audio/LICENSES/`.