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
  const altarIds = [null, null, null];
  const altarEls = ALTAR_CARD_X.map(x => {
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;left:${x}px;top:0`;
    $('#altar-cards').append(el);
    return el;
  });

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
  rose: 'Hoa Hồng', tiktok: 'TikTok', gg: 'GG', lotus: 'Hoa Sen',
  'finger heart': 'Tim Tay', rosa: 'Hoa Rosa', perfume: 'Nước Hoa',
  doughnut: 'Bánh Vòng', 'paper crane': 'Hạc Giấy', garland: 'Vòng Hoa',
  'money gun': 'Pháo Lộc', swan: 'Thiên Nga', galaxy: 'Ngân Hà',
  lion: 'Sư Tử', 'tiktok universe': 'Vũ Trụ',
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
        span.textContent = text;
        toast.classList.add('on');
      } else {
        toast.classList.remove('on');
      }
    },
    // Big altar card per spot: initial, name, intent. Fixed positions, so they never overlap.
    altar(spot, actor) {
      const id = actor?.id ?? null;
      if (altarIds[spot] === id) return;
      altarIds[spot] = id;
      altarEls[spot].replaceChildren(...(actor ? [card(actor.name, `🙏 ${actor.intent}`)] : []));
    },
  };
}
