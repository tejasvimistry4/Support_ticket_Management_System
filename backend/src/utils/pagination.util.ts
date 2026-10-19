export interface PaginationOptions {
  page?: number;
  limit?: number;
  defaultLimit?: number;
  maxLimit?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export function getPaginationParams(options: PaginationOptions = {}): PaginationParams {
  const defaultLimit = options.defaultLimit ?? 10;
  const maxLimit = options.maxLimit ?? 100;

  const rawPage = options.page ? Number(options.page) : 1;
  const rawLimit = options.limit ? Number(options.limit) : defaultLimit;

  const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
  const limit = Math.max(1, Math.min(maxLimit, isNaN(rawLimit) ? defaultLimit : rawLimit));
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    take: limit,
  };
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = limit > 0 ? Math.ceil(total / limit) || 1 : 1;

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}
