import { Router } from "express";
import { PaperController } from "../controllers/paperController";
import { validateRequiredFields } from "../middleware/authMiddleware";

const router = Router();

// POST /api/papers - Submit a new paper
router.post(
  "/",
  validateRequiredFields(["conferenceId", "title", "authorName", "abstractText"]),
  PaperController.submitPaper
);

// POST /api/papers/:id/auto-match - Match paper with suitable reviewer
router.post("/:id/auto-match", PaperController.autoMatchReviewer);

// POST /api/papers/:id/assign - Manual reviewer assignment
router.post("/:id/assign", PaperController.assignReviewer);

// DELETE /api/papers/:id/assign or POST /api/papers/:id/unassign - Remove reviewer assignment
router.delete("/:id/assign", PaperController.unassignReviewer);
router.post("/:id/unassign", PaperController.unassignReviewer);

// POST /api/papers/:id/status - Update paper final status
router.post(
  "/:id/status",
  validateRequiredFields(["status"]),
  PaperController.updateStatus
);

export default router;
