const INVISIBLE = /[​-‍﻿\p{Cc}]/gu;
const URL_RE = /https?:\/\/|[\p{L}\p{N}-]+\.(?:com|vn|net|org|me|io|xyz)\b/iu;
const PHONE_RE = /(?:\d[\s.\-]?){8,}/;
const MENTION_RE = /(^|\s)@[\p{L}\p{N}_]/u;
const DEFAULT_NAME = 'Phật tử';

const cut = (s, n) => Array.from(s).slice(0, n).join('');

// Normalize for matching only, never for display. keepMarks keeps Vietnamese
// diacritics so badwords like "cặc" don't collide with "các" (see FR-03 BR-03.3).
export function fold(s, { keepMarks = false } = {}) {
  s = s.normalize('NFC').toLowerCase();
  if (!keepMarks) s = s.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd');
  return s
    .replace(INVISIBLE, '')
    .replace(/(\p{L})\1+/gu, '$1')
    // Join split single letters: punctuation first so "n.a.m m.o" -> "nam mo", then spaces ("n a m mo").
    .replace(/(?<!\p{L})\p{L}(?:[._\-]\p{L}(?!\p{L}))+/gu, m => m.replace(/[._\-]/g, ''))
    .replace(/(?<!\p{L})\p{L}(?: \p{L}(?!\p{L}))+/gu, m => m.replace(/ /g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

// Phrases are re-folded on every edit-free call; memo keeps that O(1) per phrase.
const memo = [new Map(), new Map()];
const foldCached = (p, keepMarks) => {
  const m = memo[+keepMarks];
  let v = m.get(p);
  if (v === undefined) m.set(p, (v = ` ${fold(p, { keepMarks })} `));
  return v;
};

export function matchesAny(text, phrases, { keepMarks = false } = {}) {
  const t = ` ${fold(text, { keepMarks })} `;
  return phrases.some(p => t.includes(foldCached(p, keepMarks)));
}

const hasBadword = (text, lists) => matchesAny(text, lists.badwords, { keepMarks: true });

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
  const s = text.normalize('NFC').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim();
  if (!s || URL_RE.test(s) || PHONE_RE.test(s) || MENTION_RE.test(s) || hasBadword(s, lists)) return null;
  return cut(s, max);
}

export function cleanName(name, lists) {
  const s = cut(
    name.normalize('NFC').replace(/[\p{Extended_Pictographic}️⃣]/gu, '').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim(),
    16,
  ).trim();
  return !s || hasBadword(s, lists) ? DEFAULT_NAME : s;
}
