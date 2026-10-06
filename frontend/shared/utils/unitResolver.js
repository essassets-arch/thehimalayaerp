/**
 * Standard unit resolver for raw materials, store items, and purchase indents.
 * Accurately extracts and normalizes units (KG, PCS, ROLL, LTR, BRL, PKT, etc.)
 * from item.uom, item.unit, item.product.unit, or material catalog inference.
 */

// Canonical clean unit normalizer
export function normalizeUnit(rawUnit) {
  if (!rawUnit || typeof rawUnit !== 'string') return '';
  const cleaned = rawUnit.trim();
  const upper = cleaned.toUpperCase();

  if (['KGS', 'KG', 'KILOGRAM', 'KILOGRAMS', 'K.G.'].includes(upper)) return 'KG';
  if (['PCS', 'PIECE', 'PIECES', 'PC', 'PCE'].includes(upper)) return 'PCS';
  if (['ROLL', 'ROLLS', 'ROL'].includes(upper)) return 'ROLL';
  if (['LTR', 'LITRE', 'LITRES', 'LITER', 'LITERS', 'L'].includes(upper)) return 'LTR';
  if (['MTR', 'METER', 'METERS', 'METRE', 'METRES', 'M'].includes(upper)) return 'MTR';
  if (['BOX', 'BOXES', 'BX'].includes(upper)) return 'BOX';
  if (['PKT', 'PACKET', 'PACKETS', 'PAC', 'PACK'].includes(upper)) return 'PKT';
  if (['CAN', 'CANS'].includes(upper)) return 'CAN';
  if (['BRL', 'BARREL', 'BARRELS', 'BAREL', 'BARELS', 'DRUM'].includes(upper)) return 'BRL';
  if (['SET', 'SETS'].includes(upper)) return 'SET';
  if (['PAIR', 'PAIRS', 'PR'].includes(upper)) return 'PAIR';
  if (['NOS', 'NO', 'NUMBER', 'NUMBERS'].includes(upper)) return 'Nos';

  return cleaned;
}

// Known raw material catalog code/name overrides (212 inventory items)
const CATALOG_UNIT_OVERRIDES = {
  // Quartz Powders & Minerals
  'quartz powder': 'KG',
  'quartz powder - big': 'KG',
  'quartz powder – big': 'KG',
  'quartz powder - small': 'KG',
  'quartz powder – small': 'KG',
  'quartz powder - medium': 'KG',
  'quartz powder – medium': 'KG',
  'quartz powder - black and white': 'PCS',
  'quartz powder – black and white': 'PCS',
  'dolomite powder': 'KG',
  'general mineral filler': 'KG',
  'gel coat grade filler powder': 'KG',
  'filler powder': 'KG',
  'plaster of paris': 'KG',

  // Waxes & Polishes
  'white mold release wax polish': 'KG',
  'benjo mold release wax polish': 'KG',
  'mold release wax': 'KG',
  'buffing/polishing compound': 'KG',
  'buffing compound': 'KG',

  // Pigments
  'white pigment': 'KG',
  'white pigment (tio₂)': 'KG',
  'light grey pigment': 'KG',
  'black pigment': 'PCS',
  'phthalocyanine blue pigment': 'PCS',
  'red brick pigment': 'PCS',
  'browan pigment': 'PCS',
  'terra coata pigment': 'PCS',
  'gray pigment': 'KG',
  'grey pigment': 'KG',

  // Resins & Chemicals
  'polyethylene terephthalate resin (pet)': 'BRL',
  'general purpose unsaturated polyester resin (clear)': 'BRL',
  'isophthalic polyester resin': 'KG',
  'vinyl ester resin': 'PCS',
  'isophthalic gel coat (pre-accelerated)': 'KG',
  'gel coat': 'KG',
  'polyvinyl alcohol (pva) release agent': 'LTR',
  'nc-50 solvent-based mold release agent': 'PCS',
  'methyl ethyl ketone peroxide (catalyst)': 'KG',
  'cobalt octoate solution (accelerator)': 'KG',
  'dimethylaniline (dma) promoter': 'PCS',
  'acetone (solvent)': 'PCS',
  'thinner': 'LTR',
  'general purpose paint/resin thinner': 'LTR',
  'admixture chemical': 'BRL',
  'reileas chemicale': 'BRL',
  'hydraulic oil': 'LTR',
  'diesel': 'LTR',
  'desil': 'LTR',
  'grease': 'KG',
  'grees': 'KG',

  // Reinforcement Mats
  'surface tissue mat (30 gsm)': 'ROLL',
  'surface tissue mat': 'ROLL',
  'chopped strand mat – 225 gsm': 'KG',
  'chopped strand mat - 225 gsm': 'KG',
  'chopped strand mat – 450 gsm': 'ROLL',
  'chopped strand mat - 450 gsm': 'ROLL',
  'chopped strand mat': 'ROLL',
  'woven roving – 610 gsm': 'ROLL',
  'woven roving - 610 gsm': 'ROLL',
  'woven roving': 'ROLL',
  'unidirectional fiberglass mat – 1230 gsm': 'ROLL',
  'unidirectional fiberglass mat - 1230 gsm': 'ROLL',
  'unidirectional fiberglass mat': 'ROLL',
  'fiberglass mat': 'ROLL',

  // Packaging & Tapes
  'emery paper (grit 60)': 'ROLL',
  'masking tape': 'PCS',
  'raping role': 'ROLL',
  'wrapping roll': 'ROLL',
  'wire tape': 'PKT',
  'duble seel rubber 4mm': 'MTR',
  'rassi/plastic sulti': 'KG',

  // Safety & Tools
  'yellow gloves': 'SET',
  'cloth gloves': 'SET',
  'acid gloves': 'SET',
  'grey moja': 'PAIR',
  'finger': 'PKT',
  'fingure': 'PKT',
  'mask': 'PKT',
  'hacksaw blade': 'Nos',
  'measuring tape': 'Nos',
  'belcha': 'Nos',
  'nylon block patti small': 'Nos',
};

// Item code prefix overrides (e.g. HM001 -> KG, HM016 -> ROLL)
const CODE_UNIT_OVERRIDES = {
  'HM001': 'KG',
  'HM002': 'KG',
  'HM003': 'LTR',
  'HM004': 'PCS',
  'HM005': 'KG',
  'HM006': 'KG',
  'HM007': 'PCS',
  'HM008': 'PCS',
  'HM009': 'BRL',
  'HM010': 'BRL',
  'HM011': 'KG',
  'HM012': 'PCS',
  'HM013': 'KG',
  'HM014': 'ROLL',
  'HM015': 'KG',
  'HM016': 'ROLL',
  'HM017': 'ROLL',
  'HM018': 'ROLL',
  'HM019': 'KG',
  'HM020': 'KG',
  'HM021': 'PCS',
  'HM022': 'KG',
  'HM023': 'KG',
  'HM024': 'KG',
  'HM025': 'PCS',
  'HM026': 'KG',
  'HM027': 'KG',
  'HM028': 'PCS',
  'HM029': 'LTR',
  'HM092': 'ROLL',
  'HM108': 'KG',
  'HM123': 'KG',
  'HM126': 'ROLL',
  'HM143': 'SET',
  'HM147': 'MTR',
  'HM150': 'LTR',
  'HM155': 'SET',
  'HM158': 'KG',
  'HM159': 'BRL',
  'HM160': 'BRL',
  'HM161': 'SET',
  'HM169': 'PAIR',
  'HM170': 'KG',
};

/**
 * Resolves the real, human-readable unit for an indent item or material row.
 * Checks explicit properties (uom, unit, product.unit), code mappings, and name-based physical rules.
 */
export function resolveMaterialUnit(item, fallback = 'Nos') {
  if (!item) return fallback;

  // 1. Direct explicit property inspection
  const directUnit = 
    (typeof item === 'string' ? item : null) ||
    item.unit || 
    item.uom || 
    item.product?.unit || 
    item.product?.uom || 
    item.rawMaterial?.unit || 
    item.reorderUnit ||
    item.uomSnapshot;

  const directNormalized = normalizeUnit(directUnit);

  // If a specific, non-generic unit was explicitly stored (e.g. KG, PCS, ROLL, LTR, MTR), respect it!
  if (directNormalized && !['NOS', 'UNIT', 'UNITS'].includes(directNormalized.toUpperCase())) {
    return directNormalized;
  }

  // 2. Lookup by SKU / Material Code (e.g. HM001, HM016, HM022)
  const code = (
    item.materialCode || 
    item.sku || 
    item.code || 
    item.product?.sku || 
    item.product?.code || 
    ''
  ).toUpperCase().trim();

  if (code && CODE_UNIT_OVERRIDES[code]) {
    return CODE_UNIT_OVERRIDES[code];
  }

  // 3. Lookup by Material Name (Exact or Keyword based)
  const name = (
    item.product?.name || 
    item.materialName || 
    item.material || 
    item.itemName || 
    item.name || 
    (typeof item === 'string' ? item : '')
  ).toLowerCase().trim();

  if (name) {
    // Exact match in catalog
    if (CATALOG_UNIT_OVERRIDES[name]) {
      return CATALOG_UNIT_OVERRIDES[name];
    }

    // Keyword inferences for common raw material categories
    if (name.includes('quartz powder') || name.includes('powder') || name.includes('dolomite')) {
      if (name.includes('black and white')) return 'PCS';
      return 'KG';
    }

    if (name.includes('chopped strand mat') || name.includes('fiberglass mat') || name.includes('woven roving') || name.includes('surface tissue')) {
      if (name.includes('225 gsm') || name.includes('225gsm')) return 'KG';
      return 'ROLL';
    }

    if (name.includes('mold release wax') || name.includes('wax polish') || name.includes('buffing compound')) {
      return 'KG';
    }

    if (name.includes('pigment')) {
      if (name.includes('black') || name.includes('blue') || name.includes('brown') || name.includes('terra')) {
        return 'PCS';
      }
      return 'KG';
    }

    if (name.includes('resin') || name.includes('gel coat') || name.includes('catalyst') || name.includes('accelerator')) {
      if (name.includes('pet resin') || name.includes('clear')) return 'BRL';
      if (name.includes('vinyl ester') || name.includes('promoter')) return 'PCS';
      return 'KG';
    }

    if (name.includes('oil') || name.includes('thinner') || name.includes('diesel') || name.includes('desil')) {
      return 'LTR';
    }

    if (name.includes('gloves') || name.includes('moja')) {
      return 'PAIR';
    }

    if (name.includes('rubber') && name.includes('seel')) {
      return 'MTR';
    }

    if (name.includes('disc') || name.includes('pkt') || name.includes('wire tape')) {
      return 'PKT';
    }

    if (name.includes('blade') || name.includes('brush') || name.includes('tape') || name.includes('chisel') || name.includes('drill')) {
      return 'PCS';
    }
  }

  // 4. Return direct unit if it was set (even if 'Nos'), otherwise fallback
  return directNormalized || fallback;
}

export default resolveMaterialUnit;
