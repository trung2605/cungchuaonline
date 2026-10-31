# FR-06 · Plan

## File
| File | Trách nhiệm |
|---|---|
| `server/counters.js` | Rule bộ đếm và banner |

## Interface
```js
// server/counters.js
export function createCounters({ lists, now = Date.now, joinGapMs = 2000, priorityMs = 5000, namoEvery = 1000 } = {})
// -> { handle(e: NormEvent): StageMsg[], state(): Counters }
```
Dùng `isTrigger` và `cleanName` (FR-03), `giftTier` (FR-04).

## Cách nối
- `index.js`:
  - tạo `const counters = createCounters({ lists })`;
  - gọi `createPipeline({ ..., rules: [bow, effects, counters], counters })`.
- Snapshot đọc `counters.state()`.

## Quyết định
- Chỉ giữ hai mốc thời gian, `lastJoinBannerAt` và `priorityUntil`. Không cần hàng đợi banner.
- **Banner mốc niệm (BR-06.5)** đặt `priorityUntil = now + 4000`. Đây là cách đơn giản để banner mốc niệm có cùng ưu tiên với banner dâng lễ.
## Bổ sung v2
- `createCounters` trả thêm `tick(): StageMsg[]` (phát bảng tri ân đang chờ) và `board(): {name, diamonds}[]`.
- Lưu trữ: `donors: Map<uid, {name, diamonds, firstAt}>`. Tính lại top 8 bằng sort; n là số người tặng trong phiên, chỉ vài trăm nên chạy đủ nhanh.
- Câu đối không nằm trong counters. Snapshot lấy từ `lists.couplets` (FR-04). Việc phát `couplets` thuộc FR-09.