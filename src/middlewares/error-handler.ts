import type { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../lib/errors.js';

/**
 * Terminal error handler. Validation failures become a 400 with their code;
 * malformed JSON bodies (which Express tags with a 400 status) also become a
 * clean 400; everything else is logged and returned as a generic 500 so we
 * never leak internals.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof BadRequestError) {
    res.status(err.status).json({ error: err.code, detail: err.message });
    return;
  }

  const status = (err as { status?: number; statusCode?: number }).status ?? (err as { statusCode?: number }).statusCode;
  if (status === 400) {
    res.status(400).json({ error: 'invalid_json' });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'internal_error' });
}
