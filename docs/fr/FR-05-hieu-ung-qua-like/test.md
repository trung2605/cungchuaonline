# FR-05 · Test

| ID | Loại | Mô tả | Bước | Kỳ vọng | Truy vết |
|---|---|---|---|---|---|
| TC-05.1 | Unit | Quà bậc 0 | gift Rose (diamonds 1), repeat 3 | `[{t:'fx',kind:'flower',at:uid,power:3}]` | AC-05.1 |
| TC-05.2 | Unit | Quà bậc 1, power tối đa 10 | diamonds 30, repeat 15 | `lamp`, `power:10` | BR-05.1 |
| TC-05.3 | Unit | Quà bậc 2 | diamonds 1000, repeat 1 | `bell` và `halo`, cả hai có `at:uid` | AC-05.2 |
| TC-05.4 | Unit | Gom like trong 500 ms | 10 like (count 1) ở t=0..300 | Đúng 1 `smoke` (ở like đầu tiên) | AC-05.3 |
| TC-05.5 | Unit | Phát phần đã gom | Tiếp TC-05.4, like ở t=600 | `smoke` với `power = min(dồn, 20)` | AC-05.3 |
| TC-05.6 | Unit | Mốc 1000 | Tổng 990, rồi like count 20 | Đúng 1 `lotus` | AC-05.4 |
| TC-05.7 | Unit | Like không tạo nhân vật | Pipeline đủ rules, 1 like | Không có `spawn` | AC-05.5 |
| TC-05.8 | Tích hợp | Thứ tự message | Pipeline đủ rules, gift Rose ×3 từ uid mới | Index của `spawn` nhỏ hơn index của `fx` | BR-05.2 |