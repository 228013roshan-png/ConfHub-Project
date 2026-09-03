import { Router } from "express";
import { ReviewerController } from "../controllers/reviewerController";
import { validateRequiredFields } from "../middleware/authMiddleware";

const router = Router();

// GET /api/reviewers - List all reviewers
router.get("/", ReviewerController.listReviewers);

// POST /api/reviewers - Register a new peer-reviewer
router.post(
  "/",
  validateRequiredFields(["name", "email", "domains"]),
  ReviewerController.registerReviewer
);

export default router;
