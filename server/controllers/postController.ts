import { Request, Response } from "express";
import { getDbState, saveDbState } from "../services/dbService";
import { AiService } from "../services/aiService";
import { AuthorPost, ReviewerResponse } from "../types";

export class PostController {
  /**
   * GET /api/posts
   * Get all author conference debrief posts
   */
  static listPosts(req: Request, res: Response) {
    const state = getDbState();
    return res.json(state.posts || []);
  }

  /**
   * POST /api/posts
   * Create an author conference debrief post
   */
  static createPost(req: Request, res: Response) {
    const {
      authorName,
      authorEmail,
      authorInstitution,
      conferenceId,
      conferenceTitle,
      title,
      content,
      rating,
      sentiment,
      tags,
      sessionAttended,
      paperTitle,
    } = req.body;

    if (!authorName || !title || !content) {
      return res.status(400).json({ error: "authorName, title, and content are required." });
    }

    const state = getDbState();
    const conf = state.conferences.find((c) => c.id === conferenceId);

    const newPost: AuthorPost = {
      id: `post-${Date.now()}`,
      authorName: authorName.trim(),
      authorEmail: authorEmail?.trim() || "author@confhub.saas",
      authorInstitution: authorInstitution || "Academic Research Institution",
      conferenceId: conferenceId || (state.conferences[0]?.id || "conf-1"),
      conferenceTitle: conferenceTitle || (conf?.title || "IHCAST-2026"),
      title: title.trim(),
      content: content.trim(),
      rating: Number(rating) || 5,
      sentiment: sentiment || "Highly Productive",
      tags: Array.isArray(tags) && tags.length > 0 ? tags : ["Conference Review", "Session Feedback"],
      sessionAttended: sessionAttended || "General Conference Track",
      paperTitle: paperTitle || undefined,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      likedBy: [],
      reviewerResponses: [],
    };

    if (!state.posts) {
      state.posts = [];
    }

    state.posts.unshift(newPost);
    saveDbState(state);

    return res.status(201).json(newPost);
  }

  /**
   * POST /api/posts/:id/like
   * Like or endorse an author review post
   */
  static toggleLike(req: Request, res: Response) {
    const { id } = req.params;
    const { userId } = req.body;
    const state = getDbState();

    const post = state.posts?.find((p) => p.id === id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (!post.likedBy) {
      post.likedBy = [];
    }

    const identifier = userId || "anonymous-reviewer";
    const index = post.likedBy.indexOf(identifier);

    if (index > -1) {
      post.likedBy.splice(index, 1);
      post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
    } else {
      post.likedBy.push(identifier);
      post.likesCount = (post.likesCount || 0) + 1;
    }

    saveDbState(state);
    return res.json({ likesCount: post.likesCount, likedBy: post.likedBy });
  }

  /**
   * POST /api/posts/:id/response
   * Reviewer leaves a response/comment to author debrief
   */
  static addResponse(req: Request, res: Response) {
    const { id } = req.params;
    const { reviewerId, reviewerName, comment } = req.body;

    if (!comment || !reviewerName) {
      return res.status(400).json({ error: "reviewerName and comment are required." });
    }

    const state = getDbState();
    const post = state.posts?.find((p) => p.id === id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const newResponse: ReviewerResponse = {
      id: `rr-${Date.now()}`,
      reviewerId: reviewerId || "rev-committee",
      reviewerName: reviewerName.trim(),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!post.reviewerResponses) {
      post.reviewerResponses = [];
    }

    post.reviewerResponses.push(newResponse);
    saveDbState(state);

    return res.status(201).json(newResponse);
  }

  /**
   * POST /api/posts/ai-summary
   * AI Executive Synthesis of all author conference reviews
   */
  static async generateAiSummary(req: Request, res: Response) {
    const state = getDbState();
    const posts = state.posts || [];

    const result = await AiService.generateDebriefSummary(posts);
    return res.json(result);
  }
}
