import { Request, Response } from "express";
import { getDbState } from "../services/dbService";

export class DbController {
  /**
   * GET /api/db
   * Returns unified application data state
   */
  static getFullState(req: Request, res: Response) {
    try {
      const state = getDbState();
      return res.json(state);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to load database state." });
    }
  }
}
