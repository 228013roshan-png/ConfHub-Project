import { Router } from "express";
import { DbController } from "../controllers/dbController";

const router = Router();

// GET /api/db - Unified application collection state fetch
router.get("/", DbController.getFullState);

export default router;
