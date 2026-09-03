import { Router } from "express";
import { IndexingController } from "../controllers/indexingController";

const router = Router();

// GET /api/indexing/:paperId/export - Scholarly meta exporter
router.get("/:paperId/export", IndexingController.exportMetadata);

export default router;
