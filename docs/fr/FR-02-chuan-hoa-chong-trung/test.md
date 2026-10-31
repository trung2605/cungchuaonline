# FR-02 · Test

| ID | Loại | Mô tả | Đầu vào | Kỳ vọng | Truy vết |
|---|---|---|---|---|---|
| TC-02.1 | Unit | Chat | `('chat',{user:{uniqueId:'u1',nickname:'Lan'},comment:'nam mo'},1)` | `{kind:'chat',src:'tiktok',uid:'u1',name:'Lan',text:'nam mo',ts:1}` | AC-02.1 |
| TC-02.2 | Unit | Nickname rỗng | `nickname:''` | `name === 'u1'` | BR-02.2 |
| TC-02.3 | Unit | Combo giữa chừng | `giftType:1, repeatEnd:false` | `null` | AC-02.2 |
| TC-02.4 | Unit | Combo kết thúc | `giftType:1, repeatEnd:true, repeatCount:7, diamondCount:1, giftId:5655` | `repeat:7, diamonds:1, giftId:5655` | AC-02.2 |
| TC-02.5 | Unit | Quà không combo | `giftType:2, repeatCount:1, diamondCount:1000` | `repeat:1, diamonds:1000` | BR-02.3 |
| TC-02.6 | Unit | member, roomUser, streamEnd | 3 payload | `join`, `{kind:'viewers',count}`, `{kind:'end'}` | BR-02.1 |
| TC-02.7 | Unit | Event lạ | `('emote',{})` | `null` | BR-02.1 |
| TC-02.8 | Unit | Trùng trong cửa sổ | Cùng chat ở t=0 và t=4000 | `seen` lần lượt: false, true | AC-02.3 |
| TC-02.9 | Unit | Ngoài cửa sổ | t=0 và t=5001 | false, false | AC-02.3 |
| TC-02.10 | Unit | Khác nguồn vẫn tính trùng | gift `src:'tiktok'` ở t=0, `src:'tikfinity'` ở t=300 | false, true | AC-02.4 |
| TC-02.11 | Unit | viewers không chống trùng | 2 event viewers giống nhau ở t=0 | false, false | BR-02.6 |
| TC-02.12 | Unit | Tự dọn bộ nhớ | 10.000 khóa ở t=0, thêm 1 event ở t=6000 | `size() <= 1` | AC-02.5 |