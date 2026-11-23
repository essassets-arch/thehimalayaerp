/**
 * Smart Product Search, Relevance Ranking & Canonical Deduplication Utility
 *
 * Solves rigid substring matching across all Himalaya ERP panels:
 * - Collapses spaced dimensions ("600 x 600", "600 * 600", "600×600" -> "600x600")
 * - Collapses spaced units & ranges ("20 - 25 mm", "20 25mm" -> "20-25mm" / "2025mm", "5 ton" -> "5t")
 * - Expands domain aliases & common typos ("dhmc" <-> "dmhc", "grating" <-> "fratings", "gully" <-> "wgc")
 * - Prevents HSN code pollution (only queries hsnCode for 4-8 digit numeric tokens)
 * - Scores & ranks results by relevance (exact > prefix > boundary token > substring > fuzzy)
 * - Deduplicates accidental multi-import product duplicates keeping the canonical richest record
 */

export interface SearchableProduct {
  id: string;
  publicId?: string | null;
  name?: string | null;
  sku?: string | null;
  category?: string | null;
  brand?: string | null;
  hsnCode?: string | null;
  description?: string | null;
  variantDetails?: string | null;
  productType?: string | null;
  dispatchCategory?: string | null;
  unitPrice?: any;
  weight?: any;
  imageUrl?: string | null;
  createdAt?: Date | string | null;
  [key: string]: any;
}

export interface ParsedProductQuery {
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

export function compactAlnum(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Normalizes spacing around dimensions and unit tokens BEFORE splitting into words.
 * Example:
 *  "600 x 600"      -> "600x600"
 *  "24 * 24 5 ton"  -> "24x24 5t"
 *  "20 - 25 mm"     -> "20-25mm"
 *  "cover block"    -> "coverblock"
 */
export function normalizeProductSearchQuery(rawQuery: string): string {
  let s = String(rawQuery || '')
    .trim()
    .toLowerCase()
    .replace(/[×*]/g, 'x')
    .replace(/\s+/g, ' ');

  if (!s) return '';

  // Collapse spaced dimensions: "600 x 600" -> "600x600", "10 x 10" -> "10x10"
  s = s.replace(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/gi, '$1x$2');

  // Collapse spaced ranges followed by mm/cm/inch: "20 - 25 mm" or "20 25mm" -> "20-25mm"
  s = s.replace(/(\d+)\s*-\s*(\d+)\s*(mm|cm|in|inch)\b/gi, '$1-$2$3');
  s = s.replace(/(\d+)\s+(?=\d+(?:mm|cm)\b)/gi, '$1-');

  // Collapse number + unit spacing: "50 mm" -> "50mm", "5 ton" / "5 tons" / "5 t" -> "5t"
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

  // Domain alias lookup (exact or compact)
  const directAliases = ALIAS_LOOKUP.get(clean) || ALIAS_LOOKUP.get(compact);
  if (directAliases) {
    for (const a of directAliases) variants.add(a);
  }

  // Tonnage expansion: "5t" <-> "5ton", "5 t", "hd5"
  const tonMatch = clean.match(/^(\d+(?:\.\d+)?)t$/);
  if (tonMatch) {
    const num = tonMatch[1];
    variants.add(`${num}t`);
    variants.add(`${num}ton`);
    variants.add(`${num} ton`);
    variants.add(`${num} t`);
  }

  // Range hyphen variant: "20-25mm" <-> "2025mm"
  if (clean.includes('-')) {
    variants.add(clean.replace(/-/g, ''));
    variants.add(clean.replace(/-/g, ' '));
  }

  // Dimension variant: "600x600" also matches "600 x 600"
  const dimMatch = clean.match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/);
  if (dimMatch) {
    variants.add(`${dimMatch[1]}x${dimMatch[2]}`);
    variants.add(`${dimMatch[1]} x ${dimMatch[2]}`);
  }

  // Basic singular/plural normalization for words >= 4 chars
  if (clean.length >= 4 && /^[a-z]+$/.test(clean)) {
    if (clean.endsWith('s')) {
      variants.add(clean.slice(0, -1));
    } else {
      variants.add(`${clean}s`);
    }
  }

  return Array.from(variants).filter(Boolean);
}

export function parseProductSearchQuery(rawQuery?: string | null): ParsedProductQuery {
  const raw = String(rawQuery || '').trim();
  if (!raw) {
    return { raw: '', normalized: '', compact: '', tokens: [], tokenGroups: [] };
  }

  const normalized = normalizeProductSearchQuery(raw);
  const compact = compactAlnum(normalized);
  const tokens = normalized
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const tokenGroups = tokens.map((token) => expandTokenVariants(token));

  return {
    raw,
    normalized,
    compact,
    tokens,
    tokenGroups,
  };
}

/**
 * Builds a clean Prisma `where` search clause that:
 * - Requires ALL user tokens (each token may match any of its normalized variants)
 * - NEVER pollutes searches via hsnCode unless a token is a 4-8 digit HSN number
 * - Also allows full compact alphanumeric match on name/sku (e.g. "frp mhc eld 10x10" -> "FRPMHCELD10X10")
 */
export function buildProductPrismaSearchWhere(rawQuery?: string | null): any | null {
  const parsed = parseProductSearchQuery(rawQuery);
  if (parsed.tokens.length === 0) return null;

  const isHsnToken = (v: string) => /^\d{4,8}$/.test(v);

  const tokenAndClauses = parsed.tokenGroups.map((variants) => {
    const fieldOrs: any[] = [];
    for (const v of variants) {
      fieldOrs.push(
        { name: { contains: v, mode: 'insensitive' } },
        { sku: { contains: v, mode: 'insensitive' } },
        { category: { contains: v, mode: 'insensitive' } },
        { brand: { contains: v, mode: 'insensitive' } },
        { variantDetails: { contains: v, mode: 'insensitive' } },
      );
      if (isHsnToken(v)) {
        fieldOrs.push({ hsnCode: { contains: v, mode: 'insensitive' } });
      }
    }
    return { OR: fieldOrs };
  });

  const topOrs: any[] = [{ AND: tokenAndClauses }];

  // Also match full compact alphanumeric string against SKU/name (handles glued SKUs)
  if (parsed.compact.length >= 3) {
    topOrs.push(
      { sku: { contains: parsed.compact, mode: 'insensitive' } },
      { name: { contains: parsed.compact, mode: 'insensitive' } },
    );
  }

  // Also match exact raw phrase against description only if >= 4 chars (avoids noise)
  if (parsed.raw.length >= 4) {
    topOrs.push({ description: { contains: parsed.raw, mode: 'insensitive' } });
  }

  return { OR: topOrs };
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
      if (lenA > lenB) {
        i++;
      } else if (lenB > lenA) {
        j++;
      } else {
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
    const prevOk = !prev || !/[a-z0-9]/i.test(prev) || (/\d/.test(token[0]) && /[a-z]/i.test(prev) && prev !== 'e' && prev !== 'b' && prev !== 'c' && prev !== 'd' && prev !== 'f');
    const nextOk = !next || !/[a-z0-9]/i.test(next) || (/\d/.test(token[token.length - 1]) && next === 'x');
    if (prevOk && nextOk) return true;
    idx = haystack.indexOf(token, idx + 1);
  }
  return false;
}

/**
 * Computes a relevance score for a product against a parsed query.
 * Higher score = closer match. Returns 0 if the product does not match.
 */
export function scoreProductMatch(
  product: SearchableProduct,
  parsed: ParsedProductQuery,
): number {
  if (parsed.tokens.length === 0) return 1;

  const nameLower = String(product.name || '').trim().toLowerCase();
  const skuLower = String(product.sku || '').trim().toLowerCase();
  const catLower = String(product.category || '').trim().toLowerCase();
  const brandLower = String(product.brand || '').trim().toLowerCase();
  const variantLower = String(product.variantDetails || '').trim().toLowerCase();
  const hsnLower = String(product.hsnCode || '').trim().toLowerCase();
  const descLower = String(product.description || '').trim().toLowerCase();

  const nameNorm = normalizeProductSearchQuery(nameLower);
  const nameCompact = compactAlnum(nameLower);
  const skuCompact = compactAlnum(skuLower);
  const combinedLower = `${nameLower} ${nameNorm} ${skuLower} ${variantLower} ${catLower} ${brandLower}`;
  const combinedCompact = compactAlnum(combinedLower);
  const nameWords = nameLower.split(/[^a-z0-9]+/).filter(Boolean);

  let score = 0;

  // 1. Exact matches (highest priority)
  if (skuLower === parsed.normalized || (parsed.compact && skuCompact === parsed.compact)) {
    score += 1000;
  } else if (nameLower === parsed.normalized || nameNorm === parsed.normalized || (parsed.compact && nameCompact === parsed.compact)) {
    score += 920;
  }

  // 2. Prefix / starts-with matches
  if (skuLower.startsWith(parsed.normalized) || (parsed.compact && skuCompact.startsWith(parsed.compact))) {
    score += 480;
  }
  if (nameLower.startsWith(parsed.normalized) || nameNorm.startsWith(parsed.normalized) || (parsed.compact && nameCompact.startsWith(parsed.compact))) {
    score += 420;
  }

  // 3. Full normalized phrase / compact substring match
  if (nameLower.includes(parsed.normalized) || nameNorm.includes(parsed.normalized)) {
    score += 320;
  }
  if (skuLower.includes(parsed.normalized)) {
    score += 280;
  }
  if (parsed.compact.length >= 3 && nameCompact.includes(parsed.compact)) {
    score += 240;
  }
  if (parsed.compact.length >= 3 && skuCompact.includes(parsed.compact)) {
    score += 210;
  }

  // 4. Token-by-token verification & scoring
  let matchedTokens = 0;
  let allInNameOrSku = true;

  for (const variants of parsed.tokenGroups) {
    let bestTokenScore = 0;
    let inPrimary = false;

    for (const v of variants) {
      const vCompact = compactAlnum(v);
      const isHsn = /^\d{4,8}$/.test(v);

      if (nameLower.includes(v) || nameNorm.includes(v)) {
        let s = 140;
        if (hasBoundaryMatch(nameNorm, v) || hasBoundaryMatch(nameLower, v)) {
          s += 90; // Strongly prefer "600X600" over "E600" when searching "600"
        }
        if (s > bestTokenScore) bestTokenScore = s;
        inPrimary = true;
      }
      if (skuLower.includes(v) || (vCompact.length >= 2 && skuCompact.includes(vCompact))) {
        const s = 120;
        if (s > bestTokenScore) bestTokenScore = s;
        inPrimary = true;
      }
      if (vCompact.length >= 2 && nameCompact.includes(vCompact)) {
        const s = 110;
        if (s > bestTokenScore) bestTokenScore = s;
        inPrimary = true;
      }
      if (variantLower.includes(v)) {
        if (95 > bestTokenScore) bestTokenScore = 95;
      }
      if (catLower.includes(v)) {
        if (70 > bestTokenScore) bestTokenScore = 70;
      }
      if (brandLower.includes(v)) {
        if (55 > bestTokenScore) bestTokenScore = 55;
      }
      if (isHsn && hsnLower.includes(v)) {
        if (85 > bestTokenScore) bestTokenScore = 85;
      }
      // 1-char typo tolerance for alphabetic words >= 4 chars
      if (bestTokenScore === 0 && v.length >= 4 && /^[a-z]+$/.test(v)) {
        if (nameWords.some((w) => w.length >= 4 && isWithinEditDistanceOne(w, v))) {
          bestTokenScore = 65;
          inPrimary = true;
        }
      }
    }

    if (bestTokenScore > 0) {
      matchedTokens++;
      score += bestTokenScore;
      if (!inPrimary) allInNameOrSku = false;
    } else if (parsed.compact.length >= 3 && combinedCompact.includes(parsed.compact)) {
      matchedTokens++;
      score += 80;
    }
  }

  // Exact description fallback only when full raw phrase matches
  if (matchedTokens < parsed.tokens.length) {
    if (parsed.raw.length >= 4 && descLower.includes(parsed.raw.toLowerCase())) {
      return 45;
    }
    return 0;
  }

  if (allInNameOrSku) {
    score += 120;
  }

  // Slight tie-breaker favoring shorter, cleaner exact product names
  const lengthPenalty = Math.min(40, Math.floor(nameLower.length / 4));
  return Math.max(1, score - lengthPenalty);
}

/**
 * Canonical completeness score used when deduplicating identical products.
 * Keeps the richest / oldest canonical product row so edits and specs aren't lost.
 */
function canonicalProductPriority(p: SearchableProduct): number {
  let priority = 0;
  if (p.imageUrl) priority += 40;
  if (p.variantDetails) priority += 30;
  if (p.weight !== null && p.weight !== undefined && Number(p.weight) > 0) priority += 25;
  if (p.unitPrice !== null && p.unitPrice !== undefined && Number(p.unitPrice) > 0) priority += 20;
  if (p.publicId && String(p.publicId).startsWith('PRD-')) priority += 15;
  if (p.hsnCode) priority += 10;
  if (p.description) priority += 5;
  return priority;
}

/**
 * Deduplicates accidental repeated CSV-imported Product records by
 * (normalized name + normalized SKU + productType) while preferring the
 * most complete / earliest canonical record.
 */
export function dedupeCatalogProducts<T extends SearchableProduct>(products: T[]): T[] {
  const byKey = new Map<string, T>();

  for (const p of products) {
    const nameKey = compactAlnum(String(p.name || ''));
    const skuKey = compactAlnum(String(p.sku || ''));
    const typeKey = String(p.productType || 'MANUFACTURING').toUpperCase();
    const dedupeKey = `${nameKey}|${skuKey}|${typeKey}`;

    const existing = byKey.get(dedupeKey);
    if (!existing) {
      byKey.set(dedupeKey, p);
      continue;
    }

    const currPrio = canonicalProductPriority(p);
    const prevPrio = canonicalProductPriority(existing);

    if (currPrio > prevPrio) {
      byKey.set(dedupeKey, p);
    } else if (currPrio === prevPrio) {
      const currTs = p.createdAt ? new Date(p.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
      const prevTs = existing.createdAt ? new Date(existing.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
      if (currTs < prevTs) {
        byKey.set(dedupeKey, p);
      }
    }
  }

  return Array.from(byKey.values());
}

/**
 * Filters, deduplicates (optional), and relevance-ranks products for a search query.
 */
export function rankProductsBySearch<T extends SearchableProduct>(
  products: T[],
  rawQuery?: string | null,
  options: { dedupe?: boolean } = {},
): T[] {
  const base = options.dedupe ? dedupeCatalogProducts(products) : products;
  const parsed = parseProductSearchQuery(rawQuery);
  if (parsed.tokens.length === 0) {
    return base;
  }

  const scored: Array<{ item: T; score: number }> = [];
  for (const item of base) {
    const s = scoreProductMatch(item, parsed);
    if (s > 0) {
      scored.push({ item, score: s });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return String(a.item.name || '').localeCompare(String(b.item.name || ''));
  });

  return scored.map((entry) => entry.item);
}
