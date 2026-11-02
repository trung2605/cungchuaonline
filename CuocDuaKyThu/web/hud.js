const $ = s => document.querySelector(s);

const initial = name => [...(String(name || '').trim() || 'R')][0].toUpperCase();
const fmtDist = m => (m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`);

export function createRaceHud() {
  let bannerTimer = null;
  let welcomeTimer = null;
  let donorTimer = null;
  let chestFlashTimer = null;
  const donors = [];
  const joinFeed = [];

  // Rotate "Hot Gift" highlight across the 4 gift tier rows in #guide every 3.8s to draw viewer eyes
  let hotTierIdx = 0;
  setInterval(() => {
    const rows = document.querySelectorAll('#guide [data-gift-tier]');
    if (!rows.length) return;
    rows.forEach((r, i) => r.classList.toggle('tier-hot', i === hotTierIdx % rows.length));
    hotTierIdx++;
  }, 3800);

  function flashGiftTierRow(tier = 1, diamonds = 1) {
    const key = tier >= 3 ? '3' : tier === 2 ? '2' : diamonds >= 2 ? '1b' : '1';
    const row = document.querySelector(`#guide [data-gift-tier="${key}"]`);
    if (!row) return;
    row.classList.add('tier-triggered');
    setTimeout(() => row.classList.remove('tier-triggered'), 2600);
  }

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
    av.textContent = d.overtookKing ? '👑' : d.tier >= 3 ? '🐉' : d.tier === 2 ? '🛵' : initial(d.name);
    const info = document.createElement('div');
    const b = document.createElement('b');
    const rankTag = d.overtookKing
      ? ' · 👑 SOÁN NGÔI #1'
      : d.rank && d.rank <= 10
        ? ` · 🏆 Hạng #${d.rank}`
        : '';
    b.textContent = `${d.name}${rankTag}`;
    const span = document.createElement('span');
    span.textContent = `🎁 ${d.giftVi} ×${d.repeat} (💎${d.diamonds}) → ${d.mountLabel} (+${d.bonusM}m)`;
    info.append(b, span);
    card.append(av, info);
    box.replaceChildren(card);
    donorTimer = setTimeout(() => {
      donorTimer = null;
      showDonorNext();
    }, 5500);
  }

  function updateGiftChest(chest, unlocked = false) {
    if (!chest) return;
    const card = $('#gift-goal-card');
    const lvlEl = $('#chest-level');
    const progTxt = $('#chest-progress-text');
    const barFill = $('#chest-bar-fill');
    const ctaEl = $('#chest-cta');
    if (lvlEl) lvlEl.textContent = String(chest.level || 1);
    if (progTxt) progTxt.textContent = `${chest.currentDiamonds || 0} / ${chest.targetDiamonds || 25} 💎`;
    if (barFill) barFill.style.width = `${unlocked ? 100 : (chest.pct || 0)}%`;
    if (ctaEl) {
      if (unlocked) {
        ctaEl.textContent = '🎉 ĐẠI TIỆC KHO BÁU ĐÃ NỔ! Toàn đoàn Tăng Tốc ×3.0 & +120m!';
      } else if ((chest.remaining || 0) <= 5) {
        ctaEl.textContent = `🔥 SẮP NỔ! Chỉ còn ${chest.remaining} 💎 nữa mở Đại Tiệc ×3.0 toàn đoàn!`;
      } else {
        ctaEl.textContent = `🔥 Còn ${chest.remaining} 💎 nữa nổ Đại Tiệc Tăng Tốc ×3.0 toàn đoàn!`;
      }
    }
    if (card && unlocked) {
      card.classList.add('unlocked');
      clearTimeout(chestFlashTimer);
      chestFlashTimer = setTimeout(() => {
        card.classList.remove('unlocked');
        if (barFill) barFill.style.width = `${chest.pct || 0}%`;
        if (ctaEl) ctaEl.textContent = `🔥 Còn ${chest.remaining} 💎 nữa nổ Đại Tiệc Tăng Tốc ×3.0 toàn đoàn!`;
      }, 5500);
    }
  }

  return {
    setBiome(biome, worldDistanceM = 0) {
      if (biome) {
        const eyebrowEl = $('#biome-eyebrow');
        const titleEl = $('#biome-name');
        const subEl = $('#biome-sub');
        if (eyebrowEl) {
          if (biome.province?.name) {
            eyebrowEl.textContent = `🇻🇳 ĐI BỘ XUYÊN VIỆT · TỈNH ${biome.province.code}/${biome.province.total || 63}: ${biome.province.name.toUpperCase()}`;
          } else {
            eyebrowEl.textContent = '🇻🇳 HÀNH TRÌNH ĐI BỘ XUYÊN VIỆT 63 TỈNH THÀNH';
          }
        }
        if (titleEl) titleEl.textContent = biome.name;
        if (subEl) subEl.textContent = biome.province?.landmark ? `${biome.sub} · 📍 ${biome.province.landmark}` : (biome.sub || '');
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
      if (el) el.textContent = `Đang đi: ${n} người`;
    },
    showWelcome(msg) {
      const card = $('#welcome-card');
      const txt = $('#welcome-text');
      const toast = $('#voice-toast');
      if (card && txt && (!toast || !toast.classList.contains('on'))) {
        txt.textContent = msg.text || `Chào mừng ${msg.name} cùng tham gia hành trình đi bộ xuyên Việt`;
        card.classList.add('on');
        clearTimeout(welcomeTimer);
        welcomeTimer = setTimeout(() => card.classList.remove('on'), 4500);
      }
      // Also push to live join feed on left wall
      const feed = $('#join-list');
      if (feed && msg.name) {
        const idx = joinFeed.findIndex(x => x.id === msg.id);
        if (idx !== -1) joinFeed.splice(idx, 1);
        joinFeed.unshift({ id: msg.id, name: msg.name });
        if (joinFeed.length > 3) joinFeed.length = 3;
        feed.replaceChildren(...joinFeed.map(item => {
          const li = document.createElement('li');
          const b = document.createElement('b');
          b.textContent = `🇻🇳 ${item.name}: `;
          li.append(b, document.createTextNode('Đã tham gia đi bộ xuyên Việt!'));
          return li;
        }));
      }
    },
    showBanner(text, ms = 4500) {
      const el = $('#banner');
      if (!el) return;
      $('#welcome-card')?.classList.remove('on');
      el.textContent = text;
      el.classList.add('on');
      clearTimeout(bannerTimer);
      bannerTimer = setTimeout(() => el.classList.remove('on'), ms);
    },
    showDonor(d) {
      flashGiftTierRow(d.tier || 1, d.diamonds || 1);
      if (d.giftChest) {
        updateGiftChest(d.giftChest, Boolean(d.chestUnlocked));
      }
      if (donors.length >= 5) donors.shift();
      donors.push(d);
      showDonorNext();
    },
    updateGiftChest,
    updateBoard(top = []) {
      const empty = $('#board-empty');
      if (empty) empty.style.display = top.length ? 'none' : 'block';
      const kingEl = $('#king-spotlight');
      const hintEl = $('#overtake-hint');
      if (kingEl) {
        if (top.length > 0) {
          const king = top[0];
          const dStr = king.diamonds > 0 ? ` · 💎${king.diamonds}` : '';
          kingEl.textContent = `👑 Vua #1: ${king.name} · ${fmtDist(king.distanceM)}${dStr}`;
        } else {
          kingEl.textContent = '👑 Top 1 đang trống · Gửi quà chiếm Ngôi Vua!';
        }
      }
      if (hintEl) {
        if (top.length >= 2) {
          const gapM = Math.max(5, Math.round((top[0].distanceM || 0) - (top[1].distanceM || 0)));
          if (gapM <= 80) {
            hintEl.textContent = `🔥 #2 ${top[1].name} chỉ kém #1 ${gapM}m · Tặng 1🌹 (1💎 +80m) soán ngôi ngay!`;
          } else if (gapM <= 350) {
            hintEl.textContent = `🛵 Cách Top 1 ${gapM}m · Tặng Hoa Rosa (10💎 +350m) lên Xe Cub vượt #1!`;
          } else {
            hintEl.textContent = `🐉 Tặng quà nhận Xe Cub (+350m) hoặc Rồng Vàng (+1.5km) soán ngôi #1!`;
          }
        } else {
          hintEl.textContent = '🌹 Tặng 1 Hoa Hồng (1💎) nhận Cánh Chim +80m bứt phá Top 1!';
        }
      }
      const ol = $('#board ol');
      if (!ol) return;
      ol.replaceChildren(...top.slice(0, 7).map((r, idx) => {
        const li = document.createElement('li');
        const crown = idx === 0 ? '👑 ' : '';
        const dBadge = r.diamonds > 0 ? ` · 💎${r.diamonds}` : '';
        li.textContent = `${crown}${r.name} · ${fmtDist(r.distanceM)}${dBadge}`;
        return li;
      }));
    },
    showVoice(text, on, _kind = 'interactive', gender = 'male') {
      const toast = $('#voice-toast');
      const span = $('#voice-text');
      const badge = $('#voice-badge');
      if (!toast || !span) return;
      if (on && text) {
        $('#welcome-card')?.classList.remove('on');
        $('#banner')?.classList.remove('on');
        const isFemale = gender === 'female';
        toast.classList.toggle('female', isFemale);
        toast.classList.toggle('male', !isFemale);
        if (badge) {
          badge.textContent = isFemale ? '👩 MC Hoài My' : '👨 MC Minh Quân';
        }
        span.textContent = text.replace(/^🎙️\s*/, '');
        toast.classList.add('on');
      } else {
        toast.classList.remove('on');
      }
    },
  };
}
