import React, { useState } from "react";
import { Conference, Paper, Order, Review, AuthorPost } from "../types";
import {
  Plus,
  Ticket,
  FileText,
  BadgeCheck,
  Loader2,
  Sparkles,
  AlertCircle,
  ShoppingCart,
  MessageSquare,
  Star,
  ThumbsUp,
  Building2,
  Calendar,
  Send,
  Award,
  CheckCircle2,
  Check,
} from "lucide-react";

interface AuthorPortalProps {
  conferences: Conference[];
  papers: Paper[];
  orders: Order[];
  reviews: Review[];
  posts?: AuthorPost[];
  currentUser?: {
    name: string;
    email: string;
    role: string;
    institution?: string;
  } | null;
  onSubmitPaper: (paperData: {
    conferenceId: string;
    title: string;
    authorName: string;
    authorEmail: string;
    abstractText: string;
  }) => Promise<void>;
  onBuyTicket: (ticketConfig: {
    conferenceId: string;
    passType: string;
    price: number;
    currency: string;
    gateway: "eSewa" | "Khalti" | "Stripe";
    userName?: string;
    userEmail?: string;
  }) => Promise<void>;
  onSubmitPost?: (postData: {
    authorName: string;
    authorEmail: string;
    authorInstitution?: string;
    conferenceId: string;
    conferenceTitle: string;
    title: string;
    content: string;
    rating: number;
    sentiment: "Exceeded Expectations" | "Highly Productive" | "Good Experience" | "Room for Improvement" | "Critical Feedback";
    tags: string[];
    sessionAttended?: string;
    paperTitle?: string;
  }) => Promise<void>;
  onLikePost?: (postId: string) => Promise<void>;
}

export function AuthorPortal({
  conferences,
  papers,
  orders,
  reviews,
  posts = [],
  currentUser,
  onSubmitPaper,
  onBuyTicket,
  onSubmitPost,
  onLikePost,
}: AuthorPortalProps) {
  // Author Session Identity
  const [authorEmail, setAuthorEmail] = useState(currentUser?.email || "");
  const [authorName, setAuthorName] = useState(currentUser?.name || "");
  const [authorInstitution, setAuthorInstitution] = useState(currentUser?.institution || "Research Institution / University");

  // Keep identity synced if currentUser updates
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.email) setAuthorEmail(currentUser.email);
      if (currentUser.name) setAuthorName(currentUser.name);
      if (currentUser.institution) setAuthorInstitution(currentUser.institution);
    }
  }, [currentUser]);

  // Submission Form State
  const [submittingPaper, setSubmittingPaper] = useState(false);
  const [paperSubmittedMsg, setPaperSubmittedMsg] = useState<string | null>(null);
  const [chosenConf, setChosenConf] = useState(conferences[0]?.id || "");
  const [paperTitle, setPaperTitle] = useState("");
  const [abstract, setAbstract] = useState("");

  // Post Submission Form State (Author Conference Debrief)
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postRating, setPostRating] = useState<number>(5);
  const [postSentiment, setPostSentiment] = useState<
    "Exceeded Expectations" | "Highly Productive" | "Good Experience" | "Room for Improvement" | "Critical Feedback"
  >("Highly Productive");
  const [postSession, setPostSession] = useState("");
  const [postPaper, setPostPaper] = useState("");
  const [postTagInput, setPostTagInput] = useState("Technical Session, Q&A, Research");
  const [submittingPost, setSubmittingPost] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState<"papers" | "tickets" | "debriefs">("papers");
  const [selectedTicketConf, setSelectedTicketConf] = useState<string>(conferences[0]?.id || "");
  const [selectedGateways, setSelectedGateways] = useState<Record<string, "eSewa" | "Khalti" | "Stripe">>({});

  // Sync selectedTicketConf when conferences load
  React.useEffect(() => {
    if (conferences.length > 0 && (!selectedTicketConf || !conferences.some(c => c.id === selectedTicketConf))) {
      setSelectedTicketConf(conferences[0].id);
    }
  }, [conferences]);

  // Filters
  const myPapers = papers.filter((p) => p.authorEmail.toLowerCase() === authorEmail.toLowerCase());
  const myOrders = orders.filter((o) => o.userEmail.toLowerCase() === authorEmail.toLowerCase());

  const handlePaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperTitle || !abstract || !chosenConf) return;
    setSubmittingPaper(true);
    try {
      await onSubmitPaper({
        conferenceId: chosenConf,
        title: paperTitle,
        authorName,
        authorEmail,
        abstractText: abstract,
      });
      setPaperTitle("");
      setAbstract("");
      setPaperSubmittedMsg("Manuscript ingested successfully. Domain tags extracted and routed to peer review.");
      setTimeout(() => setPaperSubmittedMsg(null), 6000);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingPaper(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    setSubmittingPost(true);
    try {
      const confObj = conferences.find((c) => c.id === chosenConf) || conferences[0];
      const tagsArray = postTagInput
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const payload = {
        authorName,
        authorEmail,
        authorInstitution,
        conferenceId: confObj?.id || "conf-1",
        conferenceTitle: confObj?.title || "IHCAST-2026",
        title: postTitle.trim(),
        content: postContent.trim(),
        rating: postRating,
        sentiment: postSentiment,
        tags: tagsArray.length > 0 ? tagsArray : ["Conference Review"],
        sessionAttended: postSession.trim() || undefined,
        paperTitle: postPaper.trim() || undefined,
      };

      if (onSubmitPost) {
        await onSubmitPost(payload);
      } else {
        await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setPostTitle("");
      setPostContent("");
      setPostSession("");
      setPostPaper("");
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to submit post:", err);
    } finally {
      setSubmittingPost(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "Under Review":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-800";
      case "Failed":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  // Automated Participation Certificates
  const handleDownloadCertificate = (order: Order) => {
    const confName = conferences.find((c) => c.id === order.conferenceId)?.title || "The ConfHub Conference";
    const certText = `------------------------------------------------------------
                     CONFHUB NEPAL SAAS
                   CERTIFICATE OF PARTICIPATION
    ------------------------------------------------------------
    This is to certify that:
    
    Name: ${order.userName.toUpperCase()}
    Email: ${order.userEmail}
    
    Has successfully purchased a Delegate Pass and participated in:
    "${confName}"
    
    Transaction Reference: ${order.trnRef}
    Amount Paid: ${order.currency} ${order.price.toLocaleString()}
    Pass Category: ${order.passType}
    Payment Gateway: ${order.gateway}
    Generated On: ${new Date(order.createdAt).toLocaleDateString()}
    
    ----------------- CONFHUB DIGITAL VERIFICATION -----------------`;

    const blob = new Blob([certText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ConfHub_Certificate_${order.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Official Tax Invoice & Payment Receipt
  const handleDownloadInvoice = (order: Order) => {
    const conf = conferences.find((c) => c.id === order.conferenceId);
    const confName = conf?.title || "Academic Conference Session";
    const invoiceText = `============================================================
              CONFHUB ACADEMIC CONFERENCE CLOUD
               OFFICIAL PAYMENT RECEIPT & INVOICE
============================================================
INVOICE NO     : INV-${order.id.toUpperCase()}
DATE OF ISSUE  : ${new Date(order.createdAt).toLocaleString()}
PAYMENT STATUS : ${order.status.toUpperCase()}
TRANSACTION REF: ${order.trnRef || "PENDING-MANUAL"}
PAYMENT GATEWAY: ${order.gateway}

CUSTOMER / DELEGATE DETAILS:
------------------------------------------------------------
Name        : ${order.userName}
Email       : ${order.userEmail}
Institution : ${authorInstitution || "Affiliated Scholar"}

CONFERENCE DETAILS:
------------------------------------------------------------
Assembly    : ${confName}
Date        : ${conf?.date || "Upcoming"}
Venue       : ${conf?.venue || "Main Convention Center"}

LINE ITEMS & REGISTRATION BREAKDOWN:
------------------------------------------------------------
Item: ${order.passType}
Qty : 1
Rate: ${order.currency} ${order.price.toLocaleString()}
------------------------------------------------------------
Subtotal        : ${order.currency} ${order.price.toLocaleString()}
Service Fee (0%): ${order.currency} 0.00
TOTAL PAID      : ${order.currency} ${order.price.toLocaleString()}
============================================================
Authorized by ConfHub Finance & Technical Committee
Verification URL: https://confhub.edu.np/verify/${order.trnRef}
============================================================`;

    const blob = new Blob([invoiceText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ConfHub_TaxInvoice_${order.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Session Header Identity Change */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold tracking-wider text-blue-600 uppercase">
            ACTIVE PORTAL IDENTIFIER
          </span>
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-semibold text-slate-800">{authorName}</h4>
            <span className="text-slate-300">&middot;</span>
            <span className="text-xs text-slate-500 font-mono">{authorEmail}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400 font-mono">Author Name:</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-medium focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400 font-mono">Email:</label>
            <input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-mono focus:border-blue-500 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("papers")}
          className={`pb-3 px-4 font-semibold text-xs relative transition-all cursor-pointer ${
            activeTab === "papers" ? "text-blue-600 border-b-2 border-blue-600 font-bold" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          Research &amp; Manuscripts
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`pb-3 px-4 font-semibold text-xs relative transition-all cursor-pointer ${
            activeTab === "tickets" ? "text-blue-600 border-b-2 border-blue-600 font-bold" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          Pass Purchasing &amp; Ticketing
        </button>
        <button
          onClick={() => setActiveTab("debriefs")}
          className={`pb-3 px-4 font-semibold text-xs relative transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeTab === "debriefs" ? "text-blue-600 border-b-2 border-blue-600 font-bold" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Conference Debriefs &amp; Reviews ({posts.length})</span>
        </button>
      </div>

      {activeTab === "papers" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Paper Submission Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs h-fit space-y-4">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-slate-850 text-sm">Submit New Manuscript</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload your abstract and research title. Our intelligent algorithmic system utilizes server-side Gemini to auto-tag subjects for domain routing.
            </p>

            {paperSubmittedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{paperSubmittedMsg}</span>
              </div>
            )}

            <form onSubmit={handlePaperSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Target Conference</label>
                <select
                  value={chosenConf}
                  onChange={(e) => setChosenConf(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-white text-slate-755 rounded-lg outline-none focus:border-blue-500 transition-colors"
                >
                  {conferences.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Manuscript Title</label>
                <input
                  type="text"
                  placeholder="e.g. Optimized Solar Panel Grids in Kathmandu Valley"
                  value={paperTitle}
                  onChange={(e) => setPaperTitle(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-white text-slate-700 rounded-lg outline-none placeholder-slate-400 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Structured Abstract</label>
                <textarea
                  rows={6}
                  placeholder="Insert introductory framework, methodology, experimental results, and conclusion of your submission (Min 50 words)..."
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 text-xs border border-slate-200 bg-white text-slate-700 rounded-lg outline-none placeholder-slate-400 focus:border-blue-500 transition-colors leading-relaxed font-sans"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingPaper}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                {submittingPaper ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Submission...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Submit to Peer Review Workflow</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* My Submitted Papers List */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                My Manuscripts &amp; Decisions ({myPapers.length})
              </h3>
            </div>

            {myPapers.length === 0 ? (
              <div className="bg-white p-12 border border-dashed border-slate-200 rounded-xl text-center">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">No papers submitted under this profile address yet.</p>
                <p className="text-[10px] text-slate-300 mt-1">Submit your first draft in the left sidebar form.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myPapers.map((paper) => {
                  const conf = conferences.find((c) => c.id === paper.conferenceId);
                  const paperReviews = reviews.filter((r) => r.paperId === paper.id);

                  return (
                    <div key={paper.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3.5 hover:border-slate-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${getStatusBadge(paper.status)}`}>
                            {paper.status}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">{paper.title}</h4>
                          <span className="text-[11px] text-slate-400 block">{conf?.title}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-150 line-clamp-3 leading-relaxed">
                        {paper.abstractText}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {paper.domainTags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono border border-slate-200">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Review results if any */}
                      {paperReviews.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-150 space-y-2">
                          <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                            Peer Reviewer Rubrics Feedback:
                          </span>
                          {paperReviews.map((rev) => (
                            <div key={rev.id} className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-xs space-y-1.5">
                              <div className="flex justify-between items-center text-[10px] text-blue-900 font-semibold font-mono">
                                <span>Blind Decision: {rev.overallDecision.toUpperCase()}</span>
                                <span>Orig: {rev.originality}/5 | Clar: {rev.clarity}/5 | Meth: {rev.methodology}/5</span>
                              </div>
                              <p className="text-slate-700 italic">{rev.detailedComments}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "tickets" && (
        <div className="space-y-6">
          {/* Dynamic Conference Selector Header */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Ticket className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-mono font-bold tracking-wider text-blue-600 uppercase">
                  DATABASE-SYNCED PASS PRICING &amp; REGISTRATION
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Select Conference to View Official Registration Tiers</h3>
              <p className="text-xs text-slate-500">
                Ticket rates and fee structures are dynamically retrieved from the conference database.
              </p>
            </div>

            <div className="w-full md:w-72">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                Active Conference
              </label>
              <select
                value={selectedTicketConf}
                onChange={(e) => setSelectedTicketConf(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-900 rounded-xl outline-none focus:border-blue-500 font-semibold cursor-pointer shadow-3xs"
              >
                {conferences.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Conference Info Banner */}
          {(() => {
            const currentConf = conferences.find((c) => c.id === selectedTicketConf) || conferences[0];
            const tiers = (currentConf && currentConf.ticketTiers && currentConf.ticketTiers.length > 0)
              ? currentConf.ticketTiers
              : [
                  {
                    id: `default-student-${currentConf?.id || '1'}`,
                    name: "Student Delegate Pass",
                    price: 1500,
                    currency: "NPR" as const,
                    description: "For verified undergraduate & graduate students.",
                    features: ["Access to technical sessions", "Participation Certificate", "Lunch & Refreshments"],
                    recommendedGateway: "eSewa" as const,
                    badgeText: "Student",
                    isPopular: false
                  },
                  {
                    id: `default-pro-${currentConf?.id || '1'}`,
                    name: "Professional Delegate Pass",
                    price: 3500,
                    currency: "NPR" as const,
                    description: "For faculty members, researchers, and engineers.",
                    features: ["Full access to keynotes & tracks", "Proceedings download", "Gala Networking Dinner"],
                    recommendedGateway: "Khalti" as const,
                    badgeText: "Most Popular",
                    isPopular: true
                  },
                  {
                    id: `default-intl-${currentConf?.id || '1'}`,
                    name: "International Delegate Pass",
                    price: 50,
                    currency: "USD" as const,
                    description: "For international participants and visiting scholars.",
                    features: ["Full 3-Day access", "International invoice & certificate", "VIP banquet table"],
                    recommendedGateway: "Stripe" as const,
                    badgeText: "International",
                    isPopular: false
                  }
                ];

            // Check if user has accepted paper for this conference
            const acceptedPaperForThisConf = papers.find(
              (p) => p.conferenceId === currentConf?.id && 
                     p.authorEmail.toLowerCase() === authorEmail.toLowerCase() && 
                     p.status === "Accepted"
            );

            return (
              <div className="space-y-6">
                {/* Conference Summary Bar */}
                {currentConf && (
                  <div className="bg-blue-50/60 border border-blue-100/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{currentConf.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px] mt-0.5">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{currentConf.date}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{currentConf.venue}</span>
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[10px]">
                            {currentConf.status || "Active"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {acceptedPaperForThisConf && (
                      <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center space-x-1.5 shadow-3xs">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Accepted Manuscript: "{acceptedPaperForThisConf.title.slice(0, 24)}..."</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Dynamic Tier Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {tiers.map((tier) => {
                    const currentGateway = selectedGateways[tier.id] || tier.recommendedGateway || "eSewa";

                    return (
                      <div
                        key={tier.id}
                        className={`bg-white rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5 transition-all relative border ${
                          tier.isPopular 
                            ? "border-2 border-slate-900 shadow-md ring-2 ring-slate-900/5" 
                            : "border-slate-200 hover:border-slate-350"
                        }`}
                      >
                        {tier.badgeText && (
                          <div className={`absolute top-0 right-5 -translate-y-1/2 px-2.5 py-0.5 rounded-full text-[9.5px] font-mono font-bold uppercase tracking-wider ${
                            tier.isPopular
                              ? "bg-blue-600 text-white shadow-3xs"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}>
                            {tier.badgeText}
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                              TIER CODE: {tier.id.toUpperCase().slice(-8)}
                            </span>
                            <h3 className="font-bold text-base text-slate-900 leading-snug">{tier.name}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                              {tier.description}
                            </p>
                          </div>

                          {/* Dynamic Database Price */}
                          <div className="pt-2 border-t border-slate-100">
                            <div className="flex items-baseline space-x-1.5">
                              <span className="font-mono text-2xl font-black text-slate-950">
                                {tier.currency} {tier.price.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">/ delegate</span>
                            </div>
                          </div>

                          {/* Features List */}
                          {tier.features && tier.features.length > 0 && (
                            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                              {tier.features.map((feat, idx) => (
                                <div key={idx} className="flex items-start space-x-2">
                                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span className="text-[11.5px] leading-tight">{feat}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-3 pt-2 border-t border-slate-100">
                          {/* Gateway Picker */}
                          <div className="space-y-1">
                            <span className="text-[9.5px] font-mono font-semibold text-slate-400 uppercase block">
                              Select Payment Gateway:
                            </span>
                            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                              <button
                                type="button"
                                onClick={() => setSelectedGateways((prev) => ({ ...prev, [tier.id]: "eSewa" }))}
                                className={`py-1 text-[10px] font-bold rounded font-mono transition-colors cursor-pointer text-center ${
                                  currentGateway === "eSewa"
                                    ? "bg-emerald-600 text-white shadow-3xs"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                eSewa
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedGateways((prev) => ({ ...prev, [tier.id]: "Khalti" }))}
                                className={`py-1 text-[10px] font-bold rounded font-mono transition-colors cursor-pointer text-center ${
                                  currentGateway === "Khalti"
                                    ? "bg-purple-600 text-white shadow-3xs"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                Khalti
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedGateways((prev) => ({ ...prev, [tier.id]: "Stripe" }))}
                                className={`py-1 text-[10px] font-bold rounded font-mono transition-colors cursor-pointer text-center ${
                                  currentGateway === "Stripe"
                                    ? "bg-blue-600 text-white shadow-3xs"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                Stripe
                              </button>
                            </div>
                          </div>

                          {/* Purchase Button */}
                          <button
                            onClick={() =>
                              onBuyTicket({
                                conferenceId: currentConf?.id || "conf-1",
                                passType: tier.name,
                                price: tier.price,
                                currency: tier.currency,
                                gateway: currentGateway,
                                userName: authorName,
                                userEmail: authorEmail,
                              })
                            }
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-2xs ${
                              currentGateway === "eSewa"
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : currentGateway === "Khalti"
                                ? "bg-purple-600 hover:bg-purple-700 text-white"
                                : "bg-slate-900 hover:bg-slate-800 text-white"
                            }`}
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>
                              Pay {tier.currency} {tier.price.toLocaleString()} via {currentGateway}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Purchased passes list */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <span>My Registered Passes &amp; Verified Invoices ({myOrders.length})</span>
              </h3>
              <span className="text-xs text-slate-400">Linked to: {authorEmail}</span>
            </div>

            {myOrders.length === 0 ? (
              <div className="bg-white p-10 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                <Ticket className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-semibold">No active passes registered under your profile email yet.</p>
                <p className="text-[11px] text-slate-400">Select a conference pass above to complete your delegate registration.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myOrders.map((order) => {
                  const conf = conferences.find((c) => c.id === order.conferenceId);
                  const isCompleted = order.status === "Completed";

                  return (
                    <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9.5px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide border ${getOrderStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">#{order.id}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{order.passType}</h4>
                        <p className="text-xs text-slate-500 font-medium">{conf?.title || order.conferenceId}</p>
                        
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400">Amount Paid:</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {order.currency} {order.price.toLocaleString()}
                          </span>
                        </div>

                        {isCompleted && (
                          <div className="text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-150 space-y-0.5 font-mono">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Gateway:</span>
                              <span className="font-bold text-slate-700">{order.gateway}</span>
                            </div>
                            <div className="flex justify-between truncate">
                              <span className="text-slate-400">TRN Ref:</span>
                              <span className="font-bold text-slate-700 truncate max-w-[140px]" title={order.trnRef}>{order.trnRef}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        {isCompleted ? (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleDownloadCertificate(order)}
                              className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[10px] rounded-lg transition-colors cursor-pointer text-center border border-blue-150 shadow-3xs"
                            >
                              Certificate
                            </button>
                            <button
                              onClick={() => handleDownloadInvoice(order)}
                              className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] rounded-lg transition-colors cursor-pointer text-center border border-slate-200 shadow-3xs"
                            >
                              Tax Invoice
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-orange-600 block bg-orange-50 border border-orange-100 rounded-lg px-2.5 py-1.5 font-semibold text-center">
                            Awaiting Payment Verification
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AUTHOR POST-CONFERENCE DEBRIEFS */}
      {activeTab === "debriefs" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Create Author Debrief Post Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-fit space-y-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Share Conference Experience &amp; Debrief</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Post your retrospective impressions on how the conference went (e.g. presentation engagement, session moderation, reviewer interactions, venue networking).
            </p>

            {postSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center space-x-1.5">
                <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your conference debrief has been published to the Reviewer Board!</span>
              </div>
            )}

            <form onSubmit={handlePostSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Target Conference
                </label>
                <select
                  value={chosenConf}
                  onChange={(e) => setChosenConf(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 bg-white text-slate-800 rounded-xl outline-none focus:border-blue-500"
                >
                  {conferences.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Post Title / Summary Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Great Q&A Engagement in Session A on AI Models"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 bg-white text-slate-800 rounded-xl outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Rating (1 to 5 Stars)
                  </label>
                  <select
                    value={postRating}
                    onChange={(e) => setPostRating(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 bg-white text-slate-800 rounded-xl outline-none focus:border-blue-500 font-bold"
                  >
                    <option value={5}>5 - Outstanding (★ 5.0)</option>
                    <option value={4}>4 - Very Good (★ 4.0)</option>
                    <option value={3}>3 - Average (★ 3.0)</option>
                    <option value={2}>2 - Needs Improvement (★ 2.0)</option>
                    <option value={1}>1 - Disappointing (★ 1.0)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Sentiment Verdict
                  </label>
                  <select
                    value={postSentiment}
                    onChange={(e: any) => setPostSentiment(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 bg-white text-slate-800 rounded-xl outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Exceeded Expectations">Exceeded Expectations</option>
                    <option value="Highly Productive">Highly Productive</option>
                    <option value="Good Experience">Good Experience</option>
                    <option value="Room for Improvement">Room for Improvement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Session Attended / Track (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Technical Session A: Edge AI & GIS Applications"
                  value={postSession}
                  onChange={(e) => setPostSession(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 bg-white text-slate-800 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Associated Manuscript Presented (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deep Neural Forecasting for Monsoon Landslide Prediction"
                  value={postPaper}
                  onChange={(e) => setPostPaper(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 bg-white text-slate-800 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Detailed Experience &amp; Feedback
                </label>
                <textarea
                  rows={5}
                  placeholder="Share details on presentation atmosphere, peer feedback, hall facilities, session timing, or networking value..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 text-xs border border-slate-200 bg-white text-slate-800 rounded-xl outline-none focus:border-blue-500 leading-relaxed font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Topic Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Technical Session, Q&A, Networking, Logistics"
                  value={postTagInput}
                  onChange={(e) => setPostTagInput(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 bg-white text-slate-800 rounded-xl outline-none focus:border-blue-500 font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingPost}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {submittingPost ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Debrief...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Conference Debrief</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Published Author Posts Feed */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Conference Author Debriefs &amp; Retrospectives ({posts.length})
              </h3>
            </div>

            {posts.length === 0 ? (
              <div className="bg-white p-12 border border-dashed border-slate-200 rounded-2xl text-center">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">No debrief posts published yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Be the first author to share conference feedback!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {post.authorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <strong className="text-xs font-bold text-slate-900">{post.authorName}</strong>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {post.authorInstitution || post.authorEmail}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="flex items-center space-x-1 text-xs font-bold font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{post.rating}.0</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {post.sentiment}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">{post.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-line">{post.content}</p>

                    {/* Reviewer replies */}
                    {post.reviewerResponses && post.reviewerResponses.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center space-x-1">
                          <Award className="w-3 h-3 text-indigo-600" />
                          <span>Reviewer Committee Reply:</span>
                        </span>
                        {post.reviewerResponses.map((r) => (
                          <div key={r.id} className="text-xs text-slate-700 pl-3 border-l-2 border-indigo-400">
                            <strong className="text-slate-900">{r.reviewerName}:</strong> {r.comment}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
