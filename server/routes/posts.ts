import { Router } from "express";
import { PostController } from "../controllers/postController";
import { validateRequiredFields } from "../middleware/authMiddleware";

const router = Router();

// GET /api/posts - Get all author conference debrief posts
router.get("/", PostController.listPosts);

// POST /api/posts - Create an author conference debrief post
router.post(
  "/",
  validateRequiredFields(["authorName", "title", "content"]),
  PostController.createPost
);

// POST /api/posts/:id/like - Like or endorse an author review post
router.post("/:id/like", PostController.toggleLike);

// POST /api/posts/:id/response - Reviewer leaves a response/comment
router.post(
  "/:id/response",
  validateRequiredFields(["reviewerName", "comment"]),
  PostController.addResponse
);

// POST /api/posts/ai-summary - AI Executive Synthesis
router.post("/ai-summary", PostController.generateAiSummary);

export default router;
