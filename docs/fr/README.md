# Chùa Online LIVE: bộ tài liệu theo FR

Mỗi FR có 4 tài liệu:

| File | Nội dung | Người đọc |
|---|---|---|
| `spec.md` | Nghiệp vụ: mục tiêu, user story, quy tắc (BR), tiêu chí nghiệm thu (AC), NFR, ngoài phạm vi | BA, PO, dev, QA |
| `plan.md` | Thiết kế: file, interface, quyết định kỹ thuật, phụ thuộc, rủi ro | Dev |
| `task.md` | Các bước làm theo TDD, có checkbox | Dev |
| `test.md` | Ca kiểm thử (unit, tích hợp, thủ công), ánh xạ sang AC | QA, dev |

Nguồn nghiên cứu: [`research/`](../../research/README.md). Riêng file [`docs/superpowers/plans/2026-10-31-chua-online-live-mvp.md`](../superpowers/plans/2026-10-31-chua-online-live-mvp.md) đã được thay bằng bộ tài liệu này.

## Danh sách FR

| FR | Tên | Giai đoạn | Phụ thuộc |
|---|---|---|---|
| [FR-01](FR-01-nen-tang-va-ket-noi/spec.md) | Nền tảng server và kết nối nguồn TikTok | MVP | — |
| [FR-02](FR-02-chuan-hoa-chong-trung/spec.md) | Chuẩn hóa event và chống trùng | MVP | FR-01 |
| [FR-03](FR-03-loc-noi-dung/spec.md) | Lọc nội dung (tên, bong bóng, câu kích hoạt) | MVP | — |
| [FR-04](FR-04-len-chanh-dien/spec.md) | Lên chánh điện: luật lạy, chỗ ngồi, thời gian ở lại | MVP | FR-02, FR-03 |
| [FR-05](FR-05-hieu-ung-qua-like/spec.md) | Hiệu ứng quà và like | MVP | FR-04 |
| [FR-06](FR-06-bo-dem-thong-bao/spec.md) | Bộ đếm niệm, số người xem, banner | MVP | FR-04 |
| [FR-07](FR-07-render-3d/spec.md) | Render chánh điện 3D (Three.js) và asset | MVP | FR-01, FR-04..06 |
| [FR-08](FR-08-phat-live-van-hanh/spec.md) | Phát live qua LIVE Studio và vận hành | MVP | FR-01..07 |
| [FR-09](FR-09-admin/spec.md) | Admin UI: chặn user, sửa từ, thống kê, điều khiển cảnh | V1 | FR-01..06 |
| [FR-10](FR-10-nguon-du-phong/spec.md) | Nguồn dự phòng TikFinity chạy song song | V1 | FR-01, FR-02 |

**Thứ tự làm:** FR-01 → FR-02 → FR-03 → FR-04 → FR-05 → FR-06 → FR-07 → FR-08. Sau đó làm V1: FR-10 → FR-09.

## Quyết định nghiệp vụ đã chốt (31/10/2026)

| Mã | Quyết định |
|---|---|
| D-01 | Luật lạy **kết hợp có giới hạn**. Comment câu niệm Phật được **1 lượt lạy miễn phí mỗi 10 phút** cho mỗi người. Tặng quà thì **lên lạy ngay**, không tính thời gian chờ. |
| D-02 | **Like không tạo nhân vật**, chỉ tạo hiệu ứng (khói nhang, hoa sen). |
| D-03 | Quà chia 3 bậc theo tổng xu (`diamonds × repeat`): **<10 / 10–999 / ≥1000**. Thời gian ở lại tương ứng **60s / 120s / 300s**. Bậc 2 được quỳ hàng đầu và có banner tên. |
| D-04 | Phát qua **TikTok LIVE Studio, Link Source**. Cảnh **3D bằng Three.js**. |
| D-05 | Asset do team tự làm: nhân vật CC0 (KayKit/Quaternius), chánh điện dựng bằng code, texture CC0 (Poly Haven). Tượng Phật tự dựng, hoặc dùng mẫu CC BY và ghi tên tác giả. Hình 2D tạo bằng AI hoặc SVG. Tất cả ghi trong `web/assets/CREDITS.md`. |
| D-06 | Admin UI (V1) có đủ: chặn/bỏ chặn user, sửa từ cấm và câu kích hoạt, thống kê phiên, điều khiển cảnh. |
| D-07 | Nguồn dự phòng (V1): **chạy song song** connector và TikFinity, gộp qua bộ chống trùng. |
| D-08 | Tài liệu viết tiếng Việt. Code, tên hàm và tên file viết tiếng Anh. |
| D-09 | *(v2, sau khi xem live mẫu, research/09)* **Lời cầu chọn qua comment, miễn phí.** Có **7 lời cầu**: Bình An, Tài Lộc, Sức Khỏe, Tình Duyên, Gia Đạo, Học Hành, Công Danh. Mặc định là **Cầu Bình An**. **Quà không gắn với lời cầu nào.** |
| D-10 | *(v2)* Nhân vật là **Phật tử mặc áo tràng lam, có nam và nữ, tỉ lệ người thật**, thay cho chú tiểu chibi của D-05. Không dùng hình tăng ni. |
| D-11 | *(v2)* Thêm 4 thứ lên màn hình: **câu đối hai bên đổi liên tục** (sửa được trong admin), **bảng tri ân** top 8 người tặng, **thẻ người tặng gần nhất** (mọi quà), và luồng **đi lên bàn thờ lạy rồi về bồ đoàn** trên bố cục thảm đỏ ở giữa, bồ đoàn hai bên. |
| D-13 | *(v2.1)* Model nhân vật dùng **VRoid Studio (VRM)**, tải bằng `@pixiv/three-vrm`. Nhạc Phật lấy từ nguồn **royalty-free có license thương mại** (Pixabay Music hoặc Freesound CC0), ghi trong CREDITS. Bảng xếp hạng đặt tên **"TRI ÂN"**. Bộ đếm niệm **tính theo phiên**. Mưa hoa sen ở mốc **1.000 like**. Admin **chỉ chạy trên localhost**. Từ cấm lấy từ **nguồn mở, bạn bổ sung thêm**. |
| D-12 | *(v2)* Thêm **nhạc Phật không lời** làm nền. File phải có license dùng thương mại hoặc do chủ kênh cung cấp, và **không dùng nhạc có bản quyền thương mại**, vì TikTok sẽ tắt tiếng. Vẫn **bắt buộc có người dẫn** (BR-08.4). |

> Rủi ro chấp nhận ở D-01: quà cho lạy ngay vẫn gần với mẫu "tặng X thì được Y" của guideline TikTok 24/9/2026. Cách giảm rủi ro: lượt miễn phí luôn có, không câu chữ nào trên màn hình mời tặng quà, và người dẫn không nói "tặng để được lạy". Xem research/05.

## Ràng buộc chung (mọi FR đều phải tuân)

- Không bao giờ hỏi hay lưu mật khẩu tài khoản TikTok. Connector chỉ cần `@uniqueId`.
- Secret (`EULER_KEY`, `ADMIN_PASSWORD`) để trong `.env`, không commit lên git. Có file `.env.example`.
- Node ≥ 20, ESM. Test bằng `node:test` + `node:assert/strict`.
- Ghim cứng version phụ thuộc: `tiktok-live-connector@2.5.0`, `ws@8`, `three@0.170.0`, `dotenv@16`.
- Mọi cổng chỉ bind vào `127.0.0.1`: render và WS ở `8787`, admin ở `8788`.
- Không câu chữ nào trên màn hình theo kiểu "tặng … để được phù hộ/giải hạn/lạy". Chân trang cố định: `Gõ "Nam mô A Di Đà Phật" để vào lễ Phật`.
- Khung hình 1080×1920 (dọc), mục tiêu ≥ 30fps.

## Kiểu dữ liệu dùng chung

```ts
type Source = 'tiktok' | 'tikfinity' | 'mock';

type NormEvent =
  | { kind: 'chat';    src: Source; uid: string; name: string; text: string; ts: number }
  | { kind: 'like';    src: Source; uid: string; name: string; count: number; ts: number }
  | { kind: 'gift';    src: Source; uid: string; name: string; giftId: number; giftName: string; diamonds: number; repeat: number; group: string; ts: number }   // group: id lần tặng (groupId), '' nếu không có
  | { kind: 'join';    src: Source; uid: string; name: string; ts: number }
  | { kind: 'viewers'; src: Source; count: number; ts: number }
  | { kind: 'end';     src: Source; ts: number };

type Tier = 0 | 1 | 2;
type Actor = { id: string; name: string; tier: Tier; slot: number; skin: number; bows: number; joinedAt: number; expiresAt: number;
  intent: string;      // v2: 'Cầu Bình An' | 'Cầu Tài Lộc' | 'Cầu Sức Khỏe' | 'Cầu Tình Duyên' | 'Cầu Gia Đạo'
  diamonds: number };  // v2: tổng kim cương uid này đã tặng trong phiên (huy hiệu 💎)

type StageMsg =
  | { t: 'snapshot'; actors: Actor[]; counters: Counters; scene: Scene; board: { name: string; diamonds: number }[]; couplets: [string, string][] }
  | { t: 'spawn';   actor: Actor }
  | { t: 'bow';     id: string; times: number; visit?: boolean }   // v2: visit=true thì nhân vật lên bàn thờ lạy rồi về chỗ
  | { t: 'say';     id: string; text: string; ms: number }
  | { t: 'fx';      kind: 'flower' | 'lamp' | 'bell' | 'halo' | 'smoke' | 'lotus'; at?: string; power: number }
  | { t: 'leave';   id: string }
  | { t: 'move';    id: string; slot: number }          // lên hàng đầu khi tier tăng lên 2 (FR-04)
  | { t: 'counter'; key: 'namo' | 'viewers'; value: number }
  | { t: 'banner';  text: string; ms: number }
  | { t: 'scene';   scene: Scene }
  | { t: 'donor';   uid: string; name: string; giftName: string; repeat: number; diamonds: number }   // v2: thẻ người tặng gần nhất
  | { t: 'board';   top: { name: string; diamonds: number }[] }                                       // v2: bảng tri ân, tối đa 8
  | { t: 'couplets'; pairs: [string, string][] }                                                      // v2: câu đối
  | { t: 'badge';   id: string; diamonds: number };                                                   // v2: huy hiệu 💎

type Counters = { namo: number; viewers: number };
type Scene = { theme: 'day' | 'night' | 'ram'; sound: boolean };
type Lists = { badwords: string[]; triggers: string[];
  intents: Record<string, string>;   // v2: cụm từ đã fold -> nhãn, gồm 7 mục: binh an, tai loc, suc khoe, tinh duyen, gia dao, hoc hanh, cong danh
  couplets: [string, string][] };    // v2: các cặp câu đối   // admin sửa được lúc runtime (FR-09)
```

Module nào sở hữu type nào: `NormEvent` thuộc FR-02, `Actor` thuộc FR-04, `StageMsg` thuộc FR-01 (chỉ phần transport), `Lists` thuộc FR-03, `Scene` thuộc FR-09 (MVP luôn dùng mặc định `{theme:'night', sound:true}`).

## Cấu trúc code đích

```
server/
  index.js            FR-01  CLI, nối các phần với nhau
  server.js           FR-01  HTTP static + WebSocket + snapshot
  log.js              FR-01  ghi JSONL
  adapters/tiktok.js  FR-01  connector + kết nối lại
  adapters/mock.js    FR-01  event giả
  adapters/tikfinity.js FR-10
  mapTiktok.js        FR-02
  mapTikfinity.js     FR-10
  dedupe.js           FR-02
  filter.js           FR-03
  stage.js            FR-04
  bowRules.js         FR-04
  pipeline.js         FR-04 (FR-05, FR-06 cắm thêm vào)
  effects.js          FR-05
  counters.js         FR-06
  stats.js            FR-09
  admin.js            FR-09
  data/badwords.json triggers.json blocked.json
web/
  index.html  main.js  scene/*.js  hud.js  assets/  assets/CREDITS.md   FR-07
admin/index.html                                                        FR-09
docs/runbook.md                                                         FR-08
test/*.test.js
```
