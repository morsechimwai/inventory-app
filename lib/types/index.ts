export type ActionResult<T = undefined> = {
  success: boolean;
  data?: T;
  message?: string;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApiError = {
  code: string;
  message: string;
};
