export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public meta?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}
