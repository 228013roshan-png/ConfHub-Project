import { Router } from "express";
import { ScheduleController } from "../controllers/scheduleController";

const router = Router();

// GET /api/schedule - Retrieve schedule
router.get("/", ScheduleController.getSchedule);

// POST /api/schedule/save - Save complete interactive timeline schedule slots
router.post("/save", ScheduleController.saveSchedule);

export default router;
