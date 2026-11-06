// Deterministic Comment-Format Algorithm Engine & TikTok Live Trend Insight Aggregator (Zero-AI / 100% Rule & Data-Driven)
// Powers 10 Interactive 3D TikTok Live Websites + Custom Admin Datasets + Real-Time Viewer Comment Insight Analytics.

const CAN_LIST = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
const CHI_LIST = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];
const ZODIAC_ANIMALS = [
  'Khỉ Vàng Thông Thái',
  'Gà Vàng Báo Hiểu',
  'Chó Ngọc Trung Thành',
  'Heo Vàng Phú Quý',
  'Chuột Ngọc Tinh Anh',
  'Trâu Vàng Cần Mẫn',
  'Hổ Vàng Uy Vũ',
  'Mèo Ngọc Cát Tường',
  'Rồng Vàng Thần Thoại',
  'Rắn Ngọc Linh Thông',
  'Ngựa Vàng Vạn Dặm',
  'Dê Ngọc An Hòa',
];

const NAP_AM_ELEMENTS = [
  { element: 'Kim', title: 'Hải Trung Kim (Vàng dưới biển)', color: 'Trắng · Ánh Kim · Vàng', luckyNums: '6, 7, 8', advice: 'Mệnh Kim năm nay gặp vận quý nhân mở lối, hợp mở rộng giao thương và tích lũy tài sản.' },
  { element: 'Hỏa', title: 'Lư Trung Hỏa (Lửa trong lò)', color: 'Đỏ · Cam · Tím Hồng', luckyNums: '3, 4, 9', advice: 'Mệnh Hỏa rực sáng cung công danh, càng chủ động nắm bắt cơ hội đầu tháng càng dễ bứt phá.' },
  { element: 'Mộc', title: 'Đại Lâm Mộc (Gỗ rừng già)', color: 'Xanh Ngọc · Xanh Lá · Đen', luckyNums: '1, 3, 4', advice: 'Mệnh Mộc đâm chồi nảy lộc, sức khỏe dồi dào, chuyện tình cảm và gia đạo êm ấm thuận hòa.' },
  { element: 'Thủy', title: 'Giản Hạ Thủy (Nước suối nguồn)', color: 'Xanh Dương · Trắng · Bạc', luckyNums: '1, 6, 7', advice: 'Mệnh Thủy dòng chảy hanh thông, tiền tài vào đều như nước nguồn, đi xa gặp nhiều may mắn.' },
  { element: 'Thổ', title: 'Thành Đầu Thổ (Đất tường thành)', color: 'Vàng Nâu · Đỏ · Hồng', luckyNums: '2, 5, 8, 9', advice: 'Mệnh Thổ vững chãi kiên định, cực hợp đầu tư dài hạn, xây dựng nền tảng sự nghiệp bền vững.' },
];

export const PROVINCES_63_MAP = [
  { code: 11, name: 'Cao Bằng', specialty: 'Thác Bản Giốc & Hạt Dẻ Trùng Khánh', chant: 'Non nước Cao Bằng địa linh nhân kiệt!' },
  { code: 12, name: 'Lạng Sơn', specialty: 'Đỉnh Mẫu Sơn & Vịt Quay Mắc Mật', chant: 'Xứ Lạng hùng vĩ biên cương Tổ quốc!' },
  { code: 14, name: 'Quảng Ninh', specialty: 'Kỳ Quan Vịnh Hạ Long & Chả Mực', chant: 'Hạ Long rồng đáp đất mỏ hào sảng!' },
  { code: 15, name: 'Hải Phòng', specialty: 'Hoa Phượng Đỏ & Bánh Đa Cua', chant: 'Hải Phòng không lòng vòng, rực lửa cảng biển!' },
  { code: 17, name: 'Thái Bình', specialty: 'Chùa Keo & Bánh Cáy Làng Nguyễn', chant: 'Quê lúa Thái Bình năm tấn vang danh!' },
  { code: 18, name: 'Nam Định', specialty: 'Đền Trần & Phở Bò Gia Truyền', chant: 'Đất học Nam Định hào khí Đông A!' },
  { code: 19, name: 'Phú Thọ', specialty: 'Đền Hùng Đất Tổ & Thịt Chua', chant: 'Con cháu Vua Hùng hội tụ bốn phương!' },
  { code: 20, name: 'Thái Nguyên', specialty: 'Đệ Nhất Danh Trà Tân Cương', chant: 'Hương trà Thái Nguyên thơm lừng đất Việt!' },
  { code: 21, name: 'Yên Bái', specialty: 'Ruộng Bậc Thang Mù Cang Chải', chant: 'Mù Cang Chải mùa vàng rực rỡ Tây Bắc!' },
  { code: 22, name: 'Tuyên Quang', specialty: 'Lễ Hội Thành Tuyên & Tân Trào', chant: 'Thủ đô kháng chiến rực sáng đêm rằm!' },
  { code: 23, name: 'Hà Giang', specialty: 'Đèo Mã Pí Lèng & Cột Cờ Lũng Cú', chant: 'Địa đầu Tổ quốc đá nở hoa tam giác mạch!' },
  { code: 24, name: 'Lào Cai', specialty: 'Đỉnh Fansipan Sa Pa Nóc Nhà Đông Dương', chant: 'Sa Pa sương mờ mây phủ đỉnh thiêng!' },
  { code: 25, name: 'Lai Châu', specialty: 'Đèo Ô Quy Hồ & Đỉnh Pu Ta Leng', chant: 'Lai Châu kỳ vĩ đại ngàn Tây Bắc!' },
  { code: 26, name: 'Sơn La', specialty: 'Cao Nguyên Mộc Châu & Hoa Mận Trắng', chant: 'Mộc Châu thảo nguyên xanh bát ngát!' },
  { code: 27, name: 'Điện Biên', specialty: 'Chiến Thắng Điện Biên Phủ & Hoa Ban', chant: 'Điện Biên lừng lẫy năm châu chấn động địa cầu!' },
  { code: 28, name: 'Hòa Bình', specialty: 'Thủy Điện Sông Đà & Cơm Lam Mai Châu', chant: 'Hòa Bình cồng chiêng Mường vang vọng!' },
  { code: 29, name: 'Hà Nội', specialty: 'Hồ Gươm Tháp Rùa & Phở Hà Nội', chant: 'Thủ đô Hà Nội ngàn năm văn hiến!' },
  { code: 34, name: 'Hải Dương', specialty: 'Côn Sơn Kiếp Bạc & Bánh Đậu Xanh', chant: 'Xứ Đông địa linh nhân kiệt rạng ngời!' },
  { code: 35, name: 'Ninh Bình', specialty: 'Danh Thắng Tràng An & Chùa Bái Đính', chant: 'Cố đô Hoa Lư non nước hữu tình!' },
  { code: 36, name: 'Thanh Hóa', specialty: 'Thành Nhà Hồ, Sầm Sơn & Nem Chua', chant: 'Xứ Thanh địa linh hào khí Lam Sơn!' },
  { code: 37, name: 'Nghệ An', specialty: 'Làng Sen Quê Bác & Biển Cửa Lò', chant: 'Xứ Nghệ ân tình kiên cường bất khuất!' },
  { code: 38, name: 'Hà Tĩnh', specialty: 'Núi Hồng Sông La & Kẹo Cu Đơ', chant: 'Hà Tĩnh nghĩa tình đậm đà câu ví dặm!' },
  { code: 43, name: 'Đà Nẵng', specialty: 'Cầu Vàng Bà Nà & Cầu Rồng Sông Hàn', chant: 'Đà Nẵng thành phố đáng sống bên bờ biển xanh!' },
  { code: 47, name: 'Đắk Lắk', specialty: 'Thủ Phủ Cà Phê Buôn Ma Thuột', chant: 'Đại ngàn Tây Nguyên hùng tráng tiếng cồng chiêng!' },
  { code: 49, name: 'Lâm Đồng', specialty: 'Đà Lạt Ngàn Hoa & Đồi Chè Cầu Đất', chant: 'Đà Lạt mộng mơ ngàn thông reo gió!' },
  { code: 50, name: 'TP. Hồ Chí Minh', specialty: 'Bến Nhà Rồng, Landmark 81 & Cơm Tấm', chant: 'Sài Gòn năng động nghĩa tình rực sáng!' },
  { code: 59, name: 'Sài Gòn', specialty: 'Phố Đi Bộ Nguyễn Huệ & Cà Phê Sữa Đá', chant: 'Hòn ngọc Viễn Đông không ngủ đêm ngày!' },
  { code: 60, name: 'Đồng Nai', specialty: 'Rừng Nam Cát Tiên & Bưởi Tân Triều', chant: 'Đồng Nai hào sảng cửa ngõ miền Đông!' },
  { code: 61, name: 'Bình Dương', specialty: 'Chùa Hội Khánh & Làng Gốm Lái Thiêu', chant: 'Bình Dương thủ phủ công nghiệp bứt phá!' },
  { code: 63, name: 'Tiền Giang', specialty: 'Chợ Nổi Cái Bè & Hủ Tiếu Mỹ Tho', chant: 'Tiền Giang miền Tây sông nước ngọt lành!' },
  { code: 65, name: 'Cần Thơ', specialty: 'Bến Ninh Kiều & Chợ Nổi Cái Răng', chant: 'Cần Thơ gạo trắng nước trong Tây Đô!' },
  { code: 67, name: 'An Giang', specialty: 'Rừng Tràm Trà Sư & Núi Cấm Thất Sơn', chant: 'An Giang vùng đất tâm linh huyền thoại!' },
  { code: 68, name: 'Kiên Giang', specialty: 'Đảo Ngọc Phú Quốc & Hà Tiên', chant: 'Phú Quốc đảo ngọc rực rỡ biển trời Nam!' },
  { code: 69, name: 'Cà Mau', specialty: 'Mũi Cà Mau Cực Nam Tổ Quốc', chant: 'Đất Mũi Cà Mau rừng đước bạt ngàn!' },
  { code: 71, name: 'Bến Tre', specialty: 'Xứ Dừa Xanh Mát & Kẹo Dừa Bến Tre', chant: 'Bến Tre đồng khởi rợp bóng dừa xanh!' },
  { code: 72, name: 'Vũng Tàu', specialty: 'Hải Đăng Vũng Tàu & Biển Hồ Tràm', chant: 'Vũng Tàu sóng biển vỗ bờ cát vàng!' },
  { code: 75, name: 'Huế', specialty: 'Đại Nội Kinh Thành Huế & Sông Hương', chant: 'Cố đô Huế thơ mộng trầm mặc di sản!' },
  { code: 79, name: 'Khánh Hòa', specialty: 'Vịnh Nha Trang & Đảo Hòn Tre', chant: 'Nha Trang biển ngọc nắng vàng rực rỡ!' },
  { code: 81, name: 'Gia Lai', specialty: 'Biển Hồ Pleiku Đôi Mắt Tây Nguyên', chant: 'Phố núi Pleiku cao nguyên lộng gió!' },
  { code: 88, name: 'Vĩnh Phúc', specialty: 'Đỉnh Tam Đảo Mờ Sương & Tây Thiên', chant: 'Tam Đảo thị trấn trong mây tuyệt sắc!' },
  { code: 89, name: 'Hưng Yên', specialty: 'Phố Hiến Cổ Kính & Nhãn Lồng Tiến Vua', chant: 'Thứ nhất Kinh Kỳ, thứ nhì Phố Hiến!' },
  { code: 90, name: 'Hà Nam', specialty: 'Chùa Tam Chúc & Vũ Đại', chant: 'Hà Nam miền đất tâm linh non nước!' },
  { code: 92, name: 'Quảng Nam', specialty: 'Phố Cổ Hội An & Thánh Địa Mỹ Sơn', chant: 'Hội An đèn lồng lung linh sông Hoài!' },
  { code: 98, name: 'Bắc Giang', specialty: 'Chùa Vĩnh Nghiêm & Vải Thiều Lục Ngạn', chant: 'Bắc Giang vùng đất cổ kính nghĩa tình!' },
  { code: 99, name: 'Bắc Ninh', specialty: 'Dân Ca Quan Họ Kinh Bắc & Đền Đô', chant: 'Người ơi người ở đừng về Kinh Bắc!' },
];

const HAN_VIET_NAME_DICT = {
  minh: { meaning: 'Ánh sáng trí tuệ, thông tuệ và chính trực', aura: 'Kim Quang Tinh Anh' },
  anh: { meaning: 'Tinh hoa hội tụ, tài năng xuất chúng hơn người', aura: 'Ngọc Bích Chiếu Rọi' },
  tuan: { meaning: 'Khôi ngô tuấn tú, tài đức vẹn toàn', aura: 'Thiên Mã Vượt Mây' },
  hung: { meaning: 'Mạnh mẽ kiên cường, chí lớn mở mang đại nghiệp', aura: 'Thái Sơn Vững Chãi' },
  dung: { meaning: 'Dũng khí hiên ngang, dám nghĩ dám làm', aura: 'Hổ Phách Uy Phong' },
  thao: { meaning: 'Hiếu thảo dịu dàng, như cỏ thơm đón nắng xuân', aura: 'Thanh Mộc Trường Xuân' },
  lan: { meaning: 'Hoa lan vương giả, thanh tao và cao quý', aura: 'U Lan Quốc Sắc' },
  huong: { meaning: 'Hương thơm lan tỏa, lưu giữ phúc lành lâu dài', aura: 'Trầm Hương Cát Tường' },
  linh: { meaning: 'Tinh anh linh diệu, mang lại điềm lành may mắn', aura: 'Chuông Ngọc Ngân Vang' },
  ngoc: { meaning: 'Viên ngọc quý trong sáng, trân bảo giữa đời', aura: 'Bạch Ngọc Vô Giá' },
  bao: { meaning: 'Quốc bảo trân quý, luôn được yêu thương che chở', aura: 'Kim Bảo Hộ Thân' },
  nam: { meaning: 'Vững vàng hướng Nam, bản lĩnh trụ cột', aura: 'Nam Đẩu Tinh Quân' },
  hai: { meaning: 'Biển lớn bao la, tấm lòng rộng mở khoáng đạt', aura: 'Đại Dương Mênh Mông' },
  long: { meaning: 'Rồng thiêng bay lượn, quyền uy và thịnh vượng', aura: 'Thần Long Xuất Thế' },
  phuong: { meaning: 'Chim Phượng Hoàng cao quý, biểu tượng tái sinh rực rỡ', aura: 'Phượng Hoàng Lửa' },
  tam: { meaning: 'Trái tim nhân hậu, tâm sáng thì vạn sự thành', aura: 'Liên Hoa Tịnh Tâm' },
  an: { meaning: 'Bình an tự tại, đi tới đâu cũng gặp thuận hòa', aura: 'Thiên An Phúc Lộc' },
  khang: { meaning: 'An khang thịnh vượng, sức khỏe và phúc thọ dồi dào', aura: 'Trường Thọ Hoàng Kim' },
  thinh: { meaning: 'Phồn vinh hưng thịnh, tài lộc ngày càng nở rộ', aura: 'Vượng Khí Xung Thiên' },
  phat: { meaning: 'Phát đạt hanh thông, mở lối công danh rạng rỡ', aura: 'Kim Lộc Khai Hoa' },
  dat: { meaning: 'Thành đạt vẻ vang, chạm tới mọi mục tiêu lớn', aura: 'Đăng Khoa Bảng Vàng' },
  khoa: { meaning: 'Đỗ đạt khoa bảng, trí tuệ uyên bác', aura: 'Văn Xương Chiếu Mệnh' },
  vy: { meaning: 'Nhỏ nhắn thanh lịch nhưng ẩn chứa sức hút phi thường', aura: 'Tử Vi Tinh Tú' },
  my: { meaning: 'Vẻ đẹp hoàn mỹ, duyên dáng và phúc hậu', aura: 'Thiên Nga Ánh Tuyết' },
  trang: { meaning: 'Đoan trang thanh nhã, cốt cách đài các cao sang', aura: 'Ánh Trăng Thu Thủy' },
  quynh: { meaning: 'Đóa hoa quỳnh nở đêm, thuần khiết và độc bản', aura: 'Dạ Quỳnh Tỏa Sắc' },
  huyen: { meaning: 'Huyền diệu sâu sắc, nội tâm phong phú cuốn hút', aura: 'Huyền Ngọc Bí Ẩn' },
  khanh: { meaning: 'Tiếng khánh ngọc ngân vang, mang tin vui tốt lành', aura: 'Khánh Vàng Báo Hỷ' },
  duy: { meaning: 'Tư duy nhạy bén, giữ vững đạo lý và chữ tín', aura: 'Tinh Cầu Trí Tuệ' },
  kiet: { meaning: 'Hào kiệt xuất chúng, bản lĩnh dẫn đầu thời đại', aura: 'Kiếm Báu Tiên Phong' },
};

const PYTHAGORAS_MAP = {
  1: { title: 'Số 1 · Thủ Lĩnh Tiên Phong', career: 'Quản lý, Khởi nghiệp, Sáng tạo độc lập', trait: 'Quyết đoán, bản lĩnh dẫn đầu, tự chủ cao và luôn mở lối đi riêng.' },
  2: { title: 'Số 2 · Sứ Giả Hòa Giải & Kết Nối', career: 'Ngoại giao, Tư vấn, Nhân sự, Nghệ thuật', trait: 'Tinh tế, thấu cảm sâu sắc, trực giác nhạy bén và giỏi gắn kết tập thể.' },
  3: { title: 'Số 3 · Ngôi Sao Truyền Cảm Hứng', career: 'Truyền thông, Sáng tạo nội dung, Giải trí, Kinh doanh', trait: 'Hoạt ngôn, giàu năng lượng sáng tạo, đi tới đâu cũng lan tỏa niềm vui.' },
  4: { title: 'Số 4 · Kiến Trúc Sư Thực Thi', career: 'Kỹ thuật, Tài chính, Bất động sản, Vận hành hệ thống', trait: 'Chắc chắn, kỷ luật, đáng tin cậy và xây dựng nền móng tài sản cực vững.' },
  5: { title: 'Số 5 · Nhà Thám Hiểm Tự Do', career: 'Thương mại tự do, Du lịch, Marketing, Đổi mới sáng tạo', trait: 'Linh hoạt, bứt phá giới hạn, nhạy bén với các xu hướng mới trên thị trường.' },
  6: { title: 'Số 6 · Người Gieo Hạt Yêu Thương', career: 'Giáo dục, Y tế, Thẩm mỹ, Dịch vụ cao cấp', trait: 'Giàu lòng nhân ái, chu đáo, là điểm tựa vững chắc cho gia đình và đồng đội.' },
  7: { title: 'Số 7 · Bậc Thầy Chiến Lược & Tri Thức', career: 'Nghiên cứu, Công nghệ, Phân tích đầu tư, Chuyên gia', trait: 'Sâu sắc, thích tìm hiểu bản chất cốt lõi, càng trải nghiệm càng thành công lớn.' },
  8: { title: 'Số 8 · Nam Châm Tài Chính & Quyền Lực', career: 'Đầu tư, Doanh nhân, Ngân hàng, Điều hành doanh nghiệp', trait: 'Tư duy tài chính sắc sảo, có duyên làm chủ và thu hút dòng tiền lớn.' },
  9: { title: 'Số 9 · Đại Sứ Nhân Văn & Tầm Nhìn Lớn', career: 'Lãnh đạo cộng đồng, Nghệ thuật, Giáo dục, Từ thiện', trait: 'Bao dung, lý tưởng cao đẹp, được nhiều quý nhân kính trọng và nâng đỡ.' },
  11: { title: 'Số 11/2 · Master Trực Giác Tinh Hoa', career: 'Cố vấn chiến lược, Nghệ thuật sáng tạo, Huấn luyện', trait: 'Con số Master hiếm có với trực giác nhạy bén và sức hút truyền cảm hứng đặc biệt.' },
  22: { title: 'Số 22/4 · Master Kiến Tạo Đại Nghiệp', career: 'Tập đoàn lớn, Kiến trúc, Công nghệ, Đầu tư quy mô lớn', trait: 'Con số Vua Kiến Tạo: biến những tầm nhìn vĩ mô thành thành tựu thực tế bền vững.' },
};

const MYTH_PETS = [
  { species: 'Thần Long Hoàng Kim', element: 'Hệ Kim · Quang', rarity: 'SSR Thần Thoại', power: 9850, skill: 'Long Ngâm Chiêu Tài — Hút lộc bốn phương' },
  { species: 'Phượng Hoàng Niết Bàn', element: 'Hệ Hỏa · Dương', rarity: 'SSR Thần Thoại', power: 9720, skill: 'Cánh Lửa Tái Sinh — Đốt cháy mọi vận xui' },
  { species: 'Kỳ Lân Ngọc Bích', element: 'Hệ Mộc · Thổ', rarity: 'SSR Cực Hiếm', power: 9580, skill: 'Bước Chân Thụy Thú — Mang bình an & quý nhân' },
  { species: 'Hồ Ly Chín Đuôi Ánh Trăng', element: 'Hệ Thủy · Huyền', rarity: 'SR Quý Hiếm', power: 9340, skill: 'Hào Quang Đào Hoa — Thu hút nhân duyên & thiện cảm' },
  { species: 'Bạch Hổ Lôi Đình', element: 'Hệ Lôi · Kim', rarity: 'SR Quý Hiếm', power: 9290, skill: 'Tiếng Gầm Sấm Sét — Bứt phá công danh thần tốc' },
  { species: 'Huyền Vũ Trường Thọ', element: 'Hệ Thủy · Băng', rarity: 'SR Quý Hiếm', power: 9150, skill: 'Khiên Ngọc Vạn Niên — Bảo hộ sức khỏe & tài sản' },
];

export const TREND_PROJECTS = [
  {
    id: 1,
    slug: 'gieo-que',
    title: 'Tháp Kỳ Môn & Ống Xăm Ngọc 3D',
    subtitle: 'Giải Mã Năm Sinh · Can Chi · Ngũ Hành Nạp Âm',
    category: 'Tâm Linh · Phong Thủy',
    accent: '#f59e0b',
    secondary: '#ef4444',
    sceneType: 'oracle_tower',
    formatPrompt: '💬 Gõ NĂM SINH (VD: 1998, 2k3, 1995 Nữ) để xin quẻ!',
    microGiftPrompt: '🌹 Tặng 1 Hoa Hồng (1💎) mở Quẻ Đại Cát Hoàng Kim + Phượng Hoàng Lửa!',
    sampleComments: ['1998 Nam', '2003 Nữ', '1995 bình an', '2k1 xin quẻ tài lộc', '1992 Nam'],
    algorithmDesc: 'Thuật toán Can Chi 60 Hoa Giáp + Ngũ Hành Nạp Âm + Sao Hạn 2026 từ năm sinh người xem.',
    defaultCustomData: {
      ruleNote: 'Tự động bắt số năm sinh 1950–2025 hoặc dạng viết tắt 2k, 9x trong bình luận.',
      bonusBlessing: 'Quý nhân phù trợ bốn phương, tài lộc hanh thông suốt năm 2026',
      microGiftTitle: 'QUẺ ĐẠI CÁT HOÀNG KIM · PHƯỢNG HOÀNG HỘ MỆNH',
    },
  },
  {
    id: 2,
    slug: 'duyen-so',
    title: 'Tinh Cầu Nguyệt Lão 3D',
    subtitle: 'Thuật Toán Ghép Đôi Tên & Chấm Điểm Tình Duyên',
    category: 'Tình Yêu · Giới Trẻ',
    accent: '#ec4899',
    secondary: '#f43f5e',
    sceneType: 'love_sphere',
    formatPrompt: '💬 Gõ TÊN A + TÊN B (VD: Minh + Lan) để đo độ hợp nhau!',
    microGiftPrompt: '🌹 Tặng 1 Hoa Hồng (1💎) khắc Khóa Đồng Tâm Vàng 9999 + cộng 12% Duyên Số!',
    sampleComments: ['Minh + Lan', 'Hùng ❤️ Thảo', 'Tuấn với Mai', 'Hoàng và Ngọc', 'Khánh + Vy'],
    algorithmDesc: 'Thuật toán Âm Vận Học Tiếng Việt + Tổng Nét Chữ Cái & Ma Trận Tương Hợp Ngũ Hành.',
    defaultCustomData: {
      ruleNote: 'Tự động tách 2 tên qua dấu +, chữ "và", "với", "❤️" hoặc 2 tên liền nhau.',
      bonusBlessing: 'Tơ hồng Nguyệt Lão se duyên, trăm năm hạnh phúc viên mãn',
      microGiftTitle: 'KHÓA ĐỒNG TÂM VÀNG 9999 · TƠ HỒNG VĨNH CỬU',
    },
  },
  {
    id: 3,
    slug: 'than-so',
    title: 'Kim Tự Tháp Thần Số Học 3D',
    subtitle: 'Giải Mã Ngày Sinh Pythagoras & Con Số Chủ Đạo',
    category: 'Thần Số Học · Khám Phá',
    accent: '#8b5cf6',
    secondary: '#38bdf8',
    sceneType: 'numerology_pyramid',
    formatPrompt: '💬 Gõ NGÀY/THÁNG/NĂM SINH (VD: 26/05/1999) để tìm Số Chủ Đạo!',
    microGiftPrompt: '🌹 Tặng 1 Hoa Hồng (1💎) khai mở Mắt Thần Horus & Bản Đồ Tài Chính 2026!',
    sampleComments: ['26/05/1999', '15-08-2002', '12.10.1997', '08/03/2001', '19/11/1996'],
    algorithmDesc: 'Thuật toán cộng rút gọn Pythagoras chuẩn quốc tế (Số Chủ Đạo 1–9, Master 11, 22 & Năm Cá Nhân).',
    defaultCustomData: {
      ruleNote: 'Bắt định dạng DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY hoặc chuỗi 8 chữ số ngày sinh.',
      bonusBlessing: 'Năng lượng tần số vũ trụ mở lối thành công và tự do tài chính',
      microGiftTitle: 'ĐỈNH KIM TỰ THÁP ÁNH SÁNG · MẬT MÃ THỊNH VƯỢNG',
    },
  },
  {
    id: 4,
    slug: 'linh-thu',
    title: 'Đảo Trứng Thần Thoại 3D',
    subtitle: 'Ấp Linh Thú Bản Mệnh & Tiến Hóa Rồng Vàng',
    category: 'Game 3D · Nuôi Thú',
    accent: '#10b981',
    secondary: '#f59e0b',
    sceneType: 'dragon_egg',
    formatPrompt: '💬 Gõ "ẤP TRỨNG" hoặc tên của bạn để nhận Trứng Thần Thú 3D!',
    microGiftPrompt: '🌹 Tặng 1 Hoa Hồng (1💎) Phá Vỏ Nở Ngay Thần Long SSR Cấp Đại Đế!',
    sampleComments: ['Ấp trứng rồng lửa', 'Nuôi Kỳ Lân Ngọc', 'Ấp linh thú hệ lôi', 'Triệu hồi Phượng Hoàng', 'Ấp trứng SSR'],
    algorithmDesc: 'Thuật toán DNA Hash từ UID + từ khóa bình luận phân bổ Hệ Nguyên Tố, Độ Hiếm SSR/SR và Lực Chiến.',
    defaultCustomData: {
      ruleNote: 'Mỗi bình luận tạo hoặc nâng cấp Linh Thú theo tên người xem.',
      bonusBlessing: 'Thần thú hộ mệnh tăng 9.999 điểm may mắn và uy danh trên bảng xếp hạng',
      microGiftTitle: 'TIẾN HÓA THẦN LONG ĐẠI ĐẾ SSR · LỰC CHIẾN ×5',
    },
  },
  {
    id: 5,
    slug: 'dai-chien',
    title: 'Đại Chiến 63 Tỉnh Thành 3D',
    subtitle: 'Đua Cờ Vinh Quang Quê Hương & Biển Số Tự Hào',
    category: 'Cộng Đồng · Đua Top',
    accent: '#ef4444',
    secondary: '#eab308',
    sceneType: 'province_arena',
    formatPrompt: '💬 Gõ MÃ BIỂN SỐ hoặc TÊN TỈNH (VD: 36 Thanh Hóa, 29 Hà Nội, 59 Sài Gòn)!',
    microGiftPrompt: '🌹 Tặng 1 Hoa Hồng (1💎) bắn Pháo Thần Công +150 điểm đưa Tỉnh nhà lên Top 1!',
    sampleComments: ['36 Thanh Hóa mãi đỉnh', '37 Nghệ An điểm danh', '29 Hà Nội chào cả nhà', '59 Sài Gòn cố lên', '43 Đà Nẵng tuyệt vời'],
    algorithmDesc: 'Bộ nhận diện thông minh 63 Tỉnh Thành & Mã Biển Số 11–99 (có dấu và không dấu) + Bảng xếp hạng thời gian thực.',
    defaultCustomData: {
      ruleNote: 'Nhận diện mã số 11..99 hoặc tên tỉnh thành để cộng điểm dựng Cột Cờ 3D.',
      bonusBlessing: 'Tự hào quê hương Việt Nam 63 tỉnh thành đoàn kết tỏa sáng',
      microGiftTitle: 'PHÁO THẦN CÔNG HOÀNG KIM · +150 ĐIỂM TỈNH NHÀ',
    },
  },
  {
    id: 6,
    slug: 'giai-ma-ten',
    title: 'Ấn Triện Ngọc Bích Hoàng Gia 3D',
    subtitle: 'Chiết Tự Hán-Việt & Khắc Ấn Phong Thủy Theo Tên',
    category: 'Văn Hóa · Chiết Tự',
    accent: '#d97706',
    secondary: '#dc2626',
    sceneType: 'jade_seal',
    formatPrompt: '💬 Gõ HỌ TÊN của bạn (VD: Tên Minh Tuấn, Bảo Ngọc) để khắc Ấn Ngọc!',
    microGiftPrompt: '🌹 Tặng 1 Hoa Hồng (1💎) đúc Ấn Rồng Vàng Hoàng Đế & Chiếu Chỉ Vinh Danh!',
    sampleComments: ['Tên Minh Tuấn', 'Giải tên Bảo Ngọc', 'Nguyễn Thanh Tâm', 'Lê Hải Đăng', 'Trần Khánh Vy'],
    algorithmDesc: 'Từ điển chiết tự Hán-Việt 300+ tên Việt Nam kết hợp phân tích Âm Luật Bằng–Trắc & Ngũ Hành chữ cái đầu.',
    defaultCustomData: {
      ruleNote: 'Tách tên chính & tên đệm để giải mã cốt cách Hán-Việt và khắc lên Ấn Triện 3D.',
      bonusBlessing: 'Danh chính ngôn thuận, chữ tên mang vận quý nhân và phúc lộc bền lâu',
      microGiftTitle: 'ẤN NGỌC TRUYỀN QUỐC RỒNG VÀNG · CHIẾU CHỈ ĐẠI CÁT',
    },
  },
  {
    id: 7,
    slug: 'con-so-may-man',
    title: 'Vòng Quay Tinh Vân Cơ Khí 3D',
    subtitle: 'Chấm Điểm 4 Số Cuối SĐT, Biển Số & Con Số Hợp Mệnh',
    category: 'Phong Thủy Số · Kinh Dịch',
    accent: '#06b6d4',
    secondary: '#f59e0b',
    sceneType: 'nebula_wheel',
    formatPrompt: '💬 Gõ 4 SỐ CUỐI SĐT hoặc BIỂN SỐ (VD: 6868, 7939, 0912) để chấm điểm!',
    microGiftPrompt: '🌹 Tặng 1 Hoa Hồng (1💎) kích hoạt Lõi Tinh Vân Chiêu Tài & Bùa Số Đỏ!',
    sampleComments: ['6868', '7939', '0945', '1368', '8686'],
    algorithmDesc: 'Thuật toán 80 Số Linh Động Kinh Dịch ((4 số % 80) || 80) + Giải Mã Cặp Số Lộc Phát / Thần Tài.',
    defaultCustomData: {
      ruleNote: 'Trích xuất chuỗi 2–6 chữ số trong bình luận để tính quẻ Kinh Dịch 80 số.',
      bonusBlessing: 'Dãy số vượng khí chiêu tài, gọi lộc về ví và mở thông đường công danh',
      microGiftTitle: 'LÕI NĂNG LƯỢNG TINH VÂN · ĐẠI CÁT 10/10',
    },
  },
  {
    id: 8,
    slug: 'cay-tai-loc',
    title: 'Cây Kim Tiền Thần Tài 3D',
    subtitle: 'Rung Cây Hái Lộc Vàng 9999 & Nhả Vía Nổ Đơn',
    category: 'Kinh Doanh · Tài Lộc',
    accent: '#eab308',
    secondary: '#16a34a',
    sceneType: 'money_tree',
    formatPrompt: '💬 Gõ "XIN VÍA NỔ ĐƠN" hoặc NGÀNH NGHỀ của bạn để rung Cây Kim Tiền!',
    microGiftPrompt: '🌹 Tặng 1 Hoa Hồng (1💎) Nổ Hũ Mưa Thỏi Vàng 9999 & Cóc Thiềm Thừ Nhả Ngọc!',
    sampleComments: ['Xin vía nổ 100 đơn hôm nay', 'Shop mỹ phẩm xin vía buôn may bán đắt', 'Xin vía chốt khách BĐS', 'Cầu tài lộc tháng mới', 'Xin vía thuận buồm xuôi gió'],
    algorithmDesc: 'Bộ phân loại từ khóa Ngành Nghề Kinh Doanh + Tính Giờ Hoàng Đạo Mở Hàng & Chỉ Số Vượng Lộc.',
    defaultCustomData: {
      ruleNote: 'Phân tích từ khóa bán hàng, shop, BĐS, tài chính, công việc để trả lời đúng ngành nghề.',
      bonusBlessing: 'Khách vào nườm nượp, đơn đi mỏi tay, tiền về đầy két suốt tuần',
      microGiftTitle: 'MƯA KIM NGUYÊN BẢO 9999 · CÓC THẦN NHẢ LỘC',
    },
  },
  {
    id: 9,
    slug: 'be-ca-zen',
    title: 'Thủy Cung Cá Koi Vượt Vũ Môn 3D',
    subtitle: 'Thả Cá Cẩm Lý Cầu Thi Đỗ, Thăng Chức & Bình An',
    category: 'Thiền · Công Danh',
    accent: '#0ea5e9',
    secondary: '#f97316',
    sceneType: 'koi_sanctuary',
    formatPrompt: '💬 Gõ "THẢ CÁ + ĐIỀU ƯỚC" (VD: Thả cá thi đỗ, Thăng chức) để thả Cá Koi 3D!',
    microGiftPrompt: '🌹 Tặng 1 Hoa Hồng (1💎) giúp Cá Koi Vượt Thác Vũ Môn Hóa Rồng Vàng 3D!',
    sampleComments: ['Thả cá cầu đỗ đại học NV1', 'Thả cá cầu thăng chức tăng lương', 'Thả cá Koi vàng cầu gia đình bình an', 'Vượt vũ môn thành công', 'Thả cá cầu sức khỏe'],
    algorithmDesc: 'Thuật toán định danh dòng Cá Koi Cẩm Lý (Kohaku, Ogon, Tancho) + Tích điểm Vượt Vũ Môn Hóa Rồng.',
    defaultCustomData: {
      ruleNote: 'Nhận diện mong ước học hành, thi cử, thăng tiến hoặc bình an để gán dòng Cá Koi tương ứng.',
      bonusBlessing: 'Cá chép vượt vũ môn hóa rồng, bảng vàng đề danh, sự nghiệp thăng hoa',
      microGiftTitle: 'CÁ KOI HÓA RỒNG VÀNG VƯỢT VŨ MÔN 3D',
    },
  },
  {
    id: 10,
    slug: 'phao-hoa-sky',
    title: 'Đại Nhạc Hội Pháo Hoa & Drone 3D',
    subtitle: 'Bắn Tên Người Xem & Lời Chúc Lên Bầu Trời Đêm',
    category: 'Lễ Hội · Tương Tác Đỉnh Cao',
    accent: '#f43f5e',
    secondary: '#a855f7',
    sceneType: 'sky_fireworks',
    formatPrompt: '💬 Gõ LỜI CHÚC hoặc TÊN (VD: Chúc mừng sinh nhật Lan) để bắn lên trời đêm 3D!',
    microGiftPrompt: '🌹 Tặng 1 Hoa Hồng (1💎) bắn Đại Lễ Pháo Hoa 12 Quả + Đội Hình 500 Drone Xếp Tên!',
    sampleComments: ['Chúc mừng sinh nhật Minh Anh', 'Gia đình mình mãi hạnh phúc', 'Yêu thương cả nhà rất nhiều', 'Chúc buổi live đại thắng', 'Tuổi trẻ rực rỡ như pháo hoa'],
    algorithmDesc: 'Thuật toán phân tích chủ đề lời chúc (Sinh nhật, Tình yêu, Gia đình, Kỷ niệm) & Điều phối đội hình Drone 3D.',
    defaultCustomData: {
      ruleNote: 'Trích xuất tên người nhận & chủ đề lời chúc để hiển thị lên bầu trời 3D kèm pháo hoa.',
      bonusBlessing: 'Bầu trời đêm rực sáng tên bạn, chúc mọi ước nguyện đều thành hiện thực',
      microGiftTitle: 'ĐỘI HÌNH 500 DRONE HOÀNG KIM & ĐẠI PHÁO HOA VIP',
    },
  },
];

const PROJECT_ICONS = ['🔮', '💘', '🌌', '🐉', '⚔️', '📜', '🎰', '💰', '🐠', '🎆'];
const PROJECT_THEMES = ['gold', 'rose', 'violet', 'emerald', 'crimson', 'amber', 'cyan', 'lime', 'teal', 'indigo'];
const DEFAULT_LOOKUP_TABLES = {
  1: [
    '1998 = Tuổi Mậu Dần Thành Đầu Thổ: Năm 2026 mở vận tậu nhà, quý nhân phương Nam nâng đỡ | Đại Cát 98/100',
    '2001 = Tuổi Tân Tỵ Bạch Lạp Kim: Tháng 8 âm lịch bứt phá tài chính, tình duyên nở hoa | Thượng Cát 96/100',
    '2003 = Tuổi Quý Mùi Dương Liễu Mộc: Thi cử đỗ đạt, công việc thăng tiến vượt bậc | Đại Cát 97/100',
    '1995 = Tuổi Ất Hợi Sơn Đầu Hỏa: Lộc kinh doanh hồng phát, gia đạo viên mãn | Đại Cát 98/100',
  ].join('\n'),
  2: [
    'minh + lan = Cặp đôi Kim - Mộc tương trợ, cưới nhau về tiền vào như nước | Hợp 99%',
    'hung + thao = Duyên tiền định 3 kiếp, sóng gió nào cũng nắm tay vượt qua | Hợp 98%',
    'tuan + mai = Tâm đầu ý hợp, năm 2026 có tin vui hỷ sự | Hợp 97%',
  ].join('\n'),
  3: [
    '26/05/1999 = Số Chủ Đạo 8 Nam Châm Tài Chính: Năm 2026 bùng nổ doanh thu và cơ hội làm chủ | Đỉnh Cao 99%',
    '15/08/2001 = Số Chủ Đạo 8 Quyền Lực: Quý 3/2026 mở rộng sự nghiệp, quý nhân dẫn lối | Vượng Phát 97%',
    '08/03/2001 = Số Chủ Đạo 6 Yêu Thương: Gia đạo viên mãn, tài chính tích lũy bền vững | Cát Tường 96%',
  ].join('\n'),
  4: [
    'rong lua = Triệu hồi Hỏa Long Viêm Đế SSR: Hộ mệnh công danh rực sáng bốn phương | Lực Chiến 9999',
    'ky lan = Triệu hồi Kỳ Lân Ngọc Bích SSR: Mang bình an và lộc quý nhân | Lực Chiến 9750',
    'thanh long = Triệu hồi Thanh Long Hoàng Kim SSR: Đứng đầu bảng vàng thần thú | Lực Chiến 9999',
  ].join('\n'),
  5: [
    '36 = Quê hương 36 Thanh Hóa địa linh nhân kiệt, hào khí Lam Sơn dẫn đầu bảng vàng | +200 Điểm',
    '37 = Quê hương 37 Nghệ An ân tình sâu nặng, núi Hồng sông La rạng danh | +200 Điểm',
    '29 = Thủ đô 29 Hà Nội ngàn năm văn hiến, trái tim cả nước tỏa sáng | +200 Điểm',
    '59 = Thành phố 59 Sài Gòn năng động nghĩa tình, hòn ngọc Viễn Đông bứt phá | +200 Điểm',
  ].join('\n'),
  6: [
    'minh tuan = Chữ Minh là trí tuệ sáng ngời, chữ Tuấn là hào kiệt xuất chúng | Ấn Rồng Vàng 99/100',
    'bao ngoc = Chữ Bảo là quốc bảo trân quý, chữ Ngọc là viên ngọc sáng vô giá | Ấn Phượng Hoàng 99/100',
    'khanh vy = Chữ Khánh là tiếng chuông báo hỷ, chữ Vy là thanh tao quý phái | Ấn Ngọc Bích 98/100',
  ].join('\n'),
  7: [
    '6868 = Cặp đại thần tài Lộc Phát - Lộc Phát: Tiền tài nhân đôi, vạn sự đại cát | 10/10 Điểm',
    '7939 = Ông Địa Lớn kết hợp Thần Tài Nhỏ: Khai trương hồng phát, giữ đất giữ vàng | 10/10 Điểm',
    '8686 = Phát Lộc Song Hành: Dãy số vượng khí bậc nhất cho người kinh doanh | 10/10 Điểm',
  ].join('\n'),
  8: [
    'no 100 don = Cây Kim Tiền rụng 100 thỏi vàng Kim Nguyên Bảo: Hôm nay đơn đi mỏi tay | Lộc Đỉnh 9999',
    'my pham = Ngành làm đẹp & mỹ phẩm gặp vận Đào Hoa Lộc: Khách cũ quay lại, khách mới chốt nhanh | Vượng Lộc 98%',
    'bds = Ngành Bất Động Sản gặp vận Thổ Sinh Kim: Chốt giao dịch lớn trong tháng | Đại Lộc 99%',
  ].join('\n'),
  9: [
    'do dai hoc = Cá Koi Tancho Đỏ Trắng nhảy qua Vũ Môn: Đỗ Nguyện Vọng 1 điểm cao chót vót | Hóa Rồng 100%',
    'thang chuc = Cá Koi Ogon Hoàng Kim vượt thác: Thăng chức tăng lương ngay quý tới | Hóa Rồng 99%',
    'binh an = Cá Koi Kohaku Trường Thọ: Gia đình mạnh khỏe, tâm an vạn sự lành | An Lạc 99%',
  ].join('\n'),
  10: [
    'sinh nhat = Đội hình 500 Drone xếp hình Bánh Kem & Vương Miện Vàng chúc mừng tuổi mới rực rỡ | Pháo Hoa VIP',
    'hanh phuc = Đội hình 500 Drone xếp Trái Tim Đôi Ngân Hà chúc gia đình trăm năm hạnh phúc | Pháo Hoa Đại Lễ',
    'dai thang = Đội hình 500 Drone xếp Ngôi Sao Chiến Thắng rực sáng bầu trời đêm | Pháo Hoa Hoàng Kim',
  ].join('\n'),
};

for (let i = 0; i < TREND_PROJECTS.length; i++) {
  const p = TREND_PROJECTS[i];
  p.index = p.id;
  p.code = `TREND-${String(p.id).padStart(2, '0')}`;
  p.icon = PROJECT_ICONS[i] || '✨';
  p.theme = PROJECT_THEMES[i] || 'gold';
  p.name = p.title;
  p.shortName = p.title.replace(/\s*3D$/i, '');
  p.tagline = p.subtitle;
  p.sceneMode = p.sceneType;
  p.defaultCustomData.customLookupText = DEFAULT_LOOKUP_TABLES[p.id] || '';
}

export function parseCustomLookupTable(rawTableText = '') {
  const rows = [];
  const lines = String(rawTableText || '').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const eqIdx = trimmed.indexOf('=');
    const keyRaw = trimmed.slice(0, eqIdx).trim();
    const rest = trimmed.slice(eqIdx + 1).trim();
    if (!keyRaw || !rest) continue;
    const [answerRaw, metricRaw] = rest.split('|').map(s => s.trim());
    rows.push({
      patternRaw: keyRaw,
      patternFolded: foldVi(keyRaw),
      answer: answerRaw || rest,
      metric: metricRaw || 'Khớp Kho Data',
    });
  }
  return rows;
}

export function findCustomLookupMatch(rawComment = '', rawTableText = '') {
  const foldedComment = foldVi(rawComment);
  if (!foldedComment) return null;
  const rows = parseCustomLookupTable(rawTableText);
  for (const row of rows) {
    if (!row.patternFolded) continue;
    if (foldedComment === row.patternFolded || foldedComment.includes(row.patternFolded)) {
      return row;
    }
  }
  return null;
}

export function foldVi(str = '') {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function hashStr(str = '') {
  let h = 2166136261;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// ============================================================================
// DETERMINISTIC COMMENT FORMAT DETECTOR (FOR INSIGHT AGGREGATION & ROUTING)
// ============================================================================
export function detectCommentFormat(rawText = '') {
  const text = String(rawText || '').trim();
  const folded = foldVi(text);

  // 1. Full Birth Date: DD/MM/YYYY or DD-MM-YYYY
  const dateMatch = /(\b\d{1,2})[\/.\-](\d{1,2})[\/.\-](19\d{2}|20\d{2}|\d{2}\b)/.exec(text);
  if (dateMatch) {
    return {
      format: 'birth_date',
      label: 'Ngày/Tháng/Năm Sinh (DD/MM/YYYY)',
      recommendedTrendId: 3,
      extracted: dateMatch[0],
    };
  }

  // 2. Couple Names: A + B, A va B, A ❤️ B
  const coupleMatch = /^([a-zA-ZÀ-ỹ\s]{2,18})\s*(?:\+|❤️|💕|💖|&|\bvà\b|\bva\b|\bvới\b|\bvoi\b|\byêu\b|\byeu\b)\s*([a-zA-ZÀ-ỹ\s]{2,18})$/i.exec(text);
  if (coupleMatch) {
    return {
      format: 'couple_names',
      label: 'Ghép Đôi 2 Tên (Tên A + Tên B)',
      recommendedTrendId: 2,
      extracted: `${coupleMatch[1].trim()} ❤️ ${coupleMatch[2].trim()}`,
    };
  }

  // 3. Birth Year: 1950..2025 or 2k1..2k12
  const yearMatch = /\b(19[5-9]\d|20[0-2]\d|2k\d{1,2})\b/i.exec(text);
  if (yearMatch) {
    return {
      format: 'birth_year',
      label: 'Năm Sinh & Bản Mệnh (19xx / 2k)',
      recommendedTrendId: 1,
      extracted: yearMatch[1],
    };
  }

  // 4. Province Code / Province Name
  for (const p of PROVINCES_63_MAP) {
    const fName = foldVi(p.name);
    const codeRegex = new RegExp(`\\b${p.code}\\b`);
    if (folded.includes(fName) || (codeRegex.test(text) && text.length <= 18)) {
      return {
        format: 'province_code',
        label: 'Mã Biển Số / 63 Tỉnh Thành',
        recommendedTrendId: 5,
        extracted: `${p.code} ${p.name}`,
      };
    }
  }

  // 5. Lucky 3-6 Digits (Phone tail / License plate)
  const digitsMatch = /\b(\d{3,6})\b/.exec(text);
  if (digitsMatch) {
    return {
      format: 'lucky_digits',
      label: '4 Số Cuối SĐT / Con Số May Mắn',
      recommendedTrendId: 7,
      extracted: digitsMatch[1],
    };
  }

  // 6. Business / Sales / Wealth Wish ("xin vía", "nổ đơn", "buôn may", "tài lộc")
  if (/(xin via|no don|buon may|ban dat|tai loc|phat tai|mo hang|chot don|khach)/i.test(folded)) {
    return {
      format: 'business_wish',
      label: 'Xin Vía Nổ Đơn / Tài Lộc Kinh Doanh',
      recommendedTrendId: 8,
      extracted: text.slice(0, 32),
    };
  }

  // 7. Koi / Exam / Career Promotion ("thả cá", "vượt vũ môn", "thi đỗ", "thăng chức")
  if (/(tha ca|vuot vu mon|thi do|do dai hoc|thang chuc|cong danh|ca koi)/i.test(folded)) {
    return {
      format: 'exam_career',
      label: 'Thả Cá Cầu Thi Đỗ / Công Danh',
      recommendedTrendId: 9,
      extracted: text.slice(0, 32),
    };
  }

  // 8. Pet Hatching ("ấp trứng", "nuôi", "linh thú", "rồng")
  if (/(ap trung|linh thu|than thu|nuoi rong|thanh long|phuong hoang|ky lan|bach ho|ho ly)/i.test(folded)) {
    return {
      format: 'myth_pet',
      label: 'Ấp Trứng Linh Thú 3D',
      recommendedTrendId: 4,
      extracted: text.slice(0, 32),
    };
  }

  // 9. Celebration / Birthday / Fireworks ("chúc mừng", "sinh nhật", "pháo hoa")
  if (/(chuc mung|sinh nhat|phao hoa|happy birthday|ky niem|yeu thương)/i.test(folded)) {
    return {
      format: 'celebration',
      label: 'Lời Chúc / Sinh Nhật Pháo Hoa 3D',
      recommendedTrendId: 10,
      extracted: text.slice(0, 32),
    };
  }

  // 10. Name Meaning ("tên ...", or 1-4 words name)
  return {
    format: 'full_name',
    label: 'Giải Mã Tên Gọi / Tương Tác Chung',
    recommendedTrendId: 6,
    extracted: text.slice(0, 28) || 'Khách Quý',
  };
}

// ============================================================================
// 10 DETERMINISTIC ALGORITHMS (NO AI / 100% DATA-DRIVEN)
// ============================================================================
function runAlgorithm1Oracle({ name, text, isMicroGift, customData }) {
  const yearMatch = /\b(19[5-9]\d|20[0-2]\d|2k(\d{1,2}))\b/i.exec(text);
  let birthYear = 1998;
  if (yearMatch) {
    if (yearMatch[1].toLowerCase().startsWith('2k')) {
      const tail = Number(yearMatch[2] || 0);
      birthYear = 2000 + tail;
    } else {
      birthYear = Number(yearMatch[1]);
    }
  } else {
    birthYear = 1986 + (hashStr(name + text) % 24);
  }
  const can = CAN_LIST[birthYear % 10];
  const chi = CHI_LIST[birthYear % 12];
  const animal = ZODIAC_ANIMALS[birthYear % 12];
  const napAm = NAP_AM_ELEMENTS[Math.floor(((birthYear - 4) % 60 + 60) % 60 / 2) % NAP_AM_ELEMENTS.length];
  const gender = /nu|nữ/i.test(text) ? 'Nữ mạng' : /nam/i.test(text) ? 'Nam mạng' : 'Bản mệnh';
  const luckScore = isMicroGift ? 99 : 86 + (hashStr(`${name}:${birthYear}`) % 13);
  const fortuneTier = isMicroGift ? (customData?.microGiftTitle || 'QUẺ ĐẠI CÁT HOÀNG KIM') : 'QUẺ THƯỢNG CÁT BÌNH AN';

  const headline = `${can} ${chi} ${birthYear} (${gender}) · ${napAm.title}`;
  const replyText = `${fortuneTier}: ${name} tuổi ${can} ${chi} (${animal}), mệnh ${napAm.element}. Màu vượng: ${napAm.color} · Số hợp: ${napAm.luckyNums}. ${napAm.advice} (${customData?.bonusBlessing || ''})`;
  const speechText = `${isMicroGift ? 'Cảm ơn bông hoa hồng lộc phát! Mở quẻ Đại Cát Hoàng Kim cho ' : 'Quẻ xăm linh ứng cho '}${name}, tuổi ${can} ${chi} ${birthYear}, mệnh ${napAm.title}. ${napAm.advice}`;

  return {
    matchedFormat: `Năm sinh ${birthYear} (${can} ${chi})`,
    badge: `🔮 ${fortuneTier} · ${luckScore}/100`,
    headline,
    replyText,
    speechText,
    metrics: [
      { label: 'Tuổi Can Chi', value: `${can} ${chi} (${birthYear})` },
      { label: 'Ngũ Hành Nạp Âm', value: napAm.element },
      { label: 'Màu Hợp Mệnh', value: napAm.color },
      { label: 'Điểm Vượng Khí', value: `${luckScore}/100` },
    ],
    visual3d: { primaryColor: isMicroGift ? 0xfacc15 : 0xf59e0b, label3d: `${name} · ${can} ${chi}`, burstPower: isMicroGift ? 3 : 1 },
  };
}

function runAlgorithm2Love({ name, text, isMicroGift, customData }) {
  const m = /([a-zA-ZÀ-ỹ\s]{2,16})\s*(?:\+|❤️|💕|💖|&|\bvà\b|\bva\b|\bvới\b|\bvoi\b|\byêu\b|\byeu\b)\s*([a-zA-ZÀ-ỹ\s]{2,16})/i.exec(text);
  const nameA = (m ? m[1] : name).trim().slice(0, 16) || name;
  const nameB = (m ? m[2] : 'Người Ấy').trim().slice(0, 16) || 'Người Ấy';
  const pairSeed = hashStr(foldVi(nameA) + '::' + foldVi(nameB));
  const basePct = 74 + (pairSeed % 22);
  const finalPct = Math.min(100, isMicroGift ? Math.max(96, basePct + 12) : basePct);
  const harmony = 78 + ((pairSeed >> 3) % 21);
  const romance = 80 + ((pairSeed >> 5) % 20);

  const verdicts = [
    'Tâm Đầu Ý Hợp · Duyên Tiền Định Ba Đời',
    'Tương Sinh Vượng Khí · Càng Gắn Bó Càng Giàu Sang',
    'Tri Kỷ Đồng Hành · Nắm Tay Vượt Mọi Sóng Gió',
    'Ngọt Ngào Như Mật · Sợi Chỉ Đỏ Nguyệt Lão Đã Se',
  ];
  const verdict = verdicts[pairSeed % verdicts.length];
  const headline = `${nameA} ❤️ ${nameB} · Độ Hợp: ${finalPct}%`;
  const replyText = `${verdict}! Chỉ số ăn ý ${harmony}% · Lãng mạn ${romance}%. ${isMicroGift ? (customData?.microGiftTitle || 'Đã khóa Khóa Đồng Tâm Vàng 9999!') : (customData?.bonusBlessing || '')}`;
  const speechText = `${isMicroGift ? 'Tuyệt vời! Khóa Đồng Tâm Vàng đã khắc tên ' : 'Quả cầu Nguyệt Lão chấm điểm duyên số cho '}${nameA} và ${nameB} đạt ${finalPct} phần trăm, ${verdict}.`;

  return {
    matchedFormat: `${nameA} ❤️ ${nameB}`,
    badge: `💘 Hợp Nhau ${finalPct}%`,
    headline,
    replyText,
    speechText,
    metrics: [
      { label: 'Cặp Đôi', value: `${nameA} ❤️ ${nameB}` },
      { label: 'Độ Hợp Duyên Số', value: `${finalPct}%` },
      { label: 'Tâm Đầu Ý Hợp', value: `${harmony}%` },
      { label: 'Quẻ Nguyệt Lão', value: verdict.split('·')[0].trim() },
    ],
    visual3d: { primaryColor: isMicroGift ? 0xfbbf24 : 0xec4899, label3d: `${nameA} ❤️ ${nameB} (${finalPct}%)`, burstPower: isMicroGift ? 3 : 1 },
  };
}

function runAlgorithm3Numerology({ name, text, isMicroGift, customData }) {
  const digits = String(text || '').replace(/\D+/g, '');
  let sum = 0;
  if (digits.length >= 4) {
    for (const ch of digits) sum += Number(ch);
  } else {
    sum = 10 + (hashStr(name + text) % 28);
  }
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split('').reduce((a, b) => a + Number(b), 0);
  }
  if (sum < 1) sum = 8;
  const info = PYTHAGORAS_MAP[sum] || PYTHAGORAS_MAP[8];
  const personalYear = ((sum + 2 + 0 + 2 + 6 - 1) % 9) + 1;
  const headline = `${name} · ${info.title}`;
  const replyText = `Thần Số Học Pythagoras: ${info.trait} Ngành nghề vượng: ${info.career}. Năm cá nhân 2026: Số ${personalYear} (${customData?.bonusBlessing || ''}).`;
  const speechText = `${isMicroGift ? 'Tia sáng đỉnh Kim Tự Tháp Hoàng Kim mở khóa cho ' : 'Kim Tự Tháp Thần Số Học giải mã cho '}${name} mang ${info.title}. ${info.trait}`;

  return {
    matchedFormat: digits.length >= 4 ? `Ngày sinh (${digits})` : `Tần số tên (${name})`,
    badge: `🌌 Số Chủ Đạo ${sum} · Năm Cá Nhân ${personalYear}`,
    headline,
    replyText,
    speechText,
    metrics: [
      { label: 'Con Số Chủ Đạo', value: `Số ${sum}` },
      { label: 'Năm Cá Nhân 2026', value: `Năm số ${personalYear}` },
      { label: 'Ngành Nghề Hợp', value: info.career.split(',')[0] },
      { label: 'Trạng Thái', value: isMicroGift ? 'Mắt Thần Horus VIP' : 'Đã Kích Hoạt' },
    ],
    visual3d: { primaryColor: isMicroGift ? 0xfacc15 : 0x8b5cf6, label3d: `Số ${sum} · ${name}`, burstPower: isMicroGift ? 3 : 1 },
  };
}

function runAlgorithm4MythPet({ name, text, isMicroGift, customData }) {
  const h = hashStr(foldVi(name) + '::' + foldVi(text));
  const pet = isMicroGift ? MYTH_PETS[0] : MYTH_PETS[h % MYTH_PETS.length];
  const stageLabel = isMicroGift ? 'Thần Thú Đại Đế Cấp Tối Thượng' : 'Linh Thú Thức Tỉnh Cấp 1';
  const power = isMicroGift ? pet.power * 5 : pet.power + (h % 650);
  const headline = `${name} triệu hồi: ${pet.species} (${pet.rarity})`;
  const replyText = `${stageLabel} · ${pet.element} · Lực chiến: ${power.toLocaleString('vi-VN')}. Tuyệt kỹ: ${pet.skill}. ${customData?.bonusBlessing || ''}`;
  const speechText = `${isMicroGift ? 'Tiến hóa thần tốc! Trứng rồng của ' : 'Chúc mừng '}${name} vừa ấp nở thành công ${pet.species}, phẩm chất ${pet.rarity}, lực chiến ${power} điểm!`;

  return {
    matchedFormat: `Ấp Linh Thú (${pet.species})`,
    badge: `🐉 ${pet.rarity} · ⚡${power.toLocaleString('vi-VN')}`,
    headline,
    replyText,
    speechText,
    metrics: [
      { label: 'Linh Thú Bản Mệnh', value: pet.species },
      { label: 'Hệ Nguyên Tố', value: pet.element },
      { label: 'Phẩm Chất', value: pet.rarity },
      { label: 'Lực Chiến 3D', value: power.toLocaleString('vi-VN') },
    ],
    visual3d: { primaryColor: isMicroGift ? 0xfacc15 : 0x10b981, label3d: `🐉 ${pet.species} (${name})`, burstPower: isMicroGift ? 3 : 1 },
  };
}

function runAlgorithm5ProvinceArena({ name, text, isMicroGift, customData, provinceScores }) {
  const folded = foldVi(text);
  let matchedProv = null;
  for (const p of PROVINCES_63_MAP) {
    const fName = foldVi(p.name);
    const codeRe = new RegExp(`\\b${p.code}\\b`);
    if (folded.includes(fName) || codeRe.test(text)) {
      matchedProv = p;
      break;
    }
  }
  if (!matchedProv) {
    matchedProv = PROVINCES_63_MAP[hashStr(name + text) % PROVINCES_63_MAP.length];
  }
  const addPts = isMicroGift ? 150 : 10;
  const curPts = (provinceScores.get(matchedProv.code) || 0) + addPts;
  provinceScores.set(matchedProv.code, curPts);

  const headline = `🇻🇳 ${matchedProv.code} ${matchedProv.name} (+${addPts} điểm) · Tổng: ${curPts} điểm`;
  const replyText = `${name} tiếp lửa cho ${matchedProv.name} (${matchedProv.specialty})! "${matchedProv.chant}" · Tổng điểm cờ tỉnh: ${curPts}. ${isMicroGift ? (customData?.microGiftTitle || '') : ''}`;
  const speechText = `${isMicroGift ? 'Pháo thần công khai hỏa! ' : ''}${name} vừa cộng ${addPts} điểm cho quê hương ${matchedProv.code} ${matchedProv.name}. ${matchedProv.chant}`;

  return {
    matchedFormat: `Tỉnh ${matchedProv.code} · ${matchedProv.name}`,
    badge: `⚔️ Biển số ${matchedProv.code} · +${addPts} điểm`,
    headline,
    replyText,
    speechText,
    metrics: [
      { label: 'Tỉnh Thành', value: `${matchedProv.code} ${matchedProv.name}` },
      { label: 'Điểm Vừa Cộng', value: `+${addPts} điểm` },
      { label: 'Tổng Điểm Tỉnh', value: `${curPts} điểm` },
      { label: 'Đặc Sản / Biểu Tượng', value: matchedProv.specialty.split('&')[0].trim() },
    ],
    visual3d: { primaryColor: isMicroGift ? 0xfacc15 : 0xef4444, label3d: `🇻🇳 ${matchedProv.code} ${matchedProv.name} (${curPts}đ)`, burstPower: isMicroGift ? 3 : 1 },
  };
}

function runAlgorithm6JadeSeal({ name, text, isMicroGift, customData }) {
  const cleaned = String(text || '')
    .replace(/^(ten|tên|giai ten|giải tên|khac an|khắc ấn)\s+/i, '')
    .trim();
  const targetName = (cleaned.length >= 2 && cleaned.length <= 24 ? cleaned : name).trim();
  const parts = targetName.split(/\s+/).filter(Boolean);
  const givenName = parts[parts.length - 1] || targetName;
  const key = foldVi(givenName);
  const dictEntry = HAN_VIET_NAME_DICT[key] || {
    meaning: 'Bản lĩnh thanh cao, tâm sáng chí bền, đi tới đâu cũng có quý nhân tương trợ',
    aura: 'Kim Ngọc Cát Tường',
  };
  const sealType = isMicroGift ? 'Ấn Ngọc Truyền Quốc Rồng Vàng 9999' : 'Ấn Ngọc Bích Hoàng Gia';
  const headline = `📜 Ấn Triện "${targetName.toUpperCase()}" · ${dictEntry.aura}`;
  const replyText = `Chiết tự tên "${givenName}": ${dictEntry.meaning}. Đã đóng ${sealType} lên Chiếu Chỉ Vàng! (${customData?.bonusBlessing || ''})`;
  const speechText = `${isMicroGift ? 'Khắc Ấn Ngọc Rồng Vàng Hoàng Đế cho ' : 'Chiết tự ý nghĩa tên '}${targetName}: chữ ${givenName} mang hào quang ${dictEntry.aura}, nghĩa là ${dictEntry.meaning}.`;

  return {
    matchedFormat: `Tên gọi: ${targetName}`,
    badge: `📜 ${dictEntry.aura}`,
    headline,
    replyText,
    speechText,
    metrics: [
      { label: 'Chủ Nhân Ấn Ngọc', value: targetName },
      { label: 'Chữ Tâm Điểm', value: givenName.toUpperCase() },
      { label: 'Hào Quang Tên', value: dictEntry.aura },
      { label: 'Cấp Ấn Triện', value: isMicroGift ? 'Ấn Rồng Vàng VIP' : 'Ấn Ngọc Bích' },
    ],
    visual3d: { primaryColor: isMicroGift ? 0xfacc15 : 0xd97706, label3d: `📜 ${targetName.toUpperCase()}`, burstPower: isMicroGift ? 3 : 1 },
  };
}

function runAlgorithm7LuckyDigits({ name, text, isMicroGift, customData }) {
  const m = /\b(\d{2,6})\b/.exec(text);
  const numStr = m ? m[1] : String(1000 + (hashStr(name + text) % 8999));
  const numVal = Number(numStr);
  const que80 = (numVal % 80) || 80;
  const score = isMicroGift ? '10.0/10' : `${(8.6 + (que80 % 14) * 0.1).toFixed(1)}/10`;

  let pairMeaning = 'Vượng Khí Sinh Tài · Tiến Bước Vững Vàng';
  if (/68|86/.test(numStr)) pairMeaning = 'Cặp Số Lộc Phát Đại Cát (68/86) · Tiền Tài Nở Rộ';
  else if (/39|79/.test(numStr)) pairMeaning = 'Cặp Số Thần Tài Gõ Cửa (39/79) · Quý Nhân Đỡ Đầu';
  else if (/88|99/.test(numStr)) pairMeaning = 'Song Phát Trường Cửu (88/99) · Vững Bền Đại Nghiệp';
  else if (/56|65/.test(numStr)) pairMeaning = 'Sinh Lộc Hòa Hợp (56/65) · Gia Đạo & Tài Chính Thuận Hòa';

  const headline = `🎰 Số ${numStr} (Quẻ Lý Số #${que80}/80) · Điểm: ${score}`;
  const replyText = `${pairMeaning}! Chủ nhân ${name} sở hữu dãy số ${numStr} đạt ${score} điểm phong thủy. ${isMicroGift ? (customData?.microGiftTitle || '') : (customData?.bonusBlessing || '')}`;
  const speechText = `${isMicroGift ? 'Kích hoạt Lõi Tinh Vân Vàng 10 trên 10! ' : ''}Chấm điểm con số ${numStr} của ${name} ứng với quẻ số ${que80}, đạt ${score} điểm: ${pairMeaning}.`;

  return {
    matchedFormat: `Dãy số ${numStr}`,
    badge: `🎰 Điểm Phong Thủy ${score}`,
    headline,
    replyText,
    speechText,
    metrics: [
      { label: 'Dãy Số Phân Tích', value: numStr },
      { label: 'Quẻ Kinh Dịch', value: `Quẻ #${que80}/80` },
      { label: 'Điểm Năng Lượng', value: score },
      { label: 'Luận Giải Nhanh', value: pairMeaning.split('·')[0].trim() },
    ],
    visual3d: { primaryColor: isMicroGift ? 0xfacc15 : 0x06b6d4, label3d: `🎰 ${numStr} (${score})`, burstPower: isMicroGift ? 3 : 1 },
  };
}

function runAlgorithm8MoneyTree({ name, text, isMicroGift, customData }) {
  const folded = foldVi(text);
  let sector = 'Kinh Doanh & Sự Nghiệp';
  let goldenHour = '08:00 – 10:00 & 14:00 – 16:00';
  if (/(shop|my pham|quan ao|thoi trang|online|tiktok)/.test(folded)) {
    sector = 'Thương Mại Điện Tử & Shop Online';
    goldenHour = '09:00 – 11:00 & 20:00 – 22:00 (Giờ Vàng Chốt Đơn)';
  } else if (/(bds|bat dong san|nha dat|tai chinh|chung khoan|dau tu)/.test(folded)) {
    sector = 'Bất Động Sản & Đầu Tư Tài Chính';
    goldenHour = '08:30 – 10:30 & 15:00 – 17:00 (Giờ Vàng Ký Hợp Đồng)';
  } else if (/(quan an|ca phe|nha hang|tra sua|f&b)/.test(folded)) {
    sector = 'Ẩm Thực & Dịch Vụ Khách Hàng';
    goldenHour = '07:00 – 09:00 & 18:00 – 21:00 (Giờ Vàng Đông Khách)';
  }
  const ordersTarget = isMicroGift ? 999 : 68 + (hashStr(name + text) % 120);
  const headline = `💰 Nhả Vía Lộc Phát cho ${name} (${sector})`;
  const replyText = `Cây Kim Tiền 3D rụng lộc vàng! Chúc ${name} bùng nổ +${ordersTarget} đơn/cơ hội lớn. Giờ hoàng đạo mở hàng: ${goldenHour}. ${customData?.bonusBlessing || ''}`;
  const speechText = `${isMicroGift ? 'Nổ hũ mưa thỏi vàng 9999! Cóc thần nhả ngọc chúc ' : 'Cây Kim Tiền Thần Tài nhả vía cho '}${name} ngành ${sector} buôn may bán đắt, bùng nổ ${ordersTarget} đơn lộc phát!`;

  return {
    matchedFormat: `Xin vía (${sector})`,
    badge: `💰 Lộc Phát +${ordersTarget} Đơn`,
    headline,
    replyText,
    speechText,
    metrics: [
      { label: 'Chủ Nhân Hái Lộc', value: name },
      { label: 'Lĩnh Vực Vượng', value: sector },
      { label: 'Giờ Vàng Mở Hàng', value: goldenHour.split('(')[0].trim() },
      { label: 'Lộc Vàng Rơi', value: isMicroGift ? 'Mưa Kim Nguyên Bảo 9999' : `+${ordersTarget} Xu Vàng` },
    ],
    visual3d: { primaryColor: isMicroGift ? 0xfef08a : 0xeab308, label3d: `💰 ${name} (+${ordersTarget} Lộc)`, burstPower: isMicroGift ? 3 : 1 },
  };
}

function runAlgorithm9KoiSanctuary({ name, text, isMicroGift, customData }) {
  const koiTypes = [
    { name: 'Cá Koi Ogon Hoàng Kim', goal: 'Thăng Quan Tiến Chức · Tài Lộc Rực Rỡ' },
    { name: 'Cá Koi Kohaku Đỏ Trắng', goal: 'Thi Cử Đỗ Đạt · Bảng Vàng Đề Danh' },
    { name: 'Cá Koi Tancho Đỉnh Hồng', goal: 'Đứng Đầu Khoa Bảng · Quý Nhân Nâng Đỡ' },
    { name: 'Cá Koi Bạch Ngọc Liên Hoa', goal: 'Tâm An Trí Sáng · Gia Đạo Thuận Hòa' },
  ];
  const idx = hashStr(name + text) % koiTypes.length;
  const koi = isMicroGift ? { name: 'Thần Long Cá Chép Hóa Rồng 9999', goal: 'Vượt Vũ Môn Hóa Rồng · Đỉnh Cao Danh Vọng' } : koiTypes[idx];
  const progressPct = isMicroGift ? 100 : 75 + (hashStr(text) % 24);
  const headline = `🐠 ${name} thả ${koi.name} (Vượt Vũ Môn: ${progressPct}%)`;
  const replyText = `Nguyện ước: "${text || koi.goal}" · ${koi.goal}. ${isMicroGift ? 'Cá Koi đã nhảy qua Cổng Vũ Môn Hóa Rồng Vàng 3D!' : (customData?.bonusBlessing || '')}`;
  const speechText = `${isMicroGift ? 'Trống hội vang rền! Cá Koi của ' : 'Hồ sen ngọc bích đón '}${name} thả ${koi.name}, cầu chúc ${koi.goal}.`;

  return {
    matchedFormat: `Thả Cá Koi (${koi.name})`,
    badge: `🐠 Vượt Vũ Môn ${progressPct}%`,
    headline,
    replyText,
    speechText,
    metrics: [
      { label: 'Người Thả Cá', value: name },
      { label: 'Giống Cá Quý', value: koi.name },
      { label: 'Tiến Độ Vũ Môn', value: `${progressPct}%` },
      { label: 'Phước Lành', value: koi.goal.split('·')[0].trim() },
    ],
    visual3d: { primaryColor: isMicroGift ? 0xfacc15 : 0x0ea5e9, label3d: `🐠 ${name} · ${koi.name.replace('Cá Koi ', '')}`, burstPower: isMicroGift ? 3 : 1 },
  };
}

function runAlgorithm10SkyFireworks({ name, text, isMicroGift, customData }) {
  const folded = foldVi(text);
  let theme = 'Đại Lễ Vinh Danh Bầu Trời Đêm';
  let formation = 'Đội Hình Ngôi Sao Ngân Hà 3D';
  if (/(sinh nhat|happy birthday|snvv)/.test(folded)) {
    theme = 'Đại Tiệc Chúc Mừng Sinh Nhật Rực Rỡ';
    formation = 'Đội Hình Vương Miện & Bánh Kem Ánh Sáng 3D';
  } else if (/(yeu|thuong|hanh phuc|gia dinh)/.test(folded)) {
    theme = 'Bầu Trời Yêu Thương & Hạnh Phúc Viên Mãn';
    formation = 'Đội Hình Trái Tim Đôi Pha Lê 3D';
  }
  const cleanWish = String(text || 'Tỏa sáng rực rỡ giữa bầu trời đêm!').trim().slice(0, 48);
  const headline = `🎆 Bắn Pháo Hoa & Drone 3D vinh danh ${name}`;
  const replyText = `${theme} · ${formation}: "${cleanWish}". ${isMicroGift ? (customData?.microGiftTitle || 'Đã kích hoạt 500 Drone Hoàng Kim!') : (customData?.bonusBlessing || '')}`;
  const speechText = `${isMicroGift ? 'Đại lễ pháo hoa 12 quả và 500 Drone Hoàng Kim cùng xếp tên ' : 'Bầu trời đêm 3D rực sáng vinh danh '}${name} với thông điệp: ${cleanWish}`;

  return {
    matchedFormat: `Pháo hoa (${theme.split(' ')[0]})`,
    badge: isMicroGift ? '🎆 500 DRONE VIP + ĐẠI PHÁO HOA' : '🎆 Pháo Hoa Ánh Sáng 3D',
    headline,
    replyText,
    speechText,
    metrics: [
      { label: 'Vinh Danh Trên Trời', value: name },
      { label: 'Đội Hình Drone 3D', value: formation.replace('Đội Hình ', '') },
      { label: 'Thông Điệp', value: cleanWish.slice(0, 24) },
      { label: 'Cấp Pháo Hoa', value: isMicroGift ? 'Đại Lễ 12 Quả VIP' : 'Pháo Hoa Tinh Vân' },
    ],
    visual3d: { primaryColor: isMicroGift ? 0xfacc15 : 0xf43f5e, label3d: `🎆 ${name}: ${cleanWish.slice(0, 18)}`, burstPower: isMicroGift ? 3 : 1 },
  };
}

// ============================================================================
// UNIFIED TREND ENGINE INSTANCE
// ============================================================================
export function createTrendEngine({ initialCustomData = {} } = {}) {
  const customDataByTrend = new Map();
  for (const p of TREND_PROJECTS) {
    customDataByTrend.set(p.id, {
      ...p.defaultCustomData,
      ...(initialCustomData[p.id] || initialCustomData[p.slug] || {}),
    });
  }

  const provinceScores = new Map([
    [36, 320],
    [29, 290],
    [59, 280],
    [37, 260],
    [43, 240],
    [65, 210],
  ]);

  const formatCounts = {
    birth_year: 0,
    couple_names: 0,
    birth_date: 0,
    province_code: 0,
    lucky_digits: 0,
    business_wish: 0,
    exam_career: 0,
    myth_pet: 0,
    celebration: 0,
    full_name: 0,
  };
  const keywordCounts = new Map();
  const trendInteractions = new Map(TREND_PROJECTS.map(p => [p.id, 0]));
  const trendMicroGifts = new Map(TREND_PROJECTS.map(p => [p.id, 0]));
  const trendDiamonds = new Map(TREND_PROJECTS.map(p => [p.id, 0]));
  const recentInteractions = [];
  const leaderboardsByTrend = new Map(TREND_PROJECTS.map(p => [p.id, new Map()]));

  let seq = 0;
  let totalComments = 0;
  let totalMicroGifts = 0;
  let totalDiamonds = 0;
  const eventRing = [];

  function resolveTrendProject(trendIdOrSlug) {
    if (!trendIdOrSlug) return null;
    const asNum = Number(trendIdOrSlug);
    if (Number.isFinite(asNum) && asNum >= 1 && asNum <= 10) {
      return TREND_PROJECTS.find(p => p.id === asNum) || null;
    }
    const clean = String(trendIdOrSlug).trim().toLowerCase();
    return TREND_PROJECTS.find(p => p.slug === clean) || null;
  }

  function recordKeywordTokens(rawText = '') {
    const words = foldVi(rawText)
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2 && w.length <= 14);
    for (const w of words.slice(0, 6)) {
      keywordCounts.set(w, (keywordCounts.get(w) || 0) + 1);
    }
    if (keywordCounts.size > 200) {
      const firstKey = keywordCounts.keys().next().value;
      if (firstKey) keywordCounts.delete(firstKey);
    }
  }

  function getProjectStats(projectId) {
    const p = resolveTrendProject(projectId) || TREND_PROJECTS[0];
    return {
      interactions: trendInteractions.get(p.id) || 0,
      microGifts: trendMicroGifts.get(p.id) || 0,
      diamonds: trendDiamonds.get(p.id) || 0,
    };
  }

  function interact({
    trendId = null,
    projectId = null,
    uid = '',
    name = '',
    nickname = '',
    text = '',
    kind = '',
    type = '',
    giftName = '',
    diamonds = 0,
    diamondCount = 0,
    repeat = 1,
    src = 'tiktok',
  } = {}) {
    const resolvedName = nickname || name || 'Khách Quý';
    const cleanName = String(resolvedName).trim().slice(0, 24) || 'Khách Quý';
    const resolvedUid = uid || `u_${foldVi(cleanName).replace(/\s+/g, '_') || 'guest'}`;
    const cleanText = String(text || giftName || '').trim().slice(0, 120);
    const rawDiamonds = Number(diamondCount || diamonds || 0);
    const isGiftType = kind === 'gift' || type === 'gift' || rawDiamonds > 0;
    const totalGiftDiamonds = isGiftType ? Math.max(1, (rawDiamonds || 1) * (Number(repeat) || 1)) : 0;
    const isMicroGift = isGiftType;

    const detected = detectCommentFormat(cleanText || cleanName);
    formatCounts[detected.format] = (formatCounts[detected.format] || 0) + 1;
    recordKeywordTokens(cleanText || cleanName);

    const project =
      resolveTrendProject(projectId ?? trendId) ||
      resolveTrendProject(detected.recommendedTrendId) ||
      TREND_PROJECTS[0];
    const customData = customDataByTrend.get(project.id) || project.defaultCustomData;

    if (isMicroGift) {
      totalMicroGifts++;
      totalDiamonds += totalGiftDiamonds;
      trendMicroGifts.set(project.id, (trendMicroGifts.get(project.id) || 0) + 1);
      trendDiamonds.set(project.id, (trendDiamonds.get(project.id) || 0) + totalGiftDiamonds);
    } else {
      totalComments++;
    }
    trendInteractions.set(project.id, (trendInteractions.get(project.id) || 0) + 1);

    // Update per-trend leaderboard
    const boardMap = leaderboardsByTrend.get(project.id);
    const prevScore = boardMap.get(resolvedUid) || { uid: resolvedUid, name: cleanName, score: 0, diamonds: 0 };
    prevScore.name = cleanName;
    prevScore.score += isMicroGift ? totalGiftDiamonds * 50 : 10;
    prevScore.diamonds += totalGiftDiamonds;
    boardMap.set(resolvedUid, prevScore);

    const ctx = { name: cleanName, text: cleanText, isMicroGift, customData, provinceScores };
    let algoOut;
    switch (project.id) {
      case 1: algoOut = runAlgorithm1Oracle(ctx); break;
      case 2: algoOut = runAlgorithm2Love(ctx); break;
      case 3: algoOut = runAlgorithm3Numerology(ctx); break;
      case 4: algoOut = runAlgorithm4MythPet(ctx); break;
      case 5: algoOut = runAlgorithm5ProvinceArena(ctx); break;
      case 6: algoOut = runAlgorithm6JadeSeal(ctx); break;
      case 7: algoOut = runAlgorithm7LuckyDigits(ctx); break;
      case 8: algoOut = runAlgorithm8MoneyTree(ctx); break;
      case 9: algoOut = runAlgorithm9KoiSanctuary(ctx); break;
      case 10:
      default:
        algoOut = runAlgorithm10SkyFireworks(ctx);
        break;
    }

    const baseScore = 80 + (hashStr(`${cleanName}:${cleanText}:${project.id}`) % 18);
    const computedScore = isMicroGift ? baseScore + totalGiftDiamonds * 25 : baseScore;
    const customMatch = findCustomLookupMatch(cleanText, customData?.customLookupText || '');

    const resolvedBadge = isMicroGift
      ? (customData?.microGiftTitle || algoOut.badge)
      : (customMatch?.metric || algoOut.badge);

    const baseDetail = customMatch
      ? `📌 [Kho Data: "${customMatch.patternRaw}"] ${customMatch.answer} — ${algoOut.replyText}`
      : algoOut.replyText;

    const detailWithBlessing = customData?.bonusBlessing && !String(baseDetail || '').includes(customData.bonusBlessing)
      ? `${baseDetail} (${customData.bonusBlessing})`
      : baseDetail;

    const resolvedSpeech = customMatch
      ? `${isMicroGift ? 'Cảm ơn món quà lộc phát! ' : ''}Giải mã dữ liệu cho ${cleanName}: ${customMatch.answer}.`
      : algoOut.speechText;

    const resolvedMetrics = Array.isArray(algoOut.metrics) ? [...algoOut.metrics] : [];
    if (customMatch && resolvedMetrics.length > 0) {
      resolvedMetrics[resolvedMetrics.length - 1] = {
        label: 'Kho Data Custom',
        value: customMatch.metric || 'Khớp 100%',
      };
    }

    const resultObj = {
      badge: resolvedBadge,
      headline: algoOut.headline,
      detailText: detailWithBlessing,
      spokenText: resolvedSpeech,
      metrics: resolvedMetrics,
      score: computedScore,
      matchedCustomKey: customMatch ? customMatch.patternRaw : null,
    };

    seq++;
    const event = {
      seq,
      id: `tr_${seq}_${Date.now()}`,
      trendId: project.id,
      projectId: project.slug,
      slug: project.slug,
      trendTitle: project.title,
      uid: resolvedUid,
      name: cleanName,
      nickname: cleanName,
      kind: isMicroGift ? 'gift' : 'chat',
      type: isMicroGift ? 'gift' : 'comment',
      giftName: isMicroGift ? (giftName || 'Hoa Hồng') : '',
      diamonds: totalGiftDiamonds,
      diamondCount: totalGiftDiamonds,
      isMicroGift,
      rawText: cleanText,
      inputRaw: cleanText || (isMicroGift ? `Tặng ${giftName || 'Hoa Hồng'} (${totalGiftDiamonds}💎)` : cleanName),
      format: detected.format,
      formatLabel: detected.label,
      detectedFormat: detected.format,
      detectedFormatLabel: detected.label,
      ...algoOut,
      badge: resolvedBadge,
      replyText: detailWithBlessing,
      result: resultObj,
      src,
      ts: Date.now(),
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
    };

    recentInteractions.unshift(event);
    if (recentInteractions.length > 50) recentInteractions.length = 50;

    eventRing.push(event);
    if (eventRing.length > 200) eventRing.shift();

    return {
      ok: true,
      event,
      projectStats: getProjectStats(project.id),
      leaderboard: getLeaderboard(project.id),
      insights: getInsightReport(),
      ...event,
    };
  }

  function getLeaderboard(trendId = 1) {
    const project = resolveTrendProject(trendId) || TREND_PROJECTS[0];
    if (project.id === 5) {
      return [...provinceScores.entries()]
        .map(([code, score]) => {
          const p = PROVINCES_63_MAP.find(x => x.code === code) || { code, name: `Tỉnh ${code}` };
          return { uid: `prov_${code}`, name: `🇻🇳 ${code} ${p.name}`, score, diamonds: Math.floor(score / 50) };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
    }
    const boardMap = leaderboardsByTrend.get(project.id) || new Map();
    return [...boardMap.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }

  function getInsightReport() {
    const totalEvents = totalComments + totalMicroGifts;
    const totalAll = Math.max(1, Object.values(formatCounts).reduce((a, b) => a + b, 0));
    const formatLabels = {
      birth_year: '🔮 Năm Sinh & Bản Mệnh (19xx / 2k)',
      couple_names: '💘 Ghép Đôi 2 Tên (Tên A + Tên B)',
      birth_date: '🌌 Ngày/Tháng/Năm Sinh (Thần Số Học)',
      province_code: '⚔️ Mã Biển Số / 63 Tỉnh Thành',
      lucky_digits: '🎰 4 Số Cuối SĐT / Biển Số Đẹp',
      business_wish: '💰 Xin Vía Nổ Đơn / Buôn Bán Tài Lộc',
      exam_career: '🐠 Thả Cá Cầu Thi Đỗ / Thăng Chức',
      myth_pet: '🐉 Ấp Trứng Linh Thú 3D',
      celebration: '🎆 Chúc Mừng Sinh Nhật / Pháo Hoa',
      full_name: '📜 Giải Mã Ý Nghĩa Họ Tên',
    };

    const formatBreakdown = Object.entries(formatCounts)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => {
        const pct = Math.round((count / totalAll) * 100);
        return {
          key,
          format: key,
          label: formatLabels[key] || key,
          count,
          pct,
          percent: pct,
        };
      })
      .sort((a, b) => b.count - a.count);

    const topKeywords = [...keywordCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([word, count]) => ({ word, count }));

    const trendPopularity = TREND_PROJECTS.map(p => ({
      id: p.slug,
      numericId: p.id,
      slug: p.slug,
      title: p.title,
      name: p.title,
      category: p.category,
      interactions: trendInteractions.get(p.id) || 0,
      customData: customDataByTrend.get(p.id) || p.defaultCustomData,
    }));

    const microGiftConversionRate = totalEvents > 0
      ? Math.round((totalMicroGifts / totalEvents) * 100)
      : 0;

    return {
      totalEvents,
      totalComments,
      totalMicroGifts,
      totalDiamonds,
      microGiftConversionRate,
      formatBreakdown,
      topKeywords,
      trendPopularity,
      recentInteractions: recentInteractions.slice(0, 25),
    };
  }

  function setCustomData(trendId, patch = {}) {
    const project = resolveTrendProject(trendId);
    if (!project) return { ok: false };
    const prev = customDataByTrend.get(project.id) || { ...project.defaultCustomData };
    const next = {
      ...prev,
      ...(typeof patch.ruleNote === 'string' ? { ruleNote: patch.ruleNote.trim().slice(0, 240) } : {}),
      ...(typeof patch.bonusBlessing === 'string' ? { bonusBlessing: patch.bonusBlessing.trim().slice(0, 240) } : {}),
      ...(typeof patch.microGiftTitle === 'string' ? { microGiftTitle: patch.microGiftTitle.trim().slice(0, 120) } : {}),
      ...(typeof patch.customLookupText === 'string' ? { customLookupText: patch.customLookupText.trim().slice(0, 12000) } : {}),
    };
    customDataByTrend.set(project.id, next);
    return { ok: true, trendId: project.id, projectId: project.slug, slug: project.slug, customData: next };
  }

  function buildProjectsList() {
    return TREND_PROJECTS.map(p => ({
      ...p,
      id: p.slug,
      numericId: p.id,
      interactions: trendInteractions.get(p.id) || 0,
      stats: getProjectStats(p.id),
      customData: customDataByTrend.get(p.id) || p.defaultCustomData,
    }));
  }

  function buildLeaderboardsMap() {
    const out = {};
    for (const p of TREND_PROJECTS) {
      const lb = getLeaderboard(p.id);
      out[p.slug] = lb;
      out[p.id] = lb;
    }
    return out;
  }

  function buildCustomDataMap() {
    const out = {};
    for (const p of TREND_PROJECTS) {
      const cd = customDataByTrend.get(p.id) || p.defaultCustomData;
      out[p.slug] = cd;
      out[p.id] = cd;
    }
    return out;
  }

  function getSnapshot(trendId = null) {
    const project = resolveTrendProject(trendId) || TREND_PROJECTS[0];
    const filteredRecent = recentInteractions.filter(e => !trendId || e.trendId === project.id || e.projectId === project.slug).slice(0, 12);
    return {
      ok: true,
      seq,
      activeProject: {
        ...project,
        id: project.slug,
        numericId: project.id,
        stats: getProjectStats(project.id),
        customData: customDataByTrend.get(project.id) || project.defaultCustomData,
      },
      projects: buildProjectsList(),
      leaderboard: getLeaderboard(project.id),
      leaderboards: buildLeaderboardsMap(),
      customData: buildCustomDataMap(),
      recentEvents: filteredRecent,
      insights: getInsightReport(),
    };
  }

  function pollSince(sinceSeq = 0, trendId = null) {
    const s = Number(sinceSeq) || 0;
    const project = trendId ? resolveTrendProject(trendId) : null;
    const events = eventRing.filter(e => e.seq > s && (!project || e.trendId === project.id || e.projectId === project.slug));
    return {
      ok: true,
      seq,
      events,
      projects: buildProjectsList(),
      leaderboard: project ? getLeaderboard(project.id) : undefined,
      leaderboards: buildLeaderboardsMap(),
      insights: getInsightReport(),
    };
  }

  function resetAll() {
    for (const k of Object.keys(formatCounts)) formatCounts[k] = 0;
    keywordCounts.clear();
    recentInteractions.length = 0;
    eventRing.length = 0;
    totalComments = 0;
    totalMicroGifts = 0;
    totalDiamonds = 0;
    for (const p of TREND_PROJECTS) {
      trendInteractions.set(p.id, 0);
      trendMicroGifts.set(p.id, 0);
      trendDiamonds.set(p.id, 0);
      leaderboardsByTrend.get(p.id)?.clear();
    }
    return { ok: true, ...getSnapshot(1) };
  }

  return {
    interact,
    resolveTrendProject,
    getSnapshot,
    pollSince,
    getInsightReport,
    setCustomData,
    getLeaderboard,
    resetAll,
  };
}
