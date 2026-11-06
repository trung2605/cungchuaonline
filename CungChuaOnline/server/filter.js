const INVISIBLE = /[​-‍﻿\p{Cc}]/gu;
const URL_RE = /https?:\/\/|www\.|[\p{L}\p{N}-]+\.(?:com|vn|net|org|me|io|xyz|club|vip|bet|win|top|icu|fun|live|app|cc|tk)\b/iu;
const PHONE_RE = /(?:\d[\s.\-_*]?){8,}/;
const MENTION_RE = /(^|\s)@[\p{L}\p{N}_]/u;
// Built-in sensitive pattern (Gambling, Scams, Blasphemy, Extremism, Hard Profanity & Leetspeak)
const SENSITIVE_BUILTIN_RE = new RegExp(
  [
    // Gambling & Betting apps/sites
    '\\b(tai\\s*xiu|tài\\s*xỉu|ca\\s*do|cá\\s*độ|ca\\s*cuoc|cá\\s*cược|nha\\s*cai|nhà\\s*cái|no\\s*hu|nổ\\s*hũ|xoc\\s*dia|xóc\\s*đĩa|lo\\s*de|lô\\s*đề|co\\s*bac|cờ\\s*bạc|danh\\s*bac|đánh\\s*bạc|kubet|f8bet|shbet|hi88|jun88|789bet|new88|mb66|go88|sunwin|rikvip|hitclub|b52\\s*club|baccarat|boc\\s*bat\\s*ho|bốc\\s*bát\\s*họ|vay\\s*nong|vay\\s*nóng|lua\\s*dao|lừa\\s*đảo)\\b',
    // Blasphemy / Insulting temple & religion
    '\\b(chua\\s*lua\\s*dao|chùa\\s*lừa\\s*đảo|chua\\s*bip|chùa\\s*bịp|su\\s*gia|sư\\s*giả|su\\s*ho\\s*mang|sư\\s*hổ\\s*mang|phat\\s*gia|phật\\s*giả|buon\\s*than\\s*ban\\s*thanh|buôn\\s*thần\\s*bán\\s*thánh|cung\\s*tien\\s*cho\\s*ma|an\\s*chan\\s*cong\\s*duc)\\b',
    // Sexual / Adult / Violence / Drugs / Political extremism
    '\\b(hiep\\s*dam|hiếp\\s*dâm|au\\s*dam|ấu\\s*dâm|loan\\s*luan|loạn\\s*luân|thu\\s*dam|thủ\\s*dâm|suc\\s*cac|sục\\s*cặc|bu\\s*cu|bú\\s*cu|bu\\s*lon|bú\\s*lồn|liem\\s*lon|liếm\\s*lồn|ban\\s*dam|bán\\s*dâm|mua\\s*dam|mua\\s*dâm|khoe\\s*hang|lộ\\s*hàng|clip\\s*nong|clip\\s*sex|phim\\s*sex|xnxx|xvideos|vlxx|javhd|hentai|onlyfans|pornhub|phan\\s*dong|phản\\s*động|ba\\s*que|3\\s*que|khung\\s*bo|khủng\\s*bố|tu\\s*tu|tự\\s*tử|tu\\s*sat|tự\\s*sát|giet\\s*nguoi|giết\\s*người|ma\\s*tuy|ma\\s*túy|dap\\s*da|đập\\s*đá|thuoc\\s*lac|thuốc\\s*lắc|keo\\s*ke|kẹo\\s*ke)\\b',
    // Leetspeak profanity bypasses
    '\\b(d1t|đ1t|l0n|c4c|d\\.m|đ\\.m|v\\.c\\.l|v\\*l|đ\\*t|c\\*c|l\\*n|d\\*m)\\b',
  ].join('|'),
  'iu'
);

const DEFAULT_NAME = 'Phật tử';

const cut = (s, n) => Array.from(s).slice(0, n).join('');

// Normalize for matching only, never for display. keepMarks keeps Vietnamese
// diacritics so badwords like "cặc" don't collide with "các" (see FR-03 BR-03.3).
export function fold(s, { keepMarks = false } = {}) {
  s = String(s || '').normalize('NFC').toLowerCase();
  if (!keepMarks) s = s.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd');
  return s
    .replace(INVISIBLE, '')
    .replace(/(\p{L})\1+/gu, '$1')
    // Join split single letters: punctuation first so "n.a.m m.o" -> "nam mo", then spaces ("n a m mo").
    .replace(/(?<!\p{L})\p{L}(?:[._\-*]\p{L}(?!\p{L}))+/gu, m => m.replace(/[._\-*]/g, ''))
    .replace(/(?<!\p{L})\p{L}(?: \p{L}(?!\p{L}))+/gu, m => m.replace(/ /g, ''))
    // Join intra-word obfuscation dots/asterisks (e.g. "đị.t" -> "địt", "c*ặc" -> "cặc")
    .replace(/(?<=\p{L})[.*_]+(?=\p{L})/gu, '')
    // Strip sentence punctuation into spaces while preserving slang tone symbols (` ' ~)
    .replace(/[.,!?;:"()[\]{}/\\|*+=<>@#$%^&—–-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fast O(W) compiled token & phrase index cached per phrases array
const indexCache = [new WeakMap(), new WeakMap()];

function getCompiledIndex(phrases, keepMarks) {
  const wm = indexCache[+keepMarks];
  const len = phrases.length;
  const last = len > 0 ? phrases[len - 1] : '';
  let entry = wm.get(phrases);
  if (entry && entry.len === len && entry.last === last) return entry;

  const singleWords = new Set();
  const multiByFirst = new Map();
  for (let i = 0; i < len; i++) {
    const f = fold(phrases[i], { keepMarks });
    if (!f) continue;
    const sp = f.indexOf(' ');
    if (sp === -1) {
      singleWords.add(f);
    } else {
      const first = f.slice(0, sp);
      let arr = multiByFirst.get(first);
      if (!arr) {
        arr = [];
        multiByFirst.set(first, arr);
      }
      arr.push(` ${f} `);
    }
  }
  entry = { len, last, singleWords, multiByFirst };
  wm.set(phrases, entry);
  return entry;
}

const memo = [new Map(), new Map()];
const foldCached = (p, keepMarks) => {
  const m = memo[+keepMarks];
  let v = m.get(p);
  if (v === undefined) m.set(p, (v = ` ${fold(p, { keepMarks })} `));
  return v;
};

export function matchesAny(text, phrases, { keepMarks = false } = {}) {
  if (!phrases || !phrases.length) return false;
  const folded = fold(text, { keepMarks });
  if (!folded) return false;
  const { singleWords, multiByFirst } = getCompiledIndex(phrases, keepMarks);
  const tokens = folded.split(' ');
  const padded = multiByFirst.size > 0 ? ` ${folded} ` : '';
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (singleWords.has(tok)) return true;
    const candidates = multiByFirst.get(tok);
    if (candidates) {
      for (let j = 0; j < candidates.length; j++) {
        if (padded.includes(candidates[j])) return true;
      }
    }
  }
  return false;
}

export const hasBadword = (text, lists) =>
  SENSITIVE_BUILTIN_RE.test(text) || matchesAny(text, lists?.badwords ?? [], { keepMarks: true });

// Label of the intent that appears first in the comment, or null.
export function detectIntent(text, lists) {
  const t = ` ${fold(text)} `;
  let best = null;
  let at = Infinity;
  for (const [key, label] of Object.entries(lists.intents ?? {})) {
    const i = t.indexOf(foldCached(key, false));
    if (i !== -1 && i < at) [best, at] = [label, i];
  }
  return best;
}

export const isTrigger = (text, lists) => matchesAny(text, lists.triggers) || detectIntent(text, lists) !== null;

export function cleanBubble(text, lists, max = 40) {
  if (typeof text !== 'string') return null;
  const s = text.normalize('NFC').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim();
  if (!s || URL_RE.test(s) || PHONE_RE.test(s) || MENTION_RE.test(s) || hasBadword(s, lists)) return null;
  return cut(s, max);
}

export function cleanName(name, lists) {
  const s = cut(
    String(name || '').normalize('NFC').replace(/[\p{Extended_Pictographic}️⃣]/gu, '').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim(),
    16,
  ).trim();
  return !s || hasBadword(s, lists) ? DEFAULT_NAME : s;
}

// ============================================================================
// VIETNAMESE COMMENT NORMALIZER FOR ACCURATE TTS READING
// ============================================================================
const VN_VOWEL_RE = /[aăâeêioôơuưyáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

const VN_PHRASE_REPLACEMENTS = [
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

export function normalizeVietnameseCommentForTts(raw = '', lists = null) {
  if (typeof raw !== 'string') return '';
  let s = raw.normalize('NFC').replace(INVISIBLE, '').trim();
  if (!s) return '';

  // Reject immediately if it contains sensitive content, URLs, phones, or @mentions
  if (URL_RE.test(s) || PHONE_RE.test(s) || MENTION_RE.test(s) || hasBadword(s, lists)) {
    return '';
  }

  // Strip emojis, kaomoji, and decorative symbols
  s = s
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]+/gu, ' ')
    .replace(/[^\p{L}\p{N}\s,.!?'"-]/gu, ' ')
    // Collapse stretched letters (e.g. "Phậttttt" -> "Phật", "bình annnn" -> "bình an")
    .replace(/(\p{L})\1{2,}/gu, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  if (!s || s.length < 2 || !VN_VOWEL_RE.test(s)) return '';

  // Reject pure laugh/filler strings like "hahaha", "kakaka", "hihi"
  if (/^(?:ha|hi|he|ho|ka|ki|hu|hư|ờ|ừ|a|ơ|ư)+$/iu.test(s.replace(/\s+/g, ''))) {
    return '';
  }

  // Expand common unaccented Vietnamese prayers & TikTok chat abbreviations for natural TTS pronunciation
  for (const [re, rep] of VN_PHRASE_REPLACEMENTS) {
    s = s.replace(re, rep);
  }

  // Final check after expansion
  if (hasBadword(s, lists)) return '';

  return cut(s.replace(/\s+/g, ' ').trim(), 65);
}
