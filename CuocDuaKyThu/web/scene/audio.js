// Audio, Multi-Track Lively Vietnamese Folk-Pop BGM & Continuous Priority AI Voice Engine
// for Hành Trình Đi Bộ Xuyên Việt:
// - 100% separated from Cúng Chùa Online (zero temple/Buddhist terms, zero cross-tab collision).
// - Continuous non-stop AI storytelling throughout the entire walk with background AudioBuffer pre-fetching
//   so there is zero dead air between sentences (~350ms natural breath).
// - Strict Priority Hierarchy:
//     1. Donate / Gift Boost (priority: 6..9) — Highest
//     2. Viewer Comment TTS (priority: 4 real / 2 demo)
//     3. Viewer Join / Welcome (priority: 3 real / 1 demo)
//     4. AI Landmark Cultural & Human Storyteller (priority: 0, kind: 'story') — Lowest ("ưu tiên cuối cùng")

import { LANDMARK_STORIES, PROVINCE_STORIES } from './storyScripts.js';

const CLIENT_SENSITIVE_RE = new RegExp(
  [
    '\\b(dm|đm|dcm|đcm|dkm|đkm|dmm|đmm|vcl|vkl|vl|clgt|cc|địt|dit|djt|đjt|đéo|deo|cặc|lồn|loz|buồi|cứt|đụ|đĩ|phò|cave|chịch|xoạc|nứng|fuck|bitch|sex|porn|jav|hentai|xnxx|xvideos|vlxx|onlyfans|pornhub)\\b',
    '\\b(đồ\\s*ngu|thằng\\s*ngu|con\\s*ngu|ngu\\s*ngốc|óc\\s*chó|chó\\s*điên|thằng\\s*chó|con\\s*chó|con\\s*đĩ|con\\s*phò|mất\\s*dạy|khốn\\s*nạn|súc\\s*vật|bố\\s*láo|hiếp\\s*dâm|ấu\\s*dâm|loạn\\s*luân|thủ\\s*dâm|sục\\s*cặc|bú\\s*cu|bú\\s*lồn)\\b',
    '\\b(tài\\s*xỉu|tai\\s*xiu|cá\\s*độ|ca\\s*do|cá\\s*cược|nhà\\s*cái|nha\\s*cai|nổ\\s*hũ|no\\s*hu|xóc\\s*đĩa|lô\\s*đề|cờ\\s*bạc|đánh\\s*bạc|kubet|f8bet|shbet|hi88|jun88|789bet|new88|go88|sunwin|rikvip|hitclub|baccarat|bốc\\s*bát\\s*họ|vay\\s*nóng|lừa\\s*đảo|lua\\s*dao)\\b',
    '\\b(lừa\\s*đảo|bịp|phản\\s*động|phan\\s*dong|ba\\s*que|3\\s*que|khủng\\s*bố|tự\\s*tử|tự\\s*sát|giết\\s*người|ma\\s*túy|đập\\s*đá|thuốc\\s*lắc|kẹo\\s*ke|cần\\s*sa)\\b',
    'https?:\\/\\/|www\\.|(?<!\\d)(?:\\d[\\s.\\-_*]?){8,}',
  ].join('|'),
  'iu'
);

const VN_VOWEL_RE = /[aăâeêioôơuưyáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

const VN_TTS_PHRASES = [
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
  [/\bvn\b/giu, 'Việt Nam'],
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
  if (!s) return 'Bạn';
  if (CLIENT_SENSITIVE_RE.test(s)) return 'Bạn';
  if (/^user\d{4,}$/i.test(s)) return 'Bạn';
  s = s.replace(/[_.\\-]+/g, ' ').replace(/\s*\d{3,}$/g, '').trim();
  if (!s || /^\d+$/.test(s) || s.length < 2) return 'Bạn';
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

export function formatGiftBoostSpeech({ name = '', giftVi = 'món quà', repeat = 1, mountLabel = 'Đôi Cánh Chim Lạc', bonusM = 80, isNewJoin = false } = {}) {
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
// 21 VIETNAMESE FOLK-POP, REGIONAL & TROPICAL TRAVEL SONGS (100% Royalty-Free)
// ============================================================================
export const VN_SONGS = [
  {
    id: 'trong_com',
    title: 'Trống Cơm (V-Pop Travel Remix)',
    stepMs: 225,
    bassRoots: [N.C3, N.G3, N.A3, N.G3],
    drumPattern: [1, 0.3, 0.6, 0.3, 0.9, 0.4, 0.5, 0.6],
    notes: [
      [N.G4, 1, 'zither'], [N.A4, 1, 'zither'], [N.C5, 1, 'both'], [N.C5, 1, 'zither'],
      [N.D5, 1, 'both'], [N.C5, 1, 'zither'], [N.A4, 1, 'zither'], [N.G4, 1, 'both'],
      [N.E4, 1, 'zither'], [N.G4, 1, 'zither'], [N.A4, 1, 'both'], [N.C5, 1, 'zither'],
      [N.A4, 1, 'zither'], [N.G4, 1, 'both'], [N.E4, 1, 'zither'], [N.D4, 1, 'zither'],
      [N.G4, 1, 'zither'], [N.G4, 1, 'zither'], [N.A4, 1, 'both'], [N.C5, 1, 'zither'],
      [N.D5, 1, 'both'], [N.E5, 1, 'flute'], [N.D5, 1, 'zither'], [N.C5, 1, 'both'],
      [N.A4, 1, 'zither'], [N.C5, 1, 'zither'], [N.A4, 1, 'both'], [N.G4, 1, 'zither'],
      [N.E4, 1, 'zither'], [N.G4, 1, 'both'], [N.C4, 2, 'both'],
    ],
  },
  {
    id: 'beo_dat',
    title: 'Bèo Dạt Mây Trôi (Đàn Tranh & Đàn Bầu)',
    stepMs: 260,
    bassRoots: [N.C3, N.A3, N.D3, N.G3],
    drumPattern: [0.85, 0.25, 0.4, 0.45, 0.75, 0.25, 0.5, 0.3],
    notes: [
      [N.C4, 1, 'both'], [N.E4, 1, 'zither'], [N.G4, 2, 'bau'], [N.G4, 1, 'zither'],
      [N.A4, 1, 'both'], [N.C5, 2, 'bau'], [N.A4, 1, 'zither'], [N.G4, 1, 'both'],
      [N.E5, 2, 'flute'], [N.D5, 1, 'zither'], [N.C5, 1, 'both'], [N.A4, 1, 'zither'],
      [N.G4, 1, 'zither'], [N.E4, 1, 'both'], [N.G4, 1, 'zither'], [N.D4, 2, 'bau'],
      [N.E4, 1, 'zither'], [N.G4, 1, 'both'], [N.A4, 2, 'flute'], [N.C5, 1, 'zither'],
      [N.D5, 1, 'zither'], [N.C5, 1, 'both'], [N.A4, 1, 'zither'], [N.G4, 2, 'bau'],
      [N.E4, 1, 'zither'], [N.D4, 1, 'zither'], [N.C4, 2, 'both'],
    ],
  },
  {
    id: 'ly_cay_bong',
    title: 'Lý Cây Bông (Dân Ca Nam Bộ Sôi Động)',
    stepMs: 220,
    bassRoots: [N.C3, N.E3, N.G3, N.C3],
    drumPattern: [0.95, 0.3, 0.55, 0.5, 0.9, 0.3, 0.6, 0.4],
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
    title: 'Cò Lả (Sáo Trúc Đồng Quê Rộn Ràng)',
    stepMs: 245,
    bassRoots: [N.G3, N.D3, N.E3, N.C3],
    drumPattern: [0.9, 0.25, 0.45, 0.35, 0.8, 0.4, 0.5, 0.3],
    notes: [
      [N.G4, 1, 'both'], [N.A4, 1, 'zither'], [N.C5, 2, 'flute'], [N.D5, 1, 'zither'],
      [N.E5, 1, 'flute'], [N.D5, 1, 'zither'], [N.C5, 1, 'both'], [N.A4, 2, 'flute'],
      [N.C5, 1, 'zither'], [N.A4, 1, 'zither'], [N.G4, 1, 'both'], [N.E4, 1, 'zither'],
      [N.G4, 1, 'both'], [N.A4, 1, 'flute'], [N.G4, 1, 'zither'], [N.E4, 1, 'zither'],
      [N.D4, 2, 'both'], [N.E4, 1, 'zither'], [N.G4, 2, 'both'],
    ],
  },
  {
    id: 'tay_bac',
    title: 'Vũ Điệu Tây Bắc – Inh Lả Ơi',
    stepMs: 225,
    bassRoots: [N.A3, N.E3, N.D3, N.A3],
    drumPattern: [0.95, 0.3, 0.5, 0.4, 0.85, 0.3, 0.6, 0.35],
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
    title: 'Lưu Thủy Kim Tiền (Nhã Nhạc Cung Đình)',
    stepMs: 230,
    bassRoots: [N.D3, N.A3, N.G3, N.D3],
    drumPattern: [0.95, 0.3, 0.6, 0.35, 0.9, 0.45, 0.55, 0.35],
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
    title: 'Đàn T’rưng Đại Ngàn & Nhịp Bước Cao Nguyên',
    stepMs: 210,
    bassRoots: [N.C3, N.G3, N.E3, N.A3],
    drumPattern: [1, 0.4, 0.6, 0.35, 0.9, 0.4, 0.65, 0.35],
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
    title: 'Hoa Thơm Bướm Lượn (Quan Họ Hội Xuân)',
    stepMs: 235,
    bassRoots: [N.G3, N.E3, N.C3, N.D3],
    drumPattern: [0.9, 0.3, 0.5, 0.3, 0.85, 0.35, 0.5, 0.3],
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
    title: 'Tiếng Khèn Mèo Đỉnh Mã Pí Lèng (Hà Giang)',
    stepMs: 220,
    bassRoots: [N.D3, N.A3, N.C3, N.G3],
    drumPattern: [0.95, 0.3, 0.5, 0.45, 0.85, 0.3, 0.55, 0.4],
    notes: [
      [N.D4, 1, 'flute'], [N.F4, 1, 'flute'], [N.A4, 2, 'both'], [N.C5, 1, 'flute'],
      [N.D5, 2, 'flute'], [N.C5, 1, 'zither'], [N.A4, 1, 'flute'], [N.G4, 2, 'both'],
      [N.F4, 1, 'flute'], [N.G4, 1, 'zither'], [N.A4, 2, 'flute'], [N.D5, 1, 'both'],
      [N.F5, 1, 'flute'], [N.D5, 2, 'flute'], [N.C5, 1, 'zither'], [N.A4, 1, 'flute'],
      [N.G4, 1, 'zither'], [N.F4, 1, 'flute'], [N.D4, 2, 'both'],
    ],
  },
  {
    id: 'mua_lua_sapa',
    title: 'Mùa Lúa Chín Trên Bản Mây (Sa Pa)',
    stepMs: 240,
    bassRoots: [N.C3, N.G3, N.D3, N.A3],
    drumPattern: [0.85, 0.3, 0.45, 0.3, 0.8, 0.35, 0.5, 0.3],
    notes: [
      [N.E4, 1, 'bau'], [N.G4, 1, 'zither'], [N.A4, 2, 'bau'], [N.C5, 1, 'flute'],
      [N.D5, 2, 'both'], [N.E5, 1, 'flute'], [N.D5, 1, 'zither'], [N.C5, 2, 'bau'],
      [N.A4, 1, 'zither'], [N.G4, 1, 'flute'], [N.E4, 2, 'both'], [N.D4, 1, 'zither'],
      [N.E4, 1, 'zither'], [N.G4, 2, 'bau'], [N.A4, 1, 'flute'], [N.C5, 1, 'zither'],
      [N.A4, 2, 'both'], [N.G4, 1, 'zither'], [N.A4, 2, 'bau'],
    ],
  },
  {
    id: 'nhip_cheo_ha_long',
    title: 'Đào Liễu & Nhịp Sóng Hạ Long',
    stepMs: 215,
    bassRoots: [N.G3, N.D3, N.A3, N.E3],
    drumPattern: [1, 0.35, 0.6, 0.4, 0.9, 0.45, 0.6, 0.35],
    notes: [
      [N.G4, 1, 'moon'], [N.A4, 1, 'moon'], [N.B4, 1, 'both'], [N.D5, 2, 'flute'],
      [N.E5, 1, 'zither'], [N.D5, 1, 'moon'], [N.B4, 1, 'both'], [N.A4, 2, 'bau'],
      [N.G4, 1, 'moon'], [N.E4, 1, 'zither'], [N.D4, 1, 'moon'], [N.G4, 2, 'both'],
      [N.A4, 1, 'flute'], [N.B4, 1, 'moon'], [N.D5, 1, 'zither'], [N.B4, 1, 'both'],
      [N.A4, 1, 'moon'], [N.G4, 2, 'both'],
    ],
  },
  {
    id: 'nguoi_oi_dung_ve',
    title: 'Người Ơi Người Ở Đừng Về (Hà Nội Chill)',
    stepMs: 255,
    bassRoots: [N.C3, N.F3, N.G3, N.C3],
    drumPattern: [0.85, 0.25, 0.4, 0.4, 0.8, 0.3, 0.45, 0.3],
    notes: [
      [N.G4, 2, 'bau'], [N.A4, 1, 'zither'], [N.C5, 2, 'bau'], [N.D5, 1, 'flute'],
      [N.E5, 2, 'bau'], [N.D5, 1, 'zither'], [N.C5, 2, 'both'],
      [N.A4, 1, 'bau'], [N.C5, 1, 'zither'], [N.A4, 2, 'flute'], [N.G4, 1, 'zither'],
      [N.E4, 2, 'bau'], [N.D4, 1, 'zither'], [N.C4, 1, 'zither'], [N.E4, 1, 'flute'],
      [N.G4, 2, 'bau'], [N.E4, 1, 'zither'], [N.C4, 2, 'both'],
    ],
  },
  {
    id: 'hat_xoan_co_do',
    title: 'Trẩy Hội Mùa Xuân Cố Đô (Ninh Bình)',
    stepMs: 230,
    bassRoots: [N.D3, N.G3, N.A3, N.D3],
    drumPattern: [0.9, 0.3, 0.55, 0.35, 0.85, 0.4, 0.5, 0.35],
    notes: [
      [N.D4, 1, 'moon'], [N.E4, 1, 'zither'], [N.G4, 2, 'both'], [N.A4, 1, 'moon'],
      [N.C5, 2, 'flute'], [N.A4, 1, 'zither'], [N.G4, 2, 'bau'],
      [N.A4, 1, 'moon'], [N.C5, 1, 'zither'], [N.D5, 2, 'both'], [N.E5, 1, 'flute'],
      [N.D5, 1, 'moon'], [N.C5, 1, 'zither'], [N.A4, 1, 'both'], [N.G4, 1, 'moon'],
      [N.E4, 1, 'zither'], [N.D4, 2, 'both'],
    ],
  },
  {
    id: 'nam_binh_song_huong',
    title: 'Nhịp Cầu Trường Tiền & Sông Hương',
    stepMs: 250,
    bassRoots: [N.D3, N.F3, N.A3, N.D3],
    drumPattern: [0.85, 0.25, 0.45, 0.35, 0.8, 0.3, 0.5, 0.3],
    notes: [
      [N.A4, 2, 'bau'], [N.D5, 1, 'zither'], [N.F5, 2, 'bau'], [N.E5, 1, 'flute'],
      [N.D5, 2, 'both'], [N.C5, 1, 'moon'], [N.A4, 2, 'bau'],
      [N.G4, 1, 'zither'], [N.F4, 1, 'moon'], [N.G4, 2, 'flute'], [N.A4, 1, 'zither'],
      [N.C5, 1, 'bau'], [N.A4, 1, 'moon'], [N.G4, 1, 'zither'], [N.F4, 1, 'flute'],
      [N.D4, 2, 'both'],
    ],
  },
  {
    id: 'ly_ngua_o_trung',
    title: 'Lý Ngựa Ô Xứ Quảng (Cầu Vàng Đà Nẵng)',
    stepMs: 205,
    bassRoots: [N.G3, N.C3, N.D3, N.G3],
    drumPattern: [1, 0.4, 0.6, 0.45, 0.95, 0.4, 0.65, 0.45],
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
    stepMs: 245,
    bassRoots: [N.A3, N.E3, N.F3, N.C3],
    drumPattern: [0.85, 0.3, 0.45, 0.35, 0.8, 0.3, 0.5, 0.3],
    notes: [
      [N.E4, 1, 'moon'], [N.A4, 2, 'zither'], [N.B4, 1, 'flute'], [N.C5, 2, 'bau'],
      [N.B4, 1, 'zither'], [N.A4, 1, 'moon'], [N.G4, 2, 'both'],
      [N.E4, 1, 'zither'], [N.G4, 1, 'flute'], [N.A4, 2, 'bau'], [N.C5, 1, 'zither'],
      [N.D5, 1, 'flute'], [N.E5, 2, 'both'], [N.C5, 1, 'moon'], [N.B4, 1, 'zither'],
      [N.A4, 2, 'both'],
    ],
  },
  {
    id: 'bai_choi_pho_co',
    title: 'Khúc Hát Bài Chòi Xứ Quảng',
    stepMs: 215,
    bassRoots: [N.C3, N.G3, N.D3, N.G3],
    drumPattern: [0.95, 0.35, 0.6, 0.4, 0.9, 0.35, 0.55, 0.4],
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
    stepMs: 245,
    bassRoots: [N.C3, N.A3, N.F3, N.G3],
    drumPattern: [0.85, 0.3, 0.45, 0.35, 0.8, 0.3, 0.5, 0.3],
    notes: [
      [N.G4, 1, 'zither'], [N.C5, 2, 'bau'], [N.B4, 1, 'zither'], [N.A4, 2, 'flute'],
      [N.G4, 1, 'zither'], [N.E4, 2, 'both'], [N.D4, 1, 'zither'],
      [N.E4, 1, 'trung'], [N.G4, 1, 'zither'], [N.A4, 2, 'bau'], [N.C5, 1, 'flute'],
      [N.D5, 2, 'both'], [N.E5, 1, 'flute'], [N.C5, 2, 'bau'],
    ],
  },
  {
    id: 'song_bien_ponagar',
    title: 'Vũ Điệu Tháp Chăm & Gió Biển Nha Trang',
    stepMs: 215,
    bassRoots: [N.D3, N.A3, N.C3, N.D3],
    drumPattern: [1, 0.4, 0.55, 0.35, 0.9, 0.4, 0.6, 0.35],
    notes: [
      [N.D4, 1, 'trung'], [N.F4, 1, 'trung'], [N.A4, 1, 'both'], [N.B4, 1, 'flute'],
      [N.C5, 2, 'flute'], [N.B4, 1, 'trung'], [N.A4, 1, 'zither'],
      [N.F4, 1, 'trung'], [N.G4, 1, 'flute'], [N.A4, 2, 'both'],
      [N.D5, 1, 'flute'], [N.C5, 1, 'trung'], [N.A4, 1, 'zither'], [N.F4, 1, 'trung'],
      [N.D4, 2, 'both'],
    ],
  },
  {
    id: 'da_co_phuong_nam',
    title: 'Nhịp Sống Sài Gòn & Giai Điệu Phương Nam',
    stepMs: 225,
    bassRoots: [N.G3, N.D3, N.C3, N.G3],
    drumPattern: [0.95, 0.35, 0.5, 0.4, 0.9, 0.35, 0.55, 0.4],
    notes: [
      [N.D4, 1, 'moon'], [N.G4, 2, 'bau'], [N.A4, 1, 'moon'], [N.C5, 2, 'bau'],
      [N.D5, 1, 'zither'], [N.E5, 1, 'flute'], [N.D5, 2, 'both'],
      [N.C5, 1, 'moon'], [N.A4, 1, 'zither'], [N.G4, 2, 'bau'], [N.E4, 1, 'moon'],
      [N.D4, 1, 'zither'], [N.E4, 1, 'moon'], [N.G4, 2, 'both'],
    ],
  },
  {
    id: 'ly_chieu_chieu',
    title: 'Lý Chiều Chiều & Chợ Nổi Miền Tây',
    stepMs: 220,
    bassRoots: [N.C3, N.G3, N.A3, N.E3],
    drumPattern: [0.95, 0.35, 0.55, 0.4, 0.85, 0.35, 0.55, 0.35],
    notes: [
      [N.G4, 1, 'zither'], [N.A4, 1, 'moon'], [N.C5, 2, 'bau'], [N.D5, 1, 'flute'],
      [N.E5, 1, 'zither'], [N.D5, 1, 'moon'], [N.C5, 2, 'both'],
      [N.A4, 1, 'bau'], [N.G4, 1, 'zither'], [N.E4, 1, 'moon'], [N.G4, 2, 'flute'],
      [N.A4, 1, 'zither'], [N.G4, 1, 'moon'], [N.E4, 1, 'zither'], [N.C4, 2, 'both'],
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
  let readComments = true;
  if (isPreviewIframe) master.gain.value = 0;

  const speechQueue = [];
  let speaking = false;
  let usingBrowserSpeech = false;
  let lastWelcomeSpeechAt = 0;
  let watchdog = null;
  let currentVoiceSrc = null;
  let currentItem = null;
  const recentUidGreet = new Map();
  const recentNameGreet = new Map();

  // Continuous AI Cultural Storyteller state & Preload AudioBuffer Cache
  let currentStoryBiomeId = 'vn_hagiang';
  let currentProvinceCode = 0;
  let storyStepIdx = 0;
  let pendingProvinceStory = null;
  const decodedTtsCache = new Map(); // text -> Promise<AudioBuffer>

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
  // STUDIO-GRADE MULTI-TRACK VIETNAMESE FOLK-POP & TRAVEL GROOVE ENGINE
  // Includes:
  // - Warm Stereo Echo & Lowpass Ambience Bus (`melodyBus`)
  // - Crisp Travel Percussion (Kick + Bamboo Phách Rimshot + 16th-Note Shaker)
  // - Syncopated Plucked Pentatonic Bassline (`playGrooveBass`)
  // - Off-beat Pentatonic Chord Arpeggio Strummer (`playChordStrum`)
  // - Expressive 5-Instrument Vietnamese Lead Ensemble
  // ============================================================================
  const bgmGain = ctx.createGain();
  bgmGain.gain.value = 0.36;
  bgmGain.connect(master);

  // Melody bus with warm acoustic echo (195ms delay + 2600Hz lowpass feedback) so notes shimmer richly
  const melodyBus = ctx.createGain();
  melodyBus.gain.value = 1.0;
  melodyBus.connect(bgmGain);

  const echoDelay = ctx.createDelay(1.0);
  echoDelay.delayTime.value = 0.195;
  const echoFilter = ctx.createBiquadFilter();
  echoFilter.type = 'lowpass';
  echoFilter.frequency.value = 2500;
  const echoFeedback = ctx.createGain();
  echoFeedback.gain.value = 0.28;
  const echoWet = ctx.createGain();
  echoWet.gain.value = 0.32;

  melodyBus.connect(echoDelay);
  echoDelay.connect(echoFilter);
  echoFilter.connect(echoWet);
  echoWet.connect(bgmGain);
  echoFilter.connect(echoFeedback);
  echoFeedback.connect(echoDelay);

  // Pre-generate white noise buffer for lively Shaker, Hi-Hat, and Bamboo Snare
  const noiseBuf = (() => {
    const len = ctx.sampleRate * 0.25;
    const b = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = b.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return b;
  })();

  // 1. Plucked Đàn Tranh (16-string Vietnamese zither with bright attack & warm body)
  function playDanTranh(freq, start, dur, vol = 0.14) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || freq <= 0) return;
    for (const [mult, peak, d, type] of [
      [1, vol, dur * 1.55, 'triangle'],
      [2, vol * 0.42, dur * 0.95, 'sine'],
      [3, vol * 0.16, dur * 0.5, 'sine'],
    ]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq * mult * 1.014, start);
      o.frequency.exponentialRampToValueAtTime(freq * mult, start + 0.042);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(peak, start + 0.014);
      g.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.22, d));
      o.connect(g).connect(melodyBus);
      o.start(start);
      o.stop(start + Math.max(0.22, d) + 0.03);
    }
  }

  // 2. Breathy Sáo Trúc (Vietnamese bamboo flute with 5.5Hz vibrato & harmonic overtone)
  function playSaoTruc(freq, start, dur, vol = 0.105) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || freq <= 0) return;
    const totalDur = Math.max(0.3, dur * 1.2);
    for (const [mult, ratio] of [[1, 1.0], [2, 0.22]]) {
      const o = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq * mult, start);
      lfo.frequency.setValueAtTime(5.5, start);
      lfoGain.gain.setValueAtTime(freq * mult * 0.0085, start);
      lfo.connect(lfoGain).connect(o.frequency);

      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(vol * ratio, start + 0.055);
      g.gain.exponentialRampToValueAtTime(0.0001, start + totalDur);
      o.connect(g).connect(melodyBus);
      o.start(start);
      lfo.start(start);
      o.stop(start + totalDur + 0.03);
      lfo.stop(start + totalDur + 0.03);
    }
  }

  // 3. Expressive Đàn Bầu (Vietnamese monochord with signature pitch bend)
  function playDanBau(freq, start, dur, vol = 0.13) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || freq <= 0) return;
    const totalDur = Math.max(0.36, dur * 1.32);
    for (const [mult, ratio, type] of [
      [1, 1.0, 'sine'],
      [2, 0.58, 'triangle'],
    ]) {
      const o = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq * mult * 0.955, start);
      o.frequency.exponentialRampToValueAtTime(freq * mult * 1.022, start + Math.min(0.13, totalDur * 0.35));
      o.frequency.exponentialRampToValueAtTime(freq * mult, start + Math.min(0.24, totalDur * 0.65));
      lfo.frequency.setValueAtTime(4.9, start);
      lfoGain.gain.setValueAtTime(freq * mult * 0.009, start);
      lfo.connect(lfoGain).connect(o.frequency);

      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(vol * ratio, start + 0.038);
      g.gain.exponentialRampToValueAtTime(0.0001, start + totalDur);
      o.connect(g).connect(melodyBus);
      o.start(start);
      lfo.start(start);
      o.stop(start + totalDur + 0.04);
      lfo.stop(start + totalDur + 0.04);
    }
  }

  // 4. Warm Đàn Nguyệt / Đàn Kìm (2-string moon lute)
  function playDanNguyet(freq, start, dur, vol = 0.14) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || freq <= 0) return;
    const totalDur = Math.max(0.24, dur * 1.2);
    for (const [mult, ratio, type] of [
      [1, 1.0, 'triangle'],
      [1.5, 0.25, 'sine'],
      [2, 0.3, 'sine'],
    ]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq * mult * 1.008, start);
      o.frequency.exponentialRampToValueAtTime(freq * mult, start + 0.028);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(vol * ratio, start + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, start + totalDur);
      o.connect(g).connect(melodyBus);
      o.start(start);
      o.stop(start + totalDur + 0.03);
    }
  }

  // 5. Crisp Đàn T'rưng (Highland bamboo marimba)
  function playDanTrung(freq, start, dur, vol = 0.135) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || freq <= 0) return;
    const totalDur = Math.max(0.18, dur * 0.95);
    for (const [mult, ratio] of [
      [1, 1.0],
      [2.76, 0.28],
    ]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq * mult, start);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(vol * ratio, start + 0.007);
      g.gain.exponentialRampToValueAtTime(0.0001, start + totalDur);
      o.connect(g).connect(melodyBus);
      o.start(start);
      o.stop(start + totalDur + 0.02);
    }
  }

  // 6. Groovy Plucked Pentatonic Bassline + Warm Pad
  function playGrooveBass(rootFreq, start, dur, vol = 0.12) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || rootFreq <= 0) return;
    const o = ctx.createOscillator();
    const flt = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(rootFreq, start);
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(480, start);
    flt.frequency.exponentialRampToValueAtTime(150, start + dur * 0.85);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.92);
    o.connect(flt).connect(g).connect(bgmGain);
    o.start(start);
    o.stop(start + dur);
  }

  // 7. Off-Beat Pentatonic Chord Arpeggio Strummer (fills the background with lush movement)
  function playChordStrum(rootFreq, start, stepDurSec) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || rootFreq <= 0) return;
    // Pentatonic major chord voicing: Root (octave up), Major 2nd/3rd, Perfect 5th, Octave
    const ratios = [2.0, 2.5, 3.0, 4.0];
    for (let i = 0; i < ratios.length; i++) {
      const t = start + i * 0.028;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(rootFreq * ratios[i], t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.036, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + stepDurSec * 1.4);
      o.connect(g).connect(melodyBus);
      o.start(t);
      o.stop(t + stepDurSec * 1.45);
    }
  }

  // 8. Lively Percussion: Warm Kick + Bamboo Phách Snare + 16th-Note Travel Shaker
  function playPercussionGroove(start, stepInBar, accent, stepDurSec) {
    if (!enabled || bgmMuted || ctx.state !== 'running') return;

    // Kick drum on beats 0, 3, 4 (syncopated tropical/travel groove)
    if (stepInBar === 0 || stepInBar === 3 || stepInBar === 4) {
      const kVol = stepInBar === 0 ? 0.14 : 0.10;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(128, start);
      o.frequency.exponentialRampToValueAtTime(46, start + 0.11);
      g.gain.setValueAtTime(kVol, start);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);
      o.connect(g).connect(bgmGain);
      o.start(start);
      o.stop(start + 0.14);
    }

    // Crisp Bamboo Phách / Snare Rimshot on backbeats (step 2 and 6)
    if (stepInBar === 2 || stepInBar === 6) {
      // Woody rim tone
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(340, start);
      o.frequency.exponentialRampToValueAtTime(165, start + 0.055);
      g.gain.setValueAtTime(0.075, start);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.065);
      o.connect(g).connect(bgmGain);
      o.start(start);
      o.stop(start + 0.07);

      // Crisp snare snap
      const nSrc = ctx.createBufferSource();
      nSrc.buffer = noiseBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2200;
      bp.Q.value = 1.4;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.055, start);
      ng.gain.exponentialRampToValueAtTime(0.0001, start + 0.07);
      nSrc.connect(bp).connect(ng).connect(bgmGain);
      nSrc.start(start);
      nSrc.stop(start + 0.075);
    }

    // Lively 16th-note Shaker / Hi-hat groove (main step + subdivision off-beat)
    for (const [subOffset, sVol] of [[0, 0.032 * Math.max(0.5, accent)], [stepDurSec * 0.5, 0.022]]) {
      const st = start + subOffset;
      const nSrc = ctx.createBufferSource();
      nSrc.buffer = noiseBuf;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 5800;
      const sg = ctx.createGain();
      sg.gain.setValueAtTime(sVol, st);
      sg.gain.exponentialRampToValueAtTime(0.0001, st + 0.038);
      nSrc.connect(hp).connect(sg).connect(bgmGain);
      nSrc.start(st);
      nSrc.stop(st + 0.042);
    }
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
      // Keep the lively background music clearly audible (0.24) during continuous story narration,
      // duck slightly more (0.15) for high-priority viewer interactive events, and 0.36 when idle.
      const isStory = currentItem?.kind === 'story';
      const target = bgmMuted ? 0 : duck ? (isStory ? 0.24 : 0.15) : 0.36;
      bgmGain.gain.setTargetAtTime(target, ctx.currentTime, 0.14);
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
      const durSec = (waitMs / 1000) * 0.96;
      const stepSec = song.stepMs / 1000;
      const stepInBar = tickCount % 8;
      const bassRoot = song.bassRoots[Math.floor(tickCount / 4) % song.bassRoots.length];

      // 1. Syncopated Plucked Bassline (Root on 0, 4; Fifth on 2, 6; Octave bounce on 3, 7)
      if (stepInBar % 2 === 0) {
        const bFreq = (stepInBar === 2 || stepInBar === 6) ? bassRoot * 1.5 : bassRoot;
        playGrooveBass(bFreq, t, stepSec * 1.85, 0.115);
      } else if (stepInBar === 3 || stepInBar === 7) {
        playGrooveBass(bassRoot * 2, t, stepSec * 0.9, 0.075);
      }

      // 2. Off-beat Pentatonic Chord Arpeggio Strum on steps 1 and 5
      if (stepInBar === 1 || stepInBar === 5) {
        playChordStrum(bassRoot, t, stepSec);
      }

      // 3. Lively Percussion Groove (Kick + Bamboo Snare + 16th-Note Shaker) across every beat of the note
      const subBeats = Math.max(1, beats);
      for (let b = 0; b < subBeats; b++) {
        const subStep = (stepInBar + b) % 8;
        const drumAccent = song.drumPattern[subStep % song.drumPattern.length] || 0.4;
        playPercussionGroove(t + b * stepSec, subStep, drumAccent, stepSec);
      }

      // 4. Vietnamese Traditional Lead Ensemble + Harmony Duet
      if (freq > 0) {
        if (inst === 'zither' || inst === 'both') {
          playDanTranh(freq, t, durSec, 0.145);
          // Graceful harmony pluck (octave + fifth shimmer on longer notes)
          playDanTranh(freq * 0.5, t + 0.025, durSec, 0.065);
          if (beats >= 2) {
            playDanTranh(freq * 1.5, t + stepSec * 0.98, durSec * 0.6, 0.075);
          }
        }
        if (inst === 'flute' || inst === 'both') {
          playSaoTruc(freq, t + 0.008, durSec, inst === 'flute' ? 0.11 : 0.08);
          if (inst === 'flute') {
            playDanTranh(freq * 0.5, t, durSec * 0.8, 0.06);
          }
        }
        if (inst === 'bau') {
          playDanBau(freq, t, durSec, 0.13);
          playDanTranh(freq * 0.5, t + 0.03, durSec, 0.065);
          if (beats >= 2) {
            playSaoTruc(freq, t + stepSec * 0.5, durSec * 0.7, 0.065);
          }
        }
        if (inst === 'moon') {
          playDanNguyet(freq, t, durSec, 0.14);
          if (beats >= 2) {
            playDanTranh(freq * 1.5, t + stepSec * 0.95, durSec * 0.6, 0.07);
          }
        }
        if (inst === 'trung') {
          playDanTrung(freq, t, durSec, 0.14);
          playDanTranh(freq * 0.5, t + 0.02, durSec, 0.06);
        }
      }

      noteCursor++;
      tickCount += subBeats;

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
    tone(523.25, t, 0.35, 0.07, 'sine');
    tone(659.25, t + 0.07, 0.45, 0.05, 'sine');
  }

  function boostSfx(tier = 1) {
    if (!enabled) return;
    const t = ctx.currentTime;
    if (tier >= 3) {
      for (const [i, f] of [392.0, 523.25, 659.25].entries()) {
        tone(f, t + i * 0.11, 0.45, 0.11, 'sine');
      }
    } else {
      tone(440, t, 0.36, 0.09, 'sine', 587.33);
    }
  }

  // ============================================================================
  // PRE-FETCHING & CONTINUOUS PRIORITY TTS ENGINE
  // Pre-decodes upcoming story sentences into AudioBuffers while the current
  // sentence is playing so the transition between sentences takes only ~350ms!
  // ============================================================================
  function fetchAndDecodeTts(text) {
    if (!text) return Promise.reject(new Error('empty text'));
    let p = decodedTtsCache.get(text);
    if (!p) {
      p = (async () => {
        const res = await fetch(`/tts?q=${encodeURIComponent(text)}`);
        if (!res.ok) throw new Error('tts failed');
        const arr = await res.arrayBuffer();
        return await ctx.decodeAudioData(arr);
      })();
      p.catch(() => decodedTtsCache.delete(text));
      if (decodedTtsCache.size >= 80) {
        decodedTtsCache.delete(decodedTtsCache.keys().next().value);
      }
      decodedTtsCache.set(text, p);
    }
    return p;
  }

  function peekNextStoryText() {
    if (pendingProvinceStory && storyStepIdx > 0) return pendingProvinceStory;
    const chapters = LANDMARK_STORIES[currentStoryBiomeId] || LANDMARK_STORIES.vietnam;
    if (!chapters || !chapters.length) return '';
    return chapters[storyStepIdx % chapters.length];
  }

  function preloadNextStoryBuffer() {
    const nextText = peekNextStoryText();
    if (nextText) {
      fetchAndDecodeTts(nextText).catch(() => {});
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
    if (usingBrowserSpeech && typeof speechSynthesis !== 'undefined') {
      try { speechSynthesis.cancel(); } catch {}
      usingBrowserSpeech = false;
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

  function queueNextStoryNow() {
    if (!enabled || isPreviewIframe) return;
    if (speaking || speechQueue.length > 0) return;

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

  async function flushSpeech() {
    if (!enabled || speaking || !speechQueue.length) return;
    const item = speechQueue.shift();
    currentItem = item;
    speaking = true;
    duckBgm(true);
    onSpeak?.(item.kind === 'story' ? `🎙️ ${item.text}` : item.text, true, item.kind || 'interactive');

    // Immediately start pre-fetching the NEXT story chapter while this sentence is playing!
    preloadNextStoryBuffer();

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(watchdog);
      currentVoiceSrc = null;
      currentItem = null;
      usingBrowserSpeech = false;
      speaking = false;
      duckBgm(false);
      onSpeak?.('', false, '');

      // Continuous non-stop flow:
      // - If interactive items (Donate / Comment / Join) are waiting in queue, speak them within 180ms.
      // - Once interactive queue is empty, immediately chain the next AI landmark story sentence within 350ms!
      if (speechQueue.length > 0) {
        setTimeout(flushSpeech, 180);
      } else {
        setTimeout(queueNextStoryNow, 350);
      }
    };

    watchdog = setTimeout(done, 18_000);

    try {
      if (ctx.state !== 'running') await ctx.resume().catch(() => {});
      const audioBuf = await fetchAndDecodeTts(item.text);
      if (!enabled || currentItem !== item) {
        if (currentItem !== item) return;
        done();
        return;
      }
      const src = ctx.createBufferSource();
      src.buffer = audioBuf;
      src.playbackRate.value = item.kind === 'story' ? 0.98 : 1.0;
      const g = ctx.createGain();
      g.gain.value = item.kind === 'story' ? 1.08 : 1.15;
      src.connect(g).connect(master);
      currentVoiceSrc = src;
      src.onended = done;
      src.start();
    } catch {
      if (typeof speechSynthesis !== 'undefined' && currentItem === item) {
        usingBrowserSpeech = true;
        const u = new SpeechSynthesisUtterance(item.text);
        u.lang = 'vi-VN';
        u.rate = 0.96;
        u.onend = done;
        u.onerror = done;
        try {
          speechSynthesis.speak(u);
          return;
        } catch {}
      }
      if (currentItem === item) done();
    }
  }

  // Auto-start background music & continuous AI cultural narrator immediately
  ctx.resume().then(() => {
    startBg();
    queueNextStoryNow();
  }).catch(() => {
    startBg();
    queueNextStoryNow();
  });

  // Watchdog heartbeat ensures continuous reading & lively BGM never stall 24/7
  setInterval(() => {
    if (!isPreviewIframe) {
      enabled = true;
      bgmMuted = false;
      master.gain.value = 1;
      if (ctx.state !== 'running') ctx.resume().catch(() => {});
      if (!bgRunning) startBg();
      if (!speaking && speechQueue.length === 0) {
        queueNextStoryNow();
      }
    }
  }, 800);

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
        if (currentItem?.kind === 'story') {
          stopCurrentSpeechImmediately(false);
        }
        for (let i = speechQueue.length - 1; i >= 0; i--) {
          if (speechQueue[i].kind === 'story') speechQueue.splice(i, 1);
        }
        preloadNextStoryBuffer();
        if (!speaking && speechQueue.length === 0) {
          setTimeout(queueNextStoryNow, 150);
        }
      }
      if (biomeObj?.province?.code && biomeObj.province.code !== currentProvinceCode) {
        currentProvinceCode = biomeObj.province.code;
        if (PROVINCE_STORIES[currentProvinceCode]) {
          pendingProvinceStory = PROVINCE_STORIES[currentProvinceCode];
          preloadNextStoryBuffer();
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
          preloadNextStoryBuffer();
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
      if (!speaking && speechQueue.length === 0) {
        queueNextStoryNow();
      }
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
      if (speechQueue.length > 0) flushSpeech();
      else if (!speaking) queueNextStoryNow();
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
      if (!speaking) flushSpeech();
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
      const text = `${who} bình luận: ${cleanText}`;
      enqueueSpeech({ uid, text, kind: 'comment', priority: isReal ? 4 : 2, isReal });
      if (!speaking) flushSpeech();
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
      if (!speaking) flushSpeech();
    },
  };
}
