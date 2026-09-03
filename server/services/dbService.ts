import path from "path";
import fs from "fs";
import {
  Conference,
  Paper,
  Reviewer,
  Review,
  Order,
  ScheduleItem,
  AuthorPost,
  StoredUser,
  UserDataState,
  DbState,
} from "../types";

export const DATABASE_DIR = path.join(process.cwd(), "database");

// Ensure database directory exists
if (!fs.existsSync(DATABASE_DIR)) {
  try {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
  } catch (e) {
    console.error("Error creating database directory:", e);
  }
}

// Database JSON File Paths
export const USER_FILE = path.join(DATABASE_DIR, "user.json");
export const TRANSACTION_FILE = path.join(DATABASE_DIR, "transaction.json");
export const CONFERENCE_HALL_FILE = path.join(DATABASE_DIR, "conference_hall.json");
export const ABSTRACT_PAPER_FILE = path.join(DATABASE_DIR, "abstract_paper.json");
export const REVIEWER_FILE = path.join(DATABASE_DIR, "reviewer.json");
export const REVIEW_FILE = path.join(DATABASE_DIR, "review.json");
export const POST_FILE = path.join(DATABASE_DIR, "post.json");

// Designated Single Admin User
export const DEFAULT_USERS: StoredUser[] = [
  {
    id: "usr-admin-01",
    name: "Academic Chair (Admin)",
    email: "roshankc@admin.com",
    password: "admin123",
    role: "admin",
    token: "cfh_tok_admin_7f9c2d1b84e3a502",
    designation: "Conference Chair & Program Director",
    institution: "Central Academic Board / ConfHub Governance",
    domains: ["Academic Administration", "AI Governance", "Curriculum Review"],
    status: "Active",
    createdAt: "2026-09-01T09:00:00.000Z",
    lastLogin: "2026-09-03T03:00:00.000Z",
    permissions: [
      "manage_conferences",
      "manage_papers",
      "assign_reviewers",
      "accept_reject_manuscripts",
      "manage_schedule",
      "view_financials",
      "export_metadata",
    ],
    submittedPapers: [],
    tickets: [],
  },
];

// Default Initial Seed Papers (Empty for fresh start)
export const DEFAULT_PAPERS: Paper[] = [];

// ----------------- GENERIC SAFE READ & WRITE HELPERS -----------------

export function safeReadJson<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8").trim();
      if (content) {
        return JSON.parse(content);
      }
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  safeWriteJson(filePath, fallback);
  return fallback;
}

export function safeWriteJson(filePath: string, data: any): void {
  try {
    if (!fs.existsSync(DATABASE_DIR)) {
      fs.mkdirSync(DATABASE_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Failed to write JSON to ${filePath}:`, err);
  }
}

// ----------------- USER DATABASE OPERATIONS -----------------

export function getUserData(): UserDataState {
  try {
    if (fs.existsSync(USER_FILE)) {
      const raw = fs.readFileSync(USER_FILE, "utf-8").trim();
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          let modified = false;
          const adminExists = parsed.users.some(
            (u: StoredUser) => u.email.toLowerCase() === "roshankc@admin.com"
          );
          if (!adminExists && DEFAULT_USERS.length > 0) {
            parsed.users.unshift(DEFAULT_USERS[0]);
            modified = true;
          }

          // Ensure every user has a persistent token assigned
          parsed.users.forEach((u: StoredUser) => {
            if (!u.token) {
              u.token = `cfh_tok_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
              modified = true;
            }
          });

          if (modified) {
            saveUserData(parsed);
          }
          return parsed;
        }
      }
    }
  } catch (error) {
    console.error("Error reading user.json:", error);
  }
  const defaultState: UserDataState = { users: DEFAULT_USERS };
  saveUserData(defaultState);
  return defaultState;
}

export function saveUserData(data: UserDataState): void {
  safeWriteJson(USER_FILE, data);
}

// ----------------- ENTITY ACCESSORS -----------------

export function getConferenceHalls(): { conferences: Conference[]; schedule: ScheduleItem[] } {
  const data = safeReadJson<{ conferences?: Conference[]; schedule?: ScheduleItem[] }>(CONFERENCE_HALL_FILE, {
    conferences: [],
    schedule: [],
  });
  return {
    conferences: Array.isArray(data.conferences) ? data.conferences : [],
    schedule: Array.isArray(data.schedule) ? data.schedule : [],
  };
}

export function saveConferenceHalls(data: { conferences: Conference[]; schedule: ScheduleItem[] }): void {
  safeWriteJson(CONFERENCE_HALL_FILE, {
    conferences: data.conferences || [],
    schedule: data.schedule || [],
  });
}

export function getAbstractPapers(): { papers: Paper[] } {
  const data = safeReadJson<{ papers?: Paper[] } | Paper[]>(ABSTRACT_PAPER_FILE, { papers: [] });
  let papersList: Paper[] = [];
  if (Array.isArray(data)) {
    papersList = data;
  } else if (Array.isArray(data.papers)) {
    papersList = data.papers;
  }
  return { papers: papersList };
}

export function saveAbstractPapers(papers: Paper[]): void {
  safeWriteJson(ABSTRACT_PAPER_FILE, { papers: papers || [] });
}

export function getTransactions(): { orders: Order[] } {
  const data = safeReadJson<{ orders?: Order[]; transactions?: Order[] } | Order[]>(TRANSACTION_FILE, { orders: [] });
  if (Array.isArray(data)) {
    return { orders: data };
  }
  return { orders: Array.isArray(data.orders) ? data.orders : Array.isArray(data.transactions) ? data.transactions : [] };
}

export function saveTransactions(orders: Order[]): void {
  safeWriteJson(TRANSACTION_FILE, { orders: orders || [] });
}

export function getReviewers(): { reviewers: Reviewer[] } {
  const data = safeReadJson<{ reviewers?: Reviewer[] } | Reviewer[]>(REVIEWER_FILE, { reviewers: [] });
  if (Array.isArray(data)) {
    return { reviewers: data };
  }
  return { reviewers: Array.isArray(data.reviewers) ? data.reviewers : [] };
}

export function saveReviewers(reviewers: Reviewer[]): void {
  safeWriteJson(REVIEWER_FILE, { reviewers: reviewers || [] });
}

export function getReviews(): { reviews: Review[] } {
  const data = safeReadJson<{ reviews?: Review[] } | Review[]>(REVIEW_FILE, { reviews: [] });
  if (Array.isArray(data)) {
    return { reviews: data };
  }
  return { reviews: Array.isArray(data.reviews) ? data.reviews : [] };
}

export function saveReviews(reviews: Review[]): void {
  safeWriteJson(REVIEW_FILE, { reviews: reviews || [] });
}

export function getPosts(): { posts: AuthorPost[] } {
  const data = safeReadJson<{ posts?: AuthorPost[] } | AuthorPost[]>(POST_FILE, { posts: [] });
  if (Array.isArray(data)) {
    return { posts: data };
  }
  return { posts: Array.isArray(data.posts) ? data.posts : [] };
}

export function savePosts(posts: AuthorPost[]): void {
  safeWriteJson(POST_FILE, { posts: posts || [] });
}

// ----------------- AGGREGATE DB STATE FOR API/DB -----------------

export function getDbState(): DbState {
  const confHall = getConferenceHalls();
  const abstractPaper = getAbstractPapers();
  const transaction = getTransactions();
  const reviewerData = getReviewers();
  const reviewData = getReviews();
  const postData = getPosts();

  return {
    conferences: confHall.conferences,
    schedule: confHall.schedule,
    papers: abstractPaper.papers,
    orders: transaction.orders,
    reviewers: reviewerData.reviewers,
    reviews: reviewData.reviews,
    posts: postData.posts,
  };
}

export function saveDbState(state: DbState): void {
  saveConferenceHalls({
    conferences: state.conferences || [],
    schedule: state.schedule || [],
  });
  saveAbstractPapers(state.papers || []);
  saveTransactions(state.orders || []);
  saveReviewers(state.reviewers || []);
  saveReviews(state.reviews || []);
  savePosts(state.posts || []);
}
