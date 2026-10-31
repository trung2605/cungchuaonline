# Phần 8 · Thiết kế kỹ thuật chi tiết

Phần này đi sâu hơn [04-ky-thuat.md](04-ky-thuat.md): kiến trúc, schema event, máy trạng thái nhân vật, render, vận hành và kiểm thử.

---

## 1. Thực tế nền tảng

| Nền tảng | API chính thức cho game LIVE? | Cách làm |
|---|---|---|
| **TikTok** | **Không.** README của Euler Stream và tik.tools đều xác nhận TikTok không công bố API công khai để đọc event LIVE theo thời gian thực. | Dùng thư viện không chính thức: tiktok-live-connector, TikTokLive (Python), SDK của Euler Stream (TS, Python, C#, Java, Go), plugin Unreal của tik.tools |
| **Douyin** | **Có.** 抖音开放平台 cung cấp "直播小玩法". Backend nhận like, quà, comment rồi đẩy qua WebSocket. Có **Unity SDK** với 2 chế độ: 抖音云 API và 指令直推. | Chính thức, có duyệt. Phải có pháp nhân TQ, cần ít nhất 1 dev backend. Có yêu cầu báo ACK khi xử lý xong lệnh. **Nhưng chủ đề lạy Phật bị cấm.** |

Hệ quả cho TikTok:
- Mọi game TikTok LIVE đều dựa trên giao thức nội bộ, nên có thể hỏng bất cứ lúc nào.
- Cần thiết kế lớp "nguồn event" có thể thay thế (adapter) và có nguồn dự phòng.

## 2. Kiến trúc

```
┌──────────────── Máy chủ kênh (PC Windows) ─────────────────────────────┐
│                                                                        │
│  [Event Source Adapter]           [Core Server - Node]                 │
│   ├─ tiktok-live-connector ──┐    ├─ Normalizer   (chuẩn hóa event)    │
│   ├─ TikFinity WS (dự phòng) ├──► ├─ Dedupe       (combo, trùng lặp)   │
│   └─ Mock generator (demo) ──┘    ├─ Rules        (BR-01..10)          │
│                                   ├─ Filter       (từ cấm, độ dài)     │
│                                   ├─ Stage State  (hàng đợi, slot)     │
│                                   ├─ Stats        (đếm, KPI)           │
│                                   └─ WS Server :8787 ─┐                │
│                                                       │                │
│  [Admin UI :8788] ◄── REST/WS ────────────────────────┤                │
│                                                       ▼                │
│  [Render Page] (PixiJS) ◄── ws://localhost:8787  (Browser Source)      │
│        │                                                               │
│        ▼                                                               │
│  TikTok LIVE Studio / OBS  ──► TikTok LIVE                             │
└────────────────────────────────────────────────────────────────────────┘
```

**Nguyên tắc thiết kế:**
- **Server giữ trạng thái, trang render chỉ vẽ.** Nếu trang render reload, nó tải lại snapshot từ server và không mất nhân vật.
- **Một tiến trình Node duy nhất** cho MVP, chưa cần Redis hay DB. Ghi log và thống kê ra file JSONL.
- **Adapter** có cùng một interface `onEvent(normalizedEvent)`, nên đổi nguồn event không phải sửa phần lõi.

## 3. Event: nguồn vào và chuẩn hóa

### 3.1 Event dùng từ tiktok-live-connector

| Event | Dùng để | Lưu ý |
|---|---|---|
| `chat` | Tạo nhân vật (nếu có câu kích hoạt), bong bóng chữ | Qua bộ lọc |
| `like` | Tạo nhân vật lần đầu, thêm khói nhang/hoa | **Phòng đông người thì TikTok không gửi đủ event `like`** (theo README) |
| `gift` | Hiệu ứng theo bậc quà | Combo: chỉ xử lý khi `giftType === 1 && repeatEnd` |
| `member` | Dòng "X vừa vào chùa" | Nhiều, cần gộp và giới hạn tần suất |
| `social` (follow/share) | Hiệu ứng nhỏ | |
| `roomUser` | Số người xem, phục vụ KPI | Chỉ chứa số người xem |
| `subscribe`, `superFan` | Huy hiệu riêng | Event mới, có trong bản 2.x |
| `streamEnd` | Dừng, lưu thống kê | Cũng kích hoạt `disconnected` |
| `disconnected` / `error` | Kết nối lại | Xem mục 7 |

Với `enableExtendedGiftInfo` hoặc `getAvailableGifts()`, thư viện trả về tên, ảnh và giá (kim cương) của toàn bộ quà. Danh sách này dùng để ánh xạ quà sang bậc hiệu ứng.

### 3.2 Schema chuẩn hóa (nội bộ)

```ts
type NormEvent =
  | { kind: 'chat';   uid: string; name: string; avatar?: string; text: string; ts: number }
  | { kind: 'like';   uid: string; name: string; count: number; total?: number; ts: number }
  | { kind: 'gift';   uid: string; name: string; giftId: number; giftName: string;
      diamonds: number; repeat: number; ts: number }
  | { kind: 'join';   uid: string; name: string; ts: number }
  | { kind: 'follow'; uid: string; name: string; ts: number }
  | { kind: 'viewers'; count: number; ts: number };
```

`uid` lấy từ `user.uniqueId`, ổn định trong một phiên. `name` lấy từ `nickname`, đã qua bộ lọc và đã cắt độ dài.

### 3.3 Message gửi xuống trang render

```ts
type StageMsg =
  | { t: 'snapshot'; actors: Actor[]; counters: Counters }
  | { t: 'spawn';  actor: Actor }                          // nhân vật mới
  | { t: 'bow';    id: string; times: number }             // lạy thêm
  | { t: 'say';    id: string; text: string; ms: number }  // bong bóng
  | { t: 'fx';     kind: 'flower'|'lamp'|'bell'|'halo'|'smoke'; at?: string; power: number }
  | { t: 'leave';  id: string }
  | { t: 'counter'; key: 'namo'; value: number }
  | { t: 'banner'; text: string; ms: number };

type Actor = { id: string; name: string; tier: 0|1|2; slot: number; skin: number };
```

## 4. Máy trạng thái của nhân vật

```
 spawn ─► ENTERING (đi từ cổng vào slot, ~2s)
             │
             ▼
          KNEELING (quỳ xuống, ~0.5s)
             │
             ▼
          BOWING ×N  ◄──── 'bow' (chat/gift mới của cùng user: N += k)
             │
             ▼
          IDLE (ngồi chắp tay, đếm TTL; mặc định 60s, tier cao thì lâu hơn)
             │  hết TTL hoặc bị đẩy ra khi đầy slot
             ▼
          LEAVING (đi ra, ~2s) ─► remove
```

- **Server** quyết định ai vào, ai ra (TTL, slot). **Client** chỉ chạy animation theo state.
- **Slot:** chia chánh điện thành lưới, hàng gần tượng dành cho tier 2. Thuật toán: lấy slot trống gần nhất theo tier; nếu đầy thì đẩy ra actor có tier thấp nhất và vào sớm nhất.

```js
// ponytail: quét mảng O(n) mỗi lần spawn; n ≤ 150 nên đủ, đổi sang heap nếu tăng lên vài nghìn
function pickVictim(actors) {
  return actors.reduce((v, a) =>
    !v || a.tier < v.tier || (a.tier === v.tier && a.joinedAt < v.joinedAt) ? a : v, null);
}
```

## 5. Bộ lọc nội dung

Thứ tự xử lý:
1. `normalize`: NFC, chuyển chữ thường, bỏ dấu để so khớp (giữ bản gốc để hiển thị), gộp ký tự lặp (`nguuuu` → `ngu`), bỏ ký tự chèn kiểu `n.g.u`.
2. **Danh sách đen.** Dùng làm nguồn:
   - dự án `vietnamese-offensive-words` (được thư viện CleanTalk/PHP tham khảo);
   - `viet_badwords_filter` (Python), `vn_badwords_filter` (Dart).
   - Các gói này ít người dùng và license chưa rõ, nên chỉ lấy làm nguồn danh sách, tự viết hàm lọc.
3. Chặn link, số điện thoại, @mention: dùng regex.
4. Cắt còn 40 ký tự.
5. Nếu vi phạm thì **không hiện bong bóng**. Nhân vật vẫn lạy nếu comment có câu kích hoạt hợp lệ.
6. Danh sách trắng câu kích hoạt: `nam mo`, `a di da phat`, `nam mo a di da phat`, `quan the am`… (so khớp trên bản đã bỏ dấu).

Moderator có thể thêm từ cấm, chặn uid ngay trong lúc live qua Admin UI. Danh sách lưu ra file JSON.

## 6. Render

### 6.1 Chọn công nghệ

| Lựa chọn | Hợp khi | Ghi chú |
|---|---|---|
| **PixiJS v8** (khuyên dùng cho MVP) | Cảnh 2D/2.5D giống video 1 | WebGL, nhẹ, chạy tốt trong Browser Source |
| Phaser | Muốn có sẵn scene, tween, audio | Nặng hơn Pixi một chút |
| Three.js | Muốn 3D giống Sansa | Dùng InstancedMesh khi có nhiều nhân vật |
| Unity / Godot | Muốn nhiều hiệu ứng | Phát qua window capture, nặng hơn |

### 6.2 Hiệu năng với PixiJS

- **Atlas:** gom mọi sprite nhân vật vào **1 atlas** để batch. Batcher chỉ gộp các sprite *liên tiếp* dùng chung texture và blend mode, nên thứ tự sprite ảnh hưởng tới hiệu năng.
- **Hạt (nhang, hoa, tia sáng):** dùng **ParticleContainer**.
  - Mọi particle phải chung một texture source, và phải tự đặt `boundsArea`.
  - Chỉ khai báo `dynamicProperties` nào thật sự thay đổi.
  - Benchmark của PixiJS v8 trên M3: khoảng 1 triệu particle ở 60fps, so với khoảng 200 nghìn sprite thường.
- **Tên và bong bóng:** dùng **BitmapText** thay cho Text, vì Text tạo texture mới mỗi lần đổi chữ.
  - Font bitmap phải có đủ ký tự tiếng Việt có dấu.
  - Tên user có emoji hoặc ký tự lạ thì thay bằng `?` hoặc bỏ.
- **Pool object:** tạo sẵn nhân vật và bong bóng, chỉ bật/tắt `visible`, không tạo rồi hủy liên tục.
- **Tắt tương tác:** trang render không cần click, nên đặt `eventMode = 'none'`.

### 6.3 Trong OBS / LIVE Studio

- Bật hardware acceleration cho Browser Source, vì WebGL cần GPU. Từ OBS 22 browser source mới được tăng tốc phần cứng.
- Kích thước 1080×1920 (dọc) ở 30fps là đủ cho TikTok.
- Chạy liên tục nhiều giờ có thể làm CPU tăng dần. Cần test chạy lâu (soak test) 6–8 giờ và theo dõi bộ nhớ của trang. Chưa có benchmark chính thức cho trường hợp này.

## 7. Độ ổn định kết nối

| Tình huống | Xử lý |
|---|---|
| Mất kết nối (`disconnected`) | Kết nối lại theo backoff mũ: 2s → 4s → … tối đa 60s, có jitter |
| Lỗi ký hoặc rate limit của Euler Stream | Ghi log, chuyển sang nguồn TikFinity nếu đã cấu hình, báo trên Admin UI |
| `streamEnd` | Dừng kết nối lại, lưu thống kê phiên |
| Thư viện hỏng sau khi TikTok cập nhật | Ghim version trong `package.json`, theo dõi Releases. Có sẵn chế độ demo để giữ phiên live bằng tương tác thủ công. |
| Event trùng (khi kết nối lại) | Bỏ trùng theo `msgId` nếu có, hoặc theo `uid+kind+ts` trong cửa sổ 5s |

Ghi chú về Euler Stream:
- Gói miễn phí có giới hạn lượt gọi, có API key thì được nâng giới hạn.
- Gói trả phí theo tik.tools liệt kê: trên 250 nghìn request/ngày, trên 1.500 cloud WebSocket. Giới hạn có thể đổi mà không báo trước.
- Có thể tự dựng sign server, nhưng ja3 fingerprint phải khớp phiên bản hiện tại.

## 8. Bảo mật và vận hành

- **Không bao giờ** đăng nhập tài khoản TikTok vào tool. Connector chỉ cần `@uniqueId`.
- **API key:** `EULER_KEY` để trong `.env`, không commit lên git.
- **Admin UI:** chỉ lắng nghe trên `127.0.0.1`, có mật khẩu đơn giản. Không mở cổng ra internet.
- **Log:**
  - Ghi `events-YYYYMMDD.jsonl` (đã chuẩn hóa, không có avatar URL) và `stats-YYYYMMDD.json`.
  - Không lưu dữ liệu cá nhân quá mức cần cho thống kê phiên.

## 9. Kiểm thử

| Loại | Cách làm |
|---|---|
| Unit | Bộ lọc (bảng câu vào/ra), quy tắc slot/TTL, xử lý combo `repeatEnd` |
| Mock event | Bộ phát event giả: tốc độ chat/like/gift chỉnh được; kịch bản "mưa hoa hồng" 50 quà/giây; kịch bản 1.000 user khác nhau |
| Tải render | Ép 150 nhân vật cùng 500 particle, đo FPS trong OBS. Mục tiêu ≥ 30fps ổn định. |
| Soak | Chạy mock 8 giờ, theo dõi RAM của Node và trang render |
| Live thử | Phiên riêng tư hoặc kênh phụ, ít người xem |

Ví dụ bộ phát event giả:

```js
// mock.js — phát event giả vào cùng pipeline với adapter thật
const names = ['Minh', 'Lan', 'Hùng', 'Thảo', 'Tuấn'];
const texts = ['nam mô a di đà phật', 'cầu thi tốt', 'bình an', 'nam mo'];
export function startMock(onEvent, rate = 5) {
  return setInterval(() => {
    const uid = 'u' + Math.floor(Math.random() * 1000);
    const name = names[Math.floor(Math.random() * names.length)];
    const r = Math.random();
    if (r < 0.7) onEvent({ kind: 'chat', uid, name, text: texts[Math.floor(Math.random() * texts.length)], ts: Date.now() });
    else if (r < 0.95) onEvent({ kind: 'like', uid, name, count: 5, ts: Date.now() });
    else onEvent({ kind: 'gift', uid, name, giftId: 5655, giftName: 'Rose', diamonds: 1, repeat: 1, ts: Date.now() });
  }, 1000 / rate);
}
```

## 10. Cấu trúc thư mục đề xuất (MVP)

```
server/
  index.js          # khởi động: adapter → pipeline → ws
  adapters/tiktok.js   adapters/mock.js   adapters/tikfinity.js
  pipeline.js       # normalize, dedupe, rules, filter
  stage.js          # slot, TTL, máy trạng thái
  filter.js  badwords.json  triggers.json
web/
  index.html  stage.js   # PixiJS render, nối ws
  assets/atlas.json atlas.png font.fnt
admin/
  index.html        # chặn user, sửa từ cấm, thống kê
.env.example
```

## 11. Tham khảo: Sansa làm thế nào

- Chạy trên web, có bản deploy ở `sansa-online-temple.vercel.app` (link được chia sẻ trên Threads), tức là host trên **Vercel**.
- Làm bằng vibe coding. Không có báo chí nào công bố stack chi tiết.
- Sansa có hiện diện thời gian thực, nhưng không có chat, nên tải nhẹ hơn nhiều so với có chat.
- Khó khăn chính là **chi phí server** khi lượng truy cập tăng đột biến. Nút ủng hộ "공양미" cũng từng bị nghẽn vì quá tải.
- Bài học nếu làm bản web: chia phòng có giới hạn người (100/phòng), có hàng chờ, và chuẩn bị tự động mở rộng server cùng ngân sách từ trước.
