import { Request, Response } from "express";
import {
  getUserData,
  saveUserData,
  getReviewers,
  saveReviewers,
} from "../services/dbService";
import { StoredUser } from "../types";
import {
  generateOtp,
  verifyOtp,
  clearOtp,
} from "../services/otpService";
import {
  sendVerificationCode,
} from "../services/emailService";

const pendingRegistrations = new Map<string, StoredUser>();

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
      return res.status(500).json({
        error: error.message || "Failed to retrieve users.",
      });
    }
  }

  /**
   * POST /api/users/register
   * Start registration and persist the user only after email verification.
   */
  static async register(req: Request, res: Response) {
    const {
      name,
      email,
      password,
      role,
      institution,
      domains,
      designation,
    } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({
        error: "Name, email, password, and role are required.",
      });
    }

    if (role === "admin") {
      return res.status(403).json({
        error:
          "Administrator registration is disabled. Only existing administrators may log in.",
      });
    }

    const data = getUserData();
    const normalizedEmail = email.trim().toLowerCase();

    const existing = data.users.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (existing) {
      return res.status(400).json({
        error:
          "An account with this email is already registered. Please log in or use another email.",
      });
    }

    const roleClean =
      role === "reviewer" ||
      role === "author" ||
      role === "student"
        ? role
        : "student";

    const userDomains = Array.isArray(domains)
      ? domains
      : domains
      ? [domains]
      : [];

    const assignedToken = `cfh_tok_${Math.random()
      .toString(36)
      .substring(2, 10)}${Date.now().toString(36)}`;

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
        : roleClean === "student"
        ? "Student Delegate / Researcher"
        : "Author / Presenter",

      domains: userDomains,
      status: "Active",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),

      permissions:
        roleClean === "reviewer"
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

    try {
      const code = generateOtp(normalizedEmail);
      await sendVerificationCode(normalizedEmail, code);
      pendingRegistrations.set(normalizedEmail, newUser);

      return res.status(202).json({
        requiresVerification: true,
        email: normalizedEmail,
        role: roleClean,
        message: "A verification code has been sent to your email.",
      });
    } catch (error) {
      clearOtp(normalizedEmail);
      pendingRegistrations.delete(normalizedEmail);
      console.error("Failed to send registration verification email:", error);
      return res.status(500).json({
        error: "Unable to send verification email. Please try again.",
      });
    }
  }

  /**
   * POST /api/users/login
   *
   * Validate credentials and return the authenticated user directly.
   */
  static async login(req: Request, res: Response) {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required to log in.",
      });
    }

    const data = getUserData();
    const normalizedEmail = email.trim().toLowerCase();

    const user = data.users.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (!user) {
      return res.status(401).json({
        error:
          "Account not found. Please sign up to create your account.",
      });
    }

    if (user.password && user.password !== password.trim()) {
      return res.status(401).json({
        error: "Invalid password for this account.",
      });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        error: `Access denied. This account is registered with role '${user.role}', but you attempted to log in as '${role}'.`,
      });
    }

    if (!user.token) {
      user.token = `cfh_tok_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    }
    user.lastLogin = new Date().toISOString();
    saveUserData(data);
    const { password: _, ...safeUser } = user;
    return res.json({ user: safeUser, token: user.token, message: "Authentication successful." });
  }

  /**
   * POST /api/users/verify-code
   *
   * Verify a registration OTP, then persist and return the new account.
   */
  static async verifyCode(req: Request, res: Response) {
    const { email, code, role } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error:
          "Email and verification code are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const valid = verifyOtp(
      normalizedEmail,
      code.trim()
    );

    if (!valid) {
      return res.status(401).json({
        error: "Invalid or expired verification code.",
      });
    }

    const user = pendingRegistrations.get(normalizedEmail);

    if (!user) {
      return res.status(404).json({
        error: "No pending registration could be found.",
      });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        error:
          "The selected role does not match this account.",
      });
    }

    const data = getUserData();
    if (data.users.some((existing) => existing.email.toLowerCase() === normalizedEmail)) {
      pendingRegistrations.delete(normalizedEmail);
      return res.status(409).json({ error: "This account has already been registered." });
    }
    data.users.push(user);
    saveUserData(data);
    pendingRegistrations.delete(normalizedEmail);

    if (user.role === "reviewer") {
      try {
        const reviewerData = getReviewers();
        if (!reviewerData.reviewers.some((reviewer) => reviewer.email.toLowerCase() === normalizedEmail)) {
          reviewerData.reviewers.push({
            id: `rev-${Date.now()}`,
            name: user.name,
            email: user.email,
            domains: user.domains?.length ? user.domains : ["Artificial Intelligence", "General Computer Science"],
          });
          saveReviewers(reviewerData.reviewers);
        }
      } catch (error) {
        console.error("Error syncing reviewer to reviewer.json:", error);
      }
    }

    const {
      password: _,
      ...safeUser
    } = user;

    return res.json({
      user: safeUser,
      token: user.token,
      message: "Registration verified and completed successfully.",
    });
  }
}
