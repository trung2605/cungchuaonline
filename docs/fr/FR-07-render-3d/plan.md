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