export type ActionResult<T = undefined> = {
  success: boolean;
  data?: T;
  code?: string;
  meta?: Record<string, unknown>;
  errorMessage?: string;
};
