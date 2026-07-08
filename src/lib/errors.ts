/**
 * Error that maps to an HTTP 400. Thrown by the validation helpers and caught
 * by the terminal error handler, so every input-contract failure takes one
 * consistent path to a 400 response instead of leaking a 500.
 */
export class BadRequestError extends Error {
  readonly status = 400;
  readonly code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = 'BadRequestError';
    this.code = code;
  }
}
