import { Request, Response, NextFunction } from "express";

/**
 * Lightweight structured request logger
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (!req.originalUrl.startsWith("/@vite") && !req.originalUrl.startsWith("/src")) {
      console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
}
