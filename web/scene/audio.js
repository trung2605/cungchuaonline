// Sound (BR-07.9, BR-07.23). Wood block and bell are synthesized: no files, no license.
// Music plays assets/audio/music.mp3 if the owner has put a licensed file there.
const MAX_BLOCKS_PER_S = 4;

export function createAudio() {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.connect(ctx.destination);
  const music = new Audio('assets/audio/music.mp3');
  music.loop = true;
  music.volume = 0.35;
  let enabled = true, missing = false, blockTimes = [];
  music.onerror = () => { missing = true; };

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

  const playMusic = () => { if (enabled && !missing) music.play().catch(() => {}); };

  return {
    get suspended() { return ctx.state !== 'running'; },
    unlock() { ctx.resume(); playMusic(); },
    setEnabled(on) {
      enabled = on;
      master.gain.value = on ? 1 : 0;
      on ? playMusic() : music.pause();
    },
    woodBlock(now) {
      blockTimes = blockTimes.filter(t => now - t < 1000);
      if (!enabled || blockTimes.length >= MAX_BLOCKS_PER_S) return;
      blockTimes.push(now);
      const t = ctx.currentTime;
      tone(820, t, 0.14, 0.5, 'triangle', 520);
      tone(1650, t, 0.04, 0.15, 'square', 1200);
    },
    bell() {
      if (!enabled) return;
      const t = ctx.currentTime;
      // Inharmonic partials of a temple bell.
      for (const [r, a] of [[1, 0.35], [2.76, 0.18], [5.4, 0.1], [8.93, 0.05]]) tone(196 * r, t, 5 / Math.sqrt(r), a);
    },
    playMusic,
  };
}
