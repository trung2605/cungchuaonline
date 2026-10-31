# FR-01 · Plan

## Cách tiếp cận
- Tách riêng **transport** (`server.js`), **nguồn event** (`adapters/*`) và **log** (`log.js`). `index.js` nối các phần lại với nhau.
- Server không biết gì về nghiệp vụ. Nó chỉ nhận một hàm `getSnapshot()` và cho phép gọi `broadcast(msgs)`.
- Adapter TikTok nhận `Connection` và `map` qua tham số. Nhờ vậy test có thể dùng `EventEmitter` giả, không cần mạng.

## File
| File | Trách nhiệm |
|---|---|
| `package.json` | `type: module`, `engines.node >=20`. Scripts: `start`, `demo` (`node server/index.js --mock`), `test` (`node --test`, tự tìm `test/**/*.test.js`; dạng `node --test test/` lỗi trên Node 22+) |
| `.gitignore`, `.env.example` | Bỏ qua `node_modules`, `.env`, `logs/`. Mẫu biến: `TIKTOK_USER=`, `EULER_KEY=`, `ADMIN_PASSWORD=`, `MAX_ACTORS=150`, `TIKFINITY_WS=` |
| `server/server.js` | HTTP static + WebSocket |
| `server/log.js` | Ghi JSONL theo ngày |
| `server/adapters/mock.js` | Sinh event giả |
| `server/adapters/tiktok.js` | Bọc `TikTokLiveConnection`, tự kết nối lại |
| `server/pipeline.js` | Stub. FR-04 sẽ thay, giữ nguyên shape |
| `server/index.js` | CLI và nối các phần |

## Interface
```js
// server/server.js
export async function startServer({ port = 8787, host = '127.0.0.1', webRoot = 'web',
  mounts = { '/vendor/three/': 'node_modules/three/' }, getSnapshot })
// -> { port, broadcast(msgs: StageMsg[]): void, close(): Promise<void> }

// server/log.js
export function createLog({ dir = 'logs', now = () => new Date() })
// -> { write(e: NormEvent): void, close(): Promise<void> }

// server/adapters/mock.js
export function startMock(ingest, { rate = 5, rng = Math.random, now = Date.now } = {})   // -> stop()

// server/adapters/tiktok.js
export function backoffMs(n, rand = Math.random)   // min(60000, 2000*2**n) + Math.floor(rand()*1000)
export function startTiktok(user, ingest, { signApiKey, Connection, map, onStatus = () => {}, schedule = setTimeout })
// -> { stop(): void }

// server/pipeline.js (shape cố định; FR-04 cài thật)
export function createPipeline(opts)   // -> { handle(e): StageMsg[], tick(): StageMsg[], snapshot(): SnapshotMsg }
```

## Quyết định kỹ thuật
- **Chung cổng HTTP và WS:** `ws@8` dùng chung server với `node:http` qua `new WebSocketServer({ server })`. Chỉ một cổng nên Link Source chỉ cần một URL.
- **Static handler tự viết**, khoảng 30 dòng, không dùng express. Bảng MIME: `.html .js .mjs .json .png .jpg .webp .glb .gltf .bin .ktx2 .hdr .woff2 .svg .mp3 .ogg`.
- **Chống path traversal:** chạy lần lượt `decodeURIComponent`, `path.normalize`, rồi kiểm tra path vẫn nằm trong root. Không đạt thì trả 404.
- **Kết nối lại:** mỗi lần thử tạo một instance `Connection` mới, vì thư viện không đảm bảo `connect()` lại được trên instance cũ.
- **Kết thúc live:** khi `map` trả `{kind:'end'}`, adapter đặt `ended = true` và không kết nối lại nữa.
- **Log:** `fs.createWriteStream(path, { flags: 'a' })`, đổi sang file mới khi qua ngày. `now` được tiêm vào để test.

## Phụ thuộc
- Thư viện ngoài: `ws@8`, `tiktok-live-connector@2.5.0`, `dotenv@16`, `three@0.170.0` (cài sẵn ở bước này để mount `/vendor/three/`).
- FR-02 cung cấp `mapTiktok`. Trước khi FR-02 xong, test dùng một `map` giả.

## Rủi ro
| Rủi ro | Giảm thiểu |
|---|---|
| Tên event hoặc field trong bản 2.5.0 lệch với README | T01.1 đọc trực tiếp `dist/types` |
| Euler Stream giới hạn lượt gọi | Báo qua `onStatus('disconnected', err)`; backoff tránh gọi dồn |