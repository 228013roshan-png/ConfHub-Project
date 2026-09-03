import { Request, Response } from "express";
import { getDbState, saveDbState, getUserData, saveUserData } from "../services/dbService";
import { Order } from "../types";

export class TicketController {
  /**
   * POST /api/tickets/purchase
   * Create a delegation pass order - requires authenticated user token
   */
  static purchaseTicket(req: Request, res: Response) {
    // 1. Authenticate user: user that is not logged in should not be able to access the ticket process
    const authHeader = req.headers.authorization;
    const token =
      (authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null) ||
      (req.headers["x-auth-token"] as string) ||
      req.body.userToken ||
      req.body.token;

    if (!token) {
      return res.status(401).json({
        error: "Authentication required: You must be logged in with a valid account token to access the ticket purchasing process.",
      });
    }

    const userData = getUserData();
    const authenticatedUser = userData.users.find((u) => u.token && u.token === token.trim());

    if (!authenticatedUser) {
      return res.status(401).json({
        error: "Unauthorized: Invalid or expired session token. Please log in to access the ticket purchasing process.",
      });
    }

    const { userName, userEmail, conferenceId, passType, price, currency, gateway, tierId } = req.body;
    
    // Resolve delegate identity from authenticated user
    const resolvedEmail = (userEmail || authenticatedUser.email).trim().toLowerCase();
    const resolvedName = (userName || authenticatedUser.name).trim();

    if (!passType) {
      return res.status(400).json({ error: "Missing required passType selection." });
    }

    const state = getDbState();
    const orderId = `ord-${Date.now()}`;
    const targetConfId = conferenceId || (state.conferences[0]?.id || "conf-1");

    let finalPrice = Number(price);
    let finalCurrency = currency || "NPR";

    // Dynamic database price lookup from conference_hall.json
    const conf = state.conferences.find((c) => c.id === targetConfId);
    if (conf && Array.isArray(conf.ticketTiers) && conf.ticketTiers.length > 0) {
      const matchedTier = conf.ticketTiers.find(
        (t) => (tierId && t.id === tierId) || t.name.toLowerCase() === passType.toLowerCase()
      );
      if (matchedTier) {
        finalPrice = matchedTier.price;
        finalCurrency = matchedTier.currency;
      }
    }

    if (isNaN(finalPrice) || finalPrice <= 0) {
      finalPrice = 1500;
    }

    const newOrder: Order = {
      id: orderId,
      userName: resolvedName,
      userEmail: resolvedEmail,
      conferenceId: targetConfId,
      passType,
      price: finalPrice,
      currency: finalCurrency,
      gateway: gateway || "eSewa",
      status: "Pending",
      trnRef: "",
      createdAt: new Date().toISOString(),
    };

    state.orders.push(newOrder);
    saveDbState(state);

    // Also sync with user.json if user exists
    try {
      const uData = getUserData();
      const user = uData.users.find(
        (u) => u.email.toLowerCase() === resolvedEmail
      );
      if (user) {
        if (!user.tickets) user.tickets = [];
        if (!user.tickets.includes(orderId)) {
          user.tickets.push(orderId);
        }
        saveUserData(uData);
      }
    } catch (e) {
      console.error("Error linking ticket to user in user.json:", e);
    }

    return res.status(201).json(newOrder);
  }

  /**
   * POST /api/tickets/verify
   * Verify mock/real gateway transaction
   */
  static verifyTicket(req: Request, res: Response) {
    const { orderId, success, trnRef } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "orderId is required for payment verification." });
    }

    const isSuccess = success === true || success === "true" || success === 1 || success === undefined;
    const state = getDbState();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: "Purchase record was not resolved." });
    }

    order.status = isSuccess ? "Completed" : "Failed";
    order.trnRef = trnRef || (isSuccess ? `TX-VERIFIED-${Math.floor(Math.random() * 900000) + 100000}` : "TX-DECLINED");
    saveDbState(state);

    // Sync with user.json if user exists
    try {
      const userData = getUserData();
      const user = userData.users.find(
        (u) => u.email.toLowerCase() === order.userEmail.toLowerCase()
      );
      if (user) {
        if (!user.tickets) user.tickets = [];
        if (isSuccess && !user.tickets.includes(order.id)) {
          user.tickets.push(order.id);
        }
        saveUserData(userData);
      }
    } catch (e) {
      console.error("Error syncing ticket with user:", e);
    }

    return res.json(order);
  }

  /**
   * POST /api/tickets/manual-record
   * Admin registers offline or on-desk attendee
   */
  static manualRecord(req: Request, res: Response) {
    const { userName, userEmail, conferenceId, passType, price, currency, gateway, status, trnRef } = req.body;
    if (!userName || !userEmail || !passType || !price) {
      return res.status(400).json({ error: "userName, userEmail, passType, and price are required." });
    }

    const state = getDbState();
    const orderId = `ord-${Date.now()}`;

    const newOrder: Order = {
      id: orderId,
      userName: userName.trim(),
      userEmail: userEmail.trim(),
      conferenceId: conferenceId || (state.conferences[0]?.id || "conf-1"),
      passType,
      price: Number(price),
      currency: currency || "NPR",
      gateway: gateway || "On-Site Cash / Bank Transfer",
      status: status || "Completed",
      trnRef: trnRef?.trim() || `MANUAL-${Math.floor(Math.random() * 900000) + 100000}`,
      createdAt: new Date().toISOString(),
    };

    state.orders.unshift(newOrder);
    saveDbState(state);

    // Sync with user.json
    try {
      const userData = getUserData();
      const user = userData.users.find(
        (u) => u.email.toLowerCase() === userEmail.trim().toLowerCase()
      );
      if (user) {
        if (!user.tickets) user.tickets = [];
        if (!user.tickets.includes(orderId)) {
          user.tickets.push(orderId);
        }
        saveUserData(userData);
      }
    } catch (e) {
      console.error("Error syncing manual order to user:", e);
    }

    return res.status(201).json(newOrder);
  }

  /**
   * POST /api/tickets/:id/update-status
   * Admin overrides order status
   */
  static updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status, trnRef } = req.body;

    if (!status) {
      return res.status(400).json({ error: "status is required." });
    }

    const state = getDbState();
    const order = state.orders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ error: "Transaction record not found." });
    }

    order.status = status;
    if (trnRef !== undefined && trnRef !== "") {
      order.trnRef = trnRef;
    } else if (status === "Completed" && !order.trnRef) {
      order.trnRef = `TX-CONFIRMED-${Math.floor(Math.random() * 900000) + 100000}`;
    }

    saveDbState(state);

    // Sync with user.json
    try {
      const userData = getUserData();
      const user = userData.users.find(
        (u) => u.email.toLowerCase() === order.userEmail.toLowerCase()
      );
      if (user) {
        if (!user.tickets) user.tickets = [];
        if (status === "Completed" && !user.tickets.includes(order.id)) {
          user.tickets.push(order.id);
        } else if (status !== "Completed") {
          user.tickets = user.tickets.filter((t) => t !== order.id);
        }
        saveUserData(userData);
      }
    } catch (e) {
      console.error("Error updating user tickets:", e);
    }

    return res.json(order);
  }

  /**
   * DELETE /api/tickets/:id
   * Admin deletes a record
   */
  static deleteOrder(req: Request, res: Response) {
    const { id } = req.params;
    const state = getDbState();

    const idx = state.orders.findIndex((o) => o.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Transaction record not found." });
    }

    const deletedOrder = state.orders[idx];
    state.orders.splice(idx, 1);
    saveDbState(state);

    // Remove from user.json
    try {
      const userData = getUserData();
      const user = userData.users.find(
        (u) => u.email.toLowerCase() === deletedOrder.userEmail.toLowerCase()
      );
      if (user && user.tickets) {
        user.tickets = user.tickets.filter((t) => t !== id);
        saveUserData(userData);
      }
    } catch (e) {
      console.error("Error removing ticket from user:", e);
    }

    return res.json({ success: true, message: `Order ${id} removed from ledger.` });
  }
}
