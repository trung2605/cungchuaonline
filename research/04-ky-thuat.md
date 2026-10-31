# Phần 4 · Cách làm kỹ thuật mới nhất

Mọi bản đang chạy đều đi theo cùng một đường ống:

```
TikTok LIVE room → Bắt event (gift/chat/like) → Server nhỏ + hàng đợi → WebSocket
  → Trang web render chánh điện → LIVE Studio / OBS → Phát lên TikTok
```

## Bước 1 · Bắt event: 3 lựa chọn

| Cách | Ưu | Nhược |
|---|---|---|
| **TikFinity** (Events API) | Ít code nhất. Nhận sẵn gift, follow, Superfan. Chạy dạng browser source. | Phụ thuộc bên thứ ba, cần mở app TikFinity song song. |
| **tiktok-live-connector** (Node), **TikTokLive** (Python), GoTikTokLive | Toàn quyền điều khiển. Chỉ cần `@uniqueId` của kênh. Có thông tin quà mở rộng (tên, giá, ảnh). | **Không chính thức.** Cần token ký của Euler Stream. API thay đổi giữa các version. |
| Overlay có sẵn (BetterTok, TokElements, TikPlay) | Có sẵn alert, goal, bảng xếp hạng người tặng. TokElements cho viết widget HTML/JS riêng. | Khó làm cảnh chánh điện riêng, phải theo template. |

### Ghi chú về tiktok-live-connector

- **Phiên bản:** bản mới nhất trên npm là **2.5.0**.
- **Token ký:** lấy từ Euler Stream. Gói miễn phí có giới hạn lượt gọi chung cho cộng đồng. Có API key thì được nâng giới hạn.
- **Event:** từ bản 2.3 dùng Schema v3, thêm hơn 30 loại event.
- **API đổi tên:**
  - Class `WebcastPushConnection` đổi thành `TikTokLiveConnection`.
  - Bản 2.4.0 dùng tham số `signApiKey`. Nhánh ts-rewrite dùng `eulerApiInstance`.
- **Bản port sang ngôn ngữ khác:** TikTokLive (Python, isaackogan), GoTikTokLive, bản PHP, TikTokLiveJava.

## Bước 2 · Render chánh điện

- **2D/2.5D giống video 1:**
  - Ảnh nền chánh điện cố định. Nhân vật dùng sprite sheet với các động tác đi, quỳ, lạy.
  - Viết bằng PixiJS hoặc Phaser. Nhẹ, chạy ổn với vài trăm nhân vật.
- **3D giống Sansa:**
  - Dùng Three.js, model chú tiểu low-poly.
  - Dùng instanced mesh để chịu được hơn 100 nhân vật.
- **Unity hoặc Godot:**
  - Đưa vào stream bằng window capture.
  - Nặng hơn hai cách trên, nhưng hợp nếu muốn nhiều hiệu ứng.

## Bước 3 · Phát lên TikTok

- **TikTok LIVE Studio:** thêm *Link Source*, rồi dán URL trang render vào. Kênh phải đủ điều kiện dùng LIVE Studio.
- **OBS và stream key:** thêm Browser Source. Muốn có stream key thì kênh phải đủ điều kiện, thường lấy qua agency hoặc LIVE Studio.

## Khung code tối thiểu (Node)

```js
// npm i tiktok-live-connector ws   — API đổi theo version, đối chiếu README trước khi chạy
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8787 });          // trang render nối vào ws://localhost:8787
const send = (msg) => wss.clients.forEach(c => c.send(JSON.stringify(msg)));

const live = new TikTokLiveConnection('ten_kenh', {
  enableExtendedGiftInfo: true,
  signApiKey: process.env.EULER_KEY,                       // khóa ký của Euler Stream
});

live.on(WebcastEvent.GIFT, (d) => {
  if (d.giftType === 1 && !d.repeatEnd) return;            // quà combo: chỉ lấy lượt cuối
  send({ type: 'bow', user: d.user.uniqueId, name: d.user.nickname,
         gift: d.giftName, count: d.repeatCount, diamonds: d.diamondCount });
});
live.on(WebcastEvent.CHAT, (d) =>
  send({ type: 'say', user: d.user.uniqueId, text: filter(d.comment) }));  // filter = lọc từ cấm

await live.connect();
```

## Hàng đợi nhân vật

Hàng đợi nên có giới hạn, ví dụ tối đa 150 nhân vật trên màn hình. Khi đầy, nhân vật cũ nhất rời đi trước. Quà lớn được chen lên đầu hàng. Nếu không giới hạn, trang render sẽ bị giật khi nhiều người tặng Hoa hồng cùng lúc.

## Dự phòng

- **Khi thư viện hỏng:** TikTok mà đổi giao thức thì tiktok-live-connector có thể hỏng. Nên chuẩn bị TikFinity làm nguồn event thứ hai.
- **Tài khoản:** không dùng tool bắt đăng nhập tài khoản TikTok. Connector chỉ cần `@uniqueId`.
