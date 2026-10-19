export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}
