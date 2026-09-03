import { Request, Response, NextFunction } from "express";

/**
 * Centralized Error Handling Middleware for Express
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
}
