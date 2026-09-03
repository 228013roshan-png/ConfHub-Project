export interface TicketTier {
  id: string;
  name: string;
  price: number;
  currency: "NPR" | "USD";
  description: string;
  features: string[];
  recommendedGateway?: "eSewa" | "Khalti" | "Stripe";
  badgeText?: string;
  isPopular?: boolean;
}

export interface Conference {
  id: string;
  title: string;
  date: string;
  venue: string;
  deadline: string;
  status: "Active" | "Completed" | "Upcoming";
  ticketTiers?: TicketTier[];
}

export interface Paper {
  id: string;
  conferenceId: string;
  title: string;
  authorName: string;
  authorEmail: string;
  abstractText: string;
  status: "Pending" | "Under Review" | "Accepted" | "Rejected";
  domainTags: string[];
  assignedReviewerId: string | null;
  fileSize: string;
  submittedAt: string;
}

export interface Reviewer {
  id: string;
  name: string;
  email: string;
  domains: string[];
}

export interface Review {
  id: string;
  paperId: string;
  reviewerId: string;
  originality: number;
  clarity: number;
  methodology: number;
  overallDecision: "Accept" | "Weak Accept" | "Neutral" | "Reject";
  detailedComments: string;
  submittedAt: string;
}

export interface Order {
  id: string;
  userName: string;
  userEmail: string;
  conferenceId: string;
  passType: string;
  price: number;
  currency: string;
  gateway: "eSewa" | "Khalti" | "Stripe";
  status: "Pending" | "Completed" | "Failed";
  trnRef: string;
  createdAt: string;
}

export interface ScheduleItem {
  id: string;
  conferenceId: string;
  timeSlot: string;
  sessionTitle: string;
  speaker: string;
  type: string; // "Keynote" | "Paper Presentation" | "Panel" | "Coffee Break"
  room: string;
}

export interface ReviewerResponse {
  id: string;
  reviewerId: string;
  reviewerName: string;
  comment: string;
  createdAt: string;
}

export interface AuthorPost {
  id: string;
  authorName: string;
  authorEmail: string;
  authorInstitution?: string;
  conferenceId: string;
  conferenceTitle: string;
  title: string;
  content: string;
  rating: number; // 1 to 5
  sentiment: "Exceeded Expectations" | "Highly Productive" | "Good Experience" | "Room for Improvement" | "Critical Feedback";
  tags: string[];
  sessionAttended?: string;
  paperTitle?: string;
  createdAt: string;
  likesCount: number;
  likedBy?: string[];
  reviewerResponses?: ReviewerResponse[];
}

export type UserRole = "admin" | "reviewer" | "author" | "student";

export interface UserSession {
  name: string;
  email: string;
  role: UserRole;
  token?: string;
  institution?: string;
}
