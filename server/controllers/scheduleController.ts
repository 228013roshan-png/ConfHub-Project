import { Request, Response } from "express";
import { getDbState, saveDbState } from "../services/dbService";

export class ScheduleController {
  /**
   * GET /api/schedule
   * Get all schedule items
   */
  static getSchedule(req: Request, res: Response) {
    const state = getDbState();
    return res.json({ schedule: state.schedule || [] });
  }

  /**
   * POST /api/schedule/save
   * Save complete interactive timeline schedule slots
   */
  static saveSchedule(req: Request, res: Response) {
    const { schedule } = req.body;
    if (!Array.isArray(schedule)) {
      return res.status(400).json({ error: "Invalid schedule packet: must be an array." });
    }

    const state = getDbState();
    state.schedule = schedule;
    saveDbState(state);

    return res.json({ success: true, schedule });
  }
}
