import {
  parsePaginationParams,
  formatPaginatedResult,
  MAX_PAGE_LIMIT,
} from './pagination.util';

describe('pagination.util', () => {
  it('clamps excessive limit=100000 to MAX_PAGE_LIMIT (100)', () => {
    const parsed = parsePaginationParams({ page: '2', limit: '100000' });
    expect(parsed.hasExplicitPagination).toBe(true);
    expect(parsed.page).toBe(2);
    expect(parsed.limit).toBe(MAX_PAGE_LIMIT);
    expect(parsed.skip).toBe(100);
    expect(parsed.take).toBe(100);
  });

  it('defaults bare calls to bounded limit without breaking array shape', () => {
    const parsed = parsePaginationParams({});
    expect(parsed.hasExplicitPagination).toBe(false);
    expect(parsed.take).toBe(50);
    const res = formatPaginatedResult([{ id: 1 }], 1, parsed);
    expect(Array.isArray(res)).toBe(true);
  });

  it('returns structured pagination envelope when page or limit is passed', () => {
    const parsed = parsePaginationParams({ page: 1, limit: 25 });
    const res: any = formatPaginatedResult([{ id: 1 }], 240, parsed);
    expect(res.items).toHaveLength(1);
    expect(res.data).toHaveLength(1);
    expect(res.pagination).toEqual({
      page: 1,
      limit: 25,
      pageSize: 25,
      total: 240,
      totalPages: 10,
    });
  });
});
