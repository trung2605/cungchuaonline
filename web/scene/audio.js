// Sound (BR-07.9, BR-07.23). Wood block, chime (khánh), temple bell and grand bell are synthesized.
// TTS uses Web Speech API (vi-VN) with a smart priority queue to thank gift donors.
// Music plays assets/audio/music.mp3 if the owner has put a licensed file there.
const MAX_BLOCKS_PER_S = 4;
const MAX_SPEECH_QUEUE = 3;

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
  [/\bquan\s+the\s+am(\s+bo\s+tat)?\b/giu, 'Quan Thế Âm Bồ Tát'],
  [/\bquan\s+am(\s+bo\s+tat)?\b/giu, 'Quan Âm Bồ Tát'],
  [/\bcau\s+binh\s+an\b/giu, 'cầu bình an'],
  [/\bcau\s+tai\s+loc\b/giu, 'cầu tài lộc'],
  [/\bcau\s+suc\s+khoe\b/giu, 'cầu sức khỏe'],
  [/\bcau\s+gia\s+dao\b/giu, 'cầu gia đạo'],
  [/\bcau\s+duyen\b/giu, 'cầu duyên'],
  [/\bcau\s+con\b/giu, 'cầu con'],
  [/\bvan\s+su\s+nhu\s+y\b/giu, 'vạn sự như ý'],
  [/\bvan\s+su\s+cat\s+tuong\b/giu, 'vạn sự cát tường'],
  [/\bcong\s+duc\s+vo\s+luong\b/giu, 'công đức vô lượng'],
  [/\bthanh\s+tam\b/giu, 'thành tâm'],
  [/\bhoan\s+hy\b/giu, 'hoan hỷ'],
  [/\bbinh\s+an\b/giu, 'bình an'],
  [/\btai\s+loc\b/giu, 'tài lộc'],
  [/\bsuc\s+khoe\b/giu, 'sức khỏe'],
  [/\bgia\s+dinh\b/giu, 'gia đình'],
  [/\bmay\s+man\b/giu, 'may mắn'],
  [/\bhanh\s+phuc\b/giu, 'hạnh phúc'],
  [/\bxin\s+via\b/giu, 'xin vía'],
  [/\bxin\s+loc\b/giu, 'xin lộc'],
  [/\bcam\s+on\b/giu, 'cảm ơn'],
  [/\bm\.n\b|\bmn\b/giu, 'mọi người'],
  [/\bko\b|\bkhum\b|\bhông\b/giu, 'không'],
  [/\bđc\b|\bdc\b/giu, 'được'],
  [/\bgđ\b|\bgd\b/giu, 'gia đình'],
  [/\bsk\b/giu, 'sức khỏe'],
  [/\bhp\b/giu, 'hạnh phúc'],
  [/\bvk\b/giu, 'vợ'],
  [/\bck\b/giu, 'chồng'],
  [/\bny\b/giu, 'người yêu'],
  [/\bvs\b/giu, 'với'],
  [/\bntn\b/giu, 'như thế nào'],
  [/\btrc\b/giu, 'trước'],
  [/\bđag\b|\bdag\b/giu, 'đang'],
  [/\btks\b|\bthanks\b|\bthank\b/giu, 'cảm ơn'],
];

export function cleanCommentForTts(raw = '') {
  let s = String(raw || '').normalize('NFC').trim();
  if (!s) return '';
  // Collapse dot/asterisk obfuscation before checking sensitive words
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

  for (const [re, rep] of VN_TTS_PHRASES) {
    s = s.replace(re, rep);
  }
  if (CLIENT_SENSITIVE_RE.test(s)) return '';

  return s.replace(/\s+/g, ' ').trim().slice(0, 65);
}

// Cleans TikTok handles/nicknames so Vietnamese TTS pronounces them naturally.
export function cleanTtsName(raw = '') {
  let s = String(raw).trim();
  if (!s) return 'Phật tử';
  if (CLIENT_SENSITIVE_RE.test(s)) return 'Phật tử';
  // Generic auto-generated TikTok handles like user123456789
  if (/^user\d{4,}$/i.test(s)) return 'Phật tử';
  // Replace underscores, dots, dashes with spaces
  s = s.replace(/[_.\\-]+/g, ' ');
  // Strip trailing long digit suffixes (e.g., "letritrung 1992" -> "letritrung")
  s = s.replace(/\s*\d{3,}$/g, '').trim();
  // If stripping left only digits or < 2 chars, fallback to Phật tử
  if (!s || /^\d+$/.test(s) || s.length < 2) return 'Phật tử';
  return s;
}

// Formats the Vietnamese thank-you speech with combo counts when repeat >= 2.
export function formatTtsThanks({ name = '', offering = 'dâng hương', repeat = 1 } = {}) {
  const who = cleanTtsName(name);
  const n = Number(repeat) || 1;
  if (offering === 'phát tâm công đức') {
    return `Cảm ơn ${who} đã phát tâm công đức`;
  }
  if (n >= 2) {
    if (offering === 'dâng hương') return `Cảm ơn ${who} đã dâng ${n} nén hương`;
    if (offering === 'dâng hoa') return `Cảm ơn ${who} đã dâng ${n} đóa hoa sen`;
    if (offering === 'dâng đèn hoa đăng') return `Cảm ơn ${who} đã dâng ${n} ngọn đèn hoa đăng`;
  }
  return `Cảm ơn ${who} đã ${offering}`;
}

const BLESSINGS_TIER0 = [
  'nguyện cầu bình an, tâm thanh tịnh',
  'chúc gia đạo an vui, vạn sự lành',
  'chúc thân tâm an lạc, phước huệ song tu',
];
const BLESSINGS_TIER1 = [
  'nguyện ánh sáng trí tuệ soi đường, gia đạo hưng long',
  'chúc phước lộc viên mãn, vạn sự cát tường như ý',
  'nguyện cầu bình an, sức khỏe dồi dào, tài lộc hanh thông',
];
const BLESSINGS_TIER2 = [
  'Thành tâm tri ân công đức vô lượng, nguyện hồng ân Tam Bảo gia hộ đại thí chủ bách sự hanh thông, phúc lộc trường tồn',
  'Công đức vô lượng, nguyện cầu quốc thái dân an, gia quyến đại thí chủ luôn bình an, thịnh vượng',
];
let blessingIdx = 0;

export function formatTtsBlessing({ name = '', offering = 'dâng hương', repeat = 1, diamonds = 1 } = {}) {
  const base = formatTtsThanks({ name, offering, repeat });
  const idx = blessingIdx++;
  if (diamonds >= 20 || offering === 'phát tâm công đức') {
    const b = BLESSINGS_TIER2[idx % BLESSINGS_TIER2.length];
    return `Nam mô A Di Đà Phật. ${base}. ${b}`;
  }
  if (diamonds >= 5 || offering === 'dâng đèn hoa đăng') {
    const b = BLESSINGS_TIER1[idx % BLESSINGS_TIER1.length];
    return `A Di Đà Phật. ${base}, ${b}`;
  }
  const b = BLESSINGS_TIER0[idx % BLESSINGS_TIER0.length];
  return `${base}, ${b}`;
}

export function createAudio({ onSpeak = null } = {}) {
  const isPreviewIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.connect(ctx.destination);
  const music = new Audio('assets/audio/music.mp3');
  music.loop = true;
  music.volume = 0.32;
  let enabled = !isPreviewIframe, missing = false, triedWav = false, blockTimes = [];
  if (isPreviewIframe) master.gain.value = 0;
  const speechQueue = [];
  let speaking = false;
  let viVoice = null;
  let watchdog = null;

  function refreshViVoice() {
    if (typeof speechSynthesis === 'undefined') return null;
    const voices = speechSynthesis.getVoices() || [];
    viVoice = voices.find(v => v.lang?.toLowerCase().startsWith('vi') && /natural|online|hoaimy|namminh|an|google/i.test(v.name))
      || voices.find(v => v.lang?.toLowerCase().startsWith('vi'))
      || null;
    return viVoice;
  }

  if (typeof speechSynthesis !== 'undefined') {
    refreshViVoice();
    if ('onvoiceschanged' in speechSynthesis) {
      speechSynthesis.addEventListener?.('voiceschanged', refreshViVoice);
    }
  }

  function tone(freq, start, dur, peak, type = 'sine', endFreq = freq) {
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    o.frequency.exponentialRampToValueAtTime(endFreq, start + dur);
    g.gain.setValueAtTime(peak, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g).connect(master);
    o.start(start);
    o.stop(start + dur);
  }

  const playMusic = () => {
    if (!enabled) return;
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    if (!missing) {
      music.play().catch(() => { startSynthZen(); });
    } else {
      startSynthZen();
    }
  };

  // Gentle procedural Zen & Buddhist meditation music (warm 432Hz/528Hz harmonic pads,
  // pentatonic guzheng/bamboo-flute-like gentle notes, and soft singing bowl overtones).
  // 100% copyright-free (synthesized live via WebAudio), guaranteed not to trigger TikTok copyright mute.
  let zenRunning = false;
  let zenTimer = null;
  const zenGain = ctx.createGain();
  zenGain.gain.value = 0.22;
  zenGain.connect(master);

  // Pentatonic scale in C major / A minor (warm meditation tuning: C4, D4, E4, G4, A4, C5, D5, E5, G5)
  const ZEN_NOTES = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
  const ZEN_BASS = [130.81, 146.83, 164.81, 196.00, 220.00];

  function playZenPad(freq, dur) {
    if (!enabled || !zenRunning || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    // Two slightly detuned sine oscillators for a warm, breathing singing-bowl pad
    for (const detune of [-3, 3]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t);
      o.detune.setValueAtTime(detune, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.11, t + dur * 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(zenGain);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
  }

  function playZenPluck(freq, delay = 0) {
    if (!enabled || !zenRunning || ctx.state !== 'running') return;
    const t = ctx.currentTime + delay;
    // Soft harmonic pluck (fundamental + octave overtone) like a gentle đàn tranh / singing bowl touch
    for (const [mult, peak, d] of [[1, 0.16, 4.2], [2, 0.05, 2.2], [3, 0.015, 1.2]]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq * mult, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(zenGain);
      o.start(t);
      o.stop(t + d + 0.05);
    }
  }

  let zenStep = 0;
  function tickZen() {
    if (!zenRunning) return;
    if (enabled && ctx.state === 'running') {
      // Slow breathing bass drone every 2 phrases
      if (zenStep % 2 === 0) {
        const bass = ZEN_BASS[(zenStep / 2) % ZEN_BASS.length];
        playZenPad(bass, 7.5);
        playZenPad(bass * 1.5, 7.0); // fifth harmony
      }
      // Gentle meditative pentatonic melody notes (1 to 3 notes spaced out slowly)
      const n1 = ZEN_NOTES[(zenStep * 3 + 2) % ZEN_NOTES.length];
      const n2 = ZEN_NOTES[(zenStep * 5 + 1) % ZEN_NOTES.length];
      playZenPluck(n1, 0.2);
      playZenPluck(n2, 1.6);
      if (zenStep % 3 === 0) {
        const n3 = ZEN_NOTES[(zenStep * 2 + 4) % ZEN_NOTES.length];
        playZenPluck(n3, 2.9);
      }
      zenStep++;
    }
    zenTimer = setTimeout(tickZen, 3800);
  }

  function startSynthZen() {
    if (zenRunning) return;
    zenRunning = true;
    tickZen();
  }

  function stopSynthZen() {
    zenRunning = false;
    clearTimeout(zenTimer);
    zenTimer = null;
  }

  music.onerror = () => {
    if (!triedWav) {
      triedWav = true;
      music.src = 'assets/audio/music.wav';
      if (enabled && ctx.state === 'running') music.play().catch(() => startSynthZen());
      return;
    }
    missing = true;
    if (enabled && ctx.state === 'running') startSynthZen();
  };

  function duckMusic(duck) {
    music.volume = duck ? 0.14 : 0.32;
    if (ctx.state === 'running') {
      zenGain.gain.setTargetAtTime(duck ? 0.09 : 0.22, ctx.currentTime, 0.15);
    }
  }

  let currentVoiceSrc = null;
  let currentItem = null;
  let currentDone = null;
  let lastPrayerSpeechAt = 0;
  const recentRealGreet = new Map(); // uid -> ts to avoid double-greeting the same real user on join within 15s
  const recentNameGreet = new Map(); // normalizedName -> ts to avoid repeating join greeting within 15s
  const recentCommentSpeech = new Map(); // uid+text -> ts to avoid duplicate spam within 5s

  function interruptSpeechIfLowerPriority(newPriority = 2) {
    if (!speaking || !currentItem) return;
    const curPriority = currentItem.priority ?? (currentItem.isReal ? 1 : 0);
    // Real user actions always interrupt bots (priority 0); Real Gifts (priority 3) also interrupt Join greetings (priority 1)
    if (!currentItem.isReal || (newPriority >= 3 && curPriority <= 1)) {
      clearTimeout(watchdog);
      try { currentVoiceSrc?.stop(); } catch {}
      currentVoiceSrc = null;
      if (typeof speechSynthesis !== 'undefined') {
        try { speechSynthesis.cancel(); } catch {}
      }
      currentItem = null;
      speaking = false;
      currentDone = null;
    }
  }

  function purgeQueuedBots() {
    for (let i = speechQueue.length - 1; i >= 0; i--) {
      if (!speechQueue[i].isReal) speechQueue.splice(i, 1);
    }
  }

  // Priority levels:
  // 3 = Real Gift (Highest)
  // 2 = Real Comment / Prayer (Any non-sensitive comment)
  // 1 = Real Join (Viewer entering room)
  // 0 = Bot / Mock (Lowest, only when hall is completely silent)
  function enqueueSpeech(item) {
    if (!enabled) return;
    const prio = item.priority ?? (item.isReal ? (item.kind === 'gift' ? 3 : item.kind === 'comment' ? 2 : 1) : 0);
    item.priority = prio;

    // Prevent exact duplicate text or duplicate uid+kind from stacking in the queue
    if (currentItem && currentItem.text === item.text && item.kind !== 'gift') {
      return;
    }
    if (speechQueue.some(x => x.text === item.text && item.kind !== 'gift')) {
      return;
    }

    if (item.isReal) {
      purgeQueuedBots();
      interruptSpeechIfLowerPriority(prio);

      // If this user is commenting or gifting, remove any pending 'join' greeting for the same uid in queue
      if (prio >= 2 && item.uid) {
        for (let i = speechQueue.length - 1; i >= 0; i--) {
          if (speechQueue[i].uid === item.uid && (speechQueue[i].priority ?? 1) < prio) {
            speechQueue.splice(i, 1);
          }
        }
      }

      // Insert in descending priority order (3: Gift > 2: Comment > 1: Join)
      const insertIdx = speechQueue.findIndex(x => (x.priority ?? 1) < prio);
      if (insertIdx === -1) speechQueue.push(item);
      else speechQueue.splice(insertIdx, 0, item);

      if (speechQueue.length > 8) speechQueue.pop();
    } else {
      // Bots never queue up if anyone (real or bot) is already speaking or waiting
      if (speaking || speechQueue.length > 0) return;
      speechQueue.push(item);
    }
    flushSpeech();
  }

  function speakBrowserFallback(text, done) {
    if (typeof speechSynthesis === 'undefined') {
      done();
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'vi-VN';
    u.rate = 0.85;
    u.pitch = 0.96;
    u.volume = 0.98;
    const v = viVoice || refreshViVoice();
    if (v) u.voice = v;
    u.onend = done;
    u.onerror = done;
    try {
      speechSynthesis.speak(u);
    } catch {
      done();
    }
  }

  async function flushSpeech() {
    if (!enabled || speaking || !speechQueue.length) return;
    const item = speechQueue.shift();
    currentItem = item;
    speaking = true;
    duckMusic(true);
    onSpeak?.(item.text, true, item.kind || 'gift');

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(watchdog);
      currentVoiceSrc = null;
      currentItem = null;
      currentDone = null;
      speaking = false;
      duckMusic(false);
      onSpeak?.('', false);
      setTimeout(flushSpeech, 320);
    };
    currentDone = done;

    watchdog = setTimeout(done, 11000);

    // Prefer our local server's natural Vietnamese neural TTS stream (/tts?q=...) via WebAudio
    // so it works reliably even in TikTok LIVE Studio CEF or Windows without vi-VN language pack.
    try {
      if (ctx.state !== 'running') await ctx.resume().catch(() => {});
      const res = await fetch(`/tts?q=${encodeURIComponent(item.text)}`);
      if (!res.ok) throw new Error('tts fetch failed');
      const arr = await res.arrayBuffer();
      const audioBuf = await ctx.decodeAudioData(arr);
      if (!enabled) {
        done();
        return;
      }
      const src = ctx.createBufferSource();
      src.buffer = audioBuf;
      // Calm, dignified temple speech pace — dry & crisp (no artificial delay echo)
      src.playbackRate.value = 0.96;
      const voiceGain = ctx.createGain();
      voiceGain.gain.value = 1.15;
      src.connect(voiceGain);
      voiceGain.connect(master);

      currentVoiceSrc = src;
      src.onended = done;
      src.start();
    } catch {
      speakBrowserFallback(item.text, done);
    }
  }

  // Soft singing bowl touch when a worshipper enters to pray
  function softBowl() {
    if (!enabled) return;
    const t = ctx.currentTime;
    for (const [r, a, d] of [[1, 0.12, 2.0], [2.756, 0.05, 1.3]]) {
      tone(432 * r, t, d, a);
    }
  }

  // Tier 0: Khánh / chuông gia trì (clear, bright high-pitched singing bowl chime)
  function chime() {
    if (!enabled) return;
    const t = ctx.currentTime;
    for (const [r, a, d] of [[1, 0.24, 2.4], [2.756, 0.14, 1.8], [5.404, 0.07, 1.1]]) {
      tone(528 * r, t, d, a);
    }
  }

  // Tier 1: Chuông chùa ấm (warm mid-pitched temple bell)
  function mediumBell() {
    if (!enabled) return;
    const t = ctx.currentTime;
    for (const [r, a] of [[1, 0.3], [2.0, 0.16], [2.76, 0.15], [5.4, 0.08]]) {
      tone(294 * r, t, 3.8 / Math.sqrt(r), a);
    }
  }

  // Tier 2: Đại hồng chung (deep, resonant grand temple bell)
  function bell() {
    if (!enabled) return;
    const t = ctx.currentTime;
    for (const [r, a] of [[0.5, 0.25], [1, 0.38], [2.76, 0.18], [5.4, 0.1], [8.93, 0.05]]) {
      tone(196 * r, t, 5.5 / Math.sqrt(Math.max(1, r)), a);
    }
  }

  // Auto-unlock and start meditation music by default on creation
  ctx.resume().then(() => { playMusic(); }).catch(() => { startSynthZen(); });

  return {
    get suspended() { return ctx.state !== 'running'; },
    unlock() {
      ctx.resume().catch(() => {});
      playMusic();
      refreshViVoice();
    },
    setEnabled(on) {
      enabled = on;
      master.gain.value = on ? 1 : 0;
      if (on) {
        playMusic();
        flushSpeech();
      } else {
        music.pause();
        stopSynthZen();
        speechQueue.length = 0;
        clearTimeout(watchdog);
        try { currentVoiceSrc?.stop(); } catch {}
        currentVoiceSrc = null;
        if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
        speaking = false;
        onSpeak?.('', false);
      }
    },
    woodBlock() {
      // Wood block ("tóc tóc") disabled per user preference; keep only peaceful meditation music, chimes/bells, and TTS.
    },
    softBowl,
    chime,
    mediumBell,
    bell,
    thankPrayer(actor) {
      if (!enabled || !actor) return;
      const now = Date.now();
      const isReal = Boolean(actor.src && actor.src !== 'mock');
      const who = cleanTtsName(actor.name);
      const nameKey = who.toLowerCase();
      if (isReal) {
        const lastGreet = recentRealGreet.get(actor.id) || 0;
        const lastName = recentNameGreet.get(nameKey) || 0;
        if (now - lastGreet < 15_000 || now - lastName < 15_000) return;
        recentRealGreet.set(actor.id, now);
        recentNameGreet.set(nameKey, now);
      } else {
        // Bots only speak when the hall is completely quiet (at most once every 18s)
        if (speaking || speechQueue.length > 0 || now - lastPrayerSpeechAt < 18_000) {
          softBowl();
          return;
        }
        lastPrayerSpeechAt = now;
      }
      softBowl();
      const text = `A Di Đà Phật. Chào mừng Phật tử ${who} vào chùa lễ Phật`;
      enqueueSpeech({ uid: actor.id, offering: 'join', repeat: 1, text, diamonds: 0, kind: 'join', priority: isReal ? 1 : 0, isReal });
    },
    speakComment(actor, rawComment = '') {
      if (!enabled || !actor) return;
      const now = Date.now();
      const isReal = Boolean(actor.src && actor.src !== 'mock');
      const who = cleanTtsName(actor.name);
      const cleanText = cleanCommentForTts(rawComment);
      if (!cleanText || !/[\p{L}\p{N}]/u.test(cleanText)) {
        // Comment was only emojis/icons; greet them instead if they haven't been greeted
        if (isReal) this.thankPrayer(actor);
        return;
      }
      const dedupeKey = `${actor.id}:${cleanText.toLowerCase()}`;
      if (now - (recentCommentSpeech.get(dedupeKey) || 0) < 6000) return;
      recentCommentSpeech.set(dedupeKey, now);

      if (!isReal) {
        if (speaking || speechQueue.length > 0 || now - lastPrayerSpeechAt < 18_000) {
          softBowl();
          return;
        }
        lastPrayerSpeechAt = now;
      } else {
        recentRealGreet.set(actor.id, now);
        recentNameGreet.set(who.toLowerCase(), now);
      }

      softBowl();
      const text = `Phật tử ${who}: ${cleanText}`;
      enqueueSpeech({ uid: actor.id, offering: 'comment', repeat: 1, text, diamonds: 0, kind: 'comment', priority: isReal ? 2 : 0, isReal });
    },
    thankJoin(msg) {
      if (!enabled || !msg) return;
      const isReal = Boolean(msg.src && msg.src !== 'mock');
      if (!isReal) return;
      const now = Date.now();
      const uid = msg.uid || msg.name;
      const who = cleanTtsName(msg.name);
      const nameKey = who.toLowerCase();
      const lastGreet = recentRealGreet.get(uid) || 0;
      const lastName = recentNameGreet.get(nameKey) || 0;
      if (now - lastGreet < 15_000 || now - lastName < 15_000) return;
      recentRealGreet.set(uid, now);
      recentNameGreet.set(nameKey, now);
      softBowl();
      const text = `A Di Đà Phật. Chào mừng Phật tử ${who} vào chùa lễ Phật`;
      enqueueSpeech({ uid, offering: 'join', repeat: 1, text, diamonds: 0, kind: 'join', priority: 1, isReal: true });
    },
    thankDonor(d) {
      if (!enabled || !d) return;
      const isReal = Boolean(d.src && d.src !== 'mock');
      const total = d.diamonds ?? 1;
      const offering = d.offering || 'dâng hương';
      if (total >= 20) bell();
      else if (total >= 5 || offering === 'dâng đèn hoa đăng') mediumBell();
      else chime();

      const repeat = Number(d.repeat) || 1;
      // Deduplicate if the same user already has a pending utterance in the queue
      const existing = speechQueue.find(x => x.uid && x.uid === d.uid && x.offering === offering);
      if (existing) {
        existing.repeat += repeat;
        existing.diamonds += total;
        existing.isReal = existing.isReal || isReal;
        existing.priority = existing.isReal ? 3 : 0;
        existing.text = formatTtsBlessing({ name: d.name, offering, repeat: existing.repeat, diamonds: existing.diamonds });
        if (isReal) {
          purgeQueuedBots();
          interruptSpeechIfLowerPriority(3);
        }
      } else {
        const text = formatTtsBlessing({ name: d.name, offering, repeat, diamonds: total });
        enqueueSpeech({ uid: d.uid, offering, repeat, text, diamonds: total, kind: 'gift', priority: isReal ? 3 : 0, isReal });
      }
    },
    playMusic,
  };
}
