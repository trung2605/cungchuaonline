// Audio, Multi-Instrument Vietnamese Folk BGM & Priority AI Voice Engine for Hành Trình Đi Bộ Xuyên Việt:
// - Strict Priority Hierarchy:
//     1. Donate / Gift Boost (priority: 5..9) — Highest
//     2. Viewer Comment TTS (priority: 4 real / 2 demo)
//     3. Viewer Join / Welcome (priority: 3 real / 1 demo)
//     4. AI Landmark Cultural & Human Storyteller (priority: 0, kind: 'story') — Lowest ("ưu tiên cuối cùng")
// - Whenever any viewer donates, comments, or joins, any active AI storytelling segment is immediately
//   preempted (and rewound by 1 chapter so nothing is skipped) and resumes only after interactive speech finishes.

import { LANDMARK_STORIES, PROVINCE_STORIES } from './storyScripts.js';

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
  [/\bgđ\b|\bgd\b/giu, 'gia đình'],
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

// Pitch table (Hz) across 3 octaves for Vietnamese pentatonic & modal arrangements
const N = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
  R: 0,
};

// ============================================================================
// 21 VIETNAMESE FOLK, REGIONAL & LOFI CHILL SONGS (100% Royalty-Free WebAudio)
// Instruments:
// - 'zither' : Đàn Tranh 16 dây
// - 'flute'  : Sáo Trúc / Sáo Mèo
// - 'bau'    : Đàn Bầu Độc Huyền Cầm (ngân rung)
// - 'moon'   : Đàn Nguyệt / Đàn Kìm
// - 'trung'  : Đàn T'rưng Tây Nguyên
// - 'both'   : Hòa tấu Đàn Tranh + Sáo Trúc
// ============================================================================
export const VN_SONGS = [
  {
    id: 'trong_com',
    title: 'Trống Cơm (Dân Ca Bắc Bộ Lofi)',
    stepMs: 280,
    bassRoots: [N.C3, N.G3, N.A3, N.G3],
    drumPattern: [1, 0, 0.5, 0, 0.8, 0, 0.4, 0.5],
    notes: [
      [N.G4, 1, 'zither'], [N.A4, 1, 'zither'], [N.C5, 1, 'both'], [N.C5, 1, 'zither'],
      [N.D5, 1, 'both'], [N.C5, 1, 'zither'], [N.A4, 1, 'zither'], [N.G4, 1, 'both'],
      [N.E4, 1, 'zither'], [N.G4, 1, 'zither'], [N.A4, 1, 'both'], [N.C5, 1, 'zither'],
      [N.A4, 1, 'zither'], [N.G4, 1, 'both'], [N.E4, 1, 'zither'], [N.D4, 1, 'zither'],
      [N.G4, 1, 'zither'], [N.G4, 1, 'zither'], [N.A4, 1, 'both'], [N.C5, 1, 'zither'],
      [N.D5, 1, 'both'], [N.E5, 1, 'flute'], [N.D5, 1, 'zither'], [N.C5, 1, 'both'],
      [N.A4, 1, 'zither'], [N.C5, 1, 'zither'], [N.A4, 1, 'both'], [N.G4, 1, 'zither'],
      [N.E4, 1, 'zither'], [N.G4, 1, 'both'], [N.C4, 2, 'both'], [N.R, 1, 'zither'],
    ],
  },
  {
    id: 'beo_dat',
    title: 'Bèo Dạt Mây Trôi (Đàn Tranh & Đàn Bầu)',
    stepMs: 350,
    bassRoots: [N.C3, N.A3, N.D3, N.G3],
    drumPattern: [0.7, 0, 0, 0.4, 0.6, 0, 0.3, 0],
    notes: [
      [N.C4, 2, 'both'], [N.E4, 1, 'zither'], [N.G4, 2, 'bau'], [N.G4, 1, 'zither'],
      [N.A4, 1, 'both'], [N.C5, 2, 'bau'], [N.A4, 1, 'zither'], [N.G4, 2, 'both'],
      [N.E5, 2, 'flute'], [N.D5, 1, 'zither'], [N.C5, 1, 'both'], [N.A4, 1, 'zither'],
      [N.G4, 1, 'zither'], [N.E4, 1, 'both'], [N.G4, 1, 'zither'], [N.D4, 2, 'bau'],
      [N.E4, 1, 'zither'], [N.G4, 1, 'both'], [N.A4, 2, 'flute'], [N.C5, 1, 'zither'],
      [N.D5, 1, 'zither'], [N.C5, 1, 'both'], [N.A4, 1, 'zither'], [N.G4, 2, 'bau'],
      [N.E4, 1, 'zither'], [N.D4, 1, 'zither'], [N.C4, 2, 'both'], [N.R, 1, 'zither'],
    ],
  },
  {
    id: 'ly_cay_bong',
    title: 'Lý Cây Bông (Dân Ca Nam Bộ)',
    stepMs: 290,
    bassRoots: [N.C3, N.E3, N.G3, N.C3],
    drumPattern: [0.9, 0, 0.4, 0.5, 0.8, 0, 0.5, 0],
    notes: [
      [N.E4, 1, 'zither'], [N.G4, 1, 'zither'], [N.A4, 1, 'both'], [N.A4, 1, 'zither'],
      [N.G4, 1, 'zither'], [N.A4, 1, 'both'], [N.C5, 1, 'flute'], [N.A4, 1, 'zither'],
      [N.G4, 2, 'both'], [N.E4, 1, 'zither'], [N.G4, 1, 'zither'],
      [N.A4, 1, 'zither'], [N.C5, 1, 'both'], [N.D5, 1, 'flute'], [N.E5, 1, 'flute'],
      [N.D5, 1, 'zither'], [N.C5, 1, 'both'], [N.A4, 1, 'zither'], [N.G4, 1, 'zither'],
      [N.E4, 1, 'zither'], [N.G4, 1, 'both'], [N.D4, 1, 'zither'], [N.C4, 2, 'both'],
    ],
  },
  {
    id: 'co_la',
    title: 'Cò Lả (Sáo Trúc Đồng Quê)',
    stepMs: 320,
    bassRoots: [N.G3, N.D3, N.E3, N.C3],
    drumPattern: [0.8, 0, 0.3, 0, 0.6, 0.3, 0, 0],
    notes: [
      [N.G4, 1, 'both'], [N.A4, 1, 'zither'], [N.C5, 2, 'flute'], [N.D5, 1, 'zither'],
      [N.E5, 1, 'flute'], [N.D5, 1, 'zither'], [N.C5, 1, 'both'], [N.A4, 2, 'flute'],
      [N.C5, 1, 'zither'], [N.A4, 1, 'zither'], [N.G4, 1, 'both'], [N.E4, 1, 'zither'],
      [N.G4, 1, 'both'], [N.A4, 1, 'flute'], [N.G4, 1, 'zither'], [N.E4, 1, 'zither'],
      [N.D4, 2, 'both'], [N.E4, 1, 'zither'], [N.G4, 2, 'both'], [N.R, 1, 'zither'],
    ],
  },
  {
    id: 'tay_bac',
    title: 'Sáo Mèo Tây Bắc – Inh Lả Ơi',
    stepMs: 285,
    bassRoots: [N.A3, N.E3, N.D3, N.A3],
    drumPattern: [0.85, 0, 0.4, 0.3, 0.75, 0, 0.5, 0],
    notes: [
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
    stepMs: 295,
    bassRoots: [N.D3, N.A3, N.G3, N.D3],
    drumPattern: [0.9, 0, 0.5, 0, 0.85, 0.4, 0.5, 0],
    notes: [
      [N.D4, 1, 'moon'], [N.F4, 1, 'zither'], [N.G4, 1, 'both'], [N.A4, 2, 'moon'],
      [N.C5, 1, 'flute'], [N.D5, 1, 'both'], [N.C5, 1, 'zither'], [N.A4, 1, 'moon'],
      [N.G4, 1, 'both'], [N.F4, 1, 'zither'], [N.G4, 2, 'flute'],
      [N.A4, 1, 'moon'], [N.C5, 1, 'zither'], [N.D5, 2, 'both'], [N.F5, 1, 'flute'],
      [N.D5, 1, 'zither'], [N.C5, 1, 'moon'], [N.A4, 1, 'both'], [N.D4, 2, 'both'],
    ],
  },
  {
    id: 'tay_nguyen',
    title: 'Đàn T’rưng Đại Ngàn & Suối Reo',
    stepMs: 260,
    bassRoots: [N.C3, N.G3, N.E3, N.A3],
    drumPattern: [0.9, 0.3, 0.5, 0, 0.8, 0.3, 0.6, 0],
    notes: [
      [N.G4, 1, 'trung'], [N.C5, 1, 'trung'], [N.E5, 1, 'both'], [N.G5, 1, 'trung'],
      [N.E5, 1, 'trung'], [N.D5, 1, 'flute'], [N.C5, 2, 'both'],
      [N.A4, 1, 'trung'], [N.C5, 1, 'trung'], [N.D5, 1, 'both'], [N.E5, 1, 'flute'],
      [N.D5, 1, 'trung'], [N.C5, 1, 'trung'], [N.G4, 2, 'both'],
      [N.E4, 1, 'trung'], [N.G4, 1, 'trung'], [N.A4, 1, 'flute'], [N.C5, 2, 'both'],
    ],
  },
  {
    id: 'hoa_thom',
    title: 'Hoa Thơm Bướm Lượn (Quan Họ)',
    stepMs: 305,
    bassRoots: [N.G3, N.E3, N.C3, N.D3],
    drumPattern: [0.8, 0, 0.4, 0, 0.7, 0, 0.4, 0],
    notes: [
      [N.D4, 1, 'zither'], [N.G4, 1, 'both'], [N.A4, 1, 'zither'], [N.B4, 2, 'flute'],
      [N.A4, 1, 'zither'], [N.G4, 2, 'both'],
      [N.A4, 1, 'zither'], [N.B4, 1, 'zither'], [N.D5, 2, 'flute'], [N.B4, 1, 'zither'],
      [N.A4, 1, 'both'], [N.G4, 1, 'zither'], [N.E4, 1, 'zither'], [N.D4, 2, 'both'],
      [N.E4, 1, 'zither'], [N.G4, 1, 'both'], [N.A4, 1, 'flute'], [N.G4, 2, 'both'],
    ],
  },
  {
    id: 'khen_ma_pi_leng',
    title: 'Tiếng Khèn Mèo Đỉnh Mã Pí Lèng',
    stepMs: 275,
    bassRoots: [N.D3, N.A3, N.C3, N.G3],
    drumPattern: [0.9, 0, 0.4, 0.4, 0.8, 0, 0.5, 0.3],
    notes: [
      [N.D4, 1, 'flute'], [N.F4, 1, 'flute'], [N.A4, 2, 'both'], [N.C5, 1, 'flute'],
      [N.D5, 2, 'flute'], [N.C5, 1, 'zither'], [N.A4, 1, 'flute'], [N.G4, 2, 'both'],
      [N.F4, 1, 'flute'], [N.G4, 1, 'zither'], [N.A4, 2, 'flute'], [N.D5, 1, 'both'],
      [N.F5, 1, 'flute'], [N.D5, 2, 'flute'], [N.C5, 1, 'zither'], [N.A4, 1, 'flute'],
      [N.G4, 1, 'zither'], [N.F4, 1, 'flute'], [N.D4, 2, 'both'], [N.R, 1, 'zither'],
    ],
  },
  {
    id: 'mua_lua_sapa',
    title: 'Mùa Lúa Chín Trên Bản Mây (Sa Pa)',
    stepMs: 315,
    bassRoots: [N.C3, N.G3, N.D3, N.A3],
    drumPattern: [0.75, 0, 0.3, 0, 0.65, 0, 0.4, 0],
    notes: [
      [N.E4, 1, 'bau'], [N.G4, 1, 'zither'], [N.A4, 2, 'bau'], [N.C5, 1, 'flute'],
      [N.D5, 2, 'both'], [N.E5, 1, 'flute'], [N.D5, 1, 'zither'], [N.C5, 2, 'bau'],
      [N.A4, 1, 'zither'], [N.G4, 1, 'flute'], [N.E4, 2, 'both'], [N.D4, 1, 'zither'],
      [N.E4, 1, 'zither'], [N.G4, 2, 'bau'], [N.A4, 1, 'flute'], [N.C5, 1, 'zither'],
      [N.A4, 2, 'both'], [N.G4, 1, 'zither'], [N.A4, 2, 'bau'], [N.R, 1, 'zither'],
    ],
  },
  {
    id: 'nhip_cheo_ha_long',
    title: 'Đào Liễu & Nhịp Chèo Duyên Hải',
    stepMs: 270,
    bassRoots: [N.G3, N.D3, N.A3, N.E3],
    drumPattern: [0.95, 0, 0.5, 0.3, 0.85, 0.4, 0.5, 0],
    notes: [
      [N.G4, 1, 'moon'], [N.A4, 1, 'moon'], [N.B4, 1, 'both'], [N.D5, 2, 'flute'],
      [N.E5, 1, 'zither'], [N.D5, 1, 'moon'], [N.B4, 1, 'both'], [N.A4, 2, 'bau'],
      [N.G4, 1, 'moon'], [N.E4, 1, 'zither'], [N.D4, 1, 'moon'], [N.G4, 2, 'both'],
      [N.A4, 1, 'flute'], [N.B4, 1, 'moon'], [N.D5, 1, 'zither'], [N.B4, 1, 'both'],
      [N.A4, 1, 'moon'], [N.G4, 2, 'both'], [N.R, 1, 'moon'],
    ],
  },
  {
    id: 'nguoi_oi_dung_ve',
    title: 'Người Ơi Người Ở Đừng Về (Đàn Bầu)',
    stepMs: 345,
    bassRoots: [N.C3, N.F3, N.G3, N.C3],
    drumPattern: [0.65, 0, 0, 0.35, 0.6, 0, 0.3, 0],
    notes: [
      [N.G4, 2, 'bau'], [N.A4, 1, 'zither'], [N.C5, 2, 'bau'], [N.D5, 1, 'flute'],
      [N.E5, 2, 'bau'], [N.D5, 1, 'zither'], [N.C5, 2, 'both'],
      [N.A4, 1, 'bau'], [N.C5, 1, 'zither'], [N.A4, 2, 'flute'], [N.G4, 1, 'zither'],
      [N.E4, 2, 'bau'], [N.D4, 1, 'zither'], [N.C4, 1, 'zither'], [N.E4, 1, 'flute'],
      [N.G4, 2, 'bau'], [N.E4, 1, 'zither'], [N.C4, 2, 'both'], [N.R, 1, 'zither'],
    ],
  },
  {
    id: 'hat_xoan_co_do',
    title: 'Khúc Hát Xoan & Chuông Chùa Cổ Đô',
    stepMs: 300,
    bassRoots: [N.D3, N.G3, N.A3, N.D3],
    drumPattern: [0.85, 0, 0.45, 0, 0.75, 0.3, 0.4, 0],
    notes: [
      [N.D4, 1, 'moon'], [N.E4, 1, 'zither'], [N.G4, 2, 'both'], [N.A4, 1, 'moon'],
      [N.C5, 2, 'flute'], [N.A4, 1, 'zither'], [N.G4, 2, 'bau'],
      [N.A4, 1, 'moon'], [N.C5, 1, 'zither'], [N.D5, 2, 'both'], [N.E5, 1, 'flute'],
      [N.D5, 1, 'moon'], [N.C5, 1, 'zither'], [N.A4, 1, 'both'], [N.G4, 1, 'moon'],
      [N.E4, 1, 'zither'], [N.D4, 2, 'both'], [N.R, 1, 'zither'],
    ],
  },
  {
    id: 'nam_binh_song_huong',
    title: 'Điệu Nam Bình & Hò Mái Nhì Sông Hương',
    stepMs: 340,
    bassRoots: [N.D3, N.F3, N.A3, N.D3],
    drumPattern: [0.7, 0, 0.3, 0, 0.6, 0, 0.35, 0],
    notes: [
      [N.A4, 2, 'bau'], [N.D5, 1, 'zither'], [N.F5, 2, 'bau'], [N.E5, 1, 'flute'],
      [N.D5, 2, 'both'], [N.C5, 1, 'moon'], [N.A4, 2, 'bau'],
      [N.G4, 1, 'zither'], [N.F4, 1, 'moon'], [N.G4, 2, 'flute'], [N.A4, 1, 'zither'],
      [N.C5, 1, 'bau'], [N.A4, 1, 'moon'], [N.G4, 1, 'zither'], [N.F4, 1, 'flute'],
      [N.D4, 2, 'both'], [N.R, 1, 'zither'],
    ],
  },
  {
    id: 'ly_ngua_o_trung',
    title: 'Lý Ngựa Ô Xứ Quảng (Cầu Vàng)',
    stepMs: 255,
    bassRoots: [N.G3, N.C3, N.D3, N.G3],
    drumPattern: [0.95, 0.3, 0.5, 0.4, 0.9, 0.3, 0.6, 0.4],
    notes: [
      [N.G4, 1, 'moon'], [N.G4, 1, 'zither'], [N.C5, 1, 'both'], [N.C5, 1, 'moon'],
      [N.D5, 1, 'flute'], [N.E5, 1, 'zither'], [N.D5, 2, 'both'],
      [N.C5, 1, 'moon'], [N.A4, 1, 'zither'], [N.G4, 1, 'flute'], [N.A4, 1, 'moon'],
      [N.C5, 1, 'both'], [N.A4, 1, 'zither'], [N.G4, 2, 'both'],
      [N.E4, 1, 'moon'], [N.G4, 1, 'zither'], [N.A4, 1, 'flute'], [N.G4, 2, 'both'],
    ],
  },
  {
    id: 'dem_hoa_dang_hoian',
    title: 'Đêm Hoa Đăng Sông Hoài (Hội An)',
    stepMs: 325,
    bassRoots: [N.A3, N.E3, N.F3, N.C3],
    drumPattern: [0.75, 0, 0.35, 0, 0.65, 0, 0.35, 0],
    notes: [
      [N.E4, 1, 'moon'], [N.A4, 2, 'zither'], [N.B4, 1, 'flute'], [N.C5, 2, 'bau'],
      [N.B4, 1, 'zither'], [N.A4, 1, 'moon'], [N.G4, 2, 'both'],
      [N.E4, 1, 'zither'], [N.G4, 1, 'flute'], [N.A4, 2, 'bau'], [N.C5, 1, 'zither'],
      [N.D5, 1, 'flute'], [N.E5, 2, 'both'], [N.C5, 1, 'moon'], [N.B4, 1, 'zither'],
      [N.A4, 2, 'both'], [N.R, 1, 'zither'],
    ],
  },
  {
    id: 'bai_choi_pho_co',
    title: 'Khúc Hát Bài Chòi Xứ Quảng',
    stepMs: 275,
    bassRoots: [N.C3, N.G3, N.D3, N.G3],
    drumPattern: [0.9, 0, 0.55, 0.3, 0.85, 0, 0.5, 0.35],
    notes: [
      [N.G4, 1, 'moon'], [N.A4, 1, 'moon'], [N.C5, 1, 'both'], [N.D5, 1, 'zither'],
      [N.E5, 2, 'flute'], [N.D5, 1, 'moon'], [N.C5, 1, 'zither'],
      [N.A4, 1, 'both'], [N.G4, 1, 'moon'], [N.E4, 1, 'zither'], [N.G4, 2, 'both'],
      [N.A4, 1, 'flute'], [N.C5, 1, 'moon'], [N.A4, 1, 'zither'], [N.G4, 2, 'both'],
    ],
  },
  {
    id: 'suong_thong_dalat',
    title: 'Bản Tình Ca Rừng Thông Đà Lạt',
    stepMs: 330,
    bassRoots: [N.C3, N.A3, N.F3, N.G3],
    drumPattern: [0.7, 0, 0.3, 0, 0.65, 0, 0.35, 0],
    notes: [
      [N.G4, 1, 'zither'], [N.C5, 2, 'bau'], [N.B4, 1, 'zither'], [N.A4, 2, 'flute'],
      [N.G4, 1, 'zither'], [N.E4, 2, 'both'], [N.D4, 1, 'zither'],
      [N.E4, 1, 'trung'], [N.G4, 1, 'zither'], [N.A4, 2, 'bau'], [N.C5, 1, 'flute'],
      [N.D5, 2, 'both'], [N.E5, 1, 'flute'], [N.C5, 2, 'bau'], [N.R, 1, 'zither'],
    ],
  },
  {
    id: 'song_bien_ponagar',
    title: 'Vũ Điệu Tháp Chăm & Gió Biển Nha Trang',
    stepMs: 270,
    bassRoots: [N.D3, N.A3, N.C3, N.D3],
    drumPattern: [0.95, 0.35, 0.45, 0, 0.85, 0.35, 0.55, 0.3],
    notes: [
      [N.D4, 1, 'trung'], [N.F4, 1, 'trung'], [N.A4, 1, 'both'], [N.B4, 1, 'flute'],
      [N.C5, 2, 'flute'], [N.B4, 1, 'trung'], [N.A4, 1, 'zither'],
      [N.F4, 1, 'trung'], [N.G4, 1, 'flute'], [N.A4, 2, 'both'],
      [N.D5, 1, 'flute'], [N.C5, 1, 'trung'], [N.A4, 1, 'zither'], [N.F4, 1, 'trung'],
      [N.D4, 2, 'both'], [N.R, 1, 'trung'],
    ],
  },
  {
    id: 'da_co_phuong_nam',
    title: 'Dạ Cổ Hoài Lang & Đờn Ca Sài Gòn',
    stepMs: 320,
    bassRoots: [N.G3, N.D3, N.C3, N.G3],
    drumPattern: [0.8, 0, 0.35, 0, 0.7, 0, 0.45, 0],
    notes: [
      [N.D4, 1, 'moon'], [N.G4, 2, 'bau'], [N.A4, 1, 'moon'], [N.C5, 2, 'bau'],
      [N.D5, 1, 'zither'], [N.E5, 1, 'flute'], [N.D5, 2, 'both'],
      [N.C5, 1, 'moon'], [N.A4, 1, 'zither'], [N.G4, 2, 'bau'], [N.E4, 1, 'moon'],
      [N.D4, 1, 'zither'], [N.E4, 1, 'moon'], [N.G4, 2, 'both'], [N.R, 1, 'moon'],
    ],
  },
  {
    id: 'ly_chieu_chieu',
    title: 'Lý Chiều Chiều & Hò Sông Hậu (Miền Tây)',
    stepMs: 295,
    bassRoots: [N.C3, N.G3, N.A3, N.E3],
    drumPattern: [0.85, 0, 0.4, 0.3, 0.75, 0, 0.45, 0],
    notes: [
      [N.G4, 1, 'zither'], [N.A4, 1, 'moon'], [N.C5, 2, 'bau'], [N.D5, 1, 'flute'],
      [N.E5, 1, 'zither'], [N.D5, 1, 'moon'], [N.C5, 2, 'both'],
      [N.A4, 1, 'bau'], [N.G4, 1, 'zither'], [N.E4, 1, 'moon'], [N.G4, 2, 'flute'],
      [N.A4, 1, 'zither'], [N.G4, 1, 'moon'], [N.E4, 1, 'zither'], [N.C4, 2, 'both'],
      [N.R, 1, 'zither'],
    ],
  },
];

// Multi-song regional playlists for each of the 12 Vietnamese landmarks
export const BIOME_PLAYLISTS = {
  vn_hagiang: ['khen_ma_pi_leng', 'tay_bac', 'mua_lua_sapa'],
  vn_sapa: ['mua_lua_sapa', 'tay_bac', 'khen_ma_pi_leng'],
  vn_halong: ['nhip_cheo_ha_long', 'beo_dat', 'hoa_thom'],
  vn_hanoi: ['trong_com', 'nguoi_oi_dung_ve', 'hoa_thom'],
  vn_ninhbinh: ['co_la', 'hat_xoan_co_do', 'beo_dat'],
  vn_hue: ['luu_thuy', 'nam_binh_song_huong', 'beo_dat'],
  vn_danang: ['ly_ngua_o_trung', 'hoa_thom', 'bai_choi_pho_co'],
  vn_hoian: ['dem_hoa_dang_hoian', 'bai_choi_pho_co', 'beo_dat'],
  vn_dalat: ['tay_nguyen', 'suong_thong_dalat', 'beo_dat'],
  vn_nhatrang: ['song_bien_ponagar', 'tay_nguyen', 'ly_ngua_o_trung'],
  vn_saigon: ['da_co_phuong_nam', 'trong_com', 'ly_cay_bong'],
  vn_mientay: ['ly_cay_bong', 'ly_chieu_chieu', 'da_co_phuong_nam'],
  vietnam: ['trong_com', 'beo_dat', 'ly_cay_bong'],
};

export function createRaceAudio({ onSpeak = null } = {}) {
  const isPreviewIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();

  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.connect(ctx.destination);

  let enabled = !isPreviewIframe;
  // Comments TTS is enabled by default so viewer comments are always spoken & prioritized over story narration
  let readComments = true;
  if (isPreviewIframe) master.gain.value = 0;

  const speechQueue = [];
  let speaking = false;
  let lastWelcomeSpeechAt = 0;
  let lastInteractiveSpeechEndedAt = 0;
  let lastStorySpeechEndedAt = 0;
  let watchdog = null;
  let currentVoiceSrc = null;
  let currentItem = null;
  const recentUidGreet = new Map();
  const recentNameGreet = new Map();

  // AI Cultural Storyteller state
  let currentStoryBiomeId = 'vn_hagiang';
  let currentProvinceCode = 0;
  let storyStepIdx = 0;
  let pendingProvinceStory = null;

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

  const bgmGain = ctx.createGain();
  bgmGain.gain.value = 0.34;
  bgmGain.connect(master);

  // 1. Plucked Đàn Tranh (16-string Vietnamese zither)
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

  // 2. Breathy Sáo Trúc (Vietnamese bamboo flute with 5.4Hz vibrato)
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

  // 3. Expressive Đàn Bầu (Vietnamese monochord with glissando pitch bend & harmonic overtone)
  function playDanBau(freq, start, dur, vol = 0.125) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || freq <= 0) return;
    const totalDur = Math.max(0.35, dur * 1.28);
    for (const [mult, ratio, type] of [
      [1, 1.0, 'sine'],
      [2, 0.55, 'triangle'],
    ]) {
      const o = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const g = ctx.createGain();
      o.type = type;
      // Signature Đàn Bầu pitch swoop (nhấn cần đàn)
      o.frequency.setValueAtTime(freq * mult * 0.96, start);
      o.frequency.exponentialRampToValueAtTime(freq * mult * 1.02, start + Math.min(0.14, totalDur * 0.35));
      o.frequency.exponentialRampToValueAtTime(freq * mult, start + Math.min(0.26, totalDur * 0.65));
      lfo.frequency.setValueAtTime(4.8, start);
      lfoGain.gain.setValueAtTime(freq * mult * 0.009, start);
      lfo.connect(lfoGain).connect(o.frequency);

      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(vol * ratio, start + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, start + totalDur);
      o.connect(g).connect(bgmGain);
      o.start(start);
      lfo.start(start);
      o.stop(start + totalDur + 0.04);
      lfo.stop(start + totalDur + 0.04);
    }
  }

  // 4. Warm Đàn Nguyệt / Đàn Kìm (2-string Vietnamese moon lute)
  function playDanNguyet(freq, start, dur, vol = 0.135) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || freq <= 0) return;
    const totalDur = Math.max(0.22, dur * 1.15);
    for (const [mult, ratio, type] of [
      [1, 1.0, 'triangle'],
      [1.5, 0.22, 'sine'],
    ]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq * mult * 1.006, start);
      o.frequency.exponentialRampToValueAtTime(freq * mult, start + 0.03);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(vol * ratio, start + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, start + totalDur);
      o.connect(g).connect(bgmGain);
      o.start(start);
      o.stop(start + totalDur + 0.03);
    }
  }

  // 5. Crisp Đàn T'rưng (Highland bamboo xylophone)
  function playDanTrung(freq, start, dur, vol = 0.13) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || freq <= 0) return;
    const totalDur = Math.max(0.16, dur * 0.9);
    for (const [mult, ratio] of [
      [1, 1.0],
      [2.76, 0.25],
    ]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq * mult, start);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(vol * ratio, start + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, start + totalDur);
      o.connect(g).connect(bgmGain);
      o.start(start);
      o.stop(start + totalDur + 0.02);
    }
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

  // Soft woody Trống Cơm / Song Loan pulse
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
  let playlistCursor = 0;
  let noteCursor = 0;
  let tickCount = 0;

  function duckBgm(duck) {
    if (ctx.state === 'running') {
      // Keep warm musical bed underneath storytelling (0.13) and duck deeper for interactive announcements (0.09)
      const isStory = currentItem?.kind === 'story';
      const target = bgmMuted ? 0 : duck ? (isStory ? 0.13 : 0.09) : 0.34;
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

      if (tickCount % 8 === 0) {
        const bassRoot = song.bassRoots[Math.floor(tickCount / 8) % song.bassRoots.length];
        playWarmPad(bassRoot, t, (song.stepMs * 8) / 1000, 0.075);
      }

      const drumAccent = song.drumPattern[tickCount % song.drumPattern.length] || 0;
      if (drumAccent > 0) {
        playTrongComBeat(t, drumAccent);
      }

      if (freq > 0) {
        if (inst === 'zither' || inst === 'both') {
          playDanTranh(freq, t, durSec, 0.14);
          if (beats >= 2) playDanTranh(freq * 0.5, t + 0.03, durSec, 0.06);
        }
        if (inst === 'flute' || inst === 'both') {
          playSaoTruc(freq, t + 0.01, durSec, inst === 'flute' ? 0.105 : 0.072);
        }
        if (inst === 'bau') {
          playDanBau(freq, t, durSec, 0.125);
          if (beats >= 2) playDanTranh(freq * 0.5, t + 0.04, durSec, 0.055);
        }
        if (inst === 'moon') {
          playDanNguyet(freq, t, durSec, 0.135);
        }
        if (inst === 'trung') {
          playDanTrung(freq, t, durSec, 0.13);
        }
      }

      noteCursor++;
      tickCount++;

      // Rotate through the landmark's multi-song regional playlist (and full 21-song jukebox)
      if (noteCursor >= song.notes.length * 2) {
        noteCursor = 0;
        if (autoCycleSongs) {
          const playlist = BIOME_PLAYLISTS[currentStoryBiomeId];
          if (playlist && playlist.length > 1) {
            playlistCursor = (playlistCursor + 1) % playlist.length;
            const nextId = playlist[playlistCursor];
            const idx = VN_SONGS.findIndex(s => s.id === nextId);
            currentSongIdx = idx !== -1 ? idx : (currentSongIdx + 1) % VN_SONGS.length;
          } else {
            currentSongIdx = (currentSongIdx + 1) % VN_SONGS.length;
          }
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

  function stopCurrentSpeechImmediately(rewindStory = false) {
    if (!speaking && !currentItem) return;
    if (rewindStory && currentItem?.kind === 'story' && currentItem.rewindOnInterrupt) {
      storyStepIdx = Math.max(0, storyStepIdx - 1);
    }
    clearTimeout(watchdog);
    try { currentVoiceSrc?.stop(); } catch {}
    currentVoiceSrc = null;
    if (typeof speechSynthesis !== 'undefined') {
      try { speechSynthesis.cancel(); } catch {}
    }
    currentItem = null;
    speaking = false;
  }

  function interruptSpeechIfLowerPriority(newPriority = 2, isReal = true) {
    if (!speaking || !currentItem) return;
    const curPrio = currentItem.priority ?? 0;
    // 1. Story narration (priority 0) ALWAYS yields immediately to ANY join, comment, or donate (priority >= 1)
    if (currentItem.kind === 'story' && newPriority >= 1) {
      stopCurrentSpeechImmediately(true);
      return;
    }
    // 2. Mock/bot speech yields to any real viewer event, and normal join yields to high-tier donate
    if ((isReal && !currentItem.isReal) || (newPriority >= 5 && curPrio <= 3)) {
      stopCurrentSpeechImmediately(false);
    }
  }

  function purgeLowerPriorityFromQueue(isReal = false) {
    for (let i = speechQueue.length - 1; i >= 0; i--) {
      // Always purge queued story items when any interactive event (join/comment/donate) arrives
      if (speechQueue[i].kind === 'story') {
        if (speechQueue[i].rewindOnInterrupt) {
          storyStepIdx = Math.max(0, storyStepIdx - 1);
        }
        speechQueue.splice(i, 1);
        continue;
      }
      if (isReal && !speechQueue[i].isReal) {
        speechQueue.splice(i, 1);
      }
    }
  }

  function enqueueSpeech(item) {
    if (!enabled) return;
    const prio = item.priority ?? 1;
    const isStory = item.kind === 'story';

    // Strict deduplication
    if (currentItem && currentItem.text === item.text) return;
    if (speechQueue.some(x => x.text === item.text)) return;

    if (isStory) {
      // Story narration has the lowest priority (0): NEVER queue if anything is speaking or waiting
      if (speaking || speechQueue.length > 0) return;
      speechQueue.push(item);
      flushSpeech();
      return;
    }

    // Interactive event (Donate, Comment, or Join): purge any queued story and preempt active story immediately
    purgeLowerPriorityFromQueue(Boolean(item.isReal));
    interruptSpeechIfLowerPriority(prio, Boolean(item.isReal));

    // If a donate arrives for a uid that has a pending welcome in queue, replace the welcome since donate includes greeting
    if (prio >= 5 && item.uid) {
      for (let i = speechQueue.length - 1; i >= 0; i--) {
        if (speechQueue[i].uid === item.uid && (speechQueue[i].priority ?? 1) <= 3) {
          speechQueue.splice(i, 1);
        }
      }
    }

    const insertIdx = speechQueue.findIndex(x => (x.priority ?? 0) < prio);
    if (insertIdx === -1) speechQueue.push(item);
    else speechQueue.splice(insertIdx, 0, item);
    if (speechQueue.length > 10) speechQueue.pop();

    flushSpeech();
  }

  async function flushSpeech() {
    if (!enabled || speaking || !speechQueue.length) return;
    const item = speechQueue.shift();
    currentItem = item;
    speaking = true;
    duckBgm(true);
    onSpeak?.(item.kind === 'story' ? `🎙️ ${item.text}` : item.text, true, item.kind || 'interactive');

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(watchdog);
      const wasStory = currentItem?.kind === 'story';
      currentVoiceSrc = null;
      currentItem = null;
      speaking = false;
      if (wasStory) {
        lastStorySpeechEndedAt = Date.now();
      } else {
        lastInteractiveSpeechEndedAt = Date.now();
      }
      duckBgm(false);
      onSpeak?.('', false, '');
      setTimeout(flushSpeech, 320);
    };

    watchdog = setTimeout(done, 15_000);

    try {
      if (ctx.state !== 'running') await ctx.resume().catch(() => {});
      if (typeof speechSynthesis !== 'undefined') {
        try { speechSynthesis.cancel(); } catch {}
      }
      const res = await fetch(`/tts?q=${encodeURIComponent(item.text)}`);
      if (!res.ok) throw new Error('tts failed');
      const arr = await res.arrayBuffer();
      const audioBuf = await ctx.decodeAudioData(arr);
      if (!enabled || currentItem !== item) {
        done();
        return;
      }
      const src = ctx.createBufferSource();
      src.buffer = audioBuf;
      src.playbackRate.value = item.kind === 'story' ? 0.97 : 0.99;
      const g = ctx.createGain();
      g.gain.value = item.kind === 'story' ? 1.02 : 1.12;
      src.connect(g).connect(master);
      currentVoiceSrc = src;
      src.onended = done;
      src.start();
    } catch {
      if (typeof speechSynthesis !== 'undefined' && currentItem === item) {
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

  // ============================================================================
  // CONTINUOUS LANDMARK CULTURAL STORYTELLER SCHEDULER (Lowest Priority = 0)
  // Continuously narrates culture, history, people, and cuisine across the entire
  // journey at a landmark whenever no Donate / Comment / Join is active.
  // ============================================================================
  function tickStoryNarrator() {
    if (!enabled || isPreviewIframe) return;
    if (speaking || speechQueue.length > 0) return;

    const now = Date.now();
    // Wait at least 2.2s after any viewer donate/comment/join finishes, and 3.0s between story chapters
    if (now - lastInteractiveSpeechEndedAt < 2200) return;
    if (now - lastStorySpeechEndedAt < 3000) return;

    if (pendingProvinceStory && storyStepIdx > 0) {
      const provText = pendingProvinceStory;
      pendingProvinceStory = null;
      enqueueSpeech({
        uid: '__ai_story_province__',
        text: provText,
        kind: 'story',
        priority: 0,
        isReal: false,
        rewindOnInterrupt: false,
      });
      return;
    }

    const chapters = LANDMARK_STORIES[currentStoryBiomeId] || LANDMARK_STORIES.vietnam;
    if (!chapters || !chapters.length) return;
    const text = chapters[storyStepIdx % chapters.length];
    storyStepIdx++;
    enqueueSpeech({
      uid: '__ai_story__',
      text,
      kind: 'story',
      priority: 0,
      isReal: false,
      rewindOnInterrupt: true,
    });
  }

  // Auto-start background music & AI cultural narrator
  ctx.resume().then(() => { startBg(); }).catch(() => { startBg(); });
  setInterval(() => {
    if (!isPreviewIframe) {
      enabled = true;
      bgmMuted = false;
      master.gain.value = 1;
      if (ctx.state !== 'running') ctx.resume().catch(() => {});
      if (!bgRunning) startBg();
      tickStoryNarrator();
    }
  }, 1200);

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
      bgmMuted = false;
      if (ctx.state !== 'running') ctx.resume().catch(() => {});
      startBg();
      currentSongIdx = (currentSongIdx + 1) % VN_SONGS.length;
      noteCursor = 0;
      duckBgm(speaking);
      return this.getBgmLabel();
    },
    setBiomeMusic(biomeId, biomeObj = null) {
      bgmMuted = false;
      if (biomeId && biomeId !== currentStoryBiomeId) {
        currentStoryBiomeId = biomeId;
        storyStepIdx = 0;
        playlistCursor = 0;
        // If currently narrating the previous landmark's story, switch cleanly to the new landmark
        if (currentItem?.kind === 'story') {
          stopCurrentSpeechImmediately(false);
        }
        for (let i = speechQueue.length - 1; i >= 0; i--) {
          if (speechQueue[i].kind === 'story') speechQueue.splice(i, 1);
        }
      }
      if (biomeObj?.province?.code && biomeObj.province.code !== currentProvinceCode) {
        currentProvinceCode = biomeObj.province.code;
        if (PROVINCE_STORIES[currentProvinceCode]) {
          pendingProvinceStory = PROVINCE_STORIES[currentProvinceCode];
        }
      }
      const playlist = BIOME_PLAYLISTS[biomeId];
      const targetSongId = playlist ? playlist[playlistCursor % playlist.length] : null;
      if (!targetSongId) return this.getBgmLabel();
      const idx = VN_SONGS.findIndex(s => s.id === targetSongId);
      if (idx !== -1 && idx !== currentSongIdx) {
        currentSongIdx = idx;
        noteCursor = 0;
      }
      return this.getBgmLabel();
    },
    syncProvinceMilestone(biomeObj) {
      if (biomeObj?.province?.code && biomeObj.province.code !== currentProvinceCode) {
        currentProvinceCode = biomeObj.province.code;
        if (PROVINCE_STORIES[currentProvinceCode]) {
          pendingProvinceStory = PROVINCE_STORIES[currentProvinceCode];
        }
      }
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
          stopCurrentSpeechImmediately(false);
          onSpeak?.('', false, '');
          setTimeout(flushSpeech, 150);
        }
      }
    },
    setEnabled(_on) {
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
      const busyInteractive = (speaking && currentItem?.kind !== 'story') || speechQueue.some(x => x.kind !== 'story');

      if (isReal) {
        const lastUid = recentUidGreet.get(uid) || 0;
        const lastName = recentNameGreet.get(nameKey) || 0;
        if (now - lastUid < 12_000 || now - lastName < 12_000) return;
        recentUidGreet.set(uid, now);
        recentNameGreet.set(nameKey, now);
      } else {
        if (busyInteractive || now - lastWelcomeSpeechAt < 14_000) return;
        const lastName = recentNameGreet.get(nameKey) || 0;
        if (now - lastName < 25_000) return;
        lastWelcomeSpeechAt = now;
        recentNameGreet.set(nameKey, now);
      }

      joinChime();
      const text = formatWelcomeSpeech(msg.name, false);
      enqueueSpeech({ uid, text, kind: 'join', priority: isReal ? 3 : 1, isReal });
    },
    speakComment(runner, rawComment = '') {
      if (!enabled || !readComments || !runner) return;
      const isReal = Boolean(runner.src && runner.src !== 'mock');
      const now = Date.now();
      const uid = runner.id || runner.uid || runner.name || '';
      const who = cleanRaceTtsName(runner.name);
      const cleanText = cleanCommentForTts(rawComment);
      if (!cleanText || !/[\p{L}\p{N}]/u.test(cleanText)) return;
      const busyInteractive = (speaking && currentItem?.kind !== 'story') || speechQueue.some(x => x.kind !== 'story');

      if (!isReal) {
        if (busyInteractive || now - lastWelcomeSpeechAt < 12_000) return;
        lastWelcomeSpeechAt = now;
      } else {
        recentUidGreet.set(uid, now);
        recentNameGreet.set(who.toLowerCase(), now);
      }

      joinChime();
      const text = `Phật tử ${who}: ${cleanText}`;
      enqueueSpeech({ uid, text, kind: 'comment', priority: isReal ? 4 : 2, isReal });
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
      enqueueSpeech({ uid, text, kind: 'gift', priority: 5 + (d.tier || 1), isReal });
    },
  };
}
