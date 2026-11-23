/**
 * Shared Smart Search Engine for ALL Himalaya ERP Panels
 * (Plant Head, Production, Dispatch, Sales/SuperSales, Store, Finance, Super Admin)
 *
 * Handles:
 * - Multi-word, order-independent matching ("frp 600" matches "HIMALAYA FRP DMHC 600X600 B125")
 * - Dimension normalization ("600 x 600", "600 * 600", "600×600" <-> "600x600")
 * - Hyphen/space/punctuation agnostic ("frp mhc 10x10" <-> "FRPMHCELD 10X10", "20 25mm" <-> "BTCB 20-25MM")
 * - Unit & domain aliases ("dhmc" <-> "dmhc", "grating" <-> "fratings", "gully" <-> "wgc", "5 ton" <-> "5t")
 * - Leading/trailing whitespace trimming
 * - 1-character typo tolerance for words >= 4 chars ("himalya" -> "HIMALAYA")
 * - Relevance scoring so exact / prefix / boundary matches always rank first
 */

export interface ParsedSmartQuery {
  raw: string;
  normalized: string;
  compact: string;
  tokens: string[];
  tokenGroups: string[][];
}

const DOMAIN_ALIAS_GROUPS: string[][] = [
  ['dhmc', 'dmhc'],
  ['grating', 'gratings', 'frating', 'fratings'],
  ['gully', 'wgc', 'grating'],
  ['mhc', 'manhole'],
  ['coverblock', 'btcb', 'dtcb'],
  ['chamber', 'mhc', 'dmhc'],
  ['b125', '12.5t', '12.5ton'],
  ['c250', '25t', '25ton'],
  ['d400', '40t', '40ton'],
  ['e600', '60t', '60ton'],
  ['f900', '90t', '90ton'],
  ['grey', 'gray'],
];

const ALIAS_LOOKUP = new Map<string, string[]>();
for (const group of DOMAIN_ALIAS_GROUPS) {
  for (const term of group) {
    const existing = ALIAS_LOOKUP.get(term) || [];
    for (const candidate of group) {
      if (!existing.includes(candidate)) existing.push(candidate);
    }
    ALIAS_LOOKUP.set(term, existing);
  }
}

export function compactAlnum(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function normalizeSearchQuery(rawQuery: unknown): string {
  let s = String(rawQuery ?? '')
    .trim()
    .toLowerCase()
    .replace(/[×*]/g, 'x')
    .replace(/\s+/g, ' ');

  if (!s) return '';

  // Collapse spaced dimensions: "600 x 600" -> "600x600"
  s = s.replace(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/gi, '$1x$2');

  // Collapse spaced ranges: "20 - 25 mm" or "20 25mm" -> "20-25mm"
  s = s.replace(/(\d+)\s*-\s*(\d+)\s*(mm|cm|in|inch)\b/gi, '$1-$2$3');
  s = s.replace(/(\d+)\s+(?=\d+(?:mm|cm)\b)/gi, '$1-');

  // Collapse number + unit spacing: "50 mm" -> "50mm", "5 ton" / "5 t" -> "5t"
  s = s.replace(/(\d+(?:\.\d+)?)\s*(?:tons?|mt|t)\b/gi, '$1t');
  s = s.replace(/(\d+(?:\.\d+)?)\s*(mm|cm|kg|ltr|pcs)\b/gi, '$1$2');

  // Common two-word phrase normalization
  s = s.replace(/\bcover\s+blocks?\b/gi, 'coverblock');
  s = s.replace(/\bmanhole\s+covers?\b/gi, 'mhc');
  s = s.replace(/\bchamber\s+covers?\b/gi, 'mhc');

  return s.replace(/\s+/g, ' ').trim();
}

export function expandTokenVariants(token: string): string[] {
  const clean = token.trim().toLowerCase();
  if (!clean) return [];

  const variants = new Set<string>([clean]);
  const compact = compactAlnum(clean);
  if (compact && compact !== clean) {
    variants.add(compact);
  }

  const directAliases = ALIAS_LOOKUP.get(clean) || ALIAS_LOOKUP.get(compact);
  if (directAliases) {
    for (const a of directAliases) variants.add(a);
  }

  const tonMatch = clean.match(/^(\d+(?:\.\d+)?)t$/);
  if (tonMatch) {
    const num = tonMatch[1];
    variants.add(`${num}t`);
    variants.add(`${num}ton`);
    variants.add(`${num} ton`);
    variants.add(`${num} t`);
  }

  if (clean.includes('-')) {
    variants.add(clean.replace(/-/g, ''));
    variants.add(clean.replace(/-/g, ' '));
  }

  const dimMatch = clean.match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/);
  if (dimMatch) {
    variants.add(`${dimMatch[1]}x${dimMatch[2]}`);
    variants.add(`${dimMatch[1]} x ${dimMatch[2]}`);
  }

  if (clean.length >= 4 && /^[a-z]+$/.test(clean)) {
    if (clean.endsWith('s')) {
      variants.add(clean.slice(0, -1));
    } else {
      variants.add(`${clean}s`);
    }
  }

  return Array.from(variants).filter(Boolean);
}

// Lightweight single-entry cache to avoid re-parsing the same query string across thousands of rows
let lastCachedRaw = '';
let lastCachedParsed: ParsedSmartQuery | null = null;

export function parseSmartQuery(rawQuery: unknown): ParsedSmartQuery {
  const raw = String(rawQuery ?? '').trim();
  if (!raw) {
    return { raw: '', normalized: '', compact: '', tokens: [], tokenGroups: [] };
  }
  if (raw === lastCachedRaw && lastCachedParsed) {
    return lastCachedParsed;
  }

  const normalized = normalizeSearchQuery(raw);
  const compact = compactAlnum(normalized);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const tokenGroups = tokens.map((t) => expandTokenVariants(t));

  lastCachedRaw = raw;
  lastCachedParsed = { raw, normalized, compact, tokens, tokenGroups };
  return lastCachedParsed;
}

function isWithinEditDistanceOne(a: string, b: string): boolean {
  if (a === b) return true;
  const lenA = a.length;
  const lenB = b.length;
  if (Math.abs(lenA - lenB) > 1) return false;

  let i = 0;
  let j = 0;
  let edits = 0;

  while (i < lenA && j < lenB) {
    if (a[i] === b[j]) {
      i++;
      j++;
    } else {
      edits++;
      if (edits > 1) return false;
      if (lenA > lenB) i++;
      else if (lenB > lenA) j++;
      else {
        i++;
        j++;
      }
    }
  }
  if (i < lenA || j < lenB) edits++;
  return edits <= 1;
}

function hasBoundaryMatch(haystack: string, token: string): boolean {
  if (!haystack || !token) return false;
  let idx = haystack.indexOf(token);
  while (idx !== -1) {
    const prev = idx > 0 ? haystack[idx - 1] : '';
    const next = idx + token.length < haystack.length ? haystack[idx + token.length] : '';
    const prevOk =
      !prev ||
      !/[a-z0-9]/i.test(prev) ||
      (/\d/.test(token[0]) && /[a-z]/i.test(prev) && !'bcdef'.includes(prev));
    const nextOk =
      !next ||
      !/[a-z0-9]/i.test(next) ||
      (/\d/.test(token[token.length - 1]) && next === 'x');
    if (prevOk && nextOk) return true;
    idx = haystack.indexOf(token, idx + 1);
  }
  return false;
}

function flattenFields(fields: unknown): string[] {
  if (fields === null || fields === undefined) return [];
  if (Array.isArray(fields)) {
    const out: string[] = [];
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      if (f === null || f === undefined || f === '') continue;
      if (Array.isArray(f)) {
        out.push(...flattenFields(f));
      } else {
        const str = String(f).trim();
        if (str) out.push(str);
      }
    }
    return out;
  }
  const str = String(fields).trim();
  return str ? [str] : [];
}

/**
 * Computes relevance score of an item's fields against a query.
 * Primary field (index 0, typically productName) receives highest weight.
 * Returns 0 if the item does not match.
 */
export function scoreSmartSearch(
  fields: unknown,
  rawQuery: unknown | ParsedSmartQuery,
): number {
  const parsed: ParsedSmartQuery =
    rawQuery && typeof rawQuery === 'object' && 'tokenGroups' in (rawQuery as any)
      ? (rawQuery as ParsedSmartQuery)
      : parseSmartQuery(rawQuery);

  if (parsed.tokens.length === 0) return 1;

  const list = flattenFields(fields);
  if (list.length === 0) return 0;

  const primaryLower = list[0].toLowerCase();
  const primaryNorm = normalizeSearchQuery(primaryLower);
  const primaryCompact = compactAlnum(primaryLower);

  const combinedRaw = list.join(' ').toLowerCase();
  const combinedNorm = normalizeSearchQuery(combinedRaw);
  const combinedCompact = compactAlnum(combinedRaw);

  let score = 0;

  // 1. Exact & prefix bonuses on primary field
  if (
    primaryLower === parsed.normalized ||
    primaryNorm === parsed.normalized ||
    (parsed.compact && primaryCompact === parsed.compact)
  ) {
    score += 1000;
  } else if (
    primaryLower.startsWith(parsed.normalized) ||
    primaryNorm.startsWith(parsed.normalized) ||
    (parsed.compact && primaryCompact.startsWith(parsed.compact))
  ) {
    score += 460;
  }

  // 2. Full phrase / compact substring match across fields
  if (primaryLower.includes(parsed.normalized) || primaryNorm.includes(parsed.normalized)) {
    score += 320;
  } else if (combinedRaw.includes(parsed.normalized) || combinedNorm.includes(parsed.normalized)) {
    score += 200;
  }

  if (parsed.compact.length >= 3) {
    if (primaryCompact.includes(parsed.compact)) score += 240;
    else if (combinedCompact.includes(parsed.compact)) score += 160;
  }

  // 3. Multi-token match (all tokens must match across combined fields)
  let wordsCache: string[] | null = null;
  let matchedTokens = 0;

  for (let t = 0; t < parsed.tokenGroups.length; t++) {
    const variants = parsed.tokenGroups[t];
    let bestTokenScore = 0;

    for (let vIdx = 0; vIdx < variants.length; vIdx++) {
      const v = variants[vIdx];
      const vCompact = compactAlnum(v);

      if (primaryLower.includes(v) || primaryNorm.includes(v)) {
        let s = 140;
        if (hasBoundaryMatch(primaryNorm, v) || hasBoundaryMatch(primaryLower, v)) {
          s += 90;
        }
        if (s > bestTokenScore) bestTokenScore = s;
      } else if (vCompact.length >= 2 && primaryCompact.includes(vCompact)) {
        if (115 > bestTokenScore) bestTokenScore = 115;
      } else if (combinedRaw.includes(v) || combinedNorm.includes(v)) {
        let s = 90;
        if (hasBoundaryMatch(combinedNorm, v) || hasBoundaryMatch(combinedRaw, v)) {
          s += 45;
        }
        if (s > bestTokenScore) bestTokenScore = s;
      } else if (vCompact.length >= 2 && combinedCompact.includes(vCompact)) {
        if (75 > bestTokenScore) bestTokenScore = 75;
      }
    }

    // 1-char typo tolerance for alphabetic words >= 4 chars
    if (bestTokenScore === 0) {
      const baseToken = variants[0];
      if (baseToken && baseToken.length >= 4 && /^[a-z]+$/.test(baseToken)) {
        if (!wordsCache) {
          wordsCache = combinedRaw.split(/[^a-z0-9]+/).filter((w) => w.length >= 4);
        }
        if (wordsCache.some((w) => isWithinEditDistanceOne(w, baseToken))) {
          bestTokenScore = 60;
        }
      }
    }

    if (bestTokenScore > 0) {
      matchedTokens++;
      score += bestTokenScore;
    }
  }

  if (matchedTokens < parsed.tokens.length) {
    // Allow full compact alphanumeric hit (e.g. searching "frpmhceld10x10" against "FRP MHC ELD 10 X 10")
    if (parsed.compact.length >= 4 && combinedCompact.includes(parsed.compact)) {
      return 120;
    }
    return 0;
  }

  const lengthPenalty = Math.min(35, Math.floor(primaryLower.length / 5));
  return Math.max(1, score - lengthPenalty);
}

/**
 * Fast boolean smart matcher for use in `.filter(...)` across any table or list.
 */
export function matchesSmartSearch(
  fields: unknown,
  rawQuery: unknown | ParsedSmartQuery,
): boolean {
  const parsed: ParsedSmartQuery =
    rawQuery && typeof rawQuery === 'object' && 'tokenGroups' in (rawQuery as any)
      ? (rawQuery as ParsedSmartQuery)
      : parseSmartQuery(rawQuery);
  if (parsed.tokens.length === 0) return true;
  return scoreSmartSearch(fields, parsed) > 0;
}

/**
 * Filters AND relevance-ranks any list when a search query is active.
 * Returns original array order untouched when query is empty.
 */
export function filterAndRankBySearch<T>(
  items: T[],
  getFields: (item: T) => unknown,
  rawQuery: unknown,
): T[] {
  if (!Array.isArray(items) || items.length === 0) return [];
  const parsed = parseSmartQuery(rawQuery);
  if (parsed.tokens.length === 0) return items;

  const scored: Array<{ item: T; score: number }> = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const s = scoreSmartSearch(getFields(item), parsed);
    if (s > 0) {
      scored.push({ item, score: s });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((entry) => entry.item);
}
