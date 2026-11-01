// Sound (BR-07.9, BR-07.23). Wood block, chime (khánh), temple bell and grand bell are synthesized.
// TTS uses Web Speech API (vi-VN) with a smart priority queue to thank gift donors.
// Music plays assets/audio/music.mp3 if the owner has put a licensed file there.
const MAX_BLOCKS_PER_S = 4;
const MAX_SPEECH_QUEUE = 3;

// Cleans TikTok handles/nicknames so Vietnamese TTS pronounces them naturally.
export function cleanTtsName(raw = '') {
  let s = String(raw).trim();
  if (!s) return 'Phật tử';
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
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.connect(ctx.destination);
  const music = new Audio('assets/audio/music.mp3');
  music.loop = true;
  music.volume = 0.32;
  let enabled = true, missing = false, triedWav = false, blockTimes = [];
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
  let lastPrayerSpeechAt = 0;

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
    speaking = true;
    duckMusic(true);
    onSpeak?.(item.text, true, item.kind || 'gift');

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(watchdog);
      currentVoiceSrc = null;
      speaking = false;
      duckMusic(false);
      onSpeak?.('', false);
      setTimeout(flushSpeech, 450);
    };

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
      // Calm, dignified temple speech pace
      src.playbackRate.value = 0.94;
      const voiceGain = ctx.createGain();
      voiceGain.gain.value = 1.15;
      // Subtle temple hall echo (110ms soft feedback delay)
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.11;
      const echoGain = ctx.createGain();
      echoGain.gain.value = 0.14;
      src.connect(voiceGain);
      voiceGain.connect(master);
      voiceGain.connect(delay);
      delay.connect(echoGain);
      echoGain.connect(master);

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

  return {
    get suspended() { return ctx.state !== 'running'; },
    unlock() {
      ctx.resume();
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
      // Gently announce a worshipper's prayer when the gift queue is quiet (at most once every 14s)
      if (speaking || speechQueue.length > 0 || now - lastPrayerSpeechAt < 14_000) {
        softBowl();
        return;
      }
      lastPrayerSpeechAt = now;
      softBowl();
      const who = cleanTtsName(actor.name);
      const intent = (actor.intent || 'Cầu Bình An').toLowerCase();
      const text = `Nam mô A Di Đà Phật. Phật tử ${who} thành tâm lễ Phật, ${intent}`;
      speechQueue.push({ uid: actor.id, offering: 'prayer', repeat: 1, text, diamonds: 0, kind: 'prayer' });
      flushSpeech();
    },
    thankDonor(d) {
      if (!enabled || !d) return;
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
        existing.text = formatTtsBlessing({ name: d.name, offering, repeat: existing.repeat, diamonds: existing.diamonds });
      } else {
        const text = formatTtsBlessing({ name: d.name, offering, repeat, diamonds: total });
        if (speechQueue.length >= MAX_SPEECH_QUEUE) {
          // Drop the lowest-value queued item if full
          let minIdx = 0;
          for (let i = 1; i < speechQueue.length; i++) {
            if (speechQueue[i].diamonds < speechQueue[minIdx].diamonds) minIdx = i;
          }
          if (total >= speechQueue[minIdx].diamonds) speechQueue.splice(minIdx, 1);
          else return;
        }
        speechQueue.push({ uid: d.uid, offering, repeat, text, diamonds: total, kind: 'gift' });
      }
      flushSpeech();
    },
    playMusic,
  };
}
