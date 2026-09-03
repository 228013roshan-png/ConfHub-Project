import { Router } from "express";
import { ConferenceController } from "../controllers/conferenceController";
import { validateRequiredFields } from "../middleware/authMiddleware";

const router = Router();

// POST /api/conferences - Create a new conference
router.post(
  "/",
  validateRequiredFields(["title", "date"]),
  ConferenceController.createConference
);

// PUT /api/conferences/:id/pricing - Update conference ticket tiers & pricing
router.put(
  "/:id/pricing",
  ConferenceController.updateConferencePricing
);

// PUT /api/conferences/:id - Update conference details
router.put(
  "/:id",
  ConferenceController.updateConference
);

// DELETE /api/conferences/:id - Delete conference assembly
router.delete(
  "/:id",
  ConferenceController.deleteConference
);

export default router;

