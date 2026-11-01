const $ = s => document.querySelector(s);

const initial = name => [...(String(name || '').trim() || 'R')][0].toUpperCase();
const fmtDist = m => (m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`);

export function createRaceHud() {
  let bannerTimer = null;
  let welcomeTimer = null;
  let donorTimer = null;
  const donors = [];
  const joinFeed = [];

  function showDonorNext() {
    if (donorTimer) return;
    const d = donors.shift();
    const box = $('#donor');
    if (!box) return;
    if (!d) {
      box.replaceChildren();
      return;
    }
    const card = document.createElement('div');
    card.className = 'card pill';
    const av = document.createElement('div');
    av.className = 'avatar';
    av.textContent = initial(d.name);
    const info = document.createElement('div');
    const b = document.createElement('b');
    b.textContent = d.name;
    const span = document.createElement('span');
    span.textContent = `🚀 ${d.mountLabel} (${d.giftVi} ×${d.repeat} · +${d.bonusM}m)`;
    info.append(b, span);
    card.append(av, info);
    box.replaceChildren(card);
    donorTimer = setTimeout(() => {
      donorTimer = null;
      showDonorNext();
    }, 5500);
  }

  return {
    setBiome(biome, worldDistanceM = 0) {
      if (biome) {
        const titleEl = $('#biome-name');
        const subEl = $('#biome-sub');
        if (titleEl) titleEl.textContent = biome.name;
        if (subEl) subEl.textContent = biome.sub || '';
      }
      const distEl = $('#world-dist');
      if (distEl) distEl.textContent = fmtDist(worldDistanceM);
      const progEl = $('#biome-bar-fill');
      if (progEl) {
        const pct = Math.min(100, Math.round(((worldDistanceM % 600) / 600) * 100));
        progEl.style.width = `${pct}%`;
      }
    },
    setActiveCount(n) {
      const el = $('#runner-count');
      if (el) el.textContent = `Đang đua: ${n} vận động viên`;
    },
    showWelcome(msg) {
      const card = $('#welcome-card');
      const txt = $('#welcome-text');
      if (card && txt) {
        txt.textContent = msg.text || `Chào user ${msg.name} đã tham gia cuộc đua cùng chúng tôi`;
        card.classList.add('on');
        clearTimeout(welcomeTimer);
        welcomeTimer = setTimeout(() => card.classList.remove('on'), 5000);
      }
      // Also push to live join feed on left wall
      const feed = $('#join-list');
      if (feed && msg.name) {
        const idx = joinFeed.findIndex(x => x.id === msg.id);
        if (idx !== -1) joinFeed.splice(idx, 1);
        joinFeed.unshift({ id: msg.id, name: msg.name });
        if (joinFeed.length > 5) joinFeed.length = 5;
        feed.replaceChildren(...joinFeed.map(item => {
          const li = document.createElement('li');
          const b = document.createElement('b');
          b.textContent = `🏁 ${item.name}: `;
          li.append(b, document.createTextNode('Đã tham gia cuộc đua!'));
          return li;
        }));
      }
    },
    showBanner(text, ms = 4500) {
      const el = $('#banner');
      if (!el) return;
      el.textContent = text;
      el.classList.add('on');
      clearTimeout(bannerTimer);
      bannerTimer = setTimeout(() => el.classList.remove('on'), ms);
    },
    showDonor(d) {
      if (donors.length >= 5) donors.shift();
      donors.push(d);
      showDonorNext();
    },
    updateBoard(top = []) {
      const empty = $('#board-empty');
      if (empty) empty.style.display = top.length ? 'none' : 'block';
      const ol = $('#board ol');
      if (!ol) return;
      ol.replaceChildren(...top.map(r => {
        const li = document.createElement('li');
        const dBadge = r.diamonds > 0 ? ` · 💎${r.diamonds}` : '';
        li.textContent = `${r.name} · ${fmtDist(r.distanceM)}${dBadge}`;
        return li;
      }));
    },
    showVoice(text, on) {
      const toast = $('#voice-toast');
      const span = $('#voice-text');
      if (!toast || !span) return;
      if (on && text) {
        span.textContent = text;
        toast.classList.add('on');
      } else {
        toast.classList.remove('on');
      }
    },
  };
}
