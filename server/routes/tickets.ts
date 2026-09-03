import { Router } from "express";
import { TicketController } from "../controllers/ticketController";
import { validateRequiredFields } from "../middleware/authMiddleware";

const router = Router();

// POST /api/tickets/purchase - Order a new delegation pass
router.post(
  "/purchase",
  validateRequiredFields(["userName", "userEmail", "passType", "price"]),
  TicketController.purchaseTicket
);

// POST /api/tickets/verify - Verify mock payment transitions
router.post(
  "/verify",
  validateRequiredFields(["orderId"]),
  TicketController.verifyTicket
);

// POST /api/tickets/manual-record - Admin adds offline registration record
router.post(
  "/manual-record",
  validateRequiredFields(["userName", "userEmail", "passType", "price"]),
  TicketController.manualRecord
);

// POST /api/tickets/:id/update-status - Admin updates order status
router.post(
  "/:id/update-status",
  validateRequiredFields(["status"]),
  TicketController.updateStatus
);

// DELETE /api/tickets/:id - Admin deletes order from ledger
router.delete("/:id", TicketController.deleteOrder);

export default router;
