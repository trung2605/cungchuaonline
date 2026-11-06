/* Live TikTok Unified Studio Admin — Clean Modular Controller & ApexCharts Engine */

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtNum = n => Number(n || 0).toLocaleString('vi-VN');

// ============================================================================
// ANIMATE-UI MOTION ENGINE (Counting Numbers, Stagger Cascade, Spotlight, Ripple)
// ============================================================================
const kpiNumericState = new Map();

function animateKpiValue(id, targetValue, suffix = '') {
  const el = $(id);
  if (!el) return;
  const nextVal = Math.round(Number(targetValue) || 0);
  const prevVal = kpiNumericState.get(id);

  if (prevVal === undefined) {
    kpiNumericState.set(id, nextVal);
    el.textContent = fmtNum(nextVal) + suffix;
    return;
  }
  if (prevVal === nextVal) return;

  kpiNumericState.set(id, nextVal);
  el.classList.remove('au-num-pop');
  void el.offsetWidth;
  el.classList.add('au-num-pop');

  const startVal = prevVal;
  const diff = nextVal - startVal;
  const duration = 380;
  const t0 = performance.now();

  const step = now => {
    const p = Math.min(1, (now - t0) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const cur = Math.round(startVal + diff * eased);
    el.textContent = fmtNum(cur) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function triggerStaggerCascade(rootEl) {
  if (!rootEl) return;
  const items = rootEl.querySelectorAll('.control-hub-card, .kpi-card, .game-sim-bar, .card, .fx-tile, .biome-btn');
  items.forEach((item, idx) => {
    item.style.setProperty('--au-idx', String(Math.min(idx, 14)));
    item.classList.remove('au-stagger-item');
    void item.offsetWidth;
    item.classList.add('au-stagger-item');
  });
}

function initAnimateUiInteractions() {
  // 1. Cursor-tracking spotlight on interactive cards & tiles
  document.addEventListener('pointermove', e => {
    const card = e.target.closest('.kpi-card, .control-hub-card, .fx-tile, .biome-btn');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, { passive: true });

  // 2. Tactile click ripple on buttons, pills, tiles & nav items
  document.addEventListener('pointerdown', e => {
    const btn = e.target.closest('.btn, .preset-pill, .fx-tile, .biome-btn, .sub-tab-btn, .main-tab-btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'au-ripple';
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 580);
  });

  // Initial stagger reveal on active view
  triggerStaggerCascade(document.querySelector('.main-tab-view.active'));
}

// Toast Notification
let toastTimer = null;
function showToast(msg, ok = true) {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'toast';
  void el.offsetWidth;
  el.className = `toast show ${ok ? 'ok' : 'err'}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3800);
}

// Unified API Caller
async function api(method, path, body) {
  try {
    const r = await fetch(path, {
      method,
      headers: body !== undefined ? { 'content-type': 'application/json' } : {},
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
    return data;
  } catch (err) {
    showToast(`Lỗi: ${err.message}`, false);
    throw err;
  }
}

// Helper to proxy actions to a specific game ('cung-chua-online', 'cuoc-dua-ky-thu', or 'all')
async function gameAction(game, endpoint, payload = {}, method = 'POST') {
  return api('POST', '/api/game-action', { game, method, endpoint, payload });
}

// ============================================================================
// LEFT SIDEBAR TREE NAVIGATION & SUB-NAVIGATION (Main Group + Sub-Nav + Breadcrumb)
// ============================================================================
const MAIN_TAB_LABELS = {
  master: 'Admin Tổng (:8791)',
  chua: 'Cúng Chùa 3D (:8787)',
  dua: 'Đi Bộ Xuyên Việt (:8789)',
  trends: '10 Web 3D Trend (/trends)',
};

const activeSubTabByParent = {
  master: 'master-overview',
  chua: 'chua-controls',
  dua: 'dua-controls',
  trends: 'trends-catalog',
};

function updateBreadcrumb(parentTab, subTabId) {
  const parentEl = $('breadcrumbParent');
  const currentEl = $('breadcrumbCurrent');
  if (parentEl) {
    parentEl.textContent = MAIN_TAB_LABELS[parentTab] || 'Admin Tổng';
  }
  if (currentEl) {
    const activeBtn = document.querySelector(`.sub-tab-btn[data-sub="${subTabId}"]`);
    currentEl.textContent = activeBtn ? activeBtn.textContent.trim() : '';
  }
}

function switchMainTab(mainTab, toggleExpandIfSame = false) {
  const clean = (mainTab || 'master').replace(/^#/, '');
  const target = ['master', 'chua', 'dua', 'trends'].includes(clean) ? clean : 'master';

  const currentActiveBtn = document.querySelector('.main-tab-btn.active');
  const isSameTab = currentActiveBtn && currentActiveBtn.dataset.mainTab === target;

  document.querySelectorAll('.main-tab-btn').forEach(btn => {
    const isTarget = btn.dataset.mainTab === target;
    btn.classList.toggle('active', isTarget);
    const group = btn.closest('.nav-group');
    if (group) {
      if (isTarget) {
        const nextExpanded = isSameTab && toggleExpandIfSame
          ? !group.classList.contains('expanded')
          : true;
        group.classList.toggle('expanded', nextExpanded);
        btn.setAttribute('aria-expanded', String(nextExpanded));
      }
    }
  });

  document.querySelectorAll('.main-tab-view').forEach(view => {
    view.classList.toggle('active', view.id === `main-view-${target}`);
  });

  const subId = activeSubTabByParent[target];
  document.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.parent === target && btn.dataset.sub === subId);
  });

  updateBreadcrumb(target, subId);
  triggerStaggerCascade($(`main-view-${target}`));

  if (history.replaceState) {
    history.replaceState(null, '', `#${target}`);
  }
  setTimeout(() => window.dispatchEvent(new Event('resize')), 40);
}
window.switchMainTab = switchMainTab;

function switchSubTab(parentTab, subTabId) {
  const cleanParent = ['master', 'chua', 'dua', 'trends'].includes(parentTab) ? parentTab : 'master';
  activeSubTabByParent[cleanParent] = subTabId;

  // Ensure parent main view is active and expanded
  switchMainTab(cleanParent, false);

  const container = $(`main-view-${cleanParent}`);
  if (container) {
    container.querySelectorAll('.sub-tab-panel').forEach(panel => {
      const isActive = panel.id === `sub-${subTabId}`;
      panel.classList.toggle('active', isActive);
      if (isActive) triggerStaggerCascade(panel);
    });
  }

  document.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sub === subTabId);
  });

  updateBreadcrumb(cleanParent, subTabId);
  setTimeout(() => window.dispatchEvent(new Event('resize')), 40);
}
window.switchSubTab = switchSubTab;

// ============================================================================
// MOCK / SAMPLE DATA FILTER TOGGLE (Default: OFF = Real Users Only)
// ============================================================================
let showMockData = false;
let lastStateCache = null;

// Built-in sample dataset used ONLY when showMockData === true so the admin can preview
// charts/tables with sample data without polluting real database records
const SAMPLE_PREVIEW = {
  chuaDiamonds: 36,
  duaDiamonds: 45,
  trendDiamonds: 18,
  trendEvents: 42,
  trendComments: 30,
  trendMicroGifts: 12,
  giftsCount: 5,
  namo: 28,
  bows: 64,
  bowers: 12,
  duaDistM: 1240,
  duaLikes: 420,
  duaChats: 19,
  topDonors: [
    { name: 'Phật Tử Thiện Tâm (Mẫu)', totalDiamonds: 25 },
    { name: 'Minh An (Mẫu)', totalDiamonds: 30 },
    { name: 'Lê Trí Trung (Mẫu)', totalDiamonds: 15 },
    { name: 'An Nhiên (Mẫu)', totalDiamonds: 11 },
  ],
  topPrayers: [
    { text: 'Nam mô A Di Đà Phật cầu bình an (Mẫu)', count: 22 },
    { text: 'Cầu gia đạo bình an sức khỏe (Mẫu)', count: 15 },
    { text: 'Cầu tài lộc hanh thông (Mẫu)', count: 11 },
  ],
  topRacers: [
    { name: 'Minh An (Mẫu)', distanceM: 1240, diamonds: 30, tier: 3 },
    { name: 'Lê Trí Trung (Mẫu)', distanceM: 680, diamonds: 15, tier: 2 },
    { name: 'An Nhiên (Mẫu)', distanceM: 320, diamonds: 1, tier: 1 },
  ],
  chuaActors: [
    { id: 'sample_chua_1', name: 'Phật Tử Thiện Tâm (Mẫu)', tier: 2, intent: 'Cầu Bình An', bows: 6, diamonds: 20, src: 'mock' },
    { id: 'sample_chua_2', name: 'An Nhiên (Mẫu)', tier: 1, intent: 'Cầu Tài Lộc', bows: 4, diamonds: 10, src: 'mock' },
  ],
  duaRunners: [
    { id: 'sample_dua_1', name: 'Minh An (Mẫu)', tier: 3, speedMult: 4.8, distanceM: 1240, diamonds: 30, cheer: 'Bứt tốc tên lửa! (Mẫu)', src: 'mock' },
    { id: 'sample_dua_2', name: 'Lê Trí Trung (Mẫu)', tier: 2, speedMult: 2.8, distanceM: 680, diamonds: 15, cheer: 'Khám phá thế giới! (Mẫu)', src: 'mock' },
  ],
  gifts: [
    { time: 'Mẫu Demo', game: 'cung-chua-online', gameLabel: 'Cúng Chùa Online 3D', name: 'Phật Tử Thiện Tâm (Mẫu)', giftVi: 'Nước Hoa', repeat: 1, totalDiamonds: 20, tier: 4, reward: 'Áo tràng Hoàng Kim · Thắp đại hoa đăng, Hào quang & Đại hồng chung', src: 'mock' },
    { time: 'Mẫu Demo', game: 'cuoc-dua-ky-thu', gameLabel: 'Cuộc Đua Kỳ Thú 3D', name: 'Minh An (Mẫu)', giftVi: 'Bánh Vòng', repeat: 1, totalDiamonds: 30, tier: 4, reward: 'Tên Lửa Hoàng Kim · Tốc độ ×4.8 (+1.500m)', src: 'mock' },
    { time: 'Mẫu Demo', game: 'cung-chua-online', gameLabel: 'Cúng Chùa Online 3D', name: 'An Nhiên (Mẫu)', giftVi: 'Hoa Rosa', repeat: 1, totalDiamonds: 10, tier: 3, reward: 'Khoác Áo tràng Vàng · Thắp đèn hoa đăng & Chuông chùa', src: 'mock' },
    { time: 'Mẫu Demo', game: 'cung-chua-online', gameLabel: 'Cúng Chùa Online 3D', name: 'Phật Tử Thiện Tâm (Mẫu)', giftVi: 'Tim Tay', repeat: 1, totalDiamonds: 5, tier: 2, reward: 'Dâng hoa sen & Đèn hoa đăng · Chuông gia trì & Đọc tên', src: 'mock' },
    { time: 'Mẫu Demo', game: 'cung-chua-online', gameLabel: 'Cúng Chùa Online 3D', name: 'An Nhiên (Mẫu)', giftVi: 'Hoa Hồng', repeat: 1, totalDiamonds: 1, tier: 1, reward: 'Dâng 3 nén hương trầm · Tiếng khánh & Đọc tên cầu an', src: 'mock' },
  ],
};

function syncMockToggleButtons() {
  document.querySelectorAll('[data-toggle-mock]').forEach(btn => {
    btn.classList.toggle('primary', showMockData);
    btn.innerHTML = showMockData
      ? `<i data-lucide="flask-conical"></i> <span class="mock-toggle-label">Dữ Liệu Mẫu: ĐANG BẬT (Gồm Cả Fake)</span>`
      : `<i data-lucide="user-check"></i> <span class="mock-toggle-label">Dữ Liệu Mẫu: ĐANG TẮT (Chỉ Người Thật)</span>`;
  });
  if (window.lucide) window.lucide.createIcons();
}

function toggleMockDataMode() {
  showMockData = !showMockData;
  syncMockToggleButtons();
  historySeries.labels.length = 0;
  historySeries.chuaDiamonds.length = 0;
  historySeries.duaDiamonds.length = 0;
  historySeries.trendDiamonds.length = 0;
  historySeries.chuaNamo.length = 0;
  historySeries.chuaActors.length = 0;
  historySeries.duaDistM.length = 0;
  historySeries.duaLikes.length = 0;
  showToast(
    showMockData
      ? 'Đã BẬT hiển thị dữ liệu mẫu (Thống kê bao gồm cả dữ liệu Fake/Mẫu trên cả 4 phân hệ)'
      : 'Đã TẮT dữ liệu mẫu — Chỉ hiển thị 100% thông số người dùng thật!'
  );
  if (lastStateCache) renderAll(lastStateCache);
}
window.toggleMockDataMode = toggleMockDataMode;

// ============================================================================
// APEXCHARTS ENGINE (21 Interactive Statistical Charts Across All Subsystems)
// ============================================================================
const charts = {};
const historySeries = {
  labels: [],
  chuaDiamonds: [],
  duaDiamonds: [],
  trendDiamonds: [],
  chuaNamo: [],
  chuaActors: [],
  duaDistM: [],
  duaLikes: [],
};

function initApexCharts() {
  if (typeof ApexCharts === 'undefined') return;

  const baseFont = "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif";

  // 1. Global Real-Time Diamond Timeline (Area Spline - 3 Systems)
  if ($('chartGlobalTimeline')) {
    charts.globalTimeline = new ApexCharts($('chartGlobalTimeline'), {
      chart: { type: 'area', height: 280, fontFamily: baseFont, toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout', speed: 400 } },
      colors: ['#2563eb', '#0d9488', '#d97706'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2.5 },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.03, stops: [0, 95, 100] } },
      series: [
        { name: 'Cúng Chùa 3D (💎)', data: [] },
        { name: 'Đi Bộ Xuyên Việt (💎)', data: [] },
        { name: '10 Web 3D Trend (💎)', data: [] },
      ],
      xaxis: { categories: [], labels: { style: { colors: '#64748b', fontSize: '11px' } } },
      yaxis: { min: 0, labels: { formatter: v => fmtNum(Math.round(v)), style: { colors: '#64748b', fontSize: '11px' } } },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
      legend: { position: 'top', horizontalAlign: 'right', fontWeight: 700 },
    });
    charts.globalTimeline.render();
  }

  // 2. Global Game Share (Donut - 3 Systems)
  if ($('chartGlobalShare')) {
    charts.globalShare = new ApexCharts($('chartGlobalShare'), {
      chart: { type: 'donut', height: 280, fontFamily: baseFont },
      colors: ['#2563eb', '#0d9488', '#d97706'],
      labels: ['Cúng Chùa Online 3D', 'Đi Bộ Xuyên Việt 3D', '10 Web 3D Trend'],
      series: [0, 0, 0],
      plotOptions: {
        pie: {
          donut: {
            size: '66%',
            labels: {
              show: true,
              total: { show: true, label: 'Tổng Kim Cương', fontWeight: 700, formatter: w => fmtNum(w.globals.seriesTotals.reduce((a, b) => a + b, 0)) + ' 💎' },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      legend: { position: 'bottom', fontWeight: 600 },
    });
    charts.globalShare.render();
  }

  // 3. Global Top Donors (Horizontal Bar)
  if ($('chartGlobalTopDonors')) {
    charts.globalTopDonors = new ApexCharts($('chartGlobalTopDonors'), {
      chart: { type: 'bar', height: 260, fontFamily: baseFont, toolbar: { show: false } },
      colors: ['#2563eb'],
      plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '62%' } },
      dataLabels: { enabled: true, formatter: v => fmtNum(v) + ' 💎', style: { fontSize: '11px', fontWeight: 700 } },
      series: [{ name: 'Kim cương', data: [] }],
      xaxis: { categories: [], labels: { style: { colors: '#475569', fontSize: '11px' } } },
      grid: { borderColor: '#f1f5f9' },
    });
    charts.globalTopDonors.render();
  }

  // 4. Global Conversion Funnel Across All Systems
  if ($('chartGlobalFunnel')) {
    charts.globalFunnel = new ApexCharts($('chartGlobalFunnel'), {
      chart: { type: 'bar', height: 260, fontFamily: baseFont, toolbar: { show: false } },
      colors: ['#3b82f6', '#0d9488', '#8b5cf6', '#ec4899', '#f59e0b'],
      plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 4, barHeight: '64%' } },
      dataLabels: { enabled: true, formatter: v => fmtNum(v) + ' lượt', style: { fontSize: '11px', fontWeight: 700 } },
      series: [{ name: 'Số lượng', data: [0, 0, 0, 0, 0] }],
      xaxis: {
        categories: [
          '1. Tổng Tương Tác Toàn Hệ Thống',
          '2. Bình Luận / Niệm Phật / Giải Mã',
          '3. Nhân Vật & Dải Lụa 3D Hiện Diện',
          '4. Quà Nhỏ Kích Cầu (1💎–5💎)',
          '5. Quà Lớn Vinh Danh (10💎+)',
        ],
        labels: { style: { colors: '#475569', fontSize: '11px' } },
      },
      legend: { show: false },
      grid: { borderColor: '#f1f5f9' },
    });
    charts.globalFunnel.render();
  }

  // 5. System Balance Chart: Real Users vs Demo Users vs Target Threshold
  if ($('chartSystemBalance')) {
    charts.systemBalance = new ApexCharts($('chartSystemBalance'), {
      chart: { type: 'bar', height: 155, fontFamily: baseFont, toolbar: { show: false } },
      colors: ['#059669', '#d97706', '#2563eb'],
      plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '72%' } },
      dataLabels: { enabled: true, formatter: v => fmtNum(v), style: { fontSize: '10.5px', fontWeight: 700 } },
      series: [
        { name: 'Người thật', data: [0, 0, 0] },
        { name: 'Mẫu bù tự động', data: [0, 0, 0] },
        { name: 'Ngưỡng đủ', data: [8, 8, 10] },
      ],
      xaxis: { categories: ['Chùa 3D (:8787)', 'Xuyên Việt (:8789)', '10 Web Trend'], labels: { style: { colors: '#64748b', fontSize: '10.5px' } } },
      grid: { borderColor: '#f1f5f9', padding: { top: -10, bottom: -8 } },
      legend: { position: 'top', horizontalAlign: 'right', fontSize: '11px', fontWeight: 700 },
    });
    charts.systemBalance.render();
  }

  // 6. Gift Tier Distribution (Donut - #sub-master-gifts)
  if ($('chartGiftTierDistribution')) {
    charts.giftTierDistribution = new ApexCharts($('chartGiftTierDistribution'), {
      chart: { type: 'donut', height: 260, fontFamily: baseFont },
      colors: ['#ec4899', '#0d9488', '#2563eb', '#d97706'],
      labels: ['Tier 1: Quà Nhỏ (1–4💎)', 'Tier 2: Quà Vừa (5–9💎)', 'Tier 3: Quà Lớn (10–19💎)', 'Tier 4: Đại Lễ (20💎+)'],
      series: [0, 0, 0, 0],
      plotOptions: {
        pie: {
          donut: {
            size: '64%',
            labels: {
              show: true,
              total: { show: true, label: 'Tổng Lượt Quà', fontWeight: 700, formatter: w => fmtNum(w.globals.seriesTotals.reduce((a, b) => a + b, 0)) },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      legend: { position: 'bottom', fontWeight: 600 },
    });
    charts.giftTierDistribution.render();
  }

  // 7. Top Gift Items by Revenue (Horizontal Bar - #sub-master-gifts)
  if ($('chartTopGiftItems')) {
    charts.topGiftItems = new ApexCharts($('chartTopGiftItems'), {
      chart: { type: 'bar', height: 260, fontFamily: baseFont, toolbar: { show: false } },
      colors: ['#d97706'],
      plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '62%' } },
      dataLabels: { enabled: true, formatter: v => fmtNum(v) + ' 💎', style: { fontSize: '11px', fontWeight: 700 } },
      series: [{ name: 'Kim cương', data: [] }],
      xaxis: { categories: [], labels: { style: { colors: '#475569', fontSize: '11px' } } },
      grid: { borderColor: '#f1f5f9' },
    });
    charts.topGiftItems.render();
  }

  // 8. Work Logs By Category (Donut - #sub-master-worklogs)
  if ($('chartWorkLogsByCategory')) {
    charts.workLogsByCategory = new ApexCharts($('chartWorkLogsByCategory'), {
      chart: { type: 'donut', height: 250, fontFamily: baseFont },
      colors: ['#2563eb', '#0d9488', '#d97706', '#8b5cf6', '#ec4899', '#059669', '#64748b'],
      labels: ['Architecture', 'Feature', '3D & UI/UX', 'Voice & Audio', 'Analytics', 'Database'],
      series: [1, 1, 1, 1, 1, 1],
      plotOptions: {
        pie: {
          donut: {
            size: '62%',
            labels: {
              show: true,
              total: { show: true, label: 'Hạng Mục', fontWeight: 700, formatter: w => fmtNum(w.globals.seriesTotals.reduce((a, b) => a + b, 0)) },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      legend: { position: 'bottom', fontWeight: 600 },
    });
    charts.workLogsByCategory.render();
  }

  // 9. Work Logs By Subsystem Scope (Bar - #sub-master-worklogs)
  if ($('chartWorkLogsByScope')) {
    charts.workLogsByScope = new ApexCharts($('chartWorkLogsByScope'), {
      chart: { type: 'bar', height: 250, fontFamily: baseFont, toolbar: { show: false } },
      colors: ['#2563eb', '#d97706', '#0d9488', '#8b5cf6'],
      plotOptions: { bar: { horizontal: false, distributed: true, borderRadius: 5, columnWidth: '52%' } },
      dataLabels: { enabled: true, formatter: v => fmtNum(v) + ' việc', style: { fontSize: '11px', fontWeight: 700 } },
      series: [{ name: 'Hạng mục công việc', data: [0, 0, 0, 0] }],
      xaxis: {
        categories: ['Toàn Hệ Thống (all)', 'Cúng Chùa 3D', 'Đi Bộ Xuyên Việt', '10 Web 3D Trend'],
        labels: { style: { colors: '#475569', fontSize: '11px' } },
      },
      legend: { show: false },
      grid: { borderColor: '#f1f5f9' },
    });
    charts.workLogsByScope.render();
  }

  // 10. Database Collections Breakdown (Bar - #sub-master-mongodb)
  if ($('chartDatabaseCollections')) {
    charts.databaseCollections = new ApexCharts($('chartDatabaseCollections'), {
      chart: { type: 'bar', height: 250, fontFamily: baseFont, toolbar: { show: false } },
      colors: ['#2563eb', '#d97706', '#059669', '#0d9488', '#8b5cf6', '#ec4899'],
      plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 4, barHeight: '64%' } },
      dataLabels: { enabled: true, formatter: v => fmtNum(v) + ' bản ghi', style: { fontSize: '11px', fontWeight: 700 } },
      series: [{ name: 'Số bản ghi', data: [0, 0, 0, 0, 0, 0] }],
      xaxis: {
        categories: [
          'events (Sự kiện Live)',
          'gifts (Lịch sử Quà tặng)',
          'users (Hồ sơ Người dùng)',
          'giftCatalog (Danh mục Quà)',
          'workLogs (Nhật ký Công việc)',
          'trendsCustomData (Kho Data 10 Web)',
        ],
        labels: { style: { colors: '#475569', fontSize: '11px' } },
      },
      legend: { show: false },
      grid: { borderColor: '#f1f5f9' },
    });
    charts.databaseCollections.render();
  }

  // 11. Cúng Chùa Online: Niệm Phật & Phật tử Timeline
  if ($('chartChuaTimeline')) {
    charts.chuaTimeline = new ApexCharts($('chartChuaTimeline'), {
      chart: { type: 'area', height: 260, fontFamily: baseFont, toolbar: { show: false } },
      colors: ['#2563eb', '#d97706'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2.5 },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0.02 } },
      series: [
        { name: 'Tổng Niệm Nam Mô', data: [] },
        { name: 'Phật tử trong điện', data: [] },
      ],
      xaxis: { categories: [] },
      yaxis: { min: 0 },
      grid: { borderColor: '#f1f5f9' },
      legend: { position: 'top', horizontalAlign: 'right' },
    });
    charts.chuaTimeline.render();
  }

  // 12. Cúng Chùa Online: Phân Bố Lời Cầu Nguyện
  if ($('chartChuaPrayers')) {
    charts.chuaPrayers = new ApexCharts($('chartChuaPrayers'), {
      chart: { type: 'donut', height: 260, fontFamily: baseFont },
      colors: ['#1d4ed8', '#2563eb', '#3b82f6', '#0d9488', '#d97706', '#ec4899'],
      labels: ['Chưa có dữ liệu'],
      series: [1],
      plotOptions: { pie: { donut: { size: '64%' } } },
      dataLabels: { enabled: false },
      legend: { position: 'bottom' },
    });
    charts.chuaPrayers.render();
  }

  // 13. Cúng Chùa Online: Phân Bố Pháp Phục & Dải Lụa Cây Bồ Đề (#chartChuaRobeAndSilk)
  if ($('chartChuaRobeAndSilk')) {
    charts.chuaRobeAndSilk = new ApexCharts($('chartChuaRobeAndSilk'), {
      chart: { type: 'bar', height: 260, fontFamily: baseFont, toolbar: { show: false } },
      colors: ['#64748b', '#3b82f6', '#d97706', '#ef4444', '#ec4899', '#f59e0b'],
      plotOptions: { bar: { horizontal: false, distributed: true, borderRadius: 4, columnWidth: '55%' } },
      dataLabels: { enabled: true, formatter: v => fmtNum(v), style: { fontSize: '11px', fontWeight: 700 } },
      series: [{ name: 'Số lượng', data: [0, 0, 0, 0, 0, 0] }],
      xaxis: {
        categories: ['Áo Lam', 'Áo Vàng', 'Hoàng Kim', 'Lụa Đỏ', 'Lụa Hồng Sen', 'Lụa Hoàng Kim'],
        labels: { style: { colors: '#475569', fontSize: '11px' } },
      },
      legend: { show: false },
      grid: { borderColor: '#f1f5f9' },
    });
    charts.chuaRobeAndSilk.render();
  }

  // 14. Cúng Chùa Online: Bảng Vàng Công Đức Chánh Điện (#chartChuaTopDonors)
  if ($('chartChuaTopDonors')) {
    charts.chuaTopDonors = new ApexCharts($('chartChuaTopDonors'), {
      chart: { type: 'bar', height: 260, fontFamily: baseFont, toolbar: { show: false } },
      colors: ['#d97706'],
      plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '62%' } },
      dataLabels: { enabled: true, formatter: v => fmtNum(v) + ' 💎', style: { fontSize: '11px', fontWeight: 700 } },
      series: [{ name: 'Kim cương công đức', data: [] }],
      xaxis: { categories: [], labels: { style: { colors: '#475569', fontSize: '11px' } } },
      grid: { borderColor: '#f1f5f9' },
    });
    charts.chuaTopDonors.render();
  }

  // 15. Cuộc Đua Kỳ Thú: Phân Bố Trang Bị / Phương Tiện
  if ($('chartDuaTiers')) {
    charts.duaTiers = new ApexCharts($('chartDuaTiers'), {
      chart: { type: 'donut', height: 260, fontFamily: baseFont },
      colors: ['#94a3b8', '#38bdf8', '#0d9488', '#2563eb', '#d97706'],
      labels: ['Đi bộ (x1.0)', 'Nón Lá / Cánh Chim (x1.8)', 'Xe Đạp / Cub (x2.8)', 'Xích Lô / Chiến Mã (x4.2)', 'Mô Tô Phượt / Rồng Vàng (x6.5)'],
      series: [0, 0, 0, 0, 0],
      plotOptions: { pie: { donut: { size: '64%' } } },
      dataLabels: { enabled: false },
      legend: { position: 'bottom' },
    });
    charts.duaTiers.render();
  }

  // 16. Cuộc Đua Kỳ Thú: Top Tay Đua Dẫn Đầu (m)
  if ($('chartDuaTopRacers')) {
    charts.duaTopRacers = new ApexCharts($('chartDuaTopRacers'), {
      chart: { type: 'bar', height: 260, fontFamily: baseFont, toolbar: { show: false } },
      colors: ['#0d9488'],
      plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '62%' } },
      dataLabels: { enabled: true, formatter: v => fmtNum(v) + ' m', style: { fontSize: '11px', fontWeight: 700 } },
      series: [{ name: 'Quãng đường (m)', data: [] }],
      xaxis: { categories: [] },
      grid: { borderColor: '#f1f5f9' },
    });
    charts.duaTopRacers.render();
  }

  // 17. Cuộc Đua Kỳ Thú: Biểu Đồ Quãng Đường & Tim Tiếp Sức Theo Thời Gian (#chartDuaTimeline)
  if ($('chartDuaTimeline')) {
    charts.duaTimeline = new ApexCharts($('chartDuaTimeline'), {
      chart: { type: 'area', height: 260, fontFamily: baseFont, toolbar: { show: false } },
      colors: ['#0d9488', '#ec4899'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2.5 },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0.02 } },
      series: [
        { name: 'Quãng đường đoàn (m)', data: [] },
        { name: 'Lượt Thả Tim tiếp sức', data: [] },
      ],
      xaxis: { categories: [] },
      yaxis: { min: 0 },
      grid: { borderColor: '#f1f5f9' },
      legend: { position: 'top', horizontalAlign: 'right' },
    });
    charts.duaTimeline.render();
  }

  // 18. Cuộc Đua Kỳ Thú: Tiến Độ Qua 12 Địa Danh Việt Nam (#chartDuaBiomesProgress)
  if ($('chartDuaBiomesProgress')) {
    charts.duaBiomesProgress = new ApexCharts($('chartDuaBiomesProgress'), {
      chart: { type: 'bar', height: 260, fontFamily: baseFont, toolbar: { show: false } },
      colors: ['#0d9488'],
      plotOptions: { bar: { horizontal: false, borderRadius: 3, columnWidth: '58%' } },
      dataLabels: { enabled: false },
      series: [{ name: 'Mốc hành trình (m)', data: [] }],
      xaxis: { categories: [], labels: { rotate: -35, style: { colors: '#475569', fontSize: '10px' } } },
      grid: { borderColor: '#f1f5f9' },
    });
    charts.duaBiomesProgress.render();
  }

  // 19. 10 Website 3D Trend: Thống Kê Tương Tác & Quà Nhỏ Theo Từng Website (#chartTrendsByProject)
  if ($('chartTrendsByProject')) {
    charts.trendsByProject = new ApexCharts($('chartTrendsByProject'), {
      chart: { type: 'bar', height: 270, fontFamily: baseFont, toolbar: { show: false } },
      colors: ['#2563eb', '#ec4899'],
      plotOptions: { bar: { horizontal: false, borderRadius: 3, columnWidth: '62%' } },
      dataLabels: { enabled: false },
      series: [
        { name: 'Lượt Giải Mã Thuật Toán', data: [] },
        { name: 'Hoa Hồng Kích Cầu (1💎)', data: [] },
      ],
      xaxis: { categories: [], labels: { rotate: -30, style: { colors: '#475569', fontSize: '10px' } } },
      grid: { borderColor: '#f1f5f9' },
      legend: { position: 'top', horizontalAlign: 'right' },
    });
    charts.trendsByProject.render();
  }

  // 20. 10 Website 3D Trend: Tỷ Trọng Mẫu Format Bình Luận (#chartTrendsFormatDonut)
  if ($('chartTrendsFormatDonut')) {
    charts.trendsFormatDonut = new ApexCharts($('chartTrendsFormatDonut'), {
      chart: { type: 'donut', height: 250, fontFamily: baseFont },
      colors: ['#d97706', '#2563eb', '#ec4899', '#0d9488', '#8b5cf6', '#059669'],
      labels: ['Ngày sinh', 'Cặp đôi', 'Biển số', 'Con số', 'Họ tên', 'Tự do'],
      series: [1, 1, 1, 1, 1, 1],
      plotOptions: { pie: { donut: { size: '62%' } } },
      dataLabels: { enabled: false },
      legend: { position: 'bottom', fontSize: '11px' },
    });
    charts.trendsFormatDonut.render();
  }

  // 21. 10 Website 3D Trend: Top Người Tương Tác & Tặng Quà Nhỏ (#chartTrendsTopUsers)
  if ($('chartTrendsTopUsers')) {
    charts.trendsTopUsers = new ApexCharts($('chartTrendsTopUsers'), {
      chart: { type: 'bar', height: 250, fontFamily: baseFont, toolbar: { show: false } },
      colors: ['#ec4899'],
      plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '62%' } },
      dataLabels: { enabled: true, formatter: v => fmtNum(v) + ' điểm', style: { fontSize: '10.5px', fontWeight: 700 } },
      series: [{ name: 'Điểm tương tác', data: [] }],
      xaxis: { categories: [], labels: { style: { colors: '#475569', fontSize: '10.5px' } } },
      grid: { borderColor: '#f1f5f9' },
    });
    charts.trendsTopUsers.render();
  }
}

// ============================================================================
// INTERACTIVE STUDIO ROTARY KNOBS ENGINE (Drag, Mouse Wheel & -/+ Step Buttons)
// ============================================================================
const activeDraggingKnobs = new Set();

function formatKnobValue(val, step, unit) {
  const decimals = String(step).includes('.') ? String(step).split('.')[1].length : 0;
  return `${Number(val).toFixed(decimals)}${unit || ''}`;
}

function setKnobVisual(knobId, rawVal) {
  const dial = document.querySelector(`.rotary-dial[data-knob-id="${knobId}"]`);
  if (!dial) return;
  const min = Number(dial.dataset.min) || 0;
  const max = Number(dial.dataset.max) || 100;
  const step = Number(dial.dataset.step) || 1;
  const unit = dial.dataset.unit || '';
  const color = dial.dataset.color || '#2563eb';
  const clamped = Math.max(min, Math.min(max, Number(rawVal) || min));
  const snapped = Math.round(clamped / step) * step;
  const pct = max > min ? ((snapped - min) / (max - min)) * 100 : 0;
  const deg = -135 + (pct / 100) * 270;

  dial.dataset.value = String(snapped);
  dial.style.setProperty('--knob-pct', `${pct.toFixed(1)}%`);
  dial.style.setProperty('--knob-deg', `${deg.toFixed(1)}deg`);
  dial.style.setProperty('--knob-color', color);

  const readout = dial.querySelector('.rotary-readout');
  if (readout) {
    readout.textContent = formatKnobValue(snapped, step, unit);
  }
  return snapped;
}

function initRotaryKnobs(onKnobCommit) {
  document.querySelectorAll('.rotary-dial[data-knob-id]').forEach(dial => {
    const knobId = dial.dataset.knobId;
    setKnobVisual(knobId, dial.dataset.value);

    // 1. Vertical/Horizontal Dragging
    dial.addEventListener('pointerdown', e => {
      e.preventDefault();
      dial.setPointerCapture(e.pointerId);
      activeDraggingKnobs.add(knobId);
      const startY = e.clientY;
      const startVal = Number(dial.dataset.value) || 0;
      const min = Number(dial.dataset.min) || 0;
      const max = Number(dial.dataset.max) || 100;
      const range = max - min;

      const onMove = ev => {
        const dy = startY - ev.clientY;
        const nextVal = startVal + (dy / 110) * range;
        setKnobVisual(knobId, nextVal);
      };
      const onUp = () => {
        activeDraggingKnobs.delete(knobId);
        dial.removeEventListener('pointermove', onMove);
        dial.removeEventListener('pointerup', onUp);
        dial.removeEventListener('pointercancel', onUp);
        onKnobCommit(knobId, Number(dial.dataset.value));
      };
      dial.addEventListener('pointermove', onMove);
      dial.addEventListener('pointerup', onUp);
      dial.addEventListener('pointercancel', onUp);
    });
  });

  // 2. Fine Step Buttons (- / +) — No mouse wheel listener so page scrolling never triggers knobs!
  document.querySelectorAll('[data-knob-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      const knobId = btn.dataset.knobStep;
      const dir = Number(btn.dataset.dir) || 1;
      const dial = document.querySelector(`.rotary-dial[data-knob-id="${knobId}"]`);
      if (!dial) return;
      const step = Number(dial.dataset.step) || 1;
      const cur = Number(dial.dataset.value) || 0;
      const next = setKnobVisual(knobId, cur + dir * step);
      onKnobCommit(knobId, next);
    });
  });
}

function computeViewMetrics(state) {
  const db = state.db || {};
  const t = db.totals || {};
  const chua = state.games?.['cung-chua-online']?.data || {};
  const dua = state.games?.['cuoc-dua-ky-thu']?.data || {};
  const trendsInsights = state.trends?.insights || {};

  const realChuaActors = (chua.actors || []).filter(a => a.src !== 'mock');
  const realDuaRunners = (dua.runners || []).filter(r => r.src !== 'mock');
  const realGifts = db.realGifts || (db.recentGifts || []).filter(g => g.src !== 'mock');
  const realTopDonors = (db.realTopDonors || []).map(d => ({ name: d.name, totalDiamonds: d.realDiamonds ?? d.totalDiamonds }));

  const realTrendDiamonds = trendsInsights.totalDiamonds || 0;
  const realTrendEvents = trendsInsights.totalEvents || 0;
  const realTrendComments = trendsInsights.totalComments || 0;
  const realTrendMicroGifts = trendsInsights.totalMicroGifts || 0;

  if (!showMockData) {
    return {
      totalDiamonds: (t.realDiamonds || 0) + realTrendDiamonds,
      totalGiftsCount: (t.realGiftsCount || 0) + realTrendMicroGifts,
      giftRecordsCount: t.realGiftRecords ?? realGifts.length,
      chuaDiamonds: t.realChuaDiamonds || 0,
      duaDiamonds: t.realDuaDiamonds || 0,
      trendDiamonds: realTrendDiamonds,
      trendEvents: realTrendEvents,
      trendComments: realTrendComments,
      trendMicroGifts: realTrendMicroGifts,
      chuaNamo: chua.stats?.realNamo ?? 0,
      chuaBows: chua.stats?.bows || 0,
      chuaBowers: chua.stats?.uniqueBowers || 0,
      chuaActors: realChuaActors,
      duaDistM: dua.stats?.realWorldDistanceM || 0,
      duaLikes: dua.stats?.totalLikes || 0,
      duaChats: dua.stats?.totalChats || 0,
      duaUniqueRacers: dua.stats?.uniqueRacers || 0,
      duaRunners: realDuaRunners,
      topDonors: realTopDonors,
      topPrayers: chua.stats?.topPrayers || [],
      topRacers: dua.stats?.topRacers || [],
      gifts: realGifts,
    };
  }

  // showMockData === true: combine real + server mock + built-in sample preview if server mock is empty
  const hasServerMock = (t.mockDiamonds || 0) > 0 || (chua.stats?.demoStats?.events || 0) > 0 || (dua.stats?.demoStats?.chats || 0) > 0;
  const extraChuaDiamonds = (t.mockChuaDiamonds || 0) + (hasServerMock ? 0 : SAMPLE_PREVIEW.chuaDiamonds);
  const extraDuaDiamonds = (t.mockDuaDiamonds || 0) + (hasServerMock ? 0 : SAMPLE_PREVIEW.duaDiamonds);
  const extraTrendDiamonds = realTrendDiamonds > 0 ? 0 : SAMPLE_PREVIEW.trendDiamonds;
  const extraGiftsCount = (t.mockGiftsCount || 0) + (hasServerMock ? 0 : SAMPLE_PREVIEW.giftsCount);

  const serverAllActors = chua.actors || [];
  const serverAllRunners = dua.runners || [];
  const serverAllGifts = db.recentGifts || [];
  const serverAllDonors = db.allTopDonors || db.topDonors || [];
  const serverAllPrayers = [
    ...(chua.stats?.topPrayers || []),
    ...(chua.stats?.demoStats?.topPrayers || []),
  ];
  const serverAllRacers = dua.stats?.allTopRacers || dua.stats?.topRacers || [];

  return {
    totalDiamonds: (t.realDiamonds || 0) + extraChuaDiamonds + extraDuaDiamonds + realTrendDiamonds + extraTrendDiamonds,
    totalGiftsCount: (t.realGiftsCount || 0) + extraGiftsCount + realTrendMicroGifts + (realTrendMicroGifts > 0 ? 0 : SAMPLE_PREVIEW.trendMicroGifts),
    giftRecordsCount: serverAllGifts.length + (hasServerMock ? 0 : SAMPLE_PREVIEW.gifts.length),
    chuaDiamonds: (t.realChuaDiamonds || 0) + extraChuaDiamonds,
    duaDiamonds: (t.realDuaDiamonds || 0) + extraDuaDiamonds,
    trendDiamonds: realTrendDiamonds + extraTrendDiamonds,
    trendEvents: realTrendEvents + (realTrendEvents > 0 ? 0 : SAMPLE_PREVIEW.trendEvents),
    trendComments: realTrendComments + (realTrendComments > 0 ? 0 : SAMPLE_PREVIEW.trendComments),
    trendMicroGifts: realTrendMicroGifts + (realTrendMicroGifts > 0 ? 0 : SAMPLE_PREVIEW.trendMicroGifts),
    chuaNamo: (chua.stats?.realNamo ?? 0) + (chua.stats?.demoStats?.namo || 0) + (hasServerMock ? 0 : SAMPLE_PREVIEW.namo),
    chuaBows: (chua.stats?.bows || 0) + (chua.stats?.demoStats?.bows || 0) + (hasServerMock ? 0 : SAMPLE_PREVIEW.bows),
    chuaBowers: (chua.stats?.uniqueBowers || 0) + (chua.stats?.demoStats?.uniqueBowers || 0) + (hasServerMock ? 0 : SAMPLE_PREVIEW.bowers),
    chuaActors: serverAllActors.length ? serverAllActors : SAMPLE_PREVIEW.chuaActors,
    duaDistM: Math.max(dua.stats?.worldDistanceM || 0, hasServerMock ? 0 : SAMPLE_PREVIEW.duaDistM),
    duaLikes: (dua.stats?.totalLikes || 0) + (dua.stats?.demoStats?.likes || 0) + (hasServerMock ? 0 : SAMPLE_PREVIEW.duaLikes),
    duaChats: (dua.stats?.totalChats || 0) + (dua.stats?.demoStats?.chats || 0) + (hasServerMock ? 0 : SAMPLE_PREVIEW.duaChats),
    duaUniqueRacers: (dua.stats?.uniqueRacers || 0) + (dua.stats?.demoStats?.uniqueRacers || 0) + (hasServerMock ? 0 : SAMPLE_PREVIEW.topRacers.length),
    duaRunners: serverAllRunners.length ? serverAllRunners : SAMPLE_PREVIEW.duaRunners,
    topDonors: serverAllDonors.length ? serverAllDonors : SAMPLE_PREVIEW.topDonors,
    topPrayers: serverAllPrayers.length ? serverAllPrayers : SAMPLE_PREVIEW.topPrayers,
    topRacers: serverAllRacers.length ? serverAllRacers : SAMPLE_PREVIEW.topRacers,
    gifts: serverAllGifts.length ? serverAllGifts : SAMPLE_PREVIEW.gifts,
  };
}

function updateAllCharts(state, vm) {
  if (!charts.globalTimeline) return;
  const db = state.db || {};
  const t = db.totals || {};
  const chua = state.games?.['cung-chua-online']?.data || {};
  const dua = state.games?.['cuoc-dua-ky-thu']?.data || {};
  const nowLabel = new Date().toLocaleTimeString('vi-VN', { hour12: false });

  historySeries.labels.push(nowLabel);
  historySeries.chuaDiamonds.push(vm.chuaDiamonds);
  historySeries.duaDiamonds.push(vm.duaDiamonds);
  historySeries.trendDiamonds.push(vm.trendDiamonds || 0);
  historySeries.chuaNamo.push(vm.chuaNamo);
  historySeries.chuaActors.push(vm.chuaActors.length);
  historySeries.duaDistM.push(Math.round(vm.duaDistM || 0));
  historySeries.duaLikes.push(vm.duaLikes || 0);

  if (historySeries.labels.length > 20) {
    historySeries.labels.shift();
    historySeries.chuaDiamonds.shift();
    historySeries.duaDiamonds.shift();
    historySeries.trendDiamonds.shift();
    historySeries.chuaNamo.shift();
    historySeries.chuaActors.shift();
    historySeries.duaDistM.shift();
    historySeries.duaLikes.shift();
  }

  // 1. Global Timeline (3 Systems)
  charts.globalTimeline.updateOptions({ xaxis: { categories: [...historySeries.labels] } }, false, false);
  charts.globalTimeline.updateSeries([
    { name: 'Cúng Chùa 3D (💎)', data: [...historySeries.chuaDiamonds] },
    { name: 'Đi Bộ Xuyên Việt (💎)', data: [...historySeries.duaDiamonds] },
    { name: '10 Web 3D Trend (💎)', data: [...historySeries.trendDiamonds] },
  ], false);

  // 2. Global Share (3 Systems)
  if (charts.globalShare) {
    charts.globalShare.updateSeries([vm.chuaDiamonds, vm.duaDiamonds, vm.trendDiamonds || 0], false);
  }

  // 3. Global Top Donors
  const topDonors = (vm.topDonors || []).slice(0, 7);
  if (charts.globalTopDonors) {
    charts.globalTopDonors.updateOptions({
      xaxis: { categories: topDonors.length ? topDonors.map(d => d.name) : ['Chưa có dữ liệu'] },
    }, false, false);
    charts.globalTopDonors.updateSeries([
      { name: 'Kim cương', data: topDonors.length ? topDonors.map(d => d.totalDiamonds) : [0] },
    ], false);
  }

  // 4. Global Conversion Funnel
  if (charts.globalFunnel) {
    const wishesCount = Array.isArray(chua.wishes) && chua.wishes.length ? chua.wishes.length : 8;
    const totalCommentsAndPrayers = (vm.chuaNamo || 0) + (vm.duaChats || 0) + (vm.trendComments || 0);
    const totalInteractions = totalCommentsAndPrayers + (vm.duaLikes || 0) + (vm.chuaBows || 0) + (vm.totalGiftsCount || 0);
    const activeEntities3D = (vm.chuaActors || []).length + (vm.duaRunners || []).length + wishesCount;
    const microGiftsTotal = (vm.gifts || []).filter(g => (Number(g.totalDiamonds) || 0) <= 5).length + (vm.trendMicroGifts || 0);
    const majorGiftsTotal = (vm.gifts || []).filter(g => (Number(g.totalDiamonds) || 0) >= 10).length;
    charts.globalFunnel.updateSeries([{
      name: 'Số lượng',
      data: [totalInteractions, totalCommentsAndPrayers, activeEntities3D, microGiftsTotal, majorGiftsTotal],
    }], false);
  }

  // 5. System Balance Chart (Real Users vs Demo Users vs Target Threshold across 3 Systems)
  if (charts.systemBalance) {
    const chuaAb = chua.autoBalance || {};
    const duaAb = dua.autoBalance || {};
    const chuaReal = chuaAb.realActive ?? (chua.actors || []).filter(a => a.src !== 'mock').length;
    const chuaDemo = chuaAb.demoActive ?? (chua.actors || []).filter(a => a.src === 'mock').length;
    const chuaTarget = chuaAb.targetRealUsers || 8;
    const duaReal = duaAb.realActive ?? (dua.runners || []).filter(r => r.src !== 'mock').length;
    const duaDemo = duaAb.demoActive ?? (dua.runners || []).filter(r => r.src === 'mock').length;
    const duaTarget = duaAb.targetRealUsers || 8;
    const trendRealUsers = (state.trends?.leaderboard || []).length;

    charts.systemBalance.updateSeries([
      { name: 'Người thật', data: [chuaReal, duaReal, trendRealUsers] },
      { name: 'Mẫu bù tự động', data: [chuaDemo, duaDemo, 0] },
      { name: 'Ngưỡng đủ', data: [chuaTarget, duaTarget, 10] },
    ], false);
  }

  // 6 & 7. Gift Tier Distribution & Top Gift Items (#sub-master-gifts)
  const giftsList = vm.gifts || [];
  const tierDist = [0, 0, 0, 0];
  const giftItemMap = new Map();
  for (const g of giftsList) {
    const d = Number(g.totalDiamonds) || 1;
    const tierIdx = d >= 20 ? 3 : d >= 10 ? 2 : d >= 5 ? 1 : 0;
    tierDist[tierIdx] += Number(g.repeat) || 1;
    const label = g.giftVi || g.giftName || 'Hoa Hồng';
    giftItemMap.set(label, (giftItemMap.get(label) || 0) + d);
  }
  if ((vm.trendMicroGifts || 0) > 0) {
    tierDist[0] += vm.trendMicroGifts;
    giftItemMap.set('Hoa Hồng (10 Web Trend)', (giftItemMap.get('Hoa Hồng (10 Web Trend)') || 0) + (vm.trendDiamonds || vm.trendMicroGifts));
  }
  if (charts.giftTierDistribution) {
    const hasAnyGift = tierDist.some(v => v > 0);
    charts.giftTierDistribution.updateSeries(hasAnyGift ? tierDist : [12, 5, 3, 2], false);
  }
  if (charts.topGiftItems) {
    let sortedGiftItems = [...giftItemMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7);
    if (!sortedGiftItems.length && (db.giftCatalog || []).length) {
      sortedGiftItems = (db.giftCatalog || []).slice(0, 7).map(c => [`${c.giftVi} (Danh mục)`, c.diamonds]);
    }
    charts.topGiftItems.updateOptions({
      xaxis: { categories: sortedGiftItems.map(x => x[0]) },
    }, false, false);
    charts.topGiftItems.updateSeries([{
      name: 'Kim cương',
      data: sortedGiftItems.map(x => x[1]),
    }], false);
  }

  // 8 & 9. Work Logs By Category & Scope (#sub-master-worklogs)
  const workLogs = db.workLogs || [];
  if (charts.workLogsByCategory && workLogs.length) {
    const catCounts = new Map();
    for (const w of workLogs) {
      const cat = w.category || 'Feature';
      catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
    }
    const entries = [...catCounts.entries()];
    charts.workLogsByCategory.updateOptions({ labels: entries.map(e => e[0]) }, false, false);
    charts.workLogsByCategory.updateSeries(entries.map(e => e[1]), false);
  }
  if (charts.workLogsByScope) {
    const scopeCounts = { all: 0, 'cung-chua-online': 0, 'cuoc-dua-ky-thu': 0, 'trends-10-webs': 0 };
    for (const w of workLogs) {
      const g = w.game || 'all';
      if (scopeCounts[g] !== undefined) scopeCounts[g]++;
      else scopeCounts.all++;
    }
    charts.workLogsByScope.updateSeries([{
      name: 'Hạng mục công việc',
      data: [
        scopeCounts.all,
        scopeCounts['cung-chua-online'],
        scopeCounts['cuoc-dua-ky-thu'],
        scopeCounts['trends-10-webs'],
      ],
    }], false);
  }

  // 10. Database Collections Chart (#sub-master-mongodb)
  if (charts.databaseCollections) {
    const eventsCount = (t.totalEventRecords ?? t.realEventRecords ?? 0) + (vm.trendEvents || 0);
    const giftsRecCount = (t.totalGiftRecords ?? giftsList.length) + (vm.trendMicroGifts || 0);
    const usersCount = (t.uniqueUsers || 0) + (state.trends?.leaderboard || []).length;
    const catCount = (db.giftCatalog || []).length;
    const workCount = workLogs.length;
    const trendCustomCount = Object.keys(state.trends?.customData || {}).length || 10;
    charts.databaseCollections.updateSeries([{
      name: 'Số bản ghi',
      data: [eventsCount, giftsRecCount, usersCount, catCount, workCount, trendCustomCount],
    }], false);
  }

  // 11. Chua Timeline
  if (charts.chuaTimeline) {
    charts.chuaTimeline.updateOptions({ xaxis: { categories: [...historySeries.labels] } }, false, false);
    charts.chuaTimeline.updateSeries([
      { name: 'Tổng Niệm Nam Mô', data: [...historySeries.chuaNamo] },
      { name: 'Phật tử trong điện', data: [...historySeries.chuaActors] },
    ], false);
  }

  // 12. Chua Prayers
  if (charts.chuaPrayers) {
    const topPrayers = (vm.topPrayers || []).slice(0, 6);
    if (topPrayers.length) {
      charts.chuaPrayers.updateOptions({ labels: topPrayers.map(p => p.text) }, false, false);
      charts.chuaPrayers.updateSeries(topPrayers.map(p => p.count), false);
    } else {
      charts.chuaPrayers.updateOptions({ labels: ['Cầu Bình An', 'Cầu Sức Khỏe', 'Cầu Tài Lộc'] }, false, false);
      charts.chuaPrayers.updateSeries([1, 1, 1], false);
    }
  }

  // 13. Chua Robe Tiers & Bodhi Silk Ribbons (#chartChuaRobeAndSilk)
  if (charts.chuaRobeAndSilk) {
    const actors = vm.chuaActors || [];
    const r0 = actors.filter(a => (Number(a.tier) || 0) === 0).length;
    const r1 = actors.filter(a => Number(a.tier) === 1).length;
    const r2 = actors.filter(a => Number(a.tier) >= 2).length;
    const wishes = Array.isArray(chua.wishes) ? chua.wishes : [];
    const sRed = wishes.filter(w => !w.ribbonColor || w.ribbonColor === 'red').length;
    const sRose = wishes.filter(w => w.ribbonColor === 'rose').length;
    const sGold = wishes.filter(w => w.ribbonColor === 'gold' || (Number(w.diamonds) || 0) >= 20).length;
    charts.chuaRobeAndSilk.updateSeries([{
      name: 'Số lượng',
      data: [r0, r1, r2, sRed, sRose, sGold],
    }], false);
  }

  // 14. Chua Top Donors (#chartChuaTopDonors)
  if (charts.chuaTopDonors) {
    const chuaDonors = (chua.stats?.topDonors || []).length
      ? chua.stats.topDonors.slice(0, 7)
      : topDonors.slice(0, 7);
    charts.chuaTopDonors.updateOptions({
      xaxis: { categories: chuaDonors.length ? chuaDonors.map(d => d.name) : ['Chưa có thí chủ'] },
    }, false, false);
    charts.chuaTopDonors.updateSeries([{
      name: 'Kim cương công đức',
      data: chuaDonors.length ? chuaDonors.map(d => d.diamonds ?? d.totalDiamonds ?? 0) : [0],
    }], false);
  }

  // 15. Dua Tiers
  if (charts.duaTiers) {
    const tierCounts = [0, 0, 0, 0, 0];
    for (const r of vm.duaRunners) {
      const tr = Math.max(0, Math.min(4, Number(r.tier) || 0));
      tierCounts[tr]++;
    }
    charts.duaTiers.updateSeries(tierCounts, false);
  }

  // 16. Dua Top Racers
  if (charts.duaTopRacers) {
    const topRacers = (vm.topRacers || []).slice(0, 7);
    charts.duaTopRacers.updateOptions({
      xaxis: { categories: topRacers.length ? topRacers.map(r => r.name) : ['Chưa có tay đua'] },
    }, false, false);
    charts.duaTopRacers.updateSeries([
      { name: 'Quãng đường (m)', data: topRacers.length ? topRacers.map(r => r.distanceM) : [0] },
    ], false);
  }

  // 17. Dua Timeline (#chartDuaTimeline)
  if (charts.duaTimeline) {
    charts.duaTimeline.updateOptions({ xaxis: { categories: [...historySeries.labels] } }, false, false);
    charts.duaTimeline.updateSeries([
      { name: 'Quãng đường đoàn (m)', data: [...historySeries.duaDistM] },
      { name: 'Lượt Thả Tim tiếp sức', data: [...historySeries.duaLikes] },
    ], false);
  }

  // 18. Dua 12 Biomes Progress (#chartDuaBiomesProgress)
  if (charts.duaBiomesProgress) {
    const biomes = (dua.biomes || []).length ? dua.biomes : [
      { name: 'Hồ Gươm' }, { name: 'Sa Pa' }, { name: 'Hạ Long' }, { name: 'Ninh Bình' },
      { name: 'Huế' }, { name: 'Đà Nẵng' }, { name: 'Hội An' }, { name: 'Đà Lạt' },
      { name: 'Nha Trang' }, { name: 'Tây Nguyên' }, { name: 'Sài Gòn' }, { name: 'Miền Tây' },
    ];
    charts.duaBiomesProgress.updateOptions({
      xaxis: { categories: biomes.map((b, i) => `${i + 1}. ${b.name.split('—')[0].trim()}`) },
    }, false, false);
    charts.duaBiomesProgress.updateSeries([{
      name: 'Mốc hành trình (m)',
      data: biomes.map((_, i) => (i + 1) * 600),
    }], false);
  }
}

// ============================================================================
// STATE RENDERING & FORM HYDRATION
// ============================================================================
let chuaListsHydrated = false;
let catalogCache = [];
let workLogsCache = [];

let stayInputProtectedUntil = 0;
let pendingChuaStayMins = null;
let pendingDuaStayMins = null;

function renderWorkLogsTable() {
  const bodyEl = $('workLogsBody');
  if (!bodyEl) return;
  const catFilter = ($('workLogFilterCat')?.value || 'all').trim();
  const q = ($('workLogSearchInput')?.value || '').trim().toLowerCase();
  const filtered = workLogsCache.filter(w => {
    if (catFilter !== 'all' && w.category !== catFilter) return false;
    if (q) {
      const hay = `${w.title || ''} ${w.detail || ''} ${w.category || ''} ${w.game || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  bodyEl.innerHTML = filtered.length
    ? filtered.map(w => `
      <tr>
        <td style="color:var(--text-muted);font-size:12px;white-space:nowrap">${esc(w.time)}</td>
        <td><span class="badge brand">${esc(w.category)}</span></td>
        <td><span class="badge ${w.game === 'cuoc-dua-ky-thu' ? 'teal' : w.game === 'cung-chua-online' ? 'gold' : w.game === 'trends-10-webs' ? 'rose' : 'emerald'}">${esc(w.game)}</span></td>
        <td><strong>${esc(w.title)}</strong><div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${esc(w.detail)}</div></td>
      </tr>
    `).join('')
    : '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Không tìm thấy hạng mục công việc phù hợp với bộ lọc</td></tr>';
}

function renderAll(state) {
  lastStateCache = state;
  const db = state.db || {};
  const t = db.totals || {};
  const mongo = db.mongo || {};
  const chuaOnline = state.games?.['cung-chua-online']?.online;
  const chua = state.games?.['cung-chua-online']?.data || {};
  const duaOnline = state.games?.['cuoc-dua-ky-thu']?.online;
  const dua = state.games?.['cuoc-dua-ky-thu']?.data || {};
  const trendsOnline = Array.isArray(state.trends?.projects) && state.trends.projects.length > 0;
  const vm = computeViewMetrics(state);
  const modeNote = showMockData ? 'Gồm dữ liệu mẫu (Fake)' : 'Chỉ tính người thật';

  // Topbar Chips
  const mongoChip = $('chipMongo');
  if (mongo.connected) {
    mongoChip.className = 'status-chip ok';
    mongoChip.innerHTML = `<span class="dot-pulse"></span> MongoDB: Đã kết nối (${esc(mongo.dbName)})`;
  } else {
    mongoChip.className = 'status-chip warn';
    mongoChip.innerHTML = `<span class="dot-pulse"></span> MongoDB: Lưu cục bộ JSON`;
  }

  const tiktokChip = $('chipTiktok');
  const tkStatus = chua.stats?.sources?.tiktok || dua.stats?.status?.tiktok || 'off';
  tiktokChip.className = `status-chip ${tkStatus === 'connected' ? 'ok' : tkStatus === 'connecting' ? 'warn' : 'err'}`;
  tiktokChip.innerHTML = `<span class="dot-pulse"></span> TikTok LIVE: @${esc(state.config?.tiktokUser || 'chưa_đặt')} (${esc(tkStatus)})`;

  if (document.activeElement !== $('topTiktokInput') && state.config?.tiktokUser) {
    $('topTiktokInput').value = state.config.tiktokUser;
  }

  // Top Nav Tab Badges
  $('navBadgeChua').textContent = `${vm.chuaActors.length} lễ`;
  $('navBadgeDua').textContent = `${vm.duaRunners.length} đua`;
  $('navBadgeGifts').textContent = `${fmtNum(vm.giftRecordsCount)} quà`;

  // Tab 1: Overview KPIs (Animated Counting Numbers - 8 Cards)
  animateKpiValue('kpiRealDiamonds', vm.totalDiamonds);
  $('kpiRealGifts').textContent = `${fmtNum(vm.totalGiftsCount)} phần quà (${modeNote})`;
  animateKpiValue('kpiChuaNamo', vm.chuaNamo);
  $('kpiChuaSub').textContent = `${vm.chuaActors.length} đang quỳ · ${fmtNum(vm.chuaBows)} lạy`;
  animateKpiValue('kpiDuaDist', vm.duaDistM, ' m');
  $('kpiDuaSub').textContent = `${vm.duaRunners.length} đang chạy · ${fmtNum(vm.duaLikes)} tim`;
  animateKpiValue('kpiViewers', Math.max(chua.stats?.viewersCurrent || 0, dua.stats?.viewers || 0));
  $('kpiViewersPeak').textContent = `Đỉnh phiên: ${fmtNum(Math.max(chua.stats?.viewersPeak || 0, dua.stats?.viewersPeak || 0))}`;
  animateKpiValue('kpiChuaDiamonds', vm.chuaDiamonds);
  animateKpiValue('kpiDuaDiamonds', vm.duaDiamonds);
  if ($('kpiTrendsEvents')) {
    animateKpiValue('kpiTrendsEvents', vm.trendEvents || 0);
  }
  if ($('kpiTrendsSub')) {
    $('kpiTrendsSub').textContent = `${fmtNum(vm.trendMicroGifts || 0)} quà 1💎 · ${fmtNum(vm.trendDiamonds || 0)} 💎`;
  }
  const onlineSystemsCount = (chuaOnline ? 1 : 0) + (duaOnline ? 1 : 0) + (trendsOnline ? 1 : 0);
  if ($('kpiSystemHealth')) {
    $('kpiSystemHealth').textContent = `${onlineSystemsCount}/3 Online`;
  }
  if ($('kpiSystemSub')) {
    $('kpiSystemSub').textContent = `${fmtNum((db.workLogs || []).length)} hạng mục công việc · ${fmtNum((db.giftCatalog || []).length)} mẫu quà`;
  }
  $('kpiMongoSync').textContent = mongo.connected ? 'Cloud Active' : 'Local JSON';
  $('kpiMongoSub').textContent = mongo.lastSyncAt
    ? `Đồng bộ: ${new Date(mongo.lastSyncAt).toLocaleTimeString('vi-VN', { hour12: false })}`
    : 'Sẵn sàng lưu trữ';

  // Tab 1: Cross-System General vs Specific Summary Matrix (#systemSummaryMatrixBody)
  if ($('systemSummaryMatrixBody')) {
    const wishesLen = Array.isArray(chua.wishes) && chua.wishes.length ? chua.wishes.length : 8;
    const curBiomeName = dua.stats?.currentBiome?.name || 'Hồ Gươm — Hà Nội';
    const chestObj = dua.giftChest || { level: 1, currentDiamonds: 0, targetDiamonds: 20 };
    const topTrendFmt = state.trends?.insights?.formatBreakdown?.[0]?.label || 'Ngày sinh / Năm sinh';
    $('systemSummaryMatrixBody').innerHTML = `
      <tr>
        <td><strong>🏯 Cúng Chùa Online 3D</strong></td>
        <td><span class="badge gold">:8787 · /chua</span></td>
        <td><span class="badge ${chuaOnline ? 'emerald' : 'rose'}">${chuaOnline ? 'Online' : 'Offline'}</span></td>
        <td><strong>${fmtNum(vm.chuaActors.length)}</strong> Phật tử (${fmtNum(vm.chuaBowers)} tổng)</td>
        <td><strong>${fmtNum(vm.chuaNamo)}</strong> niệm · <strong>${fmtNum(vm.chuaBows)}</strong> lạy</td>
        <td style="font-weight:800;color:var(--gold)">💎 ${fmtNum(vm.chuaDiamonds)}</td>
        <td style="font-size:12px">🌳 Cây Bồ Đề: <strong>${fmtNum(wishesLen)} dải lụa</strong> · Theme: <strong>${esc(chua.scene?.theme || 'night')}</strong> · Giữ: <strong>${Number(chua.stayConfig?.stayMinutes) || 5}p</strong></td>
      </tr>
      <tr>
        <td><strong>🇻🇳 Đi Bộ Xuyên Việt 3D</strong></td>
        <td><span class="badge teal">:8789 · /dua</span></td>
        <td><span class="badge ${duaOnline ? 'emerald' : 'rose'}">${duaOnline ? 'Online' : 'Offline'}</span></td>
        <td><strong>${fmtNum(vm.duaRunners.length)}</strong> lữ khách (${fmtNum(vm.duaUniqueRacers)} tổng)</td>
        <td><strong>${fmtNum(Math.round(vm.duaDistM))} m</strong> · <strong>${fmtNum(vm.duaLikes)}</strong> tim</td>
        <td style="font-weight:800;color:var(--gold)">💎 ${fmtNum(vm.duaDiamonds)}</td>
        <td style="font-size:12px">📍 Địa danh: <strong>${esc(curBiomeName)}</strong> · 🎁 Rương Cấp ${chestObj.level || 1} (${chestObj.currentDiamonds ?? chestObj.progress ?? 0}/${chestObj.targetDiamonds ?? chestObj.target ?? 20}💎)</td>
      </tr>
      <tr>
        <td><strong>✨ 10 Website 3D Bắt Trend</strong></td>
        <td><span class="badge brand">:8791 · /trends/*</span></td>
        <td><span class="badge ${trendsOnline ? 'emerald' : 'rose'}">${trendsOnline ? 'Online (10 Web)' : 'Offline'}</span></td>
        <td><strong>${fmtNum((state.trends?.leaderboard || []).length)}</strong> người chơi</td>
        <td><strong>${fmtNum(vm.trendEvents || 0)}</strong> giải mã (${fmtNum(vm.trendComments || 0)} cmt)</td>
        <td style="font-weight:800;color:var(--gold)">💎 ${fmtNum(vm.trendDiamonds || 0)} (${fmtNum(vm.trendMicroGifts || 0)} 🌹)</td>
        <td style="font-size:12px">⚙️ 10 Thuật toán No-AI · Format dẫn đầu: <strong>${esc(topTrendFmt)}</strong> · Kho Data Custom: <strong>${Object.keys(state.trends?.customData || {}).length || 10} bộ</strong></td>
      </tr>
      <tr>
        <td><strong>🏛️ Admin Tổng &amp; Kho Dữ Liệu</strong></td>
        <td><span class="badge emerald">:8791 · /</span></td>
        <td><span class="badge emerald">${mongo.connected ? 'MongoDB Atlas' : 'Local JSON Active'}</span></td>
        <td><strong>${fmtNum(t.uniqueUsers || 0)}</strong> hồ sơ lưu trữ</td>
        <td><strong>${fmtNum((t.totalEventRecords ?? 0) + (vm.trendEvents || 0))}</strong> bản ghi sự kiện</td>
        <td style="font-weight:800;color:var(--gold)">💎 ${fmtNum(vm.totalDiamonds)}</td>
        <td style="font-size:12px">📋 Công việc: <strong>${fmtNum((db.workLogs || []).length)} hạng mục</strong> · Danh mục quà: <strong>${fmtNum((db.giftCatalog || []).length)} vật phẩm</strong> · Kênh: <strong>@${esc(state.config?.tiktokUser || 'chưa_đặt')}</strong></td>
      </tr>
    `;
  }

  // Tab 2: Cúng Chùa Online KPIs & Panel (Animated Counting Numbers)
  if ($('chuaKpiNamo')) {
    animateKpiValue('chuaKpiNamo', vm.chuaNamo);
    $('chuaKpiNamoSub').textContent = modeNote;
    animateKpiValue('chuaKpiBows', vm.chuaBows);
    $('chuaKpiBowersSub').textContent = `${fmtNum(vm.chuaBowers)} Phật tử (${modeNote})`;
    animateKpiValue('chuaKpiDiamonds', vm.chuaDiamonds);
    $('chuaKpiGiftsSub').textContent = modeNote;
    animateKpiValue('chuaKpiActors', vm.chuaActors.length);
    $('chuaKpiActorsSub').textContent = showMockData ? 'Gồm cả nhân vật mẫu' : 'Chỉ nhân vật người thật';
  }

  $('chuaStatusBadge').className = `badge ${chuaOnline ? 'emerald' : 'rose'}`;
  $('chuaStatusBadge').textContent = chuaOnline ? 'Chùa 3D (:8787) · Online' : 'Chùa 3D (:8787) · Offline';
  if (chua.scene) {
    if (document.activeElement !== $('chuaThemeSelect')) $('chuaThemeSelect').value = chua.scene.theme || 'night';
    $('chuaSoundCheck').checked = chua.scene.sound !== false;
    if ($('chuaReadCommentsCheck')) $('chuaReadCommentsCheck').checked = Boolean(chua.scene.readComments);
    const curTrack = chua.scene.bgmTrack || 'auto';
    if ($('chuaMusicSelect') && document.activeElement !== $('chuaMusicSelect') && curTrack !== 'next' && curTrack !== 'random') {
      $('chuaMusicSelect').value = curTrack;
    }
    if ($('chuaMusicBadge')) {
      const opt = $('chuaMusicSelect')?.querySelector(`option[value="${CSS.escape(curTrack)}"]`);
      const label = curTrack === 'next' ? '⏭️ Vừa chuyển sang bài tiếp theo'
        : curTrack === 'random' ? '🎲 Đang phát ngẫu nhiên Nhạc Lạ / Remix'
        : opt ? opt.textContent : '🔄 Tự động xoay vòng 12 bài';
      $('chuaMusicBadge').textContent = label;
    }
    document.querySelectorAll('[data-chua-music]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.chuaMusic === curTrack);
    });
  }

  const readCommentsOn = Boolean(chua.scene?.readComments || dua.scene?.readComments);
  document.querySelectorAll('[data-toggle-read-comments]').forEach(btn => {
    btn.classList.toggle('primary', readCommentsOn);
    const label = btn.querySelector('.read-comments-toggle-label');
    if (label) {
      label.textContent = readCommentsOn ? '🔊 Đọc Bình Luận: ĐANG BẬT' : '🔇 Đọc Bình Luận: ĐANG TẮT';
    }
  });

  // Update Auto-Demo status badges across all 3 tabs
  const fmtDemoRate = r => {
    const n = Number(r) || 0.2;
    return n < 1 ? `${n}/s (~${Math.round(1 / n)}s/lần Random)` : `${n}/s (Random)`;
  };
  const chuaDemoOn = Boolean(chua.demo?.on);
  const duaDemoOn = Boolean(dua.demo?.on);
  const anyDemoOn = chuaDemoOn || duaDemoOn;
  const demoText = anyDemoOn
    ? `ĐANG CHẠY (${fmtDemoRate(chua.demo?.rate || dua.demo?.rate || 0.2)})`
    : 'Đang tắt';
  for (const id of ['quickDemoStatusBadge', 'masterDemoStatusBadge']) {
    const el = $(id);
    if (el) {
      el.className = `badge ${anyDemoOn ? 'brand' : ''}`;
      el.textContent = demoText;
    }
  }
  if ($('chuaDemoBadge')) {
    $('chuaDemoBadge').className = `badge ${chuaDemoOn ? 'brand' : ''}`;
    $('chuaDemoBadge').textContent = chuaDemoOn ? `ĐANG CHẠY (${fmtDemoRate(chua.demo?.rate || 0.2)})` : 'Đang tắt';
  }
  if ($('duaDemoBadge')) {
    $('duaDemoBadge').className = `badge ${duaDemoOn ? 'brand' : ''}`;
    $('duaDemoBadge').textContent = duaDemoOn ? `ĐANG CHẠY (${fmtDemoRate(dua.demo?.rate || 0.2)})` : 'Đang tắt';
  }

  // Sync Stay Time (Minutes) inputs & badges
  const nowTs = Date.now();
  const isStayEditing = nowTs < stayInputProtectedUntil;
  const serverChuaStayMins = Number(chua.stayConfig?.stayMinutes) || Number(db.runtimeSettings?.chuaStayMinutes) || 5;
  const serverDuaStayMins = Number(dua.stayConfig?.stayMinutes) || Number(db.runtimeSettings?.duaStayMinutes) || 5;
  if (pendingChuaStayMins !== null && serverChuaStayMins === pendingChuaStayMins) pendingChuaStayMins = null;
  if (pendingDuaStayMins !== null && serverDuaStayMins === pendingDuaStayMins) pendingDuaStayMins = null;
  const chuaStayMins = (isStayEditing && pendingChuaStayMins !== null) ? pendingChuaStayMins : serverChuaStayMins;
  const duaStayMins = (isStayEditing && pendingDuaStayMins !== null) ? pendingDuaStayMins : serverDuaStayMins;
  if ($('chuaStayBadge')) {
    $('chuaStayBadge').textContent = `Đang giữ: ${chuaStayMins} phút (Áo Vàng ${Number((chuaStayMins * 2).toFixed(1))}p · Hoàng Kim ${Number((chuaStayMins * 5).toFixed(1))}p)`;
  }
  if ($('duaStayBadge')) {
    $('duaStayBadge').textContent = `Đang giữ: ${duaStayMins} phút (Quà tặng ${Number((duaStayMins * 2).toFixed(1))}p – ${Number((duaStayMins * 8).toFixed(1))}p)`;
  }
  if ($('chuaStayMinutesInput') && !isStayEditing && document.activeElement !== $('chuaStayMinutesInput')) {
    $('chuaStayMinutesInput').value = chuaStayMins;
  }
  if ($('duaStayMinutesInput') && !isStayEditing && document.activeElement !== $('duaStayMinutesInput')) {
    $('duaStayMinutesInput').value = duaStayMins;
  }
  if ($('quickStayMinutes') && !isStayEditing && document.activeElement !== $('quickStayMinutes')) {
    $('quickStayMinutes').value = chuaStayMins;
  }

  // Sync Sacred Bodhi Wish Tree 3D badge
  const chuaWishesList = Array.isArray(chua.wishes) ? chua.wishes : [];
  if ($('chuaBodhiBadge')) {
    const wishCount = chuaWishesList.length > 0 ? chuaWishesList.length : 8;
    const latestWish = chuaWishesList.length > 0 ? chuaWishesList[chuaWishesList.length - 1] : null;
    $('chuaBodhiBadge').textContent = latestWish
      ? `🧧 Đang treo: ${wishCount} dải lụa · Mới nhất: ${latestWish.name}`
      : `🧧 Đang treo: ${wishCount} dải lụa bình an`;
  }

  // Sync Reward Optimization Config across all 3 Admin tabs
  const chuaRc = chua.rewardConfig || db.runtimeSettings?.chuaRewardConfig || {
    bowMultiplier: 1,
    tier1MinDiamonds: 10,
    tier2MinDiamonds: 1000,
    wishRibbonOnChat: true,
    wishRibbonGoldMinDiamonds: 20,
    preset: 'standard',
  };
  const duaRc = dua.rewardConfig || db.runtimeSettings?.duaRewardConfig || {
    distanceMultiplier: 1,
    speedMultiplier: 1,
    chestTargetOverride: 0,
    turboLikesTarget: 300,
    preset: 'standard',
  };
  const duaChest = dua.giftChest || { progress: 0, target: 50, level: 1 };
  const activeChuaSummary = `×${Number(chuaRc.bowMultiplier || 1).toFixed(1)} lạy · Áo Vàng ${chuaRc.tier1MinDiamonds ?? 10}💎 · Hoàng Kim ${chuaRc.tier2MinDiamonds ?? 1000}💎`;
  const activeDuaSummary = `×${Number(duaRc.distanceMultiplier || 1).toFixed(1)} mét · ×${Number(duaRc.speedMultiplier || 1).toFixed(1)} tốc độ · Rương ${duaChest.currentDiamonds ?? duaChest.progress ?? 0}/${duaChest.targetDiamonds ?? duaChest.target ?? 50}💎`;
  if ($('masterChuaRewardBadge')) $('masterChuaRewardBadge').textContent = `🏯 Chùa 3D: ${activeChuaSummary}`;
  if ($('masterDuaRewardBadge')) $('masterDuaRewardBadge').textContent = `🏁 Xuyên Việt: ${activeDuaSummary}`;
  if ($('chuaRewardConfigBadge')) $('chuaRewardConfigBadge').textContent = `Đang áp dụng: ${activeChuaSummary}`;
  if ($('duaRewardConfigBadge')) $('duaRewardConfigBadge').textContent = `Đang áp dụng: ${activeDuaSummary}`;

  const activeRewardInputs = [
    'chuaRewardBowMult', 'chuaRewardGoldRibbonMin', 'chuaRewardTier1Min', 'chuaRewardTier2Min',
    'duaRewardDistMult', 'duaRewardSpeedMult', 'duaRewardChestTarget', 'duaRewardTurboLikes',
  ];
  const isEditingRewardInput = activeRewardInputs.some(id => $(id) && document.activeElement === $(id));
  if (!isEditingRewardInput) {
    if ($('chuaRewardBowMult')) $('chuaRewardBowMult').value = chuaRc.bowMultiplier ?? 1;
    if ($('chuaRewardGoldRibbonMin')) $('chuaRewardGoldRibbonMin').value = chuaRc.wishRibbonGoldMinDiamonds ?? 20;
    if ($('chuaRewardTier1Min')) $('chuaRewardTier1Min').value = chuaRc.tier1MinDiamonds ?? 10;
    if ($('chuaRewardTier2Min')) $('chuaRewardTier2Min').value = chuaRc.tier2MinDiamonds ?? 1000;
    if ($('chuaRewardWishOnChat')) $('chuaRewardWishOnChat').checked = chuaRc.wishRibbonOnChat !== false;
    if ($('duaRewardDistMult')) $('duaRewardDistMult').value = duaRc.distanceMultiplier ?? 1;
    if ($('duaRewardSpeedMult')) $('duaRewardSpeedMult').value = duaRc.speedMultiplier ?? 1;
    if ($('duaRewardChestTarget')) $('duaRewardChestTarget').value = duaRc.chestTargetOverride ?? 0;
    if ($('duaRewardTurboLikes')) $('duaRewardTurboLikes').value = duaRc.turboLikesTarget ?? 300;
  }
  document.querySelectorAll('[data-global-reward-preset]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.globalRewardPreset === (chuaRc.preset || 'standard'));
  });
  document.querySelectorAll('[data-chua-reward-preset]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.chuaRewardPreset === (chuaRc.preset || 'standard'));
  });
  document.querySelectorAll('[data-dua-reward-preset]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.duaRewardPreset === (duaRc.preset || 'standard'));
  });

  // Sync Chua Auto Random FX state
  const autoFx = chua.autoFx || { on: false, intervalSec: 25, withEmotion: true };
  if ($('chuaAutoFxBadge')) {
    $('chuaAutoFxBadge').className = `badge ${autoFx.on ? 'emerald' : ''}`;
    $('chuaAutoFxBadge').textContent = autoFx.on
      ? `ĐANG CHẠY (Mỗi ~${autoFx.intervalSec}s${autoFx.lastPreset ? ` · Vừa phát: ${autoFx.lastPreset}` : ''})`
      : 'Đang tắt';
  }
  if ($('chuaAutoFxSec') && document.activeElement !== $('chuaAutoFxSec') && autoFx.intervalSec) {
    $('chuaAutoFxSec').value = autoFx.intervalSec;
  }
  if ($('chuaAutoFxEmotion') && document.activeElement !== $('chuaAutoFxEmotion') && autoFx.withEmotion !== undefined) {
    $('chuaAutoFxEmotion').checked = Boolean(autoFx.withEmotion);
  }
  if ($('masterAutoFxSwitch')) {
    $('masterAutoFxSwitch').checked = Boolean(autoFx.on);
  }
  if ($('masterReadCommentsSwitch')) {
    $('masterReadCommentsSwitch').checked = readCommentsOn;
  }

  // Sync Soft Background Sung Vocal / Lyric Layer state & knobs
  const chuaVocalOn = chua.scene?.bgmVocal !== false;
  const duaVocalOn = dua.scene?.bgmVocal !== false;
  const chuaVocalPct = Math.round((Number(chua.scene?.bgmVocalVolume ?? 0.16) || 0.16) * 100);
  const duaVocalPct = Math.round((Number(dua.scene?.bgmVocalVolume ?? 0.15) || 0.15) * 100);
  if ($('chuaVocalToggle')) $('chuaVocalToggle').checked = chuaVocalOn;
  if ($('duaVocalToggle')) $('duaVocalToggle').checked = duaVocalOn;
  if ($('masterBgmVocalToggle')) $('masterBgmVocalToggle').checked = chuaVocalOn && duaVocalOn;

  if (!activeDraggingKnobs.has('chuaVocalVol')) setKnobVisual('chuaVocalVol', chuaVocalPct);
  if (!activeDraggingKnobs.has('duaVocalVol')) setKnobVisual('duaVocalVol', duaVocalPct);
  if (!activeDraggingKnobs.has('masterVocalVol')) setKnobVisual('masterVocalVol', chuaVocalPct);
  if (!activeDraggingKnobs.has('masterStayMins')) setKnobVisual('masterStayMins', chuaStayMins);

  // Sync Smart Auto-Balancer (Real Users vs Demo Users) & System Balance Meters
  const chuaAb = chua.autoBalance || {
    enabled: false,
    targetRealUsers: 8,
    maxDemoRate: 0.22,
    realActive: (chua.actors || []).filter(a => a.src !== 'mock').length,
    demoActive: (chua.actors || []).filter(a => a.src === 'mock').length,
    balanceScore: 100,
    reason: 'Đang kiểm tra người dùng thực tế',
  };
  const duaAb = dua.autoBalance || {
    enabled: false,
    targetRealUsers: 8,
    maxDemoRate: 0.22,
    realActive: (dua.runners || []).filter(r => r.src !== 'mock').length,
    demoActive: (dua.runners || []).filter(r => r.src === 'mock').length,
    balanceScore: 100,
    reason: 'Đang kiểm tra lữ khách thực tế',
  };

  const totalRealActive = (chuaAb.realActive || 0) + (duaAb.realActive || 0);
  const totalDemoActive = (chuaAb.demoActive || 0) + (duaAb.demoActive || 0);
  const totalTargetReal = (chuaAb.targetRealUsers || 8) + (duaAb.targetRealUsers || 8);
  const totalActivePopulation = Math.max(1, totalRealActive + totalDemoActive, totalTargetReal);
  const masterRealBarPct = Math.min(100, Math.round((totalRealActive / totalActivePopulation) * 100));
  const masterDemoBarPct = Math.min(100 - masterRealBarPct, Math.round((totalDemoActive / totalActivePopulation) * 100));
  const avgBalanceScore = Math.round(((chuaAb.balanceScore ?? 100) + (duaAb.balanceScore ?? 100)) / 2);
  const anyAutoBalanceOn = Boolean(chuaAb.enabled || duaAb.enabled);

  if ($('masterBalanceScoreBadge')) {
    $('masterBalanceScoreBadge').className = `badge ${avgBalanceScore >= 80 ? 'emerald' : avgBalanceScore >= 50 ? 'gold' : 'rose'}`;
    $('masterBalanceScoreBadge').textContent = `⚖️ Độ Cân Bằng: ${avgBalanceScore}%`;
  }
  if ($('masterAutoBalanceModeBadge')) {
    $('masterAutoBalanceModeBadge').className = `badge ${anyAutoBalanceOn ? 'brand' : ''}`;
    $('masterAutoBalanceModeBadge').textContent = anyAutoBalanceOn ? '🤖 Auto-Balance: ĐANG BẬT' : '🤖 Auto-Balance: TẮT (Thủ công)';
  }
  if ($('masterBalanceSummaryText')) {
    $('masterBalanceSummaryText').textContent = `Người thật: ${totalRealActive} · Mẫu bù: ${totalDemoActive} / Ngưỡng đủ: ${totalTargetReal}`;
  }
  if ($('masterRealActiveCount')) $('masterRealActiveCount').textContent = String(totalRealActive);
  if ($('masterDemoActiveCount')) $('masterDemoActiveCount').textContent = String(totalDemoActive);
  if ($('masterBalanceRealBar')) $('masterBalanceRealBar').style.width = `${masterRealBarPct}%`;
  if ($('masterBalanceDemoBar')) $('masterBalanceDemoBar').style.width = `${masterDemoBarPct}%`;
  if ($('masterAutoBalanceReasonText')) {
    $('masterAutoBalanceReasonText').textContent = chuaAb.reason || duaAb.reason || 'Hệ thống cân bằng ổn định';
  }
  if ($('masterAutoBalanceToggle')) $('masterAutoBalanceToggle').checked = anyAutoBalanceOn;
  if ($('chuaAutoBalanceToggle')) $('chuaAutoBalanceToggle').checked = Boolean(chuaAb.enabled);
  if ($('duaAutoBalanceToggle')) $('duaAutoBalanceToggle').checked = Boolean(duaAb.enabled);

  // Per-Game Balance Bars (Chùa 3D & Đi Bộ Xuyên Việt 3D)
  const chuaPop = Math.max(1, (chuaAb.realActive || 0) + (chuaAb.demoActive || 0), chuaAb.targetRealUsers || 8);
  const chuaRealPct = Math.min(100, Math.round(((chuaAb.realActive || 0) / chuaPop) * 100));
  const chuaDemoPct = Math.min(100 - chuaRealPct, Math.round(((chuaAb.demoActive || 0) / chuaPop) * 100));
  if ($('chuaBalanceBadge')) {
    $('chuaBalanceBadge').className = `badge ${(chuaAb.balanceScore ?? 100) >= 80 ? 'emerald' : 'gold'}`;
    $('chuaBalanceBadge').textContent = `⚖️ Cân bằng: ${chuaAb.balanceScore ?? 100}%`;
  }
  if ($('chuaBalanceDetailText')) {
    $('chuaBalanceDetailText').textContent = `Người thật: ${chuaAb.realActive || 0} / Ngưỡng đủ: ${chuaAb.targetRealUsers || 8} · Mẫu bù: ${chuaAb.demoActive || 0}`;
  }
  if ($('chuaBalanceRealBar')) $('chuaBalanceRealBar').style.width = `${chuaRealPct}%`;
  if ($('chuaBalanceDemoBar')) $('chuaBalanceDemoBar').style.width = `${chuaDemoPct}%`;

  const duaPop = Math.max(1, (duaAb.realActive || 0) + (duaAb.demoActive || 0), duaAb.targetRealUsers || 8);
  const duaRealPct = Math.min(100, Math.round(((duaAb.realActive || 0) / duaPop) * 100));
  const duaDemoPct = Math.min(100 - duaRealPct, Math.round(((duaAb.demoActive || 0) / duaPop) * 100));
  if ($('duaBalanceBadge')) {
    $('duaBalanceBadge').className = `badge ${(duaAb.balanceScore ?? 100) >= 80 ? 'emerald' : 'gold'}`;
    $('duaBalanceBadge').textContent = `⚖️ Cân bằng: ${duaAb.balanceScore ?? 100}%`;
  }
  if ($('duaBalanceDetailText')) {
    $('duaBalanceDetailText').textContent = `Người thật: ${duaAb.realActive || 0} / Ngưỡng đủ: ${duaAb.targetRealUsers || 8} · Mẫu bù: ${duaAb.demoActive || 0}`;
  }
  if ($('duaBalanceRealBar')) $('duaBalanceRealBar').style.width = `${duaRealPct}%`;
  if ($('duaBalanceDemoBar')) $('duaBalanceDemoBar').style.width = `${duaDemoPct}%`;

  // Sync Rotary Knobs for Auto-Balance & Demo Rates
  if (!activeDraggingKnobs.has('masterTargetReal')) setKnobVisual('masterTargetReal', chuaAb.targetRealUsers || 8);
  if (!activeDraggingKnobs.has('masterMaxDemoRate')) setKnobVisual('masterMaxDemoRate', chuaAb.maxDemoRate || 0.22);
  if (!activeDraggingKnobs.has('chuaTargetReal')) setKnobVisual('chuaTargetReal', chuaAb.targetRealUsers || 8);
  if (!activeDraggingKnobs.has('duaTargetReal')) setKnobVisual('duaTargetReal', duaAb.targetRealUsers || 8);
  if (!activeDraggingKnobs.has('chuaDemoRateKnob')) setKnobVisual('chuaDemoRateKnob', chua.demo?.rate || 0.15);
  if (!activeDraggingKnobs.has('chuaDemoGiftKnob')) setKnobVisual('chuaDemoGiftKnob', Math.round((chua.demo?.giftRatio ?? 0.12) * 100));
  if (!activeDraggingKnobs.has('duaDemoRateKnob')) setKnobVisual('duaDemoRateKnob', dua.demo?.rate || 0.15);
  if (!activeDraggingKnobs.has('duaDemoGiftKnob')) setKnobVisual('duaDemoGiftKnob', Math.round((dua.demo?.giftRatio ?? 0.15) * 100));

  // Hydrate Chua Lists once so we don't overwrite user edits while typing
  if (!chuaListsHydrated && chua.lists) {
    chuaListsHydrated = true;
    $('chuaCoupletsInput').value = (chua.lists.couplets || []).map(p => `${p[0]} | ${p[1]}`).join('\n');
    $('chuaTriggersInput').value = (chua.lists.triggers || []).join('\n');
    $('chuaIntentsInput').value = Object.entries(chua.lists.intents || {}).map(([k, v]) => `${k} = ${v}`).join('\n');
    $('chuaBadwordsInput').value = (chua.lists.badwords || []).join('\n');
  }

  // Chua Active Actors Table
  const chuaActors = vm.chuaActors;
  $('chuaActorsBody').innerHTML = chuaActors.length
    ? chuaActors.map(a => `
      <tr>
        <td>
          <strong>${esc(a.name)}</strong>
          ${a.src === 'mock' ? '<span class="badge gold" style="margin-left:6px">Mẫu/Fake</span>' : ''}
          <div style="font-size:11px;color:var(--text-muted)">${esc(a.id)}</div>
        </td>
        <td><span class="badge ${a.tier === 2 ? 'gold' : a.tier === 1 ? 'brand' : 'teal'}">${a.tier === 2 ? 'Hoàng Kim (Hàng đầu)' : a.tier === 1 ? 'Áo Vàng' : 'Áo Lam'}</span></td>
        <td>${esc(a.intent || 'Cầu Bình An')}</td>
        <td style="font-weight:700">${fmtNum(a.bows || 0)} lạy · 💎${fmtNum(a.diamonds || 0)}</td>
        <td>
          <div class="row-inline">
            <button class="btn sm danger" data-kick-chua="${esc(a.id)}">Mời ra</button>
            <button class="btn sm" data-block-chua="${esc(a.id)}">Chặn UID</button>
          </div>
        </td>
      </tr>
    `).join('')
    : '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Chánh điện đang trống — Đang chỉ hiển thị người dùng thật từ TikTok LIVE</td></tr>';

  // Chua Blocked UIDs
  const blockedList = chua.blocked || [];
  $('chuaBlockedBody').innerHTML = blockedList.length
    ? blockedList.map(uid => `
      <tr>
        <td style="font-family:var(--font-mono)">${esc(uid)}</td>
        <td style="text-align:right"><button class="btn sm emerald" data-unblock-chua="${esc(uid)}">Bỏ chặn</button></td>
      </tr>
    `).join('')
    : '<tr><td colspan="2" style="text-align:center;color:var(--text-muted)">Không có UID nào bị chặn</td></tr>';

  // Chua Specific Analytics KPIs & Tables (#sub-chua-analytics)
  const goldenRobesCount = chuaActors.filter(a => Number(a.tier) >= 2).length;
  const yellowRobesCount = chuaActors.filter(a => Number(a.tier) === 1).length;
  const lamRobesCount = chuaActors.filter(a => (Number(a.tier) || 0) === 0).length;
  const goldWishesCount = chuaWishesList.filter(w => w.ribbonColor === 'gold' || (Number(w.diamonds) || 0) >= 20).length;
  if ($('chuaAnalyticsWishes')) $('chuaAnalyticsWishes').textContent = `${fmtNum(chuaWishesList.length || 8)} dải lụa`;
  if ($('chuaAnalyticsWishesSub')) $('chuaAnalyticsWishesSub').textContent = `Cây Bồ Đề 3D · ${fmtNum(goldWishesCount)} lụa Hoàng Kim`;
  if ($('chuaAnalyticsGoldenRobes')) $('chuaAnalyticsGoldenRobes').textContent = `${fmtNum(goldenRobesCount)} vị`;
  if ($('chuaAnalyticsGoldenSub')) $('chuaAnalyticsGoldenSub').textContent = `Áo Vàng: ${fmtNum(yellowRobesCount)} · Áo Lam: ${fmtNum(lamRobesCount)}`;
  if ($('chuaAnalyticsDph')) $('chuaAnalyticsDph').textContent = `${fmtNum(chua.stats?.diamondsPerHour || vm.chuaDiamonds * 4)} 💎/h`;
  if ($('chuaAnalyticsDphSub')) $('chuaAnalyticsDphSub').textContent = `Đỉnh người xem: ${fmtNum(chua.stats?.viewersPeak || 0)}`;
  if ($('chuaAnalyticsFiltered')) $('chuaAnalyticsFiltered').textContent = `${fmtNum(chua.stats?.filtered || 0)} câu`;
  if ($('chuaAnalyticsBlockedSub')) $('chuaAnalyticsBlockedSub').textContent = `Đang chặn: ${fmtNum(blockedList.length)} UID`;

  if ($('chuaWishesBody')) {
    $('chuaWishesBody').innerHTML = chuaWishesList.length
      ? chuaWishesList.slice().reverse().slice(0, 15).map(w => `
          <tr>
            <td><strong>${esc(w.name)}</strong></td>
            <td>${esc(w.wish)}</td>
            <td><span class="badge ${w.ribbonColor === 'gold' ? 'gold' : w.ribbonColor === 'rose' ? 'rose' : 'brand'}">${w.ribbonColor === 'gold' ? 'Hoàng Kim' : w.ribbonColor === 'rose' ? 'Hồng Sen' : 'Lụa Đỏ'} ${w.diamonds ? `(${w.diamonds}💎)` : ''}</span></td>
          </tr>
        `).join('')
      : '<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">Cây Bồ Đề 3D đang treo 8 dải lụa mặc định</td></tr>';
  }
  if ($('chuaEventsBody')) {
    const chuaEventLog = chua.stats?.eventLog || [];
    $('chuaEventsBody').innerHTML = chuaEventLog.length
      ? chuaEventLog.slice(0, 15).map(ev => {
          const ts = ev.t ? new Date(ev.t).toLocaleTimeString('vi-VN', { hour12: false }) : '';
          return `
            <tr>
              <td style="font-size:12px;color:var(--text-muted);white-space:nowrap">${esc(ts)}</td>
              <td><strong>${esc(ev.name || 'Phật tử')}</strong></td>
              <td><span class="badge ${ev.kind === 'gift' ? 'gold' : 'teal'}">${esc(ev.kind || 'lễ')}</span> ${esc(ev.detail || '')}</td>
              <td style="font-weight:700;color:var(--gold)">${ev.diamonds ? `💎 ${fmtNum(ev.diamonds)}` : '🙏'}</td>
            </tr>
          `;
        }).join('')
      : '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Chưa có sự kiện lễ Phật mới trong phiên</td></tr>';
  }

  // Tab 3: Cuộc Đua Kỳ Thú KPIs & Panel (Animated Counting Numbers)
  if ($('duaKpiDist')) {
    animateKpiValue('duaKpiDist', vm.duaDistM, ' m');
    $('duaKpiBiomeSub').textContent = dua.stats?.currentBiome?.name || 'Vịnh Hạ Long & Phố Cổ';
    animateKpiValue('duaKpiRunners', vm.duaRunners.length);
    $('duaKpiRacersSub').textContent = `${fmtNum(vm.duaUniqueRacers)} tổng tay đua (${modeNote})`;
    animateKpiValue('duaKpiDiamonds', vm.duaDiamonds);
    $('duaKpiDiamondsSub').textContent = modeNote;
    animateKpiValue('duaKpiLikes', vm.duaLikes);
    $('duaKpiChatsSub').textContent = `${fmtNum(vm.duaChats)} bình luận (${modeNote})`;
  }

  $('duaStatusBadge').className = `badge ${duaOnline ? 'emerald' : 'rose'}`;
  $('duaStatusBadge').textContent = duaOnline ? 'Xuyên Việt (:8789) · Online' : 'Xuyên Việt (:8789) · Offline';
  if (dua.scene) {
    $('duaSoundCheck').checked = dua.scene.sound !== false;
    if ($('duaReadCommentsCheck')) $('duaReadCommentsCheck').checked = Boolean(dua.scene.readComments);
  }

  // Biome Grid (12 Vietnamese Landmarks with Region Badges)
  const biomes = dua.biomes || [];
  const forced = dua.forcedBiome || 'auto';
  const currentBiomeId = dua.stats?.currentBiome?.id || '';
  const allBiomes = [
    { id: 'auto', name: '🔄 Tự Động Xoay Vòng 12 Địa Danh', sub: 'Tự động đổi danh thắng mỗi 600m hành trình', region: 'Tự động' },
    ...biomes,
  ];
  $('duaBiomeGrid').innerHTML = allBiomes.map(b => {
    const isForced = forced === b.id;
    const isCurrentAuto = forced === 'auto' && b.id === currentBiomeId;
    return `
      <button type="button" class="biome-btn ${isForced ? 'active' : ''}" data-biome-id="${esc(b.id)}">
        ${b.region ? `<span class="badge ${isForced || isCurrentAuto ? 'teal' : ''}" style="font-size:10px;padding:2px 7px;width:fit-content;margin-bottom:2px">${esc(b.region)}${isCurrentAuto ? ' · 📍 Đang đi qua' : ''}</span>` : ''}
        <strong>${esc(b.name)}</strong>
        <span>${esc(b.sub)}</span>
      </button>
    `;
  }).join('');

  // Dua Active Runners Table
  const duaRunners = vm.duaRunners;
  $('duaRunnersBody').innerHTML = duaRunners.length
    ? duaRunners.map(r => `
      <tr>
        <td>
          <strong>${esc(r.name)}</strong>
          ${r.src === 'mock' ? '<span class="badge gold" style="margin-left:6px">Mẫu/Fake</span>' : ''}
          <div style="font-size:11px;color:var(--text-muted)">${esc(r.id)}</div>
        </td>
        <td><span class="badge ${r.tier >= 3 ? 'gold' : r.tier >= 1 ? 'teal' : 'brand'}">Tier ${r.tier} (×${Number(r.speedMult || 1).toFixed(1)})</span></td>
        <td style="font-weight:800;color:var(--teal)">${fmtNum(Math.round(r.distanceM || 0))} m</td>
        <td style="font-weight:700;color:var(--gold)">💎 ${fmtNum(r.diamonds || 0)}</td>
        <td>${esc(r.cheer || '')}</td>
        <td><button class="btn sm danger" data-kick-dua="${esc(r.id)}">Mời rời đường đua</button></td>
      </tr>
    `).join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">Đường đua đang trống — Đang chỉ hiển thị vận động viên thật từ TikTok LIVE</td></tr>';

  // Dua Specific Analytics KPIs & Recent Events (#sub-dua-analytics)
  const curBiomeObj = dua.stats?.currentBiome || { name: 'Hồ Gươm — Hà Nội', region: 'Miền Bắc', sub: 'Trái tim Thủ đô ngàn năm văn hiến' };
  const chestCur = duaChest.currentDiamonds ?? duaChest.progress ?? 0;
  const chestMax = Math.max(1, duaChest.targetDiamonds ?? duaChest.target ?? 20);
  const chestPct = duaChest.pct ?? Math.min(100, Math.round((chestCur / chestMax) * 100));
  const kingRacer = (vm.topRacers || [])[0] || duaRunners[0] || null;
  const highTierVehiclesCount = duaRunners.filter(r => (Number(r.tier) || 0) >= 2).length;
  if ($('duaAnalyticsBiome')) $('duaAnalyticsBiome').textContent = curBiomeObj.name || 'Hồ Gươm — Hà Nội';
  if ($('duaAnalyticsBiomeSub')) $('duaAnalyticsBiomeSub').textContent = `${curBiomeObj.region || 'Miền Bắc'} · ${curBiomeObj.sub || '12 cảnh quan Việt Nam'}`;
  if ($('duaAnalyticsChest')) $('duaAnalyticsChest').textContent = `Cấp ${duaChest.level || 1} (${chestPct}%)`;
  if ($('duaAnalyticsChestSub')) $('duaAnalyticsChestSub').textContent = `${fmtNum(chestCur)} / ${fmtNum(chestMax)} 💎 mở mốc tiếp theo`;
  if ($('duaAnalyticsKing')) $('duaAnalyticsKing').textContent = kingRacer ? kingRacer.name : 'Chưa có';
  if ($('duaAnalyticsKingSub')) $('duaAnalyticsKingSub').textContent = `Quãng đường xa nhất: ${fmtNum(Math.round(kingRacer?.distanceM || 0))} m`;
  if ($('duaAnalyticsTurbo')) $('duaAnalyticsTurbo').textContent = `${fmtNum(highTierVehiclesCount)} phương tiện`;
  if ($('duaAnalyticsTurboSub')) $('duaAnalyticsTurboSub').textContent = `Tổng quà: ${fmtNum(dua.stats?.totalGifts || 0)} · Đỉnh xem: ${fmtNum(dua.stats?.viewersPeak || 0)}`;

  if ($('duaEventsBody')) {
    const duaRecents = dua.recent || [];
    $('duaEventsBody').innerHTML = duaRecents.length
      ? duaRecents.slice(0, 15).map(ev => {
          const ts = ev.t ? new Date(ev.t).toLocaleTimeString('vi-VN', { hour12: false }) : '';
          return `
            <tr>
              <td style="font-size:12px;color:var(--text-muted);white-space:nowrap">${esc(ts)}</td>
              <td><strong>${esc(ev.name || 'Lữ khách')}</strong></td>
              <td>${esc(ev.text || '')}</td>
              <td><span class="badge ${Number(ev.tier) >= 3 ? 'gold' : 'teal'}">Tier ${ev.tier ?? 0}</span></td>
            </tr>
          `;
        }).join('')
      : '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Chưa có sự kiện hành trình mới trong phiên</td></tr>';
  }

  // Gift Log Table (Shared in Overview & Gifts tab)
  const gifts = vm.gifts;
  const giftRowsHtml = gifts.length
    ? gifts.slice(0, 50).map(g => `
      <tr>
        <td style="color:var(--text-muted);font-size:12px">${esc(g.time)}</td>
        <td><span class="badge ${g.game === 'cuoc-dua-ky-thu' ? 'teal' : 'gold'}">${esc(g.gameLabel)}</span></td>
        <td>
          <strong>${esc(g.name)}</strong>
          ${g.src === 'mock' ? '<span class="badge gold" style="margin-left:6px">Mẫu/Fake</span>' : ''}
        </td>
        <td><strong>${esc(g.giftVi)}</strong> <span style="color:var(--text-muted)">×${g.repeat}</span></td>
        <td style="font-weight:800;color:var(--gold)">💎 ${fmtNum(g.totalDiamonds)}</td>
        <td style="font-size:12px;color:var(--text-secondary)">${esc(g.reward)}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">Chưa có quà tặng từ người thật trong phiên Live (Bấm "Dữ Liệu Mẫu" nếu muốn xem thử thống kê mẫu)</td></tr>';
  $('overviewGiftsBody').innerHTML = giftRowsHtml;
  $('fullGiftsBody').innerHTML = giftRowsHtml;

  // Gift Catalog Table & Gift Tier KPIs (#sub-master-gifts)
  catalogCache = db.giftCatalog || [];
  renderGiftCatalogTable();
  const tier1Gifts = gifts.filter(g => (Number(g.totalDiamonds) || 1) < 5).length + (vm.trendMicroGifts || 0);
  const tier23Gifts = gifts.filter(g => {
    const d = Number(g.totalDiamonds) || 1;
    return d >= 5 && d < 20;
  }).length;
  const tier4Gifts = gifts.filter(g => (Number(g.totalDiamonds) || 1) >= 20).length;
  if ($('giftKpiTotalItems')) $('giftKpiTotalItems').textContent = `${fmtNum(catalogCache.length)} mẫu quà`;
  if ($('giftKpiTotalItemsSub')) $('giftKpiTotalItemsSub').textContent = `Đầy đủ từ Hoa Hồng 1💎 đến 1.000💎`;
  if ($('giftKpiTier1Count')) $('giftKpiTier1Count').textContent = `${fmtNum(tier1Gifts)} lượt`;
  if ($('giftKpiTier2Count')) $('giftKpiTier2Count').textContent = `${fmtNum(tier23Gifts)} lượt`;
  if ($('giftKpiTier3Count')) $('giftKpiTier3Count').textContent = `${fmtNum(tier4Gifts)} lượt`;

  // System & Work Logs KPIs & Table (#sub-master-worklogs)
  workLogsCache = db.workLogs || [];
  renderWorkLogsTable();
  if ($('workKpiTotal')) $('workKpiTotal').textContent = `${fmtNum(workLogsCache.length)} hạng mục`;
  if ($('workKpiFeatures')) {
    const featCnt = workLogsCache.filter(w => ['Feature', '3D & UI/UX'].includes(w.category)).length;
    $('workKpiFeatures').textContent = `${fmtNum(featCnt)} hạng mục`;
  }
  if ($('workKpiVoice')) {
    const voiceCnt = workLogsCache.filter(w => ['Voice & Audio', 'Analytics'].includes(w.category)).length;
    $('workKpiVoice').textContent = `${fmtNum(voiceCnt)} hạng mục`;
  }
  if ($('workKpiInfra')) {
    const infraCnt = workLogsCache.filter(w => ['Architecture', 'Database', 'Cloud'].includes(w.category)).length;
    $('workKpiInfra').textContent = `${fmtNum(infraCnt)} hạng mục`;
  }

  // System MongoDB KPIs & Collections Table (#sub-master-mongodb)
  $('sysMongoDetail').textContent = mongo.connected
    ? `Đã kết nối MongoDB Atlas (${mongo.dbName}) · URI: ${mongo.maskedUri}`
    : `Chưa kết nối Cloud (${mongo.error || 'Đang dùng logs/master-db.json'})`;
  if (document.activeElement !== $('sysMongoDbInput') && state.config?.mongoDbName) {
    $('sysMongoDbInput').value = state.config.mongoDbName;
  }
  const evRecs = (t.totalEventRecords ?? 0) + (vm.trendEvents || 0);
  const giftRecs = (t.totalGiftRecords ?? gifts.length) + (vm.trendMicroGifts || 0);
  const userRecs = (t.uniqueUsers || 0) + (state.trends?.leaderboard || []).length;
  const catRecs = catalogCache.length;
  const workRecs = workLogsCache.length;
  const customRecs = Object.keys(state.trends?.customData || {}).length || 10;
  const totalAllDbRecords = evRecs + giftRecs + userRecs + catRecs + workRecs + customRecs;

  if ($('dbKpiStatus')) $('dbKpiStatus').textContent = mongo.connected ? 'MongoDB Atlas' : 'Local JSON';
  if ($('dbKpiStatusSub')) $('dbKpiStatusSub').textContent = mongo.connected ? `Database: ${mongo.dbName}` : 'File: logs/master-db.json';
  if ($('dbKpiTotalRecords')) $('dbKpiTotalRecords').textContent = `${fmtNum(totalAllDbRecords)} bản ghi`;
  if ($('dbKpiUsersCount')) $('dbKpiUsersCount').textContent = `${fmtNum(userRecs)} người`;
  if ($('dbKpiUsersSub')) $('dbKpiUsersSub').textContent = `Chùa: ${fmtNum(vm.chuaBowers)} · Đua: ${fmtNum(vm.duaUniqueRacers)} · Trend: ${fmtNum((state.trends?.leaderboard || []).length)}`;
  if ($('dbKpiCustomDataCount')) $('dbKpiCustomDataCount').textContent = `${fmtNum(customRecs)} kho data`;

  if ($('dbCollectionsTableBody')) {
    const syncStatusBadge = mongo.connected
      ? '<span class="badge emerald">Đã đồng bộ Cloud + JSON</span>'
      : '<span class="badge gold">Lưu trữ JSON cục bộ</span>';
    $('dbCollectionsTableBody').innerHTML = `
      <tr>
        <td style="font-family:var(--font-mono);font-weight:700">events</td>
        <td>Nhật ký sự kiện tương tác Live (Lễ Phật, Bước chân, Giải mã thuật toán)</td>
        <td><strong>${fmtNum(evRecs)}</strong> bản ghi</td>
        <td>Người thật: ${fmtNum(t.realEventRecords ?? 0)} · Trend: ${fmtNum(vm.trendEvents || 0)}</td>
        <td>${syncStatusBadge}</td>
      </tr>
      <tr>
        <td style="font-family:var(--font-mono);font-weight:700">gifts</td>
        <td>Lịch sử quà tặng TikTok &amp; quy đổi phần thưởng 3D</td>
        <td><strong>${fmtNum(giftRecs)}</strong> bản ghi</td>
        <td>Tổng giá trị: 💎 ${fmtNum(vm.totalDiamonds)}</td>
        <td>${syncStatusBadge}</td>
      </tr>
      <tr>
        <td style="font-family:var(--font-mono);font-weight:700">users</td>
        <td>Hồ sơ người xem, tổng công đức, quãng đường và điểm tương tác</td>
        <td><strong>${fmtNum(userRecs)}</strong> hồ sơ</td>
        <td>Top dẫn đầu: ${esc((vm.topDonors[0]?.name) || 'Chưa có')}</td>
        <td>${syncStatusBadge}</td>
      </tr>
      <tr>
        <td style="font-family:var(--font-mono);font-weight:700">giftCatalog</td>
        <td>Danh mục bảng giá quà tặng TikTok &amp; cấu hình phần thưởng</td>
        <td><strong>${fmtNum(catRecs)}</strong> mẫu quà</td>
        <td>Tier 1–4 (Từ 1💎 Hoa Hồng đến 1.000💎)</td>
        <td>${syncStatusBadge}</td>
      </tr>
      <tr>
        <td style="font-family:var(--font-mono);font-weight:700">workLogs</td>
        <td>Lịch sử các hạng mục phát triển, nâng cấp &amp; kiểm thử hệ thống</td>
        <td><strong>${fmtNum(workRecs)}</strong> hạng mục</td>
        <td>Đầy đủ 4 phân hệ (Master, Chùa, Đua, 10 Web Trend)</td>
        <td>${syncStatusBadge}</td>
      </tr>
      <tr>
        <td style="font-family:var(--font-mono);font-weight:700">trendsCustomData</td>
        <td>Kho dữ liệu tra cứu Custom &amp; công thức định tính (No-AI) cho 10 Web</td>
        <td><strong>${fmtNum(customRecs)}</strong> bộ công thức</td>
        <td>Can Chi, Ngũ Hành, Pythagoras, Biển Số 63 Tỉnh, Kinh Dịch...</td>
        <td><span class="badge emerald">Active Memory + API</span></td>
      </tr>
    `;
  }

  updateAllCharts(state, vm);
  renderTrendsAdmin(state.trends);
  if (window.lucide) window.lucide.createIcons();
}

let trendsCache = null;
function renderTrendsAdmin(trends) {
  if (!trends || !Array.isArray(trends.projects)) return;
  trendsCache = trends;
  const projects = trends.projects;
  const insights = trends.insights || {};
  const customMap = trends.customData || {};

  if ($('navBadgeTrends')) {
    $('navBadgeTrends').textContent = `${fmtNum(insights.totalEvents || 0)} lượt`;
  }

  // Populate selects if empty
  const projSelect = $('adminTrendProjectSelect');
  if (projSelect && !projSelect.options.length) {
    projSelect.innerHTML = projects
      .map(p => `<option value="${esc(p.id)}">#${p.index}. ${esc(p.icon)} ${esc(p.name)}</option>`)
      .join('');
  }
  const customSelect = $('adminCustomProjectSelect');
  if (customSelect && !customSelect.options.length) {
    customSelect.innerHTML = projects
      .map(p => `<option value="${esc(p.id)}">#${p.index}. ${esc(p.icon)} ${esc(p.name)}</option>`)
      .join('');
    syncAdminCustomEditorFields(customSelect.value || projects[0]?.id);
  }

  // Render 10 Websites Grid
  const gridEl = $('adminTrendsCatalogGrid');
  if (gridEl) {
    gridEl.innerHTML = projects.map(p => {
      const st = p.stats || {};
      const custom = customMap[p.id] || p.defaultCustomData || {};
      const samplesHtml = (p.sampleComments || []).slice(0, 3).map(s =>
        `<button type="button" class="btn sm" data-trend-quick-sample="${esc(s)}" data-trend-proj="${esc(p.id)}" style="font-size:11px;padding:3px 8px;">💬 "${esc(s)}"</button>`
      ).join('');
      return `
        <div class="card" style="margin:0; padding:16px; border:1px solid var(--border-strong); background:linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:28px; line-height:1;">${esc(p.icon)}</span>
              <div>
                <div style="font-weight:800; font-size:15px; color:var(--text-primary);">#${p.index}. ${esc(p.name)}</div>
                <div style="font-size:12px; color:var(--text-muted);">${esc(p.tagline)}</div>
              </div>
            </div>
            <span class="badge gold">${fmtNum(st.interactions || 0)} giải mã · ${fmtNum(st.microGifts || 0)} 🌹</span>
          </div>

          <div style="font-size:12.5px; padding:10px 12px; border-radius:var(--radius-sm); background:var(--bg-subtle); border:1px solid var(--border); margin-bottom:10px; color:var(--text-primary);">
            <div><strong style="color:var(--gold);">📌 Format Comment:</strong> ${esc(p.formatPrompt)}</div>
            <div style="margin-top:4px;"><strong style="color:var(--rose);">🌹 Kích cầu 1💎:</strong> ${esc(p.microGiftPrompt)}</div>
            <div style="margin-top:4px; color:var(--text-secondary);"><strong>⚙️ Thuật toán:</strong> ${esc(custom.ruleNote || '')}</div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
            ${samplesHtml}
          </div>

          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <a href="/trends/${esc(p.slug)}" target="_blank" rel="noopener" class="btn sm primary">
              🌐 Mở Web 3D (#${p.index})
            </a>
            <a href="/trends/${esc(p.slug)}?live=1" target="_blank" rel="noopener" class="btn sm">
              📱 Chế Độ 9:16 Live
            </a>
            <button type="button" class="btn sm gold" data-trend-quick-rose="${esc(p.id)}">
              🌹 Bắn Thử 1💎 Hoa Hồng
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Insight KPIs
  if ($('trendKpiTotalEvents')) $('trendKpiTotalEvents').textContent = fmtNum(insights.totalEvents || 0);
  if ($('trendKpiComments')) $('trendKpiComments').textContent = fmtNum(insights.totalComments || 0);
  if ($('trendKpiMicroGifts')) $('trendKpiMicroGifts').textContent = `${fmtNum(insights.totalMicroGifts || 0)} 🌹`;
  if ($('trendKpiConversion')) $('trendKpiConversion').textContent = `${insights.microGiftConversionRate || 0}%`;
  if ($('trendKpiTotalDiamonds')) $('trendKpiTotalDiamonds').textContent = `Tổng: ${fmtNum(insights.totalDiamonds || 0)} 💎`;

  // Update 3 Trend ApexCharts (#chartTrendsByProject, #chartTrendsFormatDonut, #chartTrendsTopUsers)
  if (charts.trendsByProject) {
    charts.trendsByProject.updateOptions({
      xaxis: { categories: projects.map(p => `#${p.index} ${p.name.split(' ')[0]} ${p.name.split(' ')[1] || ''}`) },
    }, false, false);
    charts.trendsByProject.updateSeries([
      { name: 'Lượt Giải Mã Thuật Toán', data: projects.map(p => p.stats?.interactions || (showMockData ? (p.index * 3) : 0)) },
      { name: 'Hoa Hồng Kích Cầu (1💎)', data: projects.map(p => p.stats?.microGifts || (showMockData ? Math.max(1, p.index % 4) : 0)) },
    ], false);
  }
  const breakdown = insights.formatBreakdown || [];
  if (charts.trendsFormatDonut) {
    if (breakdown.length) {
      charts.trendsFormatDonut.updateOptions({ labels: breakdown.slice(0, 6).map(f => f.label) }, false, false);
      charts.trendsFormatDonut.updateSeries(breakdown.slice(0, 6).map(f => f.count || 1), false);
    } else {
      charts.trendsFormatDonut.updateOptions({ labels: ['Ngày sinh', 'Cặp đôi', 'Biển số', 'Con số', 'Họ tên'] }, false, false);
      charts.trendsFormatDonut.updateSeries([5, 4, 3, 3, 2], false);
    }
  }
  if (charts.trendsTopUsers) {
    const lb = (trends.leaderboard || []).slice(0, 6);
    charts.trendsTopUsers.updateOptions({
      xaxis: { categories: lb.length ? lb.map(u => u.nickname) : ['Minh Anh 2k1 (Mẫu)', 'Tuấn Kiệt 98 (Mẫu)', 'Bảo Ngọc (Mẫu)'] },
    }, false, false);
    charts.trendsTopUsers.updateSeries([{
      name: 'Điểm tương tác',
      data: lb.length ? lb.map(u => (u.interactions || 1) + (u.diamonds || 0) * 5) : [18, 12, 9],
    }], false);
  }

  // Format Breakdown Bars
  const fmtListEl = $('adminTrendFormatList');
  if (fmtListEl) {
    fmtListEl.innerHTML = breakdown.length
      ? breakdown.map(f => `
          <div>
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
              <strong>${esc(f.label)}</strong>
              <span style="color:var(--gold); font-weight:700;">${fmtNum(f.count)} lượt (${f.percent}%)</span>
            </div>
            <div style="height:8px; border-radius:999px; background:var(--bg-subtle); border:1px solid var(--border); overflow:hidden;">
              <div style="height:100%; width:${Math.max(5, f.percent)}%; background:linear-gradient(90deg, var(--gold), var(--rose)); border-radius:999px;"></div>
            </div>
          </div>
        `).join('')
      : '<div style="font-size:12px; color:var(--text-muted);">Chưa có dữ liệu phân loại format bình luận. Bấm "Bắn Thử" ở tab 10 Website để xem thống kê!</div>';
  }

  // Top Keywords
  const kwEl = $('adminTrendKeywordsList');
  if (kwEl) {
    const kws = insights.topKeywords || [];
    kwEl.innerHTML = kws.length
      ? kws.map(k => `<span class="badge brand">${esc(k.word)} <strong style="color:var(--gold);margin-left:4px;">×${k.count}</strong></span>`).join('')
      : '<span style="font-size:12px; color:var(--text-muted);">Chưa có từ khóa nổi bật</span>';
  }

  // Detailed 10-Website Performance Matrix (#adminTrendsStatsTableBody)
  if ($('adminTrendsStatsTableBody')) {
    $('adminTrendsStatsTableBody').innerHTML = projects.map(p => {
      const st = p.stats || {};
      const custom = customMap[p.id] || p.defaultCustomData || {};
      const lookupLines = String(custom.customLookupText || '')
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean).length;
      return `
        <tr>
          <td style="font-family:var(--font-mono);font-weight:700">#${p.index}</td>
          <td>
            <strong>${esc(p.icon)} ${esc(p.name)}</strong>
            <div style="font-size:11px;color:var(--text-muted)">/trends/${esc(p.slug)}</div>
          </td>
          <td style="font-size:12px">${esc(p.formatPrompt)}</td>
          <td style="font-size:12px;color:var(--text-secondary)">${esc(custom.ruleNote || '')}</td>
          <td><span class="badge teal">${fmtNum(lookupLines)} mẫu tra cứu</span></td>
          <td><strong>${fmtNum(st.interactions || 0)}</strong> lượt (${fmtNum(st.comments || 0)} cmt)</td>
          <td><span class="badge rose">🌹 ${fmtNum(st.microGifts || 0)} quà</span></td>
          <td style="font-weight:800;color:var(--gold)">💎 ${fmtNum(st.diamonds || 0)}</td>
        </tr>
      `;
    }).join('');
  }

  // Recent Algorithmic Q&A Table
  const recentBody = $('adminTrendRecentBody');
  if (recentBody) {
    const recents = insights.recentInteractions || trends.recentEvents || [];
    recentBody.innerHTML = recents.length
      ? recents.slice(0, 20).map(ev => {
          const timeStr = ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString('vi-VN') : '';
          return `
            <tr>
              <td style="font-size:12px; color:var(--text-muted); white-space:nowrap;">${esc(timeStr)}</td>
              <td><span class="badge gold">${esc(ev.projectId)}</span></td>
              <td><strong>${esc(ev.nickname)}</strong></td>
              <td>
                ${ev.isMicroGift ? `<span class="badge rose">🌹 ${esc(ev.giftName || 'Hoa Hồng')} (${ev.diamondCount}💎)</span> ` : ''}
                <span>${esc(ev.rawText || '')}</span>
              </td>
              <td><span class="badge teal">${esc(ev.formatLabel || ev.format)}</span></td>
              <td style="font-size:12px;">
                <strong style="color:var(--gold);">${esc(ev.result?.badge || ev.badge || '')}</strong> —
                ${esc(ev.result?.headline || ev.headline || '')}
              </td>
            </tr>
          `;
        }).join('')
      : '<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">Chưa có lượt giải mã bình luận nào trong phiên.</td></tr>';
  }
}

function syncAdminCustomEditorFields(projectId) {
  if (!trendsCache || !projectId) return;
  const proj = (trendsCache.projects || []).find(p => p.id === projectId);
  const custom = (trendsCache.customData || {})[projectId] || proj?.defaultCustomData || {};
  if ($('adminCustomRuleNote')) $('adminCustomRuleNote').value = custom.ruleNote || '';
  if ($('adminCustomBlessing')) $('adminCustomBlessing').value = custom.bonusBlessing || '';
  if ($('adminCustomMicroTitle')) $('adminCustomMicroTitle').value = custom.microGiftTitle || '';
  if ($('adminCustomLookupText')) $('adminCustomLookupText').value = custom.customLookupText || '';
}

function renderGiftCatalogTable() {
  const bodyEl = $('catalogBody');
  if (!bodyEl) return;
  const q = ($('giftCatalogSearch')?.value || '').trim().toLowerCase();
  const filtered = q
    ? catalogCache.filter(item =>
        String(item.giftId).includes(q) ||
        String(item.giftVi || '').toLowerCase().includes(q) ||
        String(item.giftName || '').toLowerCase().includes(q) ||
        String(item.chuaReward || '').toLowerCase().includes(q) ||
        String(item.duaReward || '').toLowerCase().includes(q)
      )
    : catalogCache;
  bodyEl.innerHTML = filtered.length
    ? filtered.map(item => `
      <tr>
        <td style="font-family:var(--font-mono);color:var(--text-muted)">#${item.giftId}</td>
        <td><strong>${esc(item.giftVi)}</strong> <span style="color:var(--text-muted)">(${esc(item.giftName)})</span></td>
        <td style="font-weight:800;color:var(--gold)">💎 ${fmtNum(item.diamonds)}</td>
        <td><span class="badge brand">Tier ${item.tier}</span></td>
        <td style="font-size:12px">${esc(item.chuaReward)}</td>
        <td style="font-size:12px">${esc(item.duaReward)}</td>
        <td>
          <div class="row-inline">
            <button class="btn sm gold" data-edit-gift="${item.giftId}">✏️ Sửa Nhanh</button>
            <button class="btn sm danger" data-del-gift="${item.giftId}">Xóa</button>
          </div>
        </td>
      </tr>
    `).join('')
    : '<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">Không tìm thấy quà tặng phù hợp với từ khóa</td></tr>';
}

async function pollState() {
  try {
    const state = await api('GET', '/api/state');
    renderAll(state);
  } catch {}
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) window.lucide.createIcons();
  initApexCharts();
  initAnimateUiInteractions();

  // Interactive Studio Rotary Knobs (Drag, Wheel, and -/+ Step Buttons)
  initRotaryKnobs(async (knobId, val) => {
    if (knobId === 'masterTargetReal') {
      await gameAction('all', '/api/auto-balance', { targetRealUsers: Math.round(val) });
      showToast(`🎯 Đã đặt ngưỡng người thật đủ = ${Math.round(val)} người (Đủ ngưỡng tự động tắt mẫu)!`);
    } else if (knobId === 'masterMaxDemoRate') {
      const rate = Number(val.toFixed(2));
      await gameAction('all', '/api/auto-balance', { maxDemoRate: rate });
      showToast(`⚡ Đã đặt tốc độ bù mẫu tối đa = ${rate}/s!`);
    } else if (knobId === 'masterVocalVol') {
      const vol = Number((val / 100).toFixed(2));
      await gameAction('all', '/api/scene', { bgmVocal: true, bgmVocalVolume: vol });
      showToast(`🎤 Đã chỉnh âm lượng nhạc có lời nhỏ nhẹ (2 Game) = ${Math.round(val)}%!`);
    } else if (knobId === 'masterStayMins') {
      const mins = Math.max(0.1, Math.min(180, Number(val)));
      stayInputProtectedUntil = Date.now() + 8000;
      pendingChuaStayMins = mins;
      pendingDuaStayMins = mins;
      if ($('chuaStayMinutesInput')) $('chuaStayMinutesInput').value = mins;
      if ($('duaStayMinutesInput')) $('duaStayMinutesInput').value = mins;
      if ($('quickStayMinutes')) $('quickStayMinutes').value = mins;
      if ($('chuaStayBadge')) {
        $('chuaStayBadge').textContent = `Đang giữ: ${mins} phút (Áo Vàng ${Number((mins * 2).toFixed(1))}p · Hoàng Kim ${Number((mins * 5).toFixed(1))}p)`;
      }
      if ($('duaStayBadge')) {
        $('duaStayBadge').textContent = `Đang giữ: ${mins} phút (Quà tặng ${Number((mins * 2).toFixed(1))}p – ${Number((mins * 8).toFixed(1))}p)`;
      }
      await gameAction('all', '/api/stay-time', { stayMinutes: mins });
      showToast(`⏳ Đã cập nhật thời gian nhân vật ở lại = ${mins} phút!`);
    } else if (knobId === 'chuaVocalVol') {
      const vol = Number((val / 100).toFixed(2));
      await gameAction('cung-chua-online', '/api/scene', { bgmVocal: true, bgmVocalVolume: vol });
      showToast(`🎤 Đã chỉnh âm lượng nhạc có lời Chùa 3D = ${Math.round(val)}%!`);
    } else if (knobId === 'duaVocalVol') {
      const vol = Number((val / 100).toFixed(2));
      await gameAction('cuoc-dua-ky-thu', '/api/scene', { bgmVocal: true, bgmVocalVolume: vol });
      showToast(`🎤 Đã chỉnh âm lượng nhạc có lời Xuyên Việt 3D = ${Math.round(val)}%!`);
    } else if (knobId === 'chuaTargetReal') {
      await gameAction('cung-chua-online', '/api/auto-balance', { targetRealUsers: Math.round(val) });
      showToast(`🎯 Ngưỡng người thật Chùa 3D = ${Math.round(val)} người!`);
    } else if (knobId === 'duaTargetReal') {
      await gameAction('cuoc-dua-ky-thu', '/api/auto-balance', { targetRealUsers: Math.round(val) });
      showToast(`🎯 Ngưỡng người thật Xuyên Việt 3D = ${Math.round(val)} người!`);
    } else if (knobId === 'chuaDemoRateKnob') {
      const rate = Number(val.toFixed(2));
      if ($('chuaDemoRate')) $('chuaDemoRate').value = rate;
      const isRunning = Boolean(lastStateCache?.games?.['cung-chua-online']?.data?.demo?.on);
      if (isRunning) {
        await gameAction('cung-chua-online', '/api/demo', { on: true, rate, giftRatio: (Number($('chuaDemoGiftPct')?.value) || 12) / 100 });
      } else {
        await gameAction('cung-chua-online', '/api/auto-balance', { maxDemoRate: rate });
      }
      showToast(`⚡ Tần suất mẫu Chùa 3D = ${rate}/s (${isRunning ? 'Đang chạy' : 'Đã lưu cấu hình'})!`);
    } else if (knobId === 'chuaDemoGiftKnob') {
      const pct = Math.round(val);
      if ($('chuaDemoGiftPct')) $('chuaDemoGiftPct').value = pct;
      const isRunning = Boolean(lastStateCache?.games?.['cung-chua-online']?.data?.demo?.on);
      if (isRunning) {
        await gameAction('cung-chua-online', '/api/demo', { on: true, rate: Number($('chuaDemoRate')?.value) || 0.15, giftRatio: pct / 100 });
      } else {
        await gameAction('cung-chua-online', '/api/auto-balance', { giftRatio: pct / 100 });
      }
      showToast(`🎁 Tỷ lệ quà mẫu Chùa 3D = ${pct}% (${isRunning ? 'Đang chạy' : 'Đã lưu cấu hình'})!`);
    } else if (knobId === 'duaDemoRateKnob') {
      const rate = Number(val.toFixed(2));
      if ($('duaDemoRate')) $('duaDemoRate').value = rate;
      const isRunning = Boolean(lastStateCache?.games?.['cuoc-dua-ky-thu']?.data?.demo?.on);
      if (isRunning) {
        await gameAction('cuoc-dua-ky-thu', '/api/demo', { on: true, rate, giftRatio: (Number($('duaDemoGiftPct')?.value) || 15) / 100 });
      } else {
        await gameAction('cuoc-dua-ky-thu', '/api/auto-balance', { maxDemoRate: rate });
      }
      showToast(`⚡ Tần suất mẫu Xuyên Việt 3D = ${rate}/s (${isRunning ? 'Đang chạy' : 'Đã lưu cấu hình'})!`);
    } else if (knobId === 'duaDemoGiftKnob') {
      const pct = Math.round(val);
      if ($('duaDemoGiftPct')) $('duaDemoGiftPct').value = pct;
      const isRunning = Boolean(lastStateCache?.games?.['cuoc-dua-ky-thu']?.data?.demo?.on);
      if (isRunning) {
        await gameAction('cuoc-dua-ky-thu', '/api/demo', { on: true, rate: Number($('duaDemoRate')?.value) || 0.15, giftRatio: pct / 100 });
      } else {
        await gameAction('cuoc-dua-ky-thu', '/api/auto-balance', { giftRatio: pct / 100 });
      }
      showToast(`🎁 Tỷ lệ quà mẫu Xuyên Việt 3D = ${pct}% (${isRunning ? 'Đang chạy' : 'Đã lưu cấu hình'})!`);
    }
    await pollState();
  });

  // Studio UI Toggle Switches for Smart Auto-Balance & Soft Sung Vocals
  $('masterAutoBalanceToggle')?.addEventListener('change', async e => {
    const enabled = Boolean(e.target.checked);
    await gameAction('all', '/api/auto-balance', { enabled });
    showToast(
      enabled
        ? '🤖 Đã BẬT thuật toán tự động cân bằng Người thật & Mẫu cho cả 2 Game!'
        : '🤖 Đã TẮT thuật toán tự động cân bằng (Chuyển về điều khiển mẫu thủ công)!'
    );
    await pollState();
  });

  $('chuaAutoBalanceToggle')?.addEventListener('change', async e => {
    const enabled = Boolean(e.target.checked);
    await gameAction('cung-chua-online', '/api/auto-balance', { enabled });
    showToast(enabled ? '🤖 Đã BẬT tự động cân bằng người thật & mẫu (Chùa 3D)!' : '🤖 Đã TẮT tự động cân bằng (Chùa 3D)!');
    await pollState();
  });

  $('duaAutoBalanceToggle')?.addEventListener('change', async e => {
    const enabled = Boolean(e.target.checked);
    await gameAction('cuoc-dua-ky-thu', '/api/auto-balance', { enabled });
    showToast(enabled ? '🤖 Đã BẬT tự động cân bằng người thật & mẫu (Xuyên Việt 3D)!' : '🤖 Đã TẮT tự động cân bằng (Xuyên Việt 3D)!');
    await pollState();
  });

  $('masterBgmVocalToggle')?.addEventListener('change', async e => {
    const bgmVocal = Boolean(e.target.checked);
    await gameAction('all', '/api/scene', { bgmVocal });
    showToast(
      bgmVocal
        ? '🎤 Đã BẬT nhạc nền có lời nhỏ nhẹ (Tự ngắt tức thì khi có giọng đọc / chuông)!'
        : '🎵 Đã chuyển sang chế độ chỉ phát nhạc cụ không lời!'
    );
    await pollState();
  });

  $('chuaVocalToggle')?.addEventListener('change', async e => {
    const bgmVocal = Boolean(e.target.checked);
    await gameAction('cung-chua-online', '/api/scene', { bgmVocal });
    showToast(bgmVocal ? '🎤 Đã BẬT nhạc có lời nhỏ nhẹ Chùa 3D!' : '🎵 Đã TẮT nhạc có lời Chùa 3D (Chỉ phát nhạc cụ)!');
    await pollState();
  });

  $('duaVocalToggle')?.addEventListener('change', async e => {
    const bgmVocal = Boolean(e.target.checked);
    await gameAction('cuoc-dua-ky-thu', '/api/scene', { bgmVocal });
    showToast(bgmVocal ? '🎤 Đã BẬT nhạc quê hương có lời nhỏ nhẹ Xuyên Việt 3D!' : '🎵 Đã TẮT nhạc có lời Xuyên Việt 3D!');
    await pollState();
  });

  $('masterReadCommentsSwitch')?.addEventListener('change', async e => {
    const readComments = Boolean(e.target.checked);
    await gameAction('all', '/api/scene', { readComments });
    showToast(readComments ? '🗣️ Đã BẬT giọng AI đọc bình luận (2 Game)!' : '🔇 Đã TẮT đọc bình luận (2 Game)!');
    await pollState();
  });

  $('masterAutoFxSwitch')?.addEventListener('change', async e => {
    const on = Boolean(e.target.checked);
    const intervalSec = Math.max(5, Math.min(600, Number($('chuaAutoFxSec')?.value) || 25));
    await gameAction('cung-chua-online', '/api/auto-fx', { on, intervalSec, withEmotion: true });
    showToast(on ? `✨ Đã BẬT tự động Random hiệu ứng Chánh Điện mỗi ~${intervalSec}s!` : '✨ Đã TẮT tự động Random hiệu ứng Chánh Điện!');
    await pollState();
  });

  // Initial route from hash (#master, #chua, #dua)
  if (window.location.hash) switchMainTab(window.location.hash, false);

  // Left Sidebar Collapse / Expand Toggle
  $('btnToggleSidebar')?.addEventListener('click', () => {
    const shell = $('adminShell');
    if (shell) {
      shell.classList.toggle('sidebar-collapsed');
      setTimeout(() => window.dispatchEvent(new Event('resize')), 240);
    }
  });

  // Level 1: Left Sidebar Main Groups (Admin Tổng / Admin Cúng Chùa / Admin Cuộc Đua Kỳ Thú)
  document.querySelectorAll('.main-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchMainTab(btn.dataset.mainTab, true));
  });

  // Level 2: Left Sidebar Tree Sub-tabs inside each Main Group
  document.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchSubTab(btn.dataset.parent, btn.dataset.sub));
  });

  // Synchronized Mock/Sample Data Filter Toggle across all 3 pages/tabs
  document.querySelectorAll('[data-toggle-mock]').forEach(btn => {
    btn.addEventListener('click', toggleMockDataMode);
  });

  // Global Toggle for Comment TTS Reading across both 3D games
  document.querySelectorAll('[data-toggle-read-comments]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const current = Boolean($('chuaReadCommentsCheck')?.checked || $('duaReadCommentsCheck')?.checked);
      const next = !current;
      await gameAction('all', '/api/scene', { readComments: next });
      showToast(
        next
          ? '🔊 Đã BẬT giọng AI đọc nội dung bình luận (Tự động lọc từ nhạy cảm)!'
          : '🔇 Đã TẮT đọc nội dung bình luận (Chỉ đọc quà tặng & chào mừng tên)!'
      );
      await pollState();
    });
  });

  // In-Page 3D Live Preview Drawer & Fullscreen 3D Screen Links (Works on both Local :8791 and Vercel Cloud!)
  const isLocalMultiPort = location.port === '8791';
  const chua3dUrl = isLocalMultiPort ? 'http://127.0.0.1:8787' : `${location.origin}/chua/`;
  const dua3dUrl = isLocalMultiPort ? 'http://127.0.0.1:8789' : `${location.origin}/dua/`;
  const trends3dUrl = `${location.origin}/trends/gieo-que?live=1`;
  if ($('linkOpenChua3D')) $('linkOpenChua3D').href = chua3dUrl;
  if ($('linkOpenDua3D')) $('linkOpenDua3D').href = dua3dUrl;
  if ($('previewUrlChuaLabel')) $('previewUrlChuaLabel').textContent = chua3dUrl;
  if ($('previewUrlDuaLabel')) $('previewUrlDuaLabel').textContent = dua3dUrl;
  if ($('previewUrlTrendsLabel')) $('previewUrlTrendsLabel').textContent = '/trends/gieo-que?live=1';

  let previewLoaded = false;
  $('btnToggle3DPreview')?.addEventListener('click', () => {
    const drawer = $('previewDrawer');
    const isOpen = drawer.classList.toggle('open');
    if (isOpen && !previewLoaded) {
      previewLoaded = true;
      if ($('iframeChua3D')) $('iframeChua3D').src = `${chua3dUrl}?preview=1`;
      if ($('iframeDua3D')) $('iframeDua3D').src = `${dua3dUrl}?preview=1`;
      if ($('iframeTrends3D')) $('iframeTrends3D').src = trends3dUrl;
    }
  });

  // 1. Global TikTok Account Switcher
  $('btnSaveTiktokGlobal').addEventListener('click', async () => {
    const user = $('topTiktokInput').value.trim().replace(/^@/, '');
    if (!user) return showToast('Vui lòng nhập @username TikTok', false);
    await api('POST', '/api/tiktok-user', { user });
    showToast(`Đã chuyển kênh TikTok toàn hệ thống sang @${user}!`);
    await pollState();
  });

  // 2. Global 1-Click Clean & Reset All Data to 0
  const handleResetAll = async () => {
    await api('POST', '/api/system/reset-all', {});
    historySeries.labels.length = 0;
    historySeries.chuaDiamonds.length = 0;
    historySeries.duaDiamonds.length = 0;
    historySeries.trendDiamonds.length = 0;
    historySeries.chuaNamo.length = 0;
    historySeries.chuaActors.length = 0;
    historySeries.duaDistM.length = 0;
    historySeries.duaLikes.length = 0;
    showToast('Đã làm sạch toàn bộ dữ liệu (MongoDB & cả 3 hệ thống) về 0! Sẵn sàng lên Live!');
    await pollState();
  };
  $('btnCleanAllTop').addEventListener('click', handleResetAll);
  $('btnCleanAllSys').addEventListener('click', handleResetAll);

  // 3. Live FX & Emotion Studio Tiles
  document.querySelectorAll('[data-fx-preset]').forEach(tile => {
    tile.addEventListener('click', async () => {
      const game = tile.dataset.fxGame || 'all';
      const preset = tile.dataset.fxPreset;
      await api('POST', '/api/fx-emotion', { game, preset });
      showToast(`Đã phát hiệu ứng & cảm xúc "${tile.querySelector('.fx-tile-title')?.textContent || preset}" lên Livestream!`);
      await pollState();
    });
  });

  // Custom FX & Emotion Broadcaster
  $('btnSendCustomEmotion').addEventListener('click', async () => {
    const game = $('customFxGame').value;
    const fxKind = $('customFxKind').value;
    const bubble = $('customFxBubble').value.trim();
    const banner = $('customFxBanner').value.trim();
    if (!bubble && !banner && !fxKind) {
      return showToast('Vui lòng nhập nội dung cảm xúc hoặc chọn hiệu ứng', false);
    }
    await api('POST', '/api/fx-emotion', {
      game,
      preset: 'custom',
      fxKind,
      bubble,
      banner,
      bows: 2,
      turbo: fxKind === 'turbo' || fxKind === 'warp',
    });
    showToast('Đã phát Sóng Cảm Xúc & Hiệu Ứng tùy chỉnh lên màn hình 3D!');
    await pollState();
  });

  // Quick Simulators in FX Studio
  document.querySelectorAll('[data-sim-game]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const game = btn.dataset.simGame;
      const action = btn.dataset.simAction;
      const name = $('simActorName').value.trim() || 'Khách Quý Live';
      await gameAction(game, '/api/test-event', { action, name, repeat: 1 });
      showToast(`Đã gửi sự kiện thử nghiệm (${action}) tới ${game}!`);
      await pollState();
    });
  });

  // Auto-Demo Character Spawner Controls (Quick Bar, Master Tab, Chua Tab, Dua Tab)
  const triggerAutoDemo = async (game, on, rate, giftPct, prayerPct = 70) => {
    const cleanRate = Math.max(0.01, Math.min(50, Number(rate) || 0.2));
    const giftRatio = Math.max(0, Math.min(0.85, (Number(giftPct) || 15) / 100));
    const prayerRatio = Math.max(0.1, Math.min(0.95, (Number(prayerPct) || 70) / 100));
    await gameAction(game, '/api/demo', { on, rate: cleanRate, giftRatio, prayerRatio });
    const rateLabel = cleanRate < 1 ? `${cleanRate}/giây (~${Math.round(1 / cleanRate)}s/lần Random)` : `${cleanRate}/giây (Random)`;
    showToast(
      on
        ? `Đã BẬT chạy nhân vật mẫu tự động (${rateLabel} · ${Math.round(giftRatio * 100)}% quà)!`
        : 'Đã TẮT chạy nhân vật mẫu tự động!'
    );
    await pollState();
  };

  $('btnQuickDemoStart')?.addEventListener('click', () =>
    triggerAutoDemo('all', true, $('quickDemoRate')?.value, $('quickDemoGiftPct')?.value, 70)
  );
  $('btnQuickDemoStop')?.addEventListener('click', () =>
    triggerAutoDemo('all', false, $('quickDemoRate')?.value, $('quickDemoGiftPct')?.value, 70)
  );

  // 1-Click Demo Speed Preset Pills
  document.querySelectorAll('.preset-pill[data-demo-rate]').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.preset-pill[data-demo-rate]').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const rate = pill.dataset.demoRate;
      const giftPct = pill.dataset.demoGift || '15';
      if ($('quickDemoRate')) $('quickDemoRate').value = rate;
      if ($('quickDemoGiftPct')) $('quickDemoGiftPct').value = giftPct;
      triggerAutoDemo('all', true, rate, giftPct, 70);
    });
  });

  // 1-Click Stay Duration Preset Pills
  document.querySelectorAll('.preset-pill[data-stay-mins]').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.preset-pill[data-stay-mins]').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const mins = pill.dataset.stayMins;
      if ($('quickStayMinutes')) $('quickStayMinutes').value = mins;
      triggerStayTime('all', mins);
    });
  });

  $('btnMasterDemoStart')?.addEventListener('click', () =>
    triggerAutoDemo('all', true, $('masterDemoRate')?.value, $('masterDemoGiftPct')?.value, $('masterDemoPrayerPct')?.value)
  );
  $('btnMasterDemoStop')?.addEventListener('click', () =>
    triggerAutoDemo('all', false, $('masterDemoRate')?.value, $('masterDemoGiftPct')?.value, $('masterDemoPrayerPct')?.value)
  );

  $('btnChuaDemoStart')?.addEventListener('click', () =>
    triggerAutoDemo('cung-chua-online', true, $('chuaDemoRate')?.value, $('chuaDemoGiftPct')?.value, $('chuaDemoPrayerPct')?.value)
  );
  $('btnChuaDemoStop')?.addEventListener('click', () =>
    triggerAutoDemo('cung-chua-online', false, $('chuaDemoRate')?.value, $('chuaDemoGiftPct')?.value, $('chuaDemoPrayerPct')?.value)
  );

  $('duaDemoStartBtn')?.addEventListener('click', () =>
    triggerAutoDemo('cuoc-dua-ky-thu', true, $('duaDemoRate')?.value, $('duaDemoGiftPct')?.value, 70)
  );
  $('duaDemoStopBtn')?.addEventListener('click', () =>
    triggerAutoDemo('cuoc-dua-ky-thu', false, $('duaDemoRate')?.value, $('duaDemoGiftPct')?.value, 70)
  );

  // Stay Duration (TTL in Minutes) Controls
  const applyOptimisticStayTime = (game, cleanMins) => {
    stayInputProtectedUntil = Date.now() + 8000;
    if (game === 'cung-chua-online' || game === 'all') {
      pendingChuaStayMins = cleanMins;
      if ($('chuaStayMinutesInput')) $('chuaStayMinutesInput').value = cleanMins;
      if ($('quickStayMinutes')) $('quickStayMinutes').value = cleanMins;
      if ($('chuaStayBadge')) {
        $('chuaStayBadge').textContent = `Đang giữ: ${cleanMins} phút (Áo Vàng ${Number((cleanMins * 2).toFixed(1))}p · Hoàng Kim ${Number((cleanMins * 5).toFixed(1))}p)`;
      }
      setKnobVisual('masterStayMins', cleanMins);
    }
    if (game === 'cuoc-dua-ky-thu' || game === 'all') {
      pendingDuaStayMins = cleanMins;
      if ($('duaStayMinutesInput')) $('duaStayMinutesInput').value = cleanMins;
      if ($('duaStayBadge')) {
        $('duaStayBadge').textContent = `Đang giữ: ${cleanMins} phút (Quà tặng ${Number((cleanMins * 2).toFixed(1))}p – ${Number((cleanMins * 8).toFixed(1))}p)`;
      }
    }
  };

  for (const [id, game] of [
    ['chuaStayMinutesInput', 'cung-chua-online'],
    ['duaStayMinutesInput', 'cuoc-dua-ky-thu'],
    ['quickStayMinutes', 'all'],
  ]) {
    const inp = $(id);
    if (!inp) continue;
    inp.addEventListener('focus', () => {
      stayInputProtectedUntil = Date.now() + 25000;
    });
    inp.addEventListener('input', () => {
      stayInputProtectedUntil = Date.now() + 25000;
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerStayTime(game, inp.value);
      }
    });
  }

  const triggerStayTime = async (game, mins) => {
    const cleanMins = Math.max(0.1, Math.min(180, Number(mins) || 5));
    applyOptimisticStayTime(game, cleanMins);
    await gameAction(game, '/api/stay-time', { stayMinutes: cleanMins });
    showToast(`Đã cập nhật thời gian người tham gia ở lại thành ${cleanMins} phút (Áp dụng ngay cho toàn bộ người đang có mặt)!`);
    await pollState();
  };

  $('btnQuickStaySave')?.addEventListener('click', () =>
    triggerStayTime('all', $('quickStayMinutes')?.value)
  );
  $('btnChuaStaySave')?.addEventListener('click', () =>
    triggerStayTime('cung-chua-online', $('chuaStayMinutesInput')?.value)
  );
  $('btnDuaStaySave')?.addEventListener('click', () =>
    triggerStayTime('cuoc-dua-ky-thu', $('duaStayMinutesInput')?.value)
  );

  // Auto Random FX Scheduler Controls (Cúng Chùa Online 3D)
  const triggerChuaAutoFx = async on => {
    const intervalSec = Math.max(5, Math.min(600, Number($('chuaAutoFxSec')?.value) || 25));
    const withEmotion = $('chuaAutoFxEmotion') ? $('chuaAutoFxEmotion').checked : true;
    await gameAction('cung-chua-online', '/api/auto-fx', { on, intervalSec, withEmotion });
    showToast(
      on
        ? `Đã BẬT tự động Random hiệu ứng Chánh Điện mỗi ~${intervalSec} giây!`
        : 'Đã TẮT tự động Random hiệu ứng Chánh Điện!'
    );
    await pollState();
  };

  $('btnChuaAutoFxStart')?.addEventListener('click', () => triggerChuaAutoFx(true));
  $('btnChuaAutoFxStop')?.addEventListener('click', () => triggerChuaAutoFx(false));
  $('btnChuaRandomFxOnce')?.addEventListener('click', async () => {
    const withEmotion = $('chuaAutoFxEmotion') ? $('chuaAutoFxEmotion').checked : true;
    await api('POST', '/api/fx-emotion', { game: 'cung-chua-online', preset: 'random', withEmotion });
    showToast('Đã phát ngẫu nhiên 1 hiệu ứng 3D lên Chánh Điện!');
    await pollState();
  });

  // 4. Game 1: Cúng Chùa Online Controls
  $('btnChuaSaveScene').addEventListener('click', async () => {
    const theme = $('chuaThemeSelect').value;
    const sound = $('chuaSoundCheck').checked;
    const readComments = Boolean($('chuaReadCommentsCheck')?.checked);
    await gameAction('cung-chua-online', '/api/scene', { theme, sound, readComments });
    showToast('Đã cập nhật không gian & âm thanh Chánh Điện 3D!');
    await pollState();
  });
  $('chuaReadCommentsCheck')?.addEventListener('change', async () => {
    const readComments = Boolean($('chuaReadCommentsCheck').checked);
    await gameAction('cung-chua-online', '/api/scene', { readComments });
    showToast(readComments ? '🔊 Đã BẬT đọc bình luận Chùa 3D!' : '🔇 Đã TẮT đọc bình luận Chùa 3D!');
    await pollState();
  });

  // Temple Music Switcher (12 Styles: Buddhist Remix, Cổ Phong, Handpan, Tibetan, Synthwave, Lofi & Zen)
  const CHUA_TRACK_MP3_MAP = {
    buddha_vinahouse_remix: '/assets/audio/tracks/adidaphat_daosu.mp3',
    dai_bi_trap_remix: '/assets/audio/tracks/chudaibi_nhanh.mp3',
    co_phong_dan_tranh_remix: '/assets/audio/tracks/cophong_suthanhhoa.mp3',
    deep_house_chanh_dien: '/assets/audio/tracks/handpan_house.mp3',
    handpan_lien_hoa: '/assets/audio/tracks/handpan_meditation.mp3',
    tay_tang_mat_tong: '/assets/audio/tracks/om_mani_padme_hum.mp3',
    cyber_zen_synthwave: '/assets/audio/tracks/handpan_agua.mp3',
    vu_dieu_hoan_hy_edm: '/assets/audio/tracks/chuyen_phap_luan.mp3',
    quan_am_lofi_chill: '/assets/audio/tracks/cophong_nunhitinh.mp3',
    duoc_su_jazz_lounge: '/assets/audio/tracks/danbau_langtoi.mp3',
    zen_singing_bowl: '/assets/audio/tracks/nhacthien_tinhlang.mp3',
    nhac_thien_ngon_gio: '/assets/audio/tracks/danbau_buoisang.mp3',
  };
  const CHUA_TRACK_IDS = Object.keys(CHUA_TRACK_MP3_MAP);
  let adminChuaTrackIdx = 2; // defaults to co_phong_dan_tranh_remix

  const playAdminChuaTrackPreview = (trackId, labelText = '') => {
    let resolvedId = trackId;
    if (trackId === 'next') {
      adminChuaTrackIdx = (adminChuaTrackIdx + 1) % CHUA_TRACK_IDS.length;
      resolvedId = CHUA_TRACK_IDS[adminChuaTrackIdx];
    } else if (trackId === 'random' || trackId === 'auto') {
      adminChuaTrackIdx = Math.floor(Math.random() * CHUA_TRACK_IDS.length);
      resolvedId = CHUA_TRACK_IDS[adminChuaTrackIdx];
    } else if (CHUA_TRACK_MP3_MAP[trackId]) {
      adminChuaTrackIdx = CHUA_TRACK_IDS.indexOf(trackId);
    }
    const mp3Url = CHUA_TRACK_MP3_MAP[resolvedId] || '/assets/audio/tracks/cophong_suthanhhoa.mp3';
    const player = $('adminChuaMusicPlayer');
    const duaPlayer = $('adminDuaMusicPlayer');
    if (duaPlayer && !duaPlayer.paused) duaPlayer.pause();
    if (player) {
      if (player.getAttribute('src') !== mp3Url) {
        player.src = mp3Url;
      }
      player.volume = 0.55;
      player.play().catch(() => {});
    }
    if ($('adminChuaNowPlayingLabel')) {
      $('adminChuaNowPlayingLabel').textContent = `🎧 Nhạc Thật Đang Phát: ${labelText || resolvedId}`;
    }
  };

  const triggerChuaMusic = async (bgmTrack, labelText = '') => {
    playAdminChuaTrackPreview(bgmTrack, labelText);
    await gameAction('cung-chua-online', '/api/scene', { bgmTrack });
    if ($('chuaMusicSelect') && bgmTrack !== 'next' && bgmTrack !== 'random') {
      $('chuaMusicSelect').value = bgmTrack;
    }
    showToast(`🎵 Đã phát & chuyển nhạc Chánh Điện sang: ${labelText || bgmTrack}!`);
    await pollState();
  };
  $('chuaMusicSelect')?.addEventListener('change', () => {
    const sel = $('chuaMusicSelect');
    const text = sel.options[sel.selectedIndex]?.textContent || sel.value;
    triggerChuaMusic(sel.value, text);
  });
  $('btnChuaNextMusic')?.addEventListener('click', () =>
    triggerChuaMusic('next', '⏭️ Bài nhạc tiếp theo trong danh sách 12 bản phối')
  );
  $('btnChuaRandomMusic')?.addEventListener('click', () =>
    triggerChuaMusic('random', '🎲 Random Nhạc Phật Remix / Nhạc Lạ')
  );
  document.querySelectorAll('[data-chua-music]').forEach(btn => {
    btn.addEventListener('click', () => {
      triggerChuaMusic(btn.dataset.chuaMusic, btn.textContent.trim());
    });
  });

  document.querySelectorAll('[data-dua-music]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mp3Url = btn.dataset.duaMusic;
      const label = btn.textContent.trim();
      const player = $('adminDuaMusicPlayer');
      const chuaPlayer = $('adminChuaMusicPlayer');
      if (chuaPlayer && !chuaPlayer.paused) chuaPlayer.pause();
      if (player && mp3Url) {
        if (player.getAttribute('src') !== mp3Url) player.src = mp3Url;
        player.volume = 0.55;
        player.play().catch(() => {});
      }
      if ($('adminDuaNowPlayingLabel')) {
        $('adminDuaNowPlayingLabel').textContent = `🎵 Nhạc Quê Hương & Đàn Bầu Thật: ${label}`;
      }
      showToast(`🎵 Đang phát nhạc quê hương: ${label}!`);
    });
  });

  $('btnChuaBanner').addEventListener('click', async () => {
    const text = $('chuaBannerInput').value.trim();
    if (!text) return showToast('Vui lòng nhập nội dung thông báo', false);
    await gameAction('cung-chua-online', '/api/banner', { text });
    $('chuaBannerInput').value = '';
    showToast('Đã phát thông báo lên màn hình Cúng Chùa Online!');
  });

  $('btnChuaBodhiSend')?.addEventListener('click', async () => {
    const name = ($('chuaBodhiNameInput')?.value || '').trim() || 'Phật Tử Thiện Tâm';
    const wish = ($('chuaBodhiWishInput')?.value || '').trim() || 'Cầu Gia Đạo Bình An · Vạn Sự Như Ý';
    const ribbonColor = $('chuaBodhiColorSelect')?.value || 'red';
    const diamonds = ribbonColor === 'gold' ? 20 : ribbonColor === 'rose' ? 5 : 0;
    await gameAction('cung-chua-online', '/api/bodhi/wish', { name, wish, ribbonColor, diamonds });
    showToast(`🧧 Đã treo dải lụa ước nguyện của "${name}" lên Cây Bồ Đề 3D!`);
    await pollState();
  });

  $('btnChuaBodhiClear')?.addEventListener('click', async () => {
    await gameAction('cung-chua-online', '/api/bodhi/clear', {});
    showToast('🌳 Đã làm mới các dải lụa trên Cây Bồ Đề Ước Nguyện 3D!');
    await pollState();
  });

  // ============================================================================
  // REWARD OPTIMIZER CONTROLS (ALL 3 ADMIN TABS)
  // ============================================================================
  const CHUA_REWARD_PRESETS = {
    standard: { bowMultiplier: 1, tier1MinDiamonds: 10, tier2MinDiamonds: 1000, wishRibbonGoldMinDiamonds: 20, wishRibbonOnChat: true, preset: 'standard' },
    happy_hour: { bowMultiplier: 2, tier1MinDiamonds: 5, tier2MinDiamonds: 15, wishRibbonGoldMinDiamonds: 10, wishRibbonOnChat: true, preset: 'happy_hour' },
    climax: { bowMultiplier: 3, tier1MinDiamonds: 3, tier2MinDiamonds: 10, wishRibbonGoldMinDiamonds: 5, wishRibbonOnChat: true, preset: 'climax' },
    festival: { bowMultiplier: 5, tier1MinDiamonds: 2, tier2MinDiamonds: 5, wishRibbonGoldMinDiamonds: 1, wishRibbonOnChat: true, preset: 'festival' },
  };
  const DUA_REWARD_PRESETS = {
    standard: { distanceMultiplier: 1, speedMultiplier: 1, chestTargetOverride: 0, turboLikesTarget: 300, preset: 'standard' },
    happy_hour: { distanceMultiplier: 2, speedMultiplier: 1.25, chestTargetOverride: 40, turboLikesTarget: 200, preset: 'happy_hour' },
    climax: { distanceMultiplier: 3, speedMultiplier: 1.5, chestTargetOverride: 25, turboLikesTarget: 120, preset: 'climax' },
    festival: { distanceMultiplier: 5, speedMultiplier: 1.8, chestTargetOverride: 15, turboLikesTarget: 80, preset: 'festival' },
  };

  const applyChuaRewardConfig = async cfg => {
    if ($('chuaRewardBowMult')) $('chuaRewardBowMult').value = cfg.bowMultiplier;
    if ($('chuaRewardGoldRibbonMin')) $('chuaRewardGoldRibbonMin').value = cfg.wishRibbonGoldMinDiamonds;
    if ($('chuaRewardTier1Min')) $('chuaRewardTier1Min').value = cfg.tier1MinDiamonds;
    if ($('chuaRewardTier2Min')) $('chuaRewardTier2Min').value = cfg.tier2MinDiamonds;
    if ($('chuaRewardWishOnChat')) $('chuaRewardWishOnChat').checked = cfg.wishRibbonOnChat !== false;
    await gameAction('cung-chua-online', '/api/reward-config', cfg);
  };

  const applyDuaRewardConfig = async cfg => {
    if ($('duaRewardDistMult')) $('duaRewardDistMult').value = cfg.distanceMultiplier;
    if ($('duaRewardSpeedMult')) $('duaRewardSpeedMult').value = cfg.speedMultiplier;
    if ($('duaRewardChestTarget')) $('duaRewardChestTarget').value = cfg.chestTargetOverride;
    if ($('duaRewardTurboLikes')) $('duaRewardTurboLikes').value = cfg.turboLikesTarget;
    await gameAction('cuoc-dua-ky-thu', '/api/reward-config', cfg);
  };

  document.querySelectorAll('[data-global-reward-preset]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.globalRewardPreset || 'standard';
      const chuaCfg = CHUA_REWARD_PRESETS[key] || CHUA_REWARD_PRESETS.standard;
      const duaCfg = DUA_REWARD_PRESETS[key] || DUA_REWARD_PRESETS.standard;
      await Promise.all([applyChuaRewardConfig(chuaCfg), applyDuaRewardConfig(duaCfg)]);
      showToast(`🎁 Đã kích hoạt gói thưởng "${btn.querySelector('.reward-preset-title')?.textContent || key}" cho cả 2 hệ thống Live!`);
      await pollState();
    });
  });

  document.querySelectorAll('[data-chua-reward-preset]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.chuaRewardPreset || 'standard';
      const chuaCfg = CHUA_REWARD_PRESETS[key] || CHUA_REWARD_PRESETS.standard;
      await applyChuaRewardConfig(chuaCfg);
      showToast(`🏯 Đã áp dụng mức thưởng Chùa 3D (${btn.textContent.trim()})!`);
      await pollState();
    });
  });

  $('btnChuaSaveRewardConfig')?.addEventListener('click', async () => {
    const cfg = {
      bowMultiplier: Math.max(0.5, Math.min(10, Number($('chuaRewardBowMult')?.value) || 1)),
      wishRibbonGoldMinDiamonds: Math.max(1, Math.min(500, Math.round(Number($('chuaRewardGoldRibbonMin')?.value) || 20))),
      tier1MinDiamonds: Math.max(1, Math.min(500, Math.round(Number($('chuaRewardTier1Min')?.value) || 10))),
      tier2MinDiamonds: Math.max(2, Math.min(5000, Math.round(Number($('chuaRewardTier2Min')?.value) || 1000))),
      wishRibbonOnChat: $('chuaRewardWishOnChat') ? Boolean($('chuaRewardWishOnChat').checked) : true,
      preset: 'custom',
    };
    await applyChuaRewardConfig(cfg);
    showToast(`🏯 Đã cập nhật cấu hình phần thưởng Chùa 3D (Nhân ×${cfg.bowMultiplier} lạy · Hoàng Kim từ ${cfg.tier2MinDiamonds}💎)!`);
    await pollState();
  });

  document.querySelectorAll('[data-dua-reward-preset]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.duaRewardPreset || 'standard';
      const duaCfg = DUA_REWARD_PRESETS[key] || DUA_REWARD_PRESETS.standard;
      await applyDuaRewardConfig(duaCfg);
      showToast(`🏁 Đã áp dụng mức thưởng Xuyên Việt 3D (${btn.textContent.trim()})!`);
      await pollState();
    });
  });

  $('btnDuaSaveRewardConfig')?.addEventListener('click', async () => {
    const cfg = {
      distanceMultiplier: Math.max(0.5, Math.min(10, Number($('duaRewardDistMult')?.value) || 1)),
      speedMultiplier: Math.max(0.5, Math.min(3, Number($('duaRewardSpeedMult')?.value) || 1)),
      chestTargetOverride: Math.max(0, Math.min(5000, Math.round(Number($('duaRewardChestTarget')?.value) || 0))),
      turboLikesTarget: Math.max(20, Math.min(5000, Math.round(Number($('duaRewardTurboLikes')?.value) || 300))),
      preset: 'custom',
    };
    await applyDuaRewardConfig(cfg);
    showToast(`🏁 Đã lưu cấu hình phần thưởng Xuyên Việt 3D (Quãng đường ×${cfg.distanceMultiplier} · Tốc độ ×${cfg.speedMultiplier})!`);
    await pollState();
  });

  $('btnDuaUnlockChestNow')?.addEventListener('click', async () => {
    await gameAction('cuoc-dua-ky-thu', '/api/chest/unlock', { actorName: 'Admin Lễ Hội' });
    showToast('🎁 Đã kích nổ Kho Báu Lễ Hội Xuyên Việt: Toàn đoàn tăng tốc ×3.0 & bắn pháo hoa!');
    await pollState();
  });

  // Quick Fill Chips for Gift Catalog Rewards
  document.querySelectorAll('[data-fill-target]').forEach(chip => {
    chip.addEventListener('click', () => {
      const targetId = chip.dataset.fillTarget;
      const val = chip.dataset.fillVal || '';
      const inp = $(targetId);
      if (inp) {
        inp.value = val;
        inp.focus();
      }
    });
  });

  $('giftCatalogSearch')?.addEventListener('input', () => {
    renderGiftCatalogTable();
  });

  // Contextual & Humanized Voice Transition Simulator (Overview Card)
  document.querySelectorAll('[data-test-narrative]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const scenario = btn.dataset.testNarrative;
      const box = $('narrativePreviewBox');
      const badge = $('narrativeScenarioBadge');
      if (scenario === 'join_to_join') {
        if (badge) badge.textContent = '🙏 Tình huống: Chào Đón ➔ Thêm Người Mới Vào Liên Tiếp';
        if (box) {
          box.innerHTML =
            '💬 <strong>[Lượt 1 - Minh Anh vào]:</strong> “Mời Phật tử Minh Anh bước vào chánh điện lễ Phật, chúc gia đình luôn bình an.”<br>' +
            '🔗 <strong>[Lượt 2 - Hoàng Nam vào ngay sau đó — Câu dẫn đệm nối tiếp]:</strong> “<em>Nối tiếp bước chân thiện lành, có thêm</em> Hoàng Nam vừa về chánh điện, cùng chắp tay cầu bình an và sức khỏe.”';
        }
        await gameAction('cung-chua-online', '/api/test-event', { action: 'join', name: 'Minh Anh' });
        setTimeout(() => {
          gameAction('cung-chua-online', '/api/test-event', { action: 'join', name: 'Hoàng Nam' });
        }, 900);
        showToast('🎙️ Đã phát thử tình huống: Chào đón nối tiếp Chào đón (kèm câu dẫn đệm)!');
      } else if (scenario === 'join_to_gift') {
        if (badge) badge.textContent = '🎁 Tình huống: Đang Chào Đón ➔ Có Người Tặng Quà Xen Ngang';
        if (box) {
          box.innerHTML =
            '💬 <strong>[Đang chào đón Bảo Ngọc]:</strong> “Hoài My xin chào đón Bảo Ngọc vừa gia nhập đoàn đi bộ xuyên Việt nhé.”<br>' +
            '🔗 <strong>[Tuấn Kiệt tặng Hoa Rosa 10💎 xen ngang — Câu chuyển mạch]:</strong> “<em>Giữa lúc đoàn đang rộn ràng đón bạn mới,</em> Tuấn Kiệt vừa gửi tặng Hoa Rosa, lên ngay Xe Cub Phượt và cộng thêm 350 mét!”';
        }
        await gameAction('cuoc-dua-ky-thu', '/api/test-event', { action: 'join', name: 'Bảo Ngọc' });
        setTimeout(() => {
          gameAction('cuoc-dua-ky-thu', '/api/test-event', { action: 'gift10', name: 'Tuấn Kiệt', repeat: 1 });
        }, 900);
        showToast('🎙️ Đã phát thử tình huống: Đang chào đón ➔ Có người tặng quà xen ngang!');
      } else if (scenario === 'story_gift_story') {
        if (badge) badge.textContent = '🇻🇳 Tình huống: Đang Kể Chuyện ➔ Tặng Quà ➔ Nối Lại Câu Chuyện';
        if (box) {
          box.innerHTML =
            '💬 <strong>[Đang kể chuyện vùng miền]:</strong> “Đoàn mình đang đi giữa đèo Mã Pí Lèng...”<br>' +
            '🎁 <strong>[Khánh Linh tặng Bánh Vòng 30💎]:</strong> “<em>Tạm gác câu chuyện trên đường một chút,</em> cảm ơn Khánh Linh vừa tiếp sức Bánh Vòng, bứt phá 1.500 mét!”<br>' +
            '🔗 <strong>[Tự động nối lại mạch truyện]:</strong> “<em>Cảm ơn món quà vừa rồi, giờ mình quay lại câu chuyện trên đường nhé.</em> Nhìn xuống dòng Nho Quế xanh ngắt dưới chân đèo mới thấy đất nước mình đẹp biết bao.”';
        }
        await gameAction('cuoc-dua-ky-thu', '/api/test-event', { action: 'gift30', name: 'Khánh Linh', repeat: 1 });
        showToast('🎙️ Đã phát thử tình huống: Tặng quà giữa mạch kể chuyện ➔ Tự động nối lại câu chuyện!');
      } else if (scenario === 'bodhi_silk') {
        if (badge) badge.textContent = '🌳 Tình huống: Dâng Lễ ➔ Treo Dải Lụa Hoàng Kim Cây Bồ Đề';
        if (box) {
          box.innerHTML =
            '💬 <strong>[Thiện Tâm dâng Hoa Rosa 10💎]:</strong> “Vừa đón người mới xong thì niềm vui lại nối tiếp, cảm tạ thí chủ Thiện Tâm đã thành tâm gửi tặng Hoa Rosa, khoác pháp phục Áo Tràng Vàng trang nghiêm.”<br>' +
            '🌳 <strong>[Dải lụa bay lên Cây Bồ Đề]:</strong> “<em>Nối tiếp phước lành vừa gieo,</em> một dải lụa đỏ mang tên Thiện Tâm vừa bay lên cành Bồ Đề cổ thụ, gửi gắm ước nguyện Gia Đạo Bình An.”';
        }
        await gameAction('cung-chua-online', '/api/test-event', { action: 'gift10', name: 'Thiện Tâm', repeat: 1 });
        showToast('🌳 Đã phát thử tình huống: Dâng lễ & Treo dải lụa ước nguyện lên Cây Bồ Đề!');
      }
      await pollState();
    });
  });

  $('btnChuaSaveLists').addEventListener('click', async () => {
    const couplets = $('chuaCoupletsInput').value.split('\n').map(l => l.trim()).filter(Boolean).map(l => l.split('|').map(s => s.trim()));
    const triggers = $('chuaTriggersInput').value.split('\n').map(l => l.trim()).filter(Boolean);
    const badwords = $('chuaBadwordsInput').value.split('\n').map(l => l.trim()).filter(Boolean);
    const intents = {};
    for (const line of $('chuaIntentsInput').value.split('\n').map(l => l.trim()).filter(Boolean)) {
      const [k, ...rest] = line.split('=');
      if (k && rest.length) intents[k.trim()] = rest.join('=').trim();
    }
    await gameAction('cung-chua-online', '/api/lists', { couplets, triggers, intents, badwords }, 'PUT');
    showToast('Đã lưu Câu Đối, Từ Khóa Lễ Phật & Bộ Lọc Từ Cấm!');
    await pollState();
  });

  $('btnChuaAddBlock').addEventListener('click', async () => {
    const uid = $('chuaBlockUidInput').value.trim();
    if (!uid) return;
    await gameAction('cung-chua-online', '/api/block', { uid });
    $('chuaBlockUidInput').value = '';
    showToast(`Đã chặn UID: ${uid}`);
    await pollState();
  });

  $('chuaActorsBody').addEventListener('click', async e => {
    const kickBtn = e.target.closest('[data-kick-chua]');
    if (kickBtn) {
      await gameAction('cung-chua-online', '/api/kick', { uid: kickBtn.dataset.kickChua });
      showToast('Đã mời Phật tử rời khỏi chánh điện!');
      await pollState();
    }
    const blockBtn = e.target.closest('[data-block-chua]');
    if (blockBtn) {
      await gameAction('cung-chua-online', '/api/block', { uid: blockBtn.dataset.blockChua });
      showToast('Đã chặn UID vĩnh viễn!');
      await pollState();
    }
  });

  $('chuaBlockedBody').addEventListener('click', async e => {
    const btn = e.target.closest('[data-unblock-chua]');
    if (!btn) return;
    const uid = btn.dataset.unblockChua;
    await gameAction('cung-chua-online', `/api/block/${encodeURIComponent(uid)}`, {}, 'DELETE');
    showToast(`Đã bỏ chặn UID: ${uid}`);
    await pollState();
  });

  // 5. Game 2: Cuộc Đua Kỳ Thú Controls
  $('duaBiomeGrid').addEventListener('click', async e => {
    const btn = e.target.closest('[data-biome-id]');
    if (!btn) return;
    const biome = btn.dataset.biomeId;
    await gameAction('cuoc-dua-ky-thu', '/api/biome', { biome });
    showToast(`Đã chuyển địa điểm đường đua sang: ${biome}`);
    await pollState();
  });

  $('duaSoundCheck').addEventListener('change', async () => {
    await gameAction('cuoc-dua-ky-thu', '/api/scene', { sound: $('duaSoundCheck').checked });
    showToast('Đã cập nhật âm thanh & giọng đọc chào mừng Cuộc Đua Kỳ Thú!');
  });
  $('duaReadCommentsCheck')?.addEventListener('change', async () => {
    const readComments = Boolean($('duaReadCommentsCheck').checked);
    await gameAction('cuoc-dua-ky-thu', '/api/scene', { readComments });
    showToast(readComments ? '🔊 Đã BẬT đọc bình luận Cuộc Đua Kỳ Thú!' : '🔇 Đã TẮT đọc bình luận Cuộc Đua Kỳ Thú!');
    await pollState();
  });

  $('btnDuaBanner').addEventListener('click', async () => {
    const text = $('duaBannerInput').value.trim();
    if (!text) return showToast('Vui lòng nhập nội dung thông báo đường đua', false);
    await gameAction('cuoc-dua-ky-thu', '/api/banner', { text });
    $('duaBannerInput').value = '';
    showToast('Đã phát thông báo lên màn hình Cuộc Đua Kỳ Thú!');
  });

  $('duaRunnersBody').addEventListener('click', async e => {
    const btn = e.target.closest('[data-kick-dua]');
    if (!btn) return;
    await gameAction('cuoc-dua-ky-thu', '/api/kick', { uid: btn.dataset.kickDua });
    showToast('Đã mời vận động viên rời đường đua!');
    await pollState();
  });

  // 6. Gift Catalog CRUD
  $('btnSaveGiftCatalog').addEventListener('click', async () => {
    const giftId = Number($('catGiftId').value) || 0;
    const giftName = $('catGiftName').value.trim();
    const giftVi = $('catGiftVi').value.trim();
    const diamonds = Number($('catDiamonds').value) || 1;
    const chuaReward = $('catChuaReward').value.trim();
    const duaReward = $('catDuaReward').value.trim();
    if (!giftName) return showToast('Vui lòng nhập tên tiếng Anh của quà TikTok (VD: Rose)', false);
    await api('POST', '/api/gift-catalog', { giftId, giftName, giftVi, diamonds, chuaReward, duaReward });
    showToast(`Đã lưu cấu hình quà "${giftVi || giftName}"!`);
    $('catGiftId').value = '';
    $('catGiftName').value = '';
    $('catGiftVi').value = '';
    $('catDiamonds').value = '';
    await pollState();
  });

  $('catalogBody').addEventListener('click', async e => {
    const editBtn = e.target.closest('[data-edit-gift]');
    if (editBtn) {
      const id = Number(editBtn.dataset.editGift);
      const item = catalogCache.find(x => x.giftId === id);
      if (item) {
        $('catGiftId').value = item.giftId;
        $('catGiftName').value = item.giftName;
        $('catGiftVi').value = item.giftVi;
        $('catDiamonds').value = item.diamonds;
        $('catChuaReward').value = item.chuaReward;
        $('catDuaReward').value = item.duaReward;
        $('catChuaReward')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        $('catChuaReward')?.focus();
        showToast(`✏️ Đã nạp quà "${item.giftVi}" (#${item.giftId}) lên khung chỉnh sửa nhanh!`);
      }
      return;
    }
    const delBtn = e.target.closest('[data-del-gift]');
    if (delBtn) {
      const id = Number(delBtn.dataset.delGift);
      await api('DELETE', `/api/gift-catalog/${id}`);
      showToast(`Đã xóa quà #${id} khỏi danh mục`);
      await pollState();
    }
  });

  // 7. System MongoDB & Work Logs
  $('btnSaveMongo').addEventListener('click', async () => {
    const uri = $('sysMongoUriInput').value.trim();
    const dbName = $('sysMongoDbInput').value.trim() || 'live_tiktok';
    const res = await api('POST', '/api/mongodb', { uri, dbName });
    if (res.mongo?.connected) showToast(`Đã kết nối MongoDB Atlas (${res.mongo.dbName}) thành công!`);
    else showToast(res.mongo?.error ? `Lỗi kết nối: ${res.mongo.error}` : 'Đang sử dụng JSON cục bộ', !res.mongo?.error);
    await pollState();
  });

  $('btnAddWorkLog').addEventListener('click', async () => {
    const title = $('workTitleInput').value.trim();
    const detail = $('workDetailInput').value.trim();
    const category = $('workCatSelect').value;
    const game = $('workGameSelect').value;
    if (!title) return showToast('Vui lòng nhập tiêu đề công việc', false);
    await api('POST', '/api/work-log', { title, detail, category, game });
    $('workTitleInput').value = '';
    $('workDetailInput').value = '';
    showToast('Đã lưu mục lịch sử công việc vào MongoDB!');
    await pollState();
  });

  $('workLogFilterCat')?.addEventListener('change', () => {
    renderWorkLogsTable();
  });
  $('workLogSearchInput')?.addEventListener('input', () => {
    renderWorkLogsTable();
  });

  // 8. 10 Website 3D Trend & Thuật Toán (No-AI) Controls
  const triggerAdminTrendInteract = async (projectId, text, isRose1 = false) => {
    const nickname = ($('adminTrendNickname')?.value || 'Minh Anh 2k1').trim();
    const res = await api('POST', '/api/trends/interact', {
      projectId,
      nickname,
      text,
      type: isRose1 ? 'gift' : 'comment',
      giftName: isRose1 ? 'Hoa Hồng' : '',
      diamondCount: isRose1 ? 1 : 0,
    });
    if (res?.ok && res.event) {
      const ev = res.event;
      const outBox = $('adminTrendLastOutput');
      if (outBox) {
        outBox.innerHTML =
          `✅ <strong>[${esc(ev.formatLabel)}]</strong> <span class="badge gold">${esc(ev.result?.badge)}</span> ` +
          `<strong>${esc(ev.result?.headline)}</strong><br>` +
          `📝 <em>Kết quả hiển thị:</em> ${esc(ev.result?.detailText)}<br>` +
          `🔊 <em>Giọng đọc TTS:</em> “${esc(ev.result?.spokenText)}”`;
      }
      showToast(`${isRose1 ? '🌹' : '💬'} Đã giải mã thuật toán trên Web #${projectId}: ${ev.result?.badge}!`);
      await pollState();
    }
  };

  $('adminTrendProjectSelect')?.addEventListener('change', () => {
    const pid = $('adminTrendProjectSelect').value;
    const proj = (trendsCache?.projects || []).find(p => p.id === pid);
    if (proj?.sampleComments?.[0] && $('adminTrendCommentInput')) {
      $('adminTrendCommentInput').value = proj.sampleComments[0];
    }
  });

  $('btnAdminTrendComment')?.addEventListener('click', () => {
    const pid = $('adminTrendProjectSelect')?.value || 'gieo-que';
    const txt = $('adminTrendCommentInput')?.value || '2001';
    triggerAdminTrendInteract(pid, txt, false);
  });

  $('btnAdminTrendRose')?.addEventListener('click', () => {
    const pid = $('adminTrendProjectSelect')?.value || 'gieo-que';
    const txt = $('adminTrendCommentInput')?.value || '2001';
    triggerAdminTrendInteract(pid, txt, true);
  });

  $('adminTrendsCatalogGrid')?.addEventListener('click', e => {
    const sampleBtn = e.target.closest('[data-trend-quick-sample]');
    if (sampleBtn) {
      const pid = sampleBtn.dataset.trendProj;
      const sample = sampleBtn.dataset.trendQuickSample;
      if ($('adminTrendProjectSelect')) $('adminTrendProjectSelect').value = pid;
      if ($('adminTrendCommentInput')) $('adminTrendCommentInput').value = sample;
      triggerAdminTrendInteract(pid, sample, false);
      return;
    }
    const roseBtn = e.target.closest('[data-trend-quick-rose]');
    if (roseBtn) {
      const pid = roseBtn.dataset.trendQuickRose;
      const proj = (trendsCache?.projects || []).find(p => p.id === pid);
      const sample = proj?.sampleComments?.[0] || '2001';
      if ($('adminTrendProjectSelect')) $('adminTrendProjectSelect').value = pid;
      if ($('adminTrendCommentInput')) $('adminTrendCommentInput').value = sample;
      triggerAdminTrendInteract(pid, sample, true);
    }
  });

  $('adminCustomProjectSelect')?.addEventListener('change', e => {
    syncAdminCustomEditorFields(e.target.value);
  });

  $('btnSaveAdminCustomData')?.addEventListener('click', async () => {
    const projectId = $('adminCustomProjectSelect')?.value || 'gieo-que';
    const patch = {
      ruleNote: ($('adminCustomRuleNote')?.value || '').trim(),
      bonusBlessing: ($('adminCustomBlessing')?.value || '').trim(),
      microGiftTitle: ($('adminCustomMicroTitle')?.value || '').trim(),
      customLookupText: ($('adminCustomLookupText')?.value || '').trim(),
    };
    await api('POST', '/api/trends/custom-data', { projectId, patch });
    showToast(`💾 Đã lưu Kho Dữ Liệu Custom & Công thức thuật toán cho #${projectId}!`);
    await pollState();
  });

  $('btnResetTrendsEngine')?.addEventListener('click', async () => {
    await api('POST', '/api/trends/reset', {});
    showToast('🔄 Đã làm mới bộ đếm & bảng xếp hạng của 10 Website 3D Trend!');
    await pollState();
  });

  // Start real-time polling
  pollState();
  setInterval(pollState, 2000);
});
