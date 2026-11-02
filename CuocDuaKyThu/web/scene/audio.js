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
  name => `Chào mừng ${name} cùng tham gia hành trình đi bộ xuyên Việt`,
];
let welcomeTemplateIdx = 0;

export function formatWelcomeSpeech(name = '', useFixed = true) {
  const who = cleanRaceTtsName(name);
  if (useFixed) {
    return `Chào mừng ${who} cùng tham gia hành trình đi bộ xuyên Việt`;
  }
  const fn = WELCOME_TEMPLATES[welcomeTemplateIdx++ % WELCOME_TEMPLATES.length];
  return fn(who);
}

export function formatGiftBoostSpeech({ name = '', giftVi = 'lễ vật', repeat = 1, mountLabel = 'Đôi Cánh Chim Lạc', bonusM = 80, isNewJoin = false } = {}) {
  const who = cleanRaceTtsName(name);
  const greet = isNewJoin ? `Chào mừng ${who} cùng tham gia hành trình đi bộ xuyên Việt. ` : '';
  const combo = repeat > 1 ? `${repeat} ${giftVi}` : giftVi;
  return `${greet}Cảm ơn ${who} đã tặng ${combo}, nhận ${mountLabel}, tiến thêm ${bonusM} mét trên hành trình xuyên Việt!`;
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

  // ============================================================================
  // VIETNAMESE ROYALTY-FREE FOLK & LOFI CHILL BGM JUKEBOX (100% TikTok Safe)
  // 5 Public-Domain Vietnamese Folk Songs arranged for Đàn Tranh, Sáo Trúc,
  // Warm Lofi Pad & Trống Cơm Beat:
  //   1. Trống Cơm (Dân ca Bắc Bộ - Lofi Chill Hành Hương)
  //   2. Bèo Dạt Mây Trôi (Dân ca Quan Họ - Đàn Tranh & Sáo Trúc)
  //   3. Lý Cây Bông (Dân ca Nam Bộ - Vãn Cảnh Vui Tươi)
  //   4. Cò Lả (Dân ca Đồng Bằng Bắc Bộ - Sáo Trúc Thanh Bình)
  //   5. Hoa Thơm Bướm Lượn (Quan Họ Bắc Ninh - Ngũ Cung Trong Trẻo)
  // ============================================================================
  const bgmGain = ctx.createGain();
  bgmGain.gain.value = 0.34;
  bgmGain.connect(master);

  // Pitch table (Hz) across 3 octaves for Vietnamese pentatonic arrangements
  const N = {
    C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
    R: 0, // Rest
  };

  // Each step is [noteFreq, durationInBeats, instrument ('zither' | 'flute' | 'both')]
  const VN_SONGS = [
    {
      id: 'trong_com',
      title: 'Trống Cơm (Dân Ca Lofi)',
      stepMs: 280,
      bassRoots: [N.C3, N.G3, N.A3, N.G3],
      drumPattern: [1, 0, 0.5, 0, 0.8, 0, 0.4, 0.5],
      notes: [
        // "Tình bằng có cái trống cơm, khen ai khéo vỗ..."
        [N.G4, 1, 'zither'], [N.A4, 1, 'zither'], [N.C5, 1, 'both'], [N.C5, 1, 'zither'],
        [N.D5, 1, 'both'], [N.C5, 1, 'zither'], [N.A4, 1, 'zither'], [N.G4, 1, 'both'],
        // "...ố mấy bông mà nên bông, ố mấy bông mà nên bông"
        [N.E4, 1, 'zither'], [N.G4, 1, 'zither'], [N.A4, 1, 'both'], [N.C5, 1, 'zither'],
        [N.A4, 1, 'zither'], [N.G4, 1, 'both'], [N.E4, 1, 'zither'], [N.D4, 1, 'zither'],
        // "Một bầy tang tình con nhện, một bầy tang tình con nhện..."
        [N.G4, 1, 'zither'], [N.G4, 1, 'zither'], [N.A4, 1, 'both'], [N.C5, 1, 'zither'],
        [N.D5, 1, 'both'], [N.E5, 1, 'flute'], [N.D5, 1, 'zither'], [N.C5, 1, 'both'],
        // "...giăng tơ, giăng tơ đi tìm, ơi mấy duyên..."
        [N.A4, 1, 'zither'], [N.C5, 1, 'zither'], [N.A4, 1, 'both'], [N.G4, 1, 'zither'],
        [N.E4, 1, 'zither'], [N.G4, 1, 'both'], [N.C4, 2, 'both'], [N.R, 1, 'zither'],
      ],
    },
    {
      id: 'beo_dat',
      title: 'Bèo Dạt Mây Trôi (Đàn Tranh)',
      stepMs: 360,
      bassRoots: [N.C3, N.A3, N.D3, N.G3],
      drumPattern: [0.7, 0, 0, 0.4, 0.6, 0, 0.3, 0],
      notes: [
        // "Bèo dạt mây trôi, chốn xa xôi..."
        [N.C4, 2, 'both'], [N.E4, 1, 'zither'], [N.G4, 2, 'flute'], [N.G4, 1, 'zither'],
        [N.A4, 1, 'both'], [N.C5, 2, 'flute'], [N.A4, 1, 'zither'], [N.G4, 2, 'both'],
        // "...Em ơi, anh vẫn đợi bèo dạt..."
        [N.E5, 2, 'flute'], [N.D5, 1, 'zither'], [N.C5, 1, 'both'], [N.A4, 1, 'zither'],
        [N.G4, 1, 'zither'], [N.E4, 1, 'both'], [N.G4, 1, 'zither'], [N.D4, 2, 'flute'],
        // "...Mây trôi, chim sa tang tình tính tang..."
        [N.E4, 1, 'zither'], [N.G4, 1, 'both'], [N.A4, 2, 'flute'], [N.C5, 1, 'zither'],
        [N.D5, 1, 'zither'], [N.C5, 1, 'both'], [N.A4, 1, 'zither'], [N.G4, 2, 'flute'],
        [N.E4, 1, 'zither'], [N.D4, 1, 'zither'], [N.C4, 2, 'both'], [N.R, 1, 'zither'],
      ],
    },
    {
      id: 'ly_cay_bong',
      title: 'Lý Cây Bông (Dân Ca Nam Bộ)',
      stepMs: 295,
      bassRoots: [N.C3, N.E3, N.G3, N.C3],
      drumPattern: [0.9, 0, 0.4, 0.5, 0.8, 0, 0.5, 0],
      notes: [
        // "Bông xanh bông trắng rồi lại vàng bông, ơi bạn ơi..."
        [N.E4, 1, 'zither'], [N.G4, 1, 'zither'], [N.A4, 1, 'both'], [N.A4, 1, 'zither'],
        [N.G4, 1, 'zither'], [N.A4, 1, 'both'], [N.C5, 1, 'flute'], [N.A4, 1, 'zither'],
        [N.G4, 2, 'both'], [N.E4, 1, 'zither'], [N.G4, 1, 'zither'],
        // "...Bông lê cho bằng bông lựu, ơi bạn ơi..."
        [N.A4, 1, 'zither'], [N.C5, 1, 'both'], [N.D5, 1, 'flute'], [N.E5, 1, 'flute'],
        [N.D5, 1, 'zither'], [N.C5, 1, 'both'], [N.A4, 1, 'zither'], [N.G4, 1, 'zither'],
        [N.E4, 1, 'zither'], [N.G4, 1, 'both'], [N.D4, 1, 'zither'], [N.C4, 2, 'both'],
      ],
    },
    {
      id: 'co_la',
      title: 'Cò Lả (Sáo Trúc Đồng Quê)',
      stepMs: 325,
      bassRoots: [N.G3, N.D3, N.E3, N.C3],
      drumPattern: [0.8, 0, 0.3, 0, 0.6, 0.3, 0, 0],
      notes: [
        // "Con cò cò bay lả lả bay la..."
        [N.G4, 1, 'both'], [N.A4, 1, 'zither'], [N.C5, 2, 'flute'], [N.D5, 1, 'zither'],
        [N.E5, 1, 'flute'], [N.D5, 1, 'zither'], [N.C5, 1, 'both'], [N.A4, 2, 'flute'],
        // "...Bay từ từ cửa phủ, bay ra ra cánh đồng..."
        [N.C5, 1, 'zither'], [N.A4, 1, 'zither'], [N.G4, 1, 'both'], [N.E4, 1, 'zither'],
        [N.G4, 1, 'both'], [N.A4, 1, 'flute'], [N.G4, 1, 'zither'], [N.E4, 1, 'zither'],
        [N.D4, 2, 'both'], [N.E4, 1, 'zither'], [N.G4, 2, 'both'], [N.R, 1, 'zither'],
      ],
    },
    {
      id: 'tay_bac',
      title: 'Sáo Mèo Tây Bắc – Inh Lả Ơi',
      stepMs: 290,
      bassRoots: [N.A3, N.E3, N.D3, N.A3],
      drumPattern: [0.85, 0, 0.4, 0.3, 0.75, 0, 0.5, 0],
      notes: [
        // "Inh lả ơi, sao noọng ời, khắp núi rừng Tây Bắc sáng ngời..."
        [N.A4, 1, 'flute'], [N.C5, 1, 'flute'], [N.D5, 2, 'both'], [N.E5, 1, 'flute'],
        [N.G5, 1, 'flute'], [N.E5, 2, 'both'], [N.D5, 1, 'zither'], [N.C5, 1, 'flute'],
        [N.A4, 2, 'both'], [N.G4, 1, 'flute'], [N.A4, 1, 'zither'],
        [N.C5, 1, 'flute'], [N.D5, 1, 'both'], [N.E5, 2, 'flute'], [N.D5, 1, 'zither'],
        [N.C5, 1, 'flute'], [N.A4, 1, 'zither'], [N.G4, 1, 'flute'], [N.A4, 2, 'both'],
      ],
    },
    {
      id: 'luu_thuy',
      title: 'Lưu Thủy Kim Tiền (Nhã Nhạc Huế)',
      stepMs: 300,
      bassRoots: [N.D3, N.A3, N.G3, N.D3],
      drumPattern: [0.9, 0, 0.5, 0, 0.85, 0.4, 0.5, 0],
      notes: [
        // Giai điệu Nhã nhạc cung đình Huế trang nhã, rộn ràng
        [N.D4, 1, 'zither'], [N.F4, 1, 'zither'], [N.G4, 1, 'both'], [N.A4, 2, 'zither'],
        [N.C5, 1, 'flute'], [N.D5, 1, 'both'], [N.C5, 1, 'zither'], [N.A4, 1, 'zither'],
        [N.G4, 1, 'both'], [N.F4, 1, 'zither'], [N.G4, 2, 'flute'],
        [N.A4, 1, 'zither'], [N.C5, 1, 'zither'], [N.D5, 2, 'both'], [N.F5, 1, 'flute'],
        [N.D5, 1, 'zither'], [N.C5, 1, 'zither'], [N.A4, 1, 'both'], [N.D4, 2, 'both'],
      ],
    },
    {
      id: 'tay_nguyen',
      title: 'Đàn T’rưng Đà Lạt & Phố Biển',
      stepMs: 265,
      bassRoots: [N.C3, N.G3, N.E3, N.A3],
      drumPattern: [0.9, 0.3, 0.5, 0, 0.8, 0.3, 0.6, 0],
      notes: [
        // Âm hưởng Đàn T'rưng tre nứa Tây Nguyên & nắng gió biển Nha Trang
        [N.G4, 1, 'zither'], [N.C5, 1, 'zither'], [N.E5, 1, 'both'], [N.G5, 1, 'zither'],
        [N.E5, 1, 'zither'], [N.D5, 1, 'flute'], [N.C5, 2, 'both'],
        [N.A4, 1, 'zither'], [N.C5, 1, 'zither'], [N.D5, 1, 'both'], [N.E5, 1, 'flute'],
        [N.D5, 1, 'zither'], [N.C5, 1, 'zither'], [N.G4, 2, 'both'],
        [N.E4, 1, 'zither'], [N.G4, 1, 'zither'], [N.A4, 1, 'flute'], [N.C5, 2, 'both'],
      ],
    },
    {
      id: 'hoa_thom',
      title: 'Hoa Thơm Bướm Lượn (Quan Họ)',
      stepMs: 310,
      bassRoots: [N.G3, N.E3, N.C3, N.D3],
      drumPattern: [0.8, 0, 0.4, 0, 0.7, 0, 0.4, 0],
      notes: [
        // "Hoa thơm bướm lượn trên cành..."
        [N.D4, 1, 'zither'], [N.G4, 1, 'both'], [N.A4, 1, 'zither'], [N.B4, 2, 'flute'],
        [N.A4, 1, 'zither'], [N.G4, 2, 'both'],
        [N.A4, 1, 'zither'], [N.B4, 1, 'zither'], [N.D5, 2, 'flute'], [N.B4, 1, 'zither'],
        [N.A4, 1, 'both'], [N.G4, 1, 'zither'], [N.E4, 1, 'zither'], [N.D4, 2, 'both'],
        [N.E4, 1, 'zither'], [N.G4, 1, 'both'], [N.A4, 1, 'flute'], [N.G4, 2, 'both'],
      ],
    },
  ];

  // Maps each Vietnamese biome ID to its signature regional folk melody ID
  const BIOME_SONG_MAP = {
    vn_hagiang: 'tay_bac',
    vn_sapa: 'tay_bac',
    vn_halong: 'beo_dat',
    vn_hanoi: 'trong_com',
    vn_ninhbinh: 'co_la',
    vn_hue: 'luu_thuy',
    vn_danang: 'hoa_thom',
    vn_hoian: 'beo_dat',
    vn_dalat: 'tay_nguyen',
    vn_nhatrang: 'tay_nguyen',
    vn_saigon: 'trong_com',
    vn_mientay: 'ly_cay_bong',
    vietnam: 'trong_com',
  };

  // Plucked Đàn Tranh (16-string Vietnamese zither)
  function playDanTranh(freq, start, dur, vol = 0.14) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || freq <= 0) return;
    for (const [mult, peak, d, type] of [
      [1, vol, dur * 1.45, 'triangle'],
      [2, vol * 0.38, dur * 0.85, 'sine'],
      [3, vol * 0.14, dur * 0.45, 'sine'],
    ]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      // Subtle Vietnamese zither pitch grace (nhấn đàn tranh)
      o.frequency.setValueAtTime(freq * mult * 1.012, start);
      o.frequency.exponentialRampToValueAtTime(freq * mult, start + 0.045);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(peak, start + 0.018);
      g.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.18, d));
      o.connect(g).connect(bgmGain);
      o.start(start);
      o.stop(start + Math.max(0.18, d) + 0.03);
    }
  }

  // Breathy Sáo Trúc (Vietnamese bamboo flute with gentle 5.5Hz vibrato)
  function playSaoTruc(freq, start, dur, vol = 0.095) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || freq <= 0) return;
    const o = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, start);
    lfo.frequency.setValueAtTime(5.4, start);
    lfoGain.gain.setValueAtTime(freq * 0.008, start);
    lfo.connect(lfoGain).connect(o.frequency);

    const totalDur = Math.max(0.28, dur * 1.15);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.065);
    g.gain.exponentialRampToValueAtTime(0.0001, start + totalDur);
    o.connect(g).connect(bgmGain);
    o.start(start);
    lfo.start(start);
    o.stop(start + totalDur + 0.03);
    lfo.stop(start + totalDur + 0.03);
  }

  // Warm Lofi Pentatonic Pad & Bass
  function playWarmPad(rootFreq, start, dur, vol = 0.075) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || rootFreq <= 0) return;
    for (const ratio of [1, 1.5, 2]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(rootFreq * ratio, start);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(ratio === 1 ? vol : vol * 0.55, start + dur * 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      o.connect(g).connect(bgmGain);
      o.start(start);
      o.stop(start + dur + 0.04);
    }
  }

  // Soft woody Trống Cơm / Lofi pulse
  function playTrongComBeat(start, accent = 1) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || accent <= 0) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    const startFreq = accent >= 0.8 ? 135 : 185;
    const endFreq = accent >= 0.8 ? 58 : 92;
    o.frequency.setValueAtTime(startFreq, start);
    o.frequency.exponentialRampToValueAtTime(endFreq, start + 0.11);
    g.gain.setValueAtTime(0.085 * accent, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);
    o.connect(g).connect(bgmGain);
    o.start(start);
    o.stop(start + 0.14);
  }

  let bgRunning = false;
  let bgTimer = null;
  let bgmMuted = false;
  let autoCycleSongs = true;
  let currentSongIdx = 0;
  let noteCursor = 0;
  let tickCount = 0;

  function duckBgm(duck) {
    if (ctx.state === 'running') {
      const target = bgmMuted ? 0 : duck ? 0.09 : 0.34;
      bgmGain.gain.setTargetAtTime(target, ctx.currentTime, 0.15);
    }
  }

  function tickBg() {
    if (!bgRunning) return;
    const song = VN_SONGS[currentSongIdx % VN_SONGS.length];
    let waitMs = song.stepMs;

    if (enabled && !bgmMuted && ctx.state === 'running') {
      const t = ctx.currentTime;
      const [freq, beats, inst] = song.notes[noteCursor % song.notes.length];
      waitMs = song.stepMs * Math.max(1, beats);
      const durSec = (waitMs / 1000) * 0.95;

      // Play warm bass + pad every 8 steps
      if (tickCount % 8 === 0) {
        const bassRoot = song.bassRoots[Math.floor(tickCount / 8) % song.bassRoots.length];
        playWarmPad(bassRoot, t, (song.stepMs * 8) / 1000, 0.08);
      }

      // Play gentle Trống Cơm rhythm
      const drumAccent = song.drumPattern[tickCount % song.drumPattern.length] || 0;
      if (drumAccent > 0) {
        playTrongComBeat(t, drumAccent);
      }

      // Play Vietnamese melody note (Đàn Tranh + Sáo Trúc)
      if (freq > 0) {
        if (inst === 'zither' || inst === 'both') {
          playDanTranh(freq, t, durSec, 0.145);
          // Occasional octave harmony pluck
          if (beats >= 2) playDanTranh(freq * 0.5, t + 0.03, durSec, 0.065);
        }
        if (inst === 'flute' || inst === 'both') {
          playSaoTruc(freq, t + 0.01, durSec, inst === 'flute' ? 0.105 : 0.075);
        }
      }

      noteCursor++;
      tickCount++;

      // After playing a song twice through (~45-60s), smoothly advance to the next Vietnamese song if in auto mode
      if (noteCursor >= song.notes.length * 2) {
        noteCursor = 0;
        if (autoCycleSongs) {
          currentSongIdx = (currentSongIdx + 1) % VN_SONGS.length;
        }
      }
    }
    bgTimer = setTimeout(tickBg, waitMs);
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
    duckBgm(true);
    onSpeak?.(item.text, true);

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(watchdog);
      currentVoiceSrc = null;
      currentItem = null;
      speaking = false;
      duckBgm(false);
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

  // Auto-start background music immediately on creation and keep it permanently running 24/7
  ctx.resume().then(() => { startBg(); }).catch(() => { startBg(); });
  setInterval(() => {
    if (!isPreviewIframe) {
      enabled = true;
      bgmMuted = false;
      master.gain.value = 1;
      if (ctx.state !== 'running') ctx.resume().catch(() => {});
      if (!bgRunning) startBg();
    }
  }, 1500);

  return {
    get suspended() {
      return ctx.state !== 'running';
    },
    get readComments() {
      return readComments;
    },
    getBgmLabel() {
      const song = VN_SONGS[currentSongIdx % VN_SONGS.length];
      return `🔊 Nhạc Việt: ${song.title}`;
    },
    nextBgmTrack() {
      // Sound is always ON: cycling only switches to the next Vietnamese folk song and never mutes
      bgmMuted = false;
      if (ctx.state !== 'running') ctx.resume().catch(() => {});
      startBg();
      currentSongIdx = (currentSongIdx + 1) % VN_SONGS.length;
      noteCursor = 0;
      duckBgm(speaking);
      return this.getBgmLabel();
    },
    setBiomeMusic(biomeId) {
      bgmMuted = false;
      const targetSongId = BIOME_SONG_MAP[biomeId];
      if (!targetSongId) return this.getBgmLabel();
      const idx = VN_SONGS.findIndex(s => s.id === targetSongId);
      if (idx !== -1 && idx !== currentSongIdx) {
        currentSongIdx = idx;
        noteCursor = 0;
      }
      return this.getBgmLabel();
    },
    unlock() {
      if (isPreviewIframe) return;
      enabled = true;
      bgmMuted = false;
      master.gain.value = 1;
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
    setEnabled(_on) {
      // Sound is permanently enabled on main livestream display (never turns off)
      if (isPreviewIframe) return;
      enabled = true;
      bgmMuted = false;
      master.gain.value = 1;
      startBg();
      flushSpeech();
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
