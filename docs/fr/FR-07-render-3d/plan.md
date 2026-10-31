# FR-07 · Plan

## Công nghệ
| Phần | Chọn | Lý do |
|---|---|---|
| Engine | `three@0.170.0`, import qua importmap từ `/vendor/three/` | Đã ghim version, không cần bundler |
| Nhân vật | **KayKit Character Pack** (CC0, glTF) và **KayKit Character Animations** (CC0, có idle và walk). Dự phòng: Quaternius Animated Human (CC0, FBX, cần đổi sang glb) | Low-poly chibi, có sẵn rig và animation, license CC0 |
| Quỳ và lạy | Xoay xương thủ công bằng quaternion slerp trên các bone `hips`, `spine`, `head`, `upperarm`, `lowerleg` (tên thật đọc từ file ở T07.4) | Bộ animation sẵn có không có động tác lạy. Xoay xương thì rẻ, không cần mixer |
| Tượng Phật | Sloyd "Buddha Sculpture" (CC BY 4.0, GLB), vật liệu vàng PBR. Đài sen dựng bằng `LatheGeometry` | Q-07.1 |
| Chánh điện | Dựng bằng code: sàn, 8 cột sơn son, bàn thờ, vách sau có hoa văn, xà mái, đèn lồng, lư hương, nến | Kiểm soát được bố cục, tải nhẹ, không lo license |
| Texture | Poly Haven (CC0): gỗ sàn, gỗ sơn, vữa tường. Thêm 1 HDRI trong nhà, kích thước 1k | CC0 |
| Sprite (hoa, sen, khói, hào quang, đèn) | Vẽ bằng `CanvasTexture` hoặc SVG ngay lúc chạy. Dự phòng: ảnh PNG tạo bằng AI (skill `fal-ai-media`), lưu trong `web/assets/sprites/` | Không phải tải gì, không lo license |
| Chữ | `CSS2DRenderer` (HTML) cho tên và bong bóng. Font **Be Vietnam Pro** (OFL), tự host file woff2 | Hiển thị tiếng Việt đầy đủ, dễ style. 150 nhãn DOM vẫn ổn |
| Hậu kỳ | `EffectComposer`, `RenderPass`, `UnrealBloomPass` (strength 0.6, threshold 0.85). Tắt bằng `?bloom=0` | Nến và hào quang phát sáng |
| Âm thanh | `AudioContext` với 3 buffer: ambient, mõ, chuông (CC0) | Nhẹ |
| Tối ưu glTF | `@gltf-transform/cli` (devDependency): `gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress webp` | Giảm dung lượng |

## File
```
web/index.html            importmap, canvas, các lớp HUD
web/main.js               khởi tạo renderer, scene, ws client, vòng lặp render
web/net.js                ws client: tự kết nối lại sau 2 s, dispatch message
web/scene/layout.js       THUẦN: slotPosition(i), DOOR, ALTAR (test được bằng node)
web/scene/actorFsm.js     THUẦN: máy trạng thái của nhân vật (test được bằng node)
web/scene/reducer.js      THUẦN: applyMsg(state, msg) -> state + danh sách lệnh vẽ
web/scene/hall.js         dựng chánh điện, ánh sáng, theme
web/scene/actors.js       nạp model, clone theo skin, đặt tư thế, gắn nhãn
web/scene/fx.js           pool hạt cho 6 loại hiệu ứng
web/scene/audio.js
web/hud.js                bộ đếm, banner, chân trang, credit
web/assets/models/  textures/  hdri/  audio/  fonts/  sprites/  CREDITS.md
```

## Interface (các module thuần)
```js
// web/scene/layout.js
export const DOOR = { x: 0, z: 14 }, ALTAR = { x: 0, z: -9 };
export function slotPosition(i)    // -> { x, z, rotY }, i trong [0, 150); mọi nhân vật quay mặt về ALTAR
// Hàng đầu: i < 20  -> hàng r = floor(i/10), cột c = i%10; x = (c-4.5)*1.1; z = -6 + r*1.2
// Hàng thường: j = i-20 -> r = floor(j/13), c = j%13; x = (c-6)*1.0; z = -3 + r*1.15

// web/scene/actorFsm.js
export const DUR = { enter: 2000, kneel: 500, bow: 800, leave: 2000 };
export function createActorState(actor, { idle = false, now })   // idle=true dùng khi nhận snapshot
export function step(st, now)   // -> { st, pose: { phase, t01, pos: {x,z}, bowT01 } }
export function addBows(st, n)  // cộng thêm n lạy vào hàng chờ
export function leave(st, now)
export function move(st, slot, now)   // pha 'move': đứng dậy 500 ms + đi 1500 ms -> kneel -> bow (số lạy còn lại)

// web/scene/reducer.js
export function createWorld()
export function applyMsg(world, msg, now)   // -> Cmd[]
//   Cmd = {op:'add'|'remove'|'move'|'say'|'fx'|'hud'|'scene'|'banner'|'reset', ...}
```

## Hiệu năng (150 nhân vật skinned)
- **Clone:** dùng `SkeletonUtils.clone`. Các clone dùng chung geometry, chỉ có 4 bộ material theo skin.
- **Mixer:** chỉ nhân vật ở trạng thái ENTERING hoặc LEAVING mới chạy `AnimationMixer` (clip walk). Các trạng thái còn lại dừng mixer; tư thế được đặt bằng tay qua xoay xương.
- **Bóng đổ:** chỉ 1 đèn đổ bóng (hướng từ bàn thờ), shadow map 1024. Với `?quality=low` thì tắt bóng.
- **Hạt hiệu ứng:** mỗi loại dùng một `THREE.Points` với buffer cố định (tối đa 2000 hạt), tái sử dụng hạt cũ, không tạo mới liên tục.
- **Pixel ratio:** `renderer.setPixelRatio(1)`, kích thước 1080×1920.
- **Đo:** dùng `stats.js` (có trong `three/examples/jsm/libs/stats.module.js`) khi có `?fps=1`.

## Rủi ro
| Rủi ro | Giảm thiểu |
|---|---|
| 150 nhân vật skinned không đạt 30 fps | Đặt `.env MAX_ACTORS=100` (FR-04 nhận qua constructor). V2 bake sẵn animation để dùng instancing |
| Tên bone của KayKit khác dự kiến | T07.4 đọc tên bone thật rồi ghi vào `actors.js` |
| CEF của LIVE Studio không hỗ trợ WebGL2 | Thử sớm ở T07.3 (FR-08). Nếu lỗi, chuyển sang Window Capture một cửa sổ Chrome |
## Bổ sung v2
- **Nhân vật:** thay KayKit bằng Quaternius Universal Base Characters (CC0) và Universal Animation Library (CC0; cần các clip walk, idle, sit/kneel). Áo tràng làm trong Blender: thêm mesh vạt áo dài và tay áo rộng, skin vào bone `hips`, `spine` và các bone chân. Có 2 file glb: `layman_m.glb` và `layman_f.glb`. Mỗi file có 2 material skin.
- **`layout.js` v2:**
  - `ALTAR_SPOTS = [{x:-1.6,z:-6.8},{x:0,z:-6.8},{x:1.6,z:-6.8}]`
  - `CARPET_X = 0`
  - `slotPosition(i)`:
    - `i < 20`: hàng `r = floor(i/10)`, `k = i%10`. Bên trái nếu `k < 5`, ngược lại bên phải. `x = sign·(1.6 + (k%5)·1.1)`, `z = -5 + r·1.2`.
    - `i ≥ 20`: `j = i-20`, hàng `r = floor(j/12)`, `k = j%12`. Bên trái nếu `k < 6`. `x = sign·(1.6 + (k%6)·1.0)`, `z = -2.6 + r·1.1`.
  - `pathTo(slot)`: đường đi qua các điểm cổng → thảm → chỗ lạy → điểm trên thảm ngang hàng với slot → slot.
- **`actorFsm.js` v2:**
  - các pha: `enter`, `queue`, `altar`, `toSeat`, `kneel`, `idle`, `standUp`, `move`, `leave`, `done`;
  - `requestAltar(st)`;
  - lớp `AltarQueue` có 3 chỗ, FIFO, thuần JS.
- **`hud.js`:** thêm `couplets` (dùng `setInterval` 10 s), `board`, `donorCard` (hàng chờ tối đa 5).
- **`audio.js`:** đổi `ambient` thành `music`.
## Bổ sung v2.1 (D-13): nhân vật dựng bằng VRoid. Phần này thay mục "Nhân vật" của v2.
- **Dựng nhân vật.** Dùng **VRoid Studio** để dựng 4 nhân vật Phật tử (2 nam tóc ngắn, 2 nữ tóc búi). Trang phục là áo tràng lam, dựng bằng công cụ áo dài hoặc váy dài rồi chỉnh màu `#7F93AD` / `#9DB0C8`, tay áo rộng.
- **Xuất file VRM.** Mỗi nhân vật xuất một file VRM 1.0 (`web/assets/models/layman_{0..3}.vrm`) với các thiết lập:
  - giảm polygon xuống khoảng 15–20k tri;
  - gộp material;
  - atlas texture 1024;
  - tắt hoặc xóa spring bone ở tóc.

  Cả hai giới hạn dưới đây là để chịu được 150 nhân vật. Mục tiêu mỗi file ≤ 3 MB.
- **License.** Nhân vật tự dựng bằng VRoid thì người dựng giữ quyền và được dùng thương mại. Ghi "tự dựng bằng VRoid Studio" vào CREDITS. Không dùng model tải từ VRoid Hub, trừ khi model đó ghi rõ cho phép dùng thương mại.
- **Nạp và hiển thị.**
  - Thư viện: `@pixiv/three-vrm@3` (ghim version, mount `/vendor/three-vrm/`), nạp bằng `GLTFLoader.register(p => new VRMLoaderPlugin(p))`.
  - Clone: nạp 4 model gốc, rồi clone bằng `SkeletonUtils.clone`.
  - Xoay mặt: VRM 1.0 nhìn về +Z, cần `VRMUtils.rotateVRM0` nếu model là VRM 0.x.
  - Tối ưu: `VRMUtils.removeUnnecessaryVertices` và `combineSkeletons`.
- **Động tác.** Mọi động tác đều làm bằng code, qua `vrm.humanoid.getNormalizedBoneNode(name)`:
  - đi: lắc chân và tay theo sin;
  - quỳ: gập đùi và gối;
  - lạy: cúi `spine`, `chest`, `neck`, đưa tay chắp ra trước;
  - chắp tay: `upperArm`, `lowerArm`, `hand`.

  Không cần file animation nên không phát sinh license. Nếu muốn dáng đi tự nhiên hơn, có thể dùng file `.vrma` có license phù hợp.
- **Hiệu năng.** Chỉ gọi `vrm.update(dt)` cho các nhân vật đang chuyển động. Các nhân vật đang ở pha `idle` chỉ cập nhật thở nhẹ mỗi 3 frame một lần. Vẫn còn rủi ro không đạt 30 fps với 150 nhân vật, khi đó giảm `MAX_ACTORS` (đã ghi ở FR-04).
- **Nhạc.** Tìm trên Pixabay Music (license cho phép dùng thương mại, kể cả livestream) hoặc Freesound CC0, từ khóa "zen meditation instrumental", "buddhist temple ambient". Ghi link và chụp trang license.
## Ghi chú thực hiện (31/10)
- `slotPosition`: hai bên trái/phải **xen kẽ** trong mỗi hàng (`k%2`, cột `floor(k/2)`) thay cho `k<5` / `k<6`. Vẫn đúng BR-04.17 (5|5, 6|6 mỗi hàng), và hàng cuối thiếu (10 chỗ) vẫn chia đều, nên đạt TC-07.22 (75/75). Slot thấp được lấp từ giữa ra.
- `actorFsm.js` thêm pha `bow` (lạy tại bồ đoàn khi nhận `bow` không có `visit`). Nhân vật từ snapshot không lạy lại số lạy còn treo.
- Phụ thuộc mới (ghim): `@pixiv/three-vrm@3.5.5` (mount `/vendor/three-vrm/`), `@fontsource/be-vietnam-pro@5.3.0` (mount `/vendor/font/`).
- Camera: `(0, 12, 21)` nhìn `(0, 1.2, -4)`, fov 50. Khung dọc nên ghế ngoài cùng ở các hàng gần camera bị cắt mép; các hàng này nằm dưới vùng comment TikTok.
