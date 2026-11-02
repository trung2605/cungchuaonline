// Audio, Karplus-Strong Acoustic Vietnamese BGM & Dual-Host (1 Male + 1 Female) AI Voice Engine
// for Hành Trình Đi Bộ Xuyên Việt:
// - 2 Distinct AI Voices ("1 Nam – 1 Nữ đồng dẫn chương trình"):
//     * 👨 Nam MC Minh Quân (WSOLA phase-aligned time-stretch + formant-shifted baritone + chest EQ)
//     * 👩 Nữ MC Hoài My (Crisp neural Vietnamese female voice + presence EQ)
// - Studio-Grade Acoustic BGM Engine:
//     * Karplus-Strong Physical String Waveguide Modeling for Đàn Tranh & Nylon Acoustic Guitar
//     * Warm Felt Lofi Piano 7th/9th Chords + Silky Bamboo Flute
//     * True Stereo Concert Hall Convolution Reverb (`ConvolverNode`)
// - Continuous non-stop reading with background pre-fetching & strict Priority Preemption:
//     Donate (6..9) > Comment (4) > Join (3) > Story Narration (0 - lowest priority)

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
  [/\bhi+\b|\bhello+\b|\bhelo+\b/giu, 'xin chào'],
  [/\bok+\b|\boke+\b|\bokay\b/giu, 'ok'],
];

export function cleanCommentForTts(raw = '') {
  let s = String(raw || '').normalize('NFC').trim();
  if (!s) return '';
  const deobfuscated = s.replace(/(?<=\p{L})[.*_-]+(?=\p{L})/gu, '');
  if (CLIENT_SENSITIVE_RE.test(s) || CLIENT_SENSITIVE_RE.test(deobfuscated)) return '';
  const hadEmoji = /[\p{Extended_Pictographic}]/u.test(s);
  const rawCopy = s;
  s = s
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]+/gu, ' ')
    .replace(/[^\p{L}\p{N}\s,.!?'"-]/gu, ' ')
    .replace(/(\p{L})\1{2,}/gu, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  for (const [re, rep] of VN_TTS_PHRASES) s = s.replace(re, rep);
  s = s.replace(/\s+/g, ' ').trim();
  if (!s || s.length < 2 || !VN_VOWEL_RE.test(s)) {
    if (hadEmoji) {
      if (/[🙏🪷☸️]/u.test(rawCopy)) return 'chắp tay cầu bình an';
      if (/[🥰😍❤️🧡💛💚💙💜💖💗💓💞💕❣️]/u.test(rawCopy)) return 'thả tim yêu thương cổ vũ cả đoàn';
      return 'thả biểu cảm cổ vũ hành trình xuyên Việt';
    }
    return '';
  }
  if (/^(?:ha|he|ho|ka|ki|hu|hư){3,}$/iu.test(s.replace(/\s+/g, ''))) return '';
  if (CLIENT_SENSITIVE_RE.test(s)) return '';
  return s.slice(0, 65);
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

// Pitch table (Hz) across 3 octaves for Vietnamese pentatonic & acoustic arrangements
const N = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
  R: 0,
};

// ============================================================================
// 21 VIETNAMESE ACOUSTIC FOLK, LOFI PIANO & TRAVEL SONGS (100% Royalty-Free)
// ============================================================================
export const VN_SONGS = [
  {
    id: 'trong_com',
    title: 'Trống Cơm (Acoustic Guitar & Đàn Tranh)',
    stepMs: 250,
    bassRoots: [N.C3, N.G3, N.A3, N.F3],
    drumPattern: [1, 0, 0.5, 0, 0.85, 0, 0.45, 0],
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
    title: 'Bèo Dạt Mây Trôi (Piano Lofi & Đàn Tranh)',
    stepMs: 280,
    bassRoots: [N.C3, N.A3, N.F3, N.G3],
    drumPattern: [0.85, 0, 0.35, 0, 0.75, 0, 0.4, 0],
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
    title: 'Lý Cây Bông (Acoustic Miền Tây)',
    stepMs: 245,
    bassRoots: [N.C3, N.A3, N.D3, N.G3],
    drumPattern: [0.9, 0, 0.45, 0, 0.85, 0, 0.5, 0],
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
    title: 'Cò Lả (Sáo Trúc & Guitar Đồng Quê)',
    stepMs: 265,
    bassRoots: [N.C3, N.G3, N.A3, N.E3],
    drumPattern: [0.85, 0, 0.4, 0, 0.75, 0, 0.45, 0],
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
    title: 'Inh Lả Ơi (Sáo Trúc & Guitar Tây Bắc)',
    stepMs: 250,
    bassRoots: [N.A3, N.F3, N.C3, N.G3],
    drumPattern: [0.9, 0, 0.45, 0, 0.8, 0, 0.5, 0],
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
    title: 'Lưu Thủy Kim Tiền (Acoustic Cố Đô Huế)',
    stepMs: 255,
    bassRoots: [N.D3, N.A3, N.F3, N.G3],
    drumPattern: [0.9, 0, 0.5, 0, 0.85, 0, 0.45, 0],
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
    title: 'Khúc Nhạc Cao Nguyên & Rừng Thông',
    stepMs: 245,
    bassRoots: [N.C3, N.G3, N.A3, N.F3],
    drumPattern: [0.9, 0, 0.5, 0, 0.85, 0, 0.5, 0],
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
    title: 'Hoa Thơm Bướm Lượn (Quan Họ Acoustic)',
    stepMs: 260,
    bassRoots: [N.G3, N.E3, N.C3, N.D3],
    drumPattern: [0.85, 0, 0.45, 0, 0.8, 0, 0.45, 0],
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
    title: 'Sáo Trúc Trên Đỉnh Mã Pí Lèng (Hà Giang)',
    stepMs: 255,
    bassRoots: [N.D3, N.A3, N.C3, N.G3],
    drumPattern: [0.9, 0, 0.45, 0, 0.8, 0, 0.5, 0],
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
    title: 'Mùa Lúa Chín Trên Bản Mây (Sa Pa Chill)',
    stepMs: 270,
    bassRoots: [N.C3, N.G3, N.A3, N.F3],
    drumPattern: [0.85, 0, 0.4, 0, 0.75, 0, 0.45, 0],
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
    title: 'Đào Liễu & Sóng Biển Hạ Long (Acoustic)',
    stepMs: 250,
    bassRoots: [N.G3, N.D3, N.E3, N.C3],
    drumPattern: [0.9, 0, 0.5, 0, 0.85, 0, 0.5, 0],
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
    title: 'Người Ơi Người Ở Đừng Về (Lofi Piano)',
    stepMs: 275,
    bassRoots: [N.C3, N.A3, N.F3, N.G3],
    drumPattern: [0.8, 0, 0.35, 0, 0.75, 0, 0.4, 0],
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
    title: 'Khúc Hát Mùa Xuân Cố Đô (Ninh Bình)',
    stepMs: 255,
    bassRoots: [N.D3, N.A3, N.G3, N.D3],
    drumPattern: [0.85, 0, 0.45, 0, 0.8, 0, 0.45, 0],
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
    title: 'Chiều Tím Sông Hương (Guitar & Đàn Tranh)',
    stepMs: 270,
    bassRoots: [N.D3, N.F3, N.C3, N.G3],
    drumPattern: [0.8, 0, 0.4, 0, 0.75, 0, 0.4, 0],
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
    stepMs: 240,
    bassRoots: [N.G3, N.D3, N.E3, N.C3],
    drumPattern: [0.95, 0, 0.5, 0, 0.85, 0, 0.5, 0],
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
    title: 'Đêm Hoa Đăng Sông Hoài (Piano & Đàn Tranh)',
    stepMs: 265,
    bassRoots: [N.A3, N.F3, N.C3, N.G3],
    drumPattern: [0.85, 0, 0.4, 0, 0.75, 0, 0.45, 0],
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
    title: 'Khúc Hát Bài Chòi Xứ Quảng (Acoustic)',
    stepMs: 245,
    bassRoots: [N.C3, N.G3, N.A3, N.F3],
    drumPattern: [0.9, 0, 0.5, 0, 0.85, 0, 0.5, 0],
    notes: [
      [N.G4, 1, 'moon'], [N.A4, 1, 'moon'], [N.C5, 1, 'both'], [N.D5, 1, 'zither'],
      [N.E5, 2, 'flute'], [N.D5, 1, 'moon'], [N.C5, 1, 'zither'],
      [N.A4, 1, 'both'], [N.G4, 1, 'moon'], [N.E4, 1, 'zither'], [N.G4, 2, 'both'],
      [N.A4, 1, 'flute'], [N.C5, 1, 'moon'], [N.A4, 1, 'zither'], [N.G4, 2, 'both'],
    ],
  },
  {
    id: 'suong_thong_dalat',
    title: 'Bản Tình Ca Rừng Thông Đà Lạt (Lofi Piano)',
    stepMs: 265,
    bassRoots: [N.C3, N.A3, N.F3, N.G3],
    drumPattern: [0.85, 0, 0.4, 0, 0.75, 0, 0.45, 0],
    notes: [
      [N.G4, 1, 'zither'], [N.C5, 2, 'bau'], [N.B4, 1, 'zither'], [N.A4, 2, 'flute'],
      [N.G4, 1, 'zither'], [N.E4, 2, 'both'], [N.D4, 1, 'zither'],
      [N.E4, 1, 'trung'], [N.G4, 1, 'zither'], [N.A4, 2, 'bau'], [N.C5, 1, 'flute'],
      [N.D5, 2, 'both'], [N.E5, 1, 'flute'], [N.C5, 2, 'bau'],
    ],
  },
  {
    id: 'song_bien_ponagar',
    title: 'Gió Biển Nha Trang & Tháp Cổ (Acoustic)',
    stepMs: 245,
    bassRoots: [N.D3, N.A3, N.C3, N.G3],
    drumPattern: [0.9, 0, 0.45, 0, 0.85, 0, 0.5, 0],
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
    title: 'Đêm Sài Gòn & Giai Điệu Phương Nam',
    stepMs: 255,
    bassRoots: [N.G3, N.E3, N.C3, N.D3],
    drumPattern: [0.85, 0, 0.45, 0, 0.8, 0, 0.45, 0],
    notes: [
      [N.D4, 1, 'moon'], [N.G4, 2, 'bau'], [N.A4, 1, 'moon'], [N.C5, 2, 'bau'],
      [N.D5, 1, 'zither'], [N.E5, 1, 'flute'], [N.D5, 2, 'both'],
      [N.C5, 1, 'moon'], [N.A4, 1, 'zither'], [N.G4, 2, 'bau'], [N.E4, 1, 'moon'],
      [N.D4, 1, 'zither'], [N.E4, 1, 'moon'], [N.G4, 2, 'both'],
    ],
  },
  {
    id: 'ly_chieu_chieu',
    title: 'Lý Chiều Chiều & Quê Hương Miền Tây',
    stepMs: 250,
    bassRoots: [N.C3, N.G3, N.A3, N.F3],
    drumPattern: [0.9, 0, 0.45, 0, 0.8, 0, 0.45, 0],
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

// ============================================================================
// WSOLA (Waveform Similarity Overlap-Add) Time-Stretch for Natural Male Voice
// Stretches audio duration by `stretch = 1.22` at original pitch using phase-aligned
// Hann windows so when played back at `playbackRate = 0.82`, the speaking tempo is
// 1.00x (100% natural speed) while pitch & vocal-tract formants shift down into a
// warm, natural Vietnamese Male MC baritone!
// ============================================================================
function createMaleStretchedBuffer(ctx, srcBuf, stretch = 1.21) {
  const sr = srcBuf.sampleRate;
  const input = srcBuf.getChannelData(0);
  const inLen = input.length;
  const outLen = Math.floor(inLen * stretch);
  const outBuf = ctx.createBuffer(1, outLen, sr);
  const output = outBuf.getChannelData(0);

  const winSize = Math.round(sr * 0.036); // 36ms grain window
  const halfWin = Math.floor(winSize / 2);
  const synHop = halfWin;
  const anaHop = synHop / stretch;
  const searchRange = Math.round(sr * 0.008); // +-8ms pitch-period correlation search

  const hann = new Float32Array(winSize);
  for (let i = 0; i < winSize; i++) {
    hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (winSize - 1)));
  }

  let outPos = 0;
  let inCenter = 0;

  while (outPos + winSize < outLen && inCenter + winSize < inLen) {
    let bestOffset = 0;
    const expectedIn = Math.floor(inCenter);

    if (outPos > 0) {
      let maxCorr = -Infinity;
      const minOff = Math.max(0, expectedIn - searchRange);
      const maxOff = Math.min(inLen - winSize - 1, expectedIn + searchRange);
      // Cross-correlate the overlapping tail in `output` with candidate frames in `input`
      for (let cand = minOff; cand <= maxOff; cand += 2) {
        let corr = 0;
        for (let k = 0; k < halfWin; k += 4) {
          corr += output[outPos + k] * input[cand + k];
        }
        if (corr > maxCorr) {
          maxCorr = corr;
          bestOffset = cand - expectedIn;
        }
      }
    }

    const actualIn = Math.max(0, Math.min(inLen - winSize, expectedIn + bestOffset));
    for (let i = 0; i < winSize; i++) {
      output[outPos + i] += input[actualIn + i] * hann[i];
    }

    outPos += synHop;
    inCenter += anaHop;
  }

  return outBuf;
}

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
  let activeSpeechSeq = 0;
  let lastInteractiveDoneAt = 0;
  let lastMockJoinAt = 0;
  let lastMockCommentAt = 0;
  let nextFlushTimer = null;
  let watchdog = null;
  let currentVoiceSrc = null;
  let currentItem = null;
  let interactiveGenderToggle = 0;
  const recentJoinUid = new Map();
  const recentCommentKey = new Map();

  // Continuous AI Cultural Storyteller state & Dual-Voice AudioBuffer Cache
  let currentStoryBiomeId = 'vn_hagiang';
  let currentProvinceCode = 0;
  let storyStepIdx = 0;
  let pendingProvinceStory = null;
  const decodedTtsCache = new Map(); // text -> Promise<{ femaleBuf, maleBuf }>

  // Dedicated Broadcast Voice EQ Chains for Male MC & Female MC
  const maleVoiceChain = (() => {
    const lowShelf = ctx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 175;
    lowShelf.gain.value = 4.2;

    const bodyPeak = ctx.createBiquadFilter();
    bodyPeak.type = 'peaking';
    bodyPeak.frequency.value = 440;
    bodyPeak.Q.value = 1.1;
    bodyPeak.gain.value = 2.2;

    const smoothTop = ctx.createBiquadFilter();
    smoothTop.type = 'lowpass';
    smoothTop.frequency.value = 7600;

    lowShelf.connect(bodyPeak);
    bodyPeak.connect(smoothTop);
    smoothTop.connect(master);
    return lowShelf;
  })();

  const femaleVoiceChain = (() => {
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 115;

    const presence = ctx.createBiquadFilter();
    presence.type = 'peaking';
    presence.frequency.value = 2650;
    presence.Q.value = 1.2;
    presence.gain.value = 2.0;

    hp.connect(presence);
    presence.connect(master);
    return hp;
  })();

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
  // KARPLUS-STRONG PHYSICAL STRING MODELING & CONCERT HALL REVERB BGM ENGINE
  // Produces realistic plucked Đàn Tranh, Nylon Acoustic Guitar, Warm Lofi Felt
  // Piano Chords, and Silky Bamboo Flute inside a 2.5s Stereo Hall Reverb!
  // ============================================================================
  const bgmGain = ctx.createGain();
  bgmGain.gain.value = 0.38;
  bgmGain.connect(master);

  // Master BGM Warmth Compressor & EQ so no harsh frequencies ever clash with AI voices
  const bgmWarmFilter = ctx.createBiquadFilter();
  bgmWarmFilter.type = 'lowpass';
  bgmWarmFilter.frequency.value = 3800;
  bgmWarmFilter.connect(bgmGain);

  // True 2.5-second Stereo Concert Hall Convolution Reverb
  const hallReverb = ctx.createConvolver();
  hallReverb.buffer = (() => {
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * 2.5);
    const ir = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const env = Math.exp(-t * 2.35) * (1 - Math.exp(-t * 28));
        const raw = (Math.random() * 2 - 1) * env;
        // Warm low-pass damping inside hall
        lp = lp * 0.72 + raw * 0.28;
        d[i] = lp * 0.42;
      }
    }
    return ir;
  })();

  const reverbWet = ctx.createGain();
  reverbWet.gain.value = 0.48;
  hallReverb.connect(reverbWet);
  reverbWet.connect(bgmWarmFilter);

  const acousticDry = ctx.createGain();
  acousticDry.gain.value = 0.85;
  acousticDry.connect(bgmWarmFilter);
  acousticDry.connect(hallReverb);

  // Karplus-Strong Physical Waveguide Plucked String Generator (Caches realistic plucked string buffers)
  const stringBufferCache = new Map();
  function getKarplusStrongBuffer(freq, style = 'zither') {
    const key = `${style}:${Math.round(freq * 10)}`;
    let buf = stringBufferCache.get(key);
    if (buf) return buf;

    const sr = ctx.sampleRate;
    const durSec = style === 'guitar' ? 2.4 : 2.8;
    const len = Math.floor(sr * durSec);
    buf = ctx.createBuffer(1, len, sr);
    const out = buf.getChannelData(0);

    const period = Math.max(8, Math.round(sr / freq));
    const ring = new Float32Array(period);

    // Pluck exciter: smoothed noise burst + fundamental body impulse
    let prev = 0;
    const smoothAlpha = style === 'guitar' ? 0.58 : 0.32;
    for (let i = 0; i < period; i++) {
      const n = Math.random() * 2 - 1;
      prev = prev * smoothAlpha + n * (1 - smoothAlpha);
      const body = Math.sin((2 * Math.PI * i) / period) * (style === 'guitar' ? 0.65 : 0.4);
      ring[i] = (prev * 0.6 + body) * 0.9;
    }

    // Damping & string stiffness parameters
    const damping = style === 'guitar' ? 0.9935 : 0.9962;
    const brightness = style === 'guitar' ? 0.38 : 0.54;
    let p = 0;
    let lastVal = 0;

    for (let i = 0; i < len; i++) {
      const cur = ring[p];
      out[i] = cur;
      const nextP = (p + 1) % period;
      // Lowpass waveguide bridge reflection
      const avg = brightness * cur + (1 - brightness) * ring[nextP];
      ring[p] = (avg * 0.88 + lastVal * 0.12) * damping;
      lastVal = cur;
      p = nextP;
    }

    stringBufferCache.set(key, buf);
    return buf;
  }

  // 1. Play Physical-Modeled Đàn Tranh or Acoustic Guitar Pluck
  function playAcousticPluck(freq, start, vol = 0.24, style = 'zither') {
    if (!enabled || bgmMuted || ctx.state !== 'running' || freq <= 0) return;
    const buf = getKarplusStrongBuffer(freq, style);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.0008, start + (style === 'guitar' ? 2.1 : 2.5));
    src.connect(g).connect(acousticDry);
    src.start(start);
    src.stop(start + (style === 'guitar' ? 2.15 : 2.55));
  }

  // 2. Play Warm Felt Lofi Piano Chord (Lush 4-note chord pad + soft hammer attack)
  function playFeltPianoChord(rootFreq, start, durSec, vol = 0.068) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || rootFreq <= 0) return;
    // Warm Pentatonic Major9 / Add6 voicing: Root, Fifth, Octave, Major 10th
    const intervals = [1.0, 1.5, 2.0, 2.5, 3.0];
    for (let i = 0; i < intervals.length; i++) {
      const f = rootFreq * intervals[i];
      const noteStart = start + i * 0.032; // Gentle pianist roll arpeggiation
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const flt = ctx.createBiquadFilter();
      const g = ctx.createGain();

      o1.type = 'triangle';
      o2.type = 'sine';
      o1.frequency.setValueAtTime(f, noteStart);
      o2.frequency.setValueAtTime(f * 2, noteStart);
      o1.detune.setValueAtTime((i - 2) * 2.5, noteStart);

      flt.type = 'lowpass';
      flt.frequency.setValueAtTime(920, noteStart);
      flt.frequency.exponentialRampToValueAtTime(340, noteStart + durSec);

      const noteVol = i === 0 ? vol * 1.15 : vol * (0.85 - i * 0.1);
      g.gain.setValueAtTime(0.0001, noteStart);
      g.gain.linearRampToValueAtTime(noteVol, noteStart + 0.035);
      g.gain.exponentialRampToValueAtTime(0.0001, noteStart + durSec * 1.15);

      const p2Gain = ctx.createGain();
      p2Gain.gain.value = 0.22;
      o1.connect(flt);
      o2.connect(p2Gain).connect(flt);
      flt.connect(g).connect(acousticDry);

      o1.start(noteStart);
      o2.start(noteStart);
      o1.stop(noteStart + durSec * 1.2);
      o2.stop(noteStart + durSec * 1.2);
    }
  }

  // 3. Silky Bamboo Flute (Sáo Trúc with delayed natural vibrato & warm lowpass)
  function playSilkFlute(freq, start, durSec, vol = 0.085) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || freq <= 0) return;
    const totalDur = Math.max(0.38, durSec * 1.28);
    const o = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const overGain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const flt = ctx.createBiquadFilter();
    const g = ctx.createGain();

    o.type = 'sine';
    overtone.type = 'sine';
    o.frequency.setValueAtTime(freq * 0.992, start);
    o.frequency.exponentialRampToValueAtTime(freq, start + 0.045);
    overtone.frequency.setValueAtTime(freq * 2, start);
    overGain.gain.value = 0.16;

    // Delayed vibrato blooms naturally after 100ms
    lfo.frequency.setValueAtTime(5.2, start);
    lfoGain.gain.setValueAtTime(0.01, start);
    lfoGain.gain.linearRampToValueAtTime(freq * 0.0075, start + Math.min(0.18, totalDur * 0.45));
    lfo.connect(lfoGain).connect(o.frequency);

    flt.type = 'lowpass';
    flt.frequency.value = 1850;

    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.075);
    g.gain.setValueAtTime(vol * 0.92, start + totalDur * 0.65);
    g.gain.exponentialRampToValueAtTime(0.0001, start + totalDur);

    o.connect(flt);
    overtone.connect(overGain).connect(flt);
    flt.connect(g).connect(acousticDry);

    o.start(start);
    overtone.start(start);
    lfo.start(start);
    o.stop(start + totalDur + 0.04);
    overtone.stop(start + totalDur + 0.04);
    lfo.stop(start + totalDur + 0.04);
  }

  // 4. Expressive Đàn Bầu (Warm singing harmonic glide in Concert Hall Reverb)
  function playDanBau(freq, start, durSec, vol = 0.095) {
    if (!enabled || bgmMuted || ctx.state !== 'running' || freq <= 0) return;
    const totalDur = Math.max(0.45, durSec * 1.38);
    const o = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const flt = ctx.createBiquadFilter();
    const g = ctx.createGain();

    o.type = 'triangle';
    o.frequency.setValueAtTime(freq * 0.955, start);
    o.frequency.exponentialRampToValueAtTime(freq * 1.018, start + Math.min(0.14, totalDur * 0.35));
    o.frequency.exponentialRampToValueAtTime(freq, start + Math.min(0.26, totalDur * 0.65));

    lfo.frequency.setValueAtTime(4.8, start);
    lfoGain.gain.setValueAtTime(freq * 0.0085, start);
    lfo.connect(lfoGain).connect(o.frequency);

    flt.type = 'lowpass';
    flt.frequency.value = 1650;

    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.045);
    g.gain.exponentialRampToValueAtTime(0.0001, start + totalDur);

    o.connect(flt).connect(g).connect(acousticDry);
    o.start(start);
    lfo.start(start);
    o.stop(start + totalDur + 0.04);
    lfo.stop(start + totalDur + 0.04);
  }

  // 5. Soft Lo-Fi Heartbeat Kick & Gentle Wood Clave
  function playWarmLofiPulse(start, stepInBar) {
    if (!enabled || bgmMuted || ctx.state !== 'running') return;
    if (stepInBar === 0 || stepInBar === 4) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(96, start);
      o.frequency.exponentialRampToValueAtTime(42, start + 0.13);
      g.gain.setValueAtTime(stepInBar === 0 ? 0.12 : 0.085, start);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
      o.connect(g).connect(bgmWarmFilter);
      o.start(start);
      o.stop(start + 0.17);
    } else if (stepInBar === 2 || stepInBar === 6) {
      // Soft woody acoustic guitar body tap / phách trầm
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(240, start);
      o.frequency.exponentialRampToValueAtTime(115, start + 0.045);
      g.gain.setValueAtTime(0.045, start);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.055);
      o.connect(g).connect(acousticDry);
      o.start(start);
      o.stop(start + 0.06);
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
      const isStory = currentItem?.kind === 'story';
      const target = bgmMuted ? 0 : duck ? (isStory ? 0.27 : 0.18) : 0.40;
      bgmGain.gain.setTargetAtTime(target, ctx.currentTime, 0.16);
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

      // 1. Warm Lofi Felt Piano Chords & Acoustic Guitar Bass Arpeggio
      if (stepInBar === 0 || stepInBar === 4) {
        playFeltPianoChord(bassRoot, t, stepSec * 4.2, 0.062);
        playAcousticPluck(bassRoot, t, 0.22, 'guitar');
      } else if (stepInBar === 2 || stepInBar === 6) {
        playAcousticPluck(bassRoot * 1.5, t, 0.16, 'guitar');
      } else if (stepInBar === 1 || stepInBar === 5) {
        playAcousticPluck(bassRoot * 2, t, 0.13, 'guitar');
      } else if (stepInBar === 3 || stepInBar === 7) {
        playAcousticPluck(bassRoot * 2.5, t, 0.12, 'guitar');
      }

      // 2. Soft Lo-Fi Heartbeat Rhythm
      const subBeats = Math.max(1, beats);
      for (let b = 0; b < subBeats; b++) {
        playWarmLofiPulse(t + b * stepSec, (stepInBar + b) % 8);
      }

      // 3. Lead Karplus-Strong Đàn Tranh, Nylon Guitar, Đàn Bầu & Silky Sáo Trúc
      if (freq > 0) {
        if (inst === 'zither' || inst === 'both' || inst === 'trung') {
          playAcousticPluck(freq, t, 0.28, 'zither');
          // Shimmering lower-octave guitar companion note
          playAcousticPluck(freq * 0.5, t + 0.025, 0.16, 'guitar');
          if (beats >= 2) {
            // Gentle ornamental grace pluck (láy đàn tranh) on sustained notes
            playAcousticPluck(freq * 1.5, t + stepSec * 0.96, 0.16, 'zither');
          }
        }
        if (inst === 'moon') {
          playAcousticPluck(freq, t, 0.28, 'guitar');
          playAcousticPluck(freq * 2, t + 0.02, 0.14, 'zither');
        }
        if (inst === 'flute' || inst === 'both') {
          playSilkFlute(freq, t + 0.01, durSec, inst === 'flute' ? 0.095 : 0.07);
          if (inst === 'flute') {
            playAcousticPluck(freq, t, 0.18, 'guitar');
          }
        }
        if (inst === 'bau') {
          playDanBau(freq, t, durSec, 0.10);
          playAcousticPluck(freq, t, 0.20, 'zither');
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
    playAcousticPluck(N.C5, t, 0.18, 'zither');
    playAcousticPluck(N.E5, t + 0.07, 0.16, 'zither');
  }

  function boostSfx(tier = 1) {
    if (!enabled) return;
    const t = ctx.currentTime;
    if (tier >= 3) {
      for (const [i, f] of [N.G4, N.C5, N.E5].entries()) {
        playAcousticPluck(f, t + i * 0.1, 0.22, 'zither');
      }
    } else {
      playAcousticPluck(N.A4, t, 0.20, 'zither');
      playAcousticPluck(N.D5, t + 0.08, 0.20, 'zither');
    }
  }

  // ============================================================================
  // DUAL-HOST (1 MALE + 1 FEMALE) PRE-FETCHING & CONTINUOUS PRIORITY TTS ENGINE
  // ============================================================================
  function fetchAndDecodeDualVoiceTts(text) {
    if (!text) return Promise.reject(new Error('empty text'));
    let p = decodedTtsCache.get(text);
    if (!p) {
      p = (async () => {
        const res = await fetch(`/tts?q=${encodeURIComponent(text)}`);
        if (!res.ok) throw new Error('tts failed');
        const arr = await res.arrayBuffer();
        const femaleBuf = await ctx.decodeAudioData(arr);
        const maleBuf = createMaleStretchedBuffer(ctx, femaleBuf, 1.21);
        return { femaleBuf, maleBuf };
      })();
      p.catch(() => decodedTtsCache.delete(text));
      if (decodedTtsCache.size >= 60) {
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
      fetchAndDecodeDualVoiceTts(nextText).catch(() => {});
    }
  }

  function stopCurrentSpeechImmediately(rewindStory = false) {
    activeSpeechSeq++;
    clearTimeout(watchdog);
    watchdog = null;
    clearTimeout(nextFlushTimer);
    nextFlushTimer = null;
    if (!speaking && !currentItem) return;
    if (rewindStory && currentItem?.kind === 'story' && currentItem.rewindOnInterrupt) {
      storyStepIdx = Math.max(0, storyStepIdx - 1);
    }
    if (currentVoiceSrc) {
      try {
        currentVoiceSrc.onended = null;
        currentVoiceSrc.stop();
        currentVoiceSrc.disconnect();
      } catch {}
      currentVoiceSrc = null;
    }
    if (usingBrowserSpeech && typeof speechSynthesis !== 'undefined') {
      try { speechSynthesis.cancel(); } catch {}
      usingBrowserSpeech = false;
    }
    currentItem = null;
    speaking = false;
  }

  // Strict Priority Hierarchy:
  // 1. Gift / Donate (`kind: 'gift'`, priority 13..16 real / 9..12 demo)
  // 2. Participant Join (`kind: 'join'`, priority 10 real / 7 demo)
  // 3. Participant Comment (`kind: 'comment'`, priority 9 real / 6 demo)
  // 4. Landmark & Cultural Story (`kind: 'story'`, priority 0 - ALWAYS lowest)
  function interruptSpeechIfLowerPriority(newPriority = 6, isReal = true) {
    if (!speaking || !currentItem) return;
    const curPrio = currentItem.priority ?? 0;
    // Any participant event (priority >= 1) IMMEDIATELY preempts Story narration (priority 0)
    if (currentItem.kind === 'story' && newPriority >= 1) {
      stopCurrentSpeechImmediately(true);
      return;
    }
    // Real viewer events immediately preempt Mock/Demo speech; Gift events preempt lower non-gift speech
    if ((isReal && !currentItem.isReal) || (newPriority >= 13 && curPrio <= 9)) {
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
      if (speaking || speechQueue.length > 0) return;
      speechQueue.push(item);
      flushSpeech();
      return;
    }

    // Pre-fetch Dual-Voice TTS audio immediately when a participant event arrives so playback is instantaneous
    fetchAndDecodeDualVoiceTts(item.text).catch(() => {});

    purgeLowerPriorityFromQueue(Boolean(item.isReal));
    interruptSpeechIfLowerPriority(prio, Boolean(item.isReal));

    // Insert in strict descending priority order; items of the same priority stay in FIFO arrival order
    const insertIdx = speechQueue.findIndex(x => (x.priority ?? 0) < prio);
    if (insertIdx === -1) speechQueue.push(item);
    else speechQueue.splice(insertIdx, 0, item);
    if (speechQueue.length > 14) speechQueue.pop();

    flushSpeech();
  }

  function queueNextStoryNow() {
    if (!enabled || isPreviewIframe) return;
    if (speaking || speechQueue.length > 0 || nextFlushTimer) return;
    // Give participants priority window after interactive speech finishes before resuming story
    if (Date.now() - lastInteractiveDoneAt < 850) return;

    if (pendingProvinceStory && storyStepIdx > 0) {
      const provText = pendingProvinceStory;
      pendingProvinceStory = null;
      const gender = storyStepIdx % 2 === 0 ? 'male' : 'female';
      enqueueSpeech({
        uid: '__ai_story_province__',
        text: provText,
        kind: 'story',
        gender,
        priority: 0,
        isReal: false,
        rewindOnInterrupt: false,
      });
      return;
    }

    const chapters = LANDMARK_STORIES[currentStoryBiomeId] || LANDMARK_STORIES.vietnam;
    if (!chapters || !chapters.length) return;
    // Alternate 1 Male (👨 MC Minh Quân) & 1 Female (👩 MC Hoài My) on every chapter!
    const gender = storyStepIdx % 2 === 0 ? 'male' : 'female';
    const text = chapters[storyStepIdx % chapters.length];
    storyStepIdx++;
    enqueueSpeech({
      uid: '__ai_story__',
      text,
      kind: 'story',
      gender,
      priority: 0,
      isReal: false,
      rewindOnInterrupt: true,
    });
  }

  async function flushSpeech() {
    clearTimeout(nextFlushTimer);
    nextFlushTimer = null;
    if (!enabled || speaking || !speechQueue.length) return;
    const item = speechQueue.shift();
    const mySeq = ++activeSpeechSeq;
    currentItem = item;
    speaking = true;
    const gender = item.gender || 'female';
    duckBgm(true);
    onSpeak?.(item.text, true, item.kind || 'interactive', gender);

    // Pre-fetch next queued participant item (or next story chapter if queue is empty)
    if (speechQueue.length > 0) {
      fetchAndDecodeDualVoiceTts(speechQueue[0].text).catch(() => {});
    } else {
      preloadNextStoryBuffer();
    }

    let finished = false;
    const done = () => {
      if (finished || mySeq !== activeSpeechSeq) return;
      finished = true;
      clearTimeout(watchdog);
      watchdog = null;
      currentVoiceSrc = null;
      currentItem = null;
      usingBrowserSpeech = false;
      speaking = false;
      if (item.kind !== 'story') {
        lastInteractiveDoneAt = Date.now();
      }
      duckBgm(false);
      onSpeak?.('', false, '', gender);

      if (speechQueue.length > 0) {
        nextFlushTimer = setTimeout(flushSpeech, 70);
      } else {
        nextFlushTimer = setTimeout(queueNextStoryNow, 900);
      }
    };

    watchdog = setTimeout(done, 18_000);

    try {
      if (ctx.state !== 'running') await ctx.resume().catch(() => {});
      const { femaleBuf, maleBuf } = await fetchAndDecodeDualVoiceTts(item.text);
      if (!enabled || mySeq !== activeSpeechSeq || currentItem !== item) {
        return;
      }
      const isMale = gender === 'male';
      const src = ctx.createBufferSource();
      src.buffer = isMale ? maleBuf : femaleBuf;
      // Male uses WSOLA 1.21x stretched buffer played at 0.825x rate -> 1.00x natural speed with warm baritone pitch!
      // Female uses original neural buffer at 1.01x rate -> crisp, bright female voice!
      src.playbackRate.value = isMale ? 0.825 : 1.01;
      const g = ctx.createGain();
      g.gain.value = isMale ? 1.22 : 1.08;
      src.connect(g).connect(isMale ? maleVoiceChain : femaleVoiceChain);
      currentVoiceSrc = src;
      src.onended = done;
      src.start();
    } catch {
      if (mySeq !== activeSpeechSeq || currentItem !== item) return;
      if (typeof speechSynthesis !== 'undefined') {
        usingBrowserSpeech = true;
        const u = new SpeechSynthesisUtterance(item.text);
        u.lang = 'vi-VN';
        u.rate = 0.96;
        u.pitch = gender === 'male' ? 0.78 : 1.12;
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

  // Auto-start background music & continuous dual-host AI narrator immediately
  ctx.resume().then(() => {
    startBg();
    queueNextStoryNow();
  }).catch(() => {
    startBg();
    queueNextStoryNow();
  });

  setInterval(() => {
    if (!isPreviewIframe) {
      enabled = true;
      bgmMuted = false;
      master.gain.value = 1;
      if (ctx.state !== 'running') ctx.resume().catch(() => {});
      if (!bgRunning) startBg();
      if (!speaking && speechQueue.length === 0 && !nextFlushTimer) {
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
      return `🎵 ${song.title}`;
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

      if (isReal) {
        const lastUid = recentJoinUid.get(uid) || 0;
        if (now - lastUid < 2500) return;
        recentJoinUid.set(uid, now);
      } else {
        const queuedInteractive = speechQueue.filter(x => x.kind !== 'story').length;
        if (queuedInteractive >= 3 || now - lastMockJoinAt < 4500) return;
        lastMockJoinAt = now;
      }

      joinChime();
      const gender = interactiveGenderToggle++ % 2 === 0 ? 'female' : 'male';
      const text = formatWelcomeSpeech(msg.name, false);
      // Join priority (10 real / 7 demo) is HIGHER than Comment (9 real / 6 demo) and Story (0)
      enqueueSpeech({ uid, text, kind: 'join', gender, priority: isReal ? 10 : 7, isReal });
    },
    speakComment(runner, rawComment = '') {
      if (!enabled || !readComments || !runner) return;
      const isReal = Boolean(runner.src && runner.src !== 'mock');
      const now = Date.now();
      const uid = runner.id || runner.uid || runner.name || '';
      const who = cleanRaceTtsName(runner.name);
      const cleanText = cleanCommentForTts(rawComment);
      if (!cleanText || !/[\p{L}\p{N}]/u.test(cleanText)) return;

      const dedupeKey = `${uid}:${cleanText.toLowerCase()}`;
      if (isReal) {
        const lastSame = recentCommentKey.get(dedupeKey) || 0;
        if (now - lastSame < 2500) return;
        recentCommentKey.set(dedupeKey, now);
      } else {
        const queuedInteractive = speechQueue.filter(x => x.kind !== 'story').length;
        if (queuedInteractive >= 3 || now - lastMockCommentAt < 5000) return;
        lastMockCommentAt = now;
      }

      joinChime();
      const gender = interactiveGenderToggle++ % 2 === 0 ? 'male' : 'female';
      const text = `${who} bình luận: ${cleanText}`;
      // Comment priority (9 real / 6 demo) is right after Join (10 / 7) and ALWAYS preempts Story (0)
      enqueueSpeech({ uid, text, kind: 'comment', gender, priority: isReal ? 9 : 6, isReal });
    },
    announceGift(d) {
      if (!enabled || !d) return;
      const isReal = Boolean(d.src && d.src !== 'mock');
      const uid = d.uid || d.name || '';

      boostSfx(d.tier || 1);
      const gender = interactiveGenderToggle++ % 2 === 0 ? 'female' : 'male';
      const text = formatGiftBoostSpeech(d);
      // Gift priority (13..16 real / 9..12 demo) is the highest priority
      enqueueSpeech({ uid, text, kind: 'gift', gender, priority: (isReal ? 12 : 8) + (d.tier || 1), isReal });
    },
  };
}
