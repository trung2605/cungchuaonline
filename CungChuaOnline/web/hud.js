// DOM overlay: counter, banner, couplets, donor card, TRI ÂN board, altar cards (BR-07.8, BR-07.18..21).
// Viewer-supplied text always goes through textContent.
import { formatTtsThanks } from './scene/audio.js';
const $ = s => document.querySelector(s);
const COUPLET_MS = 10_000, COUPLET_FADE_MS = 800, DONOR_MS = 6000, DONOR_QUEUE = 5;
const ALTAR_CARD_X = [240, 540, 840]; // px centers for altar spots left, middle, right

const initial = name => [...(name.trim() || '?')][0].toUpperCase();

function card(name, line) {
  const el = document.createElement('div');
  el.className = 'card pill';
  const av = document.createElement('div');
  av.className = 'avatar';
  av.textContent = initial(name);
  const text = document.createElement('div');
  const b = document.createElement('b');
  b.textContent = name;
  const span = document.createElement('span');
  span.textContent = line;
  text.append(b, span);
  el.append(av, text);
  return el;
}

export function createHud() {
  let pairs = [], ci = -1, donors = [], donorTimer = null, bannerTimer = null;
  const recentPrayers = [];
  const altarActors = [null, null, null];
  let shownAltarId = null;
  const altarSlot = document.createElement('div');
  altarSlot.style.cssText = 'position:absolute;left:540px;top:0';
  $('#altar-cards').append(altarSlot);

  const couplets = [$('#couplet-l'), $('#couplet-r')];
  for (const el of couplets) Object.assign(el.style, { whiteSpace: 'pre', opacity: 0 });
  function nextCouplet() {
    for (const el of couplets) el.style.opacity = 0;
    if (!pairs.length) return;
    ci = (ci + 1) % pairs.length;
    setTimeout(() => {
      pairs[ci].forEach((line, i) => { couplets[i].textContent = line.trim().split(/\s+/).join('\n'); });
      for (const el of couplets) el.style.opacity = 1;
    }, COUPLET_FADE_MS);
  }
  setInterval(nextCouplet, COUPLET_MS);

const GIFT_VI = {
  rose: 'Hoa Hồng', tiktok: 'TikTok', gg: 'GG',
  'heart me': 'Trái Tim', 'ice cream cone': 'Kem Ốc Quế', 'wishing bottle': 'Bình Ước Nguyện',
  lotus: 'Hoa Sen', 'finger heart': 'Tim Tay', 'little yellow duck': 'Vịt Vàng', panda: 'Gấu Trúc',
  rosa: 'Hoa Rosa', 'friendship necklace': 'Vòng Hữu Nghị', 'hand hearts': 'Tim Đôi', 'conical hat': 'Nón Lá',
  perfume: 'Nước Hoa', doughnut: 'Bánh Vòng', bouquet: 'Bó Hoa Tươi', 'paper crane': 'Hạc Giấy',
};
const giftVi = g => GIFT_VI[String(g || '').trim().toLowerCase()] || g || 'Lễ vật';

  function nextDonor() {
    if (donorTimer) return;
    const d = donors.shift();
    const gName = d ? giftVi(d.giftName) : '';
    const dCount = d?.diamonds ? ` · 💎${d.diamonds}` : '';
    const text = d ? `🙏 ${d.offering || 'dâng hương'} (${gName} ×${d.repeat}${dCount})` : '';
    $('#donor').replaceChildren(...(d ? [card(d.name, text)] : []));
    if (d) donorTimer = setTimeout(() => { donorTimer = null; nextDonor(); }, DONOR_MS);
  }

  return {
    handle(msg) {
      switch (msg.t) {
        case 'counter':
          if (msg.key === 'namo') {
            $('#namo span').textContent = msg.value.toLocaleString('vi-VN');
            // Restart the bump: drop the class, force a reflow, add it back.
            const el = $('#namo');
            el.classList.remove('bump');
            void el.offsetWidth;
            el.classList.add('bump');
          }
          break;
        case 'banner': {
          const toast = $('#voice-toast');
          if (toast && toast.classList.contains('on')) break;
          const el = $('#banner');
          el.textContent = msg.text;
          el.classList.add('on');
          clearTimeout(bannerTimer);
          bannerTimer = setTimeout(() => el.classList.remove('on'), msg.ms);
          break;
        }
        case 'donor':
          if (donors.length >= DONOR_QUEUE) donors.shift();
          donors.push(msg);
          nextDonor();
          break;
        case 'board': {
          const empty = $('#board-empty');
          if (empty) empty.style.display = msg.top.length ? 'none' : 'block';
          $('#board ol').replaceChildren(...msg.top.slice(0, 5).map(r => {
            const li = document.createElement('li');
            li.textContent = `${r.name} · 💎${r.diamonds.toLocaleString('vi-VN')}`;
            return li;
          }));
          break;
        }
        case 'couplets':
          pairs = msg.pairs;
          ci = -1;
          nextCouplet();
          break;
      }
    },
    notePrayer(actor) {
      if (!actor?.name) return;
      const list = $('#prayer-list');
      if (!list) return;
      const item = { id: actor.id, name: actor.name, intent: actor.intent || 'Cầu Bình An' };
      const idx = recentPrayers.findIndex(x => x.id === actor.id);
      if (idx !== -1) recentPrayers.splice(idx, 1);
      recentPrayers.unshift(item);
      if (recentPrayers.length > 3) recentPrayers.length = 3;
      list.replaceChildren(...recentPrayers.map(p => {
        const li = document.createElement('li');
        const b = document.createElement('b');
        b.textContent = `🙏 ${p.name}: `;
        li.append(b, document.createTextNode(p.intent));
        return li;
      }));
    },
    setHallCount(n) {
      const el = $('#hall-count');
      if (el) el.textContent = `Đang lễ: ${n} Phật tử`;
    },
    showVoice(text, on) {
      const toast = $('#voice-toast');
      const span = $('#voice-text');
      if (!toast || !span) return;
      if (on && text) {
        $('#banner')?.classList.remove('on');
        span.textContent = text;
        toast.classList.add('on');
      } else {
        toast.classList.remove('on');
      }
    },
    // Single centered altar card in the 540px center corridor so it never collides with left/right HUD columns.
    altar(spot, actor) {
      altarActors[spot] = actor || null;
      const active = altarActors[1] || altarActors[0] || altarActors[2] || null;
      const id = active?.id ?? null;
      if (shownAltarId === id) return;
      shownAltarId = id;
      altarSlot.replaceChildren(...(active ? [card(active.name, `🙏 ${active.intent}`)] : []));
    },
  };
}
