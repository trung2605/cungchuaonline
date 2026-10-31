# FR-03 · Plan

## File
| File | Trách nhiệm |
|---|---|
| `server/filter.js` | `fold`, `matchesAny`, `isTrigger`, `cleanBubble`, `cleanName` |
| `server/data/badwords.json` | `string[]` đã fold |
| `server/data/triggers.json` | `string[]` mặc định theo BR-03.2 |
| `server/lists.js` | Load và lưu `Lists` từ/vào `data/*.json` |

## Interface
```js
// server/filter.js
export function fold(s)                         // -> string
export function matchesAny(text, phrases)       // -> boolean (fold cả hai, so có ranh giới từ)
export function isTrigger(text, lists)          // -> boolean
export function cleanBubble(text, lists)        // -> string | null
export function cleanName(name, lists)          // -> string

// server/lists.js
export function loadLists(dir = 'server/data')  // -> Lists { badwords, triggers }
export async function saveLists(lists, dir = 'server/data')  // ghi atomically (file tạm rồi rename)
```

## Thuật toán
```js
// fold
s.normalize('NFC').toLowerCase()
 .normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd')
 .replace(/[\u200B-\u200D\uFEFF\p{Cc}]/gu, '')
 .replace(/(\p{L})\1+/gu, '$1')
 .replace(/\b(\p{L})(?:[._\-\s](\p{L})\b)+/gu, m => m.replace(/[._\-\s]/g, ''))  // nối chữ đơn bị tách
 .replace(/\s+/g, ' ').trim()

// matchesAny: so khớp có ranh giới từ
(' ' + fold(text) + ' ').includes(' ' + fold(p) + ' ')
```

Lưu ý: bước gộp chữ lặp biến "too" thành "to" và "xoong" thành "xong". Điều này chấp nhận được, vì `fold` chỉ dùng để so khớp, không dùng để hiển thị.

## Quyết định kỹ thuật
- **Code point, không phải UTF-16:** cắt độ dài bằng `Array.from(s).slice(0, n).join('')` để không làm vỡ ký tự.
- **Regex số điện thoại:** `/(?:\d[\s.\-]?){8,}/`.
- **Regex mention:** `/(^|\s)@\w/`.
- **Nguồn từ cấm:** dự án `vietnamese-offensive-words` trên GitHub. License chưa rõ, nên chỉ chép danh sách từ (dữ liệu) và ghi nguồn trong `server/data/README.md`.

## Phụ thuộc
- Không phụ thuộc FR nào.
- FR-04 dùng `isTrigger`, `cleanBubble`, `cleanName`.
- FR-09 dùng `saveLists`.

## Rủi ro
| Rủi ro | Giảm thiểu |
|---|---|
| Bỏ sót biến thể từ tục | Chủ kênh tự bổ sung từ qua FR-09 |
| Khớp nhầm câu bình thường | Có test chống khớp nhầm (TC-03.7) |