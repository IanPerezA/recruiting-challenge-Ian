import type { Request, Response, NextFunction } from 'express';

/**
 * Terminal error handler. Logs the error and returns a generic 500 so we never
 * leak internals to the client.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
}
