// Complete 63-Province Regional Specialty Items Catalog ("Vật Phẩm Đặc Sản 63 Tỉnh Thành Việt Nam")
// Maps each of the 63 provinces (by `code: 1..63` and `biomeId`) and each of the 4 Gift Sub-Tiers:
//   - Sub-tier '1':   1 💎 (Hoa Hồng, TikTok, GG, Trái Tim, Kem, Bình Ước Nguyện) -> Thức uống / Quà vặt đặc sản
//   - Sub-tier '1b':  2–5 💎 (Hoa Sen, Tim Tay, Vịt Vàng, Gấu Trúc) -> Bánh truyền thống / Đặc sản cầm tay
//   - Sub-tier '2':   10–15 💎 (Hoa Rosa, Tim Đôi, Vòng Hữu Nghị, Nón Lá) -> Tô / Đĩa ẩm thực trứ danh (Tô Mì Quảng, Phở, Bún Bò...)
//   - Sub-tier '3':   20+ 💎 (Nước Hoa, Bánh Vòng, Bó Hoa, Hạc Giấy...) -> Mâm cỗ / Đặc sản Hoàng Gia đại tiệc
//
// Each item includes:
//   - `name`: Vietnamese specialty name (e.g. "Bịch Rau Má Đậu Xanh", "Tô Mì Quảng Tôm Thịt")
//   - `shortName`: Compact label for Left HUD Guide card (≤ 18 chars)
//   - `icon`: Emoji icon for 3D overhead label & HUD
//   - `propType`: 3D handheld model archetype ('bag_drink', 'cup_drink', 'coconut', 'noodle_bowl', 'plate_dish', 'banh_mi', 'woven_gift', 'royal_tray')
//   - `color`: Primary 3D mesh hex color
//   - `accent`: Secondary topping / garnish 3D hex color
//   - `actionVerb`: Natural Vietnamese verb for AI MC voiceover ("vừa đi vừa hút", "vừa đi vừa thưởng thức", ...)

export const PROVINCE_SPECIALTIES_63 = {
  // 1. Hà Giang
  1: {
    provinceName: 'Hà Giang',
    1: { name: 'Chén Trà Shan Tuyết Cổ Thụ', shortName: 'Trà Shan Tuyết', icon: '🍵', propType: 'cup_drink', color: 0xd97706, accent: 0xfef08a, actionVerb: 'vừa đi vừa nhâm nhi' },
    '1b': { name: 'Bánh Tam Giác Mạch Nướng', shortName: 'Bánh Tam Giác Mạch', icon: '🥞', propType: 'plate_dish', color: 0xf472b6, accent: 0xfde047, actionVerb: 'vừa đi vừa thưởng thức' },
    2: { name: 'Tô Cháo Ấu Tẩu Nóng Hổi', shortName: 'Tô Cháo Ấu Tẩu', icon: '🥣', propType: 'noodle_bowl', color: 0xfef3c7, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Chảo Thắng Cố & Rượu Ngô Men Lá', shortName: 'Thắng Cố Đồng Văn', icon: '🍲', propType: 'royal_tray', color: 0xb45309, accent: 0xfacc15, actionVerb: 'khao cả đoàn đại tiệc' },
  },
  // 2. Cao Bằng
  2: {
    provinceName: 'Cao Bằng',
    1: { name: 'Thạch Đen Cao Bằng Mát Lạnh', shortName: 'Ly Thạch Đen', icon: '🥤', propType: 'cup_drink', color: 0x1e293b, accent: 0xf8fafc, actionVerb: 'vừa đi vừa hút' },
    '1b': { name: 'Hạt Dẻ Trùng Khánh Rang Bơ', shortName: 'Hạt Dẻ Trùng Khánh', icon: '🌰', propType: 'woven_gift', color: 0x92400e, accent: 0xfbbf24, actionVerb: 'vừa đi vừa nhâm nhi' },
    2: { name: 'Tô Phở Chua Cao Bằng', shortName: 'Tô Phở Chua', icon: '🍜', propType: 'noodle_bowl', color: 0xfde68a, accent: 0xef4444, actionVerb: 'vừa đi vừa ăn' },
    3: { name: 'Mâm Vịt Quay 7 Vị Cao Bằng', shortName: 'Vịt Quay 7 Vị', icon: '🦆', propType: 'royal_tray', color: 0xd97706, accent: 0x22c55e, actionVerb: 'thết đãi cả đoàn' },
  },
  // 3. Bắc Kạn
  3: {
    provinceName: 'Bắc Kạn',
    1: { name: 'Ly Nước Mơ Rừng Bắc Kạn', shortName: 'Nước Mơ Rừng', icon: '🍹', propType: 'cup_drink', color: 0xf59e0b, accent: 0xfef08a, actionVerb: 'vừa đi vừa uống' },
    '1b': { name: 'Bánh Coóc Mò Hồ Ba Bể', shortName: 'Bánh Coóc Mò', icon: '粽', propType: 'woven_gift', color: 0x15803d, accent: 0x86efac, actionVerb: 'vừa đi vừa thưởng thức' },
    2: { name: 'Đĩa Cá Nướng Pác Ngòi Ba Bể', shortName: 'Cá Nướng Ba Bể', icon: '🐟', propType: 'plate_dish', color: 0xd97706, accent: 0x22c55e, actionVerb: 'vừa đi vừa ăn' },
    3: { name: 'Mâm Khâu Nhục &Tôm Chua Ba Bể', shortName: 'Mâm Cỗ Ba Bể', icon: '🍱', propType: 'royal_tray', color: 0xb91c1c, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 4. Lạng Sơn
  4: {
    provinceName: 'Lạng Sơn',
    1: { name: 'Chén Rượu Mẫu Sơn Thơm Nồng', shortName: 'Rượu Mẫu Sơn', icon: '🍶', propType: 'cup_drink', color: 0xf8fafc, accent: 0x38bdf8, actionVerb: 'vừa đi vừa nhấp môi' },
    '1b': { name: 'Bánh Ngải Lạng Sơn Dẻo Thơm', shortName: 'Bánh Ngải Xứ Lạng', icon: '🍡', propType: 'woven_gift', color: 0x166534, accent: 0xfde047, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Tô Phở Chua Xứ Lạng', shortName: 'Tô Phở Chua Lạng Sơn', icon: '🍜', propType: 'noodle_bowl', color: 0xfef08a, accent: 0xdc2626, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Mâm Vịt Quay Mắc Mật & Khâu Nhục', shortName: 'Vịt Quay Mắc Mật', icon: '🦆', propType: 'royal_tray', color: 0xb45309, accent: 0xfacc15, actionVerb: 'mở tiệc khao đoàn' },
  },
  // 5. Tuyên Quang
  5: {
    provinceName: 'Tuyên Quang',
    1: { name: 'Cam Sành Hàm Yên Mọng Nước', shortName: 'Cam Sành Hàm Yên', icon: '🍊', propType: 'cup_drink', color: 0xf97316, accent: 0x22c55e, actionVerb: 'vừa đi vừa uống' },
    '1b': { name: 'Cơm Lamống Tre Na Hang', shortName: 'Cơm Lam Na Hang', icon: '🎋', propType: 'woven_gift', color: 0x15803d, accent: 0xfef3c7, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Tô Bún Vịt Măng Tuyên Quang', shortName: 'Tô Bún Vịt Măng', icon: '🍜', propType: 'noodle_bowl', color: 0xfde68a, accent: 0x16a34a, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Cá Chiên Sông Lô & Thịt Trâu Khô', shortName: 'Đặc Sản Sông Lô', icon: '🐟', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'thết đãi cả đoàn' },
  },
  // 6. Thái Nguyên
  6: {
    provinceName: 'Thái Nguyên',
    1: { name: 'Ấm Trà Tân Cương Đệ Nhất Danh Trà', shortName: 'Trà Tân Cương', icon: '🍵', propType: 'cup_drink', color: 0x16a34a, accent: 0xbbf7d0, actionVerb: 'vừa đi vừa thưởng trà' },
    '1b': { name: 'Bánh Chưng Bờ Đậu Dẻo Thơm', shortName: 'Bánh Chưng Bờ Đậu', icon: '🟩', propType: 'woven_gift', color: 0x15803d, accent: 0xfacc15, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Đĩa Nem Chua Đại Từ Nướng', shortName: 'Nem Chua Đại Từ', icon: '🥩', propType: 'plate_dish', color: 0xef4444, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Mâm Cơm Lam Định Hóa & Tôm Cuốn Thừa Lâm', shortName: 'Mâm Cỗ Trà Việt', icon: '🍱', propType: 'royal_tray', color: 0xd97706, accent: 0xfde047, actionVerb: 'khao cả đoàn' },
  },
  // 7. Lào Cai (Sa Pa)
  7: {
    provinceName: 'Lào Cai',
    1: { name: 'Ly Rượu Táo Mèo Bản Cát Cát', shortName: 'Rượu Táo Mèo', icon: '🍶', propType: 'cup_drink', color: 0xd97706, accent: 0xfde68a, actionVerb: 'vừa đi vừa nhâm nhi' },
    '1b': { name: 'Cơm Lam Nướng & Xiên Thịt Bản Mây', shortName: 'Cơm Lam Sa Pa', icon: '🍢', propType: 'woven_gift', color: 0x92400e, accent: 0xf97316, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Tô Cốn Sủi Sa Pa Nóng Hổi', shortName: 'Tô Cốn Sủi Sa Pa', icon: '🍜', propType: 'noodle_bowl', color: 0xfef3c7, accent: 0xef4444, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Nồi Lẩu Cá Hồi Đỉnh Fansipan', shortName: 'Lẩu Cá Hồi Sa Pa', icon: '🍲', propType: 'royal_tray', color: 0xf97316, accent: 0xfacc15, actionVerb: 'khao cả đoàn giữa mây ngàn' },
  },
  // 8. Yên Bái
  8: {
    provinceName: 'Yên Bái',
    1: { name: 'Chén Trà Shan Tuyết Suối Giàng', shortName: 'Trà Suối Giàng', icon: '🍵', propType: 'cup_drink', color: 0x15803d, accent: 0xd9f99d, actionVerb: 'vừa đi vừa thưởng trà' },
    '1b': { name: 'Xôi Ngũ Sắc Mường Lò & Cốm Tú Lệ', shortName: 'Cốm Xanh Tú Lệ', icon: '🌾', propType: 'woven_gift', color: 0x22c55e, accent: 0xa855f7, actionVerb: 'vừa đi vừa nhâm nhi' },
    2: { name: 'Đĩa Thịt Trâu Gác Bếp Mù Cang Chải', shortName: 'Trâu Gác Bếp', icon: '🥩', propType: 'plate_dish', color: 0x7f1d1d, accent: 0xef4444, actionVerb: 'vừa đi vừa ăn' },
    3: { name: 'Mâm Cỗ Xôi Ngũ Sắc & Gà Đồi Mù Cang Chải', shortName: 'Mâm Cỗ Mường Lò', icon: '🍱', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'mở tiệc khao đoàn' },
  },
  // 9. Lai Châu
  9: {
    provinceName: 'Lai Châu',
    1: { name: 'Chén Rượu Ngô Sùng Phài', shortName: 'Rượu Sùng Phài', icon: '🍶', propType: 'cup_drink', color: 0xfbbf24, accent: 0xfef9c3, actionVerb: 'vừa đi vừa nhấp môi' },
    '1b': { name: 'Xôi Tím Lai Châu Dẻo Thơm', shortName: 'Xôi Tím Lai Châu', icon: '🍚', propType: 'plate_dish', color: 0x9333ea, accent: 0xf3e8ff, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Tô Cá Bống Vùi Tro & Lam Nhọ', shortName: 'Cá Bống Vùi Tro', icon: '🐟', propType: 'noodle_bowl', color: 0x92400e, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Mâm Lợn Cắp Nách Quay Giòn Ô Quy Hồ', shortName: 'Lợn Bản Ô Quy Hồ', icon: '🍖', propType: 'royal_tray', color: 0xb45309, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 10. Điện Biên
  10: {
    provinceName: 'Điện Biên',
    1: { name: 'Chén Rượu Sâu Chít Điện Biên', shortName: 'Rượu Sâu Chít', icon: '🍶', propType: 'cup_drink', color: 0xd97706, accent: 0xfef08a, actionVerb: 'vừa đi vừa uống' },
    '1b': { name: 'Nắm Xôi Nếp Nương Mường Thanh', shortName: 'Xôi Nếp Điện Biên', icon: '🍙', propType: 'woven_gift', color: 0xf8fafc, accent: 0x16a34a, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Đĩa Pa Pỉnh Tộp (Cá Suối Nướng Mắc Khén)', shortName: 'Cá Nướng Pa Pỉnh Tộp', icon: '🐟', propType: 'plate_dish', color: 0xd97706, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Mâm Cỗ Lá Dân Tộc Thái Mường Thanh', shortName: 'Mâm Cỗ Mường Thanh', icon: '🍱', propType: 'royal_tray', color: 0x15803d, accent: 0xfacc15, actionVerb: 'mở tiệc khao đoàn' },
  },
  // 11. Sơn La
  11: {
    provinceName: 'Sơn La',
    1: { name: 'Bình Sữa Tươi Thảo Nguyên Mộc Châu', shortName: 'Sữa Tươi Mộc Châu', icon: '🥛', propType: 'cup_drink', color: 0xf8fafc, accent: 0x38bdf8, actionVerb: 'vừa đi vừa uống mát lành' },
    '1b': { name: 'Giỏ Dâu Tây Chín Đỏ Mộc Châu', shortName: 'Dâu Tây Mộc Châu', icon: '🍓', propType: 'woven_gift', color: 0xdc2626, accent: 0x22c55e, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Đĩa Bê Chao Mộc Châu Nóng Giòn', shortName: 'Đĩa Bê Chao Mộc Châu', icon: '🥩', propType: 'plate_dish', color: 0xd97706, accent: 0xfef08a, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Đại Tiệc Nậm Pịa & Thịt Trâu Gác Bếp Sơn La', shortName: 'Mâm Cỗ Tây Bắc', icon: '🍲', propType: 'royal_tray', color: 0xb91c1c, accent: 0xfacc15, actionVerb: 'thết đãi cả đoàn' },
  },
  // 12. Hòa Bình
  12: {
    provinceName: 'Hòa Bình',
    1: { name: 'Bình Rượu Cần Bản Lác Mai Châu', shortName: 'Rượu Cần Mai Châu', icon: '🏺', propType: 'cup_drink', color: 0x92400e, accent: 0xfacc15, actionVerb: 'vừa đi vừa vít cần rượu' },
    '1b': { name: 'Ống Cơm Lam Mường Động Thơm Dẻo', shortName: 'Cơm Lam Hòa Bình', icon: '🎋', propType: 'woven_gift', color: 0x16a34a, accent: 0xfef3c7, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Đĩa Cá Nướng Sông Đà Thung Nai', shortName: 'Cá Nướng Sông Đà', icon: '🐟', propType: 'plate_dish', color: 0xd97706, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Mâm Cỗ Lá Lợn Mán Bản Lác Mai Châu', shortName: 'Cỗ Lá Mai Châu', icon: '🍱', propType: 'royal_tray', color: 0x15803d, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 13. Phú Thọ
  13: {
    provinceName: 'Phú Thọ',
    1: { name: 'Ly Nước Cọ Xanh Đất Tổ', shortName: 'Trà Cọ Đất Tổ', icon: '🍵', propType: 'cup_drink', color: 0x15803d, accent: 0xbbf7d0, actionVerb: 'vừa đi vừa uống' },
    '1b': { name: 'Hộp Thịt Chua Thanh Sơn Phú Thọ', shortName: 'Thịt Chua Thanh Sơn', icon: '🥓', propType: 'woven_gift', color: 0xef4444, accent: 0xfde68a, actionVerb: 'vừa đi vừa nhâm nhi' },
    2: { name: 'Đĩa Cọ Om Đậm Đà Đất Tổ', shortName: 'Đĩa Cọ Om Phú Thọ', icon: '🍲', propType: 'noodle_bowl', color: 0x78350f, accent: 0x22c55e, actionVerb: 'vừa đi vừa ăn' },
    3: { name: 'Mâm Bánh Chưng Bánh Giầy Dâng Vua Hùng', shortName: 'Mâm Bánh Chưng Vua Hùng', icon: '🟩', propType: 'royal_tray', color: 0x16a34a, accent: 0xfacc15, actionVerb: 'dâng lộc Đất Tổ cho cả đoàn' },
  },
  // 14. Vĩnh Phúc
  14: {
    provinceName: 'Vĩnh Phúc',
    1: { name: 'Ly Sữa Chua Đá Tam Đảo Mát Lạnh', shortName: 'Sữa Chua Tam Đảo', icon: '🥤', propType: 'cup_drink', color: 0xf8fafc, accent: 0x38bdf8, actionVerb: 'vừa đi vừa hút' },
    '1b': { name: 'Bánh Trùng Mật Mía Vĩnh Tường', shortName: 'Bánh Trùng Mật Mía', icon: '🍡', propType: 'plate_dish', color: 0xb45309, accent: 0xfef08a, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Đĩa Ngọn Su Su Tam Đảo Xào Tỏi', shortName: 'Su Su Tam Đảo', icon: '🥬', propType: 'plate_dish', color: 0x22c55e, accent: 0xf8fafc, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Mâm Cá Thính Lập Thạch & Gà Đồi Tam Đảo', shortName: 'Mâm Cỗ Tam Đảo', icon: '🍗', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 15. Quảng Ninh (Vịnh Hạ Long)
  15: {
    provinceName: 'Quảng Ninh',
    1: { name: 'Ly Sữa Chua Trân Châu Hạ Long', shortName: 'Sữa Chua Hạ Long', icon: '🍧', propType: 'cup_drink', color: 0xf8fafc, accent: 0xfef08a, actionVerb: 'vừa đi vừa múc ăn' },
    '1b': { name: 'Đĩa Chả Mực Giã Tay Hạ Long Vàng Ruộm', shortName: 'Chả Mực Hạ Long', icon: '🦑', propType: 'plate_dish', color: 0xf59e0b, accent: 0xfef3c7, actionVerb: 'vừa đi vừa thưởng thức' },
    2: { name: 'Tô Bún Bề Bề Hải Sản Vịnh Hạ Long', shortName: 'Tô Bún Bề Bề', icon: '🍜', propType: 'noodle_bowl', color: 0xef4444, accent: 0xfde047, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Đại Tiệc Tôm Hùm & Cua Hoàng Đế Hạ Long', shortName: 'Mâm Hải Sản Hạ Long', icon: '🦞', propType: 'royal_tray', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'khao đại tiệc hải sản cho cả đoàn' },
  },
  // 16. Hải Phòng
  16: {
    provinceName: 'Hải Phòng',
    1: { name: 'Cốc Dừa Dầm Hải Phòng Mát Lạnh', shortName: 'Cốc Dừa Dầm', icon: '🥥', propType: 'cup_drink', color: 0xf8fafc, accent: 0x22c55e, actionVerb: 'vừa đi vừa hút' },
    '1b': { name: 'Bánh Mì Que Cay Hải Phòng Giòn Rụm', shortName: 'Bánh Mì Que Cay', icon: '🥖', propType: 'banh_mi', color: 0xd97706, accent: 0xef4444, actionVerb: 'vừa đi vừa cắn giòn tan' },
    2: { name: 'Tô Bánh Đa Cua Đồng Hải Phòng Đậm Đà', shortName: 'Tô Bánh Đa Cua', icon: '🦀', propType: 'noodle_bowl', color: 0xb45309, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Nem Cua Bể & Hải Sản Cát Bà', shortName: 'Mâm Nem Cua Bể', icon: '🦀', propType: 'royal_tray', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'mở tiệc Food Tour Hải Phòng' },
  },
  // 17. Bắc Giang
  17: {
    provinceName: 'Bắc Giang',
    1: { name: 'Chùm Vải Thiều Lục Ngạn Đỏ Mọng', shortName: 'Vải Thiều Lục Ngạn', icon: '🍒', propType: 'woven_gift', color: 0xdc2626, accent: 0x16a34a, actionVerb: 'vừa đi vừa bóc ăn' },
    '1b': { name: 'Bánh Đa Kế Nướng Giòn Vừng Đen', shortName: 'Bánh Đa Kế', icon: '🍘', propType: 'plate_dish', color: 0xfde047, accent: 0x1e293b, actionVerb: 'vừa đi vừa nhâm nhi' },
    2: { name: 'Tô Mì Chũ Bắc Giang Nấu Gà Đồi', shortName: 'Tô Mì Chũ Gà Đồi', icon: '🍜', propType: 'noodle_bowl', color: 0xfef3c7, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Gà Đồi Yên Thế & Rượu Làng Vân', shortName: 'Gà Đồi Yên Thế', icon: '🐓', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 18. Bắc Ninh
  18: {
    provinceName: 'Bắc Ninh',
    1: { name: 'Ấm Trà Sen Kinh Bắc Ngát Hương', shortName: 'Trà Sen Kinh Bắc', icon: '🍵', propType: 'cup_drink', color: 0xec4899, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng trà' },
    '1b': { name: 'Cặp Bánh Phu Thê Đình Bảng Kết Duyên', shortName: 'Bánh Phu Thê', icon: '🥮', propType: 'woven_gift', color: 0xf59e0b, accent: 0x16a34a, actionVerb: 'vừa đi vừa thưởng thức' },
    2: { name: 'Đĩa Nem Bùi Ninh Xá Cuốn Lá Sung', shortName: 'Nem Bùi Ninh Xá', icon: '🌯', propType: 'plate_dish', color: 0xd97706, accent: 0x22c55e, actionVerb: 'vừa đi vừa ăn' },
    3: { name: 'Mâm Cỗ Chim Trời & Bánh Khúc Làng Diềm', shortName: 'Mâm Cỗ Quan Họ', icon: '🍱', propType: 'royal_tray', color: 0xb91c1c, accent: 0xfacc15, actionVerb: 'mời liền anh liền chị cả đoàn' },
  },
  // 19. Hải Dương
  19: {
    provinceName: 'Hải Dương',
    1: { name: 'Tách Trà Xanh Nhâm Nhi Bánh Đậu Xanh', shortName: 'Trà & Bánh Đậu Xanh', icon: '🍵', propType: 'cup_drink', color: 0xfacc15, accent: 0x16a34a, actionVerb: 'vừa đi vừa nhâm nhi' },
    '1b': { name: 'Hộp Bánh Đậu Xanh Rồng Vàng Hải Dương', shortName: 'Bánh Đậu Xanh', icon: '🟨', propType: 'woven_gift', color: 0xeab308, accent: 0xdc2626, actionVerb: 'vừa đi vừa thưởng thức' },
    2: { name: 'Tô Bún Cá Rô Đồng Hải Dương', shortName: 'Tô Bún Cá Rô Đồng', icon: '🍜', propType: 'noodle_bowl', color: 0xf59e0b, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Niêu Chả Rươi Tứ Kỳ & Vải Thiều Thanh Hà', shortName: 'Chả Rươi Tứ Kỳ', icon: '🥘', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 20. Hưng Yên
  20: {
    provinceName: 'Hưng Yên',
    1: { name: 'Ly Chè Hạt Sen Long Nhãn Phố Hiến', shortName: 'Chè Sen Long Nhãn', icon: '🥣', propType: 'cup_drink', color: 0xfef3c7, accent: 0xd97706, actionVerb: 'vừa đi vừa múc ăn mát lành' },
    '1b': { name: 'Chùm Nhãn Lồng Hưng Yên Ngọt Lịm', shortName: 'Nhãn Lồng Phố Hiến', icon: '🍈', propType: 'woven_gift', color: 0xca8a04, accent: 0x16a34a, actionVerb: 'vừa đi vừa bóc ăn' },
    2: { name: 'Tô Bún Thang Lươn Phố Hiến', shortName: 'Tô Bún Thang Lươn', icon: '🍜', propType: 'noodle_bowl', color: 0xf59e0b, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Gà Đông Tảo Tiến Vua Hưng Yên', shortName: 'Gà Đông Tảo Tiến Vua', icon: '🐓', propType: 'royal_tray', color: 0xb91c1c, accent: 0xfacc15, actionVerb: 'thết đãi đại tiệc Tiến Vua' },
  },
  // 21. Thủ Đô Hà Nội
  21: {
    provinceName: 'Thủ Đô Hà Nội',
    1: { name: 'Ly Cà Phê Trứng Phố Cổ & Trà Chanh Nhà Thờ', shortName: 'Cà Phê Trứng Hà Nội', icon: '☕', propType: 'cup_drink', color: 0xfde047, accent: 0x78350f, actionVerb: 'vừa đi vừa nhâm nhi' },
    '1b': { name: 'Gói Cốm Làng Vòng Bọc Lá Sen Thơm Ngát', shortName: 'Cốm Làng Vòng', icon: '🌾', propType: 'woven_gift', color: 0x22c55e, accent: 0xfef08a, actionVerb: 'vừa đi vừa thưởng thức' },
    2: { name: 'Tô Phở Bò Gia Truyền Hà Nội Bốc Khói', shortName: 'Tô Phở Bò Hà Nội', icon: '🍜', propType: 'noodle_bowl', color: 0xfef3c7, accent: 0xdc2626, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Bún Chả Hà Nội & Chả Cá Lã Vọng', shortName: 'Mâm Cỗ Phố Cổ', icon: '🥘', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'khao cả đoàn giữa Hồ Gươm' },
  },
  // 22. Hà Nam
  22: {
    provinceName: 'Hà Nam',
    1: { name: 'Nải Chuối Ngự Đại Hoàng Tiến Vua', shortName: 'Chuối Ngự Đại Hoàng', icon: '🍌', propType: 'woven_gift', color: 0xfacc15, accent: 0x16a34a, actionVerb: 'vừa đi vừa ăn' },
    '1b': { name: 'Đĩa Bánh Cuốn Chả Nướng Phủ Lý', shortName: 'Bánh Cuốn Phủ Lý', icon: '🥟', propType: 'plate_dish', color: 0xf8fafc, accent: 0xd97706, actionVerb: 'vừa đi vừa thưởng thức' },
    2: { name: 'Tô Bún Tái Kênh Hà Nam Nóng Hổi', shortName: 'Tô Bún Tái Kênh', icon: '🍜', propType: 'noodle_bowl', color: 0xfde68a, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Niêu Cá Kho Làng Vũ Đại Cổ Truyền', shortName: 'Cá Kho Làng Vũ Đại', icon: '🍲', propType: 'royal_tray', color: 0x78350f, accent: 0xfacc15, actionVerb: 'mở tiệc khao cả đoàn' },
  },
  // 23. Thái Bình
  23: {
    provinceName: 'Thái Bình',
    1: { name: 'Ly Nước Mía Văn Đài Mát Ngọt', shortName: 'Nước Mía Thái Bình', icon: '🥤', propType: 'bag_drink', color: 0xa3e635, accent: 0xfef08a, actionVerb: 'vừa đi vừa hút' },
    '1b': { name: 'Hộp Bánh Cáy Làng Nguyễn Thái Bình', shortName: 'Bánh Cáy Làng Nguyễn', icon: '🥮', propType: 'woven_gift', color: 0xd97706, accent: 0xdc2626, actionVerb: 'vừa đi vừa nhâm nhi' },
    2: { name: 'Tô Canh Cá Quỳnh Côi Thái Bình', shortName: 'Tô Canh Cá Quỳnh Côi', icon: '🍜', propType: 'noodle_bowl', color: 0xf59e0b, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Gỏi Nhệch Diêm Điền & Ổi Bo', shortName: 'Mâm Gỏi Nhệch', icon: '🍱', propType: 'royal_tray', color: 0xb45309, accent: 0xfacc15, actionVerb: 'thết đãi cả đoàn' },
  },
  // 24. Nam Định
  24: {
    provinceName: 'Nam Định',
    1: { name: 'Ly Nước Mơ Chùa Cổ Lễ', shortName: 'Nước Mơ Nam Định', icon: '🍹', propType: 'cup_drink', color: 0xf59e0b, accent: 0xfef08a, actionVerb: 'vừa đi vừa uống' },
    '1b': { name: 'Bánh Xíu Páo Nướng Thơm Lừng & Kẹo Sìu Châu', shortName: 'Bánh Xíu Páo', icon: '🥧', propType: 'woven_gift', color: 0xd97706, accent: 0xfef3c7, actionVerb: 'vừa đi vừa ăn nóng hổi' },
    2: { name: 'Tô Phở Bò Gia Truyền Nam Định', shortName: 'Tô Phở Bò Nam Định', icon: '🍜', propType: 'noodle_bowl', color: 0xfef3c7, accent: 0xdc2626, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Nem Nắm Giao Thủy & Cá Nướng Úp Chậu', shortName: 'Nem Nắm Giao Thủy', icon: '🍱', propType: 'royal_tray', color: 0xb91c1c, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 25. Ninh Bình
  25: {
    provinceName: 'Ninh Bình',
    1: { name: 'Chén Rượu Kim Sơn & Nước Mơ Tràng An', shortName: 'Rượu Kim Sơn', icon: '🍶', propType: 'cup_drink', color: 0xf8fafc, accent: 0xfacc15, actionVerb: 'vừa đi vừa nhâm nhi' },
    '1b': { name: 'Đĩa Cơm Cháy Chà Bông Sốt Dê Ninh Bình', shortName: 'Cơm Cháy Ninh Bình', icon: '🍘', propType: 'plate_dish', color: 0xf59e0b, accent: 0xdc2626, actionVerb: 'vừa đi vừa cắn giòn rụm' },
    2: { name: 'Tô Miến Lươn & Thịt Dê Tái Chanh Hoa Lư', shortName: 'Dê Núi Ninh Bình', icon: '🍲', propType: 'noodle_bowl', color: 0xd97706, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Đại Tiệc Dê Núi 7 Món Cố Đô Hoa Lư', shortName: 'Đại Tiệc Dê 7 Món', icon: '🐐', propType: 'royal_tray', color: 0xb45309, accent: 0xfacc15, actionVerb: 'mở tiệc Cố Đô khao đoàn' },
  },
  // 26. Thanh Hóa (User highlighted example: Bịch Rau Má!)
  26: {
    provinceName: 'Thanh Hóa',
    1: { name: 'Bịch Nước Rau Má Đậu Xanh Thanh Hóa Mát Lạnh', shortName: 'Bịch Rau Má', icon: '🥬', propType: 'bag_drink', color: 0x22c55e, accent: 0xfef08a, actionVerb: 'vừa đi vừa hút rột rột' },
    '1b': { name: 'Chục Nem Chua Thanh Hóa Lá Đinh Lăng', shortName: 'Nem Chua Thanh Hóa', icon: '🌿', propType: 'woven_gift', color: 0x16a34a, accent: 0xf43f5e, actionVerb: 'vừa đi vừa bóc ăn' },
    2: { name: 'Đĩa Bánh Cuốn Tôm Chả Nóng & Chả Tôm Sầm Sơn', shortName: 'Chả Tôm Thanh Hóa', icon: '🦐', propType: 'plate_dish', color: 0xf97316, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Mâm Cỗ Bánh Gai Tứ Trụ & Vịt Cổ Lũng Quay', shortName: 'Mâm Cỗ Xứ Thanh', icon: '🦆', propType: 'royal_tray', color: 0xb45309, accent: 0xfacc15, actionVerb: 'khao cả đoàn Xứ Thanh' },
  },
  // 27. Nghệ An
  27: {
    provinceName: 'Nghệ An',
    1: { name: 'Bát Nước Chè Xanh Xứ Nghệ Đậm Đà', shortName: 'Chè Xanh Xứ Nghệ', icon: '🍵', propType: 'cup_drink', color: 0x16a34a, accent: 0xbbf7d0, actionVerb: 'vừa đi vừa uống' },
    '1b': { name: 'Đĩa Bánh Mướt Nóng & Nhút Thanh Chương', shortName: 'Bánh Mướt Xứ Nghệ', icon: '🥟', propType: 'plate_dish', color: 0xf8fafc, accent: 0xd97706, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Tô Súp Lươn Cay Nồng Nghệ An Kèm Bánh Mì', shortName: 'Tô Súp Lươn Nghệ An', icon: '🍜', propType: 'noodle_bowl', color: 0xea580c, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Mực Nháy Cửa Lò & Giò Bê Nam Đàn', shortName: 'Mực Nháy & Giò Bê', icon: '🦑', propType: 'royal_tray', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'thết đãi cả đoàn' },
  },
  // 28. Hà Tĩnh
  28: {
    provinceName: 'Hà Tĩnh',
    1: { name: 'Quả Bưởi Phúc Trạch Ngọt Thanh Mọng Nước', shortName: 'Bưởi Phúc Trạch', icon: '🍈', propType: 'woven_gift', color: 0x84cc16, accent: 0xfda4af, actionVerb: 'vừa đi vừa thưởng thức' },
    '1b': { name: 'Thanh Kẹo Cu Đơ Hà Tĩnh Giòn Tan Kèm Nước Chè', shortName: 'Kẹo Cu Đơ Hà Tĩnh', icon: '🍘', propType: 'plate_dish', color: 0x92400e, accent: 0xfef08a, actionVerb: 'vừa đi vừa nhâm nhi' },
    2: { name: 'Đĩa Ram Bánh Mướt Hà Tĩnh Giòn Rụm', shortName: 'Ram Bánh Mướt', icon: '🌯', propType: 'plate_dish', color: 0xd97706, accent: 0x22c55e, actionVerb: 'vừa đi vừa ăn' },
    3: { name: 'Mâm Mực Nhảy Vũng Áng & Gỏi Cá Đục Thiên Cầm', shortName: 'Mực Nhảy Vũng Áng', icon: '🦑', propType: 'royal_tray', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 29. Quảng Bình
  29: {
    provinceName: 'Quảng Bình',
    1: { name: 'Bịch Nước Mát Sâm Bố Chính Quảng Bình', shortName: 'Nước Sâm Bố Chính', icon: '🥤', propType: 'bag_drink', color: 0xf59e0b, accent: 0xfef08a, actionVerb: 'vừa đi vừa hút' },
    '1b': { name: 'Đĩa Bánh Bột Lọc Lá Chuối Đồng Hới', shortName: 'Bánh Lọc Quảng Bình', icon: '🥟', propType: 'plate_dish', color: 0x16a34a, accent: 0xef4444, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Tô Cháo Canh Cá Lóc Quảng Bình Nóng Hổi', shortName: 'Tô Cháo Canh Cá Lóc', icon: '🍜', propType: 'noodle_bowl', color: 0xfbbf24, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Gà Nướng Muối Cheo Phong Nha & Khoai Deo', shortName: 'Mẹt Gà Nướng Phong Nha', icon: '🍗', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'mở tiệc khao đoàn' },
  },
  // 30. Quảng Trị
  30: {
    provinceName: 'Quảng Trị',
    1: { name: 'Ly Cà Phê Khe Sanh Thơm Lừng', shortName: 'Cà Phê Khe Sanh', icon: '☕', propType: 'cup_drink', color: 0x451a03, accent: 0xfde68a, actionVerb: 'vừa đi vừa uống' },
    '1b': { name: 'Bánh Ít Lá Gai & Thịt Trâu Lá Trơng', shortName: 'Thịt Trâu Lá Trơng', icon: '🥩', propType: 'plate_dish', color: 0x7f1d1d, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng thức' },
    2: { name: 'Tô Cháo Vả & Bún Hến Mai Xá Quảng Trị', shortName: 'Tô Bún Hến Mai Xá', icon: '🍜', propType: 'noodle_bowl', color: 0xd97706, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Thịt Luộc Chấm Ruốc & Bánh Ướt Phương Lang', shortName: 'Mâm Cỗ Quảng Trị', icon: '🍱', propType: 'royal_tray', color: 0xb91c1c, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 31. Thừa Thiên Huế
  31: {
    provinceName: 'Thừa Thiên Huế',
    1: { name: 'Ly Chè Hạt Sen Bọc Nhãn Lồng Cung Đình Huế', shortName: 'Chè Cung Đình Huế', icon: '🍧', propType: 'cup_drink', color: 0xa855f7, accent: 0xfacc15, actionVerb: 'vừa đi vừa thưởng thức' },
    '1b': { name: 'Khay Bánh Bèo Nậm Lọc & Mè Xửng Cố Đô', shortName: 'Bánh Bèo Nậm Lọc', icon: '🥟', propType: 'plate_dish', color: 0xf8fafc, accent: 0xf97316, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Tô Bún Bò Huế Giò Heo Cay Nồng Bốc Khói', shortName: 'Tô Bún Bò Huế', icon: '🍜', propType: 'noodle_bowl', color: 0xdc2626, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Ngự Thiện Hoàng Cung Đại Nội Huế', shortName: 'Yến Tiệc Cung Đình Huế', icon: '👑', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'ban Ngự Thiện cho toàn đoàn' },
  },
  // 32. Đà Nẵng (User highlighted example: Cầm Tô Mì Quảng trên đoạn đường ăn!)
  32: {
    provinceName: 'Đà Nẵng',
    1: { name: 'Ly Chè Xoa Xoa Hạt Lựu & Nước Mía Sông Hàn', shortName: 'Chè Xoa Xoa Đà Nẵng', icon: '🍧', propType: 'cup_drink', color: 0x10b981, accent: 0xfef08a, actionVerb: 'vừa đi vừa hút mát lạnh' },
    '1b': { name: 'Cuốn Bánh Tráng Thịt Heo Hai Đầu Da Đà Nẵng', shortName: 'Bánh Tráng Thịt Heo', icon: '🌯', propType: 'plate_dish', color: 0xf8fafc, accent: 0x22c55e, actionVerb: 'vừa đi vừa cuốn ăn' },
    2: { name: 'Tô Mì Quảng Tôm Thịt Trứng Cút Bánh Đa Giòn', shortName: 'Tô Mì Quảng Đà Nẵng', icon: '🍜', propType: 'noodle_bowl', color: 0xf59e0b, accent: 0xdc2626, actionVerb: 'vừa đi vừa cầm tô ăn ngon lành' },
    3: { name: 'Mâm Hải Sản Mỹ Khê & Gỏi Cá Nam Ô Đà Nẵng', shortName: 'Đại Tiệc Hải Sản Đà Nẵng', icon: '🦞', propType: 'royal_tray', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'khao đại tiệc bên cầu Rồng' },
  },
  // 33. Quảng Nam (Hội An)
  33: {
    provinceName: 'Quảng Nam',
    1: { name: 'Ly Nước Mót Hội An Thảo Mộc Cánh Sen', shortName: 'Ly Nước Mót Hội An', icon: '🪷', propType: 'cup_drink', color: 0xd97706, accent: 0xf472b6, actionVerb: 'vừa đi vừa nhâm nhi' },
    '1b': { name: 'Ổ Bánh Mì Phượng Hội An Đầy Nhân Thơm Phức', shortName: 'Bánh Mì Phượng', icon: '🥖', propType: 'banh_mi', color: 0xd97706, accent: 0x22c55e, actionVerb: 'vừa đi vừa cắn giòn rụm' },
    2: { name: 'Tô Cao Lầu Phố Cổ Hội An & Tô Mì Quảng Xứ Quảng', shortName: 'Tô Cao Lầu Hội An', icon: '🍜', propType: 'noodle_bowl', color: 0xb45309, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Mâm Cơm Gà Phố Cổ & Bê Thui Cầu Mống Quảng Nam', shortName: 'Cơm Gà & Bê Thui', icon: '🍗', propType: 'royal_tray', color: 0xf59e0b, accent: 0xfacc15, actionVerb: 'thết đãi cả đoàn phố Hội' },
  },
  // 34. Quảng Ngãi
  34: {
    provinceName: 'Quảng Ngãi',
    1: { name: 'Ly Nước Đường Phổi Kẹo Gương Quảng Ngãi', shortName: 'Kẹo Gương Đường Phổi', icon: '🍬', propType: 'cup_drink', color: 0xfef08a, accent: 0xf59e0b, actionVerb: 'vừa đi vừa nhâm nhi' },
    '1b': { name: 'Đĩa Cá Bống Sông Trà Kho Tiêu & Tỏi Lý Sơn', shortName: 'Cá Bống Sông Trà', icon: '🐟', propType: 'plate_dish', color: 0x92400e, accent: 0xef4444, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Tô Don Quảng Ngãi Xúc Bánh Đa Nướng', shortName: 'Tô Don Quảng Ngãi', icon: '🥣', propType: 'noodle_bowl', color: 0xf8fafc, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Cua Huỳnh Đế & Gỏi Tỏi Đảo Lý Sơn', shortName: 'Cua Huỳnh Đế Lý Sơn', icon: '🦀', propType: 'royal_tray', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 35. Bình Định
  35: {
    provinceName: 'Bình Định',
    1: { name: 'Bầu Rượu Bầu Đá Bình Định Danh Tửu', shortName: 'Rượu Bầu Đá', icon: '🍶', propType: 'cup_drink', color: 0xd97706, accent: 0xdc2626, actionVerb: 'vừa đi vừa nhấp rượu' },
    '1b': { name: 'Bánh Ít Lá Gai & Chả Ram Tôm Đất Quy Nhơn', shortName: 'Bánh Ít Lá Gai', icon: '🍙', propType: 'woven_gift', color: 0x15803d, accent: 0xfacc15, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Tô Bún Chả Cá Quy Nhơn & Bánh Hỏi Lòng Heo', shortName: 'Tô Bún Chả Cá', icon: '🍜', propType: 'noodle_bowl', color: 0xf59e0b, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Cua Huỳnh Đế Kỳ Co & Gà Nướng Lữ Đồng', shortName: 'Hải Sản Eo Gió Kỳ Co', icon: '🦀', propType: 'royal_tray', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'khao đại tiệc đất Võ' },
  },
  // 36. Phú Yên
  36: {
    provinceName: 'Phú Yên',
    1: { name: 'Ly Nước Mát Rong Biển Ghềnh Đá Đĩa', shortName: 'Nước Mát Phú Yên', icon: '🥤', propType: 'cup_drink', color: 0x38bdf8, accent: 0xfef08a, actionVerb: 'vừa đi vừa hút' },
    '1b': { name: 'Đĩa Bánh Xèo Hải Sản Tôm Mực Phú Yên', shortName: 'Bánh Xèo Hải Sản', icon: '🥞', propType: 'plate_dish', color: 0xfacc15, accent: 0xef4444, actionVerb: 'vừa đi vừa cuốn ăn' },
    2: { name: 'Thố Mắt Cá Ngừ Đại Dương Hầm Thuốc Bắc', shortName: 'Mắt Cá Ngừ Đại Dương', icon: '🍲', propType: 'noodle_bowl', color: 0x92400e, accent: 0xdc2626, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Mâm Sò Huyết Đầm Ô Loan & Cơm Gà Phú Yên', shortName: 'Hải Sản Đầm Ô Loan', icon: '🦪', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'khao cả đoàn xứ Nẫu' },
  },
  // 37. Khánh Hòa (Nha Trang)
  37: {
    provinceName: 'Khánh Hòa',
    1: { name: 'Chén Yến Sào Khánh Hòa Chưng Đường Phèn', shortName: 'Yến Sào Nha Trang', icon: '🥣', propType: 'cup_drink', color: 0xfef3c7, accent: 0xfacc15, actionVerb: 'vừa đi vừa bồi bổ' },
    '1b': { name: 'Mẹt Nem Nướng Ninh Hòa Cuốn Bánh Tráng Giòn', shortName: 'Nem Nướng Ninh Hòa', icon: '🍢', propType: 'plate_dish', color: 0xd97706, accent: 0x22c55e, actionVerb: 'vừa đi vừa cuốn ăn' },
    2: { name: 'Tô Bún Sứa Cá Dầm Nha Trang Nước Dùng Trong Vắt', shortName: 'Tô Bún Sứa Nha Trang', icon: '🍜', propType: 'noodle_bowl', color: 0x38bdf8, accent: 0xf97316, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Tôm Hùm Đảo Bình Ba & Yến Sào Hoàng Gia', shortName: 'Tôm Hùm Bình Ba', icon: '🦞', propType: 'royal_tray', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'khao đại tiệc Vịnh Nha Trang' },
  },
  // 38. Ninh Thuận
  38: {
    provinceName: 'Ninh Thuận',
    1: { name: 'Ly Mật Nho & Chùm Nho Tươi Phan Rang', shortName: 'Nho Tươi Ninh Thuận', icon: '🍇', propType: 'cup_drink', color: 0x7e22ce, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng thức' },
    '1b': { name: 'Đĩa Bánh Căn Hải Sản Phan Rang Nóng Hổi', shortName: 'Bánh Căn Phan Rang', icon: '🥞', propType: 'plate_dish', color: 0xfde047, accent: 0xef4444, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Đĩa Thịt Cừu Nướng Thảo Nguyên Ninh Thuận', shortName: 'Đùi Cừu Nướng', icon: '🍖', propType: 'plate_dish', color: 0xb45309, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Mâm Hải Sản Vịnh Vĩnh Hy & Cừu Quay Nguyên Con', shortName: 'Đại Tiệc Vĩnh Hy', icon: '🦞', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 39. Bình Thuận
  39: {
    provinceName: 'Bình Thuận',
    1: { name: 'Trái Thanh Long Đỏ Mũi Né Mát Lạnh', shortName: 'Thanh Long Bình Thuận', icon: '🐉', propType: 'cup_drink', color: 0xe11d48, accent: 0x22c55e, actionVerb: 'vừa đi vừa ăn mát ruột' },
    '1b': { name: 'Bánh Rế Phan Thiết & Chả Cuốn Cá Trích', shortName: 'Bánh Rế Phan Thiết', icon: '🍘', propType: 'woven_gift', color: 0xd97706, accent: 0xfacc15, actionVerb: 'vừa đi vừa nhâm nhi' },
    2: { name: 'Tô Bánh Canh Chả Cá Phan Thiết Đậm Đà', shortName: 'Tô Bánh Canh Chả Cá', icon: '🍜', propType: 'noodle_bowl', color: 0xf97316, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Nồi Lẩu Thả Mũi Né & Cua Huỳnh Đế Phú Quý', shortName: 'Lẩu Thả Mũi Né', icon: '🍲', propType: 'royal_tray', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'khao cả đoàn bên bờ biển' },
  },
  // 40. Kon Tum
  40: {
    provinceName: 'Kon Tum',
    1: { name: 'Ly Trà Sâm Ngọc Linh Kon Tum Quý Hiếm', shortName: 'Trà Sâm Ngọc Linh', icon: '🍵', propType: 'cup_drink', color: 0xd97706, accent: 0x22c55e, actionVerb: 'vừa đi vừa uống tăng lực' },
    '1b': { name: 'Đĩa Gỏi Lá Rừng Kon Tum 40 Loại Lá', shortName: 'Gỏi Lá Kon Tum', icon: '🌿', propType: 'plate_dish', color: 0x16a34a, accent: 0xef4444, actionVerb: 'vừa đi vừa cuốn ăn' },
    2: { name: 'Tô Phở Khô & Cá Gỏi Kiến Vàng Măng Đen', shortName: 'Gà Nướng Măng Đen', icon: '🍗', propType: 'noodle_bowl', color: 0xb45309, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Mâm Gà Nướng Cơm Lam Măng Đen & Rượu Cần', shortName: 'Mâm Cỗ Măng Đen', icon: '🍱', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'khao cả đoàn giữa đại ngàn' },
  },
  // 41. Gia Lai
  41: {
    provinceName: 'Gia Lai',
    1: { name: 'Ly Cà Phê Phin Phố Núi Pleiku Đậm Đặc', shortName: 'Cà Phê Phố Núi', icon: '☕', propType: 'cup_drink', color: 0x451a03, accent: 0xfde68a, actionVerb: 'vừa đi vừa nhâm nhi' },
    '1b': { name: 'Đĩa Bò Một Nắng Muối Kiến Vàng Krông Pa', shortName: 'Bò Một Nắng Gia Lai', icon: '🥩', propType: 'plate_dish', color: 0x991b1b, accent: 0xf59e0b, actionVerb: 'vừa đi vừa thưởng thức' },
    2: { name: 'Hai Tô Phở Khô Gia Lai Trứ Danh Phố Núi', shortName: 'Phở Hai Tô Gia Lai', icon: '🍜', propType: 'noodle_bowl', color: 0xd97706, accent: 0x22c55e, actionVerb: 'vừa đi vừa ăn' },
    3: { name: 'Mâm Gà Nướng Cơm Lam Biển Hồ Pleiku', shortName: 'Gà Nướng Biển Hồ', icon: '🍗', propType: 'royal_tray', color: 0xb45309, accent: 0xfacc15, actionVerb: 'thết đãi cả đoàn' },
  },
  // 42. Đắk Lắk
  42: {
    provinceName: 'Đắk Lắk',
    1: { name: 'Ly Cà Phê Sữa Đá Buôn Ma Thuột Thủ Phủ Cà Phê', shortName: 'Cà Phê Buôn Ma Thuột', icon: '☕', propType: 'cup_drink', color: 0x78350f, accent: 0xfef3c7, actionVerb: 'vừa đi vừa uống tỉnh táo' },
    '1b': { name: 'Ly Bơ Sáp Đắk Lắk Dằm Sữa Đặc Béo Ngậy', shortName: 'Bơ Sáp Đắk Lắk', icon: '🥑', propType: 'cup_drink', color: 0x22c55e, accent: 0xfef08a, actionVerb: 'vừa đi vừa múc ăn' },
    2: { name: 'Tô Bún Đỏ Buôn Ma Thuột Trứng Cút Riêu Cua', shortName: 'Tô Bún Đỏ Đắk Lắk', icon: '🍜', propType: 'noodle_bowl', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Gà Nướng Bản Đôn, Cơm Lam & Ché Rượu Cần', shortName: 'Gà Nướng Bản Đôn', icon: '🍗', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'mở hội cồng chiêng khao đoàn' },
  },
  // 43. Đắk Nông
  43: {
    provinceName: 'Đắk Nông',
    1: { name: 'Ly Sinh Tố Bơ Sáp Đắk Mil Mát Lạnh', shortName: 'Bơ Sáp Đắk Mil', icon: '🥑', propType: 'cup_drink', color: 0x16a34a, accent: 0xfef08a, actionVerb: 'vừa đi vừa hút' },
    '1b': { name: 'Củ Khoai Lang Mật Tuy Đức Nướng Chảy Mật', shortName: 'Khoai Lang Mật', icon: '🍠', propType: 'woven_gift', color: 0x9333ea, accent: 0xf59e0b, actionVerb: 'vừa đi vừa ăn nóng hổi' },
    2: { name: 'Nồi Lẩu Lá Rừng & Cá Lăng Sông Sêrêpốk', shortName: 'Cá Lăng Sêrêpốk', icon: '🍲', propType: 'noodle_bowl', color: 0xd97706, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Mâm Tiệc Hồ Tà Đùng & Heo Rừng Nướng Ống Tre', shortName: 'Đại Tiệc Tà Đùng', icon: '🍱', propType: 'royal_tray', color: 0xb45309, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 44. Lâm Đồng (Đà Lạt)
  44: {
    provinceName: 'Lâm Đồng',
    1: { name: 'Ly Sữa Đậu Nành Nóng & Trà Atiso Đỏ Đà Lạt', shortName: 'Sữa Đậu Nành Đà Lạt', icon: '🥛', propType: 'cup_drink', color: 0xfef3c7, accent: 0xe11d48, actionVerb: 'vừa đi vừa xuýt xoa uống nóng' },
    '1b': { name: 'Bánh Tráng Nướng Đà Lạt & Giỏ Dâu Tây Tươi', shortName: 'Bánh Tráng Nướng', icon: '🍕', propType: 'plate_dish', color: 0xfacc15, accent: 0xdc2626, actionVerb: 'vừa đi vừa cầm ăn giòn rụm' },
    2: { name: 'Tô Bánh Căn Đà Lạt Xíu Mại Bốc Khói Trong Sương', shortName: 'Bánh Căn Xíu Mại', icon: '🥣', propType: 'noodle_bowl', color: 0xf97316, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Nồi Lẩu Gà Lá É & Lẩu Bò Ba Toa Đà Lạt', shortName: 'Lẩu Gà Lá É Đà Lạt', icon: '🍲', propType: 'royal_tray', color: 0x16a34a, accent: 0xfacc15, actionVerb: 'khao cả đoàn giữa sương thông' },
  },
  // 45. Bình Phước
  45: {
    provinceName: 'Bình Phước',
    1: { name: 'Ly Nước Ép Quả Điều Chín Đỏ Bình Phước', shortName: 'Nước Ép Trái Điều', icon: '🍹', propType: 'cup_drink', color: 0xef4444, accent: 0xfacc15, actionVerb: 'vừa đi vừa uống' },
    '1b': { name: 'Hộp Hạt Điều Rang Muối Bình Phước Giòn Béo', shortName: 'Hạt Điều Rang Muối', icon: '🥜', propType: 'woven_gift', color: 0xd97706, accent: 0xfef08a, actionVerb: 'vừa đi vừa nhâm nhi' },
    2: { name: 'Đĩa Gỏi Đọt Mây & Thịt Heo Thả Rong Sóc Bom Bo', shortName: 'Heo Sóc Bom Bo', icon: '🥩', propType: 'plate_dish', color: 0xb45309, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Mâm Cơm Lam Cối Giã Gạo & Ve Sầu Sữa Chiên Giòn', shortName: 'Mâm Cỗ Sóc Bom Bo', icon: '🍱', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 46. Tây Ninh
  46: {
    provinceName: 'Tây Ninh',
    1: { name: 'Ly Nước Mía Sầu Riêng Dưới Chân Núi Bà Đen', shortName: 'Nước Mía Sầu Riêng', icon: '🥤', propType: 'bag_drink', color: 0xa3e635, accent: 0xfacc15, actionVerb: 'vừa đi vừa hút' },
    '1b': { name: 'Xấp Bánh Tráng Phơi Sương Trảng Bàng & Muối Tôm', shortName: 'Bánh Tráng Tây Ninh', icon: '🫓', propType: 'woven_gift', color: 0xf97316, accent: 0xf8fafc, actionVerb: 'vừa đi vừa chấm muối tôm ăn' },
    2: { name: 'Tô Bánh Canh Trảng Bàng Giò Heo Nóng Hổi', shortName: 'Tô Bánh Canh Trảng Bàng', icon: '🍜', propType: 'noodle_bowl', color: 0xf8fafc, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Bò Tơ Tây Ninh Nướng Hồng & Ốc Núi Bà Đen', shortName: 'Bò Tơ Tây Ninh', icon: '🥩', propType: 'royal_tray', color: 0xb91c1c, accent: 0xfacc15, actionVerb: 'khao cả đoàn trên đỉnh Núi Bà' },
  },
  // 47. Bình Dương
  47: {
    provinceName: 'Bình Dương',
    1: { name: 'Trái Măng Cụt Lái Thiêu Ngọt Thanh', shortName: 'Măng Cụt Lái Thiêu', icon: '🟣', propType: 'woven_gift', color: 0x6b21a8, accent: 0xf8fafc, actionVerb: 'vừa đi vừa bóc ăn' },
    '1b': { name: 'Đĩa Bánh Bèo Bì Chợ Thủ Dầu Một', shortName: 'Bánh Bèo Bì', icon: '🥟', propType: 'plate_dish', color: 0xf8fafc, accent: 0xd97706, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Đĩa Gỏi Gà Măng Cụt Lái Thiêu Trứ Danh', shortName: 'Gỏi Gà Măng Cụt', icon: '🥗', propType: 'noodle_bowl', color: 0xa855f7, accent: 0x22c55e, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Nồi Lẩu Bò Nhúng Mắm Ruốc Bình Dương Sôi Sùng Sục', shortName: 'Bò Nhúng Mắm Ruốc', icon: '🍲', propType: 'royal_tray', color: 0xb91c1c, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 48. Đồng Nai
  48: {
    provinceName: 'Đồng Nai',
    1: { name: 'Trái Bưởi Đường Lá Cam Tân Triều Mọng Nước', shortName: 'Bưởi Tân Triều', icon: '🍈', propType: 'woven_gift', color: 0x22c55e, accent: 0xfef08a, actionVerb: 'vừa đi vừa ăn mát lành' },
    '1b': { name: 'Đĩa Xôi Chiên Phồng Biên Hòa Vàng Óng Dẻo Thơm', shortName: 'Xôi Chiên Phồng', icon: '🟡', propType: 'plate_dish', color: 0xfacc15, accent: 0xd97706, actionVerb: 'vừa đi vừa cắn giòn dẻo' },
    2: { name: 'Đĩa Gỏi Cá Biên Hòa & Gà Hấp Bưởi Tân Triều', shortName: 'Gà Hấp Bưởi', icon: '🍗', propType: 'noodle_bowl', color: 0x84cc16, accent: 0xf59e0b, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Mâm Đại Tiệc Gà Nướng Xôi Chiên Phồng Đồng Nai', shortName: 'Mâm Cỗ Biên Hòa', icon: '🍱', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 49. Bà Rịa – Vũng Tàu
  49: {
    provinceName: 'Bà Rịa – Vũng Tàu',
    1: { name: 'Ly Kem Alibaba & Nước Dừa Bãi Trước Vũng Tàu', shortName: 'Dừa Tươi Vũng Tàu', icon: '🥥', propType: 'coconut', color: 0x16a34a, accent: 0xf8fafc, actionVerb: 'vừa đi vừa hút' },
    '1b': { name: 'Đĩa Bánh Khọt Cô Ba Vũng Tàu Tôm Tươi Vàng Giòn', shortName: 'Bánh Khọt Vũng Tàu', icon: '🥞', propType: 'plate_dish', color: 0xfacc15, accent: 0xef4444, actionVerb: 'vừa đi vừa cuốn rau ăn' },
    2: { name: 'Nồi Lẩu Cá Đuối Trương Công Định Vũng Tàu', shortName: 'Lẩu Cá Đuối', icon: '🍲', propType: 'noodle_bowl', color: 0xf97316, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Hải Sản Hồ Tràm & Bông Lan Trứng Muối Gốc Cột Điện', shortName: 'Hải Sản Vũng Tàu', icon: '🦞', propType: 'royal_tray', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'khao đại tiệc biển Vũng Tàu' },
  },
  // 50. TP. Hồ Chí Minh (Sài Gòn)
  50: {
    provinceName: 'TP. Hồ Chí Minh',
    1: { name: 'Ly Cà Phê Sữa Đá Vợt & Trà Đào Sài Gòn', shortName: 'Cà Phê Sữa Đá Sài Gòn', icon: '☕', propType: 'cup_drink', color: 0x78350f, accent: 0xfef3c7, actionVerb: 'vừa đi vừa hút sảng khoái' },
    '1b': { name: 'Ổ Bánh Mì Huỳnh Hoa & Bịch Bánh Tráng Trộn Sài Gòn', shortName: 'Bánh Mì Sài Gòn', icon: '🥖', propType: 'banh_mi', color: 0xd97706, accent: 0x22c55e, actionVerb: 'vừa đi vừa cắn ngập răng' },
    2: { name: 'Dĩa Cơm Tấm Sườn Bì Chả Trứng Ốp La Sài Gòn', shortName: 'Cơm Tấm Sườn Bì Chả', icon: '🍛', propType: 'plate_dish', color: 0xb45309, accent: 0xfacc15, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Đại Tiệc Hủ Tiếu Nam Vang & Hải Sản Bến Nhà Rồng', shortName: 'Đại Tiệc Sài Gòn', icon: '🍲', propType: 'royal_tray', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'khao cả đoàn giữa Phố Đi Bộ' },
  },
  // 51. Long An
  51: {
    provinceName: 'Long An',
    1: { name: 'Ly Nước Mía & Rượu Đế Gò Đen Long An', shortName: 'Rượu Đế Gò Đen', icon: '🍶', propType: 'cup_drink', color: 0xf8fafc, accent: 0x38bdf8, actionVerb: 'vừa đi vừa nhâm nhi' },
    '1b': { name: 'Đòn Bánh Tét Đức Hòa & Đậu Phộng Chợ Đào', shortName: 'Bánh Tét Long An', icon: '🟩', propType: 'woven_gift', color: 0x15803d, accent: 0xfacc15, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Đĩa Lạp Xưởng Tươi Cần Đước & Canh Chua Cá Chốt', shortName: 'Lạp Xưởng Cần Đước', icon: '🌭', propType: 'plate_dish', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'vừa đi vừa thưởng thức' },
    3: { name: 'Mâm Cá Lóc Nướng Trui Làng Nổi Tân Lập', shortName: 'Cá Lóc Nướng Trui', icon: '🐟', propType: 'royal_tray', color: 0x92400e, accent: 0xfacc15, actionVerb: 'khao cả đoàn miền sông nước' },
  },
  // 52. Tiền Giang
  52: {
    provinceName: 'Tiền Giang',
    1: { name: 'Chùm Vú Sữa Lò Rèn Vĩnh Kim Ngọt Mát', shortName: 'Vú Sữa Lò Rèn', icon: '🍏', propType: 'coconut', color: 0x86efac, accent: 0xf8fafc, actionVerb: 'vừa đi vừa thưởng thức' },
    '1b': { name: 'Bánh Giá Chợ Giồng & Sầu Riêng Ngũ Hiệp', shortName: 'Sầu Riêng Ngũ Hiệp', icon: '🟡', propType: 'woven_gift', color: 0xfacc15, accent: 0x16a34a, actionVerb: 'vừa đi vừa ăn thơm phức' },
    2: { name: 'Tô Hủ Tiếu Mỹ Tho Tôm Thịt Sườn Non Trứ Danh', shortName: 'Tô Hủ Tiếu Mỹ Tho', icon: '🍜', propType: 'noodle_bowl', color: 0xf59e0b, accent: 0xdc2626, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Cá Tai Tượng Chiên Xù Cù Lao Thới Sơn', shortName: 'Cá Tai Tượng Chiên Xù', icon: '🐟', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'khao cả đoàn Cù Lao' },
  },
  // 53. Bến Tre
  53: {
    provinceName: 'Bến Tre',
    1: { name: 'Trái Dừa Xiêm Xanh Bến Tre Cắm Ống Hút Mát Lạnh', shortName: 'Dừa Xiêm Bến Tre', icon: '🥥', propType: 'coconut', color: 0x16a34a, accent: 0xf8fafc, actionVerb: 'vừa đi vừa hút nước dừa ngọt lịm' },
    '1b': { name: 'Hộp Kẹo Dừa Bến Tre & Bánh Tráng Mỹ Lồng', shortName: 'Kẹo Dừa Bến Tre', icon: '🍬', propType: 'woven_gift', color: 0x15803d, accent: 0xfef3c7, actionVerb: 'vừa đi vừa nhâm nhi' },
    2: { name: 'Đĩa Cơm Dừa Tôm Rang & Đuông Dừa Xứ Dừa', shortName: 'Trái Cơm Dừa Tôm Rang', icon: '🥥', propType: 'noodle_bowl', color: 0x92400e, accent: 0xf97316, actionVerb: 'vừa đi vừa múc ăn' },
    3: { name: 'Đại Tiệc Ẩm Thực Xứ Dừa Cồn Phụng Bến Tre', shortName: 'Mâm Cỗ Xứ Dừa', icon: '🌴', propType: 'royal_tray', color: 0x16a34a, accent: 0xfacc15, actionVerb: 'khao cả đoàn dưới bóng dừa' },
  },
  // 54. Trà Vinh
  54: {
    provinceName: 'Trà Vinh',
    1: { name: 'Trái Dừa Sáp Cầu Kè Dằm Sữa Đá Béo Ngậy', shortName: 'Dừa Sáp Cầu Kè', icon: '🥥', propType: 'coconut', color: 0xf8fafc, accent: 0x16a34a, actionVerb: 'vừa đi vừa múc dừa sáp' },
    '1b': { name: 'Đòn Bánh Tét Trà Cuôn Ba Màu Lá Bồ Ngót', shortName: 'Bánh Tét Trà Cuôn', icon: '🟩', propType: 'woven_gift', color: 0x15803d, accent: 0xf97316, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Tô Bún Nước Lèo Trà Vinh & Bún Suông Tôm', shortName: 'Tô Bún Nước Lèo', icon: '🍜', propType: 'noodle_bowl', color: 0xb45309, accent: 0xef4444, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Chù Ụ Rang Me & Hải Sản Biển Ba Động', shortName: 'Đặc Sản Trà Vinh', icon: '🦀', propType: 'royal_tray', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 55. Vĩnh Long
  55: {
    provinceName: 'Vĩnh Long',
    1: { name: 'Trái Bưởi Năm Roi Bình Minh Ngọt Thanh', shortName: 'Bưởi Năm Roi', icon: '🍈', propType: 'woven_gift', color: 0x84cc16, accent: 0xfacc15, actionVerb: 'vừa đi vừa ăn' },
    '1b': { name: 'Khoai Lang Bình Tân Nướng & Bánh Tráng Nem Cù Lao Lục Sĩ', shortName: 'Khoai Lang Vĩnh Long', icon: '🍠', propType: 'plate_dish', color: 0xd97706, accent: 0xfacc15, actionVerb: 'vừa đi vừa thưởng thức' },
    2: { name: 'Đĩa Cá Tai Tượng Chiên Xù Cuốn Bánh Tráng Cù Lao An Bình', shortName: 'Cá Tai Tượng An Bình', icon: '🐟', propType: 'plate_dish', color: 0xf59e0b, accent: 0x22c55e, actionVerb: 'vừa đi vừa cuốn ăn' },
    3: { name: 'Mâm Cá Cháy Sông Hậu & Trái Cây Miệt Vườn Vĩnh Long', shortName: 'Mâm Quả Miệt Vườn', icon: '🍉', propType: 'royal_tray', color: 0x16a34a, accent: 0xfacc15, actionVerb: 'khao cả đoàn miệt vườn' },
  },
  // 56. Đồng Tháp
  56: {
    provinceName: 'Đồng Tháp',
    1: { name: 'Ly Sữa Hạt Sen Hồng Tháp Mười Thơm Mát', shortName: 'Sữa Sen Đồng Tháp', icon: '🪷', propType: 'cup_drink', color: 0xf472b6, accent: 0xfef08a, actionVerb: 'vừa đi vừa hút' },
    '1b': { name: 'Chục Nem Lai Vung & Quýt Hồng Lai Vung', shortName: 'Nem Chua Lai Vung', icon: '🍊', propType: 'woven_gift', color: 0xf97316, accent: 0x22c55e, actionVerb: 'vừa đi vừa bóc ăn' },
    2: { name: 'Tô Hủ Tiếu Sa Đéc Nước Sốt Đậm Đà', shortName: 'Tô Hủ Tiếu Sa Đéc', icon: '🍜', propType: 'noodle_bowl', color: 0xf59e0b, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Cơm Gói Lá Sen Hồng & Cá Linh Bông Điên Điển', shortName: 'Cơm Sen Tháp Mười', icon: '🪷', propType: 'royal_tray', color: 0xec4899, accent: 0xfacc15, actionVerb: 'thết đãi cả đoàn giữa đồng sen' },
  },
  // 57. An Giang
  57: {
    provinceName: 'An Giang',
    1: { name: 'Ly Nước Thốt Nốt Tươi Tịnh Biên Mát Lạnh', shortName: 'Nước Thốt Nốt Tươi', icon: '🌴', propType: 'cup_drink', color: 0xfef3c7, accent: 0xd97706, actionVerb: 'vừa đi vừa hút mát rượi' },
    '1b': { name: 'Bánh Bò Thốt Nốt Vàng Ươm & Xôi Phồng Chợ Mới', shortName: 'Bánh Bò Thốt Nốt', icon: '🟡', propType: 'plate_dish', color: 0xfacc15, accent: 0x92400e, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Tô Bún Cá Châu Đốc Bông Điên Điển Vàng Rực', shortName: 'Tô Bún Cá Châu Đốc', icon: '🍜', propType: 'noodle_bowl', color: 0xf59e0b, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Nồi Lẩu Mắm Châu Đốc & Bò Bảy Món Núi Sam', shortName: 'Lẩu Mắm Châu Đốc', icon: '🍲', propType: 'royal_tray', color: 0xb45309, accent: 0xfacc15, actionVerb: 'khao cả đoàn miền Thất Sơn' },
  },
  // 58. Kiên Giang (Phú Quốc)
  58: {
    provinceName: 'Kiên Giang',
    1: { name: 'Ly Rượu Sim Rừng & Nước Mía Phú Quốc', shortName: 'Rượu Sim Phú Quốc', icon: '🍷', propType: 'cup_drink', color: 0x9333ea, accent: 0xfef08a, actionVerb: 'vừa đi vừa nhâm nhi' },
    '1b': { name: 'Đĩa Gỏi Cá Trích Phú Quốc Cuốn Dừa Nạo', shortName: 'Gỏi Cá Trích Phú Quốc', icon: '🐟', propType: 'plate_dish', color: 0x38bdf8, accent: 0x22c55e, actionVerb: 'vừa đi vừa cuốn ăn' },
    2: { name: 'Tô Bún Quậy Kiến Xây Phú Quốc Tôm Mực Tươi', shortName: 'Tô Bún Quậy Phú Quốc', icon: '🍜', propType: 'noodle_bowl', color: 0xf8fafc, accent: 0xf97316, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Nhum Biển Nướng Mỡ Hành & Ghẹ Hàm Ninh Phú Quốc', shortName: 'Ghẹ Hàm Ninh Phú Quốc', icon: '🦀', propType: 'royal_tray', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'khao đại tiệc Đảo Ngọc' },
  },
  // 59. TP. Cần Thơ
  59: {
    provinceName: 'TP. Cần Thơ',
    1: { name: 'Ly Cà Phê Ghe Đậu & Dừa Tươi Chợ Nổi Cái Răng', shortName: 'Dừa Chợ Nổi Cái Răng', icon: '🥥', propType: 'coconut', color: 0x16a34a, accent: 0xf8fafc, actionVerb: 'vừa đi vừa hút trên bến Ninh Kiều' },
    '1b': { name: 'Đòn Bánh Tét Lá Cẩm Cần Thơ & Bánh Cống Đại Tâm', shortName: 'Bánh Tét Lá Cẩm', icon: '🟪', propType: 'woven_gift', color: 0x9333ea, accent: 0xfacc15, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Tô Hủ Tiếu Thuyền Chợ Nổi Cái Răng Bốc Khói', shortName: 'Tô Hủ Tiếu Chợ Nổi', icon: '🍜', propType: 'noodle_bowl', color: 0xf59e0b, accent: 0xef4444, actionVerb: 'vừa đi vừa cầm tô ăn' },
    3: { name: 'Nồi Lẩu Vịt Nấu Chao & Cá Lóc Nướng Trui Tây Đô', shortName: 'Vịt Nấu Chao Cần Thơ', icon: '🍲', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'khao đại tiệc Tây Đô' },
  },
  // 60. Hậu Giang
  60: {
    provinceName: 'Hậu Giang',
    1: { name: 'Trái Khóm Cầu Đúc Hậu Giang Ngọt Lịm', shortName: 'Khóm Cầu Đúc', icon: '🍍', propType: 'cup_drink', color: 0xfacc15, accent: 0x16a34a, actionVerb: 'vừa đi vừa thưởng thức' },
    '1b': { name: 'Đĩa Chả Cá Thác Lác Hậu Giang Chiên Giòn', shortName: 'Chả Cá Thác Lác', icon: '🍥', propType: 'plate_dish', color: 0xf59e0b, accent: 0x22c55e, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Nồi Lẩu Cá Thác Lác Khổ Qua Rừng Hậu Giang', shortName: 'Lẩu Cá Thác Lác', icon: '🍲', propType: 'noodle_bowl', color: 0x16a34a, accent: 0xf8fafc, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Đọt Choại Xào Tép Đồng & Cá Lóc Đồng Lung Ngọc Hoàng', shortName: 'Mâm Cỗ Hậu Giang', icon: '🍱', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 61. Sóc Trăng
  61: {
    provinceName: 'Sóc Trăng',
    1: { name: 'Trà Hoa Cúc Nhâm Nhi Bánh Pía Sóc Trăng', shortName: 'Trà & Bánh Pía', icon: '🍵', propType: 'cup_drink', color: 0xf59e0b, accent: 0xfef08a, actionVerb: 'vừa đi vừa nhâm nhi' },
    '1b': { name: 'Cặp Bánh Pía Sầu Riêng Trứng Muối Sóc Trăng', shortName: 'Bánh Pía Sóc Trăng', icon: '🥮', propType: 'woven_gift', color: 0xd97706, accent: 0xef4444, actionVerb: 'vừa đi vừa ăn thơm nức' },
    2: { name: 'Tô Bún Nước Lèo Sóc Trăng Cá Lóc Tôm Tươi', shortName: 'Tô Bún Nước Lèo', icon: '🍜', propType: 'noodle_bowl', color: 0xb45309, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Bò Nướng Ngói Mỹ Xuyên & Bánh Cóng Sóc Trăng', shortName: 'Bò Nướng Ngói Mỹ Xuyên', icon: '🥩', propType: 'royal_tray', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'khao cả đoàn' },
  },
  // 62. Bạc Liêu
  62: {
    provinceName: 'Bạc Liêu',
    1: { name: 'Ly Nhãn Da Bò Bạc Liêu Ngọt Thanh Mát Lạnh', shortName: 'Nhãn Da Bò Bạc Liêu', icon: '🍹', propType: 'cup_drink', color: 0xfbbf24, accent: 0xfef9c3, actionVerb: 'vừa đi vừa uống' },
    '1b': { name: 'Đĩa Bánh Củ Cải & Ba Khía Muối Bạc Liêu', shortName: 'Bánh Củ Cải Bạc Liêu', icon: '🥟', propType: 'plate_dish', color: 0xf8fafc, accent: 0xef4444, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Tô Bún Bò Cay Bạc Liêu & Bánh Tầm Ngan Dừa', shortName: 'Tô Bún Bò Cay Bạc Liêu', icon: '🍜', propType: 'noodle_bowl', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Yến Tiệc Công Tử Bạc Liêu & Lẩu Mắm Hồng Gấm', shortName: 'Yến Tiệc Công Tử Bạc Liêu', icon: '👑', propType: 'royal_tray', color: 0xd97706, accent: 0xfacc15, actionVerb: 'đãi tiệc Công Tử Bạc Liêu cho cả đoàn' },
  },
  // 63. Cà Mau
  63: {
    provinceName: 'Cà Mau',
    1: { name: 'Bình Mật Ong Rừng U Minh Hạ Cà Mau Nguyên Chất', shortName: 'Mật Ong U Minh Hạ', icon: '🍯', propType: 'cup_drink', color: 0xf59e0b, accent: 0xfef08a, actionVerb: 'vừa đi vừa thưởng thức' },
    '1b': { name: 'Đĩa Ba Khía Rạch Gốc Trộn Tỏi Ớt & Tôm Khô Cà Mau', shortName: 'Ba Khía Rạch Gốc', icon: '🦀', propType: 'plate_dish', color: 0xb91c1c, accent: 0x22c55e, actionVerb: 'vừa đi vừa ăn' },
    2: { name: 'Nồi Lẩu Mắm U Minh Hạ Rau Rừng Cà Mau', shortName: 'Lẩu Mắm U Minh', icon: '🍲', propType: 'noodle_bowl', color: 0xb45309, accent: 0x22c55e, actionVerb: 'vừa đi vừa xì xụp' },
    3: { name: 'Mâm Cua Gạch Cà Mau Hấp Bia Nơi Đất Mũi Cực Nam', shortName: 'Cua Gạch Cà Mau', icon: '🦀', propType: 'royal_tray', color: 0xdc2626, accent: 0xfacc15, actionVerb: 'khao đại tiệc Cua Cà Mau tại Đất Mũi' },
  },
};

export const BIOME_DEFAULT_PROVINCE = {
  vn_hagiang: 1,   // Hà Giang
  vn_sapa: 7,      // Lào Cai (Sa Pa)
  vn_halong: 15,   // Quảng Ninh (Hạ Long)
  vn_hanoi: 21,    // Hà Nội
  vn_ninhbinh: 26, // Thanh Hóa / Ninh Bình
  vn_hue: 31,      // Thừa Thiên Huế
  vn_danang: 32,   // Đà Nẵng
  vn_hoian: 33,    // Quảng Nam (Hội An)
  vn_dalat: 44,    // Lâm Đồng (Đà Lạt)
  vn_nhatrang: 37, // Khánh Hòa (Nha Trang)
  vn_saigon: 50,   // TP. Hồ Chí Minh
  vn_mientay: 53,  // Bến Tre / Cần Thơ
  vietnam: 21,
};

export function getGiftSubTierKey(totalDiamonds = 1, tier = 1) {
  if (tier >= 3 || totalDiamonds >= 20) return '3';
  if (tier === 2 || totalDiamonds >= 10) return '2';
  if (totalDiamonds >= 2) return '1b';
  return '1';
}

export function getProvinceSpecialtyMenu(provinceCode = 1, biomeId = 'vn_hagiang') {
  const code = Number(provinceCode) || BIOME_DEFAULT_PROVINCE[biomeId] || 1;
  return PROVINCE_SPECIALTIES_63[code] || PROVINCE_SPECIALTIES_63[BIOME_DEFAULT_PROVINCE[biomeId]] || PROVINCE_SPECIALTIES_63[1];
}

export function resolveRegionalGiftItem(arg1 = {}, diamondsArg = 1, tierArg = 1) {
  const opts = typeof arg1 === 'object' && arg1 !== null
    ? arg1
    : { provinceCode: arg1, diamonds: diamondsArg, tier: tierArg };
  const { provinceCode = 1, biomeId = 'vn_hagiang', diamonds = 1, tier = 1 } = opts;
  const menu = getProvinceSpecialtyMenu(provinceCode, biomeId);
  const subKey = getGiftSubTierKey(diamonds, tier);
  const item = menu[subKey] || menu[1];
  return {
    ...item,
    subTier: subKey,
    provinceCode: Number(provinceCode) || BIOME_DEFAULT_PROVINCE[biomeId] || 1,
    provinceName: menu.provinceName || 'Việt Nam',
  };
}
