# FR-04 · Test

Fixture: `let t = 0; const now = () => t;`, `stage = new Stage({ now })`, `lists` lấy từ FR-03.

| ID | Loại | Mô tả | Bước | Kỳ vọng | Truy vết |
|---|---|---|---|---|---|
| TC-04.1 | Unit | Vào lần đầu | `enter('a','A',0,1)` | `[{t:'spawn', actor:{id:'a', tier:0, bows:1, slot:20}}]` | BR-04.7 |
| TC-04.2 | Unit | Mỗi uid một nhân vật, bows tối đa 50 | `enter('a',..,0,1)` ×101 | `snapshot().length===1`, `bows===50` | AC-04.4 |
| TC-04.3 | Unit | TTL theo tier | Vào tier 0 và tier 1 lúc t=0, rồi đặt t=61000 và gọi `tick()` | Chỉ có `leave` của tier 0 | BR-04.6 |
| TC-04.4 | Unit | Làm mới TTL | Tier 1 vào lúc t=0, vào lại lúc t=100000; tick lúc t=200000 | `[]` (hạn mới là 220000) | BR-04.5 |
| TC-04.5 | Unit | Skin ổn định | Hai stage khác nhau cùng `enter('u42')` | Cùng `skin` | BR-04.10 |
| TC-04.6 | Unit | Tier 2 ngồi hàng đầu | `enter('b','B',2,1)` | `slot < 20` | AC-04.3 |
| TC-04.7 | Unit | Đẩy tier thấp, vào sớm nhất | `max:23, front:20`: d(tier 2), o1, o2, o3 (tier 0, vào lần lượt), rồi `new` (tier 0) | Message đầu là `{t:'leave', id:'o1'}`, `d` vẫn còn | AC-04.5 |
| TC-04.8 | Unit | Không đẩy được ai | `max:22, front:20`: hai nhân vật tier 1 ngồi kín hàng thường, rồi `enter('x',..,0,1)` | `[]`, `has('x')===false` | AC-04.6 |
| TC-04.9 | Unit | Lên hàng đầu | 'a' tier 0 ở slot 20, rồi `enter('a',..,2,1)` | `[{t:'move', id:'a', slot:<20}, {t:'bow'...}]`, `snapshot()` có slot mới | AC-04.7 |
| TC-04.10 | Unit | Bậc quà | `giftTier(9)`, `(10)`, `(999)`, `(1000)` | 0, 1, 1, 2 | BR-04.4 |
| TC-04.11 | Unit | Lượt miễn phí | t=0 chat 'nam mô' | Có `spawn` (tier 0, bows 1) và `say` | AC-04.1 |
| TC-04.12 | Unit | Trong 10 phút chờ, còn nhân vật | t=0 chat, t=30000 chat 'nam mô' | Chỉ có `say`, không có `bow`, `expiresAt` không đổi | BR-04.2 |
| TC-04.13 | Unit | Trong 10 phút chờ, không còn nhân vật | t=0 chat, t=61000 tick, t=300000 chat 'nam mô' | `[]` | BR-04.2 |
| TC-04.14 | Unit | Hết 10 phút | t=0 chat, tick sau khi hết hạn, t=600000 chat | Có `spawn` | AC-04.1 |
| TC-04.15 | Unit | Quà không bị chờ 10 phút | t=0 chat, t=1000 gift Rose ×3 (diamonds 1) | `bow` với `times:3` | AC-04.2 |
| TC-04.16 | Unit | Quà lớn và bong bóng xấu | gift Galaxy ×1; chat 'nam mô dm' từ uid mới | Galaxy: `spawn` tier 2, `slot < 20`. Chat: có `spawn` nhưng không có `say` | AC-04.3, BR-04.11 |
| TC-04.17 | Unit | Uid bị chặn | `blocked = {'bad'}`, chat 'nam mô' | `[]` | AC-04.8 |
| TC-04.18 | Unit | Chống trùng trong pipeline | Cùng một chat 2 lần trong 4 s | Lần 2 trả `[]` | FR-02 |
| TC-04.19 | Unit | Snapshot | Sau 2 lần spawn | `{t:'snapshot', actors.length:2, counters, scene}` | FR-01 |
| TC-04.20 | Thủ công | Demo | `npm run demo` + WS client trong 2 phút | Thấy spawn, bow, say, leave; số actor ≤ 150 | Tổng hợp |
## Bổ sung v2
| ID | Loại | Mô tả | Bước | Kỳ vọng | Truy vết |
|---|---|---|---|---|---|
| TC-04.21 | Unit | Lời cầu từ chat | chat 'cầu tài lộc' | `spawn.actor.intent === 'Cầu Tài Lộc'` | AC-04.9 |
| TC-04.22 | Unit | Lời cầu mặc định khi tặng quà | gift từ uid mới | `intent === 'Cầu Bình An'` | BR-04.14 |
| TC-04.23 | Unit | Kim cương giữ qua lần vào lại | Rose ×3, tick hết hạn, Doughnut ×1 | `spawn.actor.diamonds === 33` | AC-04.10 |
| TC-04.24 | Unit | Quà cho người đang ngồi | chat (spawn) rồi gift Rose | `[{t:'bow', times:1, visit:true}, {t:'badge', diamonds:1}, ...]` | AC-04.11 |