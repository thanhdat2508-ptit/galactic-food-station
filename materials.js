// =====================================================================
//  materials.js — DỰ TOÁN VẬT TƯ (BOM) & TỐI ƯU CẮT CÂY TỪ HÌNH HỌC 3D
//  Mọi số lượng được tính trực tiếp từ danh sách cấu kiện của layout.js
//  (thuật toán ghép thanh First-Fit Decreasing trên cây tiêu chuẩn 4,0 m,
//   diện tích tấm, chiều dài dây thực tế + hệ số hao hụt thi công).
// =====================================================================

export const DEFAULT_PRICES = {
  pole_A_bamboo: 65000,   // Tre đực Ø8–10 cm, cây 4m
  pole_B_bamboo: 45000,   // Tre Ø6–8 cm, cây 4m
  pole_C_bamboo: 28000,   // Tre Ø4–5 cm, cây 4m
  pole_D_bamboo: 18000,   // Tre nan Ø3–4 cm, cây 4m
  pole_A_wood: 110000,    // Gỗ keo 8×8 cm, cây 3m
  pole_B_wood: 75000,     // Gỗ keo 6×6 cm, cây 3m
  pole_C_wood: 45000,     // Gỗ keo 4×4 cm, cây 3m
  pole_D_wood: 28000,     // Nẹp gỗ 3×3 cm, cây 3m
  pole_A_pvc: 135000,     // Ống PVC Ø90 giả tre + lõi, cây 4m
  pole_B_pvc: 85000,      // Ống PVC Ø60, cây 4m
  pole_C_pvc: 52000,      // Ống PVC Ø42, cây 4m
  pole_D_pvc: 35000,      // Ống PVC Ø34, cây 4m
  pu_coat: 85000,         // Sơn bóng PU / vecni (lon 0,8L)
  footing_bucket: 38000,  // Xô nhựa 20L cũ + ống PVC Ø114 + bê tông mác thấp
  sandbag: 12000,         // Bao tải dứa + cát (~15 kg/bao)
  bolt_m8: 3500,          // Bộ bu lông M8×150 + 2 long đền + ê cu
  rattan_roll: 35000,     // Cuộn dây mây nhựa / dây đay buộc mối nối (50m)
  ziptie_pack: 22000,     // Bịch dây rút nhựa 30cm (100 sợi)
  plywood_sheet: 210000,  // Tấm ván ép 12–15mm (1,22 × 2,44 m)
  foam_5mm: 65000,        // Tấm foam/format 5mm (1,2 × 2,4 m) làm bảng hiệu & icon
  foam_10mm: 95000,       // Tấm foam 10mm (0,8 × 1,8 m) làm biển mây trước quầy
  mica_2mm: 120000,       // Tấm mica trong 2mm phủ mặt bảng hiệu
  decal_m2: 65000,        // In decal PP cán bóng ngoài trời (m²)
  backdrop_m2: 45000,     // In bạt hiflex/mesh dải ngân hà (m²)
  bamboo_stick_pack: 25000, // Bó 50 que tre 5mm × 50cm đan ngôi sao
  cellophane_sheet: 8000, // Giấy kiếng vàng + keo nến dán sao
  foam_ball_set: 45000,   // Bộ 3 quả cầu xốp (Ø26, Ø18, Ø14 cm) + sơn acrylic
  orbit_pvc: 18000,       // Ống gen PVC uốn vòng quỹ đạo + dây kẽm
  fishing_line: 15000,    // Cuộn dây cước trong 0,5mm (100m)
  led_strip_m: 22000,     // LED dây 2835 12V xanh công nghệ IP65 (mét)
  fairy_string: 35000,    // Dây đèn LED đom đóm vàng ấm 10m
  mini_led_star: 6000,    // Đèn LED đom đóm pin cúc áo gắn trong ngôi sao
  adapter_12v: 65000,     // Nguồn tổ ong / Adapter 12V–5A
  wire_2x075_m: 7000,     // Dây điện đôi 2×0,75mm² + ống gen (mét)
};

// Thuật toán xếp đoạn cắt vào cây nguyên (First-Fit Decreasing)
export function packStock(lengths, stockLen = 4.0, kerf = 0.005) {
  const sorted = [...lengths].sort((a, b) => b - a);
  const bars = [];
  for (const raw of sorted) {
    const L = Math.min(stockLen, raw);
    let placed = false;
    for (const bar of bars) {
      const need = bar.cuts.length > 0 ? L + kerf : L;
      if (bar.rem >= need - 1e-6) {
        bar.cuts.push(Number(L.toFixed(3)));
        bar.rem = Number((bar.rem - need).toFixed(3));
        placed = true;
        break;
      }
    }
    if (!placed) {
      bars.push({ stockLen, cuts: [Number(L.toFixed(3))], rem: Number((stockLen - L).toFixed(3)) });
    }
  }
  const totalUsed = lengths.reduce((s, x) => s + x, 0);
  const totalStock = bars.length * stockLen;
  const wastePct = totalStock > 0 ? Math.round(((totalStock - totalUsed) / totalStock) * 100) : 0;
  return { count: bars.length, stockLen, bars, totalUsed: Number(totalUsed.toFixed(2)), wastePct };
}

export function computeBOM(layout, customPrices = {}, budgetLimit = 4500000, contingencyRate = 0.08) {
  const prices = { ...DEFAULT_PRICES, ...customPrices };
  const { params, kind, sec, parts, metrics } = layout;
  const stockLen = kind === 'wood' ? 3.0 : (kind === 'bamboo' ? 4.5 : 4.0);

  // Phân nhóm các đoạn thanh theo cấp tiết diện A / B / C / D và công đoạn
  const byClass = { A: [], B_frame: [], B_roof: [], C_frame: [], C_roof: [], C_counter: [], D_counter: [] };
  for (const p of parts) {
    if (p.shape !== 'seg' || p.bamboo === false) continue;
    if (p.cls === 'A') byClass.A.push(p.length);
    else if (p.cls === 'B') {
      if (p.type === 'roofBeam') byClass.B_roof.push(p.length);
      else byClass.B_frame.push(p.length);
    } else if (p.cls === 'C') {
      if (p.type === 'roofSlat') byClass.C_roof.push(p.length);
      else if (p.group === 'counter') byClass.C_counter.push(p.length);
      else byClass.C_frame.push(p.length);
    } else if (p.cls === 'D') {
      byClass.D_counter.push(p.length);
    }
  }

  const packA = packStock(byClass.A, stockLen);
  const packBFrame = packStock(byClass.B_frame, stockLen);
  const packBRoof = packStock(byClass.B_roof, stockLen);
  const packCFrame = packStock(byClass.C_frame, stockLen);
  const packCRoof = packStock(byClass.C_roof, stockLen);
  const packCCounter = packStock(byClass.C_counter, stockLen);
  const packDCounter = packStock(byClass.D_counter, stockLen);

  const pA = prices[`pole_A_${kind}`];
  const pB = prices[`pole_B_${kind}`];
  const pC = prices[`pole_C_${kind}`];
  const pD = prices[`pole_D_${kind}`];

  const cm = (m) => Math.round(m * 100);
  const matLabel = sec.label;

  // Tính diện tích bảng hiệu & decal (bao gồm cả Gian hàng & Cổng trại)
  const discArea = 2 * Math.PI * Math.pow(metrics.discD / 2, 2);
  const rectArea = (metrics.strW + metrics.d26W) * metrics.boardH;
  const cloudArea = metrics.cloudW * metrics.cloudH;
  const gateSignArea = (metrics.gateTotalW || 4.4) * 0.72 * (params.gateHeaderScale || 1.0);
  const secIconsArea = 0.2 * 0.24 + 0.19 * 0.16 + (metrics.Lc - 0.1) * 0.05 + 0.4 * 0.4 + gateSignArea;
  const totalFoam5Area = (discArea + rectArea + secIconsArea) * 1.25; // +25% hao hụt cắt
  const foam5Sheets = Math.max(1, Math.ceil(totalFoam5Area / (1.2 * 2.4)));
  const decalArea = Number((discArea + rectArea + cloudArea + secIconsArea).toFixed(2));

  // Diện tích ván ép mặt quầy + kệ dưới
  const counterArea = metrics.Lc * params.counterDepth + metrics.Lc * (params.counterDepth - 0.12);
  const plywoodSheets = Math.max(1, Math.ceil((counterArea * 1.15) / (1.22 * 2.44)));

  // Số lượng bu lông M8 và dây buộc
  const boltCount = metrics.nJoints + metrics.nPosts + 8; // mối nối + chốt chân đế + dự phòng
  const rattanRolls = Math.max(1, Math.ceil((metrics.nJoints * 1.8) / 50));
  const ziptiePacks = Math.max(2, Math.ceil((metrics.nSlat * 3 + metrics.nCS * 2 + metrics.nSS * 2 + 60) / 100));

  // Chiều dài dây cước treo sao + hành tinh
  const fishingTotalM = Number((metrics.hangLines.reduce((s, l) => s + l, 0) * 1.5 + 5).toFixed(1));
  const ledStripM = Math.ceil(metrics.ledLength + 0.5);
  const fairyCount = Math.max(1, Math.ceil(metrics.fairyLength / 9.5));
  const wireM = Math.ceil(metrics.wireLength + 1.5);

  const items = [
    // 1. KHUNG & MÁI
    {
      id: 'footing_bucket', category: 'frame', stage: 'GĐ1 · Chân đế',
      name: 'Chân đế xô bê tông 20L + ống lồng PVC Ø114',
      spec: `${metrics.nPosts} vị trí cột (~45 kg/chân)`,
      qty: metrics.nPosts, unit: 'bộ', priceKey: 'footing_bucket', unitPrice: prices.footing_bucket,
      note: 'Tái sử dụng vỏ xô sơn 18–20L để tiết kiệm',
    },
    {
      id: 'sandbag', category: 'frame', stage: 'GĐ1 · Chân đế',
      name: 'Bao cát gia tải chống lật (15 kg/bao)',
      spec: `2 bao × ${metrics.nPosts} chân cột`,
      qty: metrics.nPosts * 2, unit: 'bao', priceKey: 'sandbag', unitPrice: prices.sandbag,
      note: 'Đặt phía ngoài/sau chân cột, dán băng phản quang',
    },
    {
      id: 'pole_A', category: 'frame', stage: 'GĐ2 · Dựng cột',
      name: `${matLabel} làm cột chính (C1–C${metrics.nPosts})`,
      spec: `Tiết diện Ø${cm(sec.post)} cm × cây ${stockLen}m (tổng cắt ${packA.totalUsed}m, hao hụt ${packA.wastePct}%)`,
      qty: packA.count, unit: `cây ${stockLen}m`, priceKey: `pole_A_${kind}`, unitPrice: pA,
      cutPlan: packA,
    },
    {
      id: 'pole_B_frame', category: 'frame', stage: 'GĐ3 · Xà ngang',
      name: `${matLabel} làm xà dọc, xà ngang & giằng chân`,
      spec: `Tiết diện Ø${cm(sec.beam)} cm × cây ${stockLen}m (${byClass.B_frame.length} thanh = ${packBFrame.totalUsed}m)`,
      qty: packBFrame.count, unit: `cây ${stockLen}m`, priceKey: `pole_B_${kind}`, unitPrice: pB,
      cutPlan: packBFrame,
    },
    {
      id: 'pole_C_frame', category: 'frame', stage: 'GĐ3 · Giằng chéo',
      name: `${matLabel} làm thanh chống góc & giằng chữ X`,
      spec: `Tiết diện Ø${cm(sec.brace)} cm × cây ${stockLen}m (${byClass.C_frame.length} thanh = ${packCFrame.totalUsed}m)`,
      qty: packCFrame.count, unit: `cây ${stockLen}m`, priceKey: `pole_C_${kind}`, unitPrice: pC,
      cutPlan: packCFrame,
    },
    {
      id: 'pole_B_roof', category: 'frame', stage: 'GĐ4 · Khung mái',
      name: `${matLabel} làm đòn tay đỡ mái`,
      spec: `Tiết diện Ø${cm(sec.beam)} cm × cây ${stockLen}m (${byClass.B_roof.length} đòn tay = ${packBRoof.totalUsed}m)`,
      qty: packBRoof.count, unit: `cây ${stockLen}m`, priceKey: `pole_B_${kind}`, unitPrice: pB,
      cutPlan: packBRoof,
    },
    {
      id: 'pole_C_roof', category: 'frame', stage: 'GĐ4 · Nan mái',
      name: `${matLabel} làm hệ nan mái song song`,
      spec: `Tiết diện Ø${cm(sec.slat)} cm × cây ${stockLen}m (${metrics.nSlat} nan, bước ${(metrics.slatStep * 100).toFixed(1)} cm = ${packCRoof.totalUsed}m)`,
      qty: packCRoof.count, unit: `cây ${stockLen}m`, priceKey: `pole_C_${kind}`, unitPrice: pC,
      cutPlan: packCRoof,
    },
    {
      id: 'bolt_m8', category: 'frame', stage: 'GĐ2–GĐ4 · Liên kết',
      name: 'Bu lông M8×150 + 2 long đền phẳng + ê cu',
      spec: `${metrics.nJoints} mối nối khung + ${metrics.nPosts} chốt chân cột + dự phòng`,
      qty: boltCount, unit: 'bộ', priceKey: 'bolt_m8', unitPrice: prices.bolt_m8,
    },
    {
      id: 'rattan_roll', category: 'frame', stage: 'GĐ3–GĐ4 · Liên kết',
      name: 'Cuộn dây mây nhựa / dây đay buộc nút chéo thẩm mỹ',
      spec: `Cuộn 50m (~1,8m dây/mối nối × ${metrics.nJoints} mối)`,
      qty: rattanRolls, unit: 'cuộn', priceKey: 'rattan_roll', unitPrice: prices.rattan_roll,
    },
    {
      id: 'ziptie_pack', category: 'frame', stage: 'GĐ4–GĐ7 · Cố định',
      name: 'Dây rút nhựa đen/trắng 30cm (bịch 100 sợi)',
      spec: 'Buộc nan mái, nan quầy, bảng hiệu và đi dây LED',
      qty: ziptiePacks, unit: 'bịch', priceKey: 'ziptie_pack', unitPrice: prices.ziptie_pack,
    },
  ];

  if (params.material === 'painted') {
    items.push({
      id: 'pu_coat', category: 'frame', stage: 'GĐ1 · Chuẩn bị tre',
      name: 'Sơn bóng PU / Vecni phủ bề mặt tre',
      spec: 'Lon 0,8L + cọ quét (tạo màu vàng óng & chống ẩm)',
      qty: 2, unit: 'lon', priceKey: 'pu_coat', unitPrice: prices.pu_coat,
    });
  }

  // 2. QUẦY PHỤC VỤ
  items.push(
    {
      id: 'pole_C_counter', category: 'counter', stage: 'GĐ5 · Khung quầy',
      name: `${matLabel} làm chân quầy, khung ngang & nẹp kẹp`,
      spec: `Tiết diện Ø${cm(sec.cframe)} cm × cây ${stockLen}m (${byClass.C_counter.length} đoạn = ${packCCounter.totalUsed}m)`,
      qty: packCCounter.count, unit: `cây ${stockLen}m`, priceKey: `pole_C_${kind}`, unitPrice: pC,
      cutPlan: packCCounter,
    },
    {
      id: 'pole_D_counter', category: 'counter', stage: 'GĐ5 · Ốp nan quầy',
      name: `${matLabel} ốp dọc mặt trước & hông quầy`,
      spec: `Tiết diện Ø${cm(sec.cslat)} cm (${metrics.nCS} nan trước + ${metrics.nSS} nan hông = ${packDCounter.totalUsed}m)`,
      qty: packDCounter.count, unit: `cây ${stockLen}m`, priceKey: `pole_D_${kind}`, unitPrice: pD,
      cutPlan: packDCounter,
    },
    {
      id: 'plywood_sheet', category: 'counter', stage: 'GĐ5 · Mặt quầy',
      name: 'Ván ép 12–15mm làm mặt quầy & kệ dưới',
      spec: `Khổ 1,22×2,44m (diện tích cắt ${counterArea.toFixed(2)} m², quầy dài ${metrics.Lc}m × sâu ${params.counterDepth}m)`,
      qty: plywoodSheets, unit: 'tấm', priceKey: 'plywood_sheet', unitPrice: prices.plywood_sheet,
    },
    {
      id: 'borrowed_furniture', category: 'counter', stage: 'GĐ5 · Nội thất',
      name: 'Bàn gấp sơ chế + Tủ ngăn kéo + Thùng đá + Bếp từ (Mượn/Tái sử dụng)',
      spec: 'Mượn CLB / Đoàn Khoa / thành viên lớp để tối ưu ngân sách sinh viên',
      qty: 1, unit: 'gói mượn', priceKey: null, unitPrice: 0,
      note: 'Chi phí 0đ nhờ tận dụng đồ có sẵn',
    },
  );

  // 3. BẢNG HIỆU & TRANG TRÍ VŨ TRỤ
  items.push(
    {
      id: 'foam_5mm', category: 'decor', stage: 'GĐ6 · Bảng hiệu',
      name: 'Tấm Foam/Format 5mm làm 4 bảng Logo & icon bảo mật',
      spec: `PTIT Ø${cm(metrics.discD)}cm, Đoàn Ø${cm(metrics.discD)}cm, STR4 ${cm(metrics.strW)}×${cm(metrics.boardH)}cm, D26 ${cm(metrics.d26W)}×${cm(metrics.boardH)}cm`,
      qty: foam5Sheets, unit: 'tấm 1,2×2,4m', priceKey: 'foam_5mm', unitPrice: prices.foam_5mm,
    },
    {
      id: 'foam_10mm', category: 'decor', stage: 'GĐ6 · Biển mây',
      name: 'Tấm Foam 10mm cắt CNC hình đám mây "Ẩm thực Ngân hà"',
      spec: `Kích thước ${cm(metrics.cloudW)} × ${cm(metrics.cloudH)} cm gắn mặt trước quầy`,
      qty: 1, unit: 'tấm', priceKey: 'foam_10mm', unitPrice: prices.foam_10mm,
    },
    {
      id: 'mica_2mm', category: 'decor', stage: 'GĐ6 · Bảng hiệu',
      name: 'Mica trong 2mm phủ bóng bảng STR4.SEC, D26 & kệ Menu A5',
      spec: 'Tạo độ sâu bóng kính & chống mưa tạt cho bảng trung tâm',
      qty: 1, unit: 'tấm', priceKey: 'mica_2mm', unitPrice: prices.mica_2mm,
    },
    {
      id: 'decal_m2', category: 'decor', stage: 'GĐ6–GĐ7 · In ấn',
      name: 'In Decal PP ngoài trời cán bóng (4 Logo gốc + biển mây + dải nhị phân 0–1)',
      spec: `Tổng diện tích in thực tế ${decalArea} m² (giữ nguyên tỷ lệ gốc 4 file logo)`,
      qty: Math.max(2, Math.ceil(decalArea)), unit: 'm²', priceKey: 'decal_m2', unitPrice: prices.decal_m2,
    },
    {
      id: 'backdrop_m2', category: 'decor', stage: 'GĐ7 · Phông nền',
      name: 'Bạt Hiflex/Mesh in chủ đề Vũ trụ – An toàn thông tin (đóng khoen 4 góc)',
      spec: `Kích thước ${metrics.bdW.toFixed(2)} × ${metrics.bdH.toFixed(2)} m (${metrics.backdropArea} m²)`,
      qty: Math.max(3, Math.ceil(metrics.backdropArea)), unit: 'm²', priceKey: 'backdrop_m2', unitPrice: prices.backdrop_m2,
    },
    {
      id: 'bamboo_stick_pack', category: 'decor', stage: 'GĐ7 · Ngôi sao 3D',
      name: 'Bó que tre 5mm đan ngôi sao 3D 5 cánh',
      spec: `${metrics.nStar} ngôi sao treo Ø34cm (10 que/sao = ${metrics.nStar * 10} que)`,
      qty: Math.max(1, Math.ceil((metrics.nStar * 10) / 50)), unit: 'bó 50 que', priceKey: 'bamboo_stick_pack', unitPrice: prices.bamboo_stick_pack,
    },
    {
      id: 'cellophane_sheet', category: 'decor', stage: 'GĐ7 · Ngôi sao 3D',
      name: 'Giấy kiếng vàng + keo nến dán lồng sao & sao foam nhỏ',
      spec: `Dán ${metrics.nStar} ngôi sao treo + 6 ngôi sao nhỏ gắn đầu đòn tay`,
      qty: Math.max(3, metrics.nStar), unit: 'tờ + bộ keo', priceKey: 'cellophane_sheet', unitPrice: prices.cellophane_sheet,
    },
    {
      id: 'foam_ball_set', category: 'decor', stage: 'GĐ7 · Hành tinh',
      name: 'Bộ 3 quả cầu xốp hành tinh (Ø26cm, Ø18cm, Ø14cm) + màu Acrylic',
      spec: 'Sơn màu Vàng Sao Thổ, Xanh Công Nghệ #00CFFF và Đỏ Cam Sao Hỏa',
      qty: 1, unit: 'bộ 3 quả', priceKey: 'foam_ball_set', unitPrice: prices.foam_ball_set,
    },
    {
      id: 'orbit_pvc', category: 'decor', stage: 'GĐ7 · Hành tinh',
      name: 'Ống gen nhựa PVC Ø8mm + dây kẽm uốn vòng quỹ đạo hành tinh',
      spec: '3 vòng quỹ đạo elip bao quanh quả cầu xốp',
      qty: 3, unit: 'vòng', priceKey: 'orbit_pvc', unitPrice: prices.orbit_pvc,
    },
    {
      id: 'fishing_line', category: 'decor', stage: 'GĐ7 · Treo trần',
      name: 'Cuộn dây cước trong suốt Ø0,5mm treo sao & hành tinh',
      spec: `${metrics.hangLines.length} điểm treo dưới mái (tổng dây ${fishingTotalM}m)`,
      qty: 1, unit: 'cuộn 100m', priceKey: 'fishing_line', unitPrice: prices.fishing_line,
    },
  );

  // 4. HỆ THỐNG ĐIỆN & CHIẾU SÁNG LED
  items.push(
    {
      id: 'led_strip_m', category: 'electric', stage: 'GĐ7 · Chiếu sáng',
      name: 'Dây LED 2835 12V màu xanh công nghệ (#00CFFF) chống nước IP65',
      spec: `Viền dưới xà bảng hiệu + viền mặt quầy (tổng thực tế ${metrics.ledLength}m)`,
      qty: ledStripM, unit: 'mét', priceKey: 'led_strip_m', unitPrice: prices.led_strip_m,
    },
    {
      id: 'fairy_string', category: 'electric', stage: 'GĐ7 · Chiếu sáng',
      name: 'Dây đèn LED đom đóm vàng ấm (#FFD85A) giăng dưới mái',
      spec: `Zic-zắc tạo hiệu ứng ngân hà phía trước (tổng đường dây ${metrics.fairyLength}m)`,
      qty: fairyCount, unit: 'dây 10m', priceKey: 'fairy_string', unitPrice: prices.fairy_string,
    },
    {
      id: 'mini_led_star', category: 'electric', stage: 'GĐ7 · Chiếu sáng',
      name: 'Đèn LED mini dùng pin gắn tâm ngôi sao treo',
      spec: `1 bóng/ngôi sao × ${metrics.nStar} ngôi sao (an toàn, không cần kéo dây 220V)`,
      qty: metrics.nStar, unit: 'cái', priceKey: 'mini_led_star', unitPrice: prices.mini_led_star,
    },
    {
      id: 'adapter_12v', category: 'electric', stage: 'GĐ7 · Nguồn điện',
      name: 'Bộ nguồn Adapter 12V–5A cấp điện an toàn cho toàn bộ LED',
      spec: 'Đặt trong hộp chống ẩm treo trên cột C3 ở cao độ 1,30m',
      qty: 1, unit: 'bộ', priceKey: 'adapter_12v', unitPrice: prices.adapter_12v,
    },
    {
      id: 'wire_2x075_m', category: 'electric', stage: 'GĐ7 · Đi dây',
      name: 'Dây điện đôi 2×0,75mm² + ống ruột gà Ø16 bảo vệ đoạn qua sàn',
      spec: `Tuyến dây đi cao dọc cột C3 – xà phải – cột C2 (${metrics.wireLength}m + dư đấu nối)`,
      qty: wireM, unit: 'mét', priceKey: 'wire_2x075_m', unitPrice: prices.wire_2x075_m,
    },
  );

  // Tính thành tiền từng hạng mục và tổng hợp theo nhóm
  const subtotals = { frame: 0, counter: 0, decor: 0, electric: 0 };
  for (const it of items) {
    it.total = Math.round(it.qty * it.unitPrice);
    subtotals[it.category] = (subtotals[it.category] || 0) + it.total;
  }

  const baseTotal = subtotals.frame + subtotals.counter + subtotals.decor + subtotals.electric;
  const contingency = Math.round(baseTotal * contingencyRate);
  const grandTotal = baseTotal + contingency;
  const overBudget = grandTotal > budgetLimit;
  const diffBudget = grandTotal - budgetLimit;

  return {
    items,
    subtotals,
    baseTotal,
    contingencyRate,
    contingency,
    grandTotal,
    budgetLimit,
    overBudget,
    diffBudget,
    stockLen,
    cutSummary: {
      A: packA,
      B_frame: packBFrame,
      B_roof: packBRoof,
      C_frame: packCFrame,
      C_roof: packCRoof,
      C_counter: packCCounter,
      D_counter: packDCounter,
    },
  };
}

export function formatVND(n) {
  return new Intl.NumberFormat('vi-VN').format(Math.round(n || 0)) + ' ₫';
}

export function exportBOMToCSV(bom, layout) {
  const { params } = layout;
  const header = [
    ['DỰ TOÁN VẬT TƯ GIAN HÀNG 3D — GALACTIC FOOD STATION (ẨM THỰC NGÂN HÀ)'],
    [`Kích thước: Ngang ${params.width}m × Sâu ${params.depth}m × Cao ${params.height}m | Quầy cao ${params.counterHeight}m × sâu ${params.counterDepth}m | Vật liệu: ${layout.sec.label}`],
    [],
    ['STT', 'Nhóm', 'Công đoạn', 'Tên vật tư', 'Quy cách / Tính toán từ hình học 3D', 'Số lượng', 'Đơn vị', 'Đơn giá (VND)', 'Thành tiền (VND)', 'Ghi chú'],
  ];
  const catNames = { frame: '1. Hệ khung & Mái', counter: '2. Quầy phục vụ', decor: '3. Bảng hiệu & Trang trí', electric: '4. Điện & Chiếu sáng LED' };
  const rows = bom.items.map((it, idx) => [
    idx + 1,
    catNames[it.category] || it.category,
    it.stage,
    it.name,
    it.spec,
    it.qty,
    it.unit,
    it.unitPrice,
    it.total,
    it.note || '',
  ]);
  rows.push(
    [],
    ['', '', '', 'Tổng chi phí hệ khung & mái', '', '', '', '', bom.subtotals.frame, ''],
    ['', '', '', 'Tổng chi phí quầy phục vụ', '', '', '', '', bom.subtotals.counter, ''],
    ['', '', '', 'Tổng chi phí bảng hiệu & trang trí', '', '', '', '', bom.subtotals.decor, ''],
    ['', '', '', 'Tổng chi phí điện & LED', '', '', '', '', bom.subtotals.electric, ''],
    ['', '', '', `Chi phí dự phòng (${Math.round(bom.contingencyRate * 100)}%)`, '', '', '', '', bom.contingency, ''],
    ['', '', '', 'TỔNG CỘNG NGÂN SÁCH DỰ KIẾN', '', '', '', '', bom.grandTotal, bom.overBudget ? 'Vượt ngân sách mục tiêu' : 'Trong ngân sách mục tiêu'],
  );
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return '\uFEFF' + [...header, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
}
