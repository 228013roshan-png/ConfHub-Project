import { Request, Response } from "express";
import { getUserData, saveUserData, getReviewers, saveReviewers } from "../services/dbService";
import { StoredUser } from "../types";

export class AuthController {
  /**
   * GET /api/users
   * Return all registered users (excluding raw passwords)
   */
  static listUsers(req: Request, res: Response) {
    try {
      const data = getUserData();
      const safeUsers = data.users.map(({ password, ...rest }) => rest);
      return res.json({ users: safeUsers });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to retrieve users." });
    }
  }

  /**
   * POST /api/users/register
   * Register a new user and persist directly to database/user.json
   */
  static register(req: Request, res: Response) {
    const { name, email, password, role, institution, domains, designation } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: "Name, email, password, and role are required." });
    }

    if (role === "admin") {
      return res.status(403).json({
        error: "Administrator registration is disabled. Only existing administrators may log in.",
      });
    }

    const data = getUserData();
    const normalizedEmail = email.trim().toLowerCase();

    const existing = data.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({
        error: "An account with this email is already registered. Please log in or use another email.",
      });
    }

    const roleClean = role === "reviewer" || role === "author" || role === "student" ? role : "student";
    const userDomains = Array.isArray(domains) ? domains : domains ? [domains] : [];
    const assignedToken = `cfh_tok_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;

    const newUser: StoredUser = {
      id: `usr-${roleClean.slice(0, 3)}-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password: password.trim(),
      role: roleClean,
      token: assignedToken,
      institution: institution
        ? institution.trim()
        : roleClean === "reviewer"
        ? "Academic Review Board"
        : roleClean === "student"
        ? "University / College"
        : "Research Institution",
      designation: designation
        ? designation.trim()
        : roleClean === "reviewer"
        ? "Peer Reviewer"
        : roleClean === "admin"
        ? "Academic Chair"
        : roleClean === "student"
        ? "Student Delegate / Researcher"
        : "Author / Presenter",
      domains: userDomains,
      status: "Active",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      permissions:
        roleClean === "admin"
          ? [
              "manage_conferences",
              "manage_papers",
              "assign_reviewers",
              "accept_reject_manuscripts",
              "manage_schedule",
              "view_financials",
              "export_metadata",
            ]
          : roleClean === "reviewer"
          ? [
              "view_assigned_double_blind_papers",
              "submit_rubric_evaluations",
              "participate_in_discussions",
            ]
          : roleClean === "student"
          ? [
              "view_landing_page",
              "browse_conference_schedule",
              "purchase_student_passes",
              "view_purchased_passes",
            ]
          : [
              "submit_abstracts",
              "view_paper_review_status",
              "purchase_conference_tickets",
              "view_personal_schedule",
            ],
      submittedPapers: [],
      tickets: [],
    };

    data.users.push(newUser);
    saveUserData(data);

    // If reviewer, also sync with reviewer.json
    if (roleClean === "reviewer") {
      try {
        const reviewerData = getReviewers();
        const reviewerExists = reviewerData.reviewers.some((r) => r.email.toLowerCase() === normalizedEmail);
        if (!reviewerExists) {
          reviewerData.reviewers.push({
            id: `rev-${Date.now()}`,
            name: newUser.name,
            email: newUser.email,
            domains:
              newUser.domains && newUser.domains.length > 0
                ? newUser.domains
                : ["Artificial Intelligence", "General Computer Science"],
          });
          saveReviewers(reviewerData.reviewers);
        }
      } catch (e) {
        console.error("Error syncing reviewer to reviewer.json:", e);
      }
    }

    const { password: _, ...safeUser } = newUser;
    return res.status(201).json({
      user: safeUser,
      token: newUser.token,
      message: "User successfully registered and saved to user.json",
    });
  }

  /**
   * POST /api/users/login
   * Authenticate user against database/user.json credentials
   */
  static login(req: Request, res: Response) {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required to log in." });
    }

    const data = getUserData();
    const normalizedEmail = email.trim().toLowerCase();

    const user = data.users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({
        error: "Account not found. Please sign up to create your account",
      });
    }

    // Password verification
    if (user.password && user.password !== password.trim()) {
      return res.status(401).json({ error: "Invalid password for this account. Please verify your password." });
    }

    // Check role match if requested
    if (role && user.role !== role) {
      return res.status(403).json({
        error: `Access Denied: This account is registered with role '${user.role.toUpperCase()}', but you attempted to log in as '${role.toUpperCase()}'. Please select the '${user.role}' role.`,
      });
    }

    // Ensure user has an assigned token
    if (!user.token) {
      user.token = `cfh_tok_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date().toISOString();
    saveUserData(data);

    const { password: _, ...safeUser } = user;
    return res.json({
      user: safeUser,
      token: user.token,
      message: "Login successful",
    });
  }
}
