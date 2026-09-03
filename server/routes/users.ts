import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { validateRequiredFields } from "../middleware/authMiddleware";

const router = Router();

// GET /api/users - Return all registered users
router.get("/", AuthController.listUsers);

// POST /api/users/register - Register a new user
router.post(
  "/register",
  validateRequiredFields(["name", "email", "password", "role"]),
  AuthController.register
);

// POST /api/users/login - Authenticate user
router.post(
  "/login",
  validateRequiredFields(["email", "password"]),
  AuthController.login
);

export default router;
