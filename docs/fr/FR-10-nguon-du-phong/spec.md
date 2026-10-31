# FR-10 · Nguồn dự phòng TikFinity chạy song song · Spec

## 1. Mục tiêu
`tiktok-live-connector` có thể hỏng bất cứ lúc nào TikTok đổi giao thức. FR này chạy **song song** một nguồn thứ hai là TikFinity (D-07). Event từ hai nguồn được gộp qua bộ chống trùng của FR-02. Nếu một nguồn hỏng, nguồn còn lại vẫn giữ phiên live chạy bình thường mà không cần thao tác gì.

## 2. User story
- **US-10.1** Là chủ kênh, khi connector bị lỗi, tôi muốn game vẫn nhận được comment và quà qua TikFinity.
- **US-10.2** Là chủ kênh, khi cả hai nguồn cùng chạy, tôi không muốn một món quà bị tính hai lần.
- **US-10.3** Là vận hành, tôi muốn biết nguồn nào đang kết nối (in ra console, và hiện trên admin ở FR-09).

## 3. Quy tắc nghiệp vụ
| Mã | Quy tắc |
|---|---|
| BR-10.1 | Nếu `.env` có `TIKFINITY_WS` (ví dụ `ws://127.0.0.1:21213/`) thì bật adapter TikFinity, chạy song song với connector. Để trống thì không bật. |
| BR-10.2 | Event TikFinity được map về `NormEvent` với `src:'tikfinity'`, theo đúng quy tắc BR-02.1 đến BR-02.5. |
| BR-10.3 | Hai nguồn đi chung một bộ chống trùng (FR-02). Khóa không chứa `src` nên cùng một event chỉ được tính một lần nếu hai nguồn cùng gửi trong vòng 5 s. |
| BR-10.4 | Mất kết nối TikFinity thì thử lại sau mỗi **5 s**. Không áp dụng backoff mũ vì đây là kết nối trên localhost. |
| BR-10.5 | Mỗi nguồn có trạng thái riêng: `tiktok` và `tikfinity`, mỗi nguồn ở một trong bốn trạng thái `connecting`, `connected`, `disconnected`, `ended`. Mọi thay đổi trạng thái được in ra console và gửi qua `onStatus(src, state)`. |
| BR-10.6 | Không tự động chuyển nguồn và không cần nguồn "chính". Hai nguồn luôn chạy. |
| BR-10.7 | Event `end` từ một nguồn chỉ dừng việc kết nối lại của chính nguồn đó. |

## 4. Tiêu chí nghiệm thu
- **AC-10.1** Payload chat và gift mẫu của TikFinity map ra `NormEvent` có `src:'tikfinity'`, các field giống hệt bản map từ connector cho cùng event đó.
- **AC-10.2** Cùng một gift đến từ hai nguồn, cách nhau 1,5 s: chỉ có một lượt `bow` và một `fx`.
- **AC-10.3** Tắt adapter connector (giả lập lỗi): chat qua TikFinity vẫn tạo nhân vật.
- **AC-10.4** Tắt app TikFinity: server không crash, cứ 5 s thử kết nối lại một lần, connector vẫn chạy.

## 5. Ngoài phạm vi
- Dùng TikFinity để điều khiển game ngược lại (TikFinity actions).
- Nguồn thứ ba.

## 6. Rủi ro và câu hỏi mở
- **Q-10.1** Định dạng WebSocket và cổng của TikFinity cần xác minh khi cài app (T10.1). Giả định hiện tại: TikFinity phát JSON có dạng `{ event, data }`, trong đó `data` giống payload của tiktok-live-connector.
- **R-10.1** Nếu hai nguồn gửi cùng một event lệch nhau hơn 5 s, event đó sẽ bị tính hai lần. Cần đo độ lệch ở T10.3. Nếu lệch nhiều, nâng cửa sổ chống trùng cho riêng gift lên 10 s.