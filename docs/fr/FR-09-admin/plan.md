# FR-09 · Plan

## File
| File | Trách nhiệm |
|---|---|
| `server/stats.js` | Rule thống kê (trả `[]`), giữ danh sách người gần đây |
| `server/admin.js` | HTTP server admin, Basic Auth, REST |
| `admin/index.html` | HTML, CSS và JS thuần, không framework |

## Interface
```js
// server/stats.js
export function createStats({ lists, now = Date.now, recentMax = 200 })
// -> { handle(e): [],                                  // rule cắm vào pipeline, đặt sau counters
//      noteBow(uid, n), noteFiltered(), setViewersPeak(n),
//      state(sources, counters): Stats, recent(): RecentUser[] }

// server/admin.js
export async function startAdmin({ port = 8788, host = '127.0.0.1', password, ctx })
// ctx = { pipeline, stage, lists, blocked, stats, counters, status, broadcast, saveLists, saveBlocked, demo: { start(rate), stop(), state() } }
// -> { close(): Promise<void> }
```

## Thay đổi ở các FR khác
- **FR-04 `Stage`:** thêm `remove(uid) -> StageMsg[]`, trả `[{t:'leave', id}]` hoặc `[]`.
- **FR-04 `bowRules`:**
  - nhận thêm `stats` (tùy chọn) và gọi `stats?.noteBow(uid, n)` mỗi khi cấp lạy;
  - gọi `stats?.noteFiltered()` khi `cleanBubble` trả `null`.
  - Đây là cách ít xâm lấn nhất: không phải lọc lại comment hai lần.
- **FR-04 `pipeline`:**
  - `setScene(partial)` gộp vào `scene` và trả `[{t:'scene', scene}]`;
  - `snapshot` lấy `scene` hiện tại.
- **FR-01 `index.js`:**
  - tạo `stats`, `status`, `demo`;
  - nếu có `ADMIN_PASSWORD` thì gọi `startAdmin`;
  - khi nhận SIGINT hoặc `end` thì ghi file `stats-*.json`.
- **Viewers peak:** `stats.handle` cập nhật `viewersPeak` khi nhận event `viewers`.

## Quyết định
- **Basic Auth:** so mật khẩu bằng `crypto.timingSafeEqual` (đệm hai buffer cho cùng độ dài).
- **Ghi file:** `blocked.json` ghi theo cách atomic giống `saveLists` (FR-03).
- **Top lời nguyện:** `Map<fold, {text, count}>`. Khi số khóa vượt 5.000 thì xóa nửa khóa có count thấp nhất.
  ```js
  // ponytail: cắt Map theo count khi > 5000 khóa; đủ dùng cho một phiên
  ```
- **Danh sách người gần đây:** một `Map<uid, RecentUser>`. Mỗi lần cập nhật thì `delete` rồi `set` để uid đó nằm cuối Map; khi vượt 200 phần tử thì xóa phần tử đầu tiên.
- **Lọc banner thủ công:** dùng `cleanBubble` với giới hạn 60 ký tự. Muốn vậy, `cleanBubble` của FR-03 cần thêm tham số `max = 40`.
- **UI:**
  - **Bố cục:** 4 tab (Người dùng, Danh sách từ, Thống kê, Cảnh).
  - **Cập nhật:** gọi lại `/api/state` mỗi 2 giây.
  - **Kỹ thuật:** không dùng thư viện. Mọi dữ liệu render bằng `textContent`, không dùng `innerHTML`, để tránh XSS từ tên người dùng.

## Phụ thuộc
- FR-01 đến FR-06.
- FR-10 cung cấp `status.tikfinity`. Nếu chưa có FR-10 thì hiển thị `off`.