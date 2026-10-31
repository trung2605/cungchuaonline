# FR-04 · Plan

## File
| File | Trách nhiệm |
|---|---|
| `server/stage.js` | Lớp `Stage`: actor, slot, tier, TTL, đẩy ra khi đầy |
| `server/bowRules.js` | Luật lạy: lượt miễn phí, chờ 10 phút, quà, bong bóng |
| `server/pipeline.js` | Thay stub của FR-01: chặn uid, chống trùng, chạy chuỗi rules, snapshot, tick |

## Interface
```js
// server/stage.js
export const TTL = { 0: 60_000, 1: 120_000, 2: 300_000 };
export class Stage {
  constructor({ max = 150, front = 20, now = Date.now } = {})
  enter(uid, name, tier, addBows)   // -> StageMsg[]   ('leave' của nạn nhân nếu có, rồi 'spawn', hoặc ['move'] + 'bow')
  say(uid, text, ms = 6000)          // -> StageMsg[]   ([] nếu uid không có nhân vật)
  tick()                             // -> StageMsg[]   ('leave' cho nhân vật hết hạn)
  has(uid)                           // -> boolean
  snapshot()                         // -> Actor[]
}

// server/bowRules.js
export function giftTier(total)      // -> 0 | 1 | 2
export function createBowRules({ stage, lists, now = Date.now, cooldownMs = 600_000 })
// -> { handle(e: NormEvent): StageMsg[] }

// server/pipeline.js
export function createPipeline({ stage, dedupe, blocked = new Set(), rules = [], counters = null,
  scene = { theme: 'night', sound: true } })
// -> { handle(e): StageMsg[], tick(): StageMsg[], snapshot(): SnapshotMsg,
//      setScene(s): StageMsg[], blocked: Set<string> }
//   handle: e.uid nằm trong blocked thì trả [];
//           dedupe.seen(e) thì trả [];
//           còn lại: rules.flatMap(r => r.handle(e))
//   snapshot: { t:'snapshot', actors: stage.snapshot(), counters: counters?.state() ?? {namo:0, viewers:0}, scene }
```

## Thuật toán
- **Chọn slot:**
  - Tier 2 xét các slot `[0, front)` trước, rồi `[front, max)`.
  - Tier 0 và tier 1 chỉ xét `[front, max)`.
  - Lấy slot trống có số nhỏ nhất.
  - Dùng `occupied: (string|null)[]` có độ dài `max`.
- **Chọn nạn nhân khi đầy:** quét tuyến tính các actor có slot nằm trong vùng của người mới và có `a.tier <= tier`, lấy actor có (tier, joinedAt) nhỏ nhất. Gắn comment `// ponytail: O(n) scan, n ≤ 150; dùng heap nếu nâng max lên vài nghìn`.
- **Lên hàng đầu (BR-04.5):** khi tier tăng lên 2, slot hiện tại ≥ front và hàng đầu còn trống: giải phóng slot cũ, gán slot mới, trả `{t:'move', id, slot}`.
- **Hash skin:** FNV-1a 32-bit trên uid, rồi `% 4`.

## Quyết định
- **Actor id = uid.** FR-07 dùng id để tìm mesh. Một uid luôn chỉ có một nhân vật nên không lo trùng.
- **Lưu lượt miễn phí:** `lastFree: Map<uid, ts>` nằm trong `bowRules`, không nằm trong `Stage`, vì đây là luật nghiệp vụ chứ không phải trạng thái hiển thị.
- **Thứ tự rules trong `index.js`:** `[bowRules, effects (FR-05), counterRules (FR-06)]`. Nhân vật phải được spawn trước, hiệu ứng mới có chỗ gắn vào.
- **Số nhân vật tối đa:** `index.js` tạo `new Stage({ max: Number(process.env.MAX_ACTORS || 150) })`. Giảm xuống 100 nếu FR-07 không đạt 30 fps. Hàng đầu luôn giữ 20 chỗ.
- **Danh sách chặn:** `blocked` là một `Set` load từ `server/data/blocked.json`. FR-09 sửa trực tiếp Set này.

## Phụ thuộc
- FR-02: `createDedupe`.
- FR-03: `isTrigger`, `cleanBubble`, `cleanName`, `loadLists`.
- FR-01: `index.js` cần sửa để dùng pipeline thật.