# server/data

| File | Nội dung |
|---|---|
| `badwords.json` | Từ cấm, đã fold kiểu **giữ dấu** (`fold(s, {keepMarks:true})`). |
| `triggers.json` | Câu niệm kích hoạt (BR-03.2), đã fold. |
| `intents.json` | Lời cầu: cụm đã fold → nhãn (BR-03.9). |
| `couplets.json` | Câu đối, ghi từ live mẫu (research/09). |

## Nguồn từ cấm
`badwords.json` lấy từ [blue-eyes-vn/vietnamese-offensive-words](https://github.com/blue-eyes-vn/vietnamese-offensive-words), file `vn_offensive_words.txt`, commit `684b568`, license **MIT** (Copyright © tác giả repo). Đã:
- fold giữ dấu và bỏ trùng;
- bỏ các từ không dấu trùng từ thường khi gõ không dấu (vd. `cac`, `bo me`, `sang`, `di`, `ngu`, `buoi`, mọi cụm `<x> lon`). Bản có dấu (`cặc`, `lồn`, …) vẫn giữ.

Chủ kênh bổ sung qua admin (FR-09).
