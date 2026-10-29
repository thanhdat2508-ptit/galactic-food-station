// =====================================================================
//  booth.js — DỰNG MÔ HÌNH GIAN HÀNG 3D (Three.js)
//  Tạo toàn bộ hình học 3D chi tiết cao từ dữ liệu của layout.js:
//  - Cột tre/gỗ/PVC có đốt tre nổi 3D,xà ngang, giằng chéo, mối nối dây mây + bu lông
//  - Chân đế xô bê tông + ống lồng PVC + bao cát chống lật có dải phản quang
//  - Hệ mái pergola đòn tay + nan tre song song
//  - Quầy phục vụ ốp nan tre, mặt ván ép, kệ dưới, tủ 3 ngăn, bàn sơ chế, thùng đá xanh, kệ Menu
//  - 4 bảng hiệu Logo dùng đúng texture ảnh gốc (assets/ptit.png, str4sec.png, d26.png, doan.png)
//    giữ nguyên tỷ lệ gốc (không méo) + hỗ trợ upload thay thế trực tiếp + biển mây "Ẩm thực Ngân hà"
//  - Trang trí vũ trụ & ATTT: Ngôi sao 3D đan que tre treo dây cước, hành tinh + quỹ đạo PVC,
//    khiên bảo mật, ổ khóa, dải nhị phân 0–1, bảng mạch, dây LED xanh #00CFFF & đèn đom đóm #FFD85A
//  - Mặt bằng khảo sát GĐ0 + Hệ thống thước đo 3D trực quan
// =====================================================================

import * as THREE from 'three';
import { TYPES, describeDims } from './layout.js';

const UP = new THREE.Vector3(0, 1, 0);

// ---------------------------------------------------------------------
//  TẠO TEXTURE PROCEDURAL (Tre, Gỗ, PVC, Đám mây, Nhị phân, Mạch điện, Ngân hà)
// ---------------------------------------------------------------------
function makeBambooTextures(variant = 'natural') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');

  const palettes = {
    natural: ['#c89b5e', '#d6ad72', '#b58548', '#8a6230'],
    painted: ['#d89e48', '#e6b25c', '#bf8330', '#7e5118'],
    pvc:     ['#cfa56a', '#dbb47b', '#be9256', '#946c38'],
  };
  const pal = palettes[variant] || palettes.natural;

  // Nền chuyển sắc dọc thân tre
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, pal[0]);
  g.addColorStop(0.45, pal[1]);
  g.addColorStop(0.92, pal[0]);
  g.addColorStop(1, pal[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);

  // Sợi tre dọc
  for (let i = 0; i < 420; i++) {
    const x = (i * 37) % 512;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255,245,220,0.08)' : 'rgba(70,42,12,0.08)';
    ctx.fillRect(x, 0, 1 + (i % 2), 512);
  }

  // Hai vòng đốt tre trên mỗi chu kỳ texture
  [160, 390].forEach((ny) => {
    const ng = ctx.createLinearGradient(0, ny - 14, 0, ny + 14);
    ng.addColorStop(0, 'rgba(255,235,195,0.18)');
    ng.addColorStop(0.42, pal[3]);
    ng.addColorStop(0.58, '#4d3214');
    ng.addColorStop(1, 'rgba(255,235,195,0.15)');
    ctx.fillStyle = ng;
    ctx.fillRect(0, ny - 12, 512, 24);
  });

  // Đốm tự nhiên trên thân tre
  if (variant !== 'pvc') {
    for (let i = 0; i < 75; i++) {
      const x = (i * 97 + 19) % 512;
      const y = (i * 151 + 43) % 512;
      ctx.fillStyle = 'rgba(65,40,15,0.12)';
      ctx.beginPath();
      ctx.ellipse(x, y, 2 + (i % 4), 5 + (i % 7), 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(1, 2);

  // Bump map
  const bc = document.createElement('canvas');
  bc.width = 256;
  bc.height = 256;
  const bctx = bc.getContext('2d');
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 2) {
    bctx.fillStyle = i % 4 === 0 ? '#929292' : '#707070';
    bctx.fillRect(i, 0, 1, 256);
  }
  [80, 195].forEach((ny) => {
    bctx.fillStyle = '#ffffff';
    bctx.fillRect(0, ny - 4, 256, 4);
    bctx.fillStyle = '#303030';
    bctx.fillRect(0, ny, 256, 4);
  });
  const bump = new THREE.CanvasTexture(bc);
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(1, 2);

  return { map, bump };
}

function makeWoodTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#a87442';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) {
    const x = (i * 17) % 512;
    ctx.strokeStyle = i % 2 ? 'rgba(68,38,14,0.16)' : 'rgba(235,195,145,0.11)';
    ctx.lineWidth = 1 + (i % 3);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + Math.sin(i) * 18, 170, x - Math.cos(i) * 18, 340, x, 512);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function makePlywoodTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 512, 512);
  g.addColorStop(0, '#d7b382');
  g.addColorStop(0.5, '#cfa670');
  g.addColorStop(1, '#c39760');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 180; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(110,70,30,0.06)' : 'rgba(255,240,215,0.06)';
    ctx.fillRect(0, (i * 19) % 512, 512, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}


// Biển đám mây "Ẩm thực ngân hà" bám sát tỷ lệ và hình dáng Hình 1:
// - Bọng mây lớn bên trái ("Ẩm thực") nhô cao vượt mép mặt quầy
// - Hai bọng mây bên phải ("ngân hà") trải dài ngang mặt trước nan tre quầy
// - Phần góc trên bên phải trong suốt để lộ mặt quầy, thùng đá xanh và kệ Menu như bản vẽ gốc
function makeCloudSignTexture() {
  const c = document.createElement('canvas');
  c.width = 1600;
  c.height = 720;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  // Tọa độ các bọng mây: [x, y, rx, ry]
  // Cụm trái cao (y từ 30 đến 690), cụm phải thấp hơn (y từ 225 đến 665) đúng như Hình 1
  const puffs = [
    // Cụm mây khổng lồ bên trái ("Ẩm thực")
    [350, 340, 290, 275],
    [205, 385, 175, 195],
    [485, 255, 185, 175],
    [545, 455, 195, 195],
    [345, 515, 210, 165],
    // Cụm mây giữa ("ngân")
    [835, 435, 195, 185],
    [725, 485, 155, 145],
    // Cụm mây phải ("hà")
    [1145, 445, 215, 185],
    [1365, 515, 155, 130],
    [1000, 520, 165, 135],
  ];

  // 1. Viền kem trắng dày bao quanh toàn bộ đám mây
  ctx.save();
  ctx.fillStyle = '#fff9eb';
  puffs.forEach(([x, y, rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx + 26, ry + 26, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // 2. Lớp nền xanh lam ngân hà (#6992f4)
  ctx.fillStyle = '#6891f2';
  puffs.forEach(([x, y, rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. Lớp cọ màu xanh đậm hơn tạo chiều sâu (#4a75e0)
  ctx.fillStyle = '#4c76e2';
  puffs.forEach(([x, y, rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(x + 8, y + 10, rx * 0.84, ry * 0.84, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // 4. Vòng quỹ đạo vàng nét đứt quanh cụm "Ẩm thực" (bên trái) và "ngân hà" (bên phải)
  ctx.save();
  ctx.strokeStyle = '#ffd85a';
  ctx.lineWidth = 6;
  ctx.setLineDash([22, 14]);
  ctx.beginPath();
  ctx.ellipse(370, 365, 285, 240, -0.15, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setLineDash([26, 14]);
  ctx.beginPath();
  ctx.ellipse(1090, 485, 360, 110, 0.06, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 5. Các ngôi sao 5 cánh vẽ tay màu vàng như bản vẽ thiết kế
  const drawStar = (cx, cy, R, rot = 0) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? R : R * 0.42;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.strokeStyle = '#ffd85a';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,216,90,0.32)';
    ctx.fill();
    ctx.restore();
  };
  drawStar(195, 165, 52, -0.22);
  drawStar(515, 185, 58, 0.16);
  drawStar(360, 610, 50, 0.08);
  drawStar(1405, 555, 48, -0.2);
  drawStar(845, 300, 32, 0.25);

  // 6. Chữ "Ẩm thực ngân hà" cỡ lớn đúng vị trí từng bọng mây trên Hình 1
  ctx.save();
  ctx.lineJoin = 'round';
  const drawWord = (txt, x, y, size, rot = 0) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.font = `900 ${size}px "Segoe UI", "Be Vietnam Pro", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#a6c6ff';
    ctx.lineWidth = 16;
    ctx.strokeText(txt, 0, 0);
    ctx.fillStyle = '#093298';
    ctx.fillText(txt, 0, 0);
    ctx.restore();
  };
  drawWord('Ẩm', 310, 345, 156, -0.04);
  drawWord('thực', 535, 495, 134, 0.02);
  drawWord('ngân', 895, 445, 128, -0.02);
  drawWord('hà', 1205, 465, 134, 0.02);
  ctx.restore();

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}


// Dải nhị phân 0-1 mặt quầy
function makeBinaryTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 96;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#061638';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#00cfff';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, c.width - 4, c.height - 4);

  const bits = '01010011 01010100 01010010 00110100 . 01010011 01000101 01000011  •  GALACTIC FOOD STATION  •  D26 ATTT  •  01000001 01010100 01010100 01010100';
  ctx.font = 'bold 26px "Courier New", monospace';
  ctx.fillStyle = '#00cfff';
  ctx.textBaseline = 'middle';
  ctx.fillText(bits, 20, 34);
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.fillStyle = '#ffd85a';
  ctx.fillText('10110010 00101101 [ AES-256 SECURED BOOTH // PTIT STR4.SEC ] 01101001 11010010', 20, 68);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}


// Bảng mạch điện tử hông quầy
function makeCircuitTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#071b45';
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = '#00cfff';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 492, 492);

  ctx.strokeStyle = 'rgba(0,207,255,0.65)';
  ctx.lineWidth = 4;
  const nodes = [
    [[60, 80], [180, 80], [230, 130], [230, 240]],
    [[450, 90], [340, 90], [290, 140], [290, 240]],
    [[80, 420], [170, 420], [220, 370], [220, 290]],
    [[430, 410], [330, 410], [290, 370], [290, 290]],
    [[60, 260], [190, 260]],
    [[320, 260], [450, 260]],
  ];
  nodes.forEach((pts) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    pts.forEach(([x, y]) => {
      ctx.fillStyle = '#ffd85a';
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // Chip trung tâm
  ctx.fillStyle = '#04102b';
  ctx.strokeStyle = '#00cfff';
  ctx.lineWidth = 4;
  ctx.fillRect(195, 195, 122, 122);
  ctx.strokeRect(195, 195, 122, 122);
  ctx.fillStyle = '#eaf5ff';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('STR4', 256, 250);
  ctx.fillStyle = '#ffd85a';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('D26 SEC', 256, 282);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}


// Phông nền bạt in dải ngân hà phía sau
function makeBackdropTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 640;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(512, 300, 40, 512, 320, 620);
  g.addColorStop(0, '#13357a');
  g.addColorStop(0.5, '#071b45');
  g.addColorStop(1, '#030b1e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);

  // Dải ngân hà chéo
  ctx.save();
  ctx.translate(512, 320);
  ctx.rotate(-0.28);
  const mg = ctx.createLinearGradient(-500, 0, 500, 0);
  mg.addColorStop(0, 'rgba(0,207,255,0)');
  mg.addColorStop(0.5, 'rgba(0,207,255,0.22)');
  mg.addColorStop(1, 'rgba(255,216,90,0)');
  ctx.fillStyle = mg;
  ctx.fillRect(-550, -110, 1100, 220);
  ctx.restore();

  // Sao nhỏ
  for (let i = 0; i < 220; i++) {
    const x = (i * 173 + 29) % 1024;
    const y = (i * 97 + 13) % 640;
    const r = (i % 5 === 0) ? 2.4 : 1.2;
    ctx.fillStyle = i % 7 === 0 ? '#ffd85a' : '#eaf5ff';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lưới cyber ở chân phông
  ctx.strokeStyle = 'rgba(0,207,255,0.22)';
  ctx.lineWidth = 1.5;
  for (let y = 470; y < 640; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }
  for (let x = 0; x <= 1024; x += 64) {
    ctx.beginPath();
    ctx.moveTo(512 + (x - 512) * 0.35, 470);
    ctx.lineTo(x, 640);
    ctx.stroke();
  }

  // Dòng chữ chìm trên phông
  ctx.font = 'bold 42px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(234,245,255,0.88)';
  ctx.fillText('GALACTIC FOOD STATION • ẨM THỰC NGÂN HÀ', 512, 110);
  ctx.font = '600 24px "Courier New", monospace';
  ctx.fillStyle = '#00cfff';
  ctx.fillText('PTIT  ×  STR4.SEC  ×  AN TOÀN THÔNG TIN D26', 512, 152);

  // Khoen bạt 4 góc
  [[24, 24], [1000, 24], [24, 616], [1000, 616], [512, 24], [512, 616]].forEach(([x, y]) => {
    ctx.strokeStyle = '#d0d7e2';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.stroke();
  });

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Quả cầu Mắt thần An ninh mạng (Đỉnh trái Cổng trại) bám sát ảnh thiết kế cổng trại
function makeCyberGlobeTexture() {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 768;
  const ctx = c.getContext('2d');
  const cx = 384, cy = 384, R = 366;

  ctx.clearRect(0, 0, 768, 768);

  // Nền quả địa cầu xanh cổ vịt đậm chuyển sắc
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  const g = ctx.createRadialGradient(cx - 60, cy - 60, 40, cx, cy, R);
  g.addColorStop(0, '#0c6ea5');
  g.addColorStop(0.65, '#05517e');
  g.addColorStop(1, '#023859');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 768, 768);

  // Các đường kinh tuyến & vĩ tuyến màu xanh băng (#8de2ff)
  ctx.strokeStyle = '#8de2ff';
  ctx.lineWidth = 14;

  // Kinh tuyến giữa
  ctx.beginPath();
  ctx.moveTo(cx, cy - R);
  ctx.lineTo(cx, cy + R);
  ctx.stroke();

  // Các đường kinh tuyến cong (elip dọc)
  [125, 245, 340].forEach((rx) => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, R, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Các đường vĩ tuyến cong phía trên và phía dưới con mắt
  [-235, -135, 135, 235].forEach((dy) => {
    ctx.beginPath();
    ctx.ellipse(cx, cy + dy, Math.sqrt(Math.max(10, R * R - dy * dy * 0.65)), 48, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Vẽ Con Mắt Thần Bảo Mật ở chính giữa quả cầu
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - 285, cy);
  ctx.quadraticCurveTo(cx, cy - 175, cx + 285, cy);
  ctx.quadraticCurveTo(cx, cy + 175, cx - 285, cy);
  ctx.closePath();
  ctx.fillStyle = '#8de2ff';
  ctx.fill();
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#044d78';
  ctx.stroke();

  // Tròng mắt ngoài (xanh đậm)
  ctx.beginPath();
  ctx.arc(cx, cy, 106, 0, Math.PI * 2);
  ctx.fillStyle = '#044d78';
  ctx.fill();

  // Vòng tròng mắt sáng (#8de2ff)
  ctx.beginPath();
  ctx.arc(cx, cy, 74, 0, Math.PI * 2);
  ctx.lineWidth = 18;
  ctx.strokeStyle = '#8de2ff';
  ctx.stroke();

  // Đồng tử trung tâm
  ctx.beginPath();
  ctx.arc(cx, cy, 52, 0, Math.PI * 2);
  ctx.fillStyle = '#044d78';
  ctx.fill();
  ctx.restore();

  // Viền tròn ngoài quả địa cầu
  ctx.beginPath();
  ctx.arc(cx, cy, R - 7, 0, Math.PI * 2);
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#044d78';
  ctx.stroke();
  ctx.restore();

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Cánh sóng mạch điện ngân hà 2 tầng ở chân cổng trại
function makeGateWaveTexture() {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 768, 512);

  const drawWaveLayer = (pts, topStroke) => {
    ctx.save();
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
    ctx.clip();

    const g = ctx.createLinearGradient(0, 80, 0, 500);
    g.addColorStop(0, '#3fd0ff');
    g.addColorStop(0.45, '#1278c4');
    g.addColorStop(1, '#08255e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 768, 512);

    // Đường mạch điện tử chéo
    ctx.strokeStyle = 'rgba(160, 240, 255, 0.45)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 14; i++) {
      const x0 = i * 62;
      ctx.beginPath();
      ctx.moveTo(x0, 500);
      ctx.lineTo(x0 + 80, 320);
      ctx.lineTo(x0 + 145, 320);
      ctx.stroke();
      ctx.fillStyle = '#a8f0ff';
      ctx.beginPath();
      ctx.arc(x0 + 145, 320, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Các hạt sao lấp lánh ở chân sóng
    for (let i = 0; i < 65; i++) {
      const sx = (i * 97 + 31) % 740;
      const sy = 250 + ((i * 67) % 240);
      ctx.fillStyle = i % 4 === 0 ? '#ffffff' : '#8ee6ff';
      ctx.beginPath();
      ctx.arc(sx, sy, i % 5 === 0 ? 3.5 : 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Viền băng tuyết trắng xanh ở sống lưng cánh sóng
    ctx.save();
    ctx.beginPath();
    topStroke.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.strokeStyle = '#d8f4ff';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  };

  // Tầng sóng cao phía sau
  drawWaveLayer(
    [[35, 115], [220, 155], [450, 260], [685, 425], [520, 465], [160, 445], [65, 260]],
    [[35, 115], [220, 155], [450, 260], [640, 395]],
  );
  // Tầng sóng thấp phía trước
  drawWaveLayer(
    [[45, 295], [250, 315], [495, 395], [735, 495], [140, 495], [85, 395]],
    [[45, 295], [250, 315], [495, 395], [725, 488]],
  );

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Khiên bảo mật có biểu tượng Ổ khóa phát sáng ở chân cổng trái
function makeGateShieldTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 600;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 600);

  const shieldPath = () => {
    ctx.beginPath();
    ctx.moveTo(256, 28);
    ctx.quadraticCurveTo(365, 78, 468, 108);
    ctx.quadraticCurveTo(476, 365, 256, 568);
    ctx.quadraticCurveTo(36, 365, 44, 108);
    ctx.quadraticCurveTo(147, 78, 256, 28);
    ctx.closePath();
  };

  ctx.save();
  shieldPath();
  ctx.clip();

  const g = ctx.createRadialGradient(256, 270, 20, 256, 290, 310);
  g.addColorStop(0, '#00bfff');
  g.addColorStop(0.55, '#0077cc');
  g.addColorStop(1, '#033978');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 600);

  // Mạch điện mờ trong lòng khiên
  ctx.strokeStyle = 'rgba(150, 235, 255, 0.35)';
  ctx.lineWidth = 3;
  for (let y = 90; y < 520; y += 45) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(160, y);
    ctx.lineTo(195, y + 25);
    ctx.moveTo(452, y);
    ctx.lineTo(352, y);
    ctx.lineTo(317, y + 25);
    ctx.stroke();
  }
  ctx.restore();

  // Viền khiên kim loại trắng xanh
  ctx.save();
  shieldPath();
  ctx.lineWidth = 22;
  ctx.strokeStyle = '#b9e2f5';
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.restore();

  // Biểu tượng Ổ Khóa phát sáng ở tâm khiên
  ctx.save();
  ctx.strokeStyle = '#e6fbff';
  ctx.fillStyle = 'rgba(0, 215, 255, 0.35)';
  ctx.lineWidth = 12;

  // Quai khóa
  ctx.beginPath();
  ctx.arc(256, 245, 48, Math.PI, 0, false);
  ctx.lineTo(304, 285);
  ctx.moveTo(208, 245);
  ctx.lineTo(208, 285);
  ctx.stroke();

  // Thân khóa bo góc
  ctx.beginPath();
  ctx.roundRect(184, 282, 144, 128, 22);
  ctx.fill();
  ctx.stroke();

  // Lỗ khóa ở tâm
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(256, 334, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(249, 342, 14, 34);
  ctx.restore();

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------------------------------------------------------------------
//  BỘ QUẢN LÝ TEXTURE 4 LOGO GỐC (PTIT, STR4.SEC, D26, ĐOÀN TN)
//  Vẽ trực tiếp ảnh gốc từ tệp cung cấp (hoặc tệp người dùng upload),
//  giữ nguyên tỷ lệ khung hình (không bóp méo) và cho phép thu phóng.
// ---------------------------------------------------------------------
const DEFAULT_LOGO_PATHS = {
  ptit: './assets/ptit.png',
  str4: './assets/str4sec.png',
  d26:  './assets/d26.png',
  doan: './assets/doan.png',
};

export class BoothSceneManager {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.root = new THREE.Group();
    this.root.name = 'GalacticFoodStation';
    this.scene.add(this.root);

    this.partsGroup = new THREE.Group();
    this.partsGroup.name = 'BoothParts';
    this.root.add(this.partsGroup);

    this.surveyGroup = new THREE.Group();
    this.surveyGroup.name = 'SurveyOverlay';
    this.root.add(this.surveyGroup);

    this.dimsGroup = new THREE.Group();
    this.dimsGroup.name = 'Dimensions3D';
    this.root.add(this.dimsGroup);

    this.stagingGroup = new THREE.Group();
    this.stagingGroup.name = 'MaterialStaging';
    this.stagingGroup.visible = false;
    this.root.add(this.stagingGroup);

    this.partMeshes = new Map();     // part.id -> THREE.Object3D
    this.groupVisibility = {};
    this.logoImages = { ptit: null, str4: null, d26: null, doan: null };
    this.logoScale = { ptit: 1.0, str4: 1.0, d26: 1.0, doan: 1.0 };
    this.usePlaceholders = false;
    this.ledEnabled = true;
    this.isNight = false;
    this.wireframe = false;
    this.selectedPartId = null;

    this._initMaterials();
    this._loadDefaultLogos();
  }

  _initMaterials() {
    this.texBambooNat = makeBambooTextures('natural');
    this.texBambooPaint = makeBambooTextures('painted');
    this.texBambooPvc = makeBambooTextures('pvc');
    this.texWood = makeWoodTexture();
    this.texPlywood = makePlywoodTexture();
    this.texCloud = makeCloudSignTexture();
    this.texBinary = makeBinaryTexture();
    this.texCircuit = makeCircuitTexture();
    this.texBackdrop = makeBackdropTexture();
    this.texCyberGlobe = makeCyberGlobeTexture();
    this.texGateWave = makeGateWaveTexture();
    this.texGateShield = makeGateShieldTexture();

    this.mats = {
      natural: new THREE.MeshStandardMaterial({
        map: this.texBambooNat.map,
        bumpMap: this.texBambooNat.bump,
        bumpScale: 0.008,
        roughness: 0.58,
        metalness: 0.04,
      }),
      painted: new THREE.MeshStandardMaterial({
        map: this.texBambooPaint.map,
        bumpMap: this.texBambooPaint.bump,
        bumpScale: 0.006,
        roughness: 0.28,
        metalness: 0.08,
      }),
      wood: new THREE.MeshStandardMaterial({
        map: this.texWood,
        roughness: 0.62,
        metalness: 0.04,
      }),
      pvc: new THREE.MeshStandardMaterial({
        map: this.texBambooPvc.map,
        roughness: 0.22,
        metalness: 0.1,
      }),
      bambooNode: new THREE.MeshStandardMaterial({
        color: 0x8b622e,
        roughness: 0.65,
      }),
      bambooInner: new THREE.MeshStandardMaterial({
        color: 0xe6cda3,
        roughness: 0.75,
      }),
      lashing: new THREE.MeshStandardMaterial({
        color: 0x7c5325,
        roughness: 0.8,
      }),
      bolt: new THREE.MeshStandardMaterial({
        color: 0xcfd6e0,
        roughness: 0.3,
        metalness: 0.85,
      }),
      bucket: new THREE.MeshStandardMaterial({
        color: 0x26354d,
        roughness: 0.45,
        metalness: 0.1,
      }),
      concrete: new THREE.MeshStandardMaterial({
        color: 0x8d939b,
        roughness: 0.92,
      }),
      pvcSleeve: new THREE.MeshStandardMaterial({
        color: 0x627388,
        roughness: 0.4,
      }),
      sandbag: new THREE.MeshStandardMaterial({
        color: 0xc2a472,
        roughness: 0.9,
      }),
      reflective: new THREE.MeshStandardMaterial({
        color: 0xffd85a,
        emissive: 0xffb700,
        emissiveIntensity: 0.35,
        roughness: 0.3,
      }),
      plywood: new THREE.MeshStandardMaterial({
        map: this.texPlywood,
        roughness: 0.5,
      }),
      cabinetBody: new THREE.MeshStandardMaterial({
        color: 0xd6a66c,
        roughness: 0.55,
      }),
      cabinetTop: new THREE.MeshStandardMaterial({
        color: 0x8c3b20,
        roughness: 0.45,
      }),
      coolerBlue: new THREE.MeshStandardMaterial({
        color: 0x0e86e8,
        roughness: 0.32,
        metalness: 0.08,
      }),
      whitePlastic: new THREE.MeshStandardMaterial({
        color: 0xf4f7fb,
        roughness: 0.25,
      }),
      darkMetal: new THREE.MeshStandardMaterial({
        color: 0x222834,
        roughness: 0.4,
        metalness: 0.7,
      }),
      foamEdge: new THREE.MeshStandardMaterial({
        color: 0xeaf5ff,
        roughness: 0.5,
      }),
      goldTrim: new THREE.MeshStandardMaterial({
        color: 0xffd85a,
        roughness: 0.32,
        metalness: 0.45,
        emissive: 0xffb800,
        emissiveIntensity: 0.15,
      }),
      starCellophane: new THREE.MeshStandardMaterial({
        color: 0xffdf6b,
        emissive: 0xffb700,
        emissiveIntensity: 0.65,
        roughness: 0.25,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
      }),
      ledCyan: new THREE.MeshStandardMaterial({
        color: 0x00cfff,
        emissive: 0x00cfff,
        emissiveIntensity: 1.4,
        roughness: 0.2,
      }),
      ledWarm: new THREE.MeshStandardMaterial({
        color: 0xffdf7a,
        emissive: 0xffb830,
        emissiveIntensity: 1.5,
        roughness: 0.2,
      }),
      wireBlack: new THREE.MeshStandardMaterial({
        color: 0x1a1e29,
        roughness: 0.6,
      }),
      fishingLine: new THREE.MeshBasicMaterial({
        color: 0xd8ecff,
        transparent: true,
        opacity: 0.55,
      }),
      cloudFront: new THREE.MeshStandardMaterial({
        map: this.texCloud,
        transparent: true,
        alphaTest: 0.08,
        roughness: 0.35,
        side: THREE.DoubleSide,
      }),
      binaryMat: new THREE.MeshStandardMaterial({
        map: this.texBinary,
        emissive: 0x004466,
        emissiveIntensity: 0.35,
        roughness: 0.3,
      }),
      circuitMat: new THREE.MeshStandardMaterial({
        map: this.texCircuit,
        emissive: 0x003855,
        emissiveIntensity: 0.35,
        roughness: 0.3,
      }),
      backdropMat: new THREE.MeshStandardMaterial({
        map: this.texBackdrop,
        roughness: 0.65,
        side: THREE.DoubleSide,
      }),
      gateGlobeMat: new THREE.MeshStandardMaterial({
        map: this.texCyberGlobe,
        transparent: true,
        alphaTest: 0.05,
        roughness: 0.25,
        side: THREE.DoubleSide,
      }),
      gateWaveMat: new THREE.MeshStandardMaterial({
        map: this.texGateWave,
        transparent: true,
        alphaTest: 0.05,
        roughness: 0.3,
        emissive: 0x004477,
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide,
      }),
      gateShieldMat: new THREE.MeshStandardMaterial({
        map: this.texGateShield,
        transparent: true,
        alphaTest: 0.05,
        roughness: 0.22,
        emissive: 0x0066aa,
        emissiveIntensity: 0.45,
        side: THREE.DoubleSide,
      }),
    };

    // Canvas textures riêng cho 4 bảng hiệu logo trên gian hàng + 4 bảng hiệu trên Cổng trại
    this.signCanvases = {};
    this.signTextures = {};
    this.signMaterials = {};
    ['ptit', 'str4', 'd26', 'doan', 'gate_banner', 'ptit_cutout', 'd26_square', 'doan_cutout'].forEach((key) => {
      const c = document.createElement('canvas');
      if (key === 'gate_banner') { c.width = 1400; c.height = 480; }
      else if (key === 'str4') { c.width = 1024; c.height = 600; }
      else if (key === 'd26') { c.width = 840; c.height = 600; }
      else { c.width = 512; c.height = 512; }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      if (this.renderer) tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      this.signCanvases[key] = c;
      this.signTextures[key] = tex;
      const isAlpha = key === 'gate_banner' || key === 'ptit_cutout' || key === 'doan_cutout';
      this.signMaterials[key] = new THREE.MeshStandardMaterial({
        map: tex,
        transparent: isAlpha,
        alphaTest: isAlpha ? 0.08 : 0,
        roughness: 0.22,
        metalness: 0.06,
        side: THREE.DoubleSide,
      });
      this._renderSignCanvas(key);
    });
  }

  _loadDefaultLogos() {
    Object.entries(DEFAULT_LOGO_PATHS).forEach(([key, url]) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.logoImages[key] = img;
        this._renderAllForLogoKey(key);
      };
      img.onerror = () => {
        console.warn(`Không tải được ảnh mặc định cho ${key}, chuyển sang hiển thị placeholder.`);
        this._renderAllForLogoKey(key);
      };
      img.src = url;
    });
  }

  _renderAllForLogoKey(key) {
    this._renderSignCanvas(key);
    if (key === 'str4') this._renderSignCanvas('gate_banner');
    if (key === 'ptit') this._renderSignCanvas('ptit_cutout');
    if (key === 'd26') this._renderSignCanvas('d26_square');
    if (key === 'doan') this._renderSignCanvas('doan_cutout');
  }

  // Cho phép người dùng tải lên file ảnh logo riêng cho từng vị trí
  setCustomLogoFile(key, file) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('Không có tệp'));
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.logoImages[key] = img;
          this.usePlaceholders = false;
          this._renderAllForLogoKey(key);
          resolve(img);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  resetDefaultLogos() {
    this.usePlaceholders = false;
    this.logoScale = { ptit: 1.0, str4: 1.0, d26: 1.0, doan: 1.0 };
    this._loadDefaultLogos();
  }

  setLogoScale(key, scale) {
    this.logoScale[key] = Math.max(0.6, Math.min(1.35, Number(scale) || 1.0));
    this._renderAllForLogoKey(key);
  }

  // Vẽ mặt bảng hiệu từ đúng ảnh logo gốc (giữ nguyên tỷ lệ gốc, không biến dạng)
  _renderSignCanvas(key) {
    const c = this.signCanvases[key];
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    const baseKey = key === 'gate_banner' ? 'str4' : key.replace(/_(cutout|square)$/, '');
    const img = !this.usePlaceholders ? this.logoImages[baseKey] : null;
    const scale = this.logoScale[baseKey] || 1.0;

    ctx.clearRect(0, 0, W, H);

    // Helper vẽ ảnh giữ nguyên tỷ lệ (object-fit: contain), hỗ trợ cắt viền trống (sx, sy, sw, sh)
    const drawContain = (image, bx, by, bw, bh, s = 1.0, crop = null) => {
      const sx = crop ? crop.sx : 0;
      const sy = crop ? crop.sy : 0;
      const sw = crop ? crop.sw : image.width;
      const sh = crop ? crop.sh : image.height;
      const ir = sw / sh;
      const br = bw / bh;
      let dw, dh;
      if (ir > br) {
        dw = bw * s;
        dh = (bw / ir) * s;
      } else {
        dh = bh * s;
        dw = (bh * ir) * s;
      }
      const dx = bx + (bw - dw) / 2;
      const dy = by + (bh - dh) / 2;
      ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    };

    if (key === 'ptit' || key === 'doan') {
      // Biển tròn: nền tối tiệp với nền logo gốc + viền tròn kép vàng kim - đỏ/xanh
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, W, H);

      if (img) {
        drawContain(img, 54, 54, W - 108, H - 108, scale);
      } else {
        this._drawPlaceholder(ctx, W, H, key === 'ptit' ? 'LOGO PTIT' : 'LOGO ĐOÀN TN');
      }

      // Viền tròn bảng hiệu
      ctx.strokeStyle = '#ffd85a';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, W / 2 - 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = key === 'ptit' ? '#d91f26' : '#00a651';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, W / 2 - 30, 0, Math.PI * 2);
      ctx.stroke();
    } else if (key === 'str4') {
      // Bảng chữ nhật ASTRA.SEC / STR4.SEC (cỡ lớn, bên phải-giữa):
      // Lược bỏ khoảng trống xanh đen thừa phía trên của tệp gốc để ngôi sao + chữ STR4.SEC phóng to tối đa, giữ nguyên tỷ lệ gốc
      ctx.fillStyle = '#011339';
      ctx.fillRect(0, 0, W, H);

      if (img) {
        const isDefaultStr4 = img.width === 425 && img.height === 268;
        const crop = isDefaultStr4 ? { sx: 14, sy: 48, sw: 400, sh: 214 } : null;
        drawContain(img, 18, 18, W - 36, H - 36, scale * 1.06, crop);
      } else {
        this._drawPlaceholder(ctx, W, H, 'LOGO ASTRA.SEC / STR4.SEC');
      }

      ctx.strokeStyle = '#00cfff';
      ctx.lineWidth = 14;
      ctx.strokeRect(8, 8, W - 16, H - 16);
      ctx.strokeStyle = '#ffd85a';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, W - 40, H - 40);
    } else if (key === 'd26') {
      // Bảng LCD An toàn thông tin D26 (đặt bên trái-giữa):
      // Hiển thị nguyên bản logo D26 (chim cú + nón lá + chữ AN TOÀN THÔNG TIN D26) to, rõ nét giữ đúng tỷ lệ 1:1
      ctx.fillStyle = '#020b24';
      ctx.fillRect(0, 0, W, H);

      if (img) {
        const isDefaultD26 = img.width === 540 && img.height === 540;
        const crop = isDefaultD26 ? { sx: 20, sy: 45, sw: 500, sh: 485 } : null;
        drawContain(img, 16, 14, W - 32, H - 28, scale * 1.05, crop);
      } else {
        this._drawPlaceholder(ctx, W, H, 'LOGO AN TOÀN THÔNG TIN D26');
      }

      // Viền gỗ/tre + LED neon
      ctx.strokeStyle = '#c99b63';
      ctx.lineWidth = 14;
      ctx.strokeRect(8, 8, W - 16, H - 16);
      ctx.strokeStyle = '#00cfff';
      ctx.lineWidth = 4;
      ctx.strokeRect(18, 18, W - 36, H - 36);
    } else if (key === 'gate_banner') {
      // Băng rôn đuôi én đỉnh cổng trại: hình đuôi én bên phải + logo STR4.SEC cỡ lớn
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(4, 10);
      ctx.lineTo(W - 10, 10);
      ctx.lineTo(W - 155, H * 0.52);
      ctx.lineTo(W - 10, H - 10);
      ctx.lineTo(4, H - 10);
      ctx.closePath();
      ctx.fillStyle = '#031b4e';
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = 'rgba(0, 207, 255, 0.65)';
      ctx.stroke();
      ctx.clip();

      if (img) {
        const isDefaultStr4 = img.width === 425 && img.height === 268;
        const crop = isDefaultStr4 ? { sx: 14, sy: 38, sw: 400, sh: 222 } : null;
        // Đặt logo STR4.SEC lệch nhẹ sang phải để không bị Quả cầu Mắt thần bên trái che khuất
        drawContain(img, 235, 20, W - 390, H - 40, scale * 1.04, crop);
      } else {
        this._drawPlaceholder(ctx, W - 160, H, 'BĂNG RÔN CỔNG TRẠI STR4.SEC');
      }
      ctx.restore();
    } else if (key === 'ptit_cutout' || key === 'doan_cutout') {
      // Huy hiệu PTIT và Đoàn TN gắn trên trụ thang cổng trại:
      // Tách nền đen thuần (key out black background) của ảnh gốc để huy hiệu nổi trực tiếp trên khung thang tre như ảnh thiết kế cổng
      if (img) {
        drawContain(img, 14, 14, W - 28, H - 28, scale);
        try {
          const imgData = ctx.getImageData(0, 0, W, H);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            if (d[i] < 26 && d[i + 1] < 26 && d[i + 2] < 26) {
              d[i + 3] = 0;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch (_) {
          // Bỏ qua nếu trình duyệt chặn getImageData
        }
      } else {
        this._drawPlaceholder(ctx, W, H, key === 'ptit_cutout' ? 'PTIT' : 'ĐOÀN TN');
      }
    } else if (key === 'd26_square') {
      // Bảng vuông Logo ATTT D26 gắn trên trụ thang trái của cổng trại
      ctx.fillStyle = '#020b24';
      ctx.fillRect(0, 0, W, H);
      if (img) {
        drawContain(img, 8, 8, W - 16, H - 16, scale * 1.04);
      } else {
        this._drawPlaceholder(ctx, W, H, 'D26');
      }
      ctx.strokeStyle = '#00cfff';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, W - 8, H - 8);
    }

    if (this.signTextures[key]) {
      this.signTextures[key].needsUpdate = true;
    }
  }

  _drawPlaceholder(ctx, W, H, label) {
    ctx.fillStyle = '#0b2254';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#00cfff';
    ctx.setLineDash([14, 10]);
    ctx.lineWidth = 6;
    ctx.strokeRect(28, 28, W - 56, H - 56);
    ctx.setLineDash([]);
    ctx.fillStyle = '#eaf5ff';
    ctx.font = 'bold 34px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, W / 2, H / 2 - 16);
    ctx.fillStyle = '#ffd85a';
    ctx.font = '22px "Segoe UI", sans-serif';
    ctx.fillText('(Tải ảnh lên ở bảng điều khiển bên phải)', W / 2, H / 2 + 28);
  }

  // -------------------------------------------------------------------
  //  XÂY DỰNG TOÀN BỘ MÔ HÌNH TỪ LAYOUT
  // -------------------------------------------------------------------
  build(layout) {
    this.layout = layout;
    this._clearGroup(this.partsGroup);
    this._clearGroup(this.surveyGroup);
    this._clearGroup(this.dimsGroup);
    this._clearGroup(this.stagingGroup);
    this.partMeshes.clear();

    const poleMat = this.mats[layout.params.material] || this.mats.natural;

    for (const part of layout.parts) {
      const obj = this._buildPartObject(part, poleMat, layout);
      if (!obj) continue;
      obj.name = part.id;
      obj.userData = {
        partId: part.id,
        part,
        basePos: obj.position.clone(),
        baseQuat: obj.quaternion.clone(),
        baseScale: obj.scale.clone(),
      };
      // Gán liên kết ngược cho từng mesh con để raycast click bất kỳ điểm nào cũng nhận diện đúng cấu kiện
      obj.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.userData.partId = part.id;
          child.userData.part = part;
          if (this.wireframe && child.material) {
            child.material.wireframe = true;
          }
        }
      });

      if (this.groupVisibility[part.group] === false) {
        obj.visible = false;
      }

      this.partsGroup.add(obj);
      this.partMeshes.set(part.id, obj);
    }

    this._buildSurveyOverlay(layout);
    this._buildDimensions3D(layout);
    this._buildStagingPile(layout, poleMat);
    this.applyLightingState();
  }

  _clearGroup(grp) {
    while (grp.children.length > 0) {
      const ch = grp.children.pop();
      grp.remove(ch);
    }
  }

  // Dựng từng cấu kiện 3D theo shape
  _buildPartObject(part, poleMat, layout) {
    switch (part.shape) {
      case 'seg':
        return this._buildSegment(part, poleMat, layout);
      case 'footing':
        return this._buildFooting(part);
      case 'sandbag':
        return this._buildSandbag(part);
      case 'ring':
        return this._buildJoint(part);
      case 'box':
        return this._buildBox(part);
      case 'cabinet':
        return this._buildCabinet(part);
      case 'table':
        return this._buildPrepTable(part);
      case 'stove':
        return this._buildStove(part);
      case 'cooler':
        return this._buildCooler(part);
      case 'menu':
        return this._buildMenuStand(part);
      case 'signDisc':
        return this._buildSignDisc(part);
      case 'signBoard':
        return this._buildSignBoard(part);
      case 'cloud':
        return this._buildCloudSign(part);
      case 'hangStar':
        return this._buildHangStar(part, poleMat);
      case 'smallStar':
        return this._buildSmallStar(part);
      case 'planet':
        return this._buildPlanet(part);
      case 'shield':
        return this._buildShield(part);
      case 'padlock':
        return this._buildPadlock(part);
      case 'panel':
        return this._buildPanel(part);
      case 'tube':
        return this._buildTube(part);
      case 'backdrop':
        return this._buildBackdrop(part);
      case 'gateBanner':
        return this._buildGateBanner(part);
      case 'gateGlobe':
        return this._buildGateGlobe(part);
      case 'gateBadge':
        return this._buildGateBadge(part);
      case 'gateWave':
        return this._buildGateWave(part);
      case 'gateShield':
        return this._buildGateShield(part);
      case 'gateStarCluster':
        return this._buildGateStarCluster(part);
      case 'gateSparkle':
        return this._buildGateSparkle(part);
      default:
        return null;
    }
  }

  // Thanh tre / gỗ / PVC hoặc thanh LED thẳng
  _buildSegment(part, poleMat, layout) {
    const a = new THREE.Vector3(...part.a);
    const b = new THREE.Vector3(...part.b);
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const r = part.d / 2;

    const grp = new THREE.Group();
    grp.position.copy(mid);
    grp.quaternion.setFromUnitVectors(UP, dir.clone().normalize());

    // Dải LED thanh
    if (part.bamboo === false) {
      const geo = new THREE.BoxGeometry(part.d, len, part.d);
      const mesh = new THREE.Mesh(geo, this.mats.ledCyan);
      grp.add(mesh);
      return grp;
    }

    // Thân chính (tròn cho tre/PVC, vuông vát cạnh cho gỗ)
    let bodyGeo;
    if (part.profile === 'square') {
      bodyGeo = new THREE.BoxGeometry(part.d, len, part.d);
    } else {
      bodyGeo = new THREE.CylinderGeometry(r * 0.985, r, len, 14, 1, false);
    }
    const body = new THREE.Mesh(bodyGeo, poleMat);
    grp.add(body);

    // Nếu là tre tự nhiên hoặc tre sơn PU: thêm các vòng đốt tre nổi 3D cách đều 34–38 cm
    if (layout.kind === 'bamboo' && part.d >= 0.04) {
      const nodeStep = part.d >= 0.08 ? 0.36 : 0.32;
      const nNodes = Math.floor(len / nodeStep);
      const ringGeo = new THREE.TorusGeometry(r * 1.01, Math.max(0.003, r * 0.09), 6, 14);
      ringGeo.rotateX(Math.PI / 2);
      for (let i = 1; i <= nNodes; i++) {
        const y = -len / 2 + i * nodeStep - nodeStep * 0.3;
        if (Math.abs(y) < len / 2 - 0.04) {
          const ring = new THREE.Mesh(ringGeo, this.mats.bambooNode);
          ring.position.y = y;
          grp.add(ring);
        }
      }
      // Lõi rỗng 2 đầu ống tre
      const capGeo = new THREE.RingGeometry(r * 0.35, r * 0.78, 12);
      capGeo.rotateX(-Math.PI / 2);
      const topCap = new THREE.Mesh(capGeo, this.mats.bambooInner);
      topCap.position.y = len / 2 + 0.001;
      grp.add(topCap);
    }

    return grp;
  }

  // Chân đế xô bê tông 20L + ống lồng PVC Ø114 + bu lông hãm
  _buildFooting(part) {
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    // Vỏ xô nhựa hình côn nhẹ
    const bucketGeo = new THREE.CylinderGeometry(part.r * 1.04, part.r * 0.9, part.h, 18);
    const bucket = new THREE.Mesh(bucketGeo, this.mats.bucket);
    bucket.position.y = part.h / 2;
    grp.add(bucket);

    // Vành miệng xô
    const rimGeo = new THREE.TorusGeometry(part.r * 1.04, 0.01, 8, 20);
    rimGeo.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, this.mats.bucket);
    rim.position.y = part.h - 0.015;
    grp.add(rim);

    // Mặt bê tông trong xô
    const concGeo = new THREE.CylinderGeometry(part.r * 0.98, part.r * 0.98, 0.02, 16);
    const conc = new THREE.Mesh(concGeo, this.mats.concrete);
    conc.position.y = part.h - 0.01;
    grp.add(conc);

    // Ống lồng PVC Ø114 nhô cao thêm 8 cm để giữ chặt chân cột
    const sleeveGeo = new THREE.CylinderGeometry(0.058, 0.058, 0.1, 16);
    const sleeve = new THREE.Mesh(sleeveGeo, this.mats.pvcSleeve);
    sleeve.position.y = part.h + 0.04;
    grp.add(sleeve);

    // Bu lông xuyên ngang ống lồng
    const boltGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.14, 8);
    boltGeo.rotateZ(Math.PI / 2);
    const bolt = new THREE.Mesh(boltGeo, this.mats.bolt);
    bolt.position.y = part.h + 0.05;
    grp.add(bolt);

    return grp;
  }

  // Bao cát gia tải + băng phản quang vàng
  _buildSandbag(part) {
    const grp = new THREE.Group();
    grp.position.set(...part.c);
    grp.rotation.y = part.rotY || 0;

    const bagGeo = new THREE.BoxGeometry(0.4, 0.11, 0.26);
    const bag = new THREE.Mesh(bagGeo, this.mats.sandbag);
    bag.scale.set(1, 0.95, 1);
    grp.add(bag);

    const stripGeo = new THREE.BoxGeometry(0.41, 0.025, 0.08);
    const strip = new THREE.Mesh(stripGeo, this.mats.reflective);
    strip.position.y = 0.046;
    grp.add(strip);

    return grp;
  }

  // Mối nối bu lông M8 + vòng dây mây buộc chéo
  _buildJoint(part) {
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    const torusGeo = new THREE.TorusGeometry(part.r, part.tube, 8, 16);
    const dir = new THREE.Vector3(...(part.axis || [0, 1, 0])).normalize();
    const t1 = new THREE.Mesh(torusGeo, this.mats.lashing);
    t1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    grp.add(t1);

    const t2 = new THREE.Mesh(torusGeo, this.mats.lashing);
    t2.rotation.x = Math.PI / 4;
    t2.rotation.y = Math.PI / 4;
    grp.add(t2);

    const boltGeo = new THREE.CylinderGeometry(0.007, 0.007, part.r * 2.4, 8);
    boltGeo.rotateX(Math.PI / 2);
    const bolt = new THREE.Mesh(boltGeo, this.mats.bolt);
    grp.add(bolt);

    return grp;
  }

  _buildBox(part) {
    const mat = part.mat === 'adapter' ? this.mats.darkMetal : this.mats.plywood;
    const geo = new THREE.BoxGeometry(...part.s);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...part.c);
    return mesh;
  }

  // Tủ gỗ 3 ngăn kéo bên phải quầy (đúng như Hình 1)
  _buildCabinet(part) {
    const [w, h, d] = part.s;
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h - 0.03, d), this.mats.cabinetBody);
    body.position.y = (h - 0.03) / 2;
    grp.add(body);

    const top = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.035, d + 0.02), this.mats.cabinetTop);
    top.position.y = h - 0.015;
    grp.add(top);

    // 3 ngăn kéo mặt trước
    const dh = (h - 0.1) / 3;
    for (let i = 0; i < 3; i++) {
      const drawer = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, dh - 0.015, 0.015), this.mats.plywood);
      drawer.position.set(0, 0.04 + dh * (i + 0.5), d / 2 + 0.008);
      grp.add(drawer);
    }
    return grp;
  }

  // Bàn gấp chuẩn bị phía sau
  _buildPrepTable(part) {
    const [w, h, d] = part.s;
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.025, d), this.mats.plywood);
    top.position.y = h - 0.012;
    grp.add(top);

    const legGeo = new THREE.CylinderGeometry(0.014, 0.014, h - 0.02, 8);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const leg = new THREE.Mesh(legGeo, this.mats.darkMetal);
      leg.position.set(sx * (w / 2 - 0.05), (h - 0.02) / 2, sz * (d / 2 - 0.05));
      grp.add(leg);
    });
    return grp;
  }

  // Bếp điện từ + vòng cảnh báo an toàn nhiệt 0,5 m
  _buildStove(part) {
    const [w, h, d] = part.s;
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.mats.darkMetal);
    body.position.y = h / 2;
    grp.add(body);

    const burner = new THREE.Mesh(
      new THREE.RingGeometry(0.05, 0.095, 24),
      new THREE.MeshBasicMaterial({ color: 0xff3b30, side: THREE.DoubleSide }),
    );
    burner.rotation.x = -Math.PI / 2;
    burner.position.y = h + 0.002;
    grp.add(burner);

    // Vòng bán kính an toàn 0,5m xung quanh bếp
    const safeRing = new THREE.Mesh(
      new THREE.RingGeometry(0.48, 0.5, 32),
      new THREE.MeshBasicMaterial({ color: 0xff9500, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
    );
    safeRing.rotation.x = -Math.PI / 2;
    safeRing.position.y = 0.005;
    grp.add(safeRing);

    return grp;
  }

  // Thùng đá tròn màu xanh dương trên mặt quầy (như Hình 1)
  _buildCooler(part) {
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(part.r, part.r * 0.94, part.h, 20), this.mats.coolerBlue);
    body.position.y = part.h / 2;
    grp.add(body);

    // Các gân tròn quanh thùng đá
    [0.08, 0.16, 0.24].forEach((y) => {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(part.r * 0.99, 0.006, 6, 20), this.mats.coolerBlue);
      rib.rotation.x = Math.PI / 2;
      rib.position.y = y;
      grp.add(rib);
    });

    const lid = new THREE.Mesh(new THREE.CylinderGeometry(part.r * 1.03, part.r * 1.03, 0.025, 20), this.mats.coolerBlue);
    lid.position.y = part.h + 0.01;
    grp.add(lid);

    return grp;
  }

  // Kệ Menu mica trắng góc phải quầy (như Hình 1)
  _buildMenuStand(part) {
    const [w, h, d] = part.s;
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.012, d), this.mats.whitePlastic);
    base.position.y = 0.006;
    grp.add(base);

    const card = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.008), this.mats.whitePlastic);
    card.position.set(0, h / 2 + 0.01, 0);
    card.rotation.x = -0.12;
    grp.add(card);

    return grp;
  }

  // Biển tròn PTIT (trái) và Đoàn TN (phải)
  _buildSignDisc(part) {
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    // Thân đĩa tròn foam
    const discGeo = new THREE.CylinderGeometry(part.r, part.r, part.t, 40);
    discGeo.rotateX(Math.PI / 2);
    const disc = new THREE.Mesh(discGeo, this.mats.foamEdge);
    grp.add(disc);

    // Mặt trước phẳng (CircleGeometry nằm trong mặt phẳng XY nên UV luôn thẳng đứng chuẩn 100%)
    const faceMat = this.signMaterials[part.logo] || this.mats.foamEdge;
    const frontFace = new THREE.Mesh(new THREE.CircleGeometry(part.r * 0.985, 48), faceMat);
    frontFace.position.z = part.t / 2 + 0.0015;
    grp.add(frontFace);

    // Mặt sau
    const backFace = new THREE.Mesh(new THREE.CircleGeometry(part.r * 0.985, 36), this.mats.plywood);
    backFace.rotation.y = Math.PI;
    backFace.position.z = -part.t / 2 - 0.001;
    grp.add(backFace);

    // Viền nổi 3D bao quanh biển tròn
    const rimGeo = new THREE.TorusGeometry(part.r, 0.011, 10, 40);
    const rim = new THREE.Mesh(rimGeo, this.mats.goldTrim);
    rim.position.z = part.t / 2;
    grp.add(rim);

    // Dây buộc trên & dưới vào xà
    const tieGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.07, 8);
    [-1, 1].forEach((sy) => {
      const tie = new THREE.Mesh(tieGeo, this.mats.lashing);
      tie.position.set(0, sy * (part.r - 0.02), -0.025);
      tie.rotation.x = Math.PI / 2;
      grp.add(tie);
    });

    return grp;
  }

  // Bảng chữ nhật STR4.SEC và An toàn thông tin D26
  _buildSignBoard(part) {
    const [w, h, t] = part.s;
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    const faceMat = this.signMaterials[part.logo] || this.mats.foamEdge;
    // BoxGeometry material order: +x, -x, +y, -y, +z (front), -z (back)
    const boardGeo = new THREE.BoxGeometry(w, h, t);
    const mats = [
      this.mats.foamEdge,
      this.mats.foamEdge,
      this.mats.foamEdge,
      this.mats.foamEdge,
      faceMat,
      this.mats.plywood,
    ];
    const board = new THREE.Mesh(boardGeo, mats);
    grp.add(board);

    // Khung nẹp viền quanh bảng
    const frameT = 0.016;
    const barMat = part.logo === 'd26' ? this.mats.natural : this.mats.ledCyan;
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, frameT, t + 0.008), barMat);
    topBar.position.y = h / 2;
    const botBar = topBar.clone();
    botBar.position.y = -h / 2;
    const leftBar = new THREE.Mesh(new THREE.BoxGeometry(frameT, h + 0.02, t + 0.008), barMat);
    leftBar.position.x = -w / 2;
    const rightBar = leftBar.clone();
    rightBar.position.x = w / 2;
    grp.add(topBar, botBar, leftBar, rightBar);

    return grp;
  }

  // Biển đám mây "Ẩm thực Ngân hà" phía trước quầy
  _buildCloudSign(part) {
    const [w, h, t] = part.s;
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    // Mặt trước cắt theo alpha của đám mây + lớp nền tạo độ dày 3D
    const front = new THREE.Mesh(new THREE.PlaneGeometry(w, h), this.mats.cloudFront);
    front.position.z = t / 2;
    const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), this.mats.cloudFront);
    back.position.z = -t / 2;
    grp.add(front, back);

    return grp;
  }

  // Ngôi sao 3D đan từ que tre + lồng giấy kiếng vàng + bóng LED tâm + dây cước treo
  _buildHangStar(part, poleMat) {
    const grp = new THREE.Group();
    grp.position.set(...part.c);
    grp.rotation.y = part.rotY || 0;

    const R = part.r;
    const rIn = R * 0.4;
    const starShape = new THREE.Shape();
    const outerPts = [];
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? R : rIn;
      const ang = (i * Math.PI) / 5 + Math.PI / 2;
      const x = Math.cos(ang) * rad;
      const y = Math.sin(ang) * rad;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
      if (i % 2 === 0) outerPts.push(new THREE.Vector3(x, y, 0));
    }
    starShape.closePath();

    // Lõi giấy kiếng vàng phát sáng nhẹ
    const coreGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.016, bevelEnabled: false });
    coreGeo.translate(0, 0, -0.008);
    const core = new THREE.Mesh(coreGeo, this.mats.starCellophane);
    grp.add(core);

    // 5 thanh que tre đan thành ngôi sao 5 cánh (nối đỉnh i -> i+2)
    const stickOrder = [0, 2, 4, 1, 3, 0];
    for (let k = 0; k < 5; k++) {
      const p1 = outerPts[stickOrder[k]].clone();
      const p2 = outerPts[stickOrder[k + 1]].clone();
      p1.z = (k % 2 === 0 ? 1 : -1) * 0.012;
      p2.z = -p1.z;
      const dVec = new THREE.Vector3().subVectors(p2, p1);
      const stickGeo = new THREE.CylinderGeometry(0.0045, 0.0045, dVec.length(), 6);
      const stick = new THREE.Mesh(stickGeo, poleMat);
      stick.position.addVectors(p1, p2).multiplyScalar(0.5);
      stick.quaternion.setFromUnitVectors(UP, dVec.normalize());
      grp.add(stick);
    }

    // Bóng LED ấm ở tâm ngôi sao
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 12), this.mats.ledWarm);
    grp.add(bulb);

    // Dây cước treo lên nan mái
    if (part.line > 0) {
      const lineGeo = new THREE.CylinderGeometry(0.0015, 0.0015, part.line, 4);
      const lineMesh = new THREE.Mesh(lineGeo, this.mats.fishingLine);
      lineMesh.position.set(0, R + part.line / 2, 0);
      grp.add(lineMesh);
    }

    return grp;
  }

  // Ngôi sao foam nhỏ gắn trên đầu đòn tay
  _buildSmallStar(part) {
    const R = part.size / 2;
    const rIn = R * 0.42;
    const sh = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? R : rIn;
      const a = (i * Math.PI) / 5 + Math.PI / 2;
      const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
      if (i === 0) sh.moveTo(x, y);
      else sh.lineTo(x, y);
    }
    sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.01, bevelEnabled: false });
    geo.translate(0, 0, -0.005);
    const mesh = new THREE.Mesh(geo, this.mats.goldTrim);
    mesh.position.set(...part.c);
    if (part.flip) mesh.rotation.y = Math.PI;
    return mesh;
  }

  // Hành tinh xốp + vành đai + quỹ đạo ống PVC treo dây cước
  _buildPlanet(part) {
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    const colors = {
      gold: 0xffc84a,
      cyan: 0x00cfff,
      orange: 0xff6b3d,
    };
    const sphereMat = new THREE.MeshStandardMaterial({
      color: colors[part.palette] || 0x00cfff,
      roughness: 0.35,
      metalness: 0.15,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(part.r, 24, 24), sphereMat);
    grp.add(sphere);

    const orbitPivot = new THREE.Group();
    orbitPivot.rotation.z = part.tilt || 0.4;
    orbitPivot.rotation.x = 0.35;
    grp.add(orbitPivot);

    if (part.ring) {
      const ringGeo = new THREE.RingGeometry(part.ring[0], part.ring[1], 32);
      ringGeo.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(
        ringGeo,
        new THREE.MeshStandardMaterial({ color: 0xffd85a, roughness: 0.4, side: THREE.DoubleSide }),
      );
      orbitPivot.add(ring);
    }

    if (part.orbit) {
      const orbitGeo = new THREE.TorusGeometry(part.orbit[0], 0.005, 8, 36);
      orbitGeo.rotateX(Math.PI / 2);
      const orbit = new THREE.Mesh(orbitGeo, this.mats.ledCyan);
      orbitPivot.add(orbit);
    }

    if (part.line > 0) {
      const lineGeo = new THREE.CylinderGeometry(0.0015, 0.0015, part.line, 4);
      const lineMesh = new THREE.Mesh(lineGeo, this.mats.fishingLine);
      lineMesh.position.set(0, part.r + part.line / 2, 0);
      grp.add(lineMesh);
    }

    return grp;
  }

  // Khiên bảo mật gắn cột trái
  _buildShield(part) {
    const [w, h, t] = part.s;
    const sh = new THREE.Shape();
    sh.moveTo(0, h / 2);
    sh.lineTo(w / 2, h * 0.32);
    sh.quadraticCurveTo(w * 0.48, -h * 0.2, 0, -h / 2);
    sh.quadraticCurveTo(-w * 0.48, -h * 0.2, -w / 2, h * 0.32);
    sh.closePath();

    const geo = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002 });
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    const shield = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: 0x071b45, emissive: 0x005577, emissiveIntensity: 0.4, roughness: 0.25 }),
    );
    grp.add(shield);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(w * 0.28, 0.006, 8, 20), this.mats.ledCyan);
    rim.position.z = t + 0.003;
    grp.add(rim);

    return grp;
  }

  // Ổ khóa bảo mật gắn cột phải
  _buildPadlock(part) {
    const [w, h, t] = part.s;
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.68, t * 1.4), this.mats.goldTrim);
    body.position.y = -h * 0.14;
    grp.add(body);

    const shackleGeo = new THREE.TorusGeometry(w * 0.28, 0.011, 8, 20, Math.PI);
    const shackle = new THREE.Mesh(shackleGeo, this.mats.bolt);
    shackle.position.y = h * 0.2;
    grp.add(shackle);

    const keyhole = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, t * 1.6, 12), this.mats.darkMetal);
    keyhole.rotation.x = Math.PI / 2;
    keyhole.position.y = -h * 0.14;
    grp.add(keyhole);

    return grp;
  }

  // Dải nhị phân 0-1 & Tấm mạch điện
  _buildPanel(part) {
    const mat = part.panel === 'binary' ? this.mats.binaryMat : this.mats.circuitMat;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...part.s), mat);
    mesh.position.set(...part.c);
    if (part.rotY) mesh.rotation.y = part.rotY;
    return mesh;
  }

  // Dây đèn đom đóm & tuyến dây điện
  _buildTube(part) {
    const grp = new THREE.Group();
    const vecs = part.path.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(vecs, false, part.polyline ? 'catmullrom' : 'centripetal', 0.15);
    const segs = Math.max(16, vecs.length * 4);
    const tubeGeo = new THREE.TubeGeometry(curve, segs, part.radius || 0.004, 6, false);
    const mat = part.bulbs ? this.mats.fishingLine : this.mats.wireBlack;
    grp.add(new THREE.Mesh(tubeGeo, mat));

    if (part.bulbs) {
      const nBulbs = 28;
      const bulbGeo = new THREE.SphereGeometry(0.013, 8, 8);
      for (let i = 1; i < nBulbs; i++) {
        const pt = curve.getPoint(i / nBulbs);
        const bulb = new THREE.Mesh(bulbGeo, this.mats.ledWarm);
        bulb.position.copy(pt);
        grp.add(bulb);
      }
    }
    return grp;
  }

  // Phông nền bạt in dải ngân hà
  _buildBackdrop(part) {
    const [w, h, t] = part.s;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), this.mats.backdropMat);
    mesh.position.set(...part.c);
    return mesh;
  }

  // -------------------------------------------------------------------
  //  CÁC CẤU KIỆN 3D CỦA CỔNG TRẠI (ĐẶT BAO TRÙM PHÍA TRÊN GIAN HÀNG)
  // -------------------------------------------------------------------
  // Băng rôn đuôi én STR4.SEC vắt ngang đỉnh cổng trại
  _buildGateBanner(part) {
    const [w, h, t] = part.s;
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    const mat = this.signMaterials.gate_banner || this.mats.foamEdge;
    const front = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    front.position.z = t / 2;
    const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    back.position.z = -t / 2;
    grp.add(front, back);

    return grp;
  }

  // Quả cầu Mắt thần An ninh mạng ở đỉnh trái cổng trại
  _buildGateGlobe(part) {
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    // Đĩa nền 3D tạo độ dày cho quả cầu
    const discGeo = new THREE.CylinderGeometry(part.r * 0.96, part.r * 0.96, part.t, 48);
    discGeo.rotateX(Math.PI / 2);
    const disc = new THREE.Mesh(
      discGeo,
      new THREE.MeshStandardMaterial({ color: 0x044d78, roughness: 0.35 }),
    );
    grp.add(disc);

    // Mặt trước và mặt sau quả địa cầu mắt thần
    const front = new THREE.Mesh(new THREE.CircleGeometry(part.r, 48), this.mats.gateGlobeMat);
    front.position.z = part.t / 2 + 0.002;
    const back = new THREE.Mesh(new THREE.CircleGeometry(part.r, 48), this.mats.gateGlobeMat);
    back.rotation.y = Math.PI;
    back.position.z = -part.t / 2 - 0.002;
    grp.add(front, back);

    return grp;
  }

  // Huy hiệu Logo (PTIT, D26, Đoàn TN) gắn trên 2 trụ thang tre của cổng trại
  _buildGateBadge(part) {
    const [w, h, t] = part.s;
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    const mat = this.signMaterials[part.logo] || this.mats.foamEdge;
    if (part.logo === 'd26_square') {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, t),
        [this.mats.foamEdge, this.mats.foamEdge, this.mats.foamEdge, this.mats.foamEdge, mat, this.mats.plywood],
      );
      grp.add(box);
    } else {
      // Huy hiệu cắt viền trong suốt (PTIT & Đoàn TN)
      const front = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      front.position.z = t / 2;
      const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      back.position.z = -t / 2;
      grp.add(front, back);
    }
    return grp;
  }

  // Cánh sóng mạch điện ngân hà 2 tầng ở 2 bên chân cổng trại
  _buildGateWave(part) {
    const [w, h, t] = part.s;
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), this.mats.gateWaveMat);
    if (part.side > 0) {
      plane.scale.x = -1; // Đảo chiều đối xứng cho cụm sóng chân cổng bên phải
    }
    const backPlane = plane.clone();
    backPlane.position.z = -t;
    grp.add(plane, backPlane);
    return grp;
  }

  // Khiên bảo mật có biểu tượng Ổ khóa phát sáng ở chân cổng trái
  _buildGateShield(part) {
    const [w, h, t] = part.s;
    const grp = new THREE.Group();
    grp.position.set(...part.c);

    const front = new THREE.Mesh(new THREE.PlaneGeometry(w, h), this.mats.gateShieldMat);
    front.position.z = t / 2;
    const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), this.mats.gateShieldMat);
    back.position.z = -t / 2;
    grp.add(front, back);
    return grp;
  }

  // Cụm ngôi sao 5 cánh đa lớp đồng tâm ở chân cổng phải
  _buildGateStarCluster(part) {
    const grp = new THREE.Group();
    grp.position.set(...part.c);
    grp.rotation.z = 0.14;

    const makeStarMesh = (R, rRatio, depth, colorHex, emissiveHex = 0x000000, emInt = 0) => {
      const sh = new THREE.Shape();
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? R : R * rRatio;
        const a = (i * Math.PI) / 5 + Math.PI / 2;
        const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
        if (i === 0) sh.moveTo(x, y);
        else sh.lineTo(x, y);
      }
      sh.closePath();
      const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
      geo.translate(0, 0, -depth / 2);
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: emissiveHex,
        emissiveIntensity: emInt,
        roughness: 0.28,
      });
      return new THREE.Mesh(geo, mat);
    };

    // Lớp 1 (ngoài cùng): Vàng kem lớn
    const s1 = makeStarMesh(part.r, 0.46, 0.014, 0xfff5aa, 0xffd85a, 0.25);
    // Lớp 2: Xanh cổ vịt
    const s2 = makeStarMesh(part.r * 0.78, 0.45, 0.018, 0x0b79a8, 0x0088bb, 0.25);
    s2.position.z = 0.006;
    // Lớp 3: Vàng kem trung gian
    const s3 = makeStarMesh(part.r * 0.62, 0.45, 0.022, 0xfff5aa, 0xffd85a, 0.3);
    s3.position.z = 0.012;
    // Lớp 4: Xanh cổ vịt trong
    const s4 = makeStarMesh(part.r * 0.42, 0.45, 0.026, 0x0b79a8, 0x00aadd, 0.3);
    s4.position.z = 0.018;
    // Lớp 5: Sao vàng kim nổi bật lệch nhẹ góc dưới trái như bản vẽ cổng trại
    const s5 = makeStarMesh(part.r * 0.36, 0.44, 0.032, 0xffd000, 0xffae00, 0.6);
    s5.position.set(-part.r * 0.14, -part.r * 0.14, 0.026);
    s5.rotation.z = -0.18;

    grp.add(s1, s2, s3, s4, s5);
    return grp;
  }

  // Ngôi sao 4 cánh lấp lánh (Sparkle Star) gắn dọc 2 trụ thang cổng trại
  _buildGateSparkle(part) {
    const R = part.size / 2;
    const rIn = R * 0.24;
    const sh = new THREE.Shape();
    for (let i = 0; i < 8; i++) {
      const rad = i % 2 === 0 ? R : rIn;
      const a = (i * Math.PI) / 4;
      const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
      if (i === 0) sh.moveTo(x, y);
      else sh.lineTo(x, y);
    }
    sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false });
    geo.translate(0, 0, -0.006);
    const mat = part.palette === 'cyan' ? this.mats.ledCyan : this.mats.ledWarm;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...part.c);
    return mesh;
  }

  // -------------------------------------------------------------------
  //  MẶT BẰNG KHẢO SÁT GIAI ĐOẠN 0 (Vạch phấn, Mốc cột, Phân khu)
  // -------------------------------------------------------------------
  _buildSurveyOverlay(layout) {
    const { zones } = layout;

    // Khu vực khách đứng mua hàng (phía trước +z)
    const custW = zones.customer.x2 - zones.customer.x1;
    const custD = zones.customer.z2 - zones.customer.z1;
    const custPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(custW, custD),
      new THREE.MeshBasicMaterial({ color: 0x00cfff, transparent: true, opacity: 0.1, side: THREE.DoubleSide }),
    );
    custPlane.rotation.x = -Math.PI / 2;
    custPlane.position.set(0, 0.004, (zones.customer.z1 + zones.customer.z2) / 2);
    this.surveyGroup.add(custPlane);

    // Khu vực nhân viên đứng phục vụ (giữa quầy và bàn sơ chế)
    const srvW = Math.max(0.4, zones.service.x2 - zones.service.x1);
    const srvD = Math.max(0.3, zones.service.z2 - zones.service.z1);
    const srvPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(srvW, srvD),
      new THREE.MeshBasicMaterial({ color: 0xffd85a, transparent: true, opacity: 0.14, side: THREE.DoubleSide }),
    );
    srvPlane.rotation.x = -Math.PI / 2;
    srvPlane.position.set((zones.service.x1 + zones.service.x2) / 2, 0.005, (zones.service.z1 + zones.service.z2) / 2);
    this.surveyGroup.add(srvPlane);

    // Đường vạch phấn ranh giới gian hàng
    const fp = zones.footprint;
    const borderPts = [
      new THREE.Vector3(fp.x1, 0.008, fp.z1),
      new THREE.Vector3(fp.x2, 0.008, fp.z1),
      new THREE.Vector3(fp.x2, 0.008, fp.z2),
      new THREE.Vector3(fp.x1, 0.008, fp.z2),
      new THREE.Vector3(fp.x1, 0.008, fp.z1),
    ];
    const borderLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(borderPts),
      new THREE.LineBasicMaterial({ color: 0x00cfff }),
    );
    this.surveyGroup.add(borderLine);

    // Đánh dấu tâm các cột C1..C5 trên mặt sân
    zones.posts.forEach((P) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.11, 0.14, 24),
        new THREE.MeshBasicMaterial({ color: 0xffd85a, side: THREE.DoubleSide }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(P.x, 0.009, P.z);
      this.surveyGroup.add(ring);

      const label = this._makeTextSprite(P.key, '#ffd85a', '#071b45');
      label.position.set(P.x, 0.22, P.z);
      label.scale.set(0.35, 0.16, 1);
      this.surveyGroup.add(label);
    });
  }

  // -------------------------------------------------------------------
  //  HỆ THỐNG THƯỚC ĐO 3D (Hiển thị kích thước Ngang, Sâu, Cao, Quầy, Lối đi)
  // -------------------------------------------------------------------
  _buildDimensions3D(layout) {
    const { dims, metrics } = layout;
    const W = dims.W, D = dims.D, H = dims.H, Hc = dims.Hc, Dc = dims.Dc;

    const addDim = (a, b, text, color = '#00cfff') => {
      const va = new THREE.Vector3(...a);
      const vb = new THREE.Vector3(...b);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([va, vb]);
      const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color }));
      this.dimsGroup.add(line);

      // Đầu chặn 2 đầu thước
      [va, vb].forEach((pt) => {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), new THREE.MeshBasicMaterial({ color }));
        dot.position.copy(pt);
        this.dimsGroup.add(dot);
      });

      const mid = new THREE.Vector3().addVectors(va, vb).multiplyScalar(0.5);
      const sp = this._makeTextSprite(text, '#eaf5ff', '#071b45', color);
      sp.position.copy(mid);
      sp.position.y += 0.06;
      sp.scale.set(0.52, 0.165, 1);
      this.dimsGroup.add(sp);
    };

    // 1. Chiều ngang tổng gian hàng (phía trước mặt đất)
    addDim([-W / 2, 0.02, D / 2 + 0.48], [W / 2, 0.02, D / 2 + 0.48], `Ngang GH: ${W.toFixed(2)} m`, '#00cfff');
    // 2. Chiều sâu tổng gian hàng (bên hông trái mặt đất)
    addDim([-W / 2 - 0.68, 0.02, -D / 2], [-W / 2 - 0.68, 0.02, D / 2], `Sâu GH: ${D.toFixed(2)} m`, '#00cfff');
    // 3. Chiều cao tổng thể gian hàng (bên phải phía sau)
    addDim([W / 2 + 0.58, 0, -D / 2], [W / 2 + 0.58, H, -D / 2], `Cao GH: ${H.toFixed(2)} m`, '#ffd85a');
    // 4. Chiều cao mặt quầy (bên trái phía trước)
    addDim([-W / 2 - 0.45, 0, dims.zF], [-W / 2 - 0.45, Hc, dims.zF], `Quầy: ${Hc.toFixed(2)} m`, '#ffd85a');
    // 5. Tĩnh không dưới bảng hiệu gian hàng (bên phải phía trước)
    addDim([W / 2 + 0.45, 0, dims.zFrontFace], [W / 2 + 0.45, metrics.clearUnderSign, dims.zFrontFace], `Tĩnh không: ${metrics.clearUnderSign.toFixed(2)} m`, '#62ff9b');
    // 6. Kích thước riêng của Cổng trại (Rộng phủ bì cổng, Lọt lòng cổng & Cao cổng)
    if (dims.gateTotalW && dims.gateH) {
      const zG = dims.zGate || (D / 2 + 0.34);
      const zDimGate = Math.max(D / 2 + 0.92, zG + 0.65);
      addDim([-dims.gateTotalW / 2, 0.03, zDimGate], [dims.gateTotalW / 2, 0.03, zDimGate], `Cổng: ${dims.gateTotalW.toFixed(2)}m (Lọt ${dims.gateSpan.toFixed(2)}m)`, '#ff9500');
      addDim([dims.gateTotalW / 2 + 0.52, 0, zG], [dims.gateTotalW / 2 + 0.52, dims.gateH, zG], `Cao Cổng: ${dims.gateH.toFixed(2)} m`, '#ff9500');
    }
  }

  // Bãi tập kết vật tư bên hông gian hàng (dùng cho GĐ1)
  _buildStagingPile(layout, poleMat) {
    const xBase = -layout.dims.W / 2 - 0.95;
    for (let i = 0; i < 8; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.04, 2.4, 10), poleMat);
      log.rotation.x = Math.PI / 2;
      log.position.set(xBase - (i % 4) * 0.09, 0.04 + Math.floor(i / 4) * 0.08, 0);
      this.stagingGroup.add(log);
    }
  }

  _makeTextSprite(text, fg = '#ffffff', bg = '#071b45', border = '#00cfff') {
    const c = document.createElement('canvas');
    c.width = 384;
    c.height = 112;
    const ctx = c.getContext('2d');
    ctx.fillStyle = bg;
    ctx.strokeStyle = border;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(6, 6, c.width - 12, c.height - 12, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = fg;
    ctx.font = 'bold 32px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, c.width / 2, c.height / 2, c.width - 36);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
    return new THREE.Sprite(mat);
  }

  // -------------------------------------------------------------------
  //  ĐIỀU KHIỂN HIỂN THỊ, ÁNH SÁNG LED, WIREFRAME & CHỌN CẤU KIỆN
  // -------------------------------------------------------------------
  setGroupVisibility(groupKey, visible) {
    this.groupVisibility[groupKey] = visible;
    for (const [, obj] of this.partMeshes) {
      const part = obj.userData.part;
      if (part && part.group === groupKey) {
        obj.visible = visible;
      }
    }
  }

  setSignageVisibility(visible) {
    ['logo_ptit', 'logo_str4', 'logo_d26', 'logo_doan', 'cloudSign'].forEach((g) => {
      this.setGroupVisibility(g, visible);
    });
  }

  setWireframe(enabled) {
    this.wireframe = enabled;
    this.partsGroup.traverse((ch) => {
      if (ch.isMesh && ch.material) {
        const mats = Array.isArray(ch.material) ? ch.material : [ch.material];
        mats.forEach((m) => { m.wireframe = enabled; });
      }
    });
  }

  applyLightingState() {
    const ledOn = this.ledEnabled;
    const mult = this.isNight ? 1.85 : 0.95;
    this.mats.ledCyan.emissiveIntensity = ledOn ? 1.3 * mult : 0.05;
    this.mats.ledWarm.emissiveIntensity = ledOn ? 1.5 * mult : 0.05;
    this.mats.starCellophane.emissiveIntensity = ledOn ? 0.7 * mult : 0.08;
    this.mats.binaryMat.emissiveIntensity = ledOn ? 0.55 * mult : 0.05;
    this.mats.circuitMat.emissiveIntensity = ledOn ? 0.55 * mult : 0.05;
  }

  selectPart(partId) {
    // Khôi phục highlight cũ
    if (this.selectedPartId && this.partMeshes.has(this.selectedPartId)) {
      const prevObj = this.partMeshes.get(this.selectedPartId);
      prevObj.traverse((ch) => {
        if (ch.isMesh && ch.userData.origMaterial) {
          ch.material = ch.userData.origMaterial;
          delete ch.userData.origMaterial;
        }
      });
    }

    this.selectedPartId = partId;
    if (!partId || !this.partMeshes.has(partId)) return null;

    const obj = this.partMeshes.get(partId);
    obj.traverse((ch) => {
      if (ch.isMesh && ! Array.isArray(ch.material)) {
        ch.userData.origMaterial = ch.material;
        const cloned = ch.material.clone();
        if (cloned.emissive) {
          cloned.emissive.setHex(0x00a8dd);
          cloned.emissiveIntensity = 0.55;
        }
        ch.material = cloned;
      }
    });

    const part = obj.userData.part;
    return this.getPartInspectionInfo(part);
  }

  getPartInspectionInfo(part) {
    if (!part || !this.layout) return null;
    const tInfo = TYPES[part.type] || {};
    const sameTypeCount = this.layout.parts.filter((p) => p.type === part.type).length;
    const matDesc = tInfo.mat ? (tInfo.mat[this.layout.kind] || tInfo.mat.bamboo) : this.layout.sec.label;
    return {
      id: part.id,
      name: part.name || tInfo.name || part.type,
      typeName: tInfo.name || part.type,
      material: matDesc,
      dimensions: describeDims(part),
      quantity: `${sameTypeCount} cấu kiện cùng loại trong gian hàng`,
      role: tInfo.role || 'Cấu kiện thành phần của gian hàng.',
      install: tInfo.install || 'Lắp đặt theo bản vẽ kỹ thuật.',
      stage: part.stage,
    };
  }
}
