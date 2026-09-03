import { Request, Response } from "express";
import { getDbState, saveDbState } from "../services/dbService";
import { AiService } from "../services/aiService";
import { Paper } from "../types";

export class PaperController {
  /**
   * POST /api/papers
   * Submit a new paper with AI domain classification
   */
  static async submitPaper(req: Request, res: Response) {
    const { conferenceId, title, authorName, authorEmail, abstractText } = req.body;
    if (!conferenceId || !title || !authorName || !abstractText) {
      return res.status(400).json({ error: "All fields are required to submit." });
    }

    const state = getDbState();

    // Auto-analyze scientific domain tags using Gemini or fallback
    const domainTags = await AiService.suggestDomainTags(title, abstractText);

    const newPaper: Paper = {
      id: `paper-${Date.now()}`,
      conferenceId,
      title,
      authorName,
      authorEmail,
      abstractText,
      status: "Pending",
      domainTags,
      assignedReviewerId: null,
      fileSize: `${(Math.random() * 3 + 1.2).toFixed(1)} MB`,
      submittedAt: new Date().toISOString(),
    };

    state.papers.push(newPaper);
    saveDbState(state);

    return res.status(201).json(newPaper);
  }

  /**
   * POST /api/papers/:id/auto-match
   * Match paper with suitable reviewer based on domain overlap
   */
  static async autoMatchReviewer(req: Request, res: Response) {
    const { id } = req.params;
    const state = getDbState();
    const paper = state.papers.find((p) => p.id === id);
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    let bestReviewerId: string | null = null;
    let highestScore = -1;

    for (const r of state.reviewers) {
      const intersection = r.domains.filter((d: string) => paper.domainTags.includes(d));
      if (intersection.length > highestScore) {
        highestScore = intersection.length;
        bestReviewerId = r.id;
      }
    }

    // Fallback to first available reviewer if score is 0
    if (!bestReviewerId || highestScore === 0) {
      bestReviewerId = state.reviewers[0]?.id || null;
    }

    paper.assignedReviewerId = bestReviewerId;
    paper.status = "Under Review";
    saveDbState(state);

    const reviewerObj = state.reviewers.find((r) => r.id === bestReviewerId);
    return res.json({
      success: true,
      matchedReviewer: reviewerObj || null,
      score: highestScore,
      paper,
    });
  }

  /**
   * POST /api/papers/:id/assign
   * Manual reviewer assignment
   */
  static assignReviewer(req: Request, res: Response) {
    const { id } = req.params;
    const { reviewerId } = req.body;
    const state = getDbState();
    const paper = state.papers.find((p) => p.id === id);
    if (!paper) return res.status(404).json({ error: "Paper not found" });

    paper.assignedReviewerId = reviewerId || null;
    paper.status = reviewerId ? "Under Review" : "Pending";
    saveDbState(state);
    return res.json(paper);
  }

  /**
   * DELETE /api/papers/:id/assign or POST /api/papers/:id/unassign
   * Unassign/delete reviewer assignment from paper
   */
  static unassignReviewer(req: Request, res: Response) {
    const { id } = req.params;
    const state = getDbState();
    const paper = state.papers.find((p) => p.id === id);
    if (!paper) return res.status(404).json({ error: "Paper not found" });

    paper.assignedReviewerId = null;
    if (paper.status === "Under Review") {
      paper.status = "Pending";
    }
    saveDbState(state);
    return res.json({ success: true, message: `Reviewer unassigned from paper #${id}`, paper });
  }

  /**
   * POST /api/papers/:id/status
   * Update paper final status (Accepted / Rejected / Pending / Under Review)
   */
  static updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const state = getDbState();
    const paper = state.papers.find((p) => p.id === id);
    if (!paper) return res.status(404).json({ error: "Paper not found." });

    paper.status = status;
    saveDbState(state);
    return res.json(paper);
  }
}
