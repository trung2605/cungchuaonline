# FR-05 · Hiệu ứng quà và like · Spec

## 1. Mục tiêu
Quà và like làm cảnh chánh điện sống động hơn: hoa, đèn, chuông, hào quang, khói nhang, mưa hoa sen. Hiệu ứng **không** quyết định ai được lạy; phần đó thuộc FR-04. Like (D-02) **chỉ tạo hiệu ứng**, không tạo nhân vật.

## 2. User story
- **US-05.1** Là người tặng quà, tôi muốn thấy món quà của mình hiện thành hiệu ứng ngay cạnh nhân vật của tôi.
- **US-05.2** Là người tặng quà lớn, tôi muốn có tiếng chuông và hào quang thật nổi bật.
- **US-05.3** Là người xem, tôi bấm like thì thấy khói nhang dày lên. Khi cả phòng đạt mốc like thì có mưa hoa sen.

## 3. Quy tắc nghiệp vụ
| Mã | Quy tắc |
|---|---|
| BR-05.1 | **Hiệu ứng theo bậc quà** (bậc tính như FR-04, `power = min(repeat, 10)`, `at = uid`): bậc 0 → `flower`; bậc 1 → `lamp`; bậc 2 → `bell` và `halo` (2 message). |
| BR-05.2 | **Thứ tự:** hiệu ứng quà được phát **sau** message `spawn`/`bow` của FR-04 trong cùng một event, để nhân vật đã có trên màn hình. |
| BR-05.3 | **Like:** cộng dồn `count` của mọi like vào `pendingLikes`. Nếu từ lần phát `smoke` gần nhất đã qua **≥ 500 ms** thì phát `fx smoke` với `power = min(pendingLikes, 20)`, sau đó đặt `pendingLikes = 0`. Trong vòng 500 ms thì chỉ cộng dồn, không phát. |
| BR-05.4 | **Mốc like:** mỗi khi tổng like của phiên vượt một bội số của **1000**, phát `fx lotus` với `power = 10` (mưa hoa sen toàn cảnh). Vượt nhiều mốc trong cùng một event thì chỉ phát 1 lần. |
| BR-05.5 | Hiệu ứng không đi kèm câu chữ nào mời tặng quà (theo ràng buộc chung). |
| BR-05.6 | Uid bị chặn không tạo hiệu ứng. Việc lọc đã làm ở bước đầu pipeline (FR-04). |

## 4. Tiêu chí nghiệm thu
- **AC-05.1** Tặng Rose ×3: message `{t:'fx', kind:'flower', at:uid, power:3}` đứng sau `spawn`/`bow` trong cùng kết quả.
- **AC-05.2** Tặng Galaxy: có cả `bell` và `halo` với `at = uid`.
- **AC-05.3** 10 like trong 300 ms chỉ cho 1 `smoke`. Like tiếp theo sau 500 ms cho `smoke` mới với `power` = số like dồn lại, tối đa 20.
- **AC-05.4** Tổng like đi từ 990 lên 1010 trong một event: đúng 1 `lotus`.
- **AC-05.5** Like không tạo `spawn`.

## 5. Phi chức năng
Mỗi event chạy O(1).

## 6. Ngoài phạm vi
Cách vẽ và âm thanh của từng hiệu ứng thuộc FR-07.

## 7. Câu hỏi mở
- **Q-05.1** Mốc like 1000 dựa theo phòng khoảng 3.000 người xem như video 1. **Mặc định: 1000.** Có thể chỉnh trong FR-09.