import { Router } from "express";
import { ReviewController } from "../controllers/reviewController";
import { validateRequiredFields } from "../middleware/authMiddleware";

const router = Router();

// POST /api/reviews - Submit review rubrics evaluation
router.post(
  "/",
  validateRequiredFields(["paperId", "reviewerId"]),
  ReviewController.submitReview
);

// POST /api/reviews/assist - Review assistant comments using AI
router.post("/assist", ReviewController.assistReview);

export default router;
