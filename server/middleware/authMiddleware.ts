import { Request, Response, NextFunction } from "express";

/**
 * Middleware to ensure request body contains required fields
 */
export function validateRequiredFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = fields.filter((f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === "");
    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required field(s): ${missing.join(", ")}`,
      });
    }
    next();
  };
}

/**
 * Basic role checking middleware
 */
export function requireRole(allowedRoles: Array<"admin" | "reviewer" | "author">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.headers["x-user-role"] as string;
    if (role && !allowedRoles.includes(role as any)) {
      return res.status(403).json({
        error: `Access Denied: Role '${role}' is not authorized to perform this operation.`,
      });
    }
    next();
  };
}
