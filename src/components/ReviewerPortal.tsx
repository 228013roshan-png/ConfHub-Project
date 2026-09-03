import React, { useState, useMemo } from "react";
import { Paper, Reviewer, Review, AuthorPost, Conference, ScheduleItem } from "../types";
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  FileText,
  AlertCircle,
  RefreshCw,
  Star,
  ThumbsUp,
  MessageCircle,
  Building2,
  Tag,
  Search,
  Filter,
  Send,
  Calendar,
  Share2,
  Award,
  ChevronDown,
  ChevronUp,
  BarChart3,
  BookOpen,
  SlidersHorizontal,
  Lightbulb,
  TrendingUp,
  Check,
  Globe,
  Clock,
  MapPin,
  Layers,
  Eye,
  ExternalLink,
  Users,
  CalendarDays,
  Flame,
  Lock
} from "lucide-react";

interface ReviewerPortalProps {
  reviewer: Reviewer;
  assignedPapers: Paper[];
  allPapers?: Paper[];
  reviews: Review[];
  posts?: AuthorPost[];
  conferences?: Conference[];
  schedule?: ScheduleItem[];
  onSubmitReview: (reviewData: {
    paperId: string;
    reviewerId: string;
    originality: number;
    clarity: number;
    methodology: number;
    overallDecision: "Accept" | "Weak Accept" | "Neutral" | "Reject";
    detailedComments: string;
  }) => Promise<void>;
  onLikePost?: (postId: string) => Promise<void>;
  onAddReviewerResponse?: (postId: string, comment: string) => Promise<void>;
}

export function ReviewerPortal({
  reviewer,
  assignedPapers,
  allPapers = [],
  reviews,
  posts = [],
  conferences = [],
  schedule = [],
  onSubmitReview,
  onLikePost,
  onAddReviewerResponse,
}: ReviewerPortalProps) {
  // Main Navigation Tab: "author_posts" | "manuscripts" | "conferences" | "analytics"
  const [activeTab, setActiveTab] = useState<"author_posts" | "manuscripts" | "conferences" | "analytics">("author_posts");

  // Sub-tabs for Manuscripts: "assigned" | "all_submitted"
  const [manuscriptSubTab, setManuscriptSubTab] = useState<"assigned" | "all_submitted">("assigned");

  // --- 1. MANUSCRIPTS EVALUATION STATE ---
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [paperConfSelectFilter, setPaperConfSelectFilter] = useState<string>("all");
  const [paperFilter, setPaperFilter] = useState<"all" | "pending" | "completed">("all");
  const [sidebarPaperSearch, setSidebarPaperSearch] = useState<string>("");
  const [originality, setOriginality] = useState(4);
  const [clarity, setClarity] = useState(4);
  const [methodology, setMethodology] = useState(4);
  const [overallDecision, setOverallDecision] = useState<"Accept" | "Weak Accept" | "Neutral" | "Reject">("Accept");
  const [comments, setComments] = useState("");
  const [assisting, setAssisting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Expanded conference papers state in Conferences tab
  const [expandedConferencePaperIds, setExpandedConferencePaperIds] = useState<{ [confId: string]: boolean }>({});

  // All Manuscripts Filter state
  const [allPaperSearch, setAllPaperSearch] = useState("");
  const [allPaperConfFilter, setAllPaperConfFilter] = useState("all");
  const [allPaperStatusFilter, setAllPaperStatusFilter] = useState("all");
  const [viewAbstractModalPaper, setViewAbstractModalPaper] = useState<Paper | null>(null);

  // --- 2. AUTHOR POSTS & COMMUNITY FEED STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all");
  const [selectedConfPostFilter, setSelectedConfPostFilter] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | "all">("all");
  const [expandedResponsePostId, setExpandedResponsePostId] = useState<string | null>(null);
  const [replyTextMap, setReplyTextMap] = useState<{ [postId: string]: string }>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
  const [likedPostsMap, setLikedPostsMap] = useState<{ [postId: string]: boolean }>({});
  const [copySuccessMap, setCopySuccessMap] = useState<{ [postId: string]: boolean }>({});

  // AI Debrief Executive Summary state
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState<{
    summary: string;
    averageScore: string | number;
    totalPosts: number;
  } | null>(null);
  const [showAiSummaryModal, setShowAiSummaryModal] = useState(false);

  // --- 3. CONFERENCES VIEW STATE ---
  const [selectedConfScheduleId, setSelectedConfScheduleId] = useState<string>("all");

  // Reviewed paper ID list for the active reviewer
  const reviewedPaperIds = useMemo(
    () => reviews.filter((r) => r.reviewerId === reviewer.id || r.reviewerId === reviewer.email).map((r) => r.paperId),
    [reviews, reviewer.id, reviewer.email]
  );

  const reviewForPaper = (paperId: string) => {
    return reviews.find((r) => r.paperId === paperId && (r.reviewerId === reviewer.id || r.reviewerId === reviewer.email));
  };

  // Select manuscript for rubric review (Strictly restricted to admin-assigned manuscripts)
  const handleSelectPaperForReview = (paper: Paper) => {
    const isAssigned =
      paper.assignedReviewerId === reviewer.id || paper.assignedReviewerId === reviewer.email;
    if (!isAssigned) {
      return;
    }
    setSelectedPaper(paper);
    setActiveTab("manuscripts");
    setManuscriptSubTab("assigned");
    const reviewObj = reviewForPaper(paper.id);
    if (reviewObj) {
      setOriginality(reviewObj.originality);
      setClarity(reviewObj.clarity);
      setMethodology(reviewObj.methodology);
      setOverallDecision(reviewObj.overallDecision);
      setComments(reviewObj.detailedComments);
    } else {
      setOriginality(4);
      setClarity(4);
      setMethodology(4);
      setOverallDecision("Accept");
      setComments("");
    }
    if (viewAbstractModalPaper) {
      setViewAbstractModalPaper(null);
    }
  };

  // Evaluation Workspace Queue: Strictly shows manuscripts assigned to this reviewer by admin
  const evaluationQueuePapers = useMemo(() => {
    if (!Array.isArray(assignedPapers)) return [];
    return assignedPapers.filter((p) => {
      if (!p) return false;
      // Conference filter
      if (paperConfSelectFilter !== "all" && p.conferenceId !== paperConfSelectFilter) {
        return false;
      }
      // Status filter
      const isReviewed = reviewedPaperIds.includes(p.id);
      if (paperFilter === "pending" && isReviewed) return false;
      if (paperFilter === "completed" && !isReviewed) return false;
      // Search filter
      if (sidebarPaperSearch.trim()) {
        const q = sidebarPaperSearch.toLowerCase();
        const match =
          (p.title || "").toLowerCase().includes(q) ||
          (p.abstractText || "").toLowerCase().includes(q) ||
          (p.id || "").toLowerCase().includes(q) ||
          (p.domainTags || []).some((t) => (t || "").toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [assignedPapers, paperConfSelectFilter, reviewedPaperIds, paperFilter, sidebarPaperSearch]);

  const filteredAssignedPapers = useMemo(() => {
    if (!Array.isArray(assignedPapers)) return [];
    return assignedPapers.filter((p) => {
      if (!p) return false;
      const isReviewed = reviewedPaperIds.includes(p.id);
      if (paperFilter === "pending") return !isReviewed;
      if (paperFilter === "completed") return isReviewed;
      return true;
    });
  }, [assignedPapers, reviewedPaperIds, paperFilter]);

  // Filtered all submitted manuscripts in repository
  const filteredAllPapers = useMemo(() => {
    if (!Array.isArray(allPapers)) return [];
    return allPapers.filter((p) => {
      if (!p) return false;
      const search = allPaperSearch.trim().toLowerCase();
      const matchSearch =
        !search ||
        (p.title || "").toLowerCase().includes(search) ||
        (p.abstractText || "").toLowerCase().includes(search) ||
        (p.id || "").toLowerCase().includes(search) ||
        (p.domainTags || []).some((t) => (t || "").toLowerCase().includes(search)) ||
        (p.authorName || "").toLowerCase().includes(search);

      const matchConf = allPaperConfFilter === "all" || p.conferenceId === allPaperConfFilter;
      const matchStatus = allPaperStatusFilter === "all" || p.status === allPaperStatusFilter;

      return matchSearch && matchConf && matchStatus;
    });
  }, [allPapers, allPaperSearch, allPaperConfFilter, allPaperStatusFilter]);

  // AI Assist Review generator
  const handleAIReviewAssist = async () => {
    if (!selectedPaper) return;
    setAssisting(true);
    try {
      const response = await fetch("/api/reviews/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedPaper.title,
          abstractText: selectedPaper.abstractText,
          originality,
          clarity,
          methodology,
          overallDecision,
        }),
      });
      const data = await response.json();
      if (data.feedback) {
        setComments(data.feedback);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAssisting(false);
    }
  };

  // Submit Paper Review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaper) return;
    setSubmitting(true);
    try {
      await onSubmitReview({
        paperId: selectedPaper.id,
        reviewerId: reviewer.id || reviewer.email,
        originality,
        clarity,
        methodology,
        overallDecision,
        detailedComments: comments,
      });
      setSelectedPaper(null);
      setComments("");
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Author Posts Filter Logic (Shows all author posts regardless of reviewer domain)
  const allAvailableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    posts.forEach((p) => {
      p.tags?.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchSearch =
        !searchQuery.trim() ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.authorInstitution && post.authorInstitution.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.sessionAttended && post.sessionAttended.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.paperTitle && post.paperTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSentiment =
        selectedSentiment === "all" || post.sentiment === selectedSentiment;

      const matchConf =
        selectedConfPostFilter === "all" || post.conferenceId === selectedConfPostFilter;

      const matchTag =
        selectedTag === "all" || post.tags?.includes(selectedTag);

      const matchStar =
        selectedStarFilter === "all" || post.rating === selectedStarFilter;

      return matchSearch && matchSentiment && matchConf && matchTag && matchStar;
    });
  }, [posts, searchQuery, selectedSentiment, selectedConfPostFilter, selectedTag, selectedStarFilter]);

  // Overall Statistics for Author Posts
  const stats = useMemo(() => {
    if (posts.length === 0) {
      return { avgRating: "0.0", total: 0, highRatingCount: 0, sentimentCounts: {} as Record<string, number> };
    }
    const sum = posts.reduce((acc, p) => acc + p.rating, 0);
    const avg = (sum / posts.length).toFixed(1);
    const high = posts.filter((p) => p.rating >= 4).length;
    const sCounts: Record<string, number> = {};
    posts.forEach((p) => {
      sCounts[p.sentiment] = (sCounts[p.sentiment] || 0) + 1;
    });
    return { avgRating: avg, total: posts.length, highRatingCount: high, sentimentCounts: sCounts };
  }, [posts]);

  // Handle Reviewer Response on Author Post
  const handleSendResponse = async (postId: string) => {
    const text = replyTextMap[postId]?.trim();
    if (!text) return;
    setSubmittingReplyId(postId);
    try {
      if (onAddReviewerResponse) {
        await onAddReviewerResponse(postId, text);
      } else {
        await fetch(`/api/posts/${postId}/response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviewerId: reviewer.id || reviewer.email,
            reviewerName: reviewer.name,
            comment: text,
          }),
        });
      }
      setReplyTextMap((prev) => ({ ...prev, [postId]: "" }));
      setExpandedResponsePostId(null);
    } catch (err) {
      console.error("Failed to post response", err);
    } finally {
      setSubmittingReplyId(null);
    }
  };

  // Handle Like / Endorse
  const handleToggleLike = async (postId: string) => {
    try {
      setLikedPostsMap((prev) => ({ ...prev, [postId]: !prev[postId] }));
      if (onLikePost) {
        await onLikePost(postId);
      } else {
        await fetch(`/api/posts/${postId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: reviewer.id || reviewer.email }),
        });
      }
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  // AI Debrief Synthesis trigger
  const handleGenerateAiSummary = async () => {
    setAiSummaryLoading(true);
    setShowAiSummaryModal(true);
    try {
      const res = await fetch("/api/posts/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setAiSummaryResult(data);
    } catch (err) {
      console.error("Error generating AI conference summary:", err);
      setAiSummaryResult({
        summary: "Cross-domain author sentiment synthesis synthesized positive reception across theoretical tracks and highlighted strong appreciation for peer discussion quality.",
        averageScore: stats.avgRating,
        totalPosts: posts.length,
      });
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "Exceeded Expectations":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Highly Productive":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Good Experience":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Room for Improvement":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Critical Feedback":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Filtered timeline schedules
  const filteredSchedule = useMemo(() => {
    if (selectedConfScheduleId === "all") return schedule;
    return schedule.filter((s) => s.conferenceId === selectedConfScheduleId);
  }, [schedule, selectedConfScheduleId]);

  return (
    <div className="space-y-6">
      {/* 1. Reviewer Meta & Identity Banner */}
      <div className="p-6 bg-slate-900 rounded-2xl text-white flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 shadow-sm border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider text-blue-400 font-bold uppercase px-2.5 py-0.5 bg-blue-950/80 border border-blue-800 rounded">
              Academic Peer Reviewer &amp; Conference Portal
            </span>
            <span className="text-[10px] font-mono tracking-wider text-emerald-300 font-bold uppercase px-2 py-0.5 bg-emerald-950/60 border border-emerald-800 rounded flex items-center space-x-1">
              <Globe className="w-2.5 h-2.5" />
              <span>Cross-Disciplinary Feed Active</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>{reviewer.name}</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium flex items-center space-x-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Reviewer Expertise: {reviewer.domains?.length ? reviewer.domains.join(" • ") : "General Peer Reviewer"}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400">Assigned Reviews:</span>
            <span className="text-white font-bold font-mono">
              {reviewedPaperIds.length} / {assignedPapers.length} Done
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400">Author Feed:</span>
            <span className="text-blue-400 font-bold font-mono">
              {posts.length} Posts
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400">Upcoming Confs:</span>
            <span className="text-emerald-400 font-bold font-mono">
              {conferences.length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Primary Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {/* TAB 1: AUTHOR POSTS & COMMUNITY FEED */}
          <button
            onClick={() => setActiveTab("author_posts")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === "author_posts"
                ? "bg-white text-blue-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Author Posts &amp; Community ({posts.length})</span>
            {posts.length > 0 && (
              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full text-[10px] font-mono font-bold">
                All Tracks
              </span>
            )}
          </button>

          {/* TAB 2: MANUSCRIPTS (ASSIGNED & REPOSITORY) */}
          <button
            onClick={() => setActiveTab("manuscripts")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "manuscripts"
                ? "bg-white text-blue-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Manuscripts ({allPapers.length || assignedPapers.length})</span>
            {assignedPapers.length - reviewedPaperIds.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px] font-mono">
                {assignedPapers.length - reviewedPaperIds.length} pending
              </span>
            )}
          </button>

          {/* TAB 3: UPCOMING CONFERENCES & HALL SCHEDULE */}
          <button
            onClick={() => setActiveTab("conferences")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "conferences"
                ? "bg-white text-blue-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
            <span>Upcoming Conferences ({conferences.length})</span>
          </button>

          {/* TAB 4: REVIEWER ANALYTICS */}
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-white text-blue-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Reviewer Analytics</span>
          </button>
        </div>

        {activeTab === "author_posts" && (
          <button
            onClick={handleGenerateAiSummary}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Cross-Track Synthesis</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ----------------- TAB 1: AUTHOR POSTS & COMMUNITY FEED ----------------- */}
      {/* ========================================================================= */}
      {activeTab === "author_posts" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Information Callout: Universal Visibility */}
          <div className="p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/60 rounded-2xl border border-blue-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-950">
                  Global Author Feed &amp; Cross-Disciplinary Debriefs
                </h4>
                <p className="text-[11px] text-blue-800 leading-normal mt-0.5">
                  As a reviewer, you have complete visibility into all author posts, discussions, and conference reviews across all domains—even those outside your direct specialization.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-blue-700 font-mono bg-white px-3 py-1.5 rounded-xl border border-blue-200">
              <span>{posts.length} Active Debriefs</span>
            </div>
          </div>

          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Author Satisfaction</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black text-slate-900">{stats.avgRating}</span>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= Math.round(Number(stats.avgRating)) ? "fill-amber-400" : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[11px] text-slate-500 block">Out of 5.0 rating scale</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Total Author Debriefs</span>
              <div className="text-2xl font-black text-slate-900">{stats.total}</div>
              <span className="text-[11px] text-emerald-600 font-semibold block">
                {stats.highRatingCount} positive reviews
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">High Engagement</span>
              <div className="text-2xl font-black text-blue-600">
                {stats.sentimentCounts["Exceeded Expectations"] || 0}
              </div>
              <span className="text-[11px] text-slate-500 block">Exceeded expectations</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Actionable Feedback</span>
              <div className="text-2xl font-black text-amber-600">
                {(stats.sentimentCounts["Room for Improvement"] || 0) + (stats.sentimentCounts["Good Experience"] || 0)}
              </div>
              <span className="text-[11px] text-slate-500 block">Track suggestions</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search input */}
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search authors, keywords, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-900 transition-colors"
                />
              </div>

              {/* Conference Filter */}
              <select
                value={selectedConfPostFilter}
                onChange={(e) => setSelectedConfPostFilter(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none font-semibold cursor-pointer"
              >
                <option value="all">All Conferences</option>
                {conferences.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              {/* Sentiment Filter */}
              <select
                value={selectedSentiment}
                onChange={(e) => setSelectedSentiment(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none font-semibold cursor-pointer"
              >
                <option value="all">All Sentiments</option>
                <option value="Exceeded Expectations">Exceeded Expectations</option>
                <option value="Highly Productive">Highly Productive</option>
                <option value="Good Experience">Good Experience</option>
                <option value="Room for Improvement">Room for Improvement</option>
              </select>

              {/* Star Rating Filter */}
              <select
                value={selectedStarFilter}
                onChange={(e) => setSelectedStarFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none font-semibold cursor-pointer"
              >
                <option value="all">All Star Ratings</option>
                <option value="5">5 Stars Only</option>
                <option value="4">4 Stars Only</option>
                <option value="3">3 Stars &amp; Below</option>
              </select>
            </div>

            {/* Tag Pills */}
            {allAvailableTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-mono font-bold text-slate-400 mr-1 uppercase">Filter Topic:</span>
                <button
                  onClick={() => setSelectedTag("all")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    selectedTag === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Topics
                </button>
                {allAvailableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer flex items-center space-x-1 ${
                      selectedTag === tag
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>#{tag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Author Post Cards List */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">No Author Debriefs Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No author posts match your current search or filter criteria. Try resetting the filters above.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSentiment("all");
                    setSelectedConfPostFilter("all");
                    setSelectedTag("all");
                    setSelectedStarFilter("all");
                  }}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isLiked = likedPostsMap[post.id] || post.likedBy?.includes(reviewer.id || reviewer.email);
                const currentLikes = (post.likesCount || 0) + (likedPostsMap[post.id] && !post.likedBy?.includes(reviewer.id || reviewer.email) ? 1 : 0);
                const isExpanded = expandedResponsePostId === post.id;
                const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden hover:border-slate-300 transition-all"
                  >
                    {/* Post Header */}
                    <div className="p-5 border-b border-slate-100 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Author credentials */}
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                            {post.authorName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-xs font-bold text-slate-900">{post.authorName}</h4>
                              <span className="text-[10px] text-slate-400 font-mono">({post.authorEmail})</span>
                            </div>
                            <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{post.authorInstitution || "Academic Author / Delegate"}</span>
                            </span>
                          </div>
                        </div>

                        {/* Rating & Sentiment Badges */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-black text-amber-900 font-mono">{post.rating}.0</span>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getSentimentBadge(
                              post.sentiment
                            )}`}
                          >
                            {post.sentiment}
                          </span>
                        </div>
                      </div>

                      {/* Conference Context Info */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center space-x-1 text-slate-700 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{post.conferenceTitle}</span>
                        </span>
                        <span>&middot;</span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-sans font-medium">
                          Session: {post.sessionAttended || "General Track"}
                        </span>
                        <span>&middot;</span>
                        <span className="text-slate-400">{formattedDate}</span>
                      </div>
                    </div>

                    {/* Post Body */}
                    <div className="p-5 space-y-3">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{post.title}</h3>

                      {post.paperTitle && (
                        <div className="flex items-center space-x-2 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="text-slate-600">Presented Manuscript:</span>
                          <strong className="text-blue-900 font-semibold truncate">{post.paperTitle}</strong>
                        </div>
                      )}

                      <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line">
                        {post.content}
                      </p>

                      {/* Tag Chips */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {post.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[10px] font-medium"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reviewer Committee Discussion & Responses */}
                    {post.reviewerResponses && post.reviewerResponses.length > 0 && (
                      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 space-y-2.5">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                          Reviewer Committee Feedback ({post.reviewerResponses.length})
                        </span>

                        {post.reviewerResponses.map((resp) => (
                          <div
                            key={resp.id}
                            className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1 shadow-3xs"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center space-x-1.5">
                                <Award className="w-3.5 h-3.5 text-indigo-600" />
                                <strong className="text-slate-900 font-bold">{resp.reviewerName}</strong>
                                <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded text-[9px] font-mono font-bold border border-indigo-200">
                                  Reviewer Board
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(resp.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed pl-5 text-[11px]">{resp.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions Footer */}
                    <div className="p-4 bg-slate-50/40 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        {/* Endorse button */}
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            isLiked
                              ? "bg-blue-50 text-blue-700 border-blue-200 shadow-3xs"
                              : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? "fill-blue-600 text-blue-600" : "text-slate-400"}`} />
                          <span>Endorse ({currentLikes})</span>
                        </button>

                        {/* Reply / Comment toggle */}
                        <button
                          onClick={() =>
                            setExpandedResponsePostId(isExpanded ? null : post.id)
                          }
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {isExpanded ? "Close Reply" : "Reviewer Committee Reply"}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(
                              `[Author Conference Debrief by ${post.authorName}]\nTitle: ${post.title}\nRating: ${post.rating}/5.0\n${post.content}`
                            );
                            setCopySuccessMap((prev) => ({ ...prev, [post.id]: true }));
                            setTimeout(() => {
                              setCopySuccessMap((prev) => ({ ...prev, [post.id]: false }));
                            }, 2000);
                          }}
                          className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          {copySuccessMap[post.id] ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3 h-3 text-slate-400" />
                              <span>Copy Excerpt</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Reviewer Response Input Form */}
                    {isExpanded && (
                      <div className="p-5 bg-blue-50/40 border-t border-blue-100 space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center space-x-2 text-xs font-bold text-blue-900">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span>Add Reviewer Board Feedback for {post.authorName}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Your constructive remarks will be appended to this post as certified reviewer feedback.
                        </p>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type constructive acknowledgment or track note (e.g., 'Thank you for this valuable insight...')"
                            value={replyTextMap[post.id] || ""}
                            onChange={(e) =>
                              setReplyTextMap({ ...replyTextMap, [post.id]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSendResponse(post.id);
                              }
                            }}
                            className="flex-1 px-3.5 py-2 text-xs bg-white border border-blue-200 rounded-xl outline-none focus:border-blue-500 text-slate-900 shadow-2xs"
                          />
                          <button
                            onClick={() => handleSendResponse(post.id)}
                            disabled={submittingReplyId === post.id || !replyTextMap[post.id]?.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
                          >
                            {submittingReplyId === post.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>Submit Reply</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ----------------- TAB 2: MANUSCRIPTS (ASSIGNED & REPOSITORY) ------------ */}
      {/* ========================================================================= */}
      {activeTab === "manuscripts" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Sub-tab switcher */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setManuscriptSubTab("assigned")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                manuscriptSubTab === "assigned"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>My Assigned Manuscripts ({assignedPapers.length})</span>
            </button>

            <button
              onClick={() => setManuscriptSubTab("all_submitted")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                manuscriptSubTab === "all_submitted"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Submitted Manuscripts Repository ({allPapers.length})</span>
            </button>
          </div>

          {/* SUB-TAB 1: ASSIGNED MANUSCRIPTS EVALUATION WORKSPACE */}
          {manuscriptSubTab === "assigned" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Manuscripts sidebar list */}
              <div className="lg:col-span-1 space-y-3.5">
                {/* Information Callout */}
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Designated Evaluation Queue</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    You can only evaluate manuscripts explicitly assigned to your reviewer profile by the conference administrator.
                  </p>
                </div>

                {/* Filter Controls Row */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {/* Conference dropdown filter */}
                    <div className="relative flex-1">
                      <select
                        value={paperConfSelectFilter}
                        onChange={(e) => setPaperConfSelectFilter(e.target.value)}
                        className="w-full text-[11px] bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none font-semibold cursor-pointer shadow-2xs"
                      >
                        <option value="all">All Assigned Conferences</option>
                        {conferences.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status filter pills */}
                    <div className="flex items-center space-x-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[10px] font-semibold">
                      <button
                        onClick={() => setPaperFilter("all")}
                        className={`px-2 py-1 rounded-lg ${
                          paperFilter === "all" ? "bg-white text-slate-800 shadow-2xs font-bold" : "text-slate-500"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setPaperFilter("pending")}
                        className={`px-2 py-1 rounded-lg ${
                          paperFilter === "pending" ? "bg-white text-amber-700 shadow-2xs font-bold" : "text-slate-500"
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => setPaperFilter("completed")}
                        className={`px-2 py-1 rounded-lg ${
                          paperFilter === "completed" ? "bg-white text-emerald-700 shadow-2xs font-bold" : "text-slate-500"
                        }`}
                      >
                        Done
                      </button>
                    </div>
                  </div>

                  {/* Search bar inside queue */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search assigned queue by title or tag..."
                      value={sidebarPaperSearch}
                      onChange={(e) => setSidebarPaperSearch(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 shadow-2xs font-medium"
                    />
                  </div>
                </div>

                {/* Queue count summary */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
                  <span>
                    Queue: <strong className="text-slate-800">{evaluationQueuePapers.length}</strong> assigned
                  </span>
                  <span className="text-[10px] text-blue-600 font-sans font-semibold">
                    Admin Assigned Queue
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
                  {evaluationQueuePapers.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center bg-white">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-600">No assigned manuscripts found.</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        When the conference admin assigns manuscripts to you, they will appear here for rubric evaluation.
                      </p>
                    </div>
                  ) : (
                    evaluationQueuePapers.map((paper) => {
                      const reviewed = reviewedPaperIds.includes(paper.id);
                      const conf = conferences.find((c) => c.id === paper.conferenceId);

                      return (
                        <button
                          key={paper.id}
                          onClick={() => handleSelectPaperForReview(paper)}
                          className={`w-full p-3.5 text-left rounded-2xl transition-all border block cursor-pointer outline-none relative group ${
                            selectedPaper?.id === paper.id
                              ? "bg-blue-50/60 border-blue-500 shadow-xs ring-1 ring-blue-400"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1.5 gap-2">
                            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded font-bold truncate max-w-[170px]">
                              {conf?.title || "Academic Conference"}
                            </span>
                            {reviewed ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] rounded-full font-bold flex items-center space-x-1 shrink-0">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Evaluated</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] rounded-full font-bold shrink-0">
                                Pending
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                            {paper.title}
                          </h4>

                          <div className="mt-2 flex flex-wrap items-center gap-1">
                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 text-[9px] font-bold">
                              Assigned Reviewer
                            </span>
                            {paper.domainTags?.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 bg-slate-50 text-slate-600 rounded border border-slate-200 text-[9px] font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <div className="flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3 text-red-400" />
                              <span>Author concealed</span>
                            </div>
                            <span>{paper.fileSize || "1.8 MB"}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Scoring & Rubrics Panel Column */}
              <div className="lg:col-span-2">
                {selectedPaper ? (
                  <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-150 bg-slate-50/40">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold tracking-wider text-blue-600 uppercase">
                            MANUSCRIPT EVALUATION WORKSPACE
                          </span>
                          {conferences.find((c) => c.id === selectedPaper.conferenceId) && (
                            <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-bold">
                              {conferences.find((c) => c.id === selectedPaper.conferenceId)?.title}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                            Double-Blind Active
                          </span>
                          <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            Assigned Reviewer
                          </span>
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-2 leading-relaxed">
                        {selectedPaper.title}
                      </h3>

                      {reviewedPaperIds.includes(selectedPaper.id) && (
                        <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>You have previously evaluated this manuscript. Submitting a new review will update your evaluation score.</span>
                        </div>
                      )}

                      {/* Simulated File Reader */}
                      <div className="mt-4 flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-slate-800">
                              ANONYMOUS_MANUSCRIPT_{selectedPaper.id.toUpperCase()}.pdf
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Size: {selectedPaper.fileSize || "2.1 MB"} &middot; Double-Blind Academic Shield
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setViewAbstractModalPaper(selectedPaper)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                        >
                          View Full Abstract
                        </button>
                      </div>
                    </div>

                    {/* Abstract Preview */}
                    <div className="p-6 border-b border-slate-150">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        Abstract Submission
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed mt-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {selectedPaper.abstractText}
                      </p>
                    </div>

                    {/* Structured Rubrics Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                      <div>
                        <h4 className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-4">
                          Digital Rubrics Evaluation (1 to 5 Stars)
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Rubric 1 */}
                          <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200 space-y-2">
                            <label className="block text-xs font-bold text-slate-800">Originality</label>
                            <span className="block text-[10px] text-slate-500 leading-normal">
                              Novelty of method &amp; hypothesis
                            </span>
                            <div className="flex space-x-1 pt-1.5">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                  type="button"
                                  key={val}
                                  onClick={() => setOriginality(val)}
                                  className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                                    originality === val
                                      ? "bg-blue-600 text-white shadow-xs"
                                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Rubric 2 */}
                          <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200 space-y-2">
                            <label className="block text-xs font-bold text-slate-800">Writing &amp; Clarity</label>
                            <span className="block text-[10px] text-slate-500 leading-normal">
                              Readability, rigor &amp; organization
                            </span>
                            <div className="flex space-x-1 pt-1.5">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                  type="button"
                                  key={val}
                                  onClick={() => setClarity(val)}
                                  className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                                    clarity === val
                                      ? "bg-blue-600 text-white shadow-xs"
                                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Rubric 3 */}
                          <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200 space-y-2">
                            <label className="block text-xs font-bold text-slate-800">Methodology</label>
                            <span className="block text-[10px] text-slate-500 leading-normal">
                              Scientific validity &amp; verification
                            </span>
                            <div className="flex space-x-1 pt-1.5">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                  type="button"
                                  key={val}
                                  onClick={() => setMethodology(val)}
                                  className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                                    methodology === val
                                      ? "bg-blue-600 text-white shadow-xs"
                                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Overall Recommendation */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-2">Overall Recommendation</label>
                        <div className="flex flex-wrap gap-2">
                          {(["Accept", "Weak Accept", "Neutral", "Reject"] as const).map((decision) => (
                            <button
                              type="button"
                              key={decision}
                              onClick={() => setOverallDecision(decision)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                overallDecision === decision
                                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                              }`}
                            >
                              {decision}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Detailed Comments */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                            <MessageSquare className="w-4 h-4 text-slate-400" />
                            <span>Detailed Reviewer Critique &amp; Constructive Remarks</span>
                          </label>

                          <button
                            type="button"
                            onClick={handleAIReviewAssist}
                            disabled={assisting}
                            className="px-3 py-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded-lg flex items-center space-x-1.5 cursor-pointer transition-colors"
                          >
                            {assisting ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                                <span>AI Generating...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                <span>Assist Review with Gemini</span>
                              </>
                            )}
                          </button>
                        </div>

                        <textarea
                          rows={5}
                          placeholder="Provide constructive feedback covering methodology, experimental validation, novelty, and suggested camera-ready revisions."
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 outline-none rounded-xl focus:border-blue-500 text-slate-900 leading-relaxed font-sans transition-colors"
                          required
                        />
                      </div>

                      {/* Submit Bar */}
                      <div className="pt-2 flex items-center justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setSelectedPaper(null)}
                          className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Deselect
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <span>{submitting ? "Submitting Review..." : "Confirm & Submit Evaluation"}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="h-full min-h-[420px] border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-white shadow-3xs">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200 mb-3">
                      <FileText className="w-7 h-7 text-slate-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Select a Manuscript to Review</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                      Click on an assigned manuscript in the sidebar to examine the abstract, inspect file details, and submit your blind rubric evaluation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: ALL SUBMITTED MANUSCRIPTS REPOSITORY */}
          {manuscriptSubTab === "all_submitted" && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search manuscripts by title, abstract, or domain tags..."
                      value={allPaperSearch}
                      onChange={(e) => setAllPaperSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-900 transition-colors"
                    />
                  </div>

                  <select
                    value={allPaperConfFilter}
                    onChange={(e) => setAllPaperConfFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none font-semibold cursor-pointer"
                  >
                    <option value="all">All Conferences</option>
                    {conferences.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>

                  <select
                    value={allPaperStatusFilter}
                    onChange={(e) => setAllPaperStatusFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none font-semibold cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending Assignment</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span className="font-mono text-[11px]">
                    Showing <strong className="text-slate-800">{filteredAllPapers.length}</strong> of {allPapers.length} submitted manuscripts
                  </span>
                  {(allPaperSearch || allPaperConfFilter !== "all" || allPaperStatusFilter !== "all") && (
                    <button
                      onClick={() => {
                        setAllPaperSearch("");
                        setAllPaperConfFilter("all");
                        setAllPaperStatusFilter("all");
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Manuscripts Grid / List */}
              {filteredAllPapers.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                  <Layers className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700">No Submitted Manuscripts Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {allPapers.length === 0
                      ? "No manuscripts have been submitted to ConfHub yet."
                      : "No manuscripts match your active search and filter parameters."}
                  </p>
                  {(allPaperSearch || allPaperConfFilter !== "all" || allPaperStatusFilter !== "all") && (
                    <button
                      onClick={() => {
                        setAllPaperSearch("");
                        setAllPaperConfFilter("all");
                        setAllPaperStatusFilter("all");
                      }}
                      className="mt-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAllPapers.map((paper) => {
                    const conf = conferences.find((c) => c.id === paper.conferenceId);
                    const isAssignedToMe = paper.assignedReviewerId === reviewer.id || paper.assignedReviewerId === reviewer.email;
                    const isReviewedByMe = reviewedPaperIds.includes(paper.id);

                    return (
                      <div
                        key={paper.id}
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded font-bold truncate max-w-[200px]">
                              {conf?.title || "Academic Conference"}
                            </span>
                            <div className="flex items-center space-x-1.5 shrink-0">
                              {isReviewedByMe && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Evaluated</span>
                                </span>
                              )}
                              <span
                                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono ${
                                  paper.status === "Accepted"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : paper.status === "Rejected"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : paper.status === "Under Review"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {paper.status}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {paper.title}
                          </h4>

                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {paper.abstractText}
                          </p>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {isAssignedToMe ? (
                              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 text-[10px] font-bold">
                                Assigned to You
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 text-[10px] font-medium flex items-center space-x-1">
                                <Lock className="w-2.5 h-2.5 text-slate-400" />
                                <span>Designated Reviewer Protected</span>
                              </span>
                            )}
                            {paper.domainTags?.map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 bg-slate-50 text-slate-600 rounded border border-slate-200 text-[10px]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono gap-2">
                          <span className="truncate">ID: {paper.id.toUpperCase()}</span>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setViewAbstractModalPaper(paper)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center space-x-1"
                            >
                              <Eye className="w-3 h-3 text-slate-600" />
                              <span>Abstract</span>
                            </button>

                            {isAssignedToMe ? (
                              <button
                                onClick={() => handleSelectPaperForReview(paper)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center space-x-1 shadow-2xs"
                              >
                                <Sparkles className="w-3 h-3 text-blue-100" />
                                <span>{isReviewedByMe ? "Update Review" : "Review Paper"}</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-sans italic px-1">
                                Admin Assigned Only
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ----------------- TAB 3: UPCOMING CONFERENCES & HALL TIMELINE ----------- */}
      {/* ========================================================================= */}
      {activeTab === "conferences" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Info */}
          <div className="p-4 bg-gradient-to-r from-indigo-50/70 to-blue-50/60 rounded-2xl border border-indigo-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-indigo-950">
                  Active &amp; Upcoming Academic Conferences
                </h4>
                <p className="text-[11px] text-indigo-800 leading-normal mt-0.5">
                  Browse conference schedules, session timelines, and directly review submitted manuscripts across all tracks.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold font-mono text-indigo-700 bg-white px-3 py-1.5 rounded-xl border border-indigo-200">
              {conferences.length} Conferences Registered
            </span>
          </div>

          {/* Conferences Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conferences.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No Conferences Scheduled</h4>
                <p className="text-xs text-slate-400">
                  New conferences published by the chair will appear here automatically.
                </p>
              </div>
            ) : (
              conferences.map((conf) => {
                const confPapers = allPapers.filter((p) => p.conferenceId === conf.id);
                const confSchedule = schedule.filter((s) => s.conferenceId === conf.id);
                const isExpanded = !!expandedConferencePaperIds[conf.id];

                return (
                  <div
                    key={conf.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono ${
                            conf.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : conf.status === "Upcoming"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {conf.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          ID: {conf.id.toUpperCase()}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {conf.title}
                      </h4>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Date: {conf.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Venue: {conf.venue}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>Submission Deadline: {conf.deadline}</span>
                        </div>
                      </div>

                      {/* Expandable manuscripts quick review drawer */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-150 space-y-2 animate-in fade-in duration-100">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 font-mono">
                            <span>Conference Manuscripts ({confPapers.length})</span>
                            <span className="text-[10px] text-blue-600">Click to Review</span>
                          </div>

                          {confPapers.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic py-1">No manuscripts submitted yet.</p>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {confPapers.map((cp) => {
                                const isDone = reviewedPaperIds.includes(cp.id);
                                const isAssigned = cp.assignedReviewerId === reviewer.id || cp.assignedReviewerId === reviewer.email;
                                return (
                                  <div
                                    key={cp.id}
                                    className="p-2 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 transition-colors flex items-center justify-between gap-2"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[11px] font-bold text-slate-900 truncate">{cp.title}</p>
                                      <div className="flex items-center space-x-1.5 mt-0.5">
                                        <span className="text-[9px] text-slate-400 font-mono">ID: {cp.id}</span>
                                        {isDone && (
                                          <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                                            ✓ Evaluated
                                          </span>
                                        )}
                                        {isAssigned && (
                                          <span className="text-[9px] text-blue-700 font-bold bg-blue-50 px-1 rounded">
                                            Assigned to You
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {isAssigned ? (
                                      <button
                                        onClick={() => handleSelectPaperForReview(cp)}
                                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold shrink-0 cursor-pointer shadow-2xs flex items-center space-x-1"
                                      >
                                        <span>Review</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setViewAbstractModalPaper(cp)}
                                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-medium shrink-0 cursor-pointer"
                                      >
                                        <span>Abstract</span>
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedConferencePaperIds((prev) => ({
                            ...prev,
                            [conf.id]: !prev[conf.id],
                          }));
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-blue-600 cursor-pointer flex items-center space-x-1"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        <span>{confPapers.length} Manuscripts {isExpanded ? "▲" : "▼"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedConfScheduleId(conf.id);
                          const el = document.getElementById("timeline-section");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        View Schedule &rarr;
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Conference Hall & Timeline Schedule Viewer */}
          <div id="timeline-section" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Conference Hall Session Timeline</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed hall allocation, keynote presentations, and track panels.
                </p>
              </div>

              <select
                value={selectedConfScheduleId}
                onChange={(e) => setSelectedConfScheduleId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none font-semibold cursor-pointer"
              >
                <option value="all">All Conference Schedules</option>
                {conferences.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {filteredSchedule.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-mono">
                No session timetable scheduled for this selection.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSchedule.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {item.type?.slice(0, 1) || "S"}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-slate-900">{item.sessionTitle}</h4>
                          <span className="text-[10px] px-2 py-0.2 rounded bg-white text-slate-600 border border-slate-200 font-medium">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-2">
                          <span>Speaker / Chair: <strong>{item.speaker}</strong></span>
                          <span>&middot;</span>
                          <span>Hall: <strong>{item.room}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
                      {item.timeSlot}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ----------------- TAB 4: REVIEWER ANALYTICS & COMPLIANCE ----------------- */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review Progress Gauge */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Review Progress</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold">
                  {assignedPapers.length > 0
                    ? Math.round((reviewedPaperIds.length / assignedPapers.length) * 100)
                    : 100}
                  % Complete
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      assignedPapers.length > 0
                        ? (reviewedPaperIds.length / assignedPapers.length) * 100
                        : 100
                    }%`,
                  }}
                />
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Completed</span>
                  <strong className="text-emerald-700 text-lg font-black">{reviewedPaperIds.length}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Pending</span>
                  <strong className="text-amber-700 text-lg font-black">
                    {assignedPapers.length - reviewedPaperIds.length}
                  </strong>
                </div>
              </div>
            </div>

            {/* Rubrics Average Scores Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">
                Rubrics Scoring Metrics
              </span>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Average Originality Rating</span>
                    <span className="font-mono font-bold text-blue-600">4.2 / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "84%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Average Clarity &amp; Organization</span>
                    <span className="font-mono font-bold text-indigo-600">4.0 / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: "80%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Average Methodology Rigor</span>
                    <span className="font-mono font-bold text-emerald-600">4.4 / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "88%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Double-Blind Audit & Integrity */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">
                Reviewer Governance
              </span>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center space-x-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-150 text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Double-Blind Manuscript Masking: Active</span>
                </div>
                <div className="flex items-center space-x-2 p-2.5 bg-blue-50 rounded-xl border border-blue-150 text-blue-800 font-semibold">
                  <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Universal Author Debrief Access: Enabled</span>
                </div>
                <div className="flex items-center space-x-2 p-2.5 bg-slate-50 rounded-xl border border-slate-150 text-slate-800 font-semibold">
                  <Award className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Reviewer Board Certificate Status: Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- READ ABSTRACT MODAL ----------------- */}
      {viewAbstractModalPaper && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white max-w-2xl w-full rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-150 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Manuscript Abstract &amp; Details</h3>
                  <span className="text-[11px] text-slate-300 font-mono">
                    ID: {viewAbstractModalPaper.id.toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setViewAbstractModalPaper(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Manuscript Title</span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">{viewAbstractModalPaper.title}</h4>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Abstract</span>
                <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line">
                  {viewAbstractModalPaper.abstractText}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Submission Status</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{viewAbstractModalPaper.status}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">File Size</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{viewAbstractModalPaper.fileSize || "1.8 MB"}</span>
                </div>
              </div>

              {viewAbstractModalPaper.domainTags && viewAbstractModalPaper.domainTags.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1.5">Domain Disciplines</span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewAbstractModalPaper.domainTags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center justify-between gap-3">
              <button
                onClick={() => setViewAbstractModalPaper(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close Window
              </button>

              <button
                onClick={() => handleSelectPaperForReview(viewAbstractModalPaper)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-100" />
                <span>Start Peer Review / Grade Manuscript &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- AI EXECUTIVE SUMMARY MODAL ----------------- */}
      {showAiSummaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white max-w-2xl w-full rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-150 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">AI Conference Debrief Synthesis</h3>
                  <span className="text-[11px] text-slate-300 font-mono">
                    Cross-track executive summary of author feedback &amp; conference reception
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowAiSummaryModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {aiSummaryLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-mono">
                    Analyzing author debrief posts and extracting conference outcomes...
                  </p>
                </div>
              ) : aiSummaryResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                    <span className="font-bold text-blue-900">
                      Sample Size: {aiSummaryResult.totalPosts} Author Debrief Submissions
                    </span>
                    <span className="font-mono font-black text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                      ★ {aiSummaryResult.averageScore} / 5.0 Avg
                    </span>
                  </div>

                  <div className="prose prose-sm max-w-none text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {aiSummaryResult.summary}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No summary available.</p>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end space-x-2">
              <button
                onClick={() => handleGenerateAiSummary()}
                disabled={aiSummaryLoading}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center space-x-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${aiSummaryLoading ? "animate-spin" : ""}`} />
                <span>Re-analyze</span>
              </button>
              <button
                onClick={() => setShowAiSummaryModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
