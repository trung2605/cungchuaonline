# Asset và ghi công (BR-07.13)

Mỗi file trong `web/assets/` phải có một dòng ở đây: nguồn, tác giả, license, link.

## Đang dùng

| Asset | Nguồn | Tác giả | License | Ghi chú |
|---|---|---|---|---|
| Chánh điện, cột, bàn thờ, đèn lồng, bồ đoàn, thảm | Dựng bằng code (`web/scene/hall.js`) | Team | Tự làm | Không có file |
| Tượng Phật tạm | Dựng bằng code (`LatheGeometry`) | Team | Tự làm | Bị thay khi có `models/buddha.glb` |
| Nhân vật tạm (áo tràng lam) | Dựng bằng code (`web/scene/actors.js`) | Team | Tự làm | Bị thay khi có `models/layman_{0..3}.vrm` |
| Sprite hoa, sen, khói, hào quang, đèn | Vẽ bằng `CanvasTexture` lúc chạy | Team | Tự làm | Không có file |
| Tiếng mõ, tiếng chuông | Tổng hợp bằng WebAudio (`web/scene/audio.js`) | Team | Tự làm | Không có file |
| Font Be Vietnam Pro | `@fontsource/be-vietnam-pro@5.3.0` (npm, phục vụ ở `/vendor/font/`) | The Be Vietnam Pro Project Authors, https://github.com/bettergui/BeVietnamPro | SIL OFL 1.1 | Không nằm trong `web/assets/` |
| Thư viện VRM | `@pixiv/three-vrm@3.5.5` (npm) | pixiv Inc. | MIT | Không nằm trong `web/assets/` |

## Chờ chủ kênh bỏ file vào (trang tự nạp nếu có)

| File | Nguồn đã chốt | License cần có | Hiển thị credit |
|---|---|---|---|
| `models/layman_0.vrm`, `layman_1.vrm` (nam), `layman_2.vrm`, `layman_3.vrm` (nữ) | Tự dựng bằng VRoid Studio (Q-07.4) | Người dựng giữ quyền | Không |
| `models/buddha.glb` | Sloyd "Buddha Sculpture" (Q-07.1) | CC BY 4.0 | **Có**: điền dòng credit vào `#credit` trong `index.html` |
| `audio/music.mp3` | Pixabay Music hoặc Freesound CC0 (Q-07.5) | Dùng thương mại, kể cả livestream | Không; lưu ảnh chụp license vào `audio/LICENSES/` |

Khi thêm file: ghi một dòng vào bảng "Đang dùng" và xóa dòng tương ứng ở bảng này.
