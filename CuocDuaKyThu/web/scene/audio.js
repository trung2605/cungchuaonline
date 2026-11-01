// Audio & Vietnamese AI TTS for Cuộc Đua Kỳ Thú / Hành Trình Vãn Cảnh:
// - Speaks warm temple-pilgrimage greetings ("A Di Đà Phật, chào mừng Phật tử [tên] vừa vào chùa lễ Phật...")
// - Strict sequential FIFO priority queue with deduplication and zero echo/overlap
// - Automatically mutes if loaded inside an admin preview iframe so two tabs never double-play TTS

const CLIENT_SENSITIVE_RE = new RegExp(
  [
    '\\b(dm|đm|dcm|đcm|dkm|đkm|dmm|đmm|vcl|vkl|vl|clgt|cc|địt|dit|djt|đjt|đéo|deo|cặc|lồn|loz|buồi|cứt|đụ|đĩ|phò|cave|chịch|xoạc|nứng|fuck|bitch|sex|porn|jav|hentai|xnxx|xvideos|vlxx|onlyfans|pornhub)\\b',
    '\\b(đồ\\s*ngu|thằng\\s*ngu|con\\s*ngu|ngu\\s*ngốc|óc\\s*chó|chó\\s*điên|thằng\\s*chó|con\\s*chó|con\\s*đĩ|con\\s*phò|mất\\s*dạy|khốn\\s*nạn|súc\\s*vật|bố\\s*láo|hiếp\\s*dâm|ấu\\s*dâm|loạn\\s*luân|thủ\\s*dâm|sục\\s*cặc|bú\\s*cu|bú\\s*lồn)\\b',
    '\\b(tài\\s*xỉu|tai\\s*xiu|cá\\s*độ|ca\\s*do|cá\\s*cược|nhà\\s*cái|nha\\s*cai|nổ\\s*hũ|no\\s*hu|xóc\\s*đĩa|lô\\s*đề|cờ\\s*bạc|đánh\\s*bạc|kubet|f8bet|shbet|hi88|jun88|789bet|new88|go88|sunwin|rikvip|hitclub|baccarat|bốc\\s*bát\\s*họ|vay\\s*nóng|lừa\\s*đảo|lua\\s*dao)\\b',
    '\\b(chùa\\s*lừa\\s*đảo|chùa\\s*bịp|sư\\s*giả|sư\\s*hổ\\s*mang|phật\\s*giả|buôn\\s*thần\\s*bán\\s*thánh|cúng\\s*tiền\\s*cho\\s*ma|phản\\s*động|phan\\s*dong|ba\\s*que|3\\s*que|khủng\\s*bố|tự\\s*tử|tự\\s*sát|giết\\s*người|ma\\s*túy|đập\\s*đá|thuốc\\s*lắc|kẹo\\s*ke|cần\\s*sa)\\b',
    'https?:\\/\\/|www\\.|(?<!\\d)(?:\\d[\\s.\\-_*]?){8,}',
  ].join('|'),
  'iu'
);

const VN_VOWEL_RE = /[aăâeêioôơuưyáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

const VN_TTS_PHRASES = [
  [/\bnam\s+mo\s+a\s+di\s+da\s+phat\b/giu, 'Nam mô A Di Đà Phật'],
  [/\ba\s*di\s*da\s*phat\b/giu, 'A Di Đà Phật'],
  [/\badidaphat\b/giu, 'A Di Đà Phật'],
  [/\badida\b/giu, 'A Di Đà Phật'],
  [/\bnam\s+mo\b/giu, 'Nam mô'],
  [/\bnamo\b/giu, 'Nam mô'],
  [/\bmo\s+phat\b/giu, 'Mô Phật'],
  [/\bcau\s+binh\s+an\b/giu, 'cầu bình an'],
  [/\bcau\s+tai\s+loc\b/giu, 'cầu tài lộc'],
  [/\bcau\s+suc\s+khoe\b/giu, 'cầu sức khỏe'],
  [/\bvan\s+su\s+nhu\s+y\b/giu, 'vạn sự như ý'],
  [/\bvan\s+su\s+cat\s+tuong\b/giu, 'vạn sự cát tường'],
  [/\bbinh\s+an\b/giu, 'bình an'],
  [/\btai\s+loc\b/giu, 'tài lộc'],
  [/\bsuc\s+khoe\b/giu, 'sức khỏe'],
  [/\bgia\s+dinh\b/giu, 'gia đình'],
  [/\bmay\s+man\b/giu, 'may mắn'],
  [/\bhanh\s+phuc\b/giu, 'hạnh phúc'],
  [/\bcam\s+on\b/giu, 'cảm ơn'],
  [/\bm\.n\b|\bmn\b/giu, 'mọi người'],
  [/\bko\b|\bkhum\b|\bhông\b/giu, 'không'],
  [/\bđc\b|\bdc\b/giu, 'được'],
];

export function cleanCommentForTts(raw = '') {
  let s = String(raw || '').normalize('NFC').trim();
  if (!s) return '';
  const deobfuscated = s.replace(/(?<=\p{L})[.*_-]+(?=\p{L})/gu, '');
  if (CLIENT_SENSITIVE_RE.test(s) || CLIENT_SENSITIVE_RE.test(deobfuscated)) return '';
  s = s
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]+/gu, ' ')
    .replace(/[^\p{L}\p{N}\s,.!?'"-]/gu, ' ')
    .replace(/(\p{L})\1{2,}/gu, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (!s || s.length < 2 || !VN_VOWEL_RE.test(s)) return '';
  if (/^(?:ha|hi|he|ho|ka|ki|hu|hư|ờ|ừ|a|ơ|ư)+$/iu.test(s.replace(/\s+/g, ''))) return '';
  for (const [re, rep] of VN_TTS_PHRASES) s = s.replace(re, rep);
  if (CLIENT_SENSITIVE_RE.test(s)) return '';
  return s.replace(/\s+/g, ' ').trim().slice(0, 65);
}

export function cleanRaceTtsName(raw = '') {
  let s = String(raw).trim();
  if (!s) return 'Phật tử';
  if (CLIENT_SENSITIVE_RE.test(s)) return 'Phật tử';
  if (/^user\d{4,}$/i.test(s)) return 'Phật tử';
  s = s.replace(/[_.\\-]+/g, ' ').replace(/\s*\d{3,}$/g, '').trim();
  if (!s || /^\d+$/.test(s) || s.length < 2) return 'Phật tử';
  return s;
}

const WELCOME_TEMPLATES = [
  name => `A Di Đà Phật. Chào mừng Phật tử ${name} vào chùa lễ Phật`,
];
let welcomeTemplateIdx = 0;

export function formatWelcomeSpeech(name = '', useFixed = true) {
  const who = cleanRaceTtsName(name);
  if (useFixed) {
    return `A Di Đà Phật. Chào mừng Phật tử ${who} vào chùa lễ Phật`;
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
  let readComments = false;
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

  function cleanCommentForTts(raw = '') {
    let s = String(raw || '').normalize('NFC').trim();
    if (!s) return '';
    const deobfuscated = s.replace(/(?<=\p{L})[.*_-]+(?=\p{L})/gu, '');
    if (
      /\b(dm|đm|dcm|đcm|dkm|đkm|dmm|đmm|vcl|vkl|vl|clgt|cc|địt|dit|djt|đjt|đéo|deo|cặc|lồn|loz|buồi|cứt|đụ|đĩ|phò|cave|chịch|xoạc|nứng|fuck|bitch|sex|porn|jav|hentai|xnxx|xvideos|vlxx|onlyfans|pornhub|đồ\s*ngu|thằng\s*ngu|óc\s*chó|chó\s*điên|tài\s*xỉu|tai\s*xiu|cá\s*độ|nhà\s*cái|nổ\s*hũ|xóc\s*đĩa|lô\s*đề|cờ\s*bạc|kubet|f8bet|shbet|hi88|go88|sunwin|lừa\s*đảo|lua\s*dao|chùa\s*lừa\s*đảo|sư\s*giả|sư\s*hổ\s*mang|phản\s*động|ba\s*que|3\s*que|tự\s*tử|ma\s*túy|đập\s*đá)\b/iu.test(deobfuscated)
    ) {
      return '';
    }
    s = s
      .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]+/gu, ' ')
      .replace(/[^\p{L}\p{N}\s,.!?'"-]/gu, ' ')
      .replace(/(\p{L})\1{2,}/gu, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    if (!s || s.length < 2 || !/[aăâeêioôơuưyáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(s)) return '';
    s = s
      .replace(/\bnam\s+mo\s+a\s+di\s+da\s+phat\b/giu, 'Nam mô A Di Đà Phật')
      .replace(/\ba\s*di\s*da\s*phat\b|\badidaphat\b|\badida\b/giu, 'A Di Đà Phật')
      .replace(/\bnam\s+mo\b|\bnamo\b/giu, 'Nam mô')
      .replace(/\bcau\s+binh\s+an\b/giu, 'cầu bình an')
      .replace(/\bcau\s+tai\s+loc\b/giu, 'cầu tài lộc')
      .replace(/\bcau\s+suc\s+khoe\b/giu, 'cầu sức khỏe')
      .replace(/\bm\.n\b|\bmn\b/giu, 'mọi người')
      .replace(/\bko\b|\bkhum\b/giu, 'không')
      .replace(/\bđc\b|\bdc\b/giu, 'được')
      .replace(/\bgđ\b|\bgd\b/giu, 'gia đình');
    return s.slice(0, 65);
  }

  function interruptSpeechIfLowerPriority(newPriority = 2) {
    if (!speaking || !currentItem) return;
    const curPrio = currentItem.priority ?? (currentItem.isReal ? 1 : 0);
    if (!currentItem.isReal || (newPriority >= 3 && curPrio <= 1)) {
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
    const prio = item.priority ?? 1;
    // Strict deduplication: never queue if the exact same text is already speaking or queued
    if (currentItem && currentItem.text === item.text) {
      return;
    }
    if (speechQueue.some(x => x.text === item.text)) {
      return;
    }

    if (item.isReal) {
      purgeQueuedBots();
      interruptSpeechIfLowerPriority(prio);
      if (prio >= 2 && item.uid) {
        for (let i = speechQueue.length - 1; i >= 0; i--) {
          if (speechQueue[i].uid === item.uid && (speechQueue[i].priority ?? 1) < prio) {
            speechQueue.splice(i, 1);
          }
        }
      }
      const insertIdx = speechQueue.findIndex(x => (x.priority ?? 1) < prio);
      if (insertIdx === -1) speechQueue.push(item);
      else speechQueue.splice(insertIdx, 0, item);
      if (speechQueue.length > 8) speechQueue.pop();
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
    get readComments() {
      return readComments;
    },
    unlock() {
      if (!enabled) return;
      ctx.resume().catch(() => {});
      startBg();
    },
    setReadComments(on) {
      readComments = Boolean(on);
      if (!readComments) {
        for (let i = speechQueue.length - 1; i >= 0; i--) {
          if (speechQueue[i].kind === 'comment') speechQueue.splice(i, 1);
        }
        if (currentItem?.kind === 'comment') {
          clearTimeout(watchdog);
          try { currentVoiceSrc?.stop(); } catch {}
          currentVoiceSrc = null;
          if (typeof speechSynthesis !== 'undefined') {
            try { speechSynthesis.cancel(); } catch {}
          }
          currentItem = null;
          speaking = false;
          onSpeak?.('', false);
          setTimeout(flushSpeech, 150);
        }
      }
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
    speakComment(runner, rawComment = '') {
      if (!enabled || !readComments || !runner) return;
      const isReal = Boolean(runner.src && runner.src !== 'mock');
      const now = Date.now();
      const uid = runner.id || runner.uid || runner.name || '';
      const who = cleanRaceTtsName(runner.name);
      const cleanText = cleanCommentForTts(rawComment);
      if (!cleanText || !/[\p{L}\p{N}]/u.test(cleanText)) return;

      if (!isReal) {
        if (speaking || speechQueue.length > 0 || now - lastWelcomeSpeechAt < 16_000) return;
        lastWelcomeSpeechAt = now;
      } else {
        recentUidGreet.set(uid, now);
        recentNameGreet.set(who.toLowerCase(), now);
      }

      joinChime();
      const text = `Phật tử ${who}: ${cleanText}`;
      enqueueSpeech({ uid, text, kind: 'comment', priority: isReal ? 2 : 0, isReal });
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
      enqueueSpeech({ uid, text, priority: 3 + (d.tier || 1), isReal });
    },
  };
}
