export const DEFAULT_PAGE_LIMIT = 50;
export const MAX_PAGE_LIMIT = 100;

export interface ParsedPagination {
  hasExplicitPagination: boolean;
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export function parsePaginationParams(
  query: {
    page?: string | number;
    limit?: string | number;
    pageSize?: string | number;
    take?: string | number;
    paginate?: string | boolean;
  } = {},
  defaultLimit = DEFAULT_PAGE_LIMIT,
  maxLimit = MAX_PAGE_LIMIT,
): ParsedPagination {
  const hasExplicitPagination =
    query.page !== undefined ||
    query.limit !== undefined ||
    query.pageSize !== undefined ||
    query.take !== undefined ||
    query.paginate === true ||
    query.paginate === 'true';

  const rawPage = Number(query.page);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;

  const rawLimit = Number(query.limit ?? query.pageSize ?? query.take);
  const baseLimit =
    Number.isFinite(rawLimit) && rawLimit >= 1
      ? Math.floor(rawLimit)
      : defaultLimit;
  const limit = Math.min(maxLimit, Math.max(1, baseLimit));

  return {
    hasExplicitPagination,
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function formatPaginatedResult<T>(
  items: T[],
  total: number,
  pagination: ParsedPagination,
) {
  if (!pagination.hasExplicitPagination) {
    return items;
  }
  return {
    items,
    data: items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      pageSize: pagination.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
    },
  };
}
