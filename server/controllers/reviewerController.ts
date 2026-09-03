import { Request, Response } from "express";
import { getDbState, saveDbState } from "../services/dbService";
import { Reviewer } from "../types";

export class ReviewerController {
  /**
   * GET /api/reviewers
   * Get all registered reviewers
   */
  static listReviewers(req: Request, res: Response) {
    const state = getDbState();
    return res.json({ reviewers: state.reviewers || [] });
  }

  /**
   * POST /api/reviewers
   * Register a new peer-reviewer
   */
  static registerReviewer(req: Request, res: Response) {
    const { name, email, domains } = req.body;

    if (!name || !email || !domains) {
      return res.status(400).json({ error: "Name, email, and domains are required to register a reviewer." });
    }

    const state = getDbState();
    const exists = state.reviewers.some((r) => r.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      return res.status(400).json({ error: "This email is already registered as a peer-reviewer." });
    }

    const newReviewer: Reviewer = {
      id: `rev-${Date.now()}`,
      name,
      email,
      domains: Array.isArray(domains) ? domains : [domains],
    };

    state.reviewers.push(newReviewer);
    saveDbState(state);

    return res.status(201).json(newReviewer);
  }
}
