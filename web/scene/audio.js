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

// Pitch table (Hz) across 3 octaves for Buddhist Remix, Cổ Phong, Handpan, Tibetan & Zen
const N = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
};

// ============================================================================
// 12 MULTI-STYLE BUDDHIST REMIX, MYSTICAL & ZEN TRACKS FOR CÚNG CHÙA ONLINE
// ============================================================================
export const TEMPLE_SONGS = [
  {
    id: 'buddha_vinahouse_remix',
    title: '🔥 Nam Mô A Di Đà Phật Remix (Vinahouse Hoan Hỷ)',
    genre: 'Nhạc Phật Remix · Vinahouse Sôi Động',
    style: 'vinahouse',
    stepMs: 225,
    bassRoots: [N.A3, N.F3, N.C3, N.G3],
    notes: [
      [N.A4, 1, 'lead'], [N.C5, 1, 'lead'], [N.D5, 1, 'both'], [N.E5, 1, 'lead'],
      [N.E5, 1, 'zither'], [N.D5, 1, 'lead'], [N.C5, 1, 'zither'], [N.A4, 1, 'both'],
      [N.G4, 1, 'lead'], [N.A4, 1, 'lead'], [N.C5, 1, 'both'], [N.D5, 1, 'lead'],
      [N.E5, 1, 'both'], [N.G5, 1, 'lead'], [N.E5, 2, 'both'],
      [N.D5, 1, 'lead'], [N.C5, 1, 'zither'], [N.A4, 1, 'lead'], [N.G4, 1, 'zither'],
      [N.A4, 2, 'both'], [N.A4, 2, 'lead'],
    ],
  },
  {
    id: 'dai_bi_trap_remix',
    title: '⚡ Chú Đại Bi Future Bass & Trap 808 Remix',
    genre: 'Nhạc Phật Remix · Trap 808 & Sáo Trúc',
    style: 'trap',
    stepMs: 240,
    bassRoots: [N.D3, N.A3, N.C3, N.G3],
    notes: [
      [N.D5, 1, 'flute'], [N.F5, 1, 'zither'], [N.E5, 1, 'lead'], [N.D5, 1, 'both'],
      [N.C5, 1, 'zither'], [N.A4, 1, 'flute'], [N.C5, 2, 'both'],
      [N.D5, 1, 'lead'], [N.A4, 1, 'zither'], [N.G4, 1, 'flute'], [N.F4, 1, 'zither'],
      [N.G4, 1, 'lead'], [N.A4, 1, 'both'], [N.D4, 2, 'both'],
    ],
  },
  {
    id: 'co_phong_dan_tranh_remix',
    title: '🌸 Cổ Phong Đàn Tranh & Đàn Bầu Remix (Viet-Chill)',
    genre: 'Cổ Phong Điện Tử · Đàn Tranh & Đàn Bầu',
    style: 'co_phong',
    stepMs: 245,
    bassRoots: [N.C3, N.A3, N.F3, N.G3],
    notes: [
      [N.E4, 1, 'zither'], [N.G4, 1, 'zither'], [N.A4, 2, 'bau'], [N.C5, 1, 'zither'],
      [N.D5, 1, 'flute'], [N.E5, 2, 'bau'], [N.D5, 1, 'zither'], [N.C5, 1, 'zither'],
      [N.A4, 2, 'both'], [N.G4, 1, 'zither'], [N.E4, 1, 'zither'], [N.G4, 2, 'bau'],
      [N.A4, 1, 'zither'], [N.C5, 1, 'flute'], [N.A4, 2, 'both'],
    ],
  },
  {
    id: 'deep_house_chanh_dien',
    title: '🎧 Tịnh Độ Deep House & Chuông Ngọc (Melodic House)',
    genre: 'Nhạc Lạ · Melodic Spiritual House',
    style: 'deep_house',
    stepMs: 240,
    bassRoots: [N.A3, N.E3, N.F3, N.G3],
    notes: [
      [N.E4, 1, 'guitar'], [N.A4, 1, 'lead'], [N.B4, 1, 'zither'], [N.C5, 2, 'both'],
      [N.B4, 1, 'guitar'], [N.A4, 1, 'lead'], [N.G4, 2, 'flute'],
      [N.E4, 1, 'zither'], [N.G4, 1, 'lead'], [N.A4, 2, 'both'], [N.C5, 1, 'zither'],
      [N.D5, 1, 'lead'], [N.E5, 2, 'both'], [N.A4, 2, 'both'],
    ],
  },
  {
    id: 'handpan_lien_hoa',
    title: '🛸 Trống Handpan Vũ Trụ & Suối Nguồn Tâm Linh',
    genre: 'Nhạc Lạ Độc Đáo · Celestial Handpan',
    style: 'handpan',
    stepMs: 260,
    bassRoots: [N.D3, N.A3, N.C3, N.G3],
    notes: [
      [N.D4, 1, 'handpan'], [N.A4, 1, 'handpan'], [N.C5, 1, 'handpan'], [N.D5, 1, 'handpan'],
      [N.F5, 1, 'handpan'], [N.E5, 1, 'handpan'], [N.C5, 1, 'handpan'], [N.A4, 1, 'handpan'],
      [N.G4, 1, 'handpan'], [N.A4, 1, 'handpan'], [N.C5, 1, 'handpan'], [N.E5, 1, 'handpan'],
      [N.D5, 2, 'handpan'], [N.A4, 1, 'handpan'], [N.D4, 2, 'handpan'],
    ],
  },
  {
    id: 'tay_tang_mat_tong',
    title: '🏔️ Mật Tông Tây Tạng Huyền Bí (Om Mani Padme Hum)',
    genre: 'Nhạc Lạ Huyền Bí · Tibetan Mystical Drone',
    style: 'tibetan',
    stepMs: 310,
    bassRoots: [N.D3, N.D3, N.C3, N.D3],
    notes: [
      [N.D4, 2, 'tibetan'], [N.F4, 1, 'zither'], [N.G4, 1, 'flute'], [N.A4, 2, 'tibetan'],
      [N.C5, 1, 'flute'], [N.A4, 2, 'tibetan'], [N.G4, 1, 'zither'], [N.F4, 1, 'flute'],
      [N.D4, 3, 'tibetan'],
    ],
  },
  {
    id: 'cyber_zen_synthwave',
    title: '🌌 Phật Quang Synthwave & Ngân Hà (Cosmic Retrowave)',
    genre: 'Nhạc Lạ · Cosmic Retrowave & Chuông Chùa',
    style: 'synthwave',
    stepMs: 235,
    bassRoots: [N.A3, N.F3, N.C3, N.G3],
    notes: [
      [N.A4, 1, 'lead'], [N.E5, 1, 'lead'], [N.C5, 1, 'zither'], [N.A4, 1, 'lead'],
      [N.G4, 1, 'lead'], [N.D5, 1, 'lead'], [N.B4, 1, 'zither'], [N.G4, 1, 'lead'],
      [N.F4, 1, 'lead'], [N.C5, 1, 'lead'], [N.A4, 1, 'zither'], [N.C5, 1, 'lead'],
      [N.E5, 2, 'both'], [N.D5, 1, 'lead'], [N.A4, 2, 'both'],
    ],
  },
  {
    id: 'vu_dieu_hoan_hy_edm',
    title: '🎉 Vũ Điệu Hoan Hỷ Công Đức (Festival EDM Remix)',
    genre: 'Nhạc Phật Remix · Festival Progressive',
    style: 'vinahouse',
    stepMs: 230,
    bassRoots: [N.C3, N.G3, N.A3, N.F3],
    notes: [
      [N.C5, 1, 'lead'], [N.D5, 1, 'lead'], [N.E5, 1, 'both'], [N.G5, 1, 'lead'],
      [N.E5, 1, 'zither'], [N.D5, 1, 'lead'], [N.C5, 2, 'both'],
      [N.A4, 1, 'lead'], [N.C5, 1, 'zither'], [N.D5, 1, 'lead'], [N.E5, 1, 'both'],
      [N.D5, 1, 'lead'], [N.C5, 1, 'zither'], [N.G4, 1, 'lead'], [N.C5, 2, 'both'],
    ],
  },
  {
    id: 'quan_am_lofi_chill',
    title: '🪷 Quan Âm Lofi Hip-Hop & Tiếng Đàn Đêm (Lofi Chill)',
    genre: 'Lofi Chillhop · Piano & Đàn Tranh',
    style: 'lofi',
    stepMs: 280,
    bassRoots: [N.C3, N.A3, N.F3, N.G3],
    notes: [
      [N.E4, 1, 'guitar'], [N.G4, 1, 'zither'], [N.A4, 2, 'bau'], [N.C5, 1, 'flute'],
      [N.D5, 2, 'both'], [N.C5, 1, 'guitar'], [N.A4, 2, 'bau'],
      [N.G4, 1, 'zither'], [N.E4, 1, 'guitar'], [N.D4, 1, 'zither'], [N.C4, 2, 'both'],
    ],
  },
  {
    id: 'duoc_su_jazz_lounge',
    title: '☕ Dược Sư Lưu Ly Acoustic & Neo-Soul Piano',
    genre: 'Acoustic Lounge · Rhodes Piano & Guitar',
    style: 'lofi',
    stepMs: 270,
    bassRoots: [N.D3, N.G3, N.C3, N.A3],
    notes: [
      [N.F4, 1, 'guitar'], [N.A4, 2, 'zither'], [N.C5, 1, 'flute'], [N.D5, 2, 'both'],
      [N.E5, 1, 'guitar'], [N.C5, 1, 'zither'], [N.A4, 2, 'flute'], [N.G4, 1, 'guitar'],
      [N.F4, 1, 'zither'], [N.D4, 2, 'both'],
    ],
  },
  {
    id: 'zen_singing_bowl',
    title: '🥣 Thiền Chuông Xoay Himalaya & Đàn Tranh 432Hz',
    genre: 'Thiền Định Truyền Thống · Singing Bowl',
    style: 'zen',
    stepMs: 320,
    bassRoots: [N.C3, N.G3, N.A3, N.F3],
    notes: [
      [N.C4, 2, 'zither'], [N.E4, 1, 'zither'], [N.G4, 2, 'flute'], [N.A4, 2, 'both'],
      [N.C5, 2, 'flute'], [N.A4, 1, 'zither'], [N.G4, 2, 'both'], [N.E4, 2, 'zither'],
    ],
  },
  {
    id: 'nhac_thien_ngon_gio',
    title: '🍃 Sáo Trúc Thiền Viện & Chuông Gió Cổ Tự',
    genre: 'Thiền Tự Nhiên · Sáo Trúc & Guitar Mộc',
    style: 'zen',
    stepMs: 300,
    bassRoots: [N.G3, N.E3, N.C3, N.D3],
    notes: [
      [N.G4, 2, 'flute'], [N.A4, 1, 'guitar'], [N.B4, 2, 'flute'], [N.D5, 2, 'both'],
      [N.B4, 1, 'zither'], [N.A4, 2, 'flute'], [N.G4, 2, 'both'],
    ],
  },
];

export function createAudio({ onSpeak = null } = {}) {
  const isPreviewIframe = (() => {
    try { return new URLSearchParams(location.search).get('preview') === '1'; } catch { return false; }
  })();
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.connect(ctx.destination);
  // Route WebAudio through a live <audio> media element as well so TikTok LIVE Studio / OBS CEF
  // "Link" sources that only capture HTMLMediaElement streams receive 100% of the sound!
  let mediaStreamEl = null;
  if (!isPreviewIframe && typeof ctx.createMediaStreamDestination === 'function' && typeof Audio !== 'undefined') {
    try {
      const streamDest = ctx.createMediaStreamDestination();
      master.connect(streamDest);
      mediaStreamEl = new Audio();
      mediaStreamEl.srcObject = streamDest.stream;
      mediaStreamEl.volume = 1.0;
      mediaStreamEl.muted = false;
      mediaStreamEl.play().catch(() => {});
    } catch {}
  }
  const music = new Audio('assets/audio/music.mp3');
  music.loop = true;
  music.volume = 0.32;
  let enabled = !isPreviewIframe, readComments = false, missing = false, triedWav = false, blockTimes = [];
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
    startSynthZen();
  };

  // ============================================================================
  // MULTI-STYLE BUDDHIST REMIX, HANDPAN, TIBETAN, CỔ PHONG & ZEN JUKEBOX ENGINE
  // Synthesized via Karplus-Strong Physical String Modeling + Stereo Hall Reverb
  // + EDM/Vinahouse/Trap/DeepHouse/Handpan/Tibetan DSP (100% Copyright-Free!)
  // ============================================================================
  let zenRunning = false;
  let zenTimer = null;
  let currentSongIdx = 0; // Defaults to 'buddha_vinahouse_remix' or rotates in 'auto'
  let forcedTrackId = 'auto';
  let lastAppliedSeq = -1;
  let noteCursor = 0;
  let tickCount = 0;

  const zenGain = ctx.createGain();
  zenGain.gain.value = 0.34;
  zenGain.connect(master);

  const bgmFilter = ctx.createBiquadFilter();
  bgmFilter.type = 'lowpass';
  bgmFilter.frequency.value = 4200;
  bgmFilter.connect(zenGain);

  // 2.4-second Stereo Temple Hall Convolution Reverb
  const templeReverb = ctx.createConvolver();
  templeReverb.buffer = (() => {
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * 2.4);
    const ir = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const env = Math.exp(-t * 2.2) * (1 - Math.exp(-t * 30));
        const raw = (Math.random() * 2 - 1) * env;
        lp = lp * 0.74 + raw * 0.26;
        d[i] = lp * 0.42;
      }
    }
    return ir;
  })();

  const reverbWet = ctx.createGain();
  reverbWet.gain.value = 0.46;
  templeReverb.connect(reverbWet);
  reverbWet.connect(bgmFilter);

  const dryBus = ctx.createGain();
  dryBus.gain.value = 0.86;
  dryBus.connect(bgmFilter);
  dryBus.connect(templeReverb);

  // ==========================================================================
  // SOFT BACKGROUND SUNG LYRIC & FORMANT VOCAL CHOIR LAYER ("Nhạc Có Lời Nhỏ")
  // Stereo-panned, warm low-passed (1600Hz), and lushly reverberated so it sounds
  // like a gentle background singer and NEVER conflicts with center TTS or bells!
  // ==========================================================================
  let bgmVocalEnabled = true;
  let bgmVocalVolume = 0.15; // 15% soft background singing level
  let activeLyricSrc = null;
  let activeLyricGain = null;
  let lastLyricAt = 0;
  let lyricCursor = 0;
  let lastSfxAt = 0;
  const lyricBufferCache = new Map();

  const bgmVocalBus = ctx.createGain();
  bgmVocalBus.gain.value = bgmVocalVolume;

  const vocalLowpass = ctx.createBiquadFilter();
  vocalLowpass.type = 'lowpass';
  vocalLowpass.frequency.value = 1600;
  vocalLowpass.Q.value = 0.65;

  const vocalWarmth = ctx.createBiquadFilter();
  vocalWarmth.type = 'peaking';
  vocalWarmth.frequency.value = 380;
  vocalWarmth.gain.value = 2.5;

  const vocalPanner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  if (vocalPanner) {
    vocalPanner.pan.value = -0.36;
    bgmVocalBus.connect(vocalWarmth).connect(vocalLowpass).connect(vocalPanner);
    vocalPanner.connect(bgmFilter);
    vocalPanner.connect(templeReverb);
  } else {
    bgmVocalBus.connect(vocalWarmth).connect(vocalLowpass);
    vocalLowpass.connect(bgmFilter);
    vocalLowpass.connect(templeReverb);
  }

  const TEMPLE_SONG_LYRICS = {
    buddha_vinahouse_remix: [
      'Nam mô A Di Đà Phật, tâm an vạn sự an lành',
      'Hoa sen nở ngát hương đời, ánh đạo vàng chiếu muôn nơi',
      'Nguyện cầu gia đạo bình an, phước lộc cát tường như ý',
    ],
    dai_bi_trap_remix: [
      'Án ma ni bát minh hồng, từ bi cứu khổ độ mê',
      'Nam mô Đại Bi Quan Thế Âm Bồ Tát',
      'Ngàn mắt ngàn tay soi sáng nhân gian, tâm thành ứng hiện',
    ],
    co_phong_dan_tranh_remix: [
      'Tiếng đàn tranh ngân bên mái chùa xưa, gió đưa hương trầm thanh tịnh',
      'Một cõi đi về, lòng người nhẹ tựa áng mây bay',
      'Sen nở trong tâm, rũ bỏ muộn phiền nhân thế',
    ],
    deep_house_chanh_dien: [
      'Nam mô Bổn Sư Thích Ca Mâu Ni Phật',
      'Cửa thiền rộng mở từ bi, tâm sáng giữa đất trời',
      'Chuông chùa ngân vang, đem bình yên về khắp muôn nhà',
    ],
    handpan_lien_hoa: [
      'Sen trắng tinh khôi giữa dòng đời, tâm tịnh giữa đất trời bao la',
      'Lắng nghe tiếng chuông ngân, an nhiên trong từng hơi thở',
    ],
    tay_tang_mat_tong: [
      'Án ma ni bát minh hồng, trí tuệ từ bi viên mãn',
      'Nam mô Dược Sư Lưu Ly Quang Vương Phật',
    ],
    cyber_zen_synthwave: [
      'Hào quang Phật pháp chiếu soi muôn phương, tâm sáng như trăng rằm',
      'Nam mô A Di Đà Phật, vạn điều tốt lành hội tụ',
    ],
    vu_dieu_hoan_hy_edm: [
      'Hoan hỷ công đức vô lượng, chúc đại chúng vạn sự cát tường',
      'Nam mô A Di Đà Phật, phúc lộc thọ khang ninh',
    ],
    quan_am_lofi_chill: [
      'Nam mô Quan Thế Âm Bồ Tát, giọt nước cành dương mát dịu tâm hồn',
      'Đêm thanh tịnh nghe tiếng chuông chùa, bình yên về khắp muôn nhà',
    ],
    duoc_su_jazz_lounge: [
      'Nam mô Dược Sư Lưu Ly Quang Vương Phật, thân tâm thường an lạc',
      'Nguyện cầu sức khỏe bình an, tiêu trừ bệnh tật tai ương',
    ],
    zen_singing_bowl: [
      'Hít vào tâm tĩnh lặng, thở ra miệng mỉm cười',
      'Nam mô Bổn Sư Thích Ca Mâu Ni Phật',
    ],
    nhac_thien_ngon_gio: [
      'Trăng soi bóng cổ tự, tiếng sáo trúc ngân vang giữa mây ngàn',
      'Tâm an thì vạn sự an, lòng thanh thản đón bình yên',
    ],
  };

  function stopTempleBackgroundLyric() {
    if (activeLyricGain && ctx.state === 'running') {
      try {
        activeLyricGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.035);
      } catch {}
    }
    if (activeLyricSrc) {
      const s = activeLyricSrc;
      activeLyricSrc = null;
      setTimeout(() => {
        try { s.stop(); } catch {}
      }, 120);
    }
  }

  // Synthesizes soft human vowel formants ("Aaa" / "Ooo" / "Uuu") singing with the melody
  const VOWEL_FORMANTS = [
    [720, 1180, 2540], // "Aaa"
    [460, 880, 2420],  // "Ooo"
    [350, 720, 2350],  // "Uuu"
  ];
  function playFormantVocalChoir(freq, start, durSec, vol = 0.055) {
    if (!enabled || !zenRunning || !bgmVocalEnabled || speaking || ctx.state !== 'running' || freq <= 0) return;
    const vowel = VOWEL_FORMANTS[Math.floor(tickCount / 4) % VOWEL_FORMANTS.length];
    const srcOsc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const vib = ctx.createOscillator();
    const vibG = ctx.createGain();

    srcOsc.type = 'sawtooth';
    subOsc.type = 'triangle';
    const singFreq = freq > 480 ? freq * 0.5 : freq;
    srcOsc.frequency.setValueAtTime(singFreq * 0.992, start);
    srcOsc.frequency.exponentialRampToValueAtTime(singFreq, start + 0.08);
    subOsc.frequency.setValueAtTime(singFreq * 0.5, start);

    vib.frequency.setValueAtTime(5.2, start);
    vibG.gain.setValueAtTime(singFreq * 0.009, start);
    vib.connect(vibG);
    vibG.connect(srcOsc.frequency);
    vibG.connect(subOsc.frequency);

    const env = ctx.createGain();
    const totalDur = Math.max(0.45, durSec * 1.35);
    env.gain.setValueAtTime(0.0001, start);
    env.gain.linearRampToValueAtTime(vol, start + 0.1);
    env.gain.exponentialRampToValueAtTime(0.0001, start + totalDur);

    for (const [idx, fHz] of vowel.entries()) {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(fHz, start);
      bp.Q.value = 4.2 + idx * 1.2;
      const fg = ctx.createGain();
      fg.gain.value = idx === 0 ? 1.0 : idx === 1 ? 0.55 : 0.25;
      srcOsc.connect(bp);
      subOsc.connect(bp);
      bp.connect(fg).connect(env);
    }

    env.connect(bgmVocalBus);
    srcOsc.start(start);
    subOsc.start(start);
    vib.start(start);
    srcOsc.stop(start + totalDur + 0.05);
    subOsc.stop(start + totalDur + 0.05);
    vib.stop(start + totalDur + 0.05);
  }

  async function preloadAndPlayTempleLyric(song) {
    if (!enabled || !zenRunning || !bgmVocalEnabled || speaking || speechQueue.length > 0) return;
    const now = Date.now();
    if (activeLyricSrc || now - lastLyricAt < 8500 || now - lastSfxAt < 1800) return;
    const lines = TEMPLE_SONG_LYRICS[song.id] || TEMPLE_SONG_LYRICS.buddha_vinahouse_remix;
    if (!lines || !lines.length) return;
    const text = lines[lyricCursor++ % lines.length];
    lastLyricAt = now;

    try {
      let buf = lyricBufferCache.get(text);
      if (!buf) {
        const res = await fetch(`/tts?q=${encodeURIComponent(text)}`);
        if (!res.ok) return;
        const arr = await res.arrayBuffer();
        if (!arr.byteLength) return;
        buf = await ctx.decodeAudioData(arr.slice(0));
        if (lyricBufferCache.size > 28) {
          const oldest = lyricBufferCache.keys().next().value;
          lyricBufferCache.delete(oldest);
        }
        lyricBufferCache.set(text, buf);
      }
      // Double-check nobody started speaking while fetching
      if (!enabled || !zenRunning || !bgmVocalEnabled || speaking || speechQueue.length > 0 || Date.now() - lastSfxAt < 1200) {
        return;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      // Slow lyrical singing cadence + gentle melodic pitch contour & vibrato
      src.playbackRate.value = 0.87;
      const t0 = ctx.currentTime;
      const dur = buf.duration / 0.87;
      src.detune.setValueAtTime(0, t0);
      src.detune.linearRampToValueAtTime(140, t0 + dur * 0.35);
      src.detune.linearRampToValueAtTime(-80, t0 + dur * 0.7);
      src.detune.linearRampToValueAtTime(0, t0 + dur);

      const vib = ctx.createOscillator();
      const vibG = ctx.createGain();
      vib.frequency.value = 5.1;
      vibG.gain.value = 16; // +/- 16 cents soft singing vibrato
      vib.connect(vibG).connect(src.detune);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.85, t0 + 0.32);
      g.gain.setValueAtTime(0.85, Math.max(t0 + 0.35, t0 + dur - 0.45));
      g.gain.linearRampToValueAtTime(0.0001, t0 + dur);

      if (vocalPanner) {
        vocalPanner.pan.setTargetAtTime(lyricCursor % 2 === 0 ? -0.35 : 0.35, t0, 0.2);
      }

      src.connect(g).connect(bgmVocalBus);
      activeLyricSrc = src;
      activeLyricGain = g;
      src.onended = () => {
        if (activeLyricSrc === src) {
          activeLyricSrc = null;
          activeLyricGain = null;
        }
        try { vib.stop(); } catch {}
      };
      vib.start(t0);
      src.start(t0);
    } catch {}
  }

  // Karplus-Strong Physical String Waveguide Cache (Đàn Tranh & Guitar Nylon)
  const ksCache = new Map();
  function getKsBuffer(freq, style = 'zither') {
    const key = `${style}:${Math.round(freq * 10)}`;
    let buf = ksCache.get(key);
    if (buf) return buf;
    const sr = ctx.sampleRate;
    const durSec = style === 'guitar' ? 2.2 : 2.6;
    const len = Math.floor(sr * durSec);
    buf = ctx.createBuffer(1, len, sr);
    const out = buf.getChannelData(0);
    const period = Math.max(8, Math.round(sr / freq));
    const ring = new Float32Array(period);
    let prev = 0;
    const alpha = style === 'guitar' ? 0.56 : 0.30;
    for (let i = 0; i < period; i++) {
      const n = Math.random() * 2 - 1;
      prev = prev * alpha + n * (1 - alpha);
      const body = Math.sin((2 * Math.PI * i) / period) * 0.5;
      ring[i] = (prev * 0.6 + body) * 0.9;
    }
    const damping = style === 'guitar' ? 0.9935 : 0.9962;
    const bright = style === 'guitar' ? 0.38 : 0.55;
    let p = 0;
    let lastVal = 0;
    for (let i = 0; i < len; i++) {
      const cur = ring[p];
      out[i] = cur;
      const nextP = (p + 1) % period;
      const avg = bright * cur + (1 - bright) * ring[nextP];
      ring[p] = (avg * 0.88 + lastVal * 0.12) * damping;
      lastVal = cur;
      p = nextP;
    }
    ksCache.set(key, buf);
    return buf;
  }

  function playPluck(freq, start, vol = 0.24, style = 'zither') {
    if (!enabled || !zenRunning || ctx.state !== 'running' || freq <= 0) return;
    const src = ctx.createBufferSource();
    src.buffer = getKsBuffer(freq, style);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.0008, start + 2.1);
    src.connect(g).connect(dryBus);
    src.start(start);
    src.stop(start + 2.15);
  }

  // Electronic Remix Pluck / Supersaw Lead (Vinahouse / EDM / Synthwave / Trap)
  function playRemixLead(freq, start, durSec, vol = 0.11) {
    if (!enabled || !zenRunning || ctx.state !== 'running' || freq <= 0) return;
    for (const det of [-8, 0, 8]) {
      const o = ctx.createOscillator();
      const flt = ctx.createBiquadFilter();
      const g = ctx.createGain();
      o.type = det === 0 ? 'sawtooth' : 'triangle';
      o.frequency.setValueAtTime(freq, start);
      o.detune.setValueAtTime(det, start);
      flt.type = 'lowpass';
      flt.frequency.setValueAtTime(2800, start);
      flt.frequency.exponentialRampToValueAtTime(680, start + durSec);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(vol / 2.4, start + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, start + durSec * 1.08);
      o.connect(flt).connect(g).connect(dryBus);
      o.start(start);
      o.stop(start + durSec * 1.12);
    }
    playPluck(freq, start, vol * 1.1, 'zither');
  }

  // Celestial Handpan / Hang Drum (1 : 2 : 2.98 tuned steel harmonics + slap transient)
  function playHandpan(freq, start, vol = 0.22) {
    if (!enabled || !zenRunning || ctx.state !== 'running' || freq <= 0) return;
    for (const [ratio, amp, decay] of [[1, 1.0, 2.2], [2, 0.42, 1.4], [2.98, 0.20, 0.85]]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq * ratio * 1.015, start);
      o.frequency.exponentialRampToValueAtTime(freq * ratio, start + 0.035);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(vol * amp, start + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, start + decay);
      o.connect(g).connect(dryBus);
      o.start(start);
      o.stop(start + decay + 0.04);
    }
  }

  // Mystical Tibetan Throat-Singing Overtone Drone & Ritual Bell
  function playTibetanTone(freq, start, durSec, vol = 0.14) {
    if (!enabled || !zenRunning || ctx.state !== 'running' || freq <= 0) return;
    const o = ctx.createOscillator();
    const f1 = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(freq * 0.5, start);
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(freq * 1.5, start);
    f1.Q.value = 4.5;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, start + durSec * 1.4);
    o.connect(f1).connect(g).connect(dryBus);
    o.start(start);
    o.stop(start + durSec * 1.45);
    // Crystalline Dorje overtone
    playHandpan(freq * 2, start, vol * 0.55);
  }

  // Silky Bamboo Flute & Expressive Đàn Bầu
  function playFluteOrBau(freq, start, durSec, isBau = false, vol = 0.10) {
    if (!enabled || !zenRunning || ctx.state !== 'running' || freq <= 0) return;
    const totalDur = Math.max(0.38, durSec * 1.25);
    const o = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    const flt = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = isBau ? 'triangle' : 'sine';
    o.frequency.setValueAtTime(isBau ? freq * 0.95 : freq * 0.99, start);
    o.frequency.exponentialRampToValueAtTime(freq, start + (isBau ? 0.14 : 0.05));
    lfo.frequency.setValueAtTime(5.0, start);
    lfoG.gain.setValueAtTime(freq * 0.008, start);
    lfo.connect(lfoG).connect(o.frequency);
    flt.type = 'lowpass';
    flt.frequency.value = 1800;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, start + totalDur);
    o.connect(flt).connect(g).connect(dryBus);
    o.start(start);
    lfo.start(start);
    o.stop(start + totalDur + 0.04);
    lfo.stop(start + totalDur + 0.04);
  }

  // Warm Felt Lofi / House Chord Pad
  function playChordPad(rootFreq, start, durSec, vol = 0.065) {
    if (!enabled || !zenRunning || ctx.state !== 'running' || rootFreq <= 0) return;
    for (const [i, mult] of [1.0, 1.5, 2.0, 2.5].entries()) {
      const o = ctx.createOscillator();
      const flt = ctx.createBiquadFilter();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(rootFreq * mult, start + i * 0.025);
      flt.type = 'lowpass';
      flt.frequency.value = 950;
      g.gain.setValueAtTime(0.0001, start + i * 0.025);
      g.gain.linearRampToValueAtTime(vol * (0.9 - i * 0.12), start + i * 0.025 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, start + durSec * 1.15);
      o.connect(flt).connect(g).connect(dryBus);
      o.start(start + i * 0.025);
      o.stop(start + durSec * 1.2);
    }
  }

  // Multi-Style Rhythm & Bass Groove Generator (Vinahouse, Trap 808, Deep House, Lofi, Ritual)
  function playStyleGroove(style, start, stepSec, stepInBar, bassRoot) {
    if (!enabled || !zenRunning || ctx.state !== 'running') return;
    if (style === 'vinahouse' || style === 'deep_house' || style === 'synthwave') {
      // 4-on-the-floor Kick on even steps (0, 2, 4, 6) + Off-beat bouncy Vinahouse Bass on odd steps (1, 3, 5, 7)
      if (stepInBar % 2 === 0) {
        const k = ctx.createOscillator();
        const kg = ctx.createGain();
        k.type = 'sine';
        k.frequency.setValueAtTime(style === 'vinahouse' ? 128 : 108, start);
        k.frequency.exponentialRampToValueAtTime(42, start + 0.14);
        kg.gain.setValueAtTime(style === 'vinahouse' ? 0.24 : 0.18, start);
        kg.gain.exponentialRampToValueAtTime(0.0001, start + 0.17);
        k.connect(kg).connect(bgmFilter);
        k.start(start);
        k.stop(start + 0.18);
      } else {
        // Off-beat bouncy Vinahouse / House Sub-Bass!
        const b = ctx.createOscillator();
        const flt = ctx.createBiquadFilter();
        const bg = ctx.createGain();
        b.type = 'sawtooth';
        b.frequency.setValueAtTime(bassRoot * 0.5, start);
        flt.type = 'lowpass';
        flt.frequency.setValueAtTime(520, start);
        flt.frequency.exponentialRampToValueAtTime(140, start + stepSec * 0.9);
        bg.gain.setValueAtTime(0.16, start);
        bg.gain.exponentialRampToValueAtTime(0.0001, start + stepSec * 0.95);
        b.connect(flt).connect(bg).connect(bgmFilter);
        b.start(start);
        b.stop(start + stepSec);
      }
    } else if (style === 'trap' || style === 'co_phong') {
      // Deep 808 Sub-bass on 0, 3, 6 + crisp wood/snare on 2, 6
      if (stepInBar === 0 || stepInBar === 3 || stepInBar === 6) {
        const sub = ctx.createOscillator();
        const sg = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(bassRoot * 0.5, start);
        sub.frequency.exponentialRampToValueAtTime(bassRoot * 0.48, start + stepSec * 1.6);
        sg.gain.setValueAtTime(0.22, start);
        sg.gain.exponentialRampToValueAtTime(0.0001, start + stepSec * 1.7);
        sub.connect(sg).connect(bgmFilter);
        sub.start(start);
        sub.stop(start + stepSec * 1.75);
      }
      if (stepInBar === 2 || stepInBar === 6) {
        playHandpan(bassRoot * 2, start, 0.08);
      }
    } else if (style === 'lofi' || style === 'handpan') {
      if (stepInBar === 0 || stepInBar === 4) {
        const k = ctx.createOscillator();
        const kg = ctx.createGain();
        k.type = 'sine';
        k.frequency.setValueAtTime(92, start);
        k.frequency.exponentialRampToValueAtTime(42, start + 0.13);
        kg.gain.setValueAtTime(0.12, start);
        kg.gain.exponentialRampToValueAtTime(0.0001, start + 0.15);
        k.connect(kg).connect(bgmFilter);
        k.start(start);
        k.stop(start + 0.16);
      }
    }
  }

  function tickZen() {
    if (!zenRunning) return;
    const song = TEMPLE_SONGS[currentSongIdx % TEMPLE_SONGS.length];
    let waitMs = song.stepMs;

    if (enabled && ctx.state === 'running') {
      const t = ctx.currentTime;
      const [freq, beats, inst] = song.notes[noteCursor % song.notes.length];
      const subBeats = Math.max(1, beats);
      waitMs = song.stepMs * subBeats;
      const stepSec = song.stepMs / 1000;
      const durSec = (waitMs / 1000) * 0.95;
      const stepInBar = tickCount % 8;
      const bassRoot = song.bassRoots[Math.floor(tickCount / 4) % song.bassRoots.length];

      // 1. Chord Pads & Acoustic Bass Backing
      if (stepInBar === 0 || stepInBar === 4) {
        playChordPad(bassRoot, t, stepSec * 4.0, song.style === 'zen' ? 0.08 : 0.06);
        playPluck(bassRoot, t, 0.18, 'guitar');
      }

      // 2. Style-Specific Rhythm & Bass Groove
      for (let b = 0; b < subBeats; b++) {
        playStyleGroove(song.style, t + b * stepSec, stepSec, (stepInBar + b) % 8, bassRoot);
      }

      // 3. Lead Instrument Synthesis by Style
      if (freq > 0) {
        if (inst === 'lead') {
          playRemixLead(freq, t, durSec, 0.12);
        } else if (inst === 'handpan') {
          playHandpan(freq, t, 0.24);
          playPluck(freq * 0.5, t + 0.02, 0.12, 'guitar');
        } else if (inst === 'tibetan') {
          playTibetanTone(freq, t, durSec, 0.15);
        } else if (inst === 'flute') {
          playFluteOrBau(freq, t, durSec, false, 0.11);
          playPluck(freq, t, 0.16, 'guitar');
        } else if (inst === 'bau') {
          playFluteOrBau(freq, t, durSec, true, 0.11);
          playPluck(freq, t, 0.18, 'zither');
        } else if (inst === 'guitar') {
          playPluck(freq, t, 0.26, 'guitar');
          playPluck(freq * 2, t + 0.02, 0.12, 'zither');
        } else {
          // 'zither' or 'both'
          playPluck(freq, t, 0.28, 'zither');
          if (inst === 'both') {
            if (song.style === 'vinahouse' || song.style === 'trap' || song.style === 'synthwave') {
              playRemixLead(freq, t, durSec, 0.09);
            } else {
              playFluteOrBau(freq, t, durSec, false, 0.08);
            }
          }
        }
        // 4. Soft Background Vocal Layer (Formant Choir + Sung Poetic Lyric Verses when no main TTS/SFX is active)
        if (bgmVocalEnabled && !speaking && speechQueue.length === 0) {
          if (stepInBar === 0 || stepInBar === 4 || inst === 'both') {
            playFormantVocalChoir(freq, t, durSec, 0.052);
          }
          if (stepInBar === 0 && Date.now() - lastSfxAt > 1800) {
            preloadAndPlayTempleLyric(song);
          }
        }
      }

      noteCursor++;
      tickCount += subBeats;

      // Auto-rotate through tracks if in 'auto' mode after 2 full cycles of a song
      if (noteCursor >= song.notes.length * 2) {
        noteCursor = 0;
        if (forcedTrackId === 'auto') {
          currentSongIdx = (currentSongIdx + 1) % TEMPLE_SONGS.length;
        }
      }
    }
    zenTimer = setTimeout(tickZen, waitMs);
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

  function duckMusic(duck) {
    music.volume = duck ? 0.10 : 0.28;
    if (duck) {
      stopTempleBackgroundLyric();
    }
    if (ctx.state === 'running') {
      zenGain.gain.setTargetAtTime(duck ? 0.10 : 0.34, ctx.currentTime, 0.12);
      bgmVocalBus.gain.setTargetAtTime(
        duck || !bgmVocalEnabled ? 0.0001 : bgmVocalVolume,
        ctx.currentTime,
        duck ? 0.04 : 0.25
      );
    }
  }

  let currentVoiceSrc = null;
  let currentItem = null;
  let currentDone = null;
  let activeSpeechSeq = 0;
  let lastPrayerSpeechAt = 0;
  const recentRealGreet = new Map(); // uid -> ts to avoid double-greeting the same real user on join within 15s
  const recentNameGreet = new Map(); // normalizedName -> ts to avoid repeating join greeting within 15s
  const recentCommentSpeech = new Map(); // uid+text -> ts to avoid duplicate spam within 5s

  function interruptSpeechIfLowerPriority(_newPriority = 2) {
    // Never cut off a sentence mid-speech; let the active sentence finish naturally (`onended = done`),
    // while `purgeQueuedBots()` + priority insertion ensures real gifts/joins/comments speak next immediately!
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
    u.rate = 1.15;
    u.pitch = 0.98;
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
    const mySeq = ++activeSpeechSeq;
    currentItem = item;
    speaking = true;
    duckMusic(true);
    onSpeak?.(item.text, true, item.kind || 'gift');

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      if (mySeq !== activeSpeechSeq) return;
      clearTimeout(watchdog);
      currentVoiceSrc = null;
      currentItem = null;
      currentDone = null;
      speaking = false;
      duckMusic(false);
      onSpeak?.('', false);
      setTimeout(flushSpeech, 110);
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
      if (!enabled || mySeq !== activeSpeechSeq) {
        done();
        return;
      }
      const src = ctx.createBufferSource();
      src.buffer = audioBuf;
      // Brisk, clear & natural temple broadcast pace — dry & crisp (no artificial delay echo)
      src.playbackRate.value = 1.18;
      const voiceGain = ctx.createGain();
      voiceGain.gain.value = 1.15;
      src.connect(voiceGain);
      voiceGain.connect(master);

      currentVoiceSrc = src;
      src.onended = done;
      src.start();
    } catch {
      if (mySeq === activeSpeechSeq) speakBrowserFallback(item.text, done);
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
    lastSfxAt = Date.now();
    stopTempleBackgroundLyric();
    const t = ctx.currentTime;
    for (const [r, a, d] of [[1, 0.24, 2.4], [2.756, 0.14, 1.8], [5.404, 0.07, 1.1]]) {
      tone(528 * r, t, d, a);
    }
  }

  // Tier 1: Chuông chùa ấm (warm mid-pitched temple bell)
  function mediumBell() {
    if (!enabled) return;
    lastSfxAt = Date.now();
    stopTempleBackgroundLyric();
    const t = ctx.currentTime;
    for (const [r, a] of [[1, 0.3], [2.0, 0.16], [2.76, 0.15], [5.4, 0.08]]) {
      tone(294 * r, t, 3.8 / Math.sqrt(r), a);
    }
  }

  // Tier 2: Đại hồng chung (deep, resonant grand temple bell)
  function bell() {
    if (!enabled) return;
    lastSfxAt = Date.now();
    stopTempleBackgroundLyric();
    const t = ctx.currentTime;
    for (const [r, a] of [[0.5, 0.25], [1, 0.38], [2.76, 0.18], [5.4, 0.1], [8.93, 0.05]]) {
      tone(196 * r, t, 5.5 / Math.sqrt(Math.max(1, r)), a);
    }
  }

  // Auto-unlock and start meditation music when visible; automatically silence if tab is hidden in background
  // so it never overlaps with Cuộc Đua Kỳ Thú (:8789) when switching tabs
  function syncVisibilityAudio() {
    if (isPreviewIframe) return;
    enabled = true;
    master.gain.value = 1;
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    if (mediaStreamEl && mediaStreamEl.paused) mediaStreamEl.play().catch(() => {});
    if (!zenRunning) playMusic();
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', syncVisibilityAudio);
  }
  ctx.resume().then(() => { syncVisibilityAudio(); }).catch(() => { syncVisibilityAudio(); });
  setInterval(syncVisibilityAudio, 1500);

  return {
    get suspended() { return ctx.state !== 'running'; },
    get readComments() { return readComments; },
    unlock() {
      if (isPreviewIframe) return;
      enabled = true;
      master.gain.value = 1;
      ctx.resume().catch(() => {});
      if (mediaStreamEl && mediaStreamEl.paused) mediaStreamEl.play().catch(() => {});
      playMusic();
      refreshViVoice();
    },
    setReadComments(on) {
      readComments = Boolean(on);
      if (!readComments) {
        for (let i = speechQueue.length - 1; i >= 0; i--) {
          if (speechQueue[i].kind === 'comment') speechQueue.splice(i, 1);
        }
        if (currentItem?.kind === 'comment') {
          activeSpeechSeq++;
          clearTimeout(watchdog);
          if (currentVoiceSrc) {
            try {
              currentVoiceSrc.onended = null;
              currentVoiceSrc.stop();
            } catch {}
            currentVoiceSrc = null;
          }
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
    getMusicLabel() {
      const s = TEMPLE_SONGS[currentSongIdx % TEMPLE_SONGS.length];
      return `🎵 ${s.title}`;
    },
    getCurrentTrack() {
      const s = TEMPLE_SONGS[currentSongIdx % TEMPLE_SONGS.length];
      return { id: s.id, title: s.title, genre: s.genre, forcedTrackId };
    },
    nextMusicTrack() {
      currentSongIdx = (currentSongIdx + 1) % TEMPLE_SONGS.length;
      forcedTrackId = TEMPLE_SONGS[currentSongIdx].id;
      noteCursor = 0;
      tickCount = 0;
      chime();
      return this.getMusicLabel();
    },
    randomMusicTrack() {
      if (TEMPLE_SONGS.length > 1) {
        let nextIdx = currentSongIdx;
        while (nextIdx === currentSongIdx) {
          nextIdx = Math.floor(Math.random() * TEMPLE_SONGS.length);
        }
        currentSongIdx = nextIdx;
      }
      forcedTrackId = TEMPLE_SONGS[currentSongIdx].id;
      noteCursor = 0;
      tickCount = 0;
      chime();
      return this.getMusicLabel();
    },
    setMusicTrack(trackId, seq = null) {
      if (!trackId) return this.getMusicLabel();
      if (seq !== null && seq === lastAppliedSeq) return this.getMusicLabel();
      if (seq !== null) lastAppliedSeq = seq;

      if (trackId === 'next') {
        return this.nextMusicTrack();
      }
      if (trackId === 'random') {
        return this.randomMusicTrack();
      }
      if (trackId === 'auto') {
        forcedTrackId = 'auto';
        return this.getMusicLabel();
      }
      const idx = TEMPLE_SONGS.findIndex(s => s.id === trackId);
      if (idx !== -1) {
        forcedTrackId = trackId;
        if (currentSongIdx !== idx) {
          currentSongIdx = idx;
          noteCursor = 0;
          tickCount = 0;
          chime();
        }
      }
      return this.getMusicLabel();
    },
    setBgmVocal(on, vol) {
      if (on !== undefined) bgmVocalEnabled = Boolean(on);
      if (Number.isFinite(Number(vol))) {
        bgmVocalVolume = Math.max(0, Math.min(0.45, Number(vol)));
      }
      if (!bgmVocalEnabled) stopTempleBackgroundLyric();
      if (ctx.state === 'running') {
        bgmVocalBus.gain.setTargetAtTime(
          speaking || !bgmVocalEnabled ? 0.0001 : bgmVocalVolume,
          ctx.currentTime,
          0.1
        );
      }
    },
    getBgmVocalConfig() {
      return { enabled: bgmVocalEnabled, volume: bgmVocalVolume };
    },
    setEnabled(_on) {
      // Sound is permanently enabled on main livestream display (never turns off)
      if (isPreviewIframe) return;
      enabled = true;
      master.gain.value = 1;
      playMusic();
      flushSpeech();
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
        // Bots speak when the hall is quiet (at most once every 7s)
        if (speaking || speechQueue.length > 0 || now - lastPrayerSpeechAt < 7_000) {
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
      if (!enabled || !readComments || !actor) return;
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
        if (speaking || speechQueue.length > 0 || now - lastPrayerSpeechAt < 7_000) {
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
