// Audio & Vietnamese AI TTS for Cuộc Đua Kỳ Thú:
// - Speaks "Chào user [tên] đã tham gia cuộc đua cùng chúng tôi" when a viewer joins!
// - Speaks gift thank-you + boost announcements when a viewer sends a TikTok gift!
// - Synthesizes upbeat, 100% copyright-free adventure synth music + turbo/boost sound effects.

const MAX_SPEECH_QUEUE = 4;

export function cleanRaceTtsName(raw = '') {
  let s = String(raw).trim();
  if (!s) return 'bạn mới';
  if (/^user\d{4,}$/i.test(s)) return 'bạn mới';
  s = s.replace(/[_.\\-]+/g, ' ').replace(/\s*\d{3,}$/g, '').trim();
  if (!s || /^\d+$/.test(s) || s.length < 2) return 'bạn mới';
  return s;
}

export function formatWelcomeSpeech(name = '') {
  const who = cleanRaceTtsName(name);
  return `Chào user ${who} đã tham gia cuộc đua cùng chúng tôi`;
}

export function formatGiftBoostSpeech({ name = '', giftVi = 'quà', repeat = 1, mountLabel = 'Đôi Cánh Năng Lượng', bonusM = 80, isNewJoin = false } = {}) {
  const who = cleanRaceTtsName(name);
  const greet = isNewJoin ? `Chào user ${who} đã tham gia cuộc đua cùng chúng tôi. ` : '';
  const combo = repeat > 1 ? `${repeat} ${giftVi}` : giftVi;
  return `${greet}Cảm ơn user ${who} đã tặng ${combo}, kích hoạt ${mountLabel}, bứt tốc cộng thêm ${bonusM} mét!`;
}

export function createRaceAudio({ onSpeak = null } = {}) {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.connect(ctx.destination);

  let enabled = true;
  const speechQueue = [];
  let speaking = false;
  let lastWelcomeSpeechAt = 0;
  let watchdog = null;
  let currentVoiceSrc = null;

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

  // Upbeat procedural adventure pulse (copyright-free)
  let bgRunning = false;
  let bgTimer = null;
  let stepIdx = 0;
  const CHORD_NOTES = [261.63, 329.63, 392.00, 523.25, 587.33, 659.25];

  function tickBg() {
    if (!bgRunning) return;
    if (enabled && ctx.state === 'running' && !speaking) {
      const t = ctx.currentTime;
      const n1 = CHORD_NOTES[stepIdx % CHORD_NOTES.length];
      const n2 = CHORD_NOTES[(stepIdx + 2) % CHORD_NOTES.length];
      tone(n1 * 0.5, t, 0.35, 0.045, 'sine');
      tone(n2, t + 0.18, 0.28, 0.035, 'triangle');
      stepIdx++;
    }
    bgTimer = setTimeout(tickBg, 450);
  }

  function startBg() {
    if (bgRunning) return;
    bgRunning = true;
    tickBg();
  }

  function joinChime() {
    if (!enabled) return;
    const t = ctx.currentTime;
    tone(523.25, t, 0.18, 0.14, 'triangle', 659.25);
    tone(659.25, t + 0.12, 0.25, 0.16, 'triangle', 783.99);
  }

  function boostSfx(tier = 1) {
    if (!enabled) return;
    const t = ctx.currentTime;
    if (tier >= 3) {
      // Grand fanfare + rocket whoosh
      for (const [i, f] of [523.25, 659.25, 783.99, 1046.5].entries()) {
        tone(f, t + i * 0.09, 0.38, 0.2, 'sawtooth', f * 1.05);
      }
    } else {
      tone(330, t, 0.35, 0.18, 'sawtooth', 880);
      tone(660, t + 0.1, 0.3, 0.15, 'triangle', 1120);
    }
  }

  async function flushSpeech() {
    if (!enabled || speaking || !speechQueue.length) return;
    const item = speechQueue.shift();
    speaking = true;
    onSpeak?.(item.text, true);

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(watchdog);
      currentVoiceSrc = null;
      speaking = false;
      onSpeak?.('', false);
      setTimeout(flushSpeech, 320);
    };

    watchdog = setTimeout(done, 10_000);

    try {
      if (ctx.state !== 'running') await ctx.resume().catch(() => {});
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
      src.playbackRate.value = 1.04; // Energetic commentator pace
      const g = ctx.createGain();
      g.gain.value = 1.2;
      src.connect(g).connect(master);
      currentVoiceSrc = src;
      src.onended = done;
      src.start();
    } catch {
      if (typeof speechSynthesis !== 'undefined') {
        const u = new SpeechSynthesisUtterance(item.text);
        u.lang = 'vi-VN';
        u.rate = 1.0;
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
      ctx.resume();
      startBg();
    },
    setEnabled(on) {
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
        speaking = false;
        onSpeak?.('', false);
      }
    },
    greetJoin(msg) {
      if (!enabled || !msg) return;
      joinChime();
      const now = Date.now();
      // Avoid queuing too many free join greetings if gift announcements are speaking
      if (speechQueue.length >= 2 || (speaking && now - lastWelcomeSpeechAt < 5000)) return;
      lastWelcomeSpeechAt = now;
      const text = msg.text || formatWelcomeSpeech(msg.name);
      speechQueue.push({ text, priority: 1 });
      flushSpeech();
    },
    announceGift(d) {
      if (!enabled || !d) return;
      boostSfx(d.tier || 1);
      const text = formatGiftBoostSpeech(d);
      if (speechQueue.length >= MAX_SPEECH_QUEUE) {
        speechQueue.shift();
      }
      speechQueue.push({ text, priority: 2 + (d.tier || 1) });
      flushSpeech();
    },
  };
}
