/* Live TikTok Unified Studio Admin — Clean Modular Controller & ApexCharts Engine */

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtNum = n => Number(n || 0).toLocaleString('vi-VN');

// Toast Notification
let toastTimer = null;
function showToast(msg, ok = true) {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
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
};

const activeSubTabByParent = {
  master: 'master-overview',
  chua: 'chua-controls',
  dua: 'dua-controls',
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
  const target = ['master', 'chua', 'dua'].includes(clean) ? clean : 'master';

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

  if (history.replaceState) {
    history.replaceState(null, '', `#${target}`);
  }
  setTimeout(() => window.dispatchEvent(new Event('resize')), 40);
}
window.switchMainTab = switchMainTab;

function switchSubTab(parentTab, subTabId) {
  const cleanParent = ['master', 'chua', 'dua'].includes(parentTab) ? parentTab : 'master';
  activeSubTabByParent[cleanParent] = subTabId;

  // Ensure parent main view is active and expanded
  switchMainTab(cleanParent, false);

  const container = $(`main-view-${cleanParent}`);
  if (container) {
    container.querySelectorAll('.sub-tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `sub-${subTabId}`);
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
    { time: 'Mẫu Demo', game: 'cung-chua-online', gameLabel: 'Cúng Chùa Online 3D', name: 'Phật Tử Thiện Tâm (Mẫu)', giftVi: 'Nước Hoa', repeat: 1, totalDiamonds: 20, reward: 'Áo tràng Hoàng Kim · Thắp đại hoa đăng, Hào quang & Đại hồng chung', src: 'mock' },
    { time: 'Mẫu Demo', game: 'cuoc-dua-ky-thu', gameLabel: 'Cuộc Đua Kỳ Thú 3D', name: 'Minh An (Mẫu)', giftVi: 'Bánh Vòng', repeat: 1, totalDiamonds: 30, reward: 'Tên Lửa Hoàng Kim · Tốc độ ×4.8 (+1.500m)', src: 'mock' },
    { time: 'Mẫu Demo', game: 'cung-chua-online', gameLabel: 'Cúng Chùa Online 3D', name: 'An Nhiên (Mẫu)', giftVi: 'Hoa Rosa', repeat: 1, totalDiamonds: 10, reward: 'Khoác Áo tràng Vàng · Thắp đèn hoa đăng & Chuông chùa', src: 'mock' },
    { time: 'Mẫu Demo', game: 'cung-chua-online', gameLabel: 'Cúng Chùa Online 3D', name: 'Phật Tử Thiện Tâm (Mẫu)', giftVi: 'Tim Tay', repeat: 1, totalDiamonds: 5, reward: 'Dâng hoa sen & Đèn hoa đăng · Chuông gia trì & Đọc tên', src: 'mock' },
    { time: 'Mẫu Demo', game: 'cung-chua-online', gameLabel: 'Cúng Chùa Online 3D', name: 'An Nhiên (Mẫu)', giftVi: 'Hoa Hồng', repeat: 1, totalDiamonds: 1, reward: 'Dâng 3 nén hương trầm · Tiếng khánh & Đọc tên cầu an', src: 'mock' },
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
  historySeries.chuaNamo.length = 0;
  historySeries.chuaActors.length = 0;
  showToast(
    showMockData
      ? 'Đã BẬT hiển thị dữ liệu mẫu (Thống kê bao gồm cả dữ liệu Fake/Mẫu trên cả 3 trang)'
      : 'Đã TẮT dữ liệu mẫu — Chỉ hiển thị 100% thông số người dùng thật!'
  );
  if (lastStateCache) renderAll(lastStateCache);
}
window.toggleMockDataMode = toggleMockDataMode;

// ============================================================================
// APEXCHARTS ENGINE (7 Interactive Charts)
// ============================================================================
const charts = {};
const historySeries = {
  labels: [],
  chuaDiamonds: [],
  duaDiamonds: [],
  chuaNamo: [],
  chuaActors: [],
};

function initApexCharts() {
  if (typeof ApexCharts === 'undefined') return;

  const baseFont = "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif";

  // 1. Global Real-Time Diamond Timeline (Area Spline)
  charts.globalTimeline = new ApexCharts($('chartGlobalTimeline'), {
    chart: { type: 'area', height: 280, fontFamily: baseFont, toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout', speed: 400 } },
    colors: ['#2563eb', '#60a5fa'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.03, stops: [0, 95, 100] } },
    series: [
      { name: 'Cúng Chùa Online (💎)', data: [] },
      { name: 'Cuộc Đua Kỳ Thú (💎)', data: [] },
    ],
    xaxis: { categories: [], labels: { style: { colors: '#64748b', fontSize: '11px' } } },
    yaxis: { min: 0, labels: { formatter: v => fmtNum(Math.round(v)), style: { colors: '#64748b', fontSize: '11px' } } },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    legend: { position: 'top', horizontalAlign: 'right', fontWeight: 700 },
  });
  charts.globalTimeline.render();

  // 2. Global Game Share (Donut)
  charts.globalShare = new ApexCharts($('chartGlobalShare'), {
    chart: { type: 'donut', height: 280, fontFamily: baseFont },
    colors: ['#2563eb', '#93c5fd'],
    labels: ['Cúng Chùa Online 3D', 'Cuộc Đua Kỳ Thú 3D'],
    series: [0, 0],
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

  // 3. Global Top Donors (Horizontal Bar)
  charts.globalTopDonors = new ApexCharts($('chartGlobalTopDonors'), {
    chart: { type: 'bar', height: 260, fontFamily: baseFont, toolbar: { show: false } },
    colors: ['#2563eb'],
    plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '62%' } },
    dataLabels: { enabled: true, formatter: v => fmtNum(v) + ' 💎', style: { fontSize: '11px', fontWeight: 700 } },
    series: [{ name: 'Kim cương', data: [] }],
    xaxis: { categories: [], labels: { style: { colors: '#475569', fontSize: '11px' } } },
    grid: { borderColor: '#f1f5f9' },
  });
  charts.globalTopDonors.render();

  // 4. Cúng Chùa Online: Niệm Phật & Phật tử Timeline
  charts.chuaTimeline = new ApexCharts($('chartChuaTimeline'), {
    chart: { type: 'area', height: 260, fontFamily: baseFont, toolbar: { show: false } },
    colors: ['#2563eb', '#60a5fa'],
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

  // 5. Cúng Chùa Online: Phân Bố Lời Cầu Nguyện
  charts.chuaPrayers = new ApexCharts($('chartChuaPrayers'), {
    chart: { type: 'donut', height: 260, fontFamily: baseFont },
    colors: ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
    labels: ['Chưa có dữ liệu'],
    series: [1],
    plotOptions: { pie: { donut: { size: '64%' } } },
    dataLabels: { enabled: false },
    legend: { position: 'bottom' },
  });
  charts.chuaPrayers.render();

  // 6. Cuộc Đua Kỳ Thú: Phân Bố Trang Bị / Phương Tiện
  charts.duaTiers = new ApexCharts($('chartDuaTiers'), {
    chart: { type: 'donut', height: 260, fontFamily: baseFont },
    colors: ['#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#1d4ed8'],
    labels: ['Đi bộ (x1.0)', 'Cánh Chim Lạc (x1.8)', 'Xe Cub Phượt (x2.8)', 'Chiến Mã Thánh Gióng (x4.2)', 'Rồng Vàng (x6.5)'],
    series: [0, 0, 0, 0, 0],
    plotOptions: { pie: { donut: { size: '64%' } } },
    dataLabels: { enabled: false },
    legend: { position: 'bottom' },
  });
  charts.duaTiers.render();

  // 7. Cuộc Đua Kỳ Thú: Top Tay Đua Dẫn Đầu (m)
  charts.duaTopRacers = new ApexCharts($('chartDuaTopRacers'), {
    chart: { type: 'bar', height: 260, fontFamily: baseFont, toolbar: { show: false } },
    colors: ['#2563eb'],
    plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '62%' } },
    dataLabels: { enabled: true, formatter: v => fmtNum(v) + ' m', style: { fontSize: '11px', fontWeight: 700 } },
    series: [{ name: 'Quãng đường (m)', data: [] }],
    xaxis: { categories: [] },
    grid: { borderColor: '#f1f5f9' },
  });
  charts.duaTopRacers.render();
}

function computeViewMetrics(state) {
  const db = state.db || {};
  const t = db.totals || {};
  const chua = state.games?.['cung-chua-online']?.data || {};
  const dua = state.games?.['cuoc-dua-ky-thu']?.data || {};

  const realChuaActors = (chua.actors || []).filter(a => a.src !== 'mock');
  const realDuaRunners = (dua.runners || []).filter(r => r.src !== 'mock');
  const realGifts = db.realGifts || (db.recentGifts || []).filter(g => g.src !== 'mock');
  const realTopDonors = (db.realTopDonors || []).map(d => ({ name: d.name, totalDiamonds: d.realDiamonds ?? d.totalDiamonds }));

  if (!showMockData) {
    return {
      totalDiamonds: t.realDiamonds || 0,
      totalGiftsCount: t.realGiftsCount || 0,
      giftRecordsCount: t.realGiftRecords ?? realGifts.length,
      chuaDiamonds: t.realChuaDiamonds || 0,
      duaDiamonds: t.realDuaDiamonds || 0,
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
    totalDiamonds: (t.realDiamonds || 0) + extraChuaDiamonds + extraDuaDiamonds,
    totalGiftsCount: (t.realGiftsCount || 0) + extraGiftsCount,
    giftRecordsCount: serverAllGifts.length + (hasServerMock ? 0 : SAMPLE_PREVIEW.gifts.length),
    chuaDiamonds: (t.realChuaDiamonds || 0) + extraChuaDiamonds,
    duaDiamonds: (t.realDuaDiamonds || 0) + extraDuaDiamonds,
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
  const nowLabel = new Date().toLocaleTimeString('vi-VN', { hour12: false });

  historySeries.labels.push(nowLabel);
  historySeries.chuaDiamonds.push(vm.chuaDiamonds);
  historySeries.duaDiamonds.push(vm.duaDiamonds);
  historySeries.chuaNamo.push(vm.chuaNamo);
  historySeries.chuaActors.push(vm.chuaActors.length);

  if (historySeries.labels.length > 20) {
    historySeries.labels.shift();
    historySeries.chuaDiamonds.shift();
    historySeries.duaDiamonds.shift();
    historySeries.chuaNamo.shift();
    historySeries.chuaActors.shift();
  }

  // 1. Global Timeline
  charts.globalTimeline.updateOptions({ xaxis: { categories: [...historySeries.labels] } }, false, false);
  charts.globalTimeline.updateSeries([
    { name: 'Cúng Chùa Online (💎)', data: [...historySeries.chuaDiamonds] },
    { name: 'Cuộc Đua Kỳ Thú (💎)', data: [...historySeries.duaDiamonds] },
  ], false);

  // 2. Global Share
  charts.globalShare.updateSeries([vm.chuaDiamonds, vm.duaDiamonds], false);

  // 3. Global Top Donors
  const topDonors = (vm.topDonors || []).slice(0, 7);
  charts.globalTopDonors.updateOptions({
    xaxis: { categories: topDonors.length ? topDonors.map(d => d.name) : ['Chưa có dữ liệu'] },
  }, false, false);
  charts.globalTopDonors.updateSeries([
    { name: 'Kim cương', data: topDonors.length ? topDonors.map(d => d.totalDiamonds) : [0] },
  ], false);

  // 4. Chua Timeline
  charts.chuaTimeline.updateOptions({ xaxis: { categories: [...historySeries.labels] } }, false, false);
  charts.chuaTimeline.updateSeries([
    { name: 'Tổng Niệm Nam Mô', data: [...historySeries.chuaNamo] },
    { name: 'Phật tử trong điện', data: [...historySeries.chuaActors] },
  ], false);

  // 5. Chua Prayers
  const topPrayers = (vm.topPrayers || []).slice(0, 6);
  if (topPrayers.length) {
    charts.chuaPrayers.updateOptions({ labels: topPrayers.map(p => p.text) }, false, false);
    charts.chuaPrayers.updateSeries(topPrayers.map(p => p.count), false);
  } else {
    charts.chuaPrayers.updateOptions({ labels: ['Chưa có lời cầu nguyện'] }, false, false);
    charts.chuaPrayers.updateSeries([1], false);
  }

  // 6. Dua Tiers
  const tierCounts = [0, 0, 0, 0, 0];
  for (const r of vm.duaRunners) {
    const tr = Math.max(0, Math.min(4, Number(r.tier) || 0));
    tierCounts[tr]++;
  }
  charts.duaTiers.updateSeries(tierCounts, false);

  // 7. Dua Top Racers
  const topRacers = (vm.topRacers || []).slice(0, 7);
  charts.duaTopRacers.updateOptions({
    xaxis: { categories: topRacers.length ? topRacers.map(r => r.name) : ['Chưa có tay đua'] },
  }, false, false);
  charts.duaTopRacers.updateSeries([
    { name: 'Quãng đường (m)', data: topRacers.length ? topRacers.map(r => r.distanceM) : [0] },
  ], false);
}

// ============================================================================
// STATE RENDERING & FORM HYDRATION
// ============================================================================
let chuaListsHydrated = false;
let catalogCache = [];

function renderAll(state) {
  lastStateCache = state;
  const db = state.db || {};
  const mongo = db.mongo || {};
  const chuaOnline = state.games?.['cung-chua-online']?.online;
  const chua = state.games?.['cung-chua-online']?.data || {};
  const duaOnline = state.games?.['cuoc-dua-ky-thu']?.online;
  const dua = state.games?.['cuoc-dua-ky-thu']?.data || {};
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

  // Tab 1: Overview KPIs
  $('kpiRealDiamonds').textContent = fmtNum(vm.totalDiamonds);
  $('kpiRealGifts').textContent = `${fmtNum(vm.totalGiftsCount)} phần quà (${modeNote})`;
  $('kpiChuaNamo').textContent = fmtNum(vm.chuaNamo);
  $('kpiChuaSub').textContent = `${vm.chuaActors.length} đang quỳ · ${fmtNum(vm.chuaBows)} lạy`;
  $('kpiDuaDist').textContent = `${fmtNum(vm.duaDistM)} m`;
  $('kpiDuaSub').textContent = `${vm.duaRunners.length} đang chạy · ${fmtNum(vm.duaLikes)} tim`;
  $('kpiViewers').textContent = fmtNum(Math.max(chua.stats?.viewersCurrent || 0, dua.stats?.viewers || 0));
  $('kpiViewersPeak').textContent = `Đỉnh phiên: ${fmtNum(Math.max(chua.stats?.viewersPeak || 0, dua.stats?.viewersPeak || 0))}`;
  $('kpiChuaDiamonds').textContent = fmtNum(vm.chuaDiamonds);
  $('kpiDuaDiamonds').textContent = fmtNum(vm.duaDiamonds);
  $('kpiMongoSync').textContent = mongo.connected ? 'Cloud Active' : 'Local JSON';
  $('kpiMongoSub').textContent = mongo.lastSyncAt
    ? `Đồng bộ: ${new Date(mongo.lastSyncAt).toLocaleTimeString('vi-VN', { hour12: false })}`
    : 'Sẵn sàng lưu trữ';

  // Tab 2: Cúng Chùa Online KPIs & Panel
  if ($('chuaKpiNamo')) {
    $('chuaKpiNamo').textContent = fmtNum(vm.chuaNamo);
    $('chuaKpiNamoSub').textContent = modeNote;
    $('chuaKpiBows').textContent = fmtNum(vm.chuaBows);
    $('chuaKpiBowersSub').textContent = `${fmtNum(vm.chuaBowers)} Phật tử (${modeNote})`;
    $('chuaKpiDiamonds').textContent = fmtNum(vm.chuaDiamonds);
    $('chuaKpiGiftsSub').textContent = modeNote;
    $('chuaKpiActors').textContent = fmtNum(vm.chuaActors.length);
    $('chuaKpiActorsSub').textContent = showMockData ? 'Gồm cả nhân vật mẫu' : 'Chỉ nhân vật người thật';
  }

  $('chuaStatusBadge').className = `badge ${chuaOnline ? 'emerald' : 'rose'}`;
  $('chuaStatusBadge').textContent = chuaOnline ? 'Chùa 3D (:8787) · Online' : 'Chùa 3D (:8787) · Offline';
  if (chua.scene) {
    if (document.activeElement !== $('chuaThemeSelect')) $('chuaThemeSelect').value = chua.scene.theme || 'night';
    $('chuaSoundCheck').checked = chua.scene.sound !== false;
    if ($('chuaReadCommentsCheck')) $('chuaReadCommentsCheck').checked = Boolean(chua.scene.readComments);
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
  const chuaStayMins = Number(chua.stayConfig?.stayMinutes) || 5;
  const duaStayMins = Number(dua.stayConfig?.stayMinutes) || 5;
  if ($('chuaStayBadge')) {
    $('chuaStayBadge').textContent = `Đang giữ: ${chuaStayMins} phút (Áo Vàng ${chuaStayMins * 2}p · Hoàng Kim ${chuaStayMins * 5}p)`;
  }
  if ($('duaStayBadge')) {
    $('duaStayBadge').textContent = `Đang giữ: ${duaStayMins} phút (Quà tặng ${duaStayMins * 2}p – ${duaStayMins * 8}p)`;
  }
  if ($('chuaStayMinutesInput') && document.activeElement !== $('chuaStayMinutesInput')) {
    $('chuaStayMinutesInput').value = chuaStayMins;
  }
  if ($('duaStayMinutesInput') && document.activeElement !== $('duaStayMinutesInput')) {
    $('duaStayMinutesInput').value = duaStayMins;
  }
  if ($('quickStayMinutes') && document.activeElement !== $('quickStayMinutes')) {
    $('quickStayMinutes').value = chuaStayMins;
  }

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

  // Tab 3: Cuộc Đua Kỳ Thú KPIs & Panel
  if ($('duaKpiDist')) {
    $('duaKpiDist').textContent = `${fmtNum(vm.duaDistM)} m`;
    $('duaKpiBiomeSub').textContent = dua.stats?.currentBiome?.name || 'Vịnh Hạ Long & Phố Cổ';
    $('duaKpiRunners').textContent = fmtNum(vm.duaRunners.length);
    $('duaKpiRacersSub').textContent = `${fmtNum(vm.duaUniqueRacers)} tổng tay đua (${modeNote})`;
    $('duaKpiDiamonds').textContent = fmtNum(vm.duaDiamonds);
    $('duaKpiDiamondsSub').textContent = modeNote;
    $('duaKpiLikes').textContent = fmtNum(vm.duaLikes);
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

  // Gift Catalog Table
  catalogCache = db.giftCatalog || [];
  $('catalogBody').innerHTML = catalogCache.map(item => `
    <tr>
      <td style="font-family:var(--font-mono);color:var(--text-muted)">#${item.giftId}</td>
      <td><strong>${esc(item.giftVi)}</strong> <span style="color:var(--text-muted)">(${esc(item.giftName)})</span></td>
      <td style="font-weight:800;color:var(--gold)">💎 ${fmtNum(item.diamonds)}</td>
      <td><span class="badge brand">Tier ${item.tier}</span></td>
      <td style="font-size:12px">${esc(item.chuaReward)}</td>
      <td style="font-size:12px">${esc(item.duaReward)}</td>
      <td>
        <div class="row-inline">
          <button class="btn sm" data-edit-gift="${item.giftId}">Sửa</button>
          <button class="btn sm danger" data-del-gift="${item.giftId}">Xóa</button>
        </div>
      </td>
    </tr>
  `).join('');

  // System & Work Logs
  $('sysMongoDetail').textContent = mongo.connected
    ? `Đã kết nối MongoDB Atlas (${mongo.dbName}) · URI: ${mongo.maskedUri}`
    : `Chưa kết nối Cloud (${mongo.error || 'Đang dùng logs/master-db.json'})`;
  if (document.activeElement !== $('sysMongoDbInput') && state.config?.mongoDbName) {
    $('sysMongoDbInput').value = state.config.mongoDbName;
  }

  const workLogs = db.workLogs || [];
  $('workLogsBody').innerHTML = workLogs.map(w => `
    <tr>
      <td style="color:var(--text-muted);font-size:12px;white-space:nowrap">${esc(w.time)}</td>
      <td><span class="badge brand">${esc(w.category)}</span></td>
      <td><span class="badge ${w.game === 'cuoc-dua-ky-thu' ? 'teal' : w.game === 'cung-chua-online' ? 'gold' : 'emerald'}">${esc(w.game)}</span></td>
      <td><strong>${esc(w.title)}</strong><div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${esc(w.detail)}</div></td>
    </tr>
  `).join('');

  updateAllCharts(state, vm);
  if (window.lucide) window.lucide.createIcons();
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

  // In-Page 3D Live Preview Drawer (No new browser tabs needed!)
  let previewLoaded = false;
  $('btnToggle3DPreview')?.addEventListener('click', () => {
    const drawer = $('previewDrawer');
    const isOpen = drawer.classList.toggle('open');
    if (isOpen && !previewLoaded) {
      previewLoaded = true;
      $('iframeChua3D').src = 'http://127.0.0.1:8787';
      $('iframeDua3D').src = 'http://127.0.0.1:8789';
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
    historySeries.chuaNamo.length = 0;
    historySeries.chuaActors.length = 0;
    showToast('Đã làm sạch toàn bộ dữ liệu (MongoDB & 2 Game) về 0! Sẵn sàng lên Live!');
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
  const triggerStayTime = async (game, mins) => {
    const cleanMins = Math.max(0.5, Math.min(180, Number(mins) || 5));
    await gameAction(game, '/api/stay-time', { stayMinutes: cleanMins });
    showToast(`Đã cập nhật thời gian người tham gia ở lại thành ${cleanMins} phút (Tự động gia hạn luôn cho những người đang có mặt)!`);
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

  $('btnChuaBanner').addEventListener('click', async () => {
    const text = $('chuaBannerInput').value.trim();
    if (!text) return showToast('Vui lòng nhập nội dung thông báo', false);
    await gameAction('cung-chua-online', '/api/banner', { text });
    $('chuaBannerInput').value = '';
    showToast('Đã phát thông báo lên màn hình Cúng Chùa Online!');
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
        showToast(`Đang nạp cấu hình quà #${item.giftId} lên biểu mẫu`);
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

  // Start real-time polling
  pollState();
  setInterval(pollState, 2000);
});
