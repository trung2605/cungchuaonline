// Audio & Vietnamese AI TTS for Cuộc Đua Kỳ Thú / Hành Trình Vãn Cảnh:
// - Speaks warm temple-pilgrimage greetings ("A Di Đà Phật, chào mừng Phật tử [tên] vừa vào chùa lễ Phật...")
// - Strict sequential FIFO priority queue with deduplication and zero echo/overlap
// - Automatically mutes if loaded inside an admin preview iframe so two tabs never double-play TTS

export function cleanRaceTtsName(raw = '') {
  let s = String(raw).trim();
  if (!s) return 'Phật tử';
  if (/^user\d{4,}$/i.test(s)) return 'Phật tử';
  s = s.replace(/[_.\\-]+/g, ' ').replace(/\s*\d{3,}$/g, '').trim();
  if (!s || /^\d+$/.test(s) || s.length < 2) return 'Phật tử';
  return s;
}

const WELCOME_TEMPLATES = [
  name => `A Di Đà Phật. Chào mừng Phật tử ${name} vừa vào chùa lễ Phật và khởi hành vãn cảnh`,
  name => `Chào mừng Phật tử ${name} vừa vào chùa thành tâm lễ Phật, chúc bạn vạn sự bình an`,
  name => `Nam mô A Di Đà Phật. Chào đón ${name} vừa vào chùa dâng hương và bộ hành khám phá kỳ quan`,
];
let welcomeTemplateIdx = 0;

export function formatWelcomeSpeech(name = '', useFixed = true) {
  const who = cleanRaceTtsName(name);
  if (useFixed) {
    return `Chào mừng ${who} vừa vào chùa lễ Phật và khởi hành vãn cảnh`;
  }
  const fn = WELCOME_TEMPLATES[welcomeTemplateIdx++ % WELCOME_TEMPLATES.length];
  return fn(who);
}

export function formatGiftBoostSpeech({ name = '', giftVi = 'lễ vật', repeat = 1, mountLabel = 'Đôi Cánh Năng Lượng', bonusM = 80, isNewJoin = false } = {}) {
  const who = cleanRaceTtsName(name);
  const greet = isNewJoin ? `Chào mừng ${who} vừa vào chùa lễ Phật. ` : '';
  const combo = repeat > 1 ? `${repeat} ${giftVi}` : giftVi;
  return `${greet}Cảm ơn Phật tử ${who} đã phát tâm tặng ${combo}, nhận ${mountLabel}, tiến thêm ${bonusM} mét trên đường hành hương!`;
}

export function createRaceAudio({ onSpeak = null } = {}) {
  const isPreviewIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();

  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.connect(ctx.destination);

  let enabled = !isPreviewIframe;
  if (isPreviewIframe) master.gain.value = 0;

  const speechQueue = [];
  let speaking = false;
  let lastWelcomeSpeechAt = 0;
  let watchdog = null;
  let currentVoiceSrc = null;
  let currentItem = null;
  const recentUidGreet = new Map(); // uid -> ts (15s cooldown per uid)
  const recentNameGreet = new Map(); // lowerName -> ts (15s cooldown per name)

  function tone(freq, start, dur, peak, type = 'triangle', endFreq = freq) {
    if (!enabled) return;
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), start + dur);
    g.gain.setValueAtTime(peak, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g).connect(master);
    o.start(start);
    o.stop(start + dur);
  }

  // Gentle, serene pentatonic ambient pulse (copyright-free)
  let bgRunning = false;
  let bgTimer = null;
  let stepIdx = 0;
  const CHORD_NOTES = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

  function tickBg() {
    if (!bgRunning) return;
    if (enabled && ctx.state === 'running' && !speaking) {
      const t = ctx.currentTime;
      const n1 = CHORD_NOTES[stepIdx % CHORD_NOTES.length];
      tone(n1 * 0.5, t, 0.9, 0.03, 'sine');
      stepIdx++;
    }
    bgTimer = setTimeout(tickBg, 1400);
  }

  function startBg() {
    if (bgRunning || !enabled) return;
    bgRunning = true;
    tickBg();
  }

  function joinChime() {
    if (!enabled) return;
    const t = ctx.currentTime;
    tone(432, t, 0.45, 0.08, 'sine');
    tone(648, t + 0.08, 0.55, 0.05, 'sine');
  }

  function boostSfx(tier = 1) {
    if (!enabled) return;
    const t = ctx.currentTime;
    if (tier >= 3) {
      for (const [i, f] of [392.0, 523.25, 659.25].entries()) {
        tone(f, t + i * 0.12, 0.5, 0.12, 'sine');
      }
    } else {
      tone(440, t, 0.4, 0.1, 'sine', 587.33);
    }
  }

  function interruptBotIfSpeaking() {
    if (speaking && currentItem && !currentItem.isReal) {
      clearTimeout(watchdog);
      try { currentVoiceSrc?.stop(); } catch {}
      currentVoiceSrc = null;
      if (typeof speechSynthesis !== 'undefined') {
        try { speechSynthesis.cancel(); } catch {}
      }
      currentItem = null;
      speaking = false;
    }
  }

  function purgeQueuedBots() {
    for (let i = speechQueue.length - 1; i >= 0; i--) {
      if (!speechQueue[i].isReal) speechQueue.splice(i, 1);
    }
  }

  function enqueueSpeech(item) {
    if (!enabled) return;
    // Strict deduplication: never queue if the exact same text or same user is already speaking or queued
    if (currentItem && (currentItem.text === item.text || (item.uid && currentItem.uid === item.uid && currentItem.priority === item.priority))) {
      return;
    }
    if (speechQueue.some(x => x.text === item.text || (item.uid && x.uid === item.uid && x.priority === item.priority))) {
      return;
    }

    if (item.isReal) {
      purgeQueuedBots();
      interruptBotIfSpeaking();
      if (item.priority >= 2) {
        const firstJoin = speechQueue.findIndex(x => x.priority < 2);
        if (firstJoin === -1) speechQueue.push(item);
        else speechQueue.splice(firstJoin, 0, item);
      } else {
        speechQueue.push(item);
      }
      if (speechQueue.length > 6) speechQueue.pop();
    } else {
      // Bots never queue if anyone is speaking or waiting in the queue
      if (speaking || speechQueue.length > 0) return;
      speechQueue.push(item);
    }
    flushSpeech();
  }

  async function flushSpeech() {
    if (!enabled || speaking || !speechQueue.length) return;
    // Set speaking = true synchronously BEFORE any await so concurrent calls can never overlap!
    const item = speechQueue.shift();
    currentItem = item;
    speaking = true;
    onSpeak?.(item.text, true);

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(watchdog);
      currentVoiceSrc = null;
      currentItem = null;
      speaking = false;
      onSpeak?.('', false);
      setTimeout(flushSpeech, 380);
    };

    watchdog = setTimeout(done, 10_000);

    try {
      if (ctx.state !== 'running') await ctx.resume().catch(() => {});
      // Cancel any lingering browser speech synthesis so two voices never talk at once
      if (typeof speechSynthesis !== 'undefined') {
        try { speechSynthesis.cancel(); } catch {}
      }
      const res = await fetch(`/tts?q=${encodeURIComponent(item.text)}`);
      if (!res.ok) throw new Error('tts failed');
      const arr = await res.arrayBuffer();
      const audioBuf = await ctx.decodeAudioData(arr);
      if (!enabled) {
        done();
        return;
      }
      const src = ctx.createBufferSource();
      src.buffer = audioBuf;
      src.playbackRate.value = 0.98; // Clear, natural Vietnamese voice without echo
      const g = ctx.createGain();
      g.gain.value = 1.1;
      src.connect(g).connect(master);
      currentVoiceSrc = src;
      src.onended = done;
      src.start();
    } catch {
      if (typeof speechSynthesis !== 'undefined') {
        try { speechSynthesis.cancel(); } catch {}
        const u = new SpeechSynthesisUtterance(item.text);
        u.lang = 'vi-VN';
        u.rate = 0.95;
        u.onend = done;
        u.onerror = done;
        try {
          speechSynthesis.speak(u);
          return;
        } catch {}
      }
      done();
    }
  }

  return {
    get suspended() {
      return ctx.state !== 'running';
    },
    unlock() {
      if (!enabled) return;
      ctx.resume().catch(() => {});
      startBg();
    },
    setEnabled(on) {
      if (isPreviewIframe) return;
      enabled = on;
      master.gain.value = on ? 1 : 0;
      if (on) {
        startBg();
        flushSpeech();
      } else {
        bgRunning = false;
        clearTimeout(bgTimer);
        speechQueue.length = 0;
        try { currentVoiceSrc?.stop(); } catch {}
        if (typeof speechSynthesis !== 'undefined') {
          try { speechSynthesis.cancel(); } catch {}
        }
        speaking = false;
        onSpeak?.('', false);
      }
    },
    greetJoin(msg) {
      if (!enabled || !msg) return;
      const isReal = Boolean(msg.src && msg.src !== 'mock');
      const now = Date.now();
      const uid = msg.id || msg.uid || msg.name || '';
      const who = cleanRaceTtsName(msg.name);
      const nameKey = who.toLowerCase();

      if (isReal) {
        const lastUid = recentUidGreet.get(uid) || 0;
        const lastName = recentNameGreet.get(nameKey) || 0;
        if (now - lastUid < 15_000 || now - lastName < 15_000) return;
        recentUidGreet.set(uid, now);
        recentNameGreet.set(nameKey, now);
      } else {
        if (speaking || speechQueue.length > 0 || now - lastWelcomeSpeechAt < 16_000) return;
        const lastName = recentNameGreet.get(nameKey) || 0;
        if (now - lastName < 30_000) return;
        lastWelcomeSpeechAt = now;
        recentNameGreet.set(nameKey, now);
      }

      joinChime();
      const text = formatWelcomeSpeech(msg.name, false);
      enqueueSpeech({ uid, text, priority: 1, isReal });
    },
    announceGift(d) {
      if (!enabled || !d) return;
      const isReal = Boolean(d.src && d.src !== 'mock');
      const uid = d.uid || d.name || '';
      const who = cleanRaceTtsName(d.name);
      recentUidGreet.set(uid, Date.now());
      recentNameGreet.set(who.toLowerCase(), Date.now());

      boostSfx(d.tier || 1);
      const text = formatGiftBoostSpeech(d);
      enqueueSpeech({ uid, text, priority: 2 + (d.tier || 1), isReal });
    },
  };
}
