import React, { useState, useEffect } from "react";
import {
  Conference,
  Paper,
  Reviewer,
  Review,
  Order,
  ScheduleItem,
  AuthorPost,
  UserRole,
} from "./types";
import { AdminPortal } from "./components/AdminPortal";
import { ReviewerPortal } from "./components/ReviewerPortal";
import { AuthorPortal } from "./components/AuthorPortal";
import { CheckoutModal } from "./components/CheckoutModal";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { 
  ShieldCheck, 
  BookOpen, 
  User, 
  RefreshCw, 
  LayoutDashboard, 
  Activity, 
  AlertCircle, 
  LogOut, 
  Lock, 
  ShieldAlert,
  Sparkles,
  GraduationCap
} from "lucide-react";

export default function App() {
  // DB States
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [posts, setPosts] = useState<AuthorPost[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState("");

  // Portal Switch State: "admin" | "reviewer" | "author" | "student"
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");

  // Navigation Routing States
  const [currentView, setCurrentView] = useState<"landing" | "login" | "signup" | "app">("landing");

  // Persisted Users Session State
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: UserRole;
    token?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem("confhub_user_session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // State to track blocked role switch attempts for RBAC dialog
  const [restrictedAttemptRole, setRestrictedAttemptRole] = useState<UserRole | null>(null);

  // Ensure role lock: If user is logged in, currentRole MUST match currentUser.role
  useEffect(() => {
    if (currentUser) {
      setCurrentRole(currentUser.role);
    }
  }, [currentUser]);

  const handleLoginSuccess = (userSession: {
    name: string;
    email: string;
    role: UserRole;
    token?: string;
  }) => {
    const session = {
      name: userSession.name,
      email: userSession.email.toLowerCase(),
      role: userSession.role,
      token: userSession.token || `cfh_tok_${Date.now().toString(36)}`,
    };
    localStorage.setItem("confhub_user_session", JSON.stringify(session));
    setCurrentUser(session);
    setCurrentRole(userSession.role);
    if (userSession.role === "student") {
      setCurrentView("landing");
      showToast(`Welcome, ${userSession.name}! Logged in as Student Delegate.`, "success");
    } else {
      setCurrentView("app");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("confhub_user_session");
    setCurrentUser(null);
    setCurrentView("landing");
  };

  const handleRoleSwitchRequest = (targetRole: "admin" | "reviewer" | "author") => {
    if (currentUser) {
      if (currentUser.role !== targetRole) {
        // Intercept attempt to access unauthorized role
        setRestrictedAttemptRole(targetRole);
      } else {
        setCurrentRole(targetRole);
      }
    } else {
      // Guest visitor: allow viewing role portal
      setCurrentRole(targetRole);
    }
  };

  const handleNavigationChange = (
    view: "landing" | "login" | "signup" | "app", 
    selectedRole?: UserRole
  ) => {
    if (currentUser) {
      // Student role is exclusively scoped to landing portal features
      if (currentUser.role === "student") {
        if (view === "app") {
          showToast("Student delegates have full access to schedule, tracks, and student pass tickets on the landing page.", "info");
          setCurrentView("landing");
          return;
        }
        if (view === "login" || view === "signup") {
          setCurrentView("landing");
          return;
        }
        setCurrentView(view);
        return;
      }

      // User is ALREADY logged in: intercept any attempt to go to login or signup page
      if (view === "login" || view === "signup") {
        if (selectedRole) {
          if (selectedRole === currentUser.role) {
            setCurrentRole(currentUser.role);
            setCurrentView("app");
            return;
          } else {
            // User requested a role portal different from their logged-in session role
            setRestrictedAttemptRole(selectedRole);
            setCurrentRole(currentUser.role);
            setCurrentView("app");
            return;
          }
        } else {
          // Plain "login" or "signup" navigation -> direct directly to active app view
          setCurrentRole(currentUser.role);
          setCurrentView("app");
          return;
        }
      }

      if (view === "app") {
        if (selectedRole && selectedRole !== currentUser.role) {
          setRestrictedAttemptRole(selectedRole);
          setCurrentRole(currentUser.role);
          setCurrentView("app");
          return;
        }
        if (selectedRole) {
          setCurrentRole(selectedRole);
        }
        setCurrentView("app");
        return;
      }
    }

    if (selectedRole) {
      setCurrentRole(selectedRole);
    }
    setCurrentView(view);
  };

  const handleRefreshState = async () => {
    await fetchState();
  };

  // checkout status order state
  const [pendingCheckoutOrder, setPendingCheckoutOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Load from API on mount
  const fetchState = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/db");
      if (!res.ok) throw new Error("Could not connect to fullstack backend state.");
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const db = await res.json();
        setConferences(db.conferences || []);
        setPapers(db.papers || []);
        setReviewers(db.reviewers || []);
        setReviews(db.reviews || []);
        setOrders(db.orders || []);
        setSchedule(db.schedule || []);
        setPosts(db.posts || []);
        setErrorStatus("");
      }
    } catch (e: any) {
      console.error(e);
      setErrorStatus("Failed to reconcile remote database. Please ensure 'tsx server.ts' backend of ConfHub is initialized properly.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // ---------------- DB PERSISTENT ACTIONS ----------------

  // Create author conference debrief post
  const handleCreatePost = async (postData: any) => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      if (res.ok) {
        await fetchState();
        showToast("Conference debrief & review posted successfully.", "success");
      } else {
        const err = await res.json().catch(() => ({ error: "Failed to post debrief" }));
        showToast(err.error || "Failed to post debrief.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error creating post. Please check connection.", "error");
    }
  };

  // Like or endorse author debrief post
  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser ? currentUser.email : "reviewer" }),
      });
      if (res.ok) {
        await fetchState();
        showToast("Endorsement / like updated.", "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add reviewer response to author debrief post
  const handleAddReviewerResponse = async (postId: string, comment: string) => {
    try {
      const reviewerName = currentUser?.role === "reviewer" ? currentUser.name : activeReviewer.name;
      const reviewerId = currentUser?.role === "reviewer" ? currentUser.email : activeReviewer.id;

      const res = await fetch(`/api/posts/${postId}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerId,
          reviewerName,
          comment,
        }),
      });
      if (res.ok) {
        await fetchState();
        showToast("Official reviewer response published to author debrief.", "success");
      } else {
        showToast("Failed to post reviewer response.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error submitting response.", "error");
    }
  };

  // Create conference
  const handleCreateConference = async (conf: { title: string; date: string; venue: string; deadline: string }) => {
    try {
      const res = await fetch("/api/conferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conf),
      });
      if (res.ok) {
        await fetchState();
        showToast("Conference assembly created and synchronized successfully.", "success");
      } else {
        const err = await res.json().catch(() => ({ error: "Failed to create assembly" }));
        showToast(err.error || "Failed to instantiate conference assembly.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error creating conference assembly.", "error");
    }
  };

  // Delete conference assembly
  const handleDeleteConference = async (conferenceId: string) => {
    try {
      const res = await fetch(`/api/conferences/${conferenceId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchState();
        showToast("Conference assembly deleted successfully.", "success");
      } else {
        const err = await res.json().catch(() => ({ error: "Failed to delete assembly" }));
        showToast(err.error || "Failed to delete conference assembly.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error deleting conference assembly.", "error");
    }
  };

  // Submit Paper
  const handleSubmitPaper = async (paperData: {
    conferenceId: string;
    title: string;
    authorName: string;
    authorEmail: string;
    abstractText: string;
  }) => {
    try {
      const res = await fetch("/api/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paperData),
      });
      if (res.ok) {
        await fetchState();
        showToast(`Manuscript "${paperData.title}" submitted successfully! AI domain auto-tagging initialized.`, "success");
      } else {
        const err = await res.json().catch(() => ({ error: "Submission failed" }));
        showToast(err.error || "Failed to submit manuscript.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error submitting manuscript.", "error");
    }
  };

  // Auto matching algorithm
  const handleAutoMatchPaper = async (paperId: string) => {
    try {
      const res = await fetch(`/api/papers/${paperId}/auto-match`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        await fetchState();
        if (data.matchedReviewer) {
          showToast(`Algorithm matched Dr. ${data.matchedReviewer.name} (Tag overlap score: ${data.score})`, "success");
        } else {
          showToast("Auto-match completed with fallback reviewer.", "info");
        }
        return {
          matchedReviewer: data.matchedReviewer,
          score: data.score,
        };
      }
      showToast("Auto-matching failed to find suitable reviewers.", "error");
      return { matchedReviewer: null, score: 0 };
    } catch (e) {
      console.error(e);
      showToast("Auto-match server error.", "error");
      return { matchedReviewer: null, score: 0 };
    }
  };

  // Manual reviewer override
  const handleManualAssign = async (paperId: string, reviewerId: string) => {
    try {
      const res = await fetch(`/api/papers/${paperId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewerId }),
      });
      if (res.ok) {
        await fetchState();
        showToast(reviewerId ? "Reviewer successfully assigned to manuscript." : "Reviewer unassigned.", "success");
      } else {
        showToast("Failed to assign reviewer.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error assigning reviewer.", "error");
    }
  };

  // Unassign reviewer from manuscript
  const handleUnassignReviewer = async (paperId: string) => {
    try {
      const res = await fetch(`/api/papers/${paperId}/assign`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchState();
        showToast("Reviewer assignment removed from manuscript.", "success");
      } else {
        showToast("Failed to unassign reviewer.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error unassigning reviewer.", "error");
    }
  };

  // Register new peer reviewer
  const handleRegisterReviewer = async (reviewerData: { name: string; email: string; domains: string[] }) => {
    try {
      const res = await fetch("/api/reviewers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewerData),
      });
      if (res.ok) {
        await fetchState();
        showToast(`Reviewer ${reviewerData.name} successfully registered.`, "success");
      } else {
        const err = await res.json().catch(() => ({ error: "Failed to register reviewer" }));
        showToast(err.error || "Failed to register reviewer.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error registering reviewer.", "error");
    }
  };

  // Accepted or rejected paper
  const handleUpdateStatus = async (paperId: string, status: "Accepted" | "Rejected") => {
    try {
      const res = await fetch(`/api/papers/${paperId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchState();
        showToast(`Manuscript decision updated to ${status}.`, "success");
      } else {
        showToast("Failed to update manuscript decision status.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error updating paper status.", "error");
    }
  };

  // Submit Review Rubrics comments
  const handleSubmitReview = async (reviewData: {
    paperId: string;
    reviewerId: string;
    originality: number;
    clarity: number;
    methodology: number;
    overallDecision: "Accept" | "Weak Accept" | "Neutral" | "Reject";
    detailedComments: string;
  }) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });
      if (res.ok) {
        await fetchState();
        showToast("Completed! Peer evaluation review data and rubrics scores saved successfully.", "success");
      } else {
        const data = await res.json().catch(() => ({ error: "Submission rejected" }));
        showToast(data.error || "Permission denied: Only assigned reviewers can evaluate this manuscript.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error submitting evaluation review. Please try again.", "error");
    }
  };

  // Buy pass tickets
  const handleBuyTicket = async (ticketConfig: {
    conferenceId: string;
    passType: string;
    price: number;
    currency: string;
    gateway: "eSewa" | "Khalti" | "Stripe";
    userName?: string;
    userEmail?: string;
  }) => {
    // Restrict ticket process to logged-in users only
    if (!currentUser || !currentUser.email) {
      showToast("Access Denied: You must be logged in to access the ticket purchasing process.", "error");
      setCurrentView("login");
      return;
    }

    try {
      const payload = {
        userName: ticketConfig.userName || currentUser.name,
        userEmail: ticketConfig.userEmail || currentUser.email,
        userToken: currentUser.token,
        ...ticketConfig,
      };
      
      const res = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser.token || ""}`,
          "x-auth-token": currentUser.token || "",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          showToast("Authentication Required: You must be logged in with a valid account token to purchase tickets.", "error");
          setCurrentView("login");
          return;
        }
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.error || "Could not initiate checkout pass. Please try again.", "error");
        return;
      }

      const order = await res.json();
      if (!order || !order.id) {
        showToast("Unable to generate valid order. Please try again.", "error");
        return;
      }

      await fetchState();
      
      // Pop up the secure custom fintech gateway screen
      setPendingCheckoutOrder(order);
    } catch (e) {
      console.error(e);
      showToast("Could not initiate checkout pass. Please try again.", "error");
    }
  };

  // Verify fintech webhook sandbox
  const handleVerifyCheckout = async (success: boolean, trnRef?: string) => {
    if (!pendingCheckoutOrder) return;
    try {
      const res = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: pendingCheckoutOrder.id,
          success,
          trnRef,
        }),
      });
      if (res.ok) {
        setPendingCheckoutOrder(null);
        await fetchState();
        showToast(
          `Payment ${success ? "APPROVED & VERIFIED" : "CANCELLED"}: Delegate ticket pass for ${pendingCheckoutOrder.passType} recorded.`,
          success ? "success" : "info"
        );
      } else {
        const err = await res.json().catch(() => ({ error: "Verification failed" }));
        showToast(`Payment verification error: ${err.error || "Failed"}`, "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Payment verification failed to communicate with server.", "error");
    }
  };

  // Drag and drop schedule sync
  const handleSaveSchedule = async (newSchedule: ScheduleItem[]) => {
    try {
      const res = await fetch("/api/schedule/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: newSchedule }),
      });
      if (res.ok) {
        await fetchState();
        showToast("Conference session schedule timeline updated.", "success");
      }
    } catch (e) {
      console.error(e);
      showToast("Error updating session schedule.", "error");
    }
  };

  // active reviewer object derived from authenticated reviewer session
  const activeReviewer: Reviewer = (currentUser && currentUser.role === "reviewer")
    ? (reviewers.find((r) => r.email?.toLowerCase() === currentUser.email?.toLowerCase()) || {
        id: currentUser.email,
        name: currentUser.name,
        email: currentUser.email,
        domains: ["Artificial Intelligence", "Computer Science"],
      })
    : (reviewers[0] || {
        id: "rev-active",
        name: "Peer Reviewer",
        email: "reviewer@confhub.saas",
        domains: ["Artificial Intelligence"],
      });

  if (currentView === "landing") {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 max-w-md p-4 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700 flex items-center justify-between space-x-3 text-xs">
            <span className={toastMessage.type === "error" ? "text-red-400" : toastMessage.type === "info" ? "text-blue-300" : "text-emerald-400 font-medium"}>
              {toastMessage.text}
            </span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white font-bold ml-2">✕</button>
          </div>
        )}
        <LandingPage
          conferences={conferences}
          schedule={schedule}
          orders={orders}
          onNavigate={handleNavigationChange}
          isLoggedIn={!!currentUser}
          currentUser={currentUser}
          onLogout={handleLogout}
          onBuyTicket={handleBuyTicket}
        />
        <CheckoutModal
          order={pendingCheckoutOrder}
          isOpen={!!pendingCheckoutOrder}
          onClose={() => setPendingCheckoutOrder(null)}
          onVerify={handleVerifyCheckout}
        />
      </>
    );
  }

  if (currentView === "login") {
    return (
      <LoginPage
        reviewers={reviewers}
        onNavigate={handleNavigationChange}
        onLoginSuccess={handleLoginSuccess}
        defaultRole={currentRole}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === "signup") {
    return (
      <SignupPage
        onNavigate={handleNavigationChange}
        onRefreshDatabase={handleRefreshState}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans antialiased flex flex-col justify-between">
      
      {/* 1. TOP HEADER BRAND AND PORTAL SELECTORS */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div id="main_header_container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 select-none cursor-pointer" onClick={() => setCurrentView("landing")}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg shadow-xs">
              <div className="w-3.5 h-3.5 bg-white rounded-sm rotate-45"></div>
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-800 tracking-tight leading-none">
                <span>ConfHub</span>
              </h1>
              <p className="text-[10px] text-slate-400 mt-1 tracking-tight font-medium">Conference Board</p>
            </div>
          </div>

          {/* Active User Session badges */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200/80 p-1.5 pr-3 rounded-xl select-none">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                  currentUser.role === "admin" ? "bg-blue-600" : currentUser.role === "reviewer" ? "bg-purple-600" : "bg-emerald-600"
                }`}>
                  {currentUser.role === "admin" ? <ShieldCheck className="w-4 h-4" /> : currentUser.role === "reviewer" ? <BookOpen className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{currentUser.name}</span>
                    <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded border ${
                      currentUser.role === "admin" ? "bg-blue-50 text-blue-700 border-blue-200" : currentUser.role === "reviewer" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {currentUser.role}
                    </span>
                    {currentUser.token && (
                      <span className="text-[9px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded hidden sm:inline-block" title={`User Token: ${currentUser.token}`}>
                        Token: {currentUser.token.slice(0, 11)}...
                      </span>
                    )}
                  </div>
                  <span className="block text-[10px] text-slate-400 font-mono truncate max-w-[150px]">{currentUser.email}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-slate-100 text-slate-600 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Guest Visitor</span>
              </div>
            )}

            <button
              onClick={() => setCurrentView("landing")}
              className="text-xs text-blue-600 hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
              title="Return to public home screen"
            >
              Home
            </button>

            {currentUser ? (
              <button
                onClick={handleLogout}
                className="p-1 px-2.5 hover:bg-rose-50 text-rose-600 border border-rose-200/50 rounded-lg duration-200 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-3xs"
                title="Logout Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavigationChange("login", currentRole)}
                className="p-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg duration-200 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-3xs"
              >
                <span>Sign In</span>
              </button>
            )}

            {/* Sync actions */}
            <button
              onClick={fetchState}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-250 hidden md:inline-flex bg-white shadow-3xs cursor-pointer"
              title="Refresh database data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN HUB WORKSPACE GRID */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Guest Preview Mode Info Banner if not signed in */}
        {!currentUser && (
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-3xs">
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Guest Preview Mode: </span>
                <span>You are exploring the <strong className="uppercase font-mono font-bold text-amber-950">{currentRole}</strong> workspace as an unauthenticated visitor.</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleNavigationChange("login", currentRole)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
              >
                Log In as {currentRole.toUpperCase()}
              </button>
            </div>
          </div>
        )}

        {/* Error Alert Info banner */}
        {errorStatus && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
            <p className="font-semibold">{errorStatus}</p>
          </div>
        )}

        {loading ? (
          <div className="p-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400 font-mono tracking-wider">Syncing ConfHub database indexes...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* PORTAL RENDER ROUTER */}
            {currentRole === "admin" && (
              <AdminPortal
                conferences={conferences}
                papers={papers}
                reviewers={reviewers}
                orders={orders}
                schedule={schedule}
                onCreateConference={handleCreateConference}
                onDeleteConference={handleDeleteConference}
                onRegisterReviewer={handleRegisterReviewer}
                onAutoMatchPaper={handleAutoMatchPaper}
                onManualAssign={handleManualAssign}
                onUnassignReviewer={handleUnassignReviewer}
                onUpdatePaperStatus={handleUpdateStatus}
                onSaveSchedule={handleSaveSchedule}
                onRefreshOrders={fetchState}
              />
            )}

            {currentRole === "reviewer" && (
              <div className="animate-in fade-in duration-200">
                <ReviewerPortal
                  reviewer={activeReviewer}
                  assignedPapers={papers.filter((p) => 
                    p.assignedReviewerId === activeReviewer.id || 
                    (activeReviewer.email && p.assignedReviewerId === activeReviewer.email) ||
                    (currentUser && p.assignedReviewerId === currentUser.email)
                  )}
                  allPapers={papers}
                  reviews={reviews}
                  posts={posts}
                  conferences={conferences}
                  schedule={schedule}
                  onSubmitReview={handleSubmitReview}
                  onLikePost={handleLikePost}
                  onAddReviewerResponse={handleAddReviewerResponse}
                />
              </div>
            )}

            {currentRole === "author" && (
              <div className="animate-in fade-in duration-200">
                <AuthorPortal
                  conferences={conferences}
                  papers={papers}
                  orders={orders}
                  reviews={reviews}
                  posts={posts}
                  currentUser={currentUser}
                  onSubmitPaper={handleSubmitPaper}
                  onBuyTicket={handleBuyTicket}
                  onSubmitPost={handleCreatePost}
                  onLikePost={handleLikePost}
                />
              </div>
            )}

          </div>
        )}

      </main>

      {/* 3. TRANSACTION MODAL IF CHECKOUT TRIGGERED */}
      {pendingCheckoutOrder && (
        <CheckoutModal
          order={pendingCheckoutOrder}
          onVerify={handleVerifyCheckout}
          onClose={() => setPendingCheckoutOrder(null)}
        />
      )}

      {/* 4. ROLE GUARD ACCESS RESTRICTED MODAL */}
      {restrictedAttemptRole && currentUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>Access Restricted: Role Security Enforced</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You are logged in as <strong className="text-slate-800 font-bold">{currentUser.name}</strong> with the <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">{currentUser.role}</span> role.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
              <p className="font-medium text-slate-700">
                Your current account permissions strictly limit access to the <strong className="text-slate-900 uppercase font-mono">{currentUser.role}</strong> portal.
              </p>
              <p className="text-[11px] text-slate-500">
                To view or perform actions on the <strong className="text-slate-900 uppercase font-mono">{restrictedAttemptRole}</strong> portal, please sign out of your current session first.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRestrictedAttemptRole(null)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Stay on {currentUser.role.toUpperCase()} Portal
              </button>
              <button
                onClick={() => {
                  const target = restrictedAttemptRole;
                  setRestrictedAttemptRole(null);
                  handleLogout();
                  handleNavigationChange("login", target);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out &amp; Switch to {restrictedAttemptRole.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global In-App Toast Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 max-w-md p-4 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700 flex items-center justify-between space-x-3 text-xs">
          <span className={toastMessage.type === "error" ? "text-red-400" : toastMessage.type === "info" ? "text-blue-300" : "text-emerald-400 font-medium"}>
            {toastMessage.text}
          </span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* 4. DESIGN CREDITS FOOTER PANEL */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <div className="flex items-center space-x-2 font-mono">
            <LayoutDashboard className="w-4 h-4 text-blue-600" />
            <span>ConfHub &middot; Academic Conference Management Platform</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400 font-medium">
            <span>Kathmandu, Nepal</span>
            <span>&middot;</span>
            <span>Scopus &amp; DOAJ Ingestion Compliant</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
