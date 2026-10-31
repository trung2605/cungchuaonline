# FR-02 · Plan

## File
| File | Trách nhiệm |
|---|---|
| `server/mapTiktok.js` | Hàm thuần: event thô → `NormEvent \| null` |
| `server/dedupe.js` | Bộ chống trùng theo cửa sổ thời gian |

## Interface
```js
// server/mapTiktok.js
export function mapTiktok(name, data, now = Date.now())   // -> NormEvent | null

// server/dedupe.js
export function dedupeKey(e)                               // -> string | null (null = không chống trùng)
export function createDedupe({ windowMs = 5000, now = Date.now } = {})
// -> { seen(e): boolean, size(): number }
//    seen(e) === true nghĩa là trùng, phải BỎ. Lần đầu gặp thì ghi nhận và trả false.
```

## Quyết định kỹ thuật
- **Lưu trữ:** dùng `Map<key, ts>`. Map giữ thứ tự chèn, nên dọn bằng cách duyệt từ đầu và dừng khi gặp khóa còn mới. Khi gặp lại một khóa đã hết hạn, `delete` rồi `set` lại để đẩy nó về cuối.
- **Đọc field an toàn:** `giftName = data.giftName ?? data.giftDetails?.giftName ?? data.extendedGiftInfo?.name ?? ''`.
- **Không dựa vào `msgId`:** connector và TikFinity đánh `msgId` khác nhau, nên khóa phải dựa trên nội dung event.

## Phụ thuộc
- FR-01: adapter gọi `map`.
- Sau khi FR-02 xong, đổi `index.js` sang dùng `mapTiktok` thật.

## Ghi chú version (điền ở T01.1)
Đọc từ `tiktok-live-connector@2.5.0` (`dist/index-*.d.ts`) và `tiktok-live-proto/dist/node/v3.d.ts`, ngày 31/10/2026.

- **Import:** `import { TikTokLiveConnection, WebcastEvent, ControlEvent } from 'tiktok-live-connector'` (ESM).
- **Constructor:** `new TikTokLiveConnection(uniqueId, { signApiKey?, enableExtendedGiftInfo?, processInitialData?, fetchRoomInfoOnConnect? })`. `connect(roomId?)` trả `Promise<state>`, `disconnect()` trả `Promise<void>`.
- **Enum `WebcastEvent`** (giá trị chuỗi): `CHAT='chat'`, `MEMBER='member'`, `GIFT='gift'`, `ROOM_USER='roomUser'`, `LIKE='like'`, `SOCIAL='social'`, `FOLLOW='follow'`, `SHARE='share'`, `STREAM_END='streamEnd'`…
- **Enum `ControlEvent`:** `CONNECTED='connected'`, `DISCONNECTED='disconnected'` (payload `{code, reason?}`), `ERROR='error'`.
- **`User`:** `id: string`, `nickname: string`, `displayId: string` (handle `@uniqueId`). Không có field `uniqueId`/`userId` ở cấp `User` trong proto v3.
- **chat** `WebcastChatMessage`: `user`, `content: string`, `common`.
- **gift** `WebcastGiftMessage`: `giftId: string`, `repeatCount: number`, `repeatEnd: number`, `comboCount`, `groupId`, `user`, `gift?: { id, name, diamondCount, type, combo }`. `extendedGiftInfo` chỉ có khi bật `enableExtendedGiftInfo`.
- **like** `WebcastLikeMessage`: `count: number`, `total: string`, `user`.
- **member** `WebcastMemberMessage`: `user`, `userId: string`, `action`, `memberCount`.
- **roomUser** `WebcastRoomUserSeqMessage`: `total: string`, `totalUser: string`, `popularity: string` (kiểu chuỗi, cần `Number()`).
- **streamEnd:** payload `{ action }`.