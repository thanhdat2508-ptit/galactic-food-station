// =====================================================================
//  main.js — ĐIỀU PHỐI ỨNG DỤNG 3D GALACTIC FOOD STATION
//  Kết nối WebGL Three.js, OrbitControls, Mô hình tham số (layout.js + booth.js),
//  Mô phỏng thi công 9 giai đoạn (construction.js), Dự toán BOM (materials.js),
//  Bản vẽ kỹ thuật 2D (Blueprint Canvas) và Xuất dữ liệu (GLB, CSV, PNG).
// =====================================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

import { DEFAULT_PARAMS, STAGE_NAMES, computeLayout } from './layout.js';
import { BoothSceneManager } from './booth.js';
import { ConstructionController } from './construction.js';
import { DEFAULT_PRICES, computeBOM, formatVND, exportBOMToCSV } from './materials.js';

// ---------------------------------------------------------------------
//  1. KHỞI TẠO THREE.JS SCENE, CAMERA, RENDERER & ORBITCONTROLS
// ---------------------------------------------------------------------
const canvas = document.getElementById('threeCanvas');
const viewport = document.getElementById('viewportContainer');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true, // Cho phép chụp ảnh PNG trực tiếp từ WebGL canvas
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x061433);
scene.fog = new THREE.FogExp2(0x061433, 0.032);

const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.05, 80);
camera.position.set(4.35, 2.65, 5.85);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.target.set(0, 1.85, 0.25);
controls.minDistance = 0.7;
controls.maxDistance = 18;
controls.maxPolarAngle = Math.PI * 0.495;

// ---------------------------------------------------------------------
//  2. HỆ THỐNG ÁNH SÁNG NGÀY / ĐÊM, MẶT SÂN, LƯỚI & BẦU TRỜI SAO
// ---------------------------------------------------------------------
const hemiLight = new THREE.HemisphereLight(0xdbeeff, 0x3b2d1f, 0.85);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfff5e4, 1.75);
sunLight.position.set(4.8, 7.5, 5.2);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 22;
const dCam = 4.2;
sunLight.shadow.camera.left = -dCam;
sunLight.shadow.camera.right = dCam;
sunLight.shadow.camera.top = dCam;
sunLight.shadow.camera.bottom = -dCam;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

const fillLight = new THREE.DirectionalLight(0x7fd4ff, 0.5);
fillLight.position.set(-4.5, 3.2, -3.5);
scene.add(fillLight);

// Đèn điểm giả lập ánh sáng hắt từ LED bảng hiệu và đèn ngôi sao
const cyanBoothLight = new THREE.PointLight(0x00cfff, 1.2, 5.5, 1.6);
cyanBoothLight.position.set(0, 1.85, 1.25);
scene.add(cyanBoothLight);

const warmBoothLight = new THREE.PointLight(0xffc95c, 1.1, 5.0, 1.5);
warmBoothLight.position.set(0, 1.75, 0.35);
scene.add(warmBoothLight);

// Mặt sân bê tông hội trại nhận bóng đổ
const groundGeo = new THREE.CircleGeometry(14, 64);
groundGeo.rotateX(-Math.PI / 2);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x0b1d42,
  roughness: 0.88,
  metalness: 0.06,
});
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
groundMesh.receiveShadow = true;
groundMesh.position.y = -0.002;
scene.add(groundMesh);

// Lưới mặt đất (1 ô nhỏ = 0.25m, chia chuẩn kích thước thi công)
const gridHelper = new THREE.GridHelper(12, 24, 0x00cfff, 0x183b78);
gridHelper.position.y = 0.001;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.42;
scene.add(gridHelper);

// Bầu trời sao 3D
const starGeo = new THREE.BufferGeometry();
const starCount = 650;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const r = 14 + Math.random() * 18;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI * 0.46;
  starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  starPos[i * 3 + 1] = Math.max(0.8, r * Math.cos(phi));
  starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({ color: 0xeaf5ff, size: 0.08, transparent: true, opacity: 0.75 });
const starField = new THREE.Points(starGeo, starMat);
scene.add(starField);

// ---------------------------------------------------------------------
//  3. KHỞI TẠO BOOTH SCENE MANAGER, THAM SỐ & DỰ TOÁN
// ---------------------------------------------------------------------
const params = { ...DEFAULT_PARAMS };
let customPrices = {};
let budgetLimit = 5500000;
let currentLayout = computeLayout(params);
let currentBOM = computeBOM(currentLayout, customPrices, budgetLimit);

const booth = new BoothSceneManager(scene, renderer);
const construction = new ConstructionController(booth, onConstructionStateUpdate);

let activeMode = 'model'; // model | construction | materials | blueprint | export
let showBackground = true;

// Chuyển động mượt cho Camera
let camAnim = null;
function animateCameraTo(pos, target, duration = 0.55) {
  camAnim = {
    startPos: camera.position.clone(),
    startTarget: controls.target.clone(),
    endPos: new THREE.Vector3(...pos),
    endTarget: new THREE.Vector3(...target),
    elapsed: 0,
    duration,
  };
}

const CAMERA_PRESETS = {
  front: { pos: [0, 2.0, 6.6], target: [0, 1.9, 0.2] },
  back:  { pos: [0, 1.85, -5.8], target: [0, 1.55, 0] },
  left:  { pos: [-6.0, 1.85, 0.3], target: [0, 1.65, 0.3] },
  right: { pos: [6.0, 1.85, 0.3], target: [0, 1.65, 0.3] },
  top:   { pos: [0, 7.8, 0.01], target: [0, 0, 0.2] },
  iso:   { pos: [4.35, 2.65, 5.85], target: [0, 1.85, 0.25] },
  under: { pos: [0.55, 1.38, -0.35], target: [0, 1.75, 0.9] },
  reset: { pos: [4.35, 2.65, 5.85], target: [0, 1.85, 0.25] },
};

// ---------------------------------------------------------------------
//  4. XÂY DỰNG & CẬP NHẬT TOÀN BỘ MÔ HÌNH + GIAO DIỆN
// ---------------------------------------------------------------------
function rebuildAll() {
  currentLayout = computeLayout(params);
  booth.build(currentLayout);
  construction.applyTransforms();
  recalcBOMAndUI();
  updateHUDAndSpecs();
  if (activeMode === 'blueprint') {
    drawBlueprintCanvas(currentLayout, currentBOM);
  }
  renderManualSummary(currentLayout, currentBOM);
}

function recalcBOMAndUI() {
  currentBOM = computeBOM(currentLayout, customPrices, budgetLimit);
  document.getElementById('topCostValue').textContent = formatVND(currentBOM.grandTotal);
  renderBOMPanel(currentBOM);
}

function updateHUDAndSpecs() {
  const { dims, metrics, parts } = currentLayout;
  document.getElementById('hudDimText').textContent = `GH: ${dims.W.toFixed(1)}×${dims.D.toFixed(1)}×${dims.H.toFixed(2)}m | Cổng: ${dims.gateTotalW.toFixed(2)}×${dims.gateH.toFixed(2)}m`;
  document.getElementById('hudPartCount').textContent = `${parts.length} đối tượng`;
  document.getElementById('hudAisleText').textContent = `${metrics.aisle.toFixed(2)} m`;

  const specBox = document.getElementById('liveTechSpecs');
  specBox.innerHTML = `
    <div class="spec-mini-item"><span>Rộng phủ bì Cổng trại</span><strong>${dims.gateTotalW.toFixed(2)} m (Lọt lòng ${dims.gateSpan.toFixed(2)}m)</strong></div>
    <div class="spec-mini-item"><span>Chiều cao Cổng trại</span><strong>${dims.gateH.toFixed(2)} m (Trụ ${dims.yGatePostTop.toFixed(2)}m)</strong></div>
    <div class="spec-mini-item"><span>Số cột chính Gian hàng</span><strong>${metrics.nPosts} cột (Ø${Math.round(dims.dp * 100)}cm)</strong></div>
    <div class="spec-mini-item"><span>Nan mái song song</span><strong>${metrics.nSlat} thanh (bước ${(metrics.slatStep * 100).toFixed(1)}cm)</strong></div>
    <div class="spec-mini-item"><span>Nan tre ốp quầy</span><strong>${metrics.nCS} trước + ${metrics.nSS} hông</strong></div>
    <div class="spec-mini-item"><span>Chiều dài quầy</span><strong>${metrics.Lc.toFixed(2)} m</strong></div>
    <div class="spec-mini-item"><span>Tĩnh không bảng hiệu</span><strong>${metrics.clearUnderSign.toFixed(2)} m</strong></div>
    <div class="spec-mini-item"><span>Khoảng cách bếp → bạt</span><strong>${metrics.heatToBackdrop.toFixed(2)} m (An toàn)</strong></div>
  `;
}

// ---------------------------------------------------------------------
//  5. CẬP NHẬT GIAO DIỆN CHẾ ĐỘ THI CÔNG (CONSTRUCTION MODE)
// ---------------------------------------------------------------------
function onConstructionStateUpdate(state) {
  const { currentStage, stageProgress, isPlaying, stageInfo } = state;

  // Nút Play / Pause
  const btnPlay = document.getElementById('btnPlayPause');
  btnPlay.textContent = isPlaying ? '⏸ Pause' : '▶ Play';

  // Các nút GĐ0..GĐ8
  document.querySelectorAll('.stage-pill').forEach((btn) => {
    const s = Number(btn.dataset.stage);
    btn.classList.toggle('active', s === currentStage);
    btn.classList.toggle('done', s < currentStage);
  });

  // Thanh kéo scrub
  document.getElementById('slStageScrub').value = stageProgress.toFixed(2);
  document.getElementById('scrubStageLabel').textContent = STAGE_NAMES[currentStage] || '';
  document.getElementById('scrubPctLabel').textContent = `${Math.round(stageProgress * 100)}%`;

  // Thẻ hướng dẫn giai đoạn
  if (stageInfo) {
    document.getElementById('stageBadgeCode').textContent = stageInfo.code;
    document.getElementById('stageGuideTitle').textContent = stageInfo.title;
    document.getElementById('stageGuideSummary').textContent = stageInfo.summary;
    document.getElementById('stageStepList').innerHTML = stageInfo.steps.map((st) => `<li>${st}</li>`).join('');
    document.getElementById('stageMatList').innerHTML = stageInfo.materials.map((m) => `<li>${m}</li>`).join('');
    document.getElementById('stageSafetyBox').innerHTML = `<strong>⚠️ Kiểm tra an toàn:</strong> ${stageInfo.safety}`;
  }
}

// ---------------------------------------------------------------------
//  6. BẢNG DỰ TOÁN VẬT TƯ (MATERIALS / BOM PANEL)
// ---------------------------------------------------------------------
function renderBOMPanel(bom) {
  document.getElementById('bomSubFrame').textContent = formatVND(bom.subtotals.frame);
  document.getElementById('bomSubCounter').textContent = formatVND(bom.subtotals.counter);
  document.getElementById('bomSubDecor').textContent = formatVND(bom.subtotals.decor);
  document.getElementById('bomSubElectric').textContent = formatVND(bom.subtotals.electric);
  document.getElementById('bomContingency').textContent = formatVND(bom.contingency);
  document.getElementById('bomGrandTotal').textContent = formatVND(bom.grandTotal);

  const alertBox = document.getElementById('budgetAlertBox');
  if (bom.overBudget) {
    alertBox.className = 'budget-alert warn';
    alertBox.textContent = `⚠️ CẢNH BÁO VƯỢT NGÂN SÁCH: Tổng dự toán đang vượt trần ngân sách ${formatVND(bom.diffBudget)}. Gợi ý: Chuyển vật liệu về "Tre tự nhiên" hoặc giảm chiều ngang gian hàng.`;
  } else {
    alertBox.className = 'budget-alert ok';
    alertBox.textContent = `✅ TRONG NGÂN SÁCH SINH VIÊN: Tổng dự toán tiết kiệm hơn trần ngân sách ${formatVND(Math.abs(bom.diffBudget))} (đã bao gồm 8% dự phòng).`;
  }

  const tbody = document.getElementById('bomTableBody');
  tbody.innerHTML = bom.items
    .map(
      (it, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${it.stage}</td>
      <td><strong>${it.name}</strong>${it.note ? `<br/><small style="color:#99b5d6">${it.note}</small>` : ''}</td>
      <td>${it.spec}</td>
      <td class="num"><strong>${it.qty}</strong></td>
      <td>${it.unit}</td>
      <td class="num">
        ${
          it.priceKey
            ? `<input type="number" class="price-input" data-price-key="${it.priceKey}" value="${it.unitPrice}" step="1000" min="0" />`
            : `<span>0</span>`
        }
      </td>
      <td class="num"><strong>${formatVND(it.total)}</strong></td>
    </tr>
  `,
    )
    .join('');

  tbody.querySelectorAll('.price-input').forEach((inp) => {
    inp.addEventListener('change', (e) => {
      const k = e.target.dataset.priceKey;
      customPrices[k] = Math.max(0, Number(e.target.value) || 0);
      recalcBOMAndUI();
    });
  });

  // Sơ đồ cắt cây nguyên 1D
  const cutContainer = document.getElementById('cutPlanContainer');
  const groups = [
    { label: `Nhóm A – Cột chính (${bom.cutSummary.A.count} cây ${bom.stockLen}m)`, pack: bom.cutSummary.A },
    { label: `Nhóm B – Xà khung & đòn tay (${bom.cutSummary.B_frame.count + bom.cutSummary.B_roof.count} cây ${bom.stockLen}m)`, pack: { ...bom.cutSummary.B_frame, bars: [...bom.cutSummary.B_frame.bars, ...bom.cutSummary.B_roof.bars] } },
    { label: `Nhóm C – Nan mái & giằng (${bom.cutSummary.C_roof.count + bom.cutSummary.C_frame.count} cây ${bom.stockLen}m)`, pack: { ...bom.cutSummary.C_roof, bars: [...bom.cutSummary.C_roof.bars.slice(0, 4), ...bom.cutSummary.C_frame.bars.slice(0, 2)] } },
    { label: `Nhóm D – Nan ốp quầy (${bom.cutSummary.D_counter.count} cây ${bom.stockLen}m)`, pack: bom.cutSummary.D_counter },
  ];

  cutContainer.innerHTML = groups
    .map(
      (g) => `
    <div class="cutplan-card">
      <h4>${g.label}</h4>
      ${g.pack.bars
        .slice(0, 5)
        .map(
          (bar, bi) => `
        <div class="cut-bar-row" title="Cây #${bi + 1}: cắt [${bar.cuts.join('m + ')}m], dư ${bar.rem}m">
          ${bar.cuts
            .map(
              (c) =>
                `<div class="cut-seg" style="width:${Math.max(8, (c / bar.stockLen) * 100)}%">${c.toFixed(2)}m</div>`,
            )
            .join('')}
        </div>
      `,
        )
        .join('')}
      ${g.pack.bars.length > 5 ? `<small style="color:#99b5d6">+ ${g.pack.bars.length - 5} cây tương tự...</small>` : ''}
    </div>
  `,
    )
    .join('');
}

// ---------------------------------------------------------------------
//  7. VẼ BẢN VẼ KỸ THUẬT 2D (BLUEPRINT CANVAS)
// ---------------------------------------------------------------------
function drawBlueprintCanvas(layout, bom) {
  const cv = document.getElementById('blueprintCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const CW = cv.width, CH = cv.height;
  const { dims, metrics, sec } = layout;

  // Nền xanh blueprint kỹ thuật
  ctx.fillStyle = '#04122c';
  ctx.fillRect(0, 0, CW, CH);

  // Lưới kỹ thuật
  ctx.strokeStyle = 'rgba(0, 207, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < CW; x += 25) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke();
  }
  for (let y = 0; y < CH; y += 25) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke();
  }

  // Khung bản vẽ tiêu chuẩn
  ctx.strokeStyle = '#00cfff';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, CW - 36, CH - 36);
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, CW - 48, CH - 48);

  // Tiêu đề đầu bản vẽ
  ctx.fillStyle = '#ffd85a';
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.fillText('BẢN VẼ KỸ THUẬT THI CÔNG — GALACTIC FOOD STATION (ẨM THỰC NGÂN HÀ)', 42, 56);
  ctx.fillStyle = '#eaf5ff';
  ctx.font = '14px "Segoe UI", sans-serif';
  ctx.fillText(
    `Gian hàng: ${dims.W.toFixed(2)}×${dims.D.toFixed(2)}×${dims.H.toFixed(2)}m | Cổng trại: Phủ bì ${dims.gateTotalW.toFixed(2)}m (Lọt lòng ${dims.gateSpan.toFixed(2)}m) × Cao ${dims.gateH.toFixed(2)}m | Vật liệu: ${sec.label}`,
    42,
    80,
  );

  // Helper vẽ đường kích thước 2D
  const drawDim2D = (x1, y1, x2, y2, label, color = '#00cfff') => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(x1, y1, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x2, y2, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, (x1 + x2) / 2, (y1 + y2) / 2 - 7);
    ctx.restore();
  };

  const scale = 150; // 1m = 150px

  // ===================================================================
  //  GÓC CHIẾU 1: MẶT ĐỨNG CHÍNH (FRONT ELEVATION)
  // ===================================================================
  const fx = 420, fy = 490; // tâm mặt đất mặt đứng
  ctx.fillStyle = '#00cfff';
  ctx.font = 'bold 16px "Segoe UI", sans-serif';
  ctx.fillText('1. MẶT ĐỨNG CHÍNH (FRONT ELEVATION) — TỶ LỆ PHỐI HỢP', 70, 120);

  // Mặt đất
  ctx.strokeStyle = '#62ff9b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(fx - 310, fy);
  ctx.lineTo(fx + 310, fy);
  ctx.stroke();

  const wPx = dims.W * scale;
  const hPx = dims.H * scale;
  const hcPx = dims.Hc * scale;
  const htPx = dims.Ht * scale;
  const hsPx = dims.Hs * scale;

  // 2 cột trước + chân đế xô bê tông
  ctx.fillStyle = '#3b4e6b';
  [-1, 1].forEach((s) => {
    const cx = fx + s * (dims.px * scale);
    ctx.fillRect(cx - 22, fy - 48, 44, 48); // xô bê tông
    ctx.fillStyle = '#c99b63';
    ctx.fillRect(cx - 7, fy - dims.Hp * scale, 14, dims.Hp * scale);
    ctx.fillStyle = '#3b4e6b';
  });

  // Xà đầu cột & xà bảng hiệu + đòn tay mái
  ctx.fillStyle = '#d8ad72';
  ctx.fillRect(fx - wPx / 2 - 25, fy - hPx + 8, wPx + 50, 11);
  ctx.fillRect(fx - wPx / 2 - 8, fy - htPx - 5, wPx + 16, 10);
  ctx.fillRect(fx - wPx / 2 - 8, fy - hsPx - 5, wPx + 16, 10);

  // Nan mái nhìn từ mặt trước
  for (let i = 0; i < metrics.nSlat; i++) {
    const sx = fx - (wPx + 40) / 2 + (i * (wPx + 40)) / (metrics.nSlat - 1);
    ctx.fillStyle = '#ffd85a';
    ctx.beginPath();
    ctx.arc(sx, fy - hPx + 4, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4 Bảng hiệu Logo trên mặt đứng
  const signMidY = fy - (htPx + hsPx) / 2;
  const signH = (htPx - hsPx);
  // PTIT tròn trái & Đoàn TN tròn phải
  [-1, 1].forEach((s) => {
    const cx = fx + s * (dims.px * scale);
    ctx.fillStyle = '#091f4e';
    ctx.strokeStyle = '#ffd85a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, signMidY, signH * 0.52, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s < 0 ? 'LOGO PTIT' : 'ĐOÀN TN', cx, signMidY + 4);
  });

  // Bảng D26 (trái-giữa) & ASTRA.SEC / STR4.SEC (phải-giữa, cỡ lớn)
  const innerSpan = (dims.px * 2 - metrics.discD - 0.06) * scale;
  const d26Wpx = innerSpan * 0.44;
  const strWpx = innerSpan * 0.53;
  const startBx = fx - innerSpan / 2;
  ctx.fillStyle = '#071b45';
  ctx.strokeStyle = '#c99b63';
  ctx.fillRect(startBx, signMidY - signH / 2, d26Wpx, signH);
  ctx.strokeRect(startBx, signMidY - signH / 2, d26Wpx, signH);
  ctx.fillStyle = '#00cfff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('ATTT D26', startBx + d26Wpx / 2, signMidY + 5);

  const strBx = startBx + d26Wpx + innerSpan * 0.03;
  ctx.fillStyle = '#061a44';
  ctx.strokeStyle = '#00cfff';
  ctx.fillRect(strBx, signMidY - signH * 0.54, strWpx, signH * 1.08);
  ctx.strokeRect(strBx, signMidY - signH * 0.54, strWpx, signH * 1.08);
  ctx.fillStyle = '#ffd85a';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('ASTRA.SEC (STR4.SEC)', strBx + strWpx / 2, signMidY + 5);
  ctx.textAlign = 'left';

  // Ngôi sao treo dưới xà bảng hiệu
  for (let i = 0; i < metrics.nStar; i++) {
    const sx = fx - wPx * 0.36 + (i * (wPx * 0.72)) / Math.max(1, metrics.nStar - 1);
    const sy = fy - hsPx + 38 + (i % 2) * 16;
    ctx.strokeStyle = 'rgba(234,245,255,0.5)';
    ctx.beginPath(); ctx.moveTo(sx, fy - hPx + 12); ctx.lineTo(sx, sy - 14); ctx.stroke();
    ctx.fillStyle = '#ffd85a';
    ctx.beginPath(); ctx.arc(sx, sy, 12, 0, Math.PI * 2); ctx.fill();
  }

  // Quầy phục vụ ốp nan tre + biển mây
  const qW = metrics.Lc * scale;
  const qX = fx - wPx / 2 + 16;
  ctx.fillStyle = 'rgba(201, 155, 99, 0.28)';
  ctx.strokeStyle = '#c99b63';
  ctx.fillRect(qX, fy - hcPx, qW, hcPx);
  ctx.strokeRect(qX, fy - hcPx, qW, hcPx);
  for (let x = qX + 6; x < qX + qW - 4; x += 8) {
    ctx.beginPath(); ctx.moveTo(x, fy - hcPx + 6); ctx.lineTo(x, fy - 4); ctx.stroke();
  }
  // Biển đám mây cỡ lớn đúng tỷ lệ bản vẽ
  ctx.fillStyle = '#4e79e3';
  ctx.strokeStyle = '#fff9eb';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(fx - wPx * 0.48, fy - hcPx * 1.15, wPx * 0.86, hcPx * 1.12, 32);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffd85a';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ẨM THỰC NGÂN HÀ', fx - wPx * 0.05, fy - hcPx * 0.56);
  ctx.textAlign = 'left';

  // Đường kích thước Mặt đứng
  drawDim2D(fx - wPx / 2, fy + 34, fx + wPx / 2, fy + 34, `Ngang W = ${dims.W.toFixed(2)} m`, '#00cfff');
  drawDim2D(fx - wPx / 2 - 48, fy, fx - wPx / 2 - 48, fy - hPx, `Cao H = ${dims.H.toFixed(2)} m`, '#ffd85a');
  drawDim2D(fx + wPx / 2 + 45, fy, fx + wPx / 2 + 45, fy - hcPx, `Quầy ${dims.Hc.toFixed(2)}m`, '#62ff9b');

  // ===================================================================
  //  GÓC CHIẾU 2: MẶT BẰNG ĐỊNH VỊ & PHÂN KHU (PLAN VIEW)
  // ===================================================================
  const px0 = 1150, py0 = 310;
  ctx.fillStyle = '#00cfff';
  ctx.font = 'bold 16px "Segoe UI", sans-serif';
  ctx.fillText('2. MẶT BẰNG BỐ TRÍ & LỐI LƯU THÔNG (PLAN VIEW)', 890, 120);

  const dPx = dims.D * scale;
  // Khung bao gian hàng
  ctx.strokeStyle = '#00cfff';
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(px0 - wPx / 2, py0 - dPx / 2, wPx, dPx);
  ctx.setLineDash([]);

  // Quầy phục vụ phía trước (+Z ở phía dưới mặt bằng)
  const cDepthPx = dims.Dc * scale;
  ctx.fillStyle = 'rgba(201, 155, 99, 0.35)';
  ctx.strokeStyle = '#c99b63';
  ctx.fillRect(px0 - wPx / 2 + 14, py0 + dPx / 2 - cDepthPx, qW, cDepthPx);
  ctx.strokeRect(px0 - wPx / 2 + 14, py0 + dPx / 2 - cDepthPx, qW, cDepthPx);
  ctx.fillStyle = '#eaf5ff';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(`QUẦY PHỤC VỤ (${metrics.Lc.toFixed(2)} × ${dims.Dc.toFixed(2)}m)`, px0 - wPx / 2 + 28, py0 + dPx / 2 - cDepthPx / 2 + 4);

  // Bàn sơ chế phía sau + vùng an toàn nhiệt bếp từ
  const tbW = Math.min(1.2, dims.W - 0.9) * scale;
  const tbD = 0.6 * scale;
  ctx.fillStyle = 'rgba(0, 207, 255, 0.16)';
  ctx.strokeStyle = '#00cfff';
  ctx.fillRect(px0 - tbW / 2, py0 - dPx / 2 + 28, tbW, tbD);
  ctx.strokeRect(px0 - tbW / 2, py0 - dPx / 2 + 28, tbW, tbD);
  ctx.fillStyle = '#eaf5ff';
  ctx.fillText('BÀN SƠ CHẾ (MƯỢN)', px0 - tbW / 2 + 14, py0 - dPx / 2 + 64);

  // Vòng bán kính an toàn nhiệt 0.5m quanh bếp từ
  ctx.strokeStyle = '#ff9500';
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.arc(px0 + 25, py0 - dPx / 2 + 58, 0.5 * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Chân cột C1..C5
  layout.zones.posts.forEach((P) => {
    const cx = px0 + P.x * scale;
    const cz = py0 + P.z * scale;
    ctx.fillStyle = '#ffd85a';
    ctx.beginPath();
    ctx.arc(cx, cz, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#04102b';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(P.key, cx, cz + 3);
  });
  ctx.textAlign = 'left';

  drawDim2D(px0 - wPx / 2, py0 + dPx / 2 + 36, px0 + wPx / 2, py0 + dPx / 2 + 36, `Ngang ${dims.W.toFixed(2)} m`, '#00cfff');
  drawDim2D(px0 + wPx / 2 + 42, py0 - dPx / 2, px0 + wPx / 2 + 42, py0 + dPx / 2, `Sâu ${dims.D.toFixed(2)} m`, '#ffd85a');

  // ===================================================================
  //  GÓC CHIẾU 3: MẶT CẮT BÊN & CHI TIẾT LIÊN KẾT (PHÍA DƯỚI)
  // ===================================================================
  ctx.fillStyle = '#00cfff';
  ctx.font = 'bold 16px "Segoe UI", sans-serif';
  ctx.fillText('3. THÔNG SỐ CẤU KIỆN & QUY TẮC AN TOÀN KẾT CẤU – ĐIỆN – NHIỆT', 70, 585);

  const boxes = [
    {
      title: 'A. LIÊN KẾT CHÂN ĐẾ XÔ BÊ TÔNG (KHÔNG KHOAN SÂN)',
      lines: [
        `• Số lượng: ${metrics.nPosts} chân đế xô nhựa 20L đổ bê tông mác 150 (~45–50 kg/chân).`,
        `• Ống lồng PVC Ø114 chôn ngập 28cm giữa xô; chân cột cắm sâu 26cm, chèn 4 nêm gỗ.`,
        `• Khóa ngang bằng 01 bu lông M8×150 xuyên qua ống lồng và gốc cột.`,
        `• Gia tải thêm 02 bao cát (15 kg/bao) có dán băng phản quang vàng tại mỗi chân cột.`,
      ],
    },
    {
      title: 'B. LIÊN KẾT NÚT KHUNG TRE (BU LÔNG M8 + DÂY MÂY)',
      lines: [
        `• Tổng số nút liên kết chính: ${metrics.nJoints} mối nối (khoan mồi Ø9mm cách mắt đốt tre 3–5cm).`,
        `• Xuyên bu lông M8×150 có 2 long đền phẳng hai đầu, siết vừa tay chống dập ống tre.`,
        `• Quấn 6–8 vòng dây mây nhựa / dây đay theo nút buộc chéo chữ X (Square Lashing).`,
        `• Hệ giằng chéo chữ X ở vách trái + vách sau và chống góc 45° triệt tiêu dao động ngang.`,
      ],
    },
    {
      title: 'C. AN TOÀN ĐIỆN 12V, CHỐNG LẬT BẢNG HIỆU & PHÒNG CHÁY',
      lines: [
        `• Toàn bộ LED dây (${metrics.ledLength}m) & đèn sao dùng điện áp thấp 12V qua Adapter 12V–5A.`,
        `• Tuyến dây nguồn đi cao dọc cột sau phải C3 (1,3m), bọc ống ruột gà đoạn qua sàn.`,
        `• Bếp điện từ cách phông bạt ngân hà ${metrics.heatToBackdrop.toFixed(2)}m (đạt chuẩn ≥ 0,50m).`,
        `• Tổng dự toán vật tư: ${formatVND(bom.grandTotal)} (đã gồm 8% dự phòng).`,
      ],
    },
  ];

  boxes.forEach((b, idx) => {
    const bx = 65 + idx * 495;
    const by = 610;
    ctx.fillStyle = 'rgba(7, 27, 69, 0.85)';
    ctx.strokeStyle = 'rgba(0, 207, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.fillRect(bx, by, 475, 210);
    ctx.strokeRect(bx, by, 475, 210);

    ctx.fillStyle = '#ffd85a';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillText(b.title, bx + 16, by + 30);

    ctx.fillStyle = '#eaf5ff';
    ctx.font = '13px "Segoe UI", sans-serif';
    b.lines.forEach((ln, li) => {
      ctx.fillText(ln, bx + 16, by + 64 + li * 34);
    });
  });

  // Khung tên góc phải dưới (Title Block)
  ctx.fillStyle = '#071b45';
  ctx.strokeStyle = '#ffd85a';
  ctx.lineWidth = 2;
  ctx.fillRect(CW - 520, CH - 125, 480, 90);
  ctx.strokeRect(CW - 520, CH - 125, 480, 90);
  ctx.fillStyle = '#ffd85a';
  ctx.font = 'bold 15px "Segoe UI", sans-serif';
  ctx.fillText('CHỦ ĐỀ: GALACTIC FOOD STATION — ẨM THỰC NGÂN HÀ', CW - 504, CH - 96);
  ctx.fillStyle = '#eaf5ff';
  ctx.font = '13px "Segoe UI", sans-serif';
  ctx.fillText('Đơn vị: Học viện Công nghệ Bưu chính Viễn thông (PTIT) • Khoa ATTT D26 • STR4.SEC', CW - 504, CH - 70);
  ctx.fillStyle = '#00cfff';
  ctx.fillText(`Dự toán: ${formatVND(bom.grandTotal)}  |  Tổng cấu kiện 3D: ${layout.parts.length}  |  Tài liệu: HUONG_DAN_THI_CONG_GIAN_HANG.md`, CW - 504, CH - 46);
}

function renderManualSummary(layout, bom) {
  const box = document.getElementById('manualSummaryContainer');
  if (!box) return;
  const { dims, metrics } = layout;
  box.innerHTML = `
    <div class="manual-box">
      <h4>1. Tổ chức Nhân sự & Thời gian (6–8 sinh viên)</h4>
      <p>• <strong>Trước hội trại 3–5 ngày:</strong> Đổ ${metrics.nPosts} chân đế xô bê tông 20L, cắt sẵn tre theo sơ đồ ghép thanh, đan ${metrics.nStar} ngôi sao và dán decal bảng hiệu tại nhà.</p>
      <p>• <strong>Tại sân hội trại (150–180 phút):</strong> Tổ Khung (4 người) dựng cột – xà – mái trong 75 phút; Tổ Quầy & Trang trí (3 người) lắp quầy + bảng hiệu + LED trong 75 phút.</p>
    </div>
    <div class="manual-box">
      <h4>2. Giải pháp Kết cấu Chống Lật & Chịu Gió</h4>
      <p>• Không khoan phá nền sân trường: dùng ${metrics.nPosts} xô bê tông 20L có ống lồng PVC Ø114 kết hợp ${metrics.nPosts * 2} bao cát gia tải (tổng đối trọng ~380–450 kg).</p>
      <p>• Hệ giằng chéo chữ X ở vách trái & vách sau cùng các thanh chống góc 45° tạo khung tam giác cứng vững.</p>
    </div>
    <div class="manual-box">
      <h4>3. An toàn Điện 12V & Phòng Cháy Khu Bếp</h4>
      <p>• Chuyển đổi điện 220V sang 12V DC tại hộp Adapter treo cao 1,30m trên cột sau phải C3.</p>
      <p>• Bếp từ đặt ở bàn sau cách phông bạt ${metrics.heatToBackdrop.toFixed(2)}m, tuyệt đối không đi dây LED hay treo sao nhựa phía trên bếp.</p>
    </div>
    <div class="manual-box">
      <h4>4. Tối ưu Ngân sách Sinh viên (${formatVND(bom.grandTotal)})</h4>
      <p>• Kích thước hiện tại: ${dims.W}×${dims.D}×${dims.H}m. Ghép thanh thông minh trên cây ${bom.stockLen}m giúp giảm hao hụt tre dưới 12%.</p>
      <p>• Tận dụng mượn bàn gấp sơ chế, tủ ngăn kéo, thùng đá và dây nguồn từ CLB / Đoàn Khoa (0 ₫).</p>
    </div>
  `;
}

// ---------------------------------------------------------------------
//  8. SỰ KIỆN TƯƠNG TÁC GIAO DIỆN & RAYCAST CLICK CẤU KIỆN 3D
// ---------------------------------------------------------------------
// Chuyển chế độ trên Topbar
function switchMode(mode) {
  activeMode = mode;
  document.querySelectorAll('.nav-tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  document.getElementById('panelMaterials').classList.toggle('hidden', mode !== 'materials');
  document.getElementById('panelBlueprint').classList.toggle('hidden', mode !== 'blueprint');
  document.getElementById('panelExport').classList.toggle('hidden', mode !== 'export');
  document.getElementById('stageGuideCard').classList.toggle('hidden', mode !== 'construction');

  if (mode === 'construction') {
    if (construction.currentStage === 8 && construction.stageProgress >= 0.99) {
      construction.setStage(0, 1.0, false);
    } else {
      construction.applyTransforms();
      onConstructionStateUpdate(construction.getState());
    }
  } else if (mode === 'blueprint') {
    drawBlueprintCanvas(currentLayout, currentBOM);
  }
}

document.querySelectorAll('.nav-tab').forEach((btn) => {
  btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});

document.querySelectorAll('[data-close-modal]').forEach((btn) => {
  btn.addEventListener('click', () => switchMode('model'));
});

document.getElementById('topCostPill').addEventListener('click', () => switchMode('materials'));

// Nút chuyển nhanh góc nhìn Camera
document.querySelectorAll('.cam-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cam-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const preset = CAMERA_PRESETS[btn.dataset.cam] || CAMERA_PRESETS.iso;
    animateCameraTo(preset.pos, preset.target);
  });
});

// Các nút bật/tắt nhanh trên thanh công cụ
let gateVisible = true;
document.getElementById('btnToggleGate').addEventListener('click', (e) => {
  gateVisible = !gateVisible;
  e.currentTarget.classList.toggle('active', gateVisible);
  booth.setGroupVisibility('campGate', gateVisible);
  const chk = document.querySelector('[data-group-toggle="campGate"]');
  if (chk) chk.checked = gateVisible;
  construction.applyTransforms();
});

let roofHidden = false;
document.getElementById('btnHideRoof').addEventListener('click', (e) => {
  roofHidden = !roofHidden;
  e.currentTarget.classList.toggle('active', roofHidden);
  booth.setGroupVisibility('roof', !roofHidden);
  const chk = document.querySelector('[data-group-toggle="roof"]');
  if (chk) chk.checked = !roofHidden;
  construction.applyTransforms();
});

let signsHidden = false;
document.getElementById('btnHideSigns').addEventListener('click', (e) => {
  signsHidden = !signsHidden;
  e.currentTarget.classList.toggle('active', signsHidden);
  booth.setSignageVisibility(!signsHidden);
  ['logo_ptit', 'logo_str4', 'logo_d26', 'logo_doan', 'cloudSign'].forEach((g) => {
    const chk = document.querySelector(`[data-group-toggle="${g}"]`);
    if (chk) chk.checked = !signsHidden;
  });
  construction.applyTransforms();
});

document.getElementById('btnToggleDims').addEventListener('click', (e) => {
  booth.dimsGroup.visible = !booth.dimsGroup.visible;
  e.currentTarget.classList.toggle('active', booth.dimsGroup.visible);
});

document.getElementById('btnToggleGrid').addEventListener('click', (e) => {
  gridHelper.visible = !gridHelper.visible;
  e.currentTarget.classList.toggle('active', gridHelper.visible);
});

document.getElementById('btnToggleWireframe').addEventListener('click', (e) => {
  booth.setWireframe(!booth.wireframe);
  e.currentTarget.classList.toggle('active', booth.wireframe);
});

document.getElementById('btnToggleBg').addEventListener('click', (e) => {
  showBackground = !showBackground;
  e.currentTarget.classList.toggle('active', showBackground);
  starField.visible = showBackground;
  groundMesh.visible = showBackground;
  scene.background = new THREE.Color(showBackground ? (booth.isNight ? 0x020716 : 0x091d46) : 0x111622);
});

function setDayNightMode(isNight) {
  booth.isNight = isNight;
  const btnTop = document.getElementById('btnToggleDayNight');
  btnTop.textContent = isNight ? '🌙 Ban đêm' : '☀️ Ban ngày';
  btnTop.classList.toggle('active', isNight);

  document.querySelectorAll('.mode-btn[data-time]').forEach((b) => {
    b.classList.toggle('active', (b.dataset.time === 'night') === isNight);
  });

  if (isNight) {
    scene.background = new THREE.Color(0x020716);
    scene.fog.color.setHex(0x020716);
    hemiLight.intensity = 0.28;
    sunLight.intensity = 0.32;
    cyanBoothLight.intensity = booth.ledEnabled ? 2.6 : 0.1;
    warmBoothLight.intensity = booth.ledEnabled ? 2.4 : 0.1;
    starMat.opacity = 0.95;
  } else {
    scene.background = new THREE.Color(0x091d46);
    scene.fog.color.setHex(0x091d46);
    hemiLight.intensity = 0.9;
    sunLight.intensity = 1.8;
    cyanBoothLight.intensity = booth.ledEnabled ? 1.0 : 0;
    warmBoothLight.intensity = booth.ledEnabled ? 0.9 : 0;
    starMat.opacity = 0.45;
  }
  booth.applyLightingState();
}

document.getElementById('btnToggleDayNight').addEventListener('click', () => {
  setDayNightMode(!booth.isNight);
});

document.querySelectorAll('.mode-btn[data-time]').forEach((btn) => {
  btn.addEventListener('click', () => setDayNightMode(btn.dataset.time === 'night'));
});

document.getElementById('chkLedPower').addEventListener('change', (e) => {
  booth.ledEnabled = e.target.checked;
  setDayNightMode(booth.isNight);
});

// Ẩn/hiện bảng điều khiển bên phải
document.getElementById('btnToggleRightPanel').addEventListener('click', (e) => {
  const rp = document.getElementById('rightPanel');
  const hidden = rp.classList.toggle('hidden');
  e.currentTarget.classList.toggle('active', !hidden);
  onWindowResize();
});

// Chuyển tab trong bảng điều khiển bên phải
document.querySelectorAll('.rtab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.rtab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.rtab-content').forEach((c) => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.rtab).classList.add('active');
  });
});

// 1. Sliders thay đổi kích thước GIAN HÀNG riêng theo thời gian thực
const dimSliders = [
  ['slWidth', 'outWidth', 'width'],
  ['slDepth', 'outDepth', 'depth'],
  ['slHeight', 'outHeight', 'height'],
  ['slCounterH', 'outCounterH', 'counterHeight'],
  ['slCounterD', 'outCounterD', 'counterDepth'],
];
dimSliders.forEach(([slId, outId, key]) => {
  const sl = document.getElementById(slId);
  const out = document.getElementById(outId);
  if (!sl || !out) return;
  sl.addEventListener('input', () => {
    params[key] = Number(sl.value);
    out.textContent = `${params[key].toFixed(2)} m`;
    rebuildAll();
  });
});

document.getElementById('btnResetDims').addEventListener('click', () => {
  dimSliders.forEach(([slId, outId, key]) => {
    params[key] = DEFAULT_PARAMS[key];
    document.getElementById(slId).value = params[key];
    document.getElementById(outId).textContent = `${params[key].toFixed(2)} m`;
  });
  rebuildAll();
});

// 2. Sliders thay đổi kích thước CỔNG TRẠI riêng theo thời gian thực
const gateSliders = [
  ['slGateSpan', 'outGateSpan', 'gateSpan', 'm'],
  ['slGateHeight', 'outGateHeight', 'gateHeight', 'm'],
  ['slGateLadderW', 'outGateLadderW', 'gateLadderWidth', 'm'],
  ['slGateOffsetZ', 'outGateOffsetZ', 'gateOffsetZ', 'm'],
  ['slGateHeaderScale', 'outGateHeaderScale', 'gateHeaderScale', 'pct'],
];
gateSliders.forEach(([slId, outId, key, unit]) => {
  const sl = document.getElementById(slId);
  const out = document.getElementById(outId);
  if (!sl || !out) return;
  sl.addEventListener('input', () => {
    params[key] = Number(sl.value);
    out.textContent = unit === 'pct' ? `${Math.round(params[key] * 100)}%` : `${params[key].toFixed(2)} m`;
    rebuildAll();
  });
});

document.getElementById('btnResetGateDims').addEventListener('click', () => {
  gateSliders.forEach(([slId, outId, key, unit]) => {
    params[key] = DEFAULT_PARAMS[key];
    document.getElementById(slId).value = params[key];
    document.getElementById(outId).textContent =
      unit === 'pct' ? `${Math.round(params[key] * 100)}%` : `${params[key].toFixed(2)} m`;
  });
  rebuildAll();
});

// Chọn vật liệu kết cấu (Tre tự nhiên / Tre sơn PU / Gỗ / PVC giả tre)
document.querySelectorAll('input[name="boothMaterial"]').forEach((rad) => {
  rad.addEventListener('change', (e) => {
    params.material = e.target.value;
    document.querySelectorAll('.mat-card').forEach((c) => c.classList.remove('active'));
    e.target.closest('.mat-card').classList.add('active');
    rebuildAll();
  });
});

// Bật/tắt từng nhóm cấu kiện & trang trí
document.querySelectorAll('[data-group-toggle]').forEach((chk) => {
  chk.addEventListener('change', (e) => {
    const grp = e.target.dataset.groupToggle;
    booth.setGroupVisibility(grp, e.target.checked);
    construction.applyTransforms();
  });
});

// Upload 4 Logo & chỉnh tỷ lệ thu phóng
document.querySelectorAll('[data-logo-upload]').forEach((inp) => {
  inp.addEventListener('change', async (e) => {
    const key = e.target.dataset.logoUpload;
    const file = e.target.files?.[0];
    if (file) {
      await booth.setCustomLogoFile(key, file);
      document.getElementById('chkShowPlaceholders').checked = false;
    }
  });
});

document.querySelectorAll('[data-logo-scale]').forEach((rng) => {
  rng.addEventListener('input', (e) => {
    booth.setLogoScale(e.target.dataset.logoScale, e.target.value);
  });
});

document.getElementById('chkShowPlaceholders').addEventListener('change', (e) => {
  booth.usePlaceholders = e.target.checked;
  ['ptit', 'str4', 'd26', 'doan'].forEach((k) => booth._renderSignCanvas(k));
});

document.getElementById('btnRestoreDefaultLogos').addEventListener('click', () => {
  document.getElementById('chkShowPlaceholders').checked = false;
  document.querySelectorAll('[data-logo-scale]').forEach((r) => { r.value = '1.0'; });
  booth.resetDefaultLogos();
});

// Điều khiển thanh tiến trình thi công (Bottom Bar)
document.getElementById('btnPlayPause').addEventListener('click', () => {
  if (activeMode !== 'construction') switchMode('construction');
  construction.togglePlay();
});

document.getElementById('btnPrevStage').addEventListener('click', () => {
  if (activeMode !== 'construction') switchMode('construction');
  construction.prevStage();
});

document.getElementById('btnNextStage').addEventListener('click', () => {
  if (activeMode !== 'construction') switchMode('construction');
  construction.nextStage();
});

document.getElementById('selSpeed').addEventListener('change', (e) => {
  construction.speed = Number(e.target.value) || 1.0;
});

document.querySelectorAll('.stage-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    const st = Number(pill.dataset.stage);
    document.getElementById('stageGuideCard').classList.remove('hidden');
    construction.setStage(st, 0, true);
    const info = construction.getCurrentStageInfo();
    if (info && info.camera && construction.autoCamera) {
      animateCameraTo(info.camera.pos, info.camera.target, 0.65);
    }
  });
});

document.getElementById('slStageScrub').addEventListener('input', (e) => {
  construction.pause();
  construction.setProgress(Number(e.target.value));
});

document.getElementById('btnMinimizeStageCard').addEventListener('click', () => {
  const body = document.getElementById('stageGuideBody');
  body.classList.toggle('hidden');
});

// Raycast chọn cấu kiện khi click chuột vào mô hình 3D
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downPos = { x: 0, y: 0 };

canvas.addEventListener('pointerdown', (e) => {
  downPos = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('pointerup', (e) => {
  if (e.button !== 0) return;
  const moveDist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
  if (moveDist > 5) return; // Người dùng đang kéo xoay camera, không phải click chọn

  const rect = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(booth.partsGroup.children, true);
  const validHit = hits.find((h) => h.object.visible && h.object.userData?.partId);

  if (validHit) {
    const info = booth.selectPart(validHit.object.userData.partId);
    showInspectorCard(info);
  } else {
    booth.selectPart(null);
    document.getElementById('partInspectorCard').classList.add('hidden');
  }
});

let inspectedStage = 2;
function showInspectorCard(info) {
  const card = document.getElementById('partInspectorCard');
  if (!info) {
    card.classList.add('hidden');
    return;
  }
  inspectedStage = info.stage;
  document.getElementById('inspStageTag').textContent = `GĐ ${info.stage}`;
  document.getElementById('inspTitle').textContent = info.name;
  document.getElementById('inspType').textContent = info.typeName;
  document.getElementById('inspMaterial').textContent = info.material;
  document.getElementById('inspDims').textContent = info.dimensions;
  document.getElementById('inspQty').textContent = info.quantity;
  document.getElementById('inspRole').textContent = info.role;
  document.getElementById('inspInstall').textContent = info.install;
  card.classList.remove('hidden');
}

document.getElementById('btnCloseInspector').addEventListener('click', () => {
  booth.selectPart(null);
  document.getElementById('partInspectorCard').classList.add('hidden');
});

document.getElementById('btnJumpToPartStage').addEventListener('click', () => {
  switchMode('construction');
  construction.setStage(inspectedStage, 1.0, false);
});

// ---------------------------------------------------------------------
//  9. CÁC CHỨC NĂNG XUẤT DỮ LIỆU (PNG, FULLSCREEN, CSV, GLB, BLUEPRINT)
// ---------------------------------------------------------------------
function captureScreenshotPNG() {
  renderer.render(scene, camera);
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `Galactic_Food_Station_3D_${params.width}x${params.depth}m.png`;
  a.click();
}

document.getElementById('btnScreenshot').addEventListener('click', captureScreenshotPNG);
document.getElementById('btnExportPNG2').addEventListener('click', captureScreenshotPNG);

document.getElementById('btnFullscreen').addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});

function downloadCSV() {
  const csv = exportBOMToCSV(currentBOM, currentLayout);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Du_Toan_Vat_Tu_Galactic_Food_Station.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('btnExportCSV').addEventListener('click', downloadCSV);
document.getElementById('btnExportCSV2').addEventListener('click', downloadCSV);

document.getElementById('btnResetPrices').addEventListener('click', () => {
  customPrices = { ...DEFAULT_PRICES };
  recalcBOMAndUI();
});

document.getElementById('inputBudgetLimit').addEventListener('input', (e) => {
  budgetLimit = Math.max(100000, Number(e.target.value) || 2500000);
  recalcBOMAndUI();
});

function downloadBlueprintPNG() {
  drawBlueprintCanvas(currentLayout, currentBOM);
  const cv = document.getElementById('blueprintCanvas');
  const a = document.createElement('a');
  a.href = cv.toDataURL('image/png');
  a.download = `Ban_Ve_Ky_Thuat_Galactic_Food_Station.png`;
  a.click();
}

document.getElementById('btnDownloadBlueprint').addEventListener('click', downloadBlueprintPNG);
document.getElementById('btnExportBlueprint2').addEventListener('click', downloadBlueprintPNG);

document.getElementById('btnExportGLB').addEventListener('click', () => {
  const exporter = new GLTFExporter();
  exporter.parse(
    booth.partsGroup,
    (result) => {
      const blob = new Blob([result], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Galactic_Food_Station_${params.width}x${params.depth}m.glb`;
      a.click();
      URL.revokeObjectURL(url);
    },
    (err) => console.error('Lỗi xuất GLB:', err),
    { binary: true },
  );
});

// ---------------------------------------------------------------------
//  10. XỬ LÝ RESIZE & VÒNG LẶP RENDER 60 FPS
// ---------------------------------------------------------------------
function onWindowResize() {
  const w = viewport.clientWidth || window.innerWidth;
  const h = viewport.clientHeight || window.innerHeight;
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener('resize', onWindowResize);

let lastTime = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;

  // Cập nhật chuyển động camera mượt
  if (camAnim) {
    camAnim.elapsed += dt;
    const t = Math.min(1, camAnim.elapsed / camAnim.duration);
    const e = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(camAnim.startPos, camAnim.endPos, e);
    controls.target.lerpVectors(camAnim.startTarget, camAnim.endTarget, e);
    if (t >= 1) camAnim = null;
  }

  // Cập nhật hoạt ảnh Construction Mode
  construction.tick(dt);

  // Đung đưa nhẹ các ngôi sao treo và xoay chậm quỹ đạo hành tinh
  const sway = Math.sin(now * 0.0018) * 0.04;
  for (const [, obj] of booth.partMeshes) {
    const part = obj.userData.part;
    if (!part || !obj.visible) continue;
    if (part.type === 'hangStar' && construction.stageProgress >= 0.99) {
      obj.rotation.y = (part.rotY || 0) + sway;
    } else if (part.type === 'planet' && construction.stageProgress >= 0.99) {
      obj.rotation.y = now * 0.0005;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

// Khởi chạy ứng dụng
rebuildAll();
onConstructionStateUpdate(construction.getState());
onWindowResize();
requestAnimationFrame(animate);
