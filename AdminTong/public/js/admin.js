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
// 2-LEVEL IN-PLACE TAB NAVIGATION (3 Main Tabs + Sub-Tabs, No New Browser Tabs)
// ============================================================================
function switchMainTab(mainTab) {
  const clean = (mainTab || 'master').replace(/^#/, '');
  const target = ['master', 'chua', 'dua'].includes(clean) ? clean : 'master';

  document.querySelectorAll('.main-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mainTab === target);
  });
  document.querySelectorAll('.main-tab-view').forEach(view => {
    view.classList.toggle('active', view.id === `main-view-${target}`);
  });
  if (history.replaceState) {
    history.replaceState(null, '', `#${target}`);
  }
  setTimeout(() => window.dispatchEvent(new Event('resize')), 40);
}
window.switchMainTab = switchMainTab;

function switchSubTab(parentTab, subTabId) {
  const container = $(`main-view-${parentTab}`);
  if (!container) return;
  container.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sub === subTabId);
  });
  container.querySelectorAll('.sub-tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `sub-${subTabId}`);
  });
  setTimeout(() => window.dispatchEvent(new Event('resize')), 40);
}
window.switchSubTab = switchSubTab;

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
    labels: ['Chạy bộ (x1.0)', 'Đôi Cánh (x1.8)', 'Ván Trượt Vàng (x2.8)', 'Tên Lửa (x4.2)', 'Phi Thuyền (x6.5)'],
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

function updateAllCharts(state) {
  if (!charts.globalTimeline) return;
  const db = state.db || {};
  const t = db.totals || {};
  const chua = state.games?.['cung-chua-online']?.data || {};
  const dua = state.games?.['cuoc-dua-ky-thu']?.data || {};
  const nowLabel = new Date().toLocaleTimeString('vi-VN', { hour12: false });

  historySeries.labels.push(nowLabel);
  historySeries.chuaDiamonds.push(t.chuaDiamonds || 0);
  historySeries.duaDiamonds.push(t.duaDiamonds || 0);
  historySeries.chuaNamo.push(chua.stats?.namo || 0);
  historySeries.chuaActors.push((chua.actors || []).length);

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
  charts.globalShare.updateSeries([t.chuaDiamonds || 0, t.duaDiamonds || 0], false);

  // 3. Global Top Donors
  const topDonors = (db.topDonors || []).slice(0, 7);
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
  const topPrayers = (chua.stats?.topPrayers || []).slice(0, 6);
  if (topPrayers.length) {
    charts.chuaPrayers.updateOptions({ labels: topPrayers.map(p => p.text) }, false, false);
    charts.chuaPrayers.updateSeries(topPrayers.map(p => p.count), false);
  } else {
    charts.chuaPrayers.updateOptions({ labels: ['Chưa có lời cầu nguyện'] }, false, false);
    charts.chuaPrayers.updateSeries([1], false);
  }

  // 6. Dua Tiers
  const tierCounts = [0, 0, 0, 0, 0];
  for (const r of (dua.runners || [])) {
    const tr = Math.max(0, Math.min(4, Number(r.tier) || 0));
    tierCounts[tr]++;
  }
  charts.duaTiers.updateSeries(tierCounts, false);

  // 7. Dua Top Racers
  const topRacers = (dua.stats?.topRacers || []).slice(0, 7);
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
  const db = state.db || {};
  const t = db.totals || {};
  const mongo = db.mongo || {};
  const chuaOnline = state.games?.['cung-chua-online']?.online;
  const chua = state.games?.['cung-chua-online']?.data || {};
  const duaOnline = state.games?.['cuoc-dua-ky-thu']?.online;
  const dua = state.games?.['cuoc-dua-ky-thu']?.data || {};

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

  // Sidebar Badges
  $('navBadgeChua').textContent = `${(chua.actors || []).length} lễ`;
  $('navBadgeDua').textContent = `${(dua.runners || []).length} đua`;
  $('navBadgeGifts').textContent = fmtNum(t.totalGiftRecords || 0);

  // Overview KPIs
  $('kpiRealDiamonds').textContent = fmtNum(t.realDiamonds || 0);
  $('kpiRealGifts').textContent = `${fmtNum(t.realGiftsCount || 0)} phần quà thật`;
  $('kpiChuaNamo').textContent = fmtNum(chua.stats?.namo || 0);
  $('kpiChuaSub').textContent = `${(chua.actors || []).length} đang quỳ · ${fmtNum(chua.stats?.bows || 0)} lạy`;
  $('kpiDuaDist').textContent = `${fmtNum(dua.stats?.worldDistanceM || 0)} m`;
  $('kpiDuaSub').textContent = `${(dua.runners || []).length} đang chạy · ${fmtNum(dua.stats?.totalLikes || 0)} tim`;
  $('kpiViewers').textContent = fmtNum(Math.max(chua.stats?.viewersCurrent || 0, dua.stats?.viewers || 0));
  $('kpiViewersPeak').textContent = `Đỉnh phiên: ${fmtNum(Math.max(chua.stats?.viewersPeak || 0, dua.stats?.viewersPeak || 0))}`;
  $('kpiChuaDiamonds').textContent = fmtNum(t.chuaDiamonds || 0);
  $('kpiDuaDiamonds').textContent = fmtNum(t.duaDiamonds || 0);
  $('kpiMongoSync').textContent = mongo.connected ? 'Cloud Active' : 'Local JSON';
  $('kpiMongoSub').textContent = mongo.lastSyncAt
    ? `Đồng bộ: ${new Date(mongo.lastSyncAt).toLocaleTimeString('vi-VN', { hour12: false })}`
    : 'Sẵn sàng lưu trữ';

  // Game 1: Cúng Chùa Online Panel
  $('chuaStatusBadge').className = `badge ${chuaOnline ? 'emerald' : 'rose'}`;
  $('chuaStatusBadge').textContent = chuaOnline ? 'Đang Hoạt Động (:8787)' : 'Offline';
  if (chua.scene) {
    if (document.activeElement !== $('chuaThemeSelect')) $('chuaThemeSelect').value = chua.scene.theme || 'night';
    $('chuaSoundCheck').checked = chua.scene.sound !== false;
  }
  if (chua.demo) {
    $('chuaDemoBadge').className = `badge ${chua.demo.on ? 'gold' : 'brand'}`;
    $('chuaDemoBadge').textContent = chua.demo.on ? `Demo Đang Bật (${chua.demo.rate}/s)` : 'Demo Đang Tắt (Chế Độ Live Thật)';
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
  const chuaActors = chua.actors || [];
  $('chuaActorsBody').innerHTML = chuaActors.length
    ? chuaActors.map(a => `
      <tr>
        <td><strong>${esc(a.name)}</strong><div style="font-size:11px;color:var(--text-muted)">${esc(a.id)}</div></td>
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
    : '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Chánh điện đang trống (Sẵn sàng đón Phật tử vào lễ trực tiếp)</td></tr>';

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

  // Game 2: Cuộc Đua Kỳ Thú Panel
  $('duaStatusBadge').className = `badge ${duaOnline ? 'emerald' : 'rose'}`;
  $('duaStatusBadge').textContent = duaOnline ? `Đang Hoạt Động (:8789) · ${dua.stats?.currentBiome?.name || ''}` : 'Offline';
  if (dua.demo) {
    $('duaDemoBadge').className = `badge ${dua.demo.on ? 'gold' : 'teal'}`;
    $('duaDemoBadge').textContent = dua.demo.on ? `Demo Đang Bật (${dua.demo.rate}/s)` : 'Demo Đang Tắt (Chế Độ Live Thật)';
  }
  if (dua.scene) {
    $('duaSoundCheck').checked = dua.scene.sound !== false;
  }

  // Biome Grid
  const biomes = dua.biomes || [];
  const forced = dua.forcedBiome || 'auto';
  const allBiomes = [{ id: 'auto', name: '🔄 Tự Động Xoay Vòng Kỳ Quan', sub: 'Đổi địa điểm mỗi 600m hành trình' }, ...biomes];
  $('duaBiomeGrid').innerHTML = allBiomes.map(b => `
    <button type="button" class="biome-btn ${forced === b.id ? 'active' : ''}" data-biome-id="${esc(b.id)}">
      <strong>${esc(b.name)}</strong>
      <span>${esc(b.sub)}</span>
    </button>
  `).join('');

  // Dua Active Runners Table
  const duaRunners = dua.runners || [];
  $('duaRunnersBody').innerHTML = duaRunners.length
    ? duaRunners.map(r => `
      <tr>
        <td><strong>${esc(r.name)}</strong><div style="font-size:11px;color:var(--text-muted)">${esc(r.id)}</div></td>
        <td><span class="badge ${r.tier >= 3 ? 'gold' : r.tier >= 1 ? 'teal' : 'brand'}">Tier ${r.tier} (×${Number(r.speedMult || 1).toFixed(1)})</span></td>
        <td style="font-weight:800;color:var(--teal)">${fmtNum(Math.round(r.distanceM || 0))} m</td>
        <td style="font-weight:700;color:var(--gold)">💎 ${fmtNum(r.diamonds || 0)}</td>
        <td>${esc(r.cheer || '')}</td>
        <td><button class="btn sm danger" data-kick-dua="${esc(r.id)}">Mời rời đường đua</button></td>
      </tr>
    `).join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">Đường đua đang trống (Sẵn sàng đón vận động viên từ phiên Live)</td></tr>';

  // Gift Log Table (Shared in Overview & Gifts tab)
  const gifts = db.recentGifts || [];
  const giftRowsHtml = gifts.length
    ? gifts.slice(0, 50).map(g => `
      <tr>
        <td style="color:var(--text-muted);font-size:12px">${esc(g.time)}</td>
        <td><span class="badge ${g.game === 'cuoc-dua-ky-thu' ? 'teal' : 'gold'}">${esc(g.gameLabel)}</span></td>
        <td><strong>${esc(g.name)}</strong></td>
        <td><strong>${esc(g.giftVi)}</strong> <span style="color:var(--text-muted)">×${g.repeat}</span></td>
        <td style="font-weight:800;color:var(--gold)">💎 ${fmtNum(g.totalDiamonds)}</td>
        <td style="font-size:12px;color:var(--text-secondary)">${esc(g.reward)}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">Dữ liệu đã được làm sạch về 0 — Đang chờ quà tặng mới từ phiên Live</td></tr>';
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

  updateAllCharts(state);
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
  if (window.location.hash) switchMainTab(window.location.hash);

  // Level 1: Top 3 Main Tabs (Admin Tổng / Admin Cúng Chùa / Admin Cuộc Đua Kỳ Thú)
  document.querySelectorAll('.main-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchMainTab(btn.dataset.mainTab));
  });

  // Level 2: Sub-tabs inside each Main Tab
  document.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchSubTab(btn.dataset.parent, btn.dataset.sub));
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

  // 4. Game 1: Cúng Chùa Online Controls
  $('btnChuaSaveScene').addEventListener('click', async () => {
    const theme = $('chuaThemeSelect').value;
    const sound = $('chuaSoundCheck').checked;
    await gameAction('cung-chua-online', '/api/scene', { theme, sound });
    showToast('Đã cập nhật không gian & âm thanh Chánh Điện 3D!');
    await pollState();
  });

  $('btnChuaDemoOn').addEventListener('click', async () => {
    const rate = Number($('chuaDemoRate').value) || 3;
    await gameAction('cung-chua-online', '/api/demo', { on: true, rate });
    showToast('Đã bật chế độ Demo Cúng Chùa Online!');
    await pollState();
  });

  $('btnChuaDemoOff').addEventListener('click', async () => {
    await gameAction('cung-chua-online', '/api/demo', { on: false, rate: 3 });
    showToast('Đã tắt Demo Cúng Chùa Online (Chế độ Live thật)!');
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

  $('btnDuaDemoOn').addEventListener('click', async () => {
    const rate = Number($('duaDemoRate').value) || 2.5;
    await gameAction('cuoc-dua-ky-thu', '/api/demo', { on: true, rate });
    showToast('Đã bật chế độ Demo Cuộc Đua Kỳ Thú!');
    await pollState();
  });

  $('btnDuaDemoOff').addEventListener('click', async () => {
    await gameAction('cuoc-dua-ky-thu', '/api/demo', { on: false, rate: 2 });
    showToast('Đã tắt Demo Cuộc Đua Kỳ Thú (Chế độ Live thật)!');
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
