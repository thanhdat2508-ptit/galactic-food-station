// =====================================================================
//  construction.js — HỆ THỐNG MÔ PHỎNG THI CÔNG 9 GIAI ĐOẠN (GĐ0 → GĐ8)
//  Thực hiện biến đổi hình học 3D thực tế cho từng cấu kiện theo tiến trình:
//  - Cột xoay dựng đứng từ mặt đất quanh tâm chân đế (raise)
//  - Xà ngang, bảng hiệu, nan mái trượt vào vị trí lắp (slide)
//  - Chân đế, đòn tay, mặt quầy hạ từ trên xuống (drop)
//  - Thanh giằng chéo, nan quầy, dải LED giãn theo chiều dài (grow)
//  - Mối nối, ngôi sao, hành tinh bật nở tại điểm treo (pop)
// =====================================================================

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function getStageDetails(layout) {
  const { dims, metrics, sec } = layout;
  const cm = (m) => Math.round(m * 100);
  return [
    {
      stage: 0,
      code: 'GĐ 0',
      title: 'Khảo sát mặt bằng & Định vị tim cột',
      duration: 4.0,
      camera: { pos: [0, 4.2, 4.6], target: [0, 0.4, 0.2] },
      summary: `Khoanh vùng ô đất ${dims.W.toFixed(1)} × ${dims.D.toFixed(1)} m, búng mực 2 đường chéo kiểm tra vuông góc và đánh dấu ${metrics.nPosts} tim cột C1–C${metrics.nPosts}.`,
      steps: [
        `Đo ranh giới khung gian hàng ${dims.W.toFixed(2)}m (ngang) × ${dims.D.toFixed(2)}m (sâu); kiểm tra 2 đường chéo bằng nhau (${Math.hypot(dims.W, dims.D).toFixed(2)}m) để đảm bảo góc vuông.`,
        `Đánh dấu ${metrics.nPosts} vị trí chân cột bằng phấn/băng keo màu vàng (khoảng cách tim cột ngang ${(dims.px * 2).toFixed(2)}m, sâu ${(dims.pz * 2).toFixed(2)}m).`,
        `Phân luồng khu vực khách đứng gọi món phía trước (+1,5m) và lối nhân viên thao tác phía sau quầy (rộng ${metrics.aisle.toFixed(2)}m).`,
      ],
      safety: 'Kiểm tra mặt sân bằng phẳng, không đặt chân cột lên nắp cống yếu hoặc đường thoát nước.',
      materials: [
        `Thước cuộn 5m, dây dù căng mốc, phấn vẽ / băng keo giấy định vị`,
        `Bản vẽ mặt bằng định vị ${metrics.nPosts} tim cột (C1 → C${metrics.nPosts})`,
      ],
    },
    {
      stage: 1,
      code: 'GĐ 1',
      title: 'Tập kết vật tư & Đặt chân đế chống lật',
      duration: 5.0,
      camera: { pos: [3.2, 2.2, 3.6], target: [0, 0.45, 0] },
      summary: `Đặt ${metrics.nPosts} chân đế xô bê tông 20L có sẵn ống lồng PVC Ø114 vào đúng tâm cột và gia tải ${metrics.nPosts * 2} bao cát chống lật.`,
      steps: [
        `Tập kết các cây ${sec.label.toLowerCase()} đã cắt sẵn và đánh mã theo nhóm A (cột), B (xà), C (giằng/nan mái), D (nan quầy) ở bên hông trái.`,
        `Đặt ${metrics.nPosts} xô bê tông (~45–50 kg/xô, chôn sẵn ống lồng PVC Ø114 sâu 28cm) trùng khít tâm C1–C${metrics.nPosts}.`,
        `Xếp 2 bao cát (15 kg/bao, có dán dải phản quang vàng) ôm sát mỗi chân đế về phía hông/phía sau để tăng mô-men chống lật và không cản lối đi khách.`,
      ],
      safety: 'Đảm bảo ống lồng PVC trong xô bê tông thẳng đứng; dán băng phản quang vàng lên toàn bộ chân đế và bao cát để tránh vấp ngã ban đêm.',
      materials: [
        `${metrics.nPosts} bộ chân đế xô bê tông 20L + ống lồng PVC Ø114`,
        `${metrics.nPosts * 2} bao cát gia tải (~15 kg/bao) + băng keo phản quang`,
        `Nêm gỗ chèn khe + ${metrics.nPosts} bu lông hãm chân cột M8`,
      ],
    },
    {
      stage: 2,
      code: 'GĐ 2',
      title: 'Dựng hệ cột chính & Cân chỉnh độ thẳng đứng',
      duration: 6.5,
      camera: { pos: [3.6, 2.3, 3.8], target: [0, 1.2, 0] },
      summary: `Dựng lần lượt ${metrics.nPosts} cột chính (C1 → C${metrics.nPosts}, Ø${cm(dims.dp)}cm, cao ${metrics.Hp.toFixed(2)}m) vào ống lồng, chèn nêm gỗ và bắt bu lông hãm.`,
      steps: [
        `Nhóm 3 người dựng từng cột theo thứ tự: C1 (trước trái) → C2 (trước phải) → C3 (sau phải) → C4 (sau trái)${metrics.nPosts > 4 ? ' → C5 (giữa sau)' : ''}.`,
        `Cắm gốc cột sâu 26cm vào ống lồng PVC Ø114, dùng thước thủy (dây dọi) kiểm tra độ thẳng đứng theo cả 2 phương X và Z.`,
        `Đóng chặt 4 nêm gỗ quanh miệng ống lồng và xuyên 1 bu lông M8×150 khóa cứng chân cột.`,
      ],
      safety: 'Luôn có 1 người giữ chân cột và 1 người đỡ thân cột cho tới khi bắt xong bu lông chân đế và lắp xong thanh giằng tạm.',
      materials: [
        `${metrics.nPosts} cột chính ${sec.label} Ø${cm(dims.dp)}cm, dài ~${metrics.Hp.toFixed(2)}m`,
        `${metrics.nPosts} bộ bu lông M8×150 + long đền + nêm gỗ chèn chân`,
      ],
    },
    {
      stage: 3,
      code: 'GĐ 3',
      title: 'Lắp hệ xà ngang, giằng chân & thanh giằng chéo',
      duration: 8.5,
      camera: { pos: [3.8, 2.2, 3.6], target: [0, 1.35, 0] },
      summary: `Liên kết ${metrics.frameMembers} thanh xà dọc, xà ngang, giằng chân và hệ giằng chéo chữ X + chống góc tạo khung không gian bất biến hình.`,
      steps: [
        `Đặt 2 xà dọc đỉnh cột (cao độ ${(metrics.Hp + dims.db / 2).toFixed(2)}m) nối cột trước – sau; tiếp theo lắp xà ngang đầu cột (cao ${metrics.Ht.toFixed(2)}m) và xà đỡ bảng hiệu (cao ${metrics.Hs.toFixed(2)}m).`,
        `Lắp giằng chân (cao 0,42m) và xà ngang giữa ở vách trái & vách sau để khóa chân khung.`,
        `Bắt các thanh chống góc 45° (knee-brace) tại mọi góc cột – xà và lắp hệ giằng chéo chữ X ở vách trái + vách sau.`,
        `Khoan lỗ Ø9mm xuyên tâm nút giao, siết bu lông M8×150 kèm 2 long đền, sau đó quấn 6–8 vòng dây mây buộc chéo chữ X bên ngoài.`,
      ],
      safety: 'Khoan mồi trước khi xuyên bu lông để không làm toác thân tre; vị trí khoan cách đốt tre 3–5cm để tận dụng độ cứng của mắt đốt.',
      materials: [
        `Xà dọc, xà ngang, xà bảng hiệu & giằng chân Ø${cm(dims.db)}cm`,
        `Thanh chống góc 45° & giằng chéo chữ X Ø${cm(dims.dbr)}cm`,
        `${metrics.nJoints} bộ bu lông M8×150 + dây mây nhựa buộc nút`,
      ],
    },
    {
      stage: 4,
      code: 'GĐ 4',
      title: 'Lắp đòn tay & Hệ nan tre mái song song',
      duration: 7.5,
      camera: { pos: [3.3, 3.1, 3.3], target: [0, 2.2, 0] },
      summary: `Gác các đòn tay ngang Ø${cm(dims.db)}cm và rải đều ${metrics.nSlat} thanh nan mái Ø${cm(dims.ds)}cm song song (bước ${(metrics.slatStep * 100).toFixed(1)}cm) tạo mái giàn thoáng.`,
      steps: [
        `Gác đòn tay mái (đua ra 20cm mỗi bên hông) lên trên 2 xà dọc đỉnh cột, bắt bu lông M8 và buộc dây chéo.`,
        `Căng dây chuẩn 2 đầu rồi rải lần lượt ${metrics.nSlat} thanh nan tre mái song song theo chiều sâu (khoảng cách đều ${(metrics.slatStep * 100).toFixed(1)}cm).`,
        `Cố định từng thanh nan mái vào đòn tay bằng 2 dây rút nhựa chịu lực kết hợp dây buộc mây tạo thẩm mỹ.`,
      ],
      safety: 'Sử dụng thang chữ A có người giữ chân thang khi thao tác ở độ cao 2,4–2,6m; không đứng hoặc tỳ người lên hệ nan mái.',
      materials: [
        `Đòn tay mái ${sec.label} Ø${cm(dims.db)}cm dài ${(dims.px * 2 + 0.4).toFixed(2)}m`,
        `${metrics.nSlat} thanh nan mái ${sec.label} Ø${cm(dims.ds)}cm dài ${(dims.pz * 2 + 0.3).toFixed(2)}m`,
        `Dây rút nhựa 30cm + dây mây buộc đầu đòn tay`,
      ],
    },
    {
      stage: 5,
      code: 'GĐ 5',
      title: 'Thi công quầy phục vụ ốp nan tre & Bố trí nội thất',
      duration: 8.0,
      camera: { pos: [2.6, 1.65, 3.2], target: [0, 0.75, 0.6] },
      summary: `Dựng khung quầy cao ${dims.Hc.toFixed(2)}m × sâu ${dims.Dc.toFixed(2)}m, lắp mặt ván ép, ốp ${metrics.nCS + metrics.nSS} thanh nan tre dọc và đặt tủ, bàn sơ chế, thùng đá, kệ menu.`,
      steps: [
        `Dựng hệ chân quầy và khung ngang đỡ mặt quầy (cao ${dims.Hc.toFixed(2)}m) + khung kệ dưới (cao 0,26m); neo 2 đầu khung quầy vào cột trước C1, C2.`,
        `Đặt tấm kệ dưới và mặt quầy ván ép 15mm (dài ${metrics.Lc.toFixed(2)}m × sâu ${dims.Dc.toFixed(2)}m), bắt vít cố định vào khung.`,
        `Ốp ${metrics.nCS} nan tre dọc mặt trước + ${metrics.nSS} nan hông trái (bước 5,5cm), kẹp chặt bằng 2 thanh nẹp tre ngang trên – dưới.`,
        `Bố trí tủ 3 ngăn kéo bên phải, bàn gấp sơ chế phía sau (chừa lối đi ${metrics.aisle.toFixed(2)}m), thùng đá xanh và kệ Menu A5 trên mặt quầy.`,
      ],
      safety: 'Chà nhám kỹ mép mặt quầy ván ép và đầu các nan tre để không gây xước tay khi phục vụ khách.',
      materials: [
        `Khung chân & đà ngang quầy Ø${cm(dims.dcf)}cm + 2 nẹp ngang mặt trước`,
        `${metrics.nCS + metrics.nSS} thanh nan ốp quầy Ø${cm(dims.dcs)}cm`,
        `Mặt quầy & kệ dưới ván ép 15mm + Tủ, bàn gấp, thùng đá, kệ menu`,
      ],
    },
    {
      stage: 6,
      code: 'GĐ 6',
      title: 'Lắp đặt hệ thống Bảng hiệu & 4 Logo nhận diện gốc',
      duration: 6.5,
      camera: { pos: [0, 1.85, 3.45], target: [0, 1.45, 0.8] },
      summary: `Treo 4 bảng hiệu chính phía trên (PTIT tròn trái, STR4.SEC, An toàn thông tin D26 trung tâm, Đoàn TN tròn phải) và biển mây "Ẩm thực Ngân hà" trước quầy.`,
      steps: [
        `Treo biển tròn Logo PTIT (Ø${cm(metrics.discD)}cm) ở đầu trái và biển tròn Logo Đoàn Thanh niên (Ø${cm(metrics.discD)}cm) đối xứng ở đầu phải.`,
        `Lắp bảng chữ nhật STR4.SEC (${cm(metrics.strW)}×${cm(metrics.boardH)}cm) và bảng trung tâm An toàn thông tin D26 (${cm(metrics.d26W)}×${cm(metrics.boardH)}cm) vào giữa xà đầu cột và xà đỡ bảng hiệu.`,
        `Cố định biển đám mây "Ẩm thực Ngân hà" (${cm(metrics.cloudW)}×${cm(metrics.cloudH)}cm, foam 10mm) vào chính giữa mặt trước quầy bằng dây rút luồn qua khe nan tre.`,
      ],
      safety: 'Mỗi bảng hiệu phải được buộc tối thiểu 4 điểm (2 trên, 2 dưới) để không bị lật hoặc vẫy khi có gió mạnh; kiểm tra tĩnh không dưới bảng hiệu đạt ' + metrics.clearUnderSign.toFixed(2) + 'm.',
      materials: [
        `Biển tròn PTIT & Đoàn TN (Foam 5mm + Decal gốc Ø${cm(metrics.discD)}cm)`,
        `Bảng STR4.SEC (${cm(metrics.strW)}×${cm(metrics.boardH)}cm) & Bảng ATTT D26 (${cm(metrics.d26W)}×${cm(metrics.boardH)}cm) phủ mica 2mm`,
        `Biển đám mây "Ẩm thực Ngân hà" (${cm(metrics.cloudW)}×${cm(metrics.cloudH)}cm, Foam 10mm)`,
      ],
    },
    {
      stage: 7,
      code: 'GĐ 7',
      title: 'Trang trí Vũ trụ – ATTT & Đi hệ thống đèn LED 12V',
      duration: 8.5,
      camera: { pos: [2.4, 1.85, 3.3], target: [0, 1.5, 0.3] },
      summary: `Treo ${metrics.nStar} ngôi sao tre 3D + 3 hành tinh có quỹ đạo PVC bằng dây cước, gắn khiên/ổ khóa/dải nhị phân 0–1, căng phông ngân hà và đi dây LED 12V.`,
      steps: [
        `Treo ${metrics.nStar} ngôi sao tre 3D (có bóng LED ấm ở tâm) và 3 mô hình hành tinh + quỹ đạo PVC từ các thanh nan mái bằng dây cước trong Ø0,5mm ở độ cao so le.`,
        `Gắn 6 ngôi sao nhỏ ở đầu đòn tay, Khiên bảo mật lên cột C1, Ổ khóa lên cột C2, dải nhị phân 0–1 mặt trước quầy và bảng mạch ở hông quầy.`,
        `Căng phông bạt dải ngân hà (${metrics.bdW.toFixed(2)}×${metrics.bdH.toFixed(2)}m) ở khung sau; dán LED dây xanh #00CFFF dưới xà bảng hiệu & mép quầy (${metrics.ledLength}m) và giăng đèn đom đóm vàng ấm (${metrics.fairyLength}m) dưới mái trước.`,
        `Đấu nguồn về hộp Adapter 12V–5A treo trên cột C3 (cao 1,3m), dây dẫn đi gọn dọc thân cột và bọc ống ruột gà đoạn tiếp đất.`,
      ],
      safety: 'Toàn bộ đèn trang trí dùng điện áp thấp 12V DC hoặc pin; tuyệt đối không kéo dây LED hoặc treo đồ dễ cháy phía trên vùng an toàn nhiệt 0,5m quanh bếp từ.',
      materials: [
        `${metrics.nStar} ngôi sao 3D que tre + 6 sao foam nhỏ + 3 hành tinh quỹ đạo PVC`,
        `Khiên bảo mật, ổ khóa, dải nhị phân 0–1, tấm mạch điện & phông nền ngân hà`,
        `${metrics.ledLength}m LED xanh 12V, ${metrics.fairyLength}m đèn đom đóm, Adapter 12V–5A & ${metrics.wireLength}m dây điện`,
      ],
    },
    {
      stage: 8,
      code: 'GĐ 8',
      title: 'Hoàn thiện, Nghiệm thu an toàn & Vận hành gian hàng',
      duration: 4.5,
      camera: { pos: [3.2, 2.0, 3.8], target: [0, 1.25, 0.1] },
      summary: `Kiểm tra tổng thể độ cứng vững khung, an toàn điện – nhiệt, lối lưu thông ${metrics.aisle.toFixed(2)}m và bật thử nghiệm chế độ chiếu sáng Ngày / Đêm.`,
      steps: [
        `Rung thử 4 cột góc để kiểm tra độ chặt của bu lông M8, nêm chân đế và các thanh giằng chéo.`,
        `Kiểm tra toàn bộ tuyến dây điện 12V/220V, đảm bảo phông nền cách bếp từ ${metrics.heatToBackdrop.toFixed(2)}m (≥ 0,50m an toàn).`,
        `Bật hệ thống LED xanh công nghệ #00CFFF và đèn sao vàng ấm #FFD85A, sẵn sàng đón khách tham quan lễ hội!`,
      ],
      safety: 'Trang bị sẵn 01 bình chữa cháy bột ABC 4kg ngay cạnh bàn sơ chế phía sau; phân công thành viên trực kỹ thuật trong suốt thời gian diễn ra hội trại.',
      materials: [
        `Biên bản nghiệm thu 12 hạng mục an toàn kết cấu & điện`,
        `01 bình chữa cháy mini ABC + bộ dụng cụ trực bảo trì (cờ lê 13, dây rút dự phòng)`,
      ],
    },
  ];
}

export class ConstructionController {
  constructor(boothManager, onUpdateCallback) {
    this.booth = boothManager;
    this.onUpdate = onUpdateCallback;

    this.enabled = false;
    this.currentStage = 8;
    this.stageProgress = 1.0; // 0..1 trong giai đoạn hiện tại
    this.isPlaying = false;
    this.autoAdvance = true;  // Tự động chuyển tiếp từ giai đoạn hiện tại đến GĐ8 khi nhấn Play
    this.speed = 1.0;
    this.autoCamera = true;
  }

  getStageInfoList() {
    if (!this.booth.layout) return [];
    return getStageDetails(this.booth.layout);
  }

  getCurrentStageInfo() {
    const list = this.getStageInfoList();
    return list[this.currentStage] || list[list.length - 1];
  }

  setStage(stageIndex, progress = 1.0, animateFromZero = false) {
    this.currentStage = Math.max(0, Math.min(8, Math.round(stageIndex)));
    if (animateFromZero) {
      this.stageProgress = 0.0;
      this.isPlaying = true;
    } else {
      this.stageProgress = Math.max(0, Math.min(1, Number(progress)));
    }
    this.applyTransforms();
    if (this.onUpdate) this.onUpdate(this.getState());
  }

  setProgress(p) {
    this.stageProgress = Math.max(0, Math.min(1, Number(p)));
    this.applyTransforms();
    if (this.onUpdate) this.onUpdate(this.getState());
  }

  play(fromBeginningIfDone = true) {
    if (fromBeginningIfDone && this.currentStage === 8 && this.stageProgress >= 0.99) {
      this.currentStage = 0;
      this.stageProgress = 0;
    } else if (this.stageProgress >= 0.99 && !this.autoAdvance) {
      this.stageProgress = 0;
    }
    this.isPlaying = true;
    this.applyTransforms();
    if (this.onUpdate) this.onUpdate(this.getState());
  }

  pause() {
    this.isPlaying = false;
    if (this.onUpdate) this.onUpdate(this.getState());
  }

  togglePlay() {
    if (this.isPlaying) this.pause();
    else this.play(true);
  }

  nextStage() {
    if (this.currentStage < 8) {
      this.setStage(this.currentStage + 1, 0, true);
    } else {
      this.setStage(8, 1.0, false);
      this.pause();
    }
  }

  prevStage() {
    if (this.currentStage > 0) {
      this.setStage(this.currentStage - 1, 1.0, false);
    } else {
      this.setStage(0, 1.0, false);
    }
  }

  tick(dt) {
    if (!this.isPlaying) return;
    const info = this.getCurrentStageInfo();
    const dur = (info ? info.duration : 5.0) / Math.max(0.25, this.speed);
    this.stageProgress += dt / dur;

    if (this.stageProgress >= 1.0) {
      if (this.autoAdvance && this.currentStage < 8) {
        this.currentStage += 1;
        this.stageProgress = 0.0;
      } else {
        this.stageProgress = 1.0;
        this.isPlaying = false;
      }
    }

    this.applyTransforms();
    if (this.onUpdate) this.onUpdate(this.getState());
  }

  getState() {
    const overall = (this.currentStage + this.stageProgress) / 9;
    return {
      currentStage: this.currentStage,
      stageProgress: this.stageProgress,
      overallProgress: Math.min(1, Math.max(0, overall)),
      isPlaying: this.isPlaying,
      speed: this.speed,
      stageInfo: this.getCurrentStageInfo(),
    };
  }

  // Biến đổi vị trí / góc xoay / tỷ lệ thực tế của từng cấu kiện 3D theo giai đoạn & tiến trình
  applyTransforms() {
    const layout = this.booth.layout;
    if (!layout) return;

    const st = this.currentStage;
    const prog = this.stageProgress;

    // Hiển thị mặt bằng khảo sát rõ nhất ở GĐ0–GĐ2
    this.booth.surveyGroup.visible = st <= 2;
    // Bãi tập kết vật tư bên trái hiển thị ở GĐ1–GĐ5
    this.booth.stagingGroup.visible = st >= 1 && st <= 5;

    // Gom các cấu kiện của giai đoạn hiện tại để tính thứ tự xuất hiện nối tiếp nhau
    const stageParts = layout.parts.filter((p) => p.stage === st);
    let minOrder = 0, maxOrder = 0;
    if (stageParts.length > 0) {
      const orders = stageParts.map((p) => p.order || 0);
      minOrder = Math.min(...orders);
      maxOrder = Math.max(...orders);
    }
    const orderSpan = Math.max(0.001, maxOrder - minOrder);

    for (const part of layout.parts) {
      const obj = this.booth.partMeshes.get(part.id);
      if (!obj) continue;

      const userGroupVis = this.booth.groupVisibility[part.group] !== false;
      if (!userGroupVis) {
        obj.visible = false;
        continue;
      }

      const { basePos, baseQuat, baseScale } = obj.userData;

      // Cấu kiện thuộc giai đoạn sau -> ẩn hoàn toàn
      if (part.stage > st) {
        obj.visible = false;
        continue;
      }

      // Cấu kiện thuộc giai đoạn trước (hoặc GĐ8 hoàn thiện) -> ở trạng thái lắp xong 100%
      if (part.stage < st || st === 8) {
        obj.visible = true;
        obj.position.copy(basePos);
        obj.quaternion.copy(baseQuat);
        obj.scale.copy(baseScale);
        continue;
      }

      // Cấu kiện thuộc đúng giai đoạn đang diễn ra (part.stage === st)
      const normOrder = orderSpan > 0.001 ? ((part.order || 0) - minOrder) / orderSpan : 0;
      const windowWidth = stageParts.length <= 5 ? 0.42 : 0.26;
      const tStart = normOrder * (1 - windowWidth);
      const localT = (prog - tStart) / windowWidth;

      if (localT <= 0.001) {
        obj.visible = false;
        continue;
      }

      obj.visible = true;
      const t = Math.min(1, Math.max(0.001, localT));
      const e = easeOutCubic(t);

      // Reset về gốc trước khi áp dụng phép biến đổi hoạt ảnh
      obj.position.copy(basePos);
      obj.quaternion.copy(baseQuat);
      obj.scale.copy(baseScale);

      switch (part.anim) {
        case 'raise': {
          // Mô phỏng dựng cột: xoay 90° từ mặt đất nâng thẳng đứng quanh điểm chân cột
          const angle = (1 - e) * (Math.PI / 2) * (part.raiseSign || 1);
          const pivotY = part.a ? part.a[1] : 0.06;
          const halfH = basePos.y - pivotY;
          obj.rotation.x = angle;
          obj.position.y = pivotY + Math.cos(angle) * halfH;
          obj.position.z = basePos.z + Math.sin(angle) * halfH;
          break;
        }
        case 'slide': {
          const dir = part.slideDir || [0, 0, 1];
          const dist = part.slideDist || 0.9;
          obj.position.x = basePos.x + dir[0] * dist * (1 - e);
          obj.position.y = basePos.y + dir[1] * dist * (1 - e);
          obj.position.z = basePos.z + dir[2] * dist * (1 - e);
          break;
        }
        case 'grow': {
          if (part.shape === 'seg') {
            obj.scale.set(baseScale.x, Math.max(0.02, e), baseScale.z);
          } else {
            obj.scale.set(Math.max(0.02, e), Math.max(0.02, e), baseScale.z);
          }
          break;
        }
        case 'pop': {
          const s = Math.max(0.02, easeOutBack(t));
          obj.scale.set(s, s, s);
          break;
        }
        case 'draw': {
          obj.scale.set(1, Math.max(0.02, e), 1);
          break;
        }
        case 'drop':
        default: {
          obj.position.y = basePos.y + (1 - e) * 0.85;
          break;
        }
      }
    }
  }
}
