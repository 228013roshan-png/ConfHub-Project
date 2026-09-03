import { Request, Response } from "express";
import { getDbState, saveDbState } from "../services/dbService";
import { AiService } from "../services/aiService";
import { Review } from "../types";

export class ReviewController {
  /**
   * POST /api/reviews
   * Submit rubric evaluation and update paper status
   */
  static submitReview(req: Request, res: Response) {
    const { paperId, reviewerId, originality, clarity, methodology, overallDecision, detailedComments } = req.body;
    if (!paperId || !reviewerId) {
      return res.status(400).json({ error: "Missing required review indices." });
    }

    const state = getDbState();
    const paper = state.papers.find((p) => p.id === paperId);
    if (!paper) {
      return res.status(404).json({ error: "Manuscript not found." });
    }

    // Strictly enforce reviewer assignment by administrator:
    // A reviewer can only review manuscripts they are assigned to.
    const isAssigned = paper.assignedReviewerId === reviewerId ||
      state.reviewers.some(
        (r) => (r.id === reviewerId || r.email === reviewerId) && (paper.assignedReviewerId === r.id || paper.assignedReviewerId === r.email)
      );

    if (!isAssigned) {
      return res.status(403).json({
        error: "Permission Denied: You can only evaluate manuscripts explicitly assigned to you by the conference administrator.",
      });
    }

    const newReview: Review = {
      id: `rev-res-${Date.now()}`,
      paperId,
      reviewerId,
      originality: Number(originality) || 3,
      clarity: Number(clarity) || 3,
      methodology: Number(methodology) || 3,
      overallDecision: overallDecision || "Neutral",
      detailedComments: detailedComments || "",
      submittedAt: new Date().toISOString(),
    };

    const existingIndex = state.reviews.findIndex(
      (r) => r.paperId === paperId && (r.reviewerId === reviewerId)
    );
    if (existingIndex >= 0) {
      state.reviews[existingIndex] = newReview;
    } else {
      state.reviews.push(newReview);
    }

    // Update paper status appropriately
    if (overallDecision === "Accept") paper.status = "Accepted";
    else if (overallDecision === "Reject") paper.status = "Rejected";
    else paper.status = "Under Review";

    saveDbState(state);
    return res.status(201).json(newReview);
  }

  /**
   * POST /api/reviews/assist
   * AI-assisted peer-review comment drafting
   */
  static async assistReview(req: Request, res: Response) {
    const { title, abstractText, originality, clarity, methodology, overallDecision } = req.body;

    const feedback = await AiService.draftReviewAssistFeedback({
      title: title || "Submitted Manuscript",
      abstractText: abstractText || "",
      originality: Number(originality) || 3,
      clarity: Number(clarity) || 3,
      methodology: Number(methodology) || 3,
      overallDecision: overallDecision || "Neutral",
    });

    return res.json({ feedback });
  }
}
