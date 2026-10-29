// =====================================================================
//  layout.js — BỘ MÁY HÌNH HỌC THAM SỐ (không phụ thuộc Three.js)
//  Toàn bộ vị trí, kích thước cấu kiện được tính từ tham số tại đây.
//  booth.js (dựng 3D), materials.js (dự toán), blueprint.js (bản vẽ)
//  và construction.js (thi công) đều đọc chung kết quả của file này,
//  nên mô hình – dự toán – bản vẽ – hướng dẫn luôn khớp nhau.
//  Hệ trục: x = chiều ngang (trái −, phải +), y = chiều cao,
//           z = chiều sâu (+z = mặt tiền hướng ra khách). Đơn vị: mét.
// =====================================================================

export const DEFAULT_PARAMS = {
  // 1. Thông số Gian hàng (Booth)
  width: 3.0,          // chiều ngang khung gian hàng (mép ngoài cột)
  depth: 2.0,          // chiều sâu khung gian hàng
  height: 2.6,         // chiều cao tổng gian hàng (đỉnh nan mái)
  counterHeight: 0.85, // cao mặt quầy
  counterDepth: 0.6,   // sâu mặt quầy
  // 2. Thông số Cổng trại riêng biệt (Camp Gate)
  gateSpan: 3.32,        // chiều rộng lọt lòng giữa 2 trụ cổng (m)
  gateHeight: 3.80,      // chiều cao tổng tới đỉnh cổng trại (m)
  gateLadderWidth: 0.54, // bề rộng mỗi trụ thang cổng (m)
  gateOffsetZ: 0.34,     // khoảng cách cổng nhô ra trước mặt tiền gian hàng (m)
  gateHeaderScale: 1.0,  // tỷ lệ thu phóng cụm Băng rôn & Quả cầu đỉnh cổng
  material: 'natural',   // natural | painted | wood | pvc
};

export const LIMITS = {
  width: [2.0, 4.5, 0.1],
  depth: [1.5, 3.0, 0.1],
  height: [2.2, 3.2, 0.05],
  counterHeight: [0.75, 1.0, 0.01],
  counterDepth: [0.45, 0.8, 0.05],
  gateSpan: [2.2, 6.0, 0.05],
  gateHeight: [2.8, 5.2, 0.05],
  gateLadderWidth: [0.35, 0.9, 0.02],
  gateOffsetZ: [-0.5, 1.5, 0.05],
  gateHeaderScale: [0.7, 1.4, 0.05],
};

// Tiết diện cấu kiện theo loại vật liệu (m)
export const SECTIONS = {
  natural: { kind: 'bamboo', label: 'Tre tự nhiên', post: 0.09, beam: 0.07, brace: 0.05, slat: 0.045, cframe: 0.05, cslat: 0.035 },
  painted: { kind: 'bamboo', label: 'Tre sơn phủ PU', post: 0.09, beam: 0.07, brace: 0.05, slat: 0.045, cframe: 0.05, cslat: 0.035 },
  wood:    { kind: 'wood',   label: 'Gỗ keo xẻ', post: 0.08, beam: 0.06, brace: 0.045, slat: 0.04, cframe: 0.045, cslat: 0.03 },
  pvc:     { kind: 'pvc',    label: 'Ống PVC giả tre', post: 0.09, beam: 0.06, brace: 0.042, slat: 0.042, cframe: 0.042, cslat: 0.034 },
};

export const STAGE_NAMES = [
  'GĐ0 · Khảo sát mặt bằng',
  'GĐ1 · Vật tư & chân đế',
  'GĐ2 · Dựng cột chính',
  'GĐ3 · Xà ngang & giằng',
  'GĐ4 · Khung mái',
  'GĐ5 · Quầy phục vụ',
  'GĐ6 · Bảng hiệu & logo',
  'GĐ7 · Trang trí vũ trụ',
  'GĐ8 · Hoàn thiện & kiểm tra',
];

// Mô tả từng loại cấu kiện (hiển thị khi click vào mô hình)
const M = (bamboo, wood, pvc) => ({ bamboo, wood: wood ?? bamboo, pvc: pvc ?? bamboo });
export const TYPES = {
  footing:   { name: 'Chân đế xô bê tông + ống lồng', group: 'footings', stage: 1,
    mat: M('Xô nhựa 18–20 L (tái sử dụng xô sơn) đổ bê tông mác thấp, chôn sẵn ống lồng PVC Ø114'),
    role: 'Tạo khối nặng giữ chân cột (~45–50 kg/xô), không cần khoan phá mặt sân.',
    install: 'Đổ bê tông trước 5–7 ngày. Tại sự kiện: đặt xô đúng mốc, kê phẳng, cắm cột vào ống lồng, chèn nêm gỗ và bắt 1 bu lông xuyên.' },
  sandbag:   { name: 'Bao cát chống lật', group: 'footings', stage: 1,
    mat: M('Bao tải dứa + cát (~15 kg/bao), dán băng phản quang'),
    role: 'Tăng tải trọng chống lật khi có gió; đặt phía ngoài lối đi để tránh vấp.',
    install: 'Đặt sát xô chân cột phía ngoài/ phía sau, buộc dây vào chân cột.' },
  post:      { name: 'Cột chính', group: 'posts', stage: 2,
    mat: M('Tre đực già Ø8–10 cm, đã ngâm/phơi, quét chống mối mọt', 'Gỗ keo xẻ 8×8 cm, sơn chống ẩm', 'Ống PVC Ø90 vân tre, luồn lõi thép hộp 40×40'),
    role: 'Chịu toàn bộ tải mái, bảng hiệu, trang trí và truyền xuống chân đế.',
    install: 'Cắm vào ống lồng chân đế, kiểm tra thẳng đứng 2 phương bằng thước thủy/dây dọi, chèn nêm rồi bắt bu lông M8.' },
  postMid:   { name: 'Cột giữa phía sau', group: 'posts', stage: 2,
    mat: M('Tre đực Ø8–10 cm', 'Gỗ keo 8×8 cm', 'Ống PVC Ø90 + lõi thép'),
    role: 'Đỡ giữa nhịp xà mái sau, chia mặt sau thành 2 khoang giằng.',
    install: 'Dựng sau 4 cột góc, đầu cột đỡ trực tiếp đòn tay mái sau.' },
  sideBeam:  { name: 'Xà dọc đỉnh cột', group: 'beams', stage: 3,
    mat: M('Tre Ø6–8 cm', 'Gỗ keo 6×6 cm', 'Ống PVC Ø60'),
    role: 'Nối đỉnh cột trước – sau, đỡ các đòn tay mái.',
    install: 'Khoét miệng cá đầu cột, đặt xà lên, bắt bu lông M8 xuyên và buộc dây đè ngoài.' },
  tieBeam:   { name: 'Xà ngang đầu cột', group: 'beams', stage: 3,
    mat: M('Tre Ø6–8 cm', 'Gỗ keo 6×6 cm', 'Ống PVC Ø60'),
    role: 'Giằng đỉnh cột theo phương ngang, là điểm treo mép trên bảng hiệu / phông nền.',
    install: 'Áp vào mặt ngoài cột, bắt bu lông M8 + buộc chéo chữ X.' },
  signBeam:  { name: 'Xà đỡ bảng hiệu', group: 'beams', stage: 3,
    mat: M('Tre Ø6–8 cm', 'Gỗ keo 6×6 cm', 'Ống PVC Ø60'),
    role: 'Đỡ mép dưới các bảng logo, gắn dây LED xanh phía dưới.',
    install: 'Áp mặt trước cột, cân thủy bình cho ngang, bắt bu lông + buộc dây.' },
  midRail:   { name: 'Xà ngang giữa', group: 'beams', stage: 3,
    mat: M('Tre Ø6–8 cm', 'Gỗ keo 6×6 cm', 'Ống PVC Ø60'),
    role: 'Giằng thân cột, tạo khung tam giác cùng giằng chéo.',
    install: 'Bắt bu lông vào mặt ngoài cột ở cao độ thiết kế.' },
  groundTie: { name: 'Giằng chân', group: 'beams', stage: 3,
    mat: M('Tre Ø6–8 cm', 'Gỗ keo 6×6 cm', 'Ống PVC Ø60'),
    role: 'Khóa chân cột, chống xòe chân; dán băng phản quang để tránh vấp.',
    install: 'Bắt bu lông ngay trên miệng xô (cao ~0,42 m).' },
  kneeBrace: { name: 'Thanh chống góc (giằng xiên)', group: 'braces', stage: 3,
    mat: M('Tre Ø4–5 cm', 'Gỗ keo 4×4 cm', 'Ống PVC Ø42'),
    role: 'Tạo tam giác cứng ở góc cột – xà, giảm rung lắc ngang.',
    install: 'Vát 2 đầu theo góc ~45°, bắt bu lông 1 đầu vào cột, 1 đầu vào xà.' },
  xBrace:    { name: 'Giằng chéo chữ X', group: 'braces', stage: 3,
    mat: M('Tre Ø4–5 cm', 'Gỗ keo 4×4 cm', 'Ống PVC Ø42'),
    role: 'Chống biến hình khung theo phương ngang (gió, va chạm).',
    install: 'Lắp ở mặt trong vách trái và vách sau, bắt bu lông tại 2 đầu và buộc tại điểm giao.' },
  joint:     { name: 'Mối nối bu lông + buộc dây', group: 'joints', stage: 3,
    mat: M('Bu lông M8×150 + 2 long đền + ê cu, bọc dây mây nhựa/dây đay'),
    role: 'Liên kết cột – xà – giằng. Dây buộc bên ngoài vừa thẩm mỹ vừa chống trượt.',
    install: 'Khoan mồi Ø9 qua tâm tre (gần đốt), siết vừa tay tránh nứt tre, quấn 6–8 vòng dây chéo.' },
  roofBeam:  { name: 'Đòn tay mái', group: 'roof', stage: 4,
    mat: M('Tre Ø6–8 cm', 'Gỗ keo 6×6 cm', 'Ống PVC Ø60'),
    role: 'Đỡ các nan mái song song, đua ra 20 cm mỗi bên.',
    install: 'Đặt vuông góc lên xà dọc, bắt bu lông + buộc chéo.' },
  roofSlat:  { name: 'Nan tre mái song song', group: 'roof', stage: 4,
    mat: M('Tre Ø4–5 cm', 'Nẹp gỗ 4×4 cm', 'Ống PVC Ø42'),
    role: 'Tạo mái giàn thoáng (pergola), che nắng một phần, điểm treo trang trí nhẹ.',
    install: 'Rải đều theo khoảng cách thiết kế, cố định bằng dây rút/dây buộc vào từng đòn tay.' },
  counterLeg:  { name: 'Chân quầy', group: 'counter', stage: 5,
    mat: M('Tre Ø4–5 cm', 'Gỗ keo 4×4 cm', 'Ống PVC Ø42'),
    role: 'Đỡ mặt quầy và kệ dưới.', install: 'Dựng theo lưới chân, buộc vào cột trước ở 2 đầu.' },
  counterRail: { name: 'Khung ngang quầy', group: 'counter', stage: 5,
    mat: M('Tre Ø4–5 cm', 'Gỗ keo 4×4 cm', 'Ống PVC Ø42'),
    role: 'Đỡ mặt quầy và kệ, giằng các chân quầy.', install: 'Bắt vít/bu lông nhỏ vào chân quầy, kiểm tra mặt trên phẳng.' },
  counterTrim: { name: 'Nẹp tre ngang mặt quầy', group: 'counter', stage: 5,
    mat: M('Tre Ø4–5 cm', 'Gỗ keo 4×4 cm', 'Ống PVC Ø42'),
    role: 'Kẹp và cố định hệ nan dọc mặt trước.', install: 'Đặt phía trước nan, buộc dây rút qua từng nan.' },
  counterSlat: { name: 'Nan tre ốp quầy', group: 'counter', stage: 5,
    mat: M('Tre nan Ø3–4 cm', 'Nẹp gỗ 3×3 cm', 'Ống PVC Ø34'),
    role: 'Ốp mặt trước/hông quầy, tạo nhận diện tre truyền thống.', install: 'Cắt đều chiều dài, xếp theo bước thiết kế, buộc vào nẹp trên – dưới.' },
  counterTop:  { name: 'Mặt quầy ván ép', group: 'counter', stage: 5,
    mat: M('Ván ép 12–18 mm phủ vecni hoặc dán decal vân gỗ'),
    role: 'Mặt phục vụ, đặt khay đồ ăn, thùng đá, menu.', install: 'Bắt vít xuống khung quầy, chà nhám cạnh.' },
  counterShelf:{ name: 'Kệ dưới quầy', group: 'counter', stage: 5,
    mat: M('Ván ép 12 mm'), role: 'Để dụng cụ, đồ dự trữ, túi đựng.', install: 'Đặt lên khung kệ, bắt vít.' },
  cabinet:   { name: 'Tủ ngăn kéo (mượn)', group: 'furniture', stage: 5,
    mat: M('Tủ nhựa/gỗ có sẵn – mượn hoặc tái sử dụng'), role: 'Cất tiền, giấy tờ, dụng cụ nhỏ.', install: 'Đặt cuối quầy bên phải, kê phẳng.' },
  prepTable: { name: 'Bàn gấp chuẩn bị (mượn)', group: 'furniture', stage: 5,
    mat: M('Bàn gấp chân sắt 1,2×0,6 m – mượn BTC'), role: 'Khu sơ chế/đóng gói phía sau.', install: 'Đặt cách phông nền ≥ 0,2 m, lối nhân viên ≥ 0,45 m.' },
  stove:     { name: 'Bếp điện từ (tuỳ chọn)', group: 'furniture', stage: 5,
    mat: M('Bếp từ đơn – không dùng lửa hở'), role: 'Hâm nóng đồ ăn. Có vùng an toàn nhiệt bán kính 0,5 m.',
    install: 'Cắm ổ riêng của BTC, KHÔNG đi chung dây LED; cách phông nền/trang trí ≥ 0,5 m.' },
  cooler:    { name: 'Thùng đá giữ lạnh', group: 'furniture', stage: 5,
    mat: M('Thùng đá nhựa có sẵn'), role: 'Giữ lạnh đồ uống.', install: 'Đặt trên quầy, có khay hứng nước đọng.' },
  menuStand: { name: 'Kệ menu mica A5', group: 'furniture', stage: 5,
    mat: M('Kệ mica chữ A + giấy in'), role: 'Menu + mã QR thanh toán.', install: 'Đặt góc phải mặt quầy.' },
  signPTIT:  { name: 'Biển tròn logo PTIT', group: 'logo_ptit', stage: 6,
    mat: M('Foam/format 5 mm cắt tròn + decal in logo gốc, viền nhũ vàng'), role: 'Nhận diện Học viện (bên trái).',
    install: 'Khoan 3 lỗ, buộc dây rút vào xà đầu cột và xà bảng hiệu; mặt sau dán nẹp tre chống cong.' },
  signSTR4:  { name: 'Bảng STR4.SEC', group: 'logo_str4', stage: 6,
    mat: M('Foam 5 mm + decal in logo gốc + mica trong 2 mm phủ mặt'), role: 'Nhận diện nhóm STR4.SEC.',
    install: 'Buộc 4 điểm (2 trên xà đầu cột, 2 dưới xà bảng hiệu).' },
  signD26:   { name: 'Bảng An toàn thông tin D26', group: 'logo_d26', stage: 6,
    mat: M('Foam 5 mm + decal (logo D26 gốc + chữ) + mica 2 mm, viền LED neon'), role: 'Bảng trung tâm – điểm nhấn chính.',
    install: 'Buộc 4–6 điểm vào 2 xà, kiểm tra không cong vênh.' },
  signDoan:  { name: 'Biển tròn logo Đoàn TN', group: 'logo_doan', stage: 6,
    mat: M('Foam 5 mm cắt tròn + decal in logo gốc'), role: 'Nhận diện Đoàn Thanh niên (bên phải).',
    install: 'Buộc 3 điểm như biển PTIT, cân đối đối xứng.' },
  cloudSign: { name: 'Biển mây "ẨM THỰC NGÂN HÀ"', group: 'cloudSign', stage: 6,
    mat: M('Foam 10 mm cắt CNC/dao rọc hình đám mây + decal in'), role: 'Bảng tên gian hàng phía trước quầy.',
    install: 'Khoan 6 lỗ, buộc dây rút vào hệ nan quầy và nẹp ngang.' },
  hangStar:  { name: 'Ngôi sao tre treo', group: 'stars', stage: 7,
    mat: M('Que tre 5 mm + giấy kiếng vàng + LED mini dùng pin, treo dây cước 0,5 mm'), role: 'Điểm nhấn ánh sáng chủ đề "ngân hà".',
    install: 'Buộc 5 que thành sao, gắn LED pin ở tâm, treo dây cước vào nan mái (cao thấp xen kẽ).' },
  smallStar: { name: 'Sao foam nhỏ gắn khung', group: 'stars', stage: 7,
    mat: M('Foam 5 mm cắt sao, sơn nhũ vàng'), role: 'Trang trí đầu xà/đầu đòn tay.', install: 'Dán keo nến + băng keo 2 mặt.' },
  planet:    { name: 'Hành tinh + quỹ đạo', group: 'planets', stage: 7,
    mat: M('Quả cầu xốp sơn acrylic + vòng quỹ đạo ống PVC Ø8/dây thép 3 mm'), role: 'Biểu tượng vũ trụ treo dưới mái.',
    install: 'Xuyên que tre qua tâm quả cầu, gắn vòng bằng keo nến, treo dây cước vào nan mái.' },
  shield:    { name: 'Khiên bảo mật', group: 'security', stage: 7,
    mat: M('Foam 5 mm sơn xịt bạc + decal'), role: 'Biểu tượng An toàn thông tin.', install: 'Dán + buộc dây rút vào cột trước trái.' },
  padlock:   { name: 'Ổ khóa bảo mật', group: 'security', stage: 7,
    mat: M('Foam 5 mm + vòng quai ống PVC Ø21 sơn bạc'), role: 'Biểu tượng mã hoá/bảo mật.', install: 'Dán + buộc dây rút vào cột trước phải.' },
  binaryStrip:{ name: 'Dải dữ liệu nhị phân 0–1', group: 'security', stage: 7,
    mat: M('Decal in trên foam 5 mm'), role: 'Chạy dọc mặt quầy, mã hoá chữ "GALACTIC FOOD STATION".', install: 'Buộc dây rút vào nan quầy.' },
  circuitPanel:{ name: 'Tấm mạch điện trang trí', group: 'security', stage: 7,
    mat: M('Decal in trên foam 5 mm'), role: 'Họa tiết mạch điện tử ở hông quầy.', install: 'Buộc vào nan hông quầy.' },
  ledStrip:  { name: 'Dây LED xanh 12V', group: 'leds', stage: 7,
    mat: M('LED dây 2835 12V xanh dương, IP65, có keo dán'), role: 'Viền sáng xà bảng hiệu và mép quầy.',
    install: 'Dán + bấm dây rút mỗi 30 cm, đầu nối bọc co nhiệt.' },
  fairyLights:{ name: 'Dây đèn đom đóm vàng ấm', group: 'leds', stage: 7,
    mat: M('Dây đèn LED đom đóm 12V/USB'), role: 'Tạo "dải ngân hà" dưới mái phía trên quầy.',
    install: 'Võng zic-zắc qua nan mái nửa trước, KHÔNG đi trên khu bếp.' },
  wiring:    { name: 'Tuyến dây điện', group: 'leds', stage: 7,
    mat: M('Dây đôi 2×0,75 mm² (12V) + ống ruột gà Ø16 đoạn dưới đất'), role: 'Cấp nguồn LED, đi trên cao theo cột phải – xà dọc phải.',
    install: 'Cố định dây rút mỗi 30 cm, không vắt ngang lối đi, tránh xa bếp.' },
  adapter:   { name: 'Hộp nguồn adapter 12V + ổ cắm', group: 'leds', stage: 7,
    mat: M('Adapter 12V 5A + ổ cắm có CB (mượn BTC)'), role: 'Chuyển 220V → 12V an toàn cho LED.', install: 'Treo trên cột sau phải cao 1,3 m, tránh nước.' },
  backdrop:  { name: 'Phông nền bạt in dải ngân hà', group: 'backdrop', stage: 7,
    mat: M('Bạt hiflex in (khuyến nghị lưới mesh thoát gió) + khoen'), role: 'Nền chủ đề vũ trụ, che khu sơ chế.',
    install: 'Buộc dây rút qua khoen vào xà đầu cột sau và giằng chân sau, căng đều.' },
  gatePost:  { name: 'Cột trụ thang cổng trại', group: 'campGate', stage: 2,
    mat: M('Tre đực già Ø8–10 cm chọn cây thẳng đều', 'Gỗ keo 8×8 cm', 'Ống PVC Ø90 giả tre + lõi thép'),
    role: '4 cột trụ đứng tạo 2 trụ thang cổng trại hai bên gian hàng, đỡ băng rôn đỉnh cổng.',
    install: 'Cắm vào 4 xô bê tông chân cổng, giằng ngang vào cột trước C1–C2 của gian hàng để khóa cứng không gian.' },
  gateRung:  { name: 'Thanh ngang bậc thang & xà đỉnh cổng trại', group: 'campGate', stage: 3,
    mat: M('Tre Ø6–7 cm', 'Gỗ keo 6×6 cm', 'Ống PVC Ø60'),
    role: 'Liên kết 2 cột mỗi trụ thành khung thang cứng vững (5 bậc/bên) và hệ xà ngang đỡ băng rôn đỉnh cổng.',
    install: 'Khoan mồi Ø9, bắt bu lông M8×150 xuyên qua cột thang và quấn dây mây buộc chéo.' },
  gateGlobe: { name: 'Quả cầu Mắt thần An ninh mạng (Đỉnh cổng trái)', group: 'campGate', stage: 6,
    mat: M('Foam 10 mm cắt tròn Ø1,18 m bồi decal PP ngoài trời + khung nẹp tre chữ thập mặt sau'),
    role: 'Biểu tượng quả địa cầu & con mắt giám sát An toàn thông tin trên đỉnh trái cổng trại.',
    install: 'Buộc 6 điểm vào đỉnh trụ thang trái và xà ngang đỉnh cổng.' },
  gateBanner:{ name: 'Băng rôn đuôi én ASTRA.SEC / STR4.SEC (Đỉnh cổng)', group: 'campGate', stage: 6,
    mat: M('Bạt Hiflex dày căng trên khung tre/gỗ cắt hình đuôi én + tấm Foam 5 mm nổi cho ngôi sao STR4.SEC'),
    role: 'Bảng tên chính của cổng trại vắt ngang phía trên mái gian hàng.',
    install: 'Cố định vào 2 xà ngang đỉnh cổng bằng dây rút nhựa bản to mỗi 25 cm.' },
  gateBadge: { name: 'Logo gắn trụ thang cổng (PTIT, D26, Đoàn TN)', group: 'campGate', stage: 6,
    mat: M('Foam 5 mm cắt CNC theo viền logo gốc + decal PP cán bóng'),
    role: 'Hệ thống huy hiệu nhận diện Học viện PTIT, khóa D26 và Đoàn Thanh niên trên 2 trụ thang cổng.',
    install: 'Buộc dây rút vào thân cột thang và bậc thang tre.' },
  gateWave:  { name: 'Cánh sóng mạch điện ngân hà (Chân cổng)', group: 'campGate', stage: 7,
    mat: M('Foam 8 mm cắt lượn sóng 2 lớp + decal in họa tiết mạch điện & dải ngân hà'),
    role: 'Tạo bệ trang trí công nghệ – vũ trụ che chân đế bê tông ở hai bên chân cổng.',
    install: 'Cố định vào bậc thang dưới cùng và cọc ghim/bao cát chân cổng.' },
  gateShield:{ name: 'Khiên bảo mật & Ổ khóa phát sáng (Chân cổng trái)', group: 'campGate', stage: 7,
    mat: M('Foam 10 mm bồi decal phản quang xanh cyan + viền LED neon 12V'),
    role: 'Điểm nhấn biểu tượng An toàn thông tin ở cụm chân cổng bên trái.',
    install: 'Gắn nổi phía trước cụm cánh sóng mạch điện chân cổng trái.' },
  gateStarCluster:{ name: 'Cụm ngôi sao 5 cánh đa lớp (Chân cổng phải)', group: 'campGate', stage: 7,
    mat: M('Foam 10 mm + 5 mm cắt sao 5 cánh đồng tâm nhiều lớp sơn vàng & xanh cổ vịt'),
    role: 'Điểm nhấn biểu tượng Ngân hà ở cụm chân cổng bên phải.',
    install: 'Gắn nổi phía trước cụm cánh sóng mạch điện chân cổng phải.' },
  gateSparkle:{ name: 'Ngôi sao 4 cánh lấp lánh gắn trụ cổng', group: 'campGate', stage: 7,
    mat: M('Foam 5 mm cắt sao 4 cánh sơn vàng #FFD85A & xanh #00CFFF + LED hắt điểm'),
    role: 'Tạo hiệu ứng lấp lánh dọc theo 2 trụ thang tre của cổng trại.',
    install: 'Dán keo nến + buộc dây rút tại các nút giao giữa cột thang và bậc thang.' },
};

// Nhóm hiển thị (bật/tắt trong bảng điều khiển)
export const GROUPS = {
  campGate: 'Cổng trại (Trụ thang, Quả cầu, Băng rôn)',
  footings: 'Chân đế & bao cát', posts: 'Cột', beams: 'Xà ngang', braces: 'Thanh giằng',
  joints: 'Mối nối', roof: 'Mái (đòn tay + nan)', counter: 'Quầy', furniture: 'Đồ dùng / nội thất',
  logo_ptit: 'Logo PTIT', logo_str4: 'Logo STR4.SEC', logo_d26: 'Logo D26', logo_doan: 'Logo Đoàn TN',
  cloudSign: 'Biển "Ẩm thực Ngân hà"', stars: 'Ngôi sao', planets: 'Hành tinh', security: 'Biểu tượng bảo mật',
  leds: 'Đèn LED & dây điện', backdrop: 'Phông nền',
};

const r3 = (n) => Math.round(n * 1000) / 1000;
export const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);

// Đếm số "đường cong" quỹ đạo và các đường đi dây
function catenaryPath(a, b, sag, n = 10) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t]);
  }
  return pts;
}
export function pathLength(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1], pts[i]); return L; }

// =====================================================================
export function computeLayout(params = {}) {
  const p = { ...DEFAULT_PARAMS, ...params };
  for (const k of Object.keys(LIMITS)) p[k] = Math.min(LIMITS[k][1], Math.max(LIMITS[k][0], +p[k]));
  const sec = SECTIONS[p.material] || SECTIONS.natural;
  const kind = sec.kind;
  const profile = kind === 'wood' ? 'square' : 'round';
  const dp = sec.post, db = sec.beam, dbr = sec.brace, ds = sec.slat, dcf = sec.cframe, dcs = sec.cslat;
  const W = p.width, D = p.depth, H = p.height, Hc = p.counterHeight, Dc = p.counterDepth;

  const px = W / 2 - dp / 2;          // tâm cột theo x
  const pz = D / 2 - dp / 2;          // tâm cột theo z
  const Hp = H - 2 * db - ds;         // đỉnh cột góc
  const Ht = Hp - 0.05;               // cao độ xà ngang đầu cột
  const Hs = Ht - 0.55;               // cao độ xà đỡ bảng hiệu
  const yGT = 0.42;                   // cao độ giằng chân
  const y0 = 0.06;                    // chân cột (nằm trong ống lồng)
  const hasMidPost = W >= 2.6;
  const hasMidRoofBeam = D >= 1.6;
  const zFrontFace = pz + dp / 2 + db / 2;     // tâm xà áp mặt trước cột
  const zBackFace = -zFrontFace;
  const xLeftFace = -(px + dp / 2 + db / 2);

  const parts = [];
  let seq = 0;
  const add = (type, data) => {
    const t = TYPES[type];
    const part = { id: `${type}-${++seq}`, type, stage: t.stage, group: t.group, order: 0, anim: 'drop', ...data };
    parts.push(part);
    return part;
  };
  const seg = (type, a, b, d, cls, extra = {}) => add(type, { shape: 'seg', a: a.map(r3), b: b.map(r3), d, cls, profile, length: r3(dist(a, b)), ...extra });
  const joints = [];
  const joint = (c, axis = [0, 1, 0], r = dp / 2 + 0.007, stage = 3, order = 50, name) =>
    joints.push(add('joint', { shape: 'ring', c: c.map(r3), axis, r, tube: 0.009, stage, order, anim: 'pop', name: name || 'Mối nối bu lông + buộc dây' }));

  // ------------------------------------------------------------ CỘT
  const posts = [
    { key: 'C1', name: 'Cột C1 – trước trái', x: -px, z: pz, sx: -1, sz: 1 },
    { key: 'C2', name: 'Cột C2 – trước phải', x: px, z: pz, sx: 1, sz: 1 },
    { key: 'C3', name: 'Cột C3 – sau phải', x: px, z: -pz, sx: 1, sz: -1 },
    { key: 'C4', name: 'Cột C4 – sau trái', x: -px, z: -pz, sx: -1, sz: -1 },
  ];
  if (hasMidPost) posts.push({ key: 'C5', name: 'Cột C5 – giữa sau', x: 0, z: -pz, sx: 0, sz: -1, mid: true });

  // ------------------------------------------------------------ GĐ1 chân đế
  posts.forEach((P, i) => {
    add('footing', { shape: 'footing', c: [P.x, 0, P.z], r: 0.15, h: 0.32, name: `Chân đế xô bê tông ${P.key}`, order: i, anim: 'drop' });
  });
  let bagIdx = 0;
  const bag = (x, y, z, rotY, name) => add('sandbag', { shape: 'sandbag', c: [r3(x), y, r3(z)], rotY, name, order: 10 + bagIdx++, anim: 'drop' });
  posts.forEach((P) => {
    if (P.mid) { bag(P.x, 0.06, P.z - 0.3, 0, `Bao cát ${P.key}`); bag(P.x, 0.18, P.z - 0.3, 0.2, `Bao cát ${P.key}`); return; }
    if (P.sz > 0) { // cột trước: bao cát đặt ra phía hông (không chắn lối khách)
      bag(P.x + P.sx * 0.32, 0.06, P.z - 0.02, Math.PI / 2, `Bao cát ${P.key}`);
      bag(P.x + P.sx * 0.32, 0.18, P.z - 0.02, Math.PI / 2 + 0.2, `Bao cát ${P.key}`);
    } else {
      bag(P.x + P.sx * 0.32, 0.06, P.z, Math.PI / 2, `Bao cát ${P.key}`);
      bag(P.x, 0.06, P.z - 0.32, 0, `Bao cát ${P.key}`);
    }
  });

  // ------------------------------------------------------------ GĐ2 cột
  posts.forEach((P, i) => {
    const top = P.mid ? Hp + db : Hp;
    seg(P.mid ? 'postMid' : 'post', [P.x, y0, P.z], [P.x, top, P.z], dp, 'A',
      { name: P.name, order: i, anim: 'raise', postKey: P.key, raiseAxis: P.sz > 0 ? [1, 0, 0] : [1, 0, 0], raiseSign: P.sz > 0 ? 1 : -1 });
  });

  // ------------------------------------------------------------ GĐ3 xà & giằng
  let o = 0;
  // xà dọc đỉnh cột (trái/phải)
  [-1, 1].forEach((s) => {
    seg('sideBeam', [s * px, Hp + db / 2, -(pz + 0.12)], [s * px, Hp + db / 2, pz + 0.12], db, 'B', { name: `Xà dọc đỉnh ${s < 0 ? 'trái' : 'phải'}`, order: o });
    joint([s * px, Hp - 0.01, pz]); joint([s * px, Hp - 0.01, -pz]);
  });
  o++;
  seg('tieBeam', [-(px + 0.06), Ht, zFrontFace], [px + 0.06, Ht, zFrontFace], db, 'B', { name: 'Xà ngang đầu cột trước', order: o, anim: 'slide', slideDir: [0, 0, 1] });
  seg('tieBeam', [-(px + 0.06), Ht, zBackFace], [px + 0.06, Ht, zBackFace], db, 'B', { name: 'Xà ngang đầu cột sau', order: o, anim: 'slide', slideDir: [0, 0, -1] });
  [-1, 1].forEach((s) => { joint([s * px, Ht, pz]); joint([s * px, Ht, -pz]); });
  if (hasMidPost) joint([0, Ht, -pz]);
  o++;
  seg('signBeam', [-(px + 0.06), Hs, zFrontFace], [px + 0.06, Hs, zFrontFace], db, 'B', { name: 'Xà đỡ bảng hiệu (trước)', order: o, anim: 'slide', slideDir: [0, 0, 1] });
  [-1, 1].forEach((s) => joint([s * px, Hs, pz]));
  seg('midRail', [xLeftFace, Hs, -(pz + 0.06)], [xLeftFace, Hs, pz + 0.06], db, 'B', { name: 'Xà ngang giữa vách trái', order: o, anim: 'slide', slideDir: [-1, 0, 0] });
  joint([-px, Hs, -pz]);
  o++;
  seg('midRail', [-(px + 0.06), 1.2, zBackFace], [px + 0.06, 1.2, zBackFace], db, 'B', { name: 'Xà ngang giữa vách sau', order: o, anim: 'slide', slideDir: [0, 0, -1] });
  [-1, 1].forEach((s) => joint([s * px, 1.2, -pz])); if (hasMidPost) joint([0, 1.2, -pz]);
  seg('groundTie', [xLeftFace, yGT, -(pz + 0.06)], [xLeftFace, yGT, pz + 0.06], db, 'B', { name: 'Giằng chân vách trái', order: o, anim: 'slide', slideDir: [-1, 0, 0] });
  seg('groundTie', [-(px + 0.06), yGT, zBackFace], [px + 0.06, yGT, zBackFace], db, 'B', { name: 'Giằng chân vách sau', order: o, anim: 'slide', slideDir: [0, 0, -1] });
  joint([-px, yGT, pz]); joint([-px, yGT, -pz]); joint([px, yGT, -pz]); if (hasMidPost) joint([0, yGT, -pz]);
  o++;
  // thanh chống góc
  const kb = 0.45;
  const zfb = pz + dp / 2 + dbr / 2;
  [-1, 1].forEach((s) => {
    seg('kneeBrace', [s * px, Hs - kb, zfb], [s * (px - kb), Hs, zfb], dbr, 'C', { name: `Chống góc mặt trước ${s < 0 ? 'trái' : 'phải'}`, order: o, anim: 'grow' });
    seg('kneeBrace', [s * px, Ht - kb, -zfb], [s * (px - kb), Ht, -zfb], dbr, 'C', { name: `Chống góc mặt sau ${s < 0 ? 'trái' : 'phải'}`, order: o, anim: 'grow' });
    joint([s * px, Hs - kb, pz]); joint([s * px, Ht - kb, -pz]);
  });
  if (hasMidPost) [-1, 1].forEach((s) => seg('kneeBrace', [0, Ht - kb, -zfb], [s * kb, Ht, -zfb], dbr, 'C', { name: 'Chống góc cột giữa sau', order: o, anim: 'grow' }));
  if (hasMidPost) joint([0, Ht - kb, -pz]);
  [-1, 1].forEach((s) => {
    [-1, 1].forEach((t) => seg('kneeBrace', [s * px, Hp - 0.5, t * (pz - dp / 2)], [s * px, Hp - 0.01, t * (pz - 0.5)], dbr, 'C',
      { name: `Chống góc vách ${s < 0 ? 'trái' : 'phải'} (${t > 0 ? 'trước' : 'sau'})`, order: o, anim: 'grow' }));
    joint([s * px, Hp - 0.5, pz]); joint([s * px, Hp - 0.5, -pz]);
  });
  o++;
  // giằng chéo chữ X: vách trái (mặt trong) + vách sau (từng khoang)
  const xin = -(px - dp / 2 - dbr / 2);
  seg('xBrace', [xin, yGT, pz - 0.04], [xin, Hs, -(pz - 0.04)], dbr, 'C', { name: 'Giằng chéo X vách trái (1)', order: o, anim: 'grow' });
  seg('xBrace', [xin + dbr, yGT, -(pz - 0.04)], [xin + dbr, Hs, pz - 0.04], dbr, 'C', { name: 'Giằng chéo X vách trái (2)', order: o, anim: 'grow' });
  const zin = -(pz - dp / 2 - dbr / 2);
  const bays = hasMidPost ? [[-px, 0], [0, px]] : [[-px, px]];
  bays.forEach(([x1, x2], bi) => {
    const m = 0.05;
    seg('xBrace', [x1 + m, yGT, zin], [x2 - m, Ht - 0.02, zin], dbr, 'C', { name: `Giằng chéo X vách sau – khoang ${bi + 1} (1)`, order: o + 1, anim: 'grow' });
    seg('xBrace', [x2 - m, yGT, zin + dbr], [x1 + m, Ht - 0.02, zin + dbr], dbr, 'C', { name: `Giằng chéo X vách sau – khoang ${bi + 1} (2)`, order: o + 1, anim: 'grow' });
  });
  o += 2;

  // ------------------------------------------------------------ GĐ4 mái
  const yRB = Hp + db + db / 2;
  const roofBeamZ = hasMidRoofBeam ? [pz, 0, -pz] : [pz, -pz];
  roofBeamZ.forEach((z, i) => {
    seg('roofBeam', [-(px + 0.2), yRB, z], [px + 0.2, yRB, z], db, 'B', { name: `Đòn tay mái ${['trước', 'giữa', 'sau'][hasMidRoofBeam ? i : i * 2]}`, order: i });
    [-1, 1].forEach((s) => joint([s * px, yRB, z], [1, 0, 0], db / 2 + 0.006, 4, 3, 'Mối buộc chéo đòn tay – xà dọc'));
  });
  if (hasMidPost) joint([0, Hp + db - 0.02, -pz], [0, 1, 0], dp / 2 + 0.007, 4, 3);
  const ySL = Hp + 2 * db + ds / 2;
  const slatSpan = 2 * px + 0.36;
  const nSlat = Math.max(8, Math.round(slatSpan / 0.12) + 1);
  const slatStep = slatSpan / (nSlat - 1);
  for (let i = 0; i < nSlat; i++) {
    const x = -slatSpan / 2 + i * slatStep;
    seg('roofSlat', [x, ySL, -(pz + 0.15)], [x, ySL, pz + 0.15], ds, 'C', { name: `Nan mái #${i + 1}/${nSlat}`, order: 10 + i, anim: 'slide', slideDir: [0, 0, -1], slideDist: 2.5 });
  }

  // ------------------------------------------------------------ GĐ5 quầy
  const cabW = 0.45;
  const zF = pz + 0.06;                       // mép trước quầy
  const zB = zF - Dc;                         // mép sau quầy
  const xL = -px + dp / 2 + 0.01;
  const xR = px - dp / 2 - 0.01 - cabW - 0.02;
  const Lc = xR - xL;
  const legZf = zF - 0.1, legZb = zB + 0.05;
  const nLegSpan = Math.max(1, Math.ceil((Lc - 0.08) / 1.0));
  const legXs = []; for (let i = 0; i <= nLegSpan; i++) legXs.push(xL + 0.04 + (Lc - 0.08) * i / nLegSpan);
  const yTopRail = Hc - 0.018 - dcf / 2;
  legXs.forEach((x, i) => {
    seg('counterLeg', [x, 0.01, legZf], [x, yTopRail + dcf / 2, legZf], dcf, 'C', { name: `Chân quầy trước #${i + 1}`, order: 0, anim: 'grow' });
    seg('counterLeg', [x, 0.01, legZb], [x, yTopRail + dcf / 2, legZb], dcf, 'C', { name: `Chân quầy sau #${i + 1}`, order: 0, anim: 'grow' });
  });
  [[legZf, 'trước'], [legZb, 'sau']].forEach(([z, n]) => {
    seg('counterRail', [xL, yTopRail, z], [xR, yTopRail, z], dcf, 'C', { name: `Khung trên quầy (${n})`, order: 1 });
    seg('counterRail', [xL, 0.26, z], [xR, 0.26, z], dcf, 'C', { name: `Khung kệ dưới (${n})`, order: 1 });
  });
  [legXs[0], legXs[legXs.length - 1]].forEach((x, i) => {
    seg('counterRail', [x, yTopRail - 0.0, legZb], [x, yTopRail, legZf], dcf, 'C', { name: `Khung hông quầy ${i ? 'phải' : 'trái'}`, order: 1 });
  });
  add('counterShelf', { shape: 'box', c: [r3((xL + xR) / 2), 0.26 + dcf / 2 + 0.006, r3((legZf + legZb) / 2)], s: [r3(Lc - 0.02), 0.012, r3(legZf - legZb + dcf)], mat: 'plywood', name: 'Kệ dưới quầy', order: 2 });
  add('counterTop', { shape: 'box', c: [r3((xL + xR) / 2), Hc - 0.009, r3(zF - Dc / 2)], s: [r3(Lc + 0.02), 0.018, Dc], mat: 'plywood', name: 'Mặt quầy ván ép', order: 3 });
  const zTrim = zF - 0.022;
  seg('counterTrim', [xL, Hc - 0.05, zTrim], [xR, Hc - 0.05, zTrim], 0.04, 'C', { name: 'Nẹp ngang trên mặt quầy', order: 4, anim: 'slide', slideDir: [0, 0, 1] });
  seg('counterTrim', [xL, 0.12, zTrim], [xR, 0.12, zTrim], 0.04, 'C', { name: 'Nẹp ngang dưới mặt quầy', order: 4, anim: 'slide', slideDir: [0, 0, 1] });
  const slatPitch = 0.055;
  const zSl = zF - 0.042 - dcs / 2;
  const nCS = Math.floor((Lc - 0.04) / slatPitch);
  const csOff = (Lc - (nCS - 1) * slatPitch) / 2;
  for (let i = 0; i < nCS; i++) {
    const x = xL + csOff + i * slatPitch;
    seg('counterSlat', [x, 0.03, zSl], [x, Hc - 0.022, zSl], dcs, 'D', { name: `Nan ốp quầy trước #${i + 1}/${nCS}`, order: 5 + i * 0.25, anim: 'grow' });
  }
  const xSide = xL - dcs / 2 - 0.005;
  const nSS = Math.floor((Dc - 0.14) / slatPitch);
  for (let i = 0; i < nSS; i++) {
    const z = zF - 0.1 - i * slatPitch;
    seg('counterSlat', [xSide, 0.03, z], [xSide, Hc - 0.022, z], dcs, 'D', { name: `Nan ốp hông quầy #${i + 1}/${nSS}`, order: 5 + nCS * 0.25 + i * 0.25, anim: 'grow' });
  }
  const oF = 7 + nCS * 0.25 + nSS * 0.25;
  const cabX = (xR + 0.02 + (px - dp / 2 - 0.01)) / 2;
  add('cabinet', { shape: 'cabinet', c: [r3(cabX), 0, r3(zF - 0.28)], s: [cabW, 0.78, 0.5], name: 'Tủ ngăn kéo (mượn)', order: oF, anim: 'drop' });
  const tW = Math.min(1.2, 2 * px - 0.8), tD = 0.6;
  const tZ = -pz + dp / 2 + 0.25 + tD / 2;
  add('prepTable', { shape: 'table', c: [0, 0, r3(tZ)], s: [r3(tW), 0.75, tD], name: 'Bàn gấp chuẩn bị (mượn)', order: oF, anim: 'drop' });
  const stove = [r3(Math.min(0.2, tW / 2 - 0.2)), 0.75, r3(tZ + 0.1)];
  add('stove', { shape: 'stove', c: stove, s: [0.3, 0.06, 0.36], name: 'Bếp điện từ (tuỳ chọn)', order: oF + 1, anim: 'drop' });
  add('cooler', { shape: 'cooler', c: [r3(xR - 0.25), Hc, r3(zF - Dc * 0.58)], r: 0.12, h: 0.3, name: 'Thùng đá giữ lạnh', order: oF + 1, anim: 'drop' });
  add('menuStand', { shape: 'menu', c: [r3(xR - 0.62), Hc, r3(zF - 0.14)], s: [0.16, 0.22, 0.1], name: 'Kệ menu mica A5', order: oF + 1, anim: 'drop' });

  // ------------------------------------------------------------ GĐ6 bảng hiệu
  const signT = 0.014;
  const zSign = zFrontFace + db / 2 + signT / 2 + 0.002;
  const boardH = r3(Ht - Hs + 0.08);
  const ySign = r3((Ht + Hs) / 2);
  const discD = r3(Math.min(0.68, boardH + 0.04));
  const discR = discD / 2;
  const availL = 2 * (px - discR - 0.03);
  // Đổi chỗ: Bảng D26 ở bên trái-giữa, Bảng ASTRA.SEC (STR4.SEC) ở bên phải-giữa và làm bảng STR4.SEC to nổi bật hơn
  let d26W = Math.min(0.95, 0.44 * availL);
  let strW = Math.min(1.35, availL - d26W - 0.03);
  const pairW = d26W + 0.03 + strW;
  const d26X = -pairW / 2 + d26W / 2;
  const strX = pairW / 2 - strW / 2;
  add('signPTIT', { shape: 'signDisc', logo: 'ptit', c: [r3(-px), r3(ySign + 0.02), r3(zSign)], r: r3(discR), t: signT, name: 'Biển tròn logo PTIT (trái)', order: 0, anim: 'slide', slideDir: [0, 0, 1], slideDist: 1.2 });
  add('signD26', { shape: 'signBoard', logo: 'd26', c: [r3(d26X), ySign, r3(zSign)], s: [r3(d26W), boardH, signT], name: 'Bảng LCD An toàn thông tin D26 (trái-giữa)', order: 1, anim: 'slide', slideDir: [0, 0, 1], slideDist: 1.2 });
  add('signSTR4', { shape: 'signBoard', logo: 'str4', c: [r3(strX), ySign, r3(zSign)], s: [r3(strW), r3(boardH + 0.04), signT], name: 'Bảng ASTRA.SEC / STR4.SEC (phải-giữa, cỡ lớn)', order: 2, anim: 'slide', slideDir: [0, 0, 1], slideDist: 1.2 });
  add('signDoan', { shape: 'signDisc', logo: 'doan', c: [r3(px), r3(ySign + 0.02), r3(zSign)], r: r3(discR), t: signT, name: 'Biển tròn logo Đoàn TN (phải)', order: 3, anim: 'slide', slideDir: [0, 0, 1], slideDist: 1.2 });
  // Biển đám mây "Ẩm thực Ngân hà" kích thước lớn đúng tỷ lệ bản vẽ thiết kế gốc (trải rộng ~90% mặt tiền và nhô cao qua mép quầy bên trái)
  const cloudW = r3(W * 0.90);
  const cloudH = r3(Hc * 1.32);
  add('cloudSign', { shape: 'cloud', c: [r3(-W * 0.05), r3(0.01 + cloudH / 2), r3(zF + 0.028)], s: [cloudW, cloudH, 0.012], name: 'Biển mây "ẨM THỰC NGÂN HÀ" (cỡ lớn theo bản vẽ)', order: 4, anim: 'slide', slideDir: [0, 0, 1], slideDist: 1.2 });

  // ------------------------------------------------------------ GĐ7 trang trí
  const yRoofUnder = Hp + 2 * db;           // mặt dưới nan mái
  const nStar = Math.max(3, Math.min(9, Math.round((2 * px - 0.4) / 0.45)));
  const starZ = r3(zF - Dc / 2 + 0.05);
  const heightPattern = [0, -0.13, 0.04, -0.09, 0.02, -0.15, 0.05, -0.1, 0];
  const starR = 0.17;
  const hangs = [];
  for (let i = 0; i < nStar; i++) {
    const x = -px + 0.3 + (2 * px - 0.6) * (nStar === 1 ? 0.5 : i / (nStar - 1));
    const yc = Hs - 0.3 + heightPattern[i % heightPattern.length];
    const line = yRoofUnder - (yc + starR);
    hangs.push(line);
    add('hangStar', { shape: 'hangStar', c: [r3(x), r3(yc), starZ], r: starR, line: r3(line), name: `Ngôi sao treo #${i + 1}/${nStar}`, order: i, anim: 'pop', rotY: (i % 2 ? 0.35 : -0.3) });
  }
  const smallStars = [
    [-(px + 0.12), yRB, pz + db / 2 + 0.006], [px + 0.12, yRB, pz + db / 2 + 0.006],
    [-(px + 0.12), yRB, -(pz + db / 2 + 0.006)], [px + 0.12, yRB, -(pz + db / 2 + 0.006)],
    [-px, Hp + db / 2, pz + 0.12 + 0.006], [px, Hp + db / 2, pz + 0.12 + 0.006],
  ];
  smallStars.forEach((c, i) => add('smallStar', { shape: 'smallStar', c: c.map(r3), size: i < 4 ? 0.1 : 0.08, flip: c[2] < 0, name: `Sao foam nhỏ #${i + 1}`, order: nStar + 1 + i * 0.3, anim: 'pop' }));
  const planets = [
    { name: 'Hành tinh vàng "Sao Thổ STR4" + vành + quỹ đạo', c: [-px + 0.42, Hp - 0.32, 0.05], r: 0.13, ring: [0.17, 0.25], orbit: [0.42, 0.3], tilt: 0.42, palette: 'gold', ball: 'Ø26 cm' },
    { name: 'Hành tinh xanh "Data Planet" + quỹ đạo', c: [px - 0.45, Hp - 0.4, -0.05], r: 0.09, ring: null, orbit: [0.2, 0.2], tilt: 1.0, palette: 'cyan', ball: 'Ø18 cm' },
    { name: 'Hành tinh cam "Sao Hoả" + quỹ đạo', c: [-px + 0.45, Hp - 0.52, -pz + 0.42], r: 0.07, ring: null, orbit: [0.16, 0.16], tilt: -0.6, palette: 'orange', ball: 'Ø14 cm' },
  ];
  planets.forEach((pl, i) => {
    const line = yRoofUnder - (pl.c[1] + pl.r);
    hangs.push(line);
    add('planet', { shape: 'planet', ...pl, c: pl.c.map(r3), line: r3(line), order: nStar + 4 + i, anim: 'pop' });
  });
  const zPostFace = pz + dp / 2 + 0.008;
  add('shield', { shape: 'shield', c: [r3(-px), 1.13, r3(zPostFace)], s: [0.2, 0.24, 0.008], name: 'Khiên bảo mật (cột C1)', order: nStar + 8, anim: 'pop' });
  add('padlock', { shape: 'padlock', c: [r3(px), 1.1, r3(zPostFace)], s: [0.19, 0.16, 0.008], name: 'Ổ khóa bảo mật (cột C2)', order: nStar + 8, anim: 'pop' });
  add('binaryStrip', { shape: 'panel', panel: 'binary', c: [r3((xL + xR) / 2), r3(Hc - 0.1), r3(zSl + dcs / 2 + 0.004)], s: [r3(Lc - 0.1), 0.05, 0.005], name: 'Dải nhị phân 0–1 mặt quầy', order: nStar + 9, anim: 'grow' });
  add('circuitPanel', { shape: 'panel', panel: 'circuit', c: [r3(xSide - dcs / 2 - 0.004), r3(Hc * 0.5), r3(zF - Dc / 2 - 0.02)], s: [r3(Math.min(0.42, Dc - 0.16)), r3(Math.min(0.42, Hc - 0.3)), 0.005], rotY: -Math.PI / 2, name: 'Tấm mạch điện hông quầy', order: nStar + 9, anim: 'pop' });

  // LED & dây điện
  const ledSign = seg('ledStrip', [-(px - 0.06), Hs - db / 2 - 0.008, zFrontFace + 0.01], [px - 0.06, Hs - db / 2 - 0.008, zFrontFace + 0.01], 0.014, null,
    { name: 'LED xanh dưới xà bảng hiệu', order: nStar + 11, anim: 'grow', color: '#00CFFF', bamboo: false });
  const ledCounter = seg('ledStrip', [xL + 0.02, Hc - 0.024, zF - 0.012], [xR - 0.02, Hc - 0.024, zF - 0.012], 0.012, null,
    { name: 'LED xanh viền mặt quầy', order: nStar + 11, anim: 'grow', color: '#00CFFF', bamboo: false });
  // Dây đom đóm zic-zắc dưới nửa trước mái (không đi qua khu bếp)
  const fy = yRoofUnder - 0.02;
  const zz1 = pz - 0.05, zz2 = Math.max(0.12, zB - 0.05);
  const nZig = Math.max(4, Math.round((2 * px) / 0.55));
  const fairyPts = [];
  for (let i = 0; i < nZig; i++) {
    const xa = -px + 0.08 + (2 * px - 0.16) * i / nZig;
    const xb = -px + 0.08 + (2 * px - 0.16) * (i + 1) / nZig;
    const a = [xa, fy, i % 2 ? zz2 : zz1], b = [xb, fy, i % 2 ? zz1 : zz2];
    const seg2 = catenaryPath(a, b, 0.14, 10);
    if (i > 0) seg2.shift();
    fairyPts.push(...seg2);
  }
  add('fairyLights', { shape: 'tube', path: fairyPts.map((q) => q.map(r3)), radius: 0.003, bulbs: true, color: '#FFC86B', length: r3(pathLength(fairyPts)), name: 'Dây đèn đom đóm vàng ấm', order: nStar + 12, anim: 'draw' });
  // tuyến điện: ổ cắm BTC (ngoài góc sau phải) -> cột C3 -> adapter -> xà dọc phải -> cột C2 -> LED
  const wx = px + dp / 2 + 0.01;
  const adapterY = 1.3;
  const wire = [
    [px + 0.6, 0.01, -pz - 0.6], [wx, 0.01, -pz - 0.05], [wx, adapterY - 0.1, -pz - 0.05],
    [wx, adapterY + 0.1, -pz - 0.05], [wx, Hp + 0.0, -pz - 0.05], [wx, Hp + 0.0, pz - 0.06],
    [wx, Hs - 0.05, pz - 0.06], [px - 0.06, Hs - db / 2 - 0.01, zFrontFace],
  ];
  const wire2 = [[wx, Hs - 0.05, pz - 0.06], [wx, Hc - 0.03, pz - 0.06], [xR - 0.02, Hc - 0.03, zF - 0.03]];
  const wireFairy = [[wx, Hp, pz - 0.06], [px - 0.08, fy, zz1]];
  const groundWireLen = dist(wire[0], wire[1]) + 0.2;
  add('wiring', { shape: 'tube', path: wire.map((q) => q.map(r3)), radius: 0.005, color: '#1b1b1f', length: r3(pathLength(wire)), name: 'Tuyến dây nguồn chính (đi trên cao)', order: nStar + 10, anim: 'draw', polyline: true });
  add('wiring', { shape: 'tube', path: wire2.map((q) => q.map(r3)), radius: 0.004, color: '#1b1b1f', length: r3(pathLength(wire2)), name: 'Nhánh dây LED quầy (dọc cột C2)', order: nStar + 10, anim: 'draw', polyline: true });
  add('wiring', { shape: 'tube', path: wireFairy.map((q) => q.map(r3)), radius: 0.004, color: '#1b1b1f', length: r3(pathLength(wireFairy)), name: 'Nhánh dây đèn đom đóm', order: nStar + 10, anim: 'draw', polyline: true });
  add('adapter', { shape: 'box', c: [r3(wx + 0.03), adapterY, r3(-pz - 0.05)], s: [0.06, 0.16, 0.11], mat: 'adapter', name: 'Hộp nguồn adapter 12V + ổ cắm có CB', order: nStar + 10, anim: 'pop' });
  // phông nền
  const bdW = r3(2 * px - dp - 0.02), bdY1 = 0.5, bdY2 = r3(Ht - 0.04);
  add('backdrop', { shape: 'backdrop', c: [0, r3((bdY1 + bdY2) / 2), r3(-(pz - dp / 2 - dbr - 0.02))], s: [bdW, r3(bdY2 - bdY1), 0.002], name: 'Phông nền bạt in dải ngân hà', order: nStar + 13, anim: 'grow' });

  // ------------------------------------------------------------ CỔNG TRẠI (ĐIỀU CHỈNH ĐỘC LẬP VỚI GIAN HÀNG)
  const gateSpan = p.gateSpan;
  const gateH = p.gateHeight;
  const ladderW = p.gateLadderWidth;
  const hScale = p.gateHeaderScale;
  const zGate = r3(pz + p.gateOffsetZ);
  const xGateIn = r3(gateSpan / 2);
  const xGateOut = r3(xGateIn + ladderW);
  const gateTotalW = r3(2 * xGateOut);
  const banH = r3(1.08 * hScale);
  const globeR = r3(0.58 * hScale);
  const banY = r3(gateH - Math.max(banH / 2, globeR));
  const yGatePostTop = r3(Math.max(1.8, banY + banH * 0.25));
  const kGateH = yGatePostTop / 3.02;

  // GĐ1: 4 chân đế xô bê tông của 2 trụ thang cổng trại
  [[-xGateOut, 'trái ngoài'], [-xGateIn, 'trái trong'], [xGateIn, 'phải trong'], [xGateOut, 'phải ngoài']].forEach(([gx, label], gi) => {
    add('footing', { shape: 'footing', group: 'campGate', c: [gx, 0, zGate], r: 0.15, h: 0.32, name: `Chân đế xô bê tông cổng trại (${label})`, order: 20 + gi, anim: 'drop' });
  });

  // GĐ2: 4 cột trụ thang cổng trại
  [[-xGateOut, 'Trụ cổng trái ngoài'], [-xGateIn, 'Trụ cổng trái trong'], [xGateIn, 'Trụ cổng phải trong'], [xGateOut, 'Trụ cổng phải ngoài']].forEach(([gx, label], gi) => {
    seg('gatePost', [gx, y0, zGate], [gx, yGatePostTop, zGate], dp, 'A', { name: label, order: 10 + gi, anim: 'raise', raiseSign: 1 });
  });

  // GĐ3: 10 bậc thang ngang (5 bậc/trụ) + 4 thanh giằng nối cổng vào cột trước gian hàng + 2 xà ngang đỉnh cổng
  const rungYs = [0.62, 1.15, 1.68, 2.21, 2.74].map((y) => r3(y * kGateH));
  [-1, 1].forEach((s) => {
    const sideName = s < 0 ? 'trái' : 'phải';
    rungYs.forEach((ry, ri) => {
      seg('gateRung', [s * (xGateOut + 0.04), ry, zGate], [s * (xGateIn - 0.04), ry, zGate], db, 'B',
        { name: `Bậc thang cổng ${sideName} #${ri + 1}`, order: 20 + ri, anim: 'grow' });
    });
    // Thanh giằng nối trụ cổng trong vào cột trước gian hàng (khóa cứng cổng + gian hàng)
    const tieY1 = Math.min(Hs, yGatePostTop - 0.3);
    const tieY2 = Math.min(Ht, yGatePostTop - 0.1);
    seg('gateRung', [s * xGateIn, tieY1, zGate], [s * px, tieY1, pz], dbr, 'C', { name: `Thanh giằng nối cổng – gian hàng (${sideName} dưới)`, order: 26, anim: 'grow' });
    seg('gateRung', [s * xGateIn, tieY2, zGate], [s * px, tieY2, pz], dbr, 'C', { name: `Thanh giằng nối cổng – gian hàng (${sideName} trên)`, order: 26, anim: 'grow' });
  });
  const yGateBeamLow = r3(banY - banH * 0.38);
  const yGateBeamHigh = r3(banY + banH * 0.32);
  seg('gateRung', [-(xGateOut + 0.08), yGateBeamLow, r3(zGate - db * 0.8)], [xGateOut + 0.08, yGateBeamLow, r3(zGate - db * 0.8)], db, 'B', { name: 'Xà ngang dưới đỡ băng rôn đỉnh cổng', order: 28, anim: 'slide', slideDir: [0, 1, 0] });
  seg('gateRung', [-(xGateOut + 0.08), yGateBeamHigh, r3(zGate - db * 0.8)], [xGateOut + 0.08, yGateBeamHigh, r3(zGate - db * 0.8)], db, 'B', { name: 'Xà ngang trên đỡ băng rôn đỉnh cổng', order: 28, anim: 'slide', slideDir: [0, 1, 0] });

  // GĐ6: Băng rôn đuôi én STR4.SEC đỉnh cổng + Quả cầu Mắt thần An ninh mạng + 3 Logo trên trụ thang
  const banX1 = -(xGateIn + 0.12 * hScale);
  const banX2 = xGateOut + 0.26 * hScale;
  const banW = r3(banX2 - banX1);
  add('gateBanner', {
    shape: 'gateBanner',
    c: [r3((banX1 + banX2) / 2), banY, r3(zGate + 0.03)],
    s: [banW, banH, 0.018],
    name: 'Băng rôn đuôi én ASTRA.SEC / STR4.SEC (Đỉnh cổng trại)',
    order: 6,
    anim: 'drop',
  });

  add('gateGlobe', {
    shape: 'gateGlobe',
    c: [r3(-(xGateIn + ladderW * 0.45)), r3(banY + 0.04 * hScale), r3(zGate + 0.065)],
    r: globeR,
    t: 0.024,
    name: 'Quả cầu Mắt thần An ninh mạng (Đỉnh cổng trái)',
    order: 7,
    anim: 'pop',
  });

  // 3 Logo gắn trên 2 trụ thang cổng đúng vị trí ảnh thiết kế cổng trại
  add('gateBadge', {
    shape: 'gateBadge',
    logo: 'ptit_cutout',
    c: [r3(-xGateOut - 0.02), r3(2.08 * kGateH), r3(zGate + 0.045)],
    s: [r3(0.54 * hScale), r3(0.64 * hScale), 0.012],
    name: 'Logo PTIT gắn trụ thang cổng trái',
    order: 8,
    anim: 'pop',
  });
  add('gateBadge', {
    shape: 'gateBadge',
    logo: 'd26_square',
    c: [r3(-xGateIn + 0.02), r3(1.42 * kGateH), r3(zGate + 0.045)],
    s: [r3(0.48 * hScale), r3(0.48 * hScale), 0.012],
    name: 'Logo ATTT D26 gắn trụ thang cổng trái',
    order: 8,
    anim: 'pop',
  });
  add('gateBadge', {
    shape: 'gateBadge',
    logo: 'doan_cutout',
    c: [r3(xGateIn + 0.08), r3(2.02 * kGateH), r3(zGate + 0.045)],
    s: [r3(0.54 * hScale), r3(0.56 * hScale), 0.012],
    name: 'Logo Đoàn Thanh niên gắn trụ thang cổng phải',
    order: 8,
    anim: 'pop',
  });

  // GĐ7: Cụm chân cổng trái (Cánh sóng mạch điện + Khiên khóa bảo mật) & chân cổng phải (Cánh sóng + Cụm sao 5 cánh đa lớp) + Sao 4 cánh lấp lánh
  add('gateWave', {
    shape: 'gateWave',
    side: -1,
    c: [r3(-(xGateIn + ladderW * 0.52)), 0.34, r3(zGate + 0.055)],
    s: [r3(1.18 * hScale), r3(0.68 * hScale), 0.02],
    name: 'Cánh sóng mạch điện ngân hà (Chân cổng trái)',
    order: nStar + 14,
    anim: 'pop',
  });
  add('gateShield', {
    shape: 'gateShield',
    c: [r3(-(xGateIn + ladderW * 0.32)), 0.50, r3(zGate + 0.095)],
    s: [r3(0.64 * hScale), r3(0.74 * hScale), 0.022],
    name: 'Khiên bảo mật & Ổ khóa phát sáng (Chân cổng trái)',
    order: nStar + 15,
    anim: 'pop',
  });
  add('gateWave', {
    shape: 'gateWave',
    side: 1,
    c: [r3(xGateIn + ladderW * 0.52), 0.34, r3(zGate + 0.055)],
    s: [r3(1.18 * hScale), r3(0.68 * hScale), 0.02],
    name: 'Cánh sóng mạch điện ngân hà (Chân cổng phải)',
    order: nStar + 14,
    anim: 'pop',
  });
  add('gateStarCluster', {
    shape: 'gateStarCluster',
    c: [r3(xGateIn + ladderW * 0.34), 0.48, r3(zGate + 0.095)],
    r: r3(0.40 * hScale),
    name: 'Cụm ngôi sao 5 cánh đa lớp (Chân cổng phải)',
    order: nStar + 15,
    anim: 'pop',
  });

  // Các ngôi sao 4 cánh lấp lánh (vàng #FFD85A & xanh cyan #00CFFF) dọc 2 trụ thang cổng
  const sparkles = [
    // Trụ trái
    [-xGateOut, 2.52 * kGateH, 0.22, 'gold'],
    [-xGateIn, 2.28 * kGateH, 0.22, 'cyan'],
    [-xGateIn, 1.85 * kGateH, 0.26, 'gold'],
    [-xGateOut, 1.48 * kGateH, 0.20, 'gold'],
    [-xGateOut, 0.92 * kGateH, 0.26, 'gold'],
    [-xGateIn, 0.88 * kGateH, 0.21, 'cyan'],
    // Trụ phải
    [xGateIn, 2.54 * kGateH, 0.28, 'cyan'],
    [xGateOut, 2.42 * kGateH, 0.20, 'gold'],
    [xGateOut, 1.88 * kGateH, 0.26, 'gold'],
    [xGateIn, 1.46 * kGateH, 0.22, 'gold'],
    [xGateOut, 1.42 * kGateH, 0.22, 'gold'],
    [xGateOut, 1.02 * kGateH, 0.24, 'cyan'],
    [xGateIn, 0.78 * kGateH, 0.20, 'gold'],
  ];
  sparkles.forEach(([sx, sy, sz, col], si) => {
    add('gateSparkle', {
      shape: 'gateSparkle',
      c: [r3(sx), r3(sy), r3(zGate + 0.055)],
      size: r3(sz * hScale),
      palette: col,
      name: `Sao 4 cánh phát sáng (${col === 'cyan' ? 'Xanh Cyan' : 'Vàng'}) #${si + 1}`,
      order: nStar + 16 + si * 0.2,
      anim: 'pop',
    });
  });

  // ------------------------------------------------------------ vùng & chỉ số
  const zones = {
    footprint: { x1: -W / 2, x2: W / 2, z1: -D / 2, z2: D / 2 },
    roofPrint: { x1: -(px + 0.2), x2: px + 0.2, z1: -(pz + 0.15), z2: pz + 0.15 },
    customer: { x1: -W / 2, x2: W / 2, z1: D / 2 + 0.1, z2: D / 2 + 1.6 },
    service: { x1: xL, x2: xR + cabW, z1: tZ + tD / 2, z2: zB },
    staffEntry: { x: W / 2, z1: -pz + 0.1, z2: zB - 0.05 },
    heat: { c: stove, r: 0.5, top: yRoofUnder },
    posts: posts.map((P) => ({ key: P.key, x: P.x, z: P.z })),
  };
  const aisle = r3(zB - (tZ + tD / 2));

  const segs = parts.filter((q) => q.shape === 'seg' && q.bamboo !== false);
  const metrics = {
    nPosts: posts.length, nSlat, slatStep: r3(slatStep), nCS, nSS, nStar, nJoints: joints.length,
    Lc: r3(Lc), aisle, Hp: r3(Hp), Ht: r3(Ht), Hs: r3(Hs), boardH, discD, strW: r3(strW), d26W: r3(d26W),
    cloudW, cloudH, hangLines: hangs.map(r3), ledLength: r3(ledSign.length + ledCounter.length),
    fairyLength: r3(pathLength(fairyPts)), wireLength: r3(pathLength(wire) + pathLength(wire2) + pathLength(wireFairy)),
    groundWireLen: r3(groundWireLen), backdropArea: r3(bdW * (bdY2 - bdY1)), bdW, bdH: r3(bdY2 - bdY1),
    frameMembers: segs.filter((q) => ['sideBeam', 'tieBeam', 'signBeam', 'midRail', 'groundTie', 'kneeBrace', 'xBrace', 'roofBeam'].includes(q.type)).length,
    footprintW: r3(Math.max(W + 0.4, 2 * px + 0.4 + 0.3)), footprintD: r3(D + 0.3),
    clearUnderSign: r3(Hs - db / 2), heatToBackdrop: r3(Math.abs(stove[2] - (-(pz - dp / 2 - dbr - 0.02)))),
    gateSpan: r3(gateSpan), gateHeight: r3(gateH), gateTotalW, gateLadderW: r3(ladderW), yGatePostTop, zGate,
  };

  return {
    params: p, sec, kind, profile,
    dims: { W, D, H, Hc, Dc, px, pz, Hp, Ht, Hs, dp, db, dbr, ds, dcf, dcs, y0, yGT, zF, zB, xL, xR, Lc, zSign, ySign, yRoofUnder, zFrontFace, gateSpan, gateH, gateTotalW, xGateIn, xGateOut, yGatePostTop, zGate },
    parts, zones, metrics,
  };
}

// Mô tả kích thước để hiển thị
export function describeDims(part) {
  const cm = (m) => (m * 100).toFixed(m < 0.1 ? 1 : 0);
  switch (part.shape) {
    case 'seg': {
      const sec = part.profile === 'square' && part.bamboo !== false ? `${cm(part.d)}×${cm(part.d)} cm` : `Ø${cm(part.d)} cm`;
      return `${sec} × dài ${part.length.toFixed(2)} m`;
    }
    case 'box': case 'cabinet': case 'table': case 'stove': case 'menu': case 'signBoard': case 'panel': case 'backdrop': case 'cloud': case 'shield': case 'padlock': case 'gateBanner': case 'gateBadge': case 'gateWave': case 'gateShield':
      return `${part.s[0].toFixed(2)} × ${part.s[1].toFixed(2)} m${part.s[2] ? ` × dày ${cm(part.s[2])} cm` : ''}`;
    case 'signDisc': case 'gateGlobe': return `Đường kính ${(part.r * 2).toFixed(2)} m × dày ${cm(part.t)} cm`;
    case 'gateStarCluster': return `Đường kính cụm sao ${(part.r * 2).toFixed(2)} m`;
    case 'gateSparkle': return `Sao 4 cánh ${cm(part.size)} cm`;
    case 'footing': return `Xô Ø${cm(part.r * 2)} cm × cao ${cm(part.h)} cm`;
    case 'sandbag': return '≈ 42 × 28 × 12 cm (~15 kg)';
    case 'ring': return `Ø${cm(part.r * 2)} cm`;
    case 'hangStar': return `Sao Ø${cm(part.r * 2)} cm, dây treo ${part.line.toFixed(2)} m`;
    case 'smallStar': return `Sao ${cm(part.size)} cm`;
    case 'planet': return `Cầu xốp ${part.ball}, quỹ đạo ${cm(part.orbit[0] * 2)} cm, dây treo ${part.line.toFixed(2)} m`;
    case 'cooler': return `Ø${cm(part.r * 2)} × cao ${cm(part.h)} cm`;
    case 'tube': return `Chiều dài ${part.length.toFixed(2)} m`;
    default: return '';
  }
}
