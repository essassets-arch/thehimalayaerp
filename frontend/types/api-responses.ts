/**
 * Standard API response envelope definitions for NestJS backend & Next.js bridge routes.
 */

/** Standard paginated API list envelope */
export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

/** Standard single entity API response envelope */
export interface ApiSingleResponse<T> {
  data: T;
  message?: string;
}

/** Standard API error response */
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}

/** Standard API mutation (POST/PUT/PATCH/DELETE) response */
export interface ApiMutationResponse<T = Record<string, unknown>> {
  success: boolean;
  message?: string;
  data?: T;
  id?: string;
}
