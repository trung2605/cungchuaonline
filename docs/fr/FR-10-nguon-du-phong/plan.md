# FR-10 · Plan

## File
| File | Trách nhiệm |
|---|---|
| `server/adapters/tikfinity.js` | WebSocket client tới TikFinity, thử lại sau 5 s |
| `server/mapTikfinity.js` | `{event, data}` → `NormEvent` |

## Interface
```js
// server/mapTikfinity.js
export function mapTikfinity(msg /* {event, data} */, now = Date.now())   // -> NormEvent | null
//   Mặc định gọi lại mapTiktok(msg.event, msg.data, now), sau đó đặt src = 'tikfinity'.
//   Nếu T10.1 cho thấy TikFinity dùng tên event khác, ánh xạ tên ở đây.

// server/adapters/tikfinity.js
export function startTikfinity(url, ingest, { WebSocketImpl = WebSocket, map = mapTikfinity,
  onStatus = () => {}, schedule = setTimeout, retryMs = 5000 })   // -> { stop(): void }
```

## Thay đổi ở FR-01
- `index.js` đọc `TIKFINITY_WS`. Nếu có giá trị thì gọi `startTikfinity` song song với `startTiktok`, cả hai dùng chung `ingest`.
- `onStatus(src, state)` ghi trạng thái vào `status = { tiktok, tikfinity }`. FR-09 đọc giá trị này.
- `startTiktok` đổi chữ ký `onStatus` thành `(src, state)`. Cập nhật lại test của FR-01.

## Phụ thuộc
- FR-02: `mapTiktok`, `createDedupe`.
- FR-01: `index.js`.