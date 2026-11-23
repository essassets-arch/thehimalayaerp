import {
  buildProductPrismaSearchWhere,
  dedupeCatalogProducts,
  normalizeProductSearchQuery,
  parseProductSearchQuery,
  rankProductsBySearch,
} from './product-search.util';

describe('product-search.util', () => {
  const sampleCatalog = [
    {
      id: '1',
      publicId: 'PRD-1',
      name: 'FRCCP24x24 HD20',
      sku: 'FRCCP24X24HD20',
      category: 'COVERBLOCK',
      hsnCode: '68109990',
      productType: 'TRADING',
      createdAt: '2026-09-10T00:00:00Z',
    },
    {
      id: '2',
      publicId: 'PRD-2',
      name: 'HIMALAYA FRP DMHC 600X600 B125',
      sku: 'HIMALAYAFRPDMHC600X600B125',
      category: 'FRP COVERS',
      hsnCode: '39259090',
      variantDetails: 'DMHC 600X600 B125',
      productType: 'MANUFACTURING',
      createdAt: '2026-09-12T00:00:00Z',
    },
    {
      id: '2-dup',
      publicId: 'PROD-dup',
      name: 'HIMALAYA FRP DMHC 600X600 B125',
      sku: 'HIMALAYAFRPDMHC600X600B125',
      category: 'FRP COVERS',
      hsnCode: '39259090',
      variantDetails: null,
      productType: 'MANUFACTURING',
      createdAt: '2026-09-19T00:00:00Z',
    },
    {
      id: '3',
      publicId: 'PRD-3',
      name: 'HIMALAYA FRP DMHC 1000X1000 E600',
      sku: 'HIMALAYAFRPDMHC1000X1000E600',
      category: 'FRP COVERS',
      hsnCode: '39259090',
      productType: 'MANUFACTURING',
      createdAt: '2026-09-12T00:00:00Z',
    },
    {
      id: '4',
      publicId: 'PRD-4',
      name: 'FRPMHCELD 10X10',
      sku: 'FRPMHCELD10X10',
      category: 'FRP COVER',
      hsnCode: '39259090',
      productType: 'MANUFACTURING',
      createdAt: '2026-08-29T00:00:00Z',
    },
    {
      id: '5',
      publicId: 'PRD-5',
      name: 'FRP MOULDED FRATINGS 50MM',
      sku: 'FRPMOULDEDFRATINGS50MM',
      category: 'FRP GRATINGS',
      hsnCode: '39259090',
      productType: 'MANUFACTURING',
      createdAt: '2026-09-12T00:00:00Z',
    },
    {
      id: '6',
      publicId: 'PRD-6',
      name: 'FRP WGC 600X700 C250 GRAY',
      sku: 'HIMALAYAFRPWGC600X700C250GRAY',
      category: 'FRP COVER',
      hsnCode: null,
      productType: 'MANUFACTURING',
      createdAt: '2026-09-12T00:00:00Z',
    },
    {
      id: '7',
      publicId: 'PRD-7',
      name: 'BTCB 20-25MM',
      sku: 'BTCB2025MM',
      category: 'COVERBLOCK',
      hsnCode: '6810',
      productType: 'TRADING',
      createdAt: '2026-09-19T00:00:00Z',
    },
  ];

  it('normalizes spaced dimensions and units cleanly', () => {
    expect(normalizeProductSearchQuery('600 x 600')).toBe('600x600');
    expect(normalizeProductSearchQuery('10 * 10')).toBe('10x10');
    expect(normalizeProductSearchQuery('24 × 24 5 ton')).toBe('24x24 5t');
    expect(normalizeProductSearchQuery('20 25mm')).toBe('20-25mm');
  });

  it('does NOT pollute "10 x 10" with FRCCP24x24 (hsnCode 68109990)', () => {
    const ranked = rankProductsBySearch(sampleCatalog, '10 x 10', { dedupe: true });
    expect(ranked.map((p) => p.id)).toEqual(['4']);
  });

  it('matches "600 x 600" accurately and ignores 24x24 products', () => {
    const ranked = rankProductsBySearch(sampleCatalog, '600 x 600', { dedupe: true });
    expect(ranked.map((p) => p.id)).toEqual(['2']);
  });

  it('ranks 600X600 / 600X700 ABOVE E600 when searching "frp 600"', () => {
    const ranked = rankProductsBySearch(sampleCatalog, 'frp 600', { dedupe: true });
    expect(ranked[0].name).toMatch(/600X(600|700)/);
    expect(ranked.findIndex((p) => p.id === '2')).toBeLessThan(
      ranked.findIndex((p) => p.id === '3'),
    );
  });

  it('matches glued names like "frp mhc 10x10" -> FRPMHCELD 10X10', () => {
    const ranked = rankProductsBySearch(sampleCatalog, 'frp mhc 10x10', { dedupe: true });
    expect(ranked.map((p) => p.id)).toEqual(['4']);
  });

  it('supports ERP aliases: dhmc -> DMHC, gully -> WGC, grating -> FRATINGS', () => {
    expect(rankProductsBySearch(sampleCatalog, 'dhmc 600x600', { dedupe: true })[0]?.id).toBe('2');
    expect(rankProductsBySearch(sampleCatalog, 'gully 600x700', { dedupe: true })[0]?.id).toBe('6');
    expect(rankProductsBySearch(sampleCatalog, 'grating 50mm', { dedupe: true })[0]?.id).toBe('5');
  });

  it('handles hyphen/space differences and 1-char typos', () => {
    expect(rankProductsBySearch(sampleCatalog, 'btcb 20 25mm', { dedupe: true })[0]?.id).toBe('7');
    expect(rankProductsBySearch(sampleCatalog, 'himalya 600x600', { dedupe: true })[0]?.id).toBe('2');
  });

  it('deduplicates repeated imports keeping the richest canonical row', () => {
    const deduped = dedupeCatalogProducts(sampleCatalog);
    const dmhcRows = deduped.filter((p) => p.name === 'HIMALAYA FRP DMHC 600X600 B125');
    expect(dmhcRows).toHaveLength(1);
    expect(dmhcRows[0].id).toBe('2');
  });

  it('omits hsnCode from Prisma search clause for short numeric tokens like "10"', () => {
    const where = buildProductPrismaSearchWhere('10 x 10');
    expect(JSON.stringify(where)).not.toContain('"hsnCode"');
    const hsnWhere = buildProductPrismaSearchWhere('39259090');
    expect(JSON.stringify(hsnWhere)).toContain('"hsnCode"');
  });

  it('handles leading/trailing spaces without breaking', () => {
    const parsed = parseProductSearchQuery('   frp   600 x 600   ');
    expect(parsed.tokens).toEqual(['frp', '600x600']);
  });
});
