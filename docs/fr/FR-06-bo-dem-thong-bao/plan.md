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