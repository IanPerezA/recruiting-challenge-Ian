import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async route handler so a rejected promise is forwarded to Express's
 * error middleware. Express 4 does not await handlers, so without this an async
 * throw becomes an unhandled rejection and the client hangs.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
