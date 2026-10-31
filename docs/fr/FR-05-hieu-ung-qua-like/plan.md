# FR-05 · Plan

## File
| File | Trách nhiệm |
|---|---|
| `server/effects.js` | Rule hiệu ứng, cắm vào `rules` của pipeline |

## Interface
```js
// server/effects.js
export function createEffects({ now = Date.now, smokeMs = 500, lotusEvery = 1000 } = {})
// -> { handle(e: NormEvent): StageMsg[], totalLikes(): number }
```
Dùng `giftTier` từ `bowRules.js` (FR-04), không định nghĩa lại.

## Quyết định
- **Không dùng timer riêng.** Like dồn trong vòng 500 ms mà sau đó không có like mới thì phần dồn đó bị bỏ. Chấp nhận được: đây là hiệu ứng trang trí, mất một nhịp không ảnh hưởng nghiệp vụ.
- **Thứ tự rules:** trong `index.js` đặt `[bowRules, effects, counterRules]` để thỏa BR-05.2.

## Phụ thuộc
- FR-04: `giftTier`, `pipeline.rules`.