// DOM overlay: counter, banner, couplets, donor card, TRI ÂN board, altar cards (BR-07.8, BR-07.18..21).
// Viewer-supplied text always goes through textContent.
const $ = s => document.querySelector(s);
const COUPLET_MS = 10_000, COUPLET_FADE_MS = 800, DONOR_MS = 6000, DONOR_QUEUE = 5;
const ALTAR_CARD_X = [210, 540, 870]; // px centers for altar spots left, middle, right

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
  const altarIds = [null, null, null];
  const altarEls = ALTAR_CARD_X.map(x => {
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;left:${x}px;top:0`;
    $('#altar-cards').append(el);
    return el;
  });

  const couplets = [$('#couplet-l'), $('#couplet-r')];
  for (const el of couplets) Object.assign(el.style, { whiteSpace: 'pre-line', opacity: 0 });
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

  function nextDonor() {
    if (donorTimer) return;
    const d = donors.shift();
    $('#donor').replaceChildren(...(d ? [card(d.name, `${d.giftName} ×${d.repeat}`)] : []));
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
        case 'board':
          $('#board ol').replaceChildren(...msg.top.map(r => {
            const li = document.createElement('li');
            li.textContent = `${r.name} · 💎${r.diamonds.toLocaleString('vi-VN')}`;
            return li;
          }));
          break;
        case 'couplets':
          pairs = msg.pairs;
          ci = -1;
          nextCouplet();
          break;
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
