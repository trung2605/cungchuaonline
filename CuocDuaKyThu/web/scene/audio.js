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

export function formatGiftBoostSpeech({
  name = '',
  giftVi = 'món quà',
  repeat = 1,
  mountLabel = 'Đôi Cánh Chim Lạc',
  bonusM = 80,
  isNewJoin = false,
  overtookKing = false,
  chestUnlocked = false,
  regionalItem = null,
} = {}) {
  const who = cleanRaceTtsName(name);
  const combo = repeat > 1 ? `${repeat} ${giftVi}` : giftVi;
  const specPhrase = regionalItem?.name
    ? ` và ${regionalItem.name}`
    : '';
  const kingNote = overtookKing ? ', chính thức soán ngôi Top 1 Vua Hành Trình!' : '!';
  const chestNote = chestUnlocked ? ' Đại tiệc Kho Báu Lễ Hội đã nổ, tăng tốc toàn đoàn gấp ba lần!' : '';
  if (isNewJoin) {
    return `Chào mừng ${who} cùng tham gia hành trình đi bộ xuyên Việt, tặng ${combo} nhận ${mountLabel}${specPhrase}, tiến thêm ${bonusM} mét${kingNote}${chestNote}`;
  }
  return `Cảm ơn ${who} đã tặng ${combo}, nhận ${mountLabel}${specPhrase}, tiến thêm ${bonusM} mét${kingNote}${chestNote}`;
}

const GIFT_CTA_SENTENCES = [
  'Các bạn ơi, chỉ cần gửi tặng một bông Hoa Hồng một kim cương là nhân vật sẽ mọc Đôi Cánh Chim Lạc bay vọt thêm tám mươi mét và góp lửa mở Kho Báu Lễ Hội toàn đoàn đấy ạ!',
  'Ai muốn cưỡi chiếc Xe Máy Cub tám mươi mốt huyền thoại phóng vèo qua đèo với tốc độ gấp ba lần thì hãy gửi tặng Hoa Rosa mười kim cương để bứt phá lên ngôi Vua Hành Trình nhé!',
  'Mỗi phần quà từ một bông Hoa Hồng, Hoa Sen hay Nước Hoa đều giúp thanh Kho Báu Lễ Hội đầy lên nhanh chóng; khi Kho Báu nổ, tất cả thành viên trên đường đua đều được tăng tốc cầu vồng gấp ba lần!',
  'Cuộc đua giành ngôi vị Quán Quân trên Bảng Vàng Xuyên Việt đang rất gay cấn, một phần quà nhỏ lúc này sẽ giúp bạn vượt qua hàng chục đối thủ để dẫn đầu đoàn hành trình!',
];

function splitIntoAtomicSentences(rawText = '') {
  const clean = String(rawText || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const parts = clean
    .split(/(?<=[.!?…])\s+/u)
    .map(s => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [clean];
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

function pcmToWavBlobUrl(samples, sampleRate = 24000) {
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  const writeStr = (off, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function audioBufferToWavBlobUrl(buf, rateScale = 1.0, gainScale = 1.0) {
  const input = buf.getChannelData(0);
  const inLen = input.length;
  const outLen = Math.max(1, Math.floor(inLen / rateScale));
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos = i * rateScale;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const s0 = input[idx] || 0;
    const s1 = input[Math.min(inLen - 1, idx + 1)] || 0;
    out[i] = (s0 + (s1 - s0) * frac) * gainScale;
  }
  return pcmToWavBlobUrl(out, buf.sampleRate);
}

const songWavUrlCache = new Map();
function getSongWavBlobUrl(song) {
  if (!song || typeof Blob === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) return '';
  let url = songWavUrlCache.get(song.id);
  if (url) return url;
  const sr = 24000;
  const stepSec = (song.stepMs || 280) / 1000;
  let totalBeats = 0;
  for (const [, beats] of song.notes) totalBeats += Math.max(1, beats);
  const totalSec = Math.max(6, Math.min(24, totalBeats * stepSec));
  const totalSamples = Math.floor(sr * totalSec);
  const mix = new Float32Array(totalSamples);

  let cursorSec = 0;
  let stepIdx = 0;
  for (const [freq, beats] of song.notes) {
    const durBeats = Math.max(1, beats);
    const startSample = Math.floor(cursorSec * sr);
    const bassFreq = song.bassRoots?.[Math.floor(stepIdx / 4) % song.bassRoots.length] || 130.81;

    if (freq > 0 && startSample < totalSamples) {
      const period = Math.max(8, Math.round(sr / freq));
      const ring = new Float32Array(period);
      let prev = 0;
      for (let i = 0; i < period; i++) {
        const n = Math.random() * 2 - 1;
        prev = prev * 0.35 + n * 0.65;
        ring[i] = (prev * 0.55 + Math.sin((2 * Math.PI * i) / period) * 0.45) * 0.32;
      }
      const pluckLen = Math.min(totalSamples - startSample, Math.floor(sr * 2.0));
      let p = 0;
      let lastV = 0;
      for (let i = 0; i < pluckLen; i++) {
        const cur = ring[p];
        mix[startSample + i] += cur;
        const nextP = (p + 1) % period;
        const avg = 0.52 * cur + 0.48 * ring[nextP];
        ring[p] = (avg * 0.88 + lastV * 0.12) * 0.9955;
        lastV = cur;
        p = nextP;
      }
    }

    if (stepIdx % 2 === 0 && startSample < totalSamples) {
      const padLen = Math.min(totalSamples - startSample, Math.floor(sr * stepSec * 2.2));
      for (let i = 0; i < padLen; i++) {
        const t = i / sr;
        const env = Math.sin((Math.PI * i) / padLen) * 0.085;
        mix[startSample + i] += (Math.sin(2 * Math.PI * bassFreq * t) + 0.5 * Math.sin(2 * Math.PI * bassFreq * 1.5 * t)) * env;
      }
    }

    cursorSec += durBeats * stepSec;
    stepIdx += durBeats;
    if (cursorSec >= totalSec) break;
  }

  url = pcmToWavBlobUrl(mix, sr);
  songWavUrlCache.set(song.id, url);
  return url;
}

export function createRaceAudio({ onSpeak = null } = {}) {
  const isPreviewIframe = (() => {
    try { return new URLSearchParams(location.search).get('preview') === '1'; } catch { return false; }
  })();

  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.connect(ctx.destination);

  // Single-instance cross-tab audio mutex so if multiple tabs of /dua/ or /chua/ are open,
  // only the most recently active tab plays audio (zero cross-tab echo/doubling!).
  const tabId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  let mutedByOtherTab = false;
  let audioMutexChannel = null;
  if (!isPreviewIframe && typeof BroadcastChannel !== 'undefined') {
    try {
      audioMutexChannel = new BroadcastChannel('cungchua_audio_active_tab');
      audioMutexChannel.onmessage = ev => {
        if (ev.data?.type === 'CLAIM_AUDIO' && ev.data.tabId !== tabId) {
          mutedByOtherTab = true;
          master.gain.value = 0;
          if (bgmAudioEl && !bgmAudioEl.paused) bgmAudioEl.pause();
          if (voiceAudioEl && !voiceAudioEl.paused) voiceAudioEl.pause();
        }
      };
      // Claim audio on load if visible
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        audioMutexChannel.postMessage({ type: 'CLAIM_AUDIO', tabId });
      }
      if (typeof window !== 'undefined') {
        const claimSelf = () => {
          if (mutedByOtherTab) {
            mutedByOtherTab = false;
            master.gain.value = 1;
          }
          audioMutexChannel?.postMessage({ type: 'CLAIM_AUDIO', tabId });
        };
        window.addEventListener('focus', claimSelf, { passive: true });
        window.addEventListener('pointerdown', claimSelf, { passive: true });
      }
    } catch {}
  }

  let bgmAudioEl = null;
  let voiceAudioEl = null;
  let activeVoiceBlobUrl = null;

  if (!isPreviewIframe && typeof document !== 'undefined') {
    try {
      bgmAudioEl = document.createElement('audio');
      bgmAudioEl.loop = true;
      bgmAudioEl.playsInline = true;
      bgmAudioEl.volume = 0.34;
      bgmAudioEl.style.display = 'none';
      document.body?.appendChild(bgmAudioEl);

      voiceAudioEl = document.createElement('audio');
      voiceAudioEl.playsInline = true;
      voiceAudioEl.volume = 1.0;
      voiceAudioEl.style.display = 'none';
      document.body?.appendChild(voiceAudioEl);
    } catch {}
  }

  function syncHtmlBgmTrack() {
    if (!bgmAudioEl || isPreviewIframe || bgmMuted || !enabled || mutedByOtherTab) {
      if (bgmAudioEl && !bgmAudioEl.paused) bgmAudioEl.pause();
      return;
    }
    // IMPORTANT: Never play bgmAudioEl and WebAudio ctx BGM at the same time (prevents double-playing/echo)!
    // When WebAudio ctx is running, pause bgmAudioEl completely. Only use bgmAudioEl if ctx is suspended!
    if (ctx.state === 'running') {
      if (!bgmAudioEl.paused) bgmAudioEl.pause();
      return;
    }
    const song = VN_SONGS[currentSongIdx % VN_SONGS.length];
    const wavUrl = getSongWavBlobUrl(song);
    if (wavUrl && bgmAudioEl.dataset.songId !== song.id) {
      bgmAudioEl.dataset.songId = song.id;
      bgmAudioEl.src = wavUrl;
    }
    bgmAudioEl.volume = speaking ? 0.14 : 0.36;
    if (bgmAudioEl.paused) {
      bgmAudioEl.play().catch(() => {});
    }
  }

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
  let lastMockGiftAt = 0;
  let nextFlushTimer = null;
  let watchdog = null;
  let currentVoiceSrc = null;
  let currentItem = null;
  let interactiveGenderToggle = 0;
  const recentJoinUid = new Map();
  const recentCommentKey = new Map();
  const recentGiftKey = new Map();

  // Continuous AI Cultural Storyteller state & Dual-Voice AudioBuffer Cache
  let currentStoryBiomeId = 'vn_hagiang';
  let currentProvinceCode = 0;
  let storyStepIdx = 0;
  let storyCtaIdx = 0;
  let pendingStorySentences = [];
  let pendingProvinceSentences = [];
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

  // Subtle 1.0-second Acoustic Studio Ambience (Crisp, non-echoey!)
  const hallReverb = ctx.createConvolver();
  hallReverb.buffer = (() => {
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * 1.0);
    const ir = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const env = Math.exp(-t * 4.5) * (1 - Math.exp(-t * 35));
        const raw = (Math.random() * 2 - 1) * env;
        lp = lp * 0.72 + raw * 0.28;
        d[i] = lp * 0.28;
      }
    }
    return ir;
  })();

  const reverbWet = ctx.createGain();
  reverbWet.gain.value = 0.10;
  hallReverb.connect(reverbWet);
  reverbWet.connect(bgmWarmFilter);

  const acousticDry = ctx.createGain();
  acousticDry.gain.value = 0.85;
  acousticDry.connect(bgmWarmFilter);
  acousticDry.connect(hallReverb);

  // ==========================================================================
  // SOFT BACKGROUND SUNG LYRIC & FORMANT VOCAL LAYER ("Nhạc Có Lời Nhỏ Nhẹ")
  // Stereo-widened, low-passed at 1600Hz, and reverberated in the concert hall
  // so it blends into the BGM and NEVER conflicts with MC voiceovers or SFX!
  // ==========================================================================
  let bgmVocalEnabled = true;
  let bgmVocalVolume = 0.16; // 16% soft background singing level
  let activeRaceLyricSrc = null;
  let activeRaceLyricGain = null;
  let lastRaceLyricAt = 0;
  let raceLyricCursor = 0;
  let lastRaceSfxAt = 0;
  const raceLyricCache = new Map();

  const bgmVocalBus = ctx.createGain();
  bgmVocalBus.gain.value = bgmVocalVolume;

  const raceVocalLowpass = ctx.createBiquadFilter();
  raceVocalLowpass.type = 'lowpass';
  raceVocalLowpass.frequency.value = 1620;
  raceVocalLowpass.Q.value = 0.65;

  const raceVocalWarmth = ctx.createBiquadFilter();
  raceVocalWarmth.type = 'peaking';
  raceVocalWarmth.frequency.value = 390;
  raceVocalWarmth.gain.value = 2.6;

  const raceVocalPan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  if (raceVocalPan) {
    raceVocalPan.pan.value = -0.38;
    bgmVocalBus.connect(raceVocalWarmth).connect(raceVocalLowpass).connect(raceVocalPan);
    raceVocalPan.connect(bgmWarmFilter);
    raceVocalPan.connect(hallReverb);
  } else {
    bgmVocalBus.connect(raceVocalWarmth).connect(raceVocalLowpass);
    raceVocalLowpass.connect(bgmWarmFilter);
    raceVocalLowpass.connect(hallReverb);
  }

  const BIOME_SUNG_LYRICS = {
    vn_hagiang: [
      'Mây vờn đỉnh núi Hà Giang, cờ đỏ tung bay nơi địa đầu Tổ quốc',
      'Tiếng khèn gọi bạn bên sườn núi đá, hoa tam giác mạch nở hồng sương mai',
    ],
    vn_sapa: [
      'Em đi giữa biển vàng, nghe mênh mang trên đồng lúa hát',
      'Sương giăng mờ đỉnh Fansipan, tiếng sáo Hơ Mông ngân vang núi rừng',
    ],
    vn_halong: [
      'Hạ Long biển biếc mây trời, thuyền ai lướt sóng giữa ngàn đảo xanh',
      'Nắng vàng trải nhẹ mặt vịnh, sóng vỗ rì rào khúc hát quê hương',
    ],
    vn_hanoi: [
      'Hà Nội mùa thu, mặt hồ Gươm xanh thắm bóng tháp Rùa ngàn năm',
      'Nhớ phố cổ rêu phong, chiều thu gió heo may nồng nàn',
    ],
    vn_ninhbinh: [
      'Tràng An non nước hữu tình, thuyền trôi nhẹ giữa mây trời cố đô',
      'Chuông chùa Bái Đính ngân vang, bình yên khắp nẻo đường quê',
    ],
    vn_hue: [
      'Chiều trên dòng sông Hương, tiếng chuông Thiên Mụ ngân vang đôi bờ',
      'Ai về xứ Huế mộng mơ, nghe câu Nam Bình thương nhớ ngàn năm',
    ],
    vn_danang: [
      'Đà Nẵng thành phố bên sông Hàn, cầu Vàng rực sáng giữa ngàn mây trắng',
      'Biển Mỹ Khê sóng vỗ hiền hòa, nhịp sống trẻ trung vươn mình ra biển lớn',
    ],
    vn_hoian: [
      'Đêm Hội An lung linh đèn lồng, dòng sông Hoài chở nặng tình quê',
      'Phố cổ bình yên bên mái ngói rêu phong, thương nhớ hoài phố hội',
    ],
    vn_dalat: [
      'Ai lên xứ hoa đào, dừng chân bên hồ nghe thông reo chiều sương',
      'Đà Lạt mộng mơ trong sương mờ, ngàn hoa khoe sắc dưới nắng vàng',
    ],
    vn_nhatrang: [
      'Nha Trang biển xanh cát trắng, nắng vàng rực rỡ vịnh ngọc hiền hòa',
      'Tháp Bà cổ kính bên bờ biển xanh, gió biển hát khúc ca thanh bình',
    ],
    vn_saigon: [
      'Sài Gòn đẹp lắm Sài Gòn ơi, phố xá rực rỡ ánh đèn đêm',
      'Dòng sông Sài Gòn lấp lánh, nhịp sống nghĩa tình năng động vươn cao',
    ],
    vn_mientay: [
      'Chiếc áo bà ba trên dòng sông nước, câu hò miền Tây ngọt ngào thương nhớ',
      'Chợ nổi Cái Răng nhộn nhịp bình minh, tình người miền Tây chân chất hiền hòa',
    ],
  };

  function stopRaceBackgroundLyric() {
    if (activeRaceLyricGain && ctx.state === 'running') {
      try {
        activeRaceLyricGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.035);
      } catch {}
    }
    if (activeRaceLyricSrc) {
      const s = activeRaceLyricSrc;
      activeRaceLyricSrc = null;
      setTimeout(() => {
        try { s.stop(); } catch {}
      }, 110);
    }
  }

  const RACE_VOWEL_FORMANTS = [
    [710, 1190, 2520], // "Aaa"
    [450, 870, 2410],  // "Ooo"
    [340, 710, 2340],  // "Uuu"
  ];
  function playRaceFormantVocal(freq, start, durSec, vol = 0.042) {
    if (!enabled || bgmMuted || !bgmVocalEnabled || speaking || ctx.state !== 'running' || freq <= 0) return;
    const effVol = vol;
    const vowel = RACE_VOWEL_FORMANTS[Math.floor(tickCount / 4) % RACE_VOWEL_FORMANTS.length];
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
    vibG.gain.setValueAtTime(singFreq * 0.0085, start);
    vib.connect(vibG);
    vibG.connect(srcOsc.frequency);
    vibG.connect(subOsc.frequency);

    const env = ctx.createGain();
    const totalDur = Math.max(0.45, durSec * 1.32);
    env.gain.setValueAtTime(0.0001, start);
    env.gain.linearRampToValueAtTime(effVol, start + 0.09);
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

  async function preloadAndPlayRaceLyric() {
    if (!enabled || bgmMuted || !bgmVocalEnabled || speaking || speechQueue.length > 0) return;
    const now = Date.now();
    if (activeRaceLyricSrc || now - lastRaceLyricAt < 3500 || now - lastRaceSfxAt < 1200) return;
    const lines = BIOME_SUNG_LYRICS[currentStoryBiomeId] || BIOME_SUNG_LYRICS.vn_hagiang;
    if (!lines || !lines.length) return;
    const text = lines[raceLyricCursor++ % lines.length];
    lastRaceLyricAt = now;

    try {
      let buf = raceLyricCache.get(text);
      if (!buf) {
        const res = await fetch(`/tts?q=${encodeURIComponent(text)}`);
        if (!res.ok) return;
        const arr = await res.arrayBuffer();
        if (!arr.byteLength) return;
        buf = await ctx.decodeAudioData(arr.slice(0));
        if (raceLyricCache.size > 28) {
          const oldest = raceLyricCache.keys().next().value;
          raceLyricCache.delete(oldest);
        }
        raceLyricCache.set(text, buf);
      }
      // Ensure MC did not start speaking while fetching
      if (!enabled || bgmMuted || !bgmVocalEnabled || speaking || speechQueue.length > 0) return;

      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = 0.88;
      const t0 = ctx.currentTime;
      const dur = buf.duration / 0.88;
      src.detune.setValueAtTime(0, t0);
      src.detune.linearRampToValueAtTime(150, t0 + dur * 0.35);
      src.detune.linearRampToValueAtTime(-90, t0 + dur * 0.7);
      src.detune.linearRampToValueAtTime(0, t0 + dur);

      const vib = ctx.createOscillator();
      const vibG = ctx.createGain();
      vib.frequency.value = 5.2;
      vibG.gain.value = 16;
      vib.connect(vibG).connect(src.detune);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.85, t0 + 0.28);
      g.gain.setValueAtTime(0.85, Math.max(t0 + 0.32, t0 + dur - 0.38));
      g.gain.linearRampToValueAtTime(0.0001, t0 + dur);

      if (raceVocalPan) {
        raceVocalPan.pan.setTargetAtTime(raceLyricCursor % 2 === 0 ? -0.38 : 0.38, t0, 0.2);
      }

      src.connect(g).connect(bgmVocalBus);
      activeRaceLyricSrc = src;
      activeRaceLyricGain = g;
      src.onended = () => {
        if (activeRaceLyricSrc === src) {
          activeRaceLyricSrc = null;
          activeRaceLyricGain = null;
        }
        try { vib.stop(); } catch {}
      };
      vib.start(t0);
      src.start(t0);
    } catch {}
  }

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
    if (duck) {
      stopRaceBackgroundLyric();
    }
    const isStory = currentItem?.kind === 'story';
    if (bgmAudioEl && !isPreviewIframe && ctx.state !== 'running') {
      bgmAudioEl.volume = bgmMuted || mutedByOtherTab ? 0 : duck ? (isStory ? 0.16 : 0.10) : 0.36;
    }
    if (ctx.state === 'running') {
      const target = bgmMuted ? 0 : duck ? (isStory ? 0.22 : 0.14) : 0.34;
      bgmGain.gain.setTargetAtTime(target, ctx.currentTime, 0.16);
      bgmVocalBus.gain.setTargetAtTime(
        bgmMuted || !bgmVocalEnabled || duck ? 0.0001 : bgmVocalVolume,
        ctx.currentTime,
        duck ? 0.04 : 0.22
      );
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
        // 4. Soft Background Vocal Choir & Regional Sung Lyric Phrase ("Nhạc Có Lời Nhỏ Nhẹ")
        if (bgmVocalEnabled && (stepInBar === 0 || stepInBar === 4 || inst === 'both')) {
          playRaceFormantVocal(freq, t, durSec, 0.048);
        }
        if (bgmVocalEnabled && !speaking && speechQueue.length === 0 && stepInBar === 0) {
          preloadAndPlayRaceLyric();
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
    if (!enabled) return;
    syncHtmlBgmTrack();
    if (bgRunning) return;
    bgRunning = true;
    tickBg();
  }

  function joinChime() {
    if (!enabled) return;
    lastRaceSfxAt = Date.now();
    stopRaceBackgroundLyric();
    const t = ctx.currentTime;
    playAcousticPluck(N.C5, t, 0.18, 'zither');
    playAcousticPluck(N.E5, t + 0.07, 0.16, 'zither');
  }

  function boostSfx(tier = 1) {
    if (!enabled) return;
    lastRaceSfxAt = Date.now();
    stopRaceBackgroundLyric();
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
        const maleBuf = createMaleStretchedBuffer(ctx, femaleBuf, 0.97);
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

  function peekNextStorySentenceObj() {
    if (pendingProvinceSentences.length > 0 && storyStepIdx > 0) {
      return pendingProvinceSentences[0];
    }
    if (pendingStorySentences.length > 0) {
      return pendingStorySentences[0];
    }
    const chapters = LANDMARK_STORIES[currentStoryBiomeId] || LANDMARK_STORIES.vietnam;
    if (!chapters || !chapters.length) return null;
    const chapterText = chapters[storyStepIdx % chapters.length];
    const gender = storyStepIdx % 2 === 0 ? 'male' : 'female';
    const sents = splitIntoAtomicSentences(chapterText);
    if (!sents.length) return null;
    return { text: sents[0], gender };
  }

  function preloadNextStoryBuffer() {
    const nextObj = peekNextStorySentenceObj();
    if (nextObj?.text) {
      fetchAndDecodeDualVoiceTts(nextObj.text).catch(() => {});
    }
  }

  function stopCurrentSpeechImmediately(rewindStory = false) {
    activeSpeechSeq++;
    clearTimeout(watchdog);
    watchdog = null;
    clearTimeout(nextFlushTimer);
    nextFlushTimer = null;
    if (!speaking && !currentItem) return;
    if (rewindStory && currentItem?.kind === 'story' && currentItem.text) {
      pendingStorySentences.unshift({
        text: currentItem.text,
        gender: currentItem.gender || 'male',
      });
    }
    if (currentVoiceSrc) {
      try {
        currentVoiceSrc.onended = null;
        currentVoiceSrc.stop();
        currentVoiceSrc.disconnect();
      } catch {}
      currentVoiceSrc = null;
    }
    if (voiceAudioEl) {
      try {
        voiceAudioEl.onended = null;
        voiceAudioEl.onerror = null;
        voiceAudioEl.pause();
      } catch {}
    }
    if (activeVoiceBlobUrl) {
      try { URL.revokeObjectURL(activeVoiceBlobUrl); } catch {}
      activeVoiceBlobUrl = null;
    }
    if (usingBrowserSpeech && typeof speechSynthesis !== 'undefined') {
      try { speechSynthesis.cancel(); } catch {}
      usingBrowserSpeech = false;
    }
    currentItem = null;
    speaking = false;
  }

  // Strict Priority Hierarchy (NO Mid-Sentence Cutoff!):
  // 1. Gift / Donate (`kind: 'gift'`, priority 13..16 real / 9..12 demo)
  // 2. Participant Join (`kind: 'join'`, priority 10 real / 7 demo)
  // 3. Participant Comment (`kind: 'comment'`, priority 9 real / 6 demo)
  // 4. Landmark & Cultural Story (`kind: 'story'`, priority 0 - ALWAYS lowest)
  //
  // IMPORTANT SYNCHRONIZATION RULE:
  // Never cut off a currently speaking sentence mid-way! Let the active sentence finish
  // naturally (`src.onended = done`), while purging any *unspoken* story sentences from
  // `speechQueue` and queueing the participant event at the front of `speechQueue` so it
  // speaks immediately after the current sentence finishes.
  function purgeUnspokenLowerPriorityFromQueue(isReal = false) {
    for (let i = speechQueue.length - 1; i >= 0; i--) {
      if (speechQueue[i].kind === 'story') {
        // Put unspoken story sentence back to the front of `pendingStorySentences` so it is never lost
        pendingStorySentences.unshift({
          text: speechQueue[i].text,
          gender: speechQueue[i].gender || 'male',
        });
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

    // Pre-fetch Dual-Voice TTS audio immediately in the background while the current sentence finishes!
    fetchAndDecodeDualVoiceTts(item.text).catch(() => {});

    // Remove any unspoken story sentences (or mock items if real user) waiting in speechQueue,
    // WITHOUT cutting off the sentence that is currently playing on the speaker!
    purgeUnspokenLowerPriorityFromQueue(Boolean(item.isReal));

    // If the same user already has a lower-priority 'join' waiting in queue and now comments/gifts, upgrade it
    if (prio >= 11 && item.uid) {
      for (let i = speechQueue.length - 1; i >= 0; i--) {
        if (speechQueue[i].uid === item.uid && (speechQueue[i].priority ?? 0) < prio && speechQueue[i].kind === 'join') {
          speechQueue.splice(i, 1);
        }
      }
    }

    // Insert in strict descending priority order; items of the same priority stay in FIFO arrival order
    const insertIdx = speechQueue.findIndex(x => (x.priority ?? 0) < prio);
    if (insertIdx === -1) speechQueue.push(item);
    else speechQueue.splice(insertIdx, 0, item);
    if (speechQueue.length > 14) speechQueue.pop();

    if (!speaking) {
      flushSpeech();
    }
  }

  function queueNextStoryNow() {
    if (!enabled || isPreviewIframe) return;
    if (speaking || speechQueue.length > 0 || nextFlushTimer) return;
    // Brief breath window after interactive speech finishes before resuming story
    if (Date.now() - lastInteractiveDoneAt < 180) {
      nextFlushTimer = setTimeout(queueNextStoryNow, 190);
      return;
    }

    // 1. If a province milestone story is pending, speak it sentence by sentence
    if (pendingProvinceSentences.length > 0 && storyStepIdx > 0) {
      const nextProv = pendingProvinceSentences.shift();
      enqueueSpeech({
        uid: '__ai_story_province__',
        text: nextProv.text,
        kind: 'story',
        gender: nextProv.gender,
        priority: 0,
        isReal: false,
      });
      return;
    }

    // 2. If there are remaining sentences from the current story chapter (or rewound sentence), speak next sentence
    if (pendingStorySentences.length === 0) {
      const chapters = LANDMARK_STORIES[currentStoryBiomeId] || LANDMARK_STORIES.vietnam;
      if (!chapters || !chapters.length) return;
      const gender = storyStepIdx % 2 === 0 ? 'male' : 'female';
      const chapterText = chapters[storyStepIdx % chapters.length];
      storyStepIdx++;

      for (const s of splitIntoAtomicSentences(chapterText)) {
        pendingStorySentences.push({ text: s, gender });
      }
    }

    const nextSent = pendingStorySentences.shift();
    if (!nextSent) return;

    enqueueSpeech({
      uid: '__ai_story__',
      text: nextSent.text,
      kind: 'story',
      gender: nextSent.gender,
      priority: 0,
      isReal: false,
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

    // Pre-fetch next queued participant item (or next story sentence if queue is empty)
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
      if (voiceAudioEl) {
        voiceAudioEl.onended = null;
        voiceAudioEl.onerror = null;
      }
      if (activeVoiceBlobUrl) {
        try { URL.revokeObjectURL(activeVoiceBlobUrl); } catch {}
        activeVoiceBlobUrl = null;
      }
      currentItem = null;
      usingBrowserSpeech = false;
      speaking = false;
      if (item.kind !== 'story') {
        lastInteractiveDoneAt = Date.now();
      }
      if (speechQueue.length === 0) {
        duckBgm(false);
      }
      onSpeak?.('', false, '', gender);

      // Immediately read waiting participant events if any; otherwise resume story briskly
      if (speechQueue.length > 0) {
        nextFlushTimer = setTimeout(flushSpeech, 70);
      } else {
        nextFlushTimer = setTimeout(queueNextStoryNow, 220);
      }
    };

    watchdog = setTimeout(done, 14_000);

    try {
      if (mutedByOtherTab) {
        done();
        return;
      }
      if (ctx.state !== 'running') await ctx.resume().catch(() => {});
      const { femaleBuf, maleBuf } = await fetchAndDecodeDualVoiceTts(item.text);
      if (!enabled || mutedByOtherTab || mySeq !== activeSpeechSeq || currentItem !== item) {
        return;
      }
      const isMale = gender === 'male';
      const targetBuf = isMale ? maleBuf : femaleBuf;
      const rateScale = isMale ? 0.95 : 1.22;
      const gainScale = isMale ? 1.22 : 1.08;

      // If WebAudio ctx is running, play ONLY on WebAudio EQ chain (crisp, zero echo/doubling)
      if (ctx.state === 'running') {
        if (voiceAudioEl && !voiceAudioEl.paused) voiceAudioEl.pause();
        const src = ctx.createBufferSource();
        src.buffer = targetBuf;
        src.playbackRate.value = rateScale;
        const g = ctx.createGain();
        g.gain.value = gainScale;
        src.connect(g).connect(isMale ? maleVoiceChain : femaleVoiceChain);
        currentVoiceSrc = src;
        src.onended = done;

        duckBgm(true);
        if (item.kind === 'gift') boostSfx(item.tier || 1);
        else if (item.kind === 'join' || item.kind === 'comment') joinChime();
        onSpeak?.(item.text, true, item.kind || 'interactive', gender);

        src.start();
        return;
      }

      // Fallback ONLY when WebAudio ctx is suspended (e.g., inside CEF Link before click):
      // play via DOM <audio> element (`voiceAudioEl`) using in-memory WAV Blob URL
      if (voiceAudioEl && typeof URL !== 'undefined' && URL.createObjectURL) {
        if (activeVoiceBlobUrl) {
          try { URL.revokeObjectURL(activeVoiceBlobUrl); } catch {}
        }
        activeVoiceBlobUrl = audioBufferToWavBlobUrl(targetBuf, rateScale, gainScale);
        voiceAudioEl.src = activeVoiceBlobUrl;
        voiceAudioEl.volume = 1.0;
        voiceAudioEl.muted = false;
        voiceAudioEl.onended = done;
        voiceAudioEl.onerror = done;

        duckBgm(true);
        onSpeak?.(item.text, true, item.kind || 'interactive', gender);

        await voiceAudioEl.play();
        return;
      }

      throw new Error('AudioContext suspended');
    } catch {
      if (mySeq !== activeSpeechSeq || currentItem !== item) return;
      if (typeof speechSynthesis !== 'undefined') {
        usingBrowserSpeech = true;
        const u = new SpeechSynthesisUtterance(item.text);
        u.lang = 'vi-VN';
        u.rate = 1.18;
        u.pitch = gender === 'male' ? 0.82 : 1.12;
        u.onend = done;
        u.onerror = done;
        try {
          duckBgm(true);
          if (item.kind === 'gift') boostSfx(item.tier || 1);
          else if (item.kind === 'join' || item.kind === 'comment') joinChime();
          onSpeak?.(item.text, true, item.kind || 'interactive', gender);
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
    if (!isPreviewIframe && !mutedByOtherTab) {
      enabled = true;
      bgmMuted = false;
      master.gain.value = 1;
      if (ctx.state !== 'running') ctx.resume().catch(() => {});
      syncHtmlBgmTrack();
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
    get needsInteraction() {
      return ctx.state !== 'running' && (!bgmAudioEl || bgmAudioEl.paused || bgmAudioEl.muted);
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
      syncHtmlBgmTrack();
      duckBgm(speaking);
      return this.getBgmLabel();
    },
    setBiomeMusic(biomeId, biomeObj = null) {
      bgmMuted = false;
      if (biomeId && biomeId !== currentStoryBiomeId) {
        currentStoryBiomeId = biomeId;
        storyStepIdx = 0;
        playlistCursor = 0;
        pendingStorySentences = [];
        // Remove unspoken story sentences from queue, but let any currently speaking sentence finish naturally!
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
          const gender = storyStepIdx % 2 === 0 ? 'male' : 'female';
          pendingProvinceSentences = splitIntoAtomicSentences(PROVINCE_STORIES[currentProvinceCode]).map(text => ({
            text,
            gender,
          }));
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
        syncHtmlBgmTrack();
      }
      return this.getBgmLabel();
    },
    syncProvinceMilestone(biomeObj) {
      if (biomeObj?.province?.code && biomeObj.province.code !== currentProvinceCode) {
        currentProvinceCode = biomeObj.province.code;
        if (PROVINCE_STORIES[currentProvinceCode]) {
          const gender = storyStepIdx % 2 === 0 ? 'male' : 'female';
          pendingProvinceSentences = splitIntoAtomicSentences(PROVINCE_STORIES[currentProvinceCode]).map(text => ({
            text,
            gender,
          }));
          preloadNextStoryBuffer();
        }
      }
    },
    unlock() {
      if (isPreviewIframe) return;
      mutedByOtherTab = false;
      audioMutexChannel?.postMessage({ type: 'CLAIM_AUDIO', tabId });
      enabled = true;
      bgmMuted = false;
      master.gain.value = 1;
      ctx.resume().catch(() => {});
      if (bgmAudioEl) {
        bgmAudioEl.muted = false;
        syncHtmlBgmTrack();
      }
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
      }
    },
    setBgmVocal(on, vol) {
      if (on !== undefined) bgmVocalEnabled = Boolean(on);
      if (Number.isFinite(Number(vol))) {
        bgmVocalVolume = Math.max(0, Math.min(0.45, Number(vol)));
      }
      if (!bgmVocalEnabled) stopRaceBackgroundLyric();
      duckBgm(speaking);
    },
    getBgmVocalConfig() {
      return { enabled: bgmVocalEnabled, volume: bgmVocalVolume };
    },
    purgeMockSpeech() {
      for (let i = speechQueue.length - 1; i >= 0; i--) {
        if (!speechQueue[i].isReal && speechQueue[i].kind !== 'story') {
          speechQueue.splice(i, 1);
        }
      }
      if (currentItem && !currentItem.isReal && currentItem.kind !== 'story') {
        stopCurrentSpeechImmediately(false);
        setTimeout(queueNextStoryNow, 150);
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
        if (queuedInteractive >= 3 || now - lastMockJoinAt < 2800) return;
        lastMockJoinAt = now;
      }

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
        if (queuedInteractive >= 3 || now - lastMockCommentAt < 3200) return;
        lastMockCommentAt = now;
      }

      const gender = interactiveGenderToggle++ % 2 === 0 ? 'male' : 'female';
      const text = `${who} bình luận: ${cleanText}`;
      // Comment priority (9 real / 6 demo) is right after Join (10 / 7) and ALWAYS ahead of Story (0)
      enqueueSpeech({ uid, text, kind: 'comment', gender, priority: isReal ? 9 : 6, isReal });
    },
    announceGift(d) {
      if (!enabled || !d) return;
      const isReal = Boolean(d.src && d.src !== 'mock');
      const now = Date.now();
      const uid = d.uid || d.name || '';
      const giftSig = `${uid}:${d.giftName || d.giftVi || 'gift'}:${d.repeat || 1}:${d.diamonds || 1}`;

      // Deduplicate identical gift announcements within 10s so cloud polling or combo packets never repeat
      const lastExact = recentGiftKey.get(giftSig) || 0;
      if (now - lastExact < 10_000) return;
      recentGiftKey.set(giftSig, now);
      if (recentGiftKey.size > 200) {
        recentGiftKey.delete(recentGiftKey.keys().next().value);
      }

      if (!isReal) {
        const queuedInteractive = speechQueue.filter(x => x.kind !== 'story').length;
        if (queuedInteractive >= 2 || now - lastMockGiftAt < 4500) return;
        lastMockGiftAt = now;
      }

      const text = formatGiftBoostSpeech(d);
      const priority = (isReal ? 12 : 8) + (d.tier || 1);

      // If this user already has an unspoken gift announcement waiting in speechQueue, coalesce it in-place
      // so rapid gift taps read only the latest combined reward once instead of repeating!
      const existingGift = uid ? speechQueue.find(x => x.uid === uid && x.kind === 'gift') : null;
      if (existingGift) {
        existingGift.text = text;
        existingGift.tier = Math.max(existingGift.tier || 1, d.tier || 1);
        existingGift.priority = Math.max(existingGift.priority || 1, priority);
        existingGift.isReal = existingGift.isReal || isReal;
        fetchAndDecodeDualVoiceTts(text).catch(() => {});
        return;
      }

      const gender = interactiveGenderToggle++ % 2 === 0 ? 'female' : 'male';
      // Gift priority (13..16 real / 9..12 demo) is the highest priority
      enqueueSpeech({
        uid,
        text,
        kind: 'gift',
        tier: d.tier || 1,
        gender,
        priority,
        isReal,
      });
    },
  };
}
