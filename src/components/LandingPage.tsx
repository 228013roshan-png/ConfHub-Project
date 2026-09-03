import React, { useState } from "react";
import { 
  ShieldCheck, 
  BookOpen, 
  User, 
  ArrowRight, 
  Check, 
  Database, 
  Award, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Zap, 
  TrendingUp, 
  Lock,
  FileText,
  Code,
  CreditCard,
  Search,
  Building2,
  Home,
  Clock,
  Bookmark,
  BookmarkCheck,
  Download,
  ExternalLink,
  Layers,
  Ticket,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Tag,
  GraduationCap
} from "lucide-react";
import { Conference, ScheduleItem, Order, UserRole, UserSession } from "../types";

export type LandingTab = "home" | "features" | "schedule" | "tickets";

interface LandingPageProps {
  conferences: Conference[];
  schedule: ScheduleItem[];
  orders?: Order[];
  onNavigate: (view: "landing" | "login" | "signup" | "app", selectedRole?: UserRole) => void;
  isLoggedIn: boolean;
  currentUser: UserSession | null;
  onLogout: () => void;
  onBuyTicket?: (ticketConfig: {
    conferenceId: string;
    passType: string;
    price: number;
    currency: string;
    gateway: "eSewa" | "Khalti" | "Stripe";
    userName?: string;
    userEmail?: string;
  }) => Promise<void>;
  initialTab?: LandingTab;
}

export function LandingPage({ 
  conferences, 
  schedule, 
  orders = [],
  onNavigate, 
  isLoggedIn, 
  currentUser, 
  onLogout,
  onBuyTicket,
  initialTab = "home"
}: LandingPageProps) {
  
  const [activeTab, setActiveTab] = useState<LandingTab>(initialTab);
  const [selectedTicketConfId, setSelectedTicketConfId] = useState<string>(conferences[0]?.id || "");

  // Dynamic Schedule State
  const [selectedScheduleConfId, setSelectedScheduleConfId] = useState<string>("all");
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState<string>("All");
  const [selectedScheduleRoom, setSelectedScheduleRoom] = useState<string>("All");
  const [scheduleViewMode, setScheduleViewMode] = useState<"timeline" | "halls">("timeline");
  const [savedSessionIds, setSavedSessionIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("confhub_saved_sessions");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [calendarNotification, setCalendarNotification] = useState<string | null>(null);

  // Sync selectedTicketConfId if conferences change
  React.useEffect(() => {
    if (conferences.length > 0 && (!selectedTicketConfId || !conferences.some(c => c.id === selectedTicketConfId))) {
      setSelectedTicketConfId(conferences[0].id);
    }
  }, [conferences]);

  const switchTab = (tab: LandingTab) => {
    if (tab === "tickets" && !isLoggedIn) {
      onNavigate("login");
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle saving sessions to user's personalized agenda
  const toggleSaveSession = (sessionId: string) => {
    setSavedSessionIds(prev => {
      const next = prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId];
      try {
        localStorage.setItem("confhub_saved_sessions", JSON.stringify(next));
      } catch (err) {
        console.error("Failed to save session agenda:", err);
      }
      return next;
    });
  };

  // Export session as .ics file for Apple Calendar, Outlook, Google Calendar
  const exportSessionICS = (item: ScheduleItem, confTitle: string) => {
    const cleanTitle = item.sessionTitle.replace(/[\r\n]/g, " ");
    const cleanSpeaker = item.speaker.replace(/[\r\n]/g, " ");
    const cleanRoom = item.room.replace(/[\r\n]/g, " ");
    const cleanConf = confTitle.replace(/[\r\n]/g, " ");

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ConfHub//Academic Schedule//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `SUMMARY:${cleanTitle}`,
      `DESCRIPTION:Speaker / Presenter: ${cleanSpeaker}\\nCategory: ${item.type}\\nConference: ${cleanConf}`,
      `LOCATION:${cleanRoom}`,
      `STATUS:CONFIRMED`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${item.sessionTitle.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCalendarNotification(`Exported "${item.sessionTitle.slice(0, 35)}..." (.ics)`);
    setTimeout(() => setCalendarNotification(null), 3500);
  };

  // Generate direct Google Calendar creation link
  const getGoogleCalendarUrl = (item: ScheduleItem, confTitle: string) => {
    const text = encodeURIComponent(item.sessionTitle);
    const details = encodeURIComponent(
      `Presenter: ${item.speaker}\nCategory: ${item.type}\nRoom: ${item.room}\nConference: ${confTitle}\nSession Time: ${item.timeSlot}`
    );
    const location = encodeURIComponent(item.room);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}`;
  };

  // Conference lookup map
  const confMap = React.useMemo(() => {
    const map = new Map<string, Conference>();
    conferences.forEach(c => map.set(c.id, c));
    return map;
  }, [conferences]);

  // Selected conference object for detailed view
  const selectedScheduleConf = conferences.find(c => c.id === selectedScheduleConfId);

  // Available session types for active selection
  const availableTypes = React.useMemo(() => {
    const baseItems = selectedScheduleConfId === "all" 
      ? schedule 
      : schedule.filter(s => s.conferenceId === selectedScheduleConfId);
    const types = new Set<string>();
    baseItems.forEach(item => {
      if (item.type) types.add(item.type);
    });
    return ["All", ...Array.from(types)];
  }, [schedule, selectedScheduleConfId]);

  // Available halls/rooms for active selection
  const availableRooms = React.useMemo(() => {
    const baseItems = selectedScheduleConfId === "all" 
      ? schedule 
      : schedule.filter(s => s.conferenceId === selectedScheduleConfId);
    const rooms = new Set<string>();
    baseItems.forEach(item => {
      if (item.room) rooms.add(item.room);
    });
    return ["All", ...Array.from(rooms)];
  }, [schedule, selectedScheduleConfId]);

  // Dynamic filtered schedule items
  const filteredSchedule = React.useMemo(() => {
    return schedule.filter((item) => {
      // 1. Conference filter
      if (selectedScheduleConfId !== "all" && item.conferenceId !== selectedScheduleConfId) {
        return false;
      }
      // 2. Type filter
      if (scheduleFilter !== "All" && item.type !== scheduleFilter) {
        return false;
      }
      // 3. Room filter
      if (selectedScheduleRoom !== "All" && item.room !== selectedScheduleRoom) {
        return false;
      }
      // 4. Saved only filter
      if (showSavedOnly && !savedSessionIds.includes(item.id)) {
        return false;
      }
      // 5. Search query
      if (scheduleSearch.trim()) {
        const query = scheduleSearch.toLowerCase();
        const confTitle = confMap.get(item.conferenceId)?.title.toLowerCase() || "";
        const matches = item.sessionTitle.toLowerCase().includes(query) ||
                        item.speaker.toLowerCase().includes(query) ||
                        item.room.toLowerCase().includes(query) ||
                        confTitle.includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }, [schedule, selectedScheduleConfId, scheduleFilter, selectedScheduleRoom, showSavedOnly, savedSessionIds, scheduleSearch, confMap]);

  // Grouped by Room for "Halls & Tracks View"
  const groupedByRoom = React.useMemo(() => {
    const map: { [room: string]: ScheduleItem[] } = {};
    filteredSchedule.forEach(item => {
      const room = item.room || "General Hall";
      if (!map[room]) map[room] = [];
      map[room].push(item);
    });
    return map;
  }, [filteredSchedule]);

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* 1. TOP CONSISTENT NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 select-none cursor-pointer" onClick={() => switchTab("home")}>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-xs">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-800 tracking-tight leading-none">
                <span>ConfHub</span>
              </h1>
              <p className="text-[10px] text-slate-400 mt-1 tracking-tight font-medium">Easy Conference Tool</p>
            </div>
          </div>

          {/* Dedicated Page Navbar Tabs */}
          <div className="hidden md:flex items-center space-x-1 text-xs font-semibold">
            <button
              onClick={() => switchTab("home")}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "home"
                  ? "text-blue-600 bg-blue-50 font-bold border border-blue-100/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => switchTab("features")}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "features"
                  ? "text-blue-600 bg-blue-50 font-bold border border-blue-100/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Features</span>
            </button>

            <button
              onClick={() => switchTab("schedule")}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "schedule"
                  ? "text-blue-600 bg-blue-50 font-bold border border-blue-100/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </button>

            <button
              onClick={() => {
                if (!isLoggedIn) {
                  onNavigate("login");
                } else {
                  switchTab("tickets");
                }
              }}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "tickets"
                  ? "text-blue-600 bg-blue-50 font-bold border border-blue-100/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Tickets</span>
              {!isLoggedIn && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
            </button>
          </div>

          {/* Right User Call to Actions */}
          <div className="flex items-center space-x-3">
            {isLoggedIn && currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <span className={`block text-[10px] font-bold uppercase tracking-wider ${
                      currentUser.role === "student" ? "text-emerald-600" : "text-slate-400"
                    }`}>
                      {currentUser.role === "student" ? "Student Delegate" : "Active Account"}
                    </span>
                    {currentUser.token && (
                      <span className="text-[9px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-1 py-0.2 rounded" title={`Session Token: ${currentUser.token}`}>
                        Token: {currentUser.token.slice(0, 10)}...
                      </span>
                    )}
                  </div>
                  <span className="block text-xs font-semibold text-slate-700 font-mono">{currentUser.email}</span>
                </div>
                {currentUser.role === "student" ? (
                  <button
                    onClick={() => switchTab("schedule")}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>View Schedule</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate("app", currentUser.role)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Go to App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={onLogout}
                  className="px-3 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onNavigate("login")}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate("signup")}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden border-t border-slate-200/60 bg-white/95 px-3 py-2 flex items-center justify-between overflow-x-auto gap-1 text-xs">
          <button
            onClick={() => switchTab("home")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-semibold cursor-pointer ${
              activeTab === "home" ? "bg-blue-50 text-blue-600 border border-blue-100 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => switchTab("features")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-semibold cursor-pointer ${
              activeTab === "features" ? "bg-blue-50 text-blue-600 border border-blue-100 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Features
          </button>
          <button
            onClick={() => switchTab("schedule")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-semibold cursor-pointer ${
              activeTab === "schedule" ? "bg-blue-50 text-blue-600 border border-blue-100 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => switchTab("tickets")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-semibold cursor-pointer ${
              activeTab === "tickets" ? "bg-blue-50 text-blue-600 border border-blue-100 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tickets
          </button>
        </div>
      </nav>

      {/* 2. PAGE CONTENT AREA BASED ON ACTIVE TAB */}
      <main className="flex-1">

        {/* ==================== PAGE 1: HOME ==================== */}
        {activeTab === "home" && (
          <div>
            {/* HERO BANNER */}
            <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white to-slate-50">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-100/30 blur-[130px] rounded-full -z-10" />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
                <div className="max-w-3xl mx-auto space-y-4">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-none">
                    Simple Academic <br />
                    <span className="text-blue-600 bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-sans">Conference Management</span>
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
                    Submit papers, write peer reviews, create schedules, and buy attendee passes simply and quickly.
                  </p>
                </div>

                {/* Role Portals CTAs */}
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => onNavigate(isLoggedIn ? "app" : "login", "admin")}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all cursor-pointer shadow-xs hover:shadow-md"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Portal</span>
                  </button>
                  <button
                    onClick={() => onNavigate(isLoggedIn ? "app" : "login", "reviewer")}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all cursor-pointer shadow-xs hover:shadow-md"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Reviewer Portal</span>
                  </button>
                  <button
                    onClick={() => onNavigate(isLoggedIn ? "app" : "login", "author")}
                    className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-slate-300 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <User className="w-4 h-4" />
                    <span>Author Portal</span>
                  </button>
                </div>
              </div>
            </section>

            {/* QUICK FEATURE HIGHLIGHTS */}
            <section className="py-16 bg-white border-t border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-blue-600 uppercase">Platform Overview</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Built for Modern Academic Excellence</h2>
                  </div>
                  <button
                    onClick={() => switchTab("features")}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View All Detailed Features</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Double-Blind Peer Review</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Author identities remain completely hidden from reviewers to ensure objective evaluations.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Live Interactive Schedule</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Organizers can auto-allocate accepted research papers directly into presentation slots.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Local &amp; Global Ticketing</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Instant pass registration using eSewa, Khalti, or international payment gateways.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================== PAGE 2: FEATURES ==================== */}
        {activeTab === "features" && (
          <div className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
              
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="text-[10px] font-mono font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  Platform Core Features
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
                  Everything You Need to Manage Conferences
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  ConfHub provides dedicated workflows for administrators, reviewers, and authors in a clean, consistent interface.
                </p>
              </div>

              {/* Feature Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Feature 1 */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">Double-Blind Peer Review</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Preserves strict anonymity. Author credentials and affiliations are automatically scrubbed during review, preventing potential bias.
                    </p>
                    <ul className="space-y-1.5 pt-2 text-xs text-slate-600">
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Anonymous author identities</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Structured rubric scores (1-5)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>AI-assisted evaluation feedback</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => onNavigate("login", "reviewer")}
                    className="w-full py-2 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Try Reviewer Portal
                  </button>
                </div>

                {/* Feature 2 */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">AI Keyword Abstract Matcher</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Automatically scans submitted paper abstracts and tags relevant research topics to route papers to the best-suited reviewer expert.
                    </p>
                    <ul className="space-y-1.5 pt-2 text-xs text-slate-600">
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Instant semantic domain tagging</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Expert domain score matching</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>One-click auto-assign router</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => onNavigate("login", "admin")}
                    className="w-full py-2 bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Open Admin Router
                  </button>
                </div>

                {/* Feature 3 */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">Dynamic Schedule Builder</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Easily build, reorder, and assign presentation sessions. Directly pulls accepted papers into allocated conference time slots.
                    </p>
                    <ul className="space-y-1.5 pt-2 text-xs text-slate-600">
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>Auto-allocation for accepted papers</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>Room location and speaker tags</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>Real-time audience preview</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => switchTab("schedule")}
                    className="w-full py-2 bg-white border border-slate-200 text-slate-700 hover:text-purple-600 hover:border-purple-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    View Schedule Timetable
                  </button>
                </div>

                {/* Feature 4 */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                      <Database className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">Scopus &amp; DOAJ Metadata Exporter</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Generate standardized XML and Schema.org JSON metadata exports ready for academic indexers and search discovery platforms.
                    </p>
                    <ul className="space-y-1.5 pt-2 text-xs text-slate-600">
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Scopus v5.4 XML schema format</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Schema.org ScholarlyArticle JSON</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>One-click index download</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => switchTab("features")}
                    className="w-full py-2 bg-white border border-slate-200 text-slate-700 hover:text-amber-600 hover:border-amber-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Explore Features
                  </button>
                </div>

                {/* Feature 5 */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">Integrated Delegate Pass Ticketing</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Seamless checkout workflows supporting regional payment gateways (eSewa, Khalti) alongside standard credit card options.
                    </p>
                    <ul className="space-y-1.5 pt-2 text-xs text-slate-600">
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Student &amp; Professional pass tiers</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Instant payment verification ledger</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Digital pass reference receipt</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => switchTab("tickets")}
                    className="w-full py-2 bg-white border border-slate-200 text-slate-700 hover:text-teal-600 hover:border-teal-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    View Pass Options
                  </button>
                </div>

                {/* Feature 6 */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">Role-Based Security Locks</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Strict authentication access control ensuring users only view data authorized for their logged-in role (Admin, Reviewer, or Author).
                    </p>
                    <ul className="space-y-1.5 pt-2 text-xs text-slate-600">
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Automatic session lock guards</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Clear access restricted notices</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Synchronized server state</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => onNavigate("login")}
                    className="w-full py-2 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Sign In to Portal
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ==================== PAGE 3: SCHEDULE ==================== */}
        {activeTab === "schedule" && (
          <div className="py-10 bg-slate-50 min-h-[70vh]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              
              {/* Notification Banner when exporting calendar */}
              {calendarNotification && (
                <div className="p-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-between animate-fadeIn transition-all">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>{calendarNotification}</span>
                  </div>
                  <button 
                    onClick={() => setCalendarNotification(null)}
                    className="text-white/80 hover:text-white text-xs p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* 1. DYNAMIC CONFERENCE SELECTOR PILLS */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Select Conference Timetable</span>
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {schedule.length} total session slots across {conferences.length} conferences
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                  <button
                    onClick={() => {
                      setSelectedScheduleConfId("all");
                      setSelectedScheduleRoom("All");
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-2 shrink-0 ${
                      selectedScheduleConfId === "all"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>All Conferences</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      selectedScheduleConfId === "all" ? "bg-white/20 text-white" : "bg-white text-slate-600 border border-slate-200"
                    }`}>
                      {schedule.length}
                    </span>
                  </button>

                  {conferences.map((conf) => {
                    const count = schedule.filter(s => s.conferenceId === conf.id).length;
                    const isSelected = selectedScheduleConfId === conf.id;
                    return (
                      <button
                        key={conf.id}
                        onClick={() => {
                          setSelectedScheduleConfId(conf.id);
                          setSelectedScheduleRoom("All");
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-2 shrink-0 border ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        <span className="truncate max-w-[200px]">{conf.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. DYNAMIC CONFERENCE DETAILS BANNER */}
              {selectedScheduleConf ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border font-mono ${
                        selectedScheduleConf.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : selectedScheduleConf.status === "Upcoming"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {selectedScheduleConf.status}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded border border-blue-100 font-mono">
                        Active Program
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        ID: {selectedScheduleConf.id.toUpperCase()}
                      </span>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900">{selectedScheduleConf.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center space-x-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{selectedScheduleConf.date}</span>
                      </span>
                      <span className="flex items-center space-x-1.5 font-medium">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{selectedScheduleConf.venue}</span>
                      </span>
                      <span className="flex items-center space-x-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Submissions Due: <strong>{selectedScheduleConf.deadline}</strong></span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedTicketConfId(selectedScheduleConf.id);
                        switchTab("tickets");
                      }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 shadow-xs cursor-pointer transition-colors"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Book Conference Pass</span>
                    </button>

                    <button
                      onClick={() => onNavigate("login", "author")}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 shadow-xs cursor-pointer transition-colors"
                    >
                      <span>Submit Paper</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* All Conferences Global Overview */
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded border border-blue-100 font-mono">
                      <span>All Conference Symposia</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Academic Programs &amp; Session Timetables</h1>
                    <p className="text-xs text-slate-500 max-w-xl">
                      Browse technical papers, keynote addresses, and workshops across all active conferences in one unified schedule.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 shrink-0">
                    <div className="text-center px-3">
                      <span className="block font-mono text-lg font-bold text-slate-900">{conferences.length}</span>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Conferences</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="text-center px-3">
                      <span className="block font-mono text-lg font-bold text-blue-600">{schedule.length}</span>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Sessions</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="text-center px-3">
                      <span className="block font-mono text-lg font-bold text-emerald-600">{availableRooms.length - 1}</span>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Halls / Rooms</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. SEARCH & DYNAMIC FILTER TOOLBAR */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                
                {/* Row 1: Search + View Modes + My Agenda */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                  
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search session title, speaker, room, or conference..."
                      value={scheduleSearch}
                      onChange={(e) => setScheduleSearch(e.target.value)}
                      className="w-full pl-10 pr-8 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800 transition-colors"
                    />
                    {scheduleSearch && (
                      <button
                        onClick={() => setScheduleSearch("")}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Right Controls: Room Filter + Personal Agenda + View Mode */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    
                    {/* Room Dropdown */}
                    <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Room:</span>
                      <select
                        value={selectedScheduleRoom}
                        onChange={(e) => setSelectedScheduleRoom(e.target.value)}
                        className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer text-xs"
                      >
                        {availableRooms.map((room) => (
                          <option key={room} value={room}>
                            {room}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Personal Agenda Toggle */}
                    <button
                      onClick={() => setShowSavedOnly(!showSavedOnly)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                        showSavedOnly
                          ? "bg-amber-500 text-white border-amber-600 shadow-xs font-bold"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                      }`}
                      title="Filter to bookmarked personal agenda sessions"
                    >
                      {showSavedOnly ? (
                        <BookmarkCheck className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>My Agenda ({savedSessionIds.length})</span>
                    </button>

                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => setScheduleViewMode("timeline")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                          scheduleViewMode === "timeline"
                            ? "bg-white text-slate-900 shadow-3xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                        title="Chronological timeline view"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Timeline</span>
                      </button>
                      <button
                        onClick={() => setScheduleViewMode("halls")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                          scheduleViewMode === "halls"
                            ? "bg-white text-slate-900 shadow-3xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                        title="Group by room and hall"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">By Room</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Row 2: Dynamic Category Type Pills */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 no-scrollbar">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase shrink-0 mr-1 flex items-center space-x-1">
                    <Filter className="w-3 h-3 text-slate-400" />
                    <span>Type:</span>
                  </span>
                  {availableTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setScheduleFilter(type)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                        scheduleFilter === type
                          ? "bg-slate-900 text-white font-bold"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

              </div>

              {/* 4. ACTIVE FILTER CRITERIA SUMMARY */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <span>
                    Showing <strong className="text-slate-900 font-bold">{filteredSchedule.length}</strong> {filteredSchedule.length === 1 ? 'session' : 'sessions'}
                  </span>
                  {selectedScheduleConfId !== "all" && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-md border border-blue-100 text-[11px]">
                      {selectedScheduleConf?.title}
                    </span>
                  )}
                  {scheduleFilter !== "All" && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-semibold rounded-md border border-purple-100 text-[11px]">
                      {scheduleFilter}
                    </span>
                  )}
                  {selectedScheduleRoom !== "All" && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md border border-slate-200 text-[11px]">
                      Room: {selectedScheduleRoom}
                    </span>
                  )}
                  {showSavedOnly && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-semibold rounded-md border border-amber-200 text-[11px]">
                      Bookmarked Only
                    </span>
                  )}
                </div>

                {(scheduleSearch || scheduleFilter !== "All" || selectedScheduleRoom !== "All" || showSavedOnly || selectedScheduleConfId !== "all") && (
                  <button
                    onClick={() => {
                      setScheduleSearch("");
                      setScheduleFilter("All");
                      setSelectedScheduleRoom("All");
                      setShowSavedOnly(false);
                      setSelectedScheduleConfId("all");
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                  >
                    Reset all filters
                  </button>
                )}
              </div>

              {/* 5. SCHEDULE DISPLAY */}
              {filteredSchedule.length === 0 ? (
                /* Dynamic Empty States */
                <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-4 shadow-2xs">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                    {showSavedOnly ? <Bookmark className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                  </div>

                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">
                      {showSavedOnly
                        ? "No Bookmarked Sessions in My Agenda"
                        : scheduleSearch
                        ? `No matching sessions found for "${scheduleSearch}"`
                        : "No Sessions Scheduled for this Selection"}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {showSavedOnly
                        ? "You haven't added any talks to your personal timetable yet. Click the bookmark icon on any session card to save it."
                        : scheduleSearch
                        ? "Try modifying your search terms, changing the conference, or clearing active filters."
                        : "The organizing committee is actively preparing the technical program schedule. Check back soon or switch conferences."}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2.5 pt-2">
                    {showSavedOnly ? (
                      <button
                        onClick={() => setShowSavedOnly(false)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition-colors"
                      >
                        Browse All Sessions
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setScheduleSearch("");
                            setScheduleFilter("All");
                            setSelectedScheduleRoom("All");
                            setSelectedScheduleConfId("all");
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition-colors"
                        >
                          Show All Conferences
                        </button>
                        <button
                          onClick={() => onNavigate("login", "author")}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                        >
                          Submit a Manuscript
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : scheduleViewMode === "timeline" ? (
                /* MODE A: TIMELINE VIEW */
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
                  {filteredSchedule.map((item) => {
                    const itemConf = confMap.get(item.conferenceId);
                    const confTitle = itemConf?.title || "Academic Conference";
                    const isSaved = savedSessionIds.includes(item.id);
                    const isExpanded = expandedSessionId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="p-5 hover:bg-slate-50/70 transition-colors space-y-3"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          
                          {/* Session Info */}
                          <div className="space-y-2 max-w-3xl flex-1">
                            
                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Time Slot Badge */}
                              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 text-[11px] font-mono font-bold rounded-lg border border-slate-200 flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span>{item.timeSlot}</span>
                              </span>

                              {/* Type Badge */}
                              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${
                                item.type === "Keynote"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : item.type === "Coffee Break"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : item.type === "Panel"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : "bg-purple-50 text-purple-700 border-purple-200"
                              }`}>
                                {item.type}
                              </span>

                              {/* Conference Tag if in All Conferences View */}
                              {selectedScheduleConfId === "all" && itemConf && (
                                <button
                                  onClick={() => setSelectedScheduleConfId(itemConf.id)}
                                  className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-semibold rounded border border-slate-200 truncate max-w-[220px] transition-colors cursor-pointer"
                                  title={`Switch to ${confTitle}`}
                                >
                                  {confTitle}
                                </button>
                              )}
                            </div>

                            {/* Session Title */}
                            <h3 className="font-bold text-base text-slate-900 leading-snug">
                              {item.sessionTitle}
                            </h3>

                            {/* Speaker & Room Info */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                              <span className="flex items-center space-x-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span>Speaker / Presenter: <strong className="text-slate-800 font-semibold">{item.speaker}</strong></span>
                              </span>
                              <span>&middot;</span>
                              <span className="flex items-center space-x-1.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>{item.room}</span>
                              </span>
                            </div>

                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start">
                            
                            {/* Bookmark Button */}
                            <button
                              onClick={() => toggleSaveSession(item.id)}
                              className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                                isSaved
                                  ? "bg-amber-50 text-amber-700 border-amber-300 shadow-2xs font-bold"
                                  : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                              title={isSaved ? "Remove from personal agenda" : "Bookmark this session"}
                            >
                              {isSaved ? (
                                <>
                                  <BookmarkCheck className="w-4 h-4 text-amber-600" />
                                  <span className="text-[11px] font-bold text-amber-700">Saved</span>
                                </>
                              ) : (
                                <>
                                  <Bookmark className="w-4 h-4 text-slate-400" />
                                  <span className="text-[11px]">Save</span>
                                </>
                              )}
                            </button>

                            {/* Add to Calendar (.ics download) */}
                            <button
                              onClick={() => exportSessionICS(item, confTitle)}
                              className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
                              title="Download .ics Calendar event file"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-[11px]">.ICS</span>
                            </button>

                            {/* Google Calendar Link */}
                            <a
                              href={getGoogleCalendarUrl(item, confTitle)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
                              title="Add to Google Calendar"
                            >
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-[11px] hidden sm:inline">Google Cal</span>
                            </a>

                            {/* Expand Details Toggle */}
                            <button
                              onClick={() => setExpandedSessionId(isExpanded ? null : item.id)}
                              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs border border-slate-200 transition-colors cursor-pointer"
                              title="View full session breakdown"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                          </div>

                        </div>

                        {/* Collapsible Expanded Details Drawer */}
                        {isExpanded && (
                          <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-3 animate-fadeIn">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
                              <div>
                                <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Target Conference</span>
                                <span className="font-semibold text-slate-800">{confTitle}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Presentation Hall</span>
                                <span className="font-semibold text-slate-800">{item.room}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Session Format</span>
                                <span className="font-semibold text-slate-800">{item.type}</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
                              <span className="text-slate-500 text-[11px]">
                                Conference venue access: Delegates must present an official badge or registration pass at {item.room}.
                              </span>

                              {itemConf && (
                                <button
                                  onClick={() => {
                                    if (!isLoggedIn) {
                                      onNavigate("login");
                                    } else {
                                      setSelectedTicketConfId(itemConf.id);
                                      switchTab("tickets");
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 shadow-2xs cursor-pointer transition-colors"
                                >
                                  <Ticket className="w-3.5 h-3.5" />
                                  <span>{isLoggedIn ? `Get Pass for ${itemConf.title.slice(0, 20)}...` : `Log In to Get Pass`}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              ) : (
                /* MODE B: GROUPED BY ROOM & TRACK VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(Object.entries(groupedByRoom) as [string, ScheduleItem[]][]).map(([roomName, sessionsInRoom]) => (
                    <div
                      key={roomName}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between"
                    >
                      {/* Room Header */}
                      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <h4 className="font-bold text-sm text-slate-900">{roomName}</h4>
                        </div>
                        <span className="px-2 py-0.5 bg-white text-slate-700 text-[10px] font-mono font-bold rounded border border-slate-200">
                          {sessionsInRoom.length} {sessionsInRoom.length === 1 ? 'Slot' : 'Slots'}
                        </span>
                      </div>

                      {/* Sessions Inside Room */}
                      <div className="p-4 divide-y divide-slate-100 space-y-3">
                        {sessionsInRoom.map((sess) => {
                          const sessConf = confMap.get(sess.conferenceId);
                          const isSaved = savedSessionIds.includes(sess.id);
                          return (
                            <div key={sess.id} className="pt-3 first:pt-0 space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-mono font-bold rounded">
                                  {sess.timeSlot}
                                </span>
                                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                  {sess.type}
                                </span>
                              </div>

                              <h5 className="text-xs font-bold text-slate-900 leading-snug">
                                {sess.sessionTitle}
                              </h5>

                              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                                <span>Speaker: <strong className="text-slate-700">{sess.speaker}</strong></span>
                                <div className="flex items-center space-x-1.5">
                                  <button
                                    onClick={() => toggleSaveSession(sess.id)}
                                    className={`p-1 rounded transition-colors ${
                                      isSaved ? "text-amber-600" : "text-slate-400 hover:text-slate-700"
                                    }`}
                                    title={isSaved ? "Saved in agenda" : "Bookmark session"}
                                  >
                                    {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => exportSessionICS(sess, sessConf?.title || "Academic Conference")}
                                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                                    title="Export .ics"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Room Footer Info */}
                      <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Audio/Visual equipment &amp; podium enabled</span>
                        <span className="font-mono">Live Track</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

        {/* ==================== PAGE 4: TICKETS ==================== */}
        {activeTab === "tickets" && (
          <div className="py-12 bg-white">
            {!isLoggedIn ? (
              <div className="max-w-md mx-auto text-center space-y-6 px-4 py-16">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-250">
                    Authentication Required
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Sign In to Access Ticket Registration
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Conference ticket registration and pass checkout are restricted to authenticated delegates. Please log in or create an account to view and purchase registration passes.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigate("login")}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Log In to Proceed</span>
                  </button>
                  <button
                    onClick={() => onNavigate("signup")}
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              
              {/* Title Header */}
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-600 uppercase bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  Dynamic Registration Tiers
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
                  Select Your Conference Pass
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Real-time registration rates loaded directly from each conference's fee schedule.
                </p>

                {/* Conference Switcher for Tickets */}
                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Conference:</span>
                    <select
                      value={selectedTicketConfId}
                      onChange={(e) => setSelectedTicketConfId(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 cursor-pointer shadow-3xs"
                    >
                      {conferences.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedScheduleConfId(selectedTicketConfId);
                      switchTab("schedule");
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer border border-blue-200"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Timetable &amp; Sessions</span>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                </div>
              </div>

              {/* Dynamic Pass Cards Grid */}
              {(() => {
                const chosenConf = conferences.find((c) => c.id === selectedTicketConfId) || conferences[0];
                const tiers = (chosenConf && chosenConf.ticketTiers && chosenConf.ticketTiers.length > 0)
                  ? chosenConf.ticketTiers
                  : [
                      {
                        id: `default-student-${chosenConf?.id || '1'}`,
                        name: "Student Pass",
                        price: 1500,
                        currency: "NPR" as const,
                        description: "For verified undergraduate and graduate research students.",
                        features: ["Access to technical sessions", "Digital Certificate", "Conference Kit", "Himalayan Lunch"],
                        recommendedGateway: "eSewa" as const,
                        badgeText: "Student Special Rate",
                        isPopular: false
                      },
                      {
                        id: `default-pro-${chosenConf?.id || '1'}`,
                        name: "Regular Pass",
                        price: 3500,
                        currency: "NPR" as const,
                        description: "Ideal for academic faculty, researchers, and corporate delegates.",
                        features: ["Full Keynotes & Panels", "Indexed Proceedings", "Gala Networking Dinner", "Printed Kit"],
                        recommendedGateway: "Khalti" as const,
                        badgeText: "Standard Delegate",
                        isPopular: true
                      },
                      {
                        id: `default-intl-${chosenConf?.id || '1'}`,
                        name: "International Pass",
                        price: 50,
                        currency: "USD" as const,
                        description: "For delegates visiting from international universities and research institutions.",
                        features: ["Full 3-Day Conference Access", "Kathmandu Cultural Tour", "International Receipt", "All Meals & Banquets"],
                        recommendedGateway: "Stripe" as const,
                        badgeText: "International Visitor",
                        isPopular: false
                      }
                    ];

                return (
                  <div className="space-y-6">
                    {/* Logged-in Student Delegate Banner & Passes */}
                    {isLoggedIn && currentUser && currentUser.role === "student" && (
                      <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 border border-emerald-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                              <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-emerald-950">Student Delegate Account</span>
                                <span className="text-[10px] bg-emerald-200/80 text-emerald-800 font-bold px-2 py-0.5 rounded-md font-mono">
                                  VERIFIED DELEGATE
                                </span>
                              </div>
                              <p className="text-xs text-emerald-700 font-medium">
                                Active student: <strong>{currentUser.name}</strong> ({currentUser.email})
                              </p>
                            </div>
                          </div>

                          {currentUser.token && (
                            <div className="flex items-center space-x-1.5 bg-white/80 border border-emerald-200/80 px-2.5 py-1.5 rounded-lg text-emerald-900 text-xs font-mono">
                              <span className="text-[10px] text-emerald-600 font-bold uppercase">Token:</span>
                              <span className="font-bold">{currentUser.token.slice(0, 14)}...</span>
                            </div>
                          )}
                        </div>

                        {/* Display Student's Purchased Passes if any */}
                        {(() => {
                          const userPasses = orders.filter(
                            (o) => o.userEmail && o.userEmail.toLowerCase() === currentUser.email.toLowerCase()
                          );
                          if (userPasses.length > 0) {
                            return (
                              <div className="pt-3 border-t border-emerald-200/70 space-y-2">
                                <span className="text-[11px] font-bold text-emerald-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                                  <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Your Purchased Passes ({userPasses.length})</span>
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                  {userPasses.map((pass) => (
                                    <div key={pass.id} className="bg-white p-3 rounded-xl border border-emerald-200 shadow-3xs flex flex-col justify-between space-y-2">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <span className="text-xs font-bold text-slate-900 block">{pass.passType}</span>
                                          <span className="text-[10px] text-slate-400 font-mono">#{pass.id.slice(0, 8)}</span>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                                          {pass.status}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-600">
                                        <span className="font-mono font-bold">{pass.currency} {pass.price?.toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-400">{pass.createdAt?.slice(0, 10)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div className="pt-2 text-[11px] text-emerald-800 leading-relaxed">
                              You have student access to browse conference schedule and tracks. Click above or below to buy your official subsidized Student Pass (NPR 1,500) and register your delegate attendance.
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Unauthenticated Student Callout */}
                    {!isLoggedIn && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <div className="flex items-center space-x-2.5 text-slate-700">
                          <GraduationCap className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span>
                            Are you a college or university student? <strong>Sign up as a Student</strong> to reserve subsidized student passes (NPR 1,500) with full technical track access.
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => onNavigate("signup", "student")}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
                          >
                            Student Sign Up
                          </button>
                          <button
                            onClick={() => onNavigate("login", "student")}
                            className="px-3 py-1.5 border border-slate-300 hover:bg-white text-slate-700 font-bold rounded-lg transition-colors cursor-pointer text-xs"
                          >
                            Student Login
                          </button>
                        </div>
                      </div>
                    )}

                    {chosenConf && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-bold text-slate-900">{chosenConf.title}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium">
                          <span>{chosenConf.date}</span>
                          <span>•</span>
                          <span>{chosenConf.venue}</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {tiers.map((tier) => {
                        const isStudentTier = tier.name.toLowerCase().includes("student");
                        return (
                          <div
                            key={tier.id}
                            className={`rounded-2xl p-7 space-y-6 flex flex-col justify-between transition-all relative ${
                              isStudentTier && currentUser?.role === "student"
                                ? "bg-white border-2 border-emerald-600 shadow-md ring-2 ring-emerald-500/10"
                                : tier.isPopular
                                  ? "bg-white border-2 border-slate-900 shadow-md ring-2 ring-slate-900/5"
                                  : "bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-3xs"
                            }`}
                          >
                            {tier.isPopular && (
                              <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-[10px] rounded-full font-bold uppercase font-mono tracking-wider shadow-2xs">
                                Most Popular
                              </div>
                            )}

                            {isStudentTier && (
                              <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-emerald-600 text-white text-[10px] rounded-full font-bold uppercase font-mono tracking-wider shadow-2xs flex items-center space-x-1">
                                <GraduationCap className="w-3 h-3" />
                                <span>Student Delegate</span>
                              </div>
                            )}

                            <div className="space-y-4">
                              {tier.badgeText && (
                                <span className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md inline-block ${
                                  isStudentTier
                                    ? "text-emerald-700 bg-emerald-100/80 border border-emerald-200"
                                    : tier.isPopular
                                      ? "text-purple-700 bg-purple-100/80 border border-purple-200"
                                      : "text-blue-700 bg-blue-100/80 border border-blue-200"
                                }`}>
                                  {tier.badgeText}
                                </span>
                              )}

                              <h3 className="font-bold text-lg text-slate-900">{tier.name}</h3>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                {tier.description}
                              </p>

                              <div className="pt-2 font-mono text-3xl font-black text-slate-900">
                                {tier.currency} {tier.price.toLocaleString()}
                              </div>

                              {tier.features && tier.features.length > 0 && (
                                <div className="border-t border-slate-200/80 pt-4 space-y-2 text-xs text-slate-600">
                                  {tier.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center space-x-2">
                                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                      <span>{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                if (!isLoggedIn) {
                                  onNavigate("login");
                                  return;
                                }
                                if (onBuyTicket) {
                                  onBuyTicket({
                                    conferenceId: chosenConf?.id || "conf-1",
                                    passType: tier.name,
                                    price: tier.price,
                                    currency: tier.currency,
                                    gateway: tier.recommendedGateway || "eSewa",
                                    userName: currentUser?.name,
                                    userEmail: currentUser?.email,
                                  });
                                } else {
                                  onNavigate("app", isStudentTier ? "student" : "author");
                                }
                              }}
                              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center block shadow-2xs ${
                                isStudentTier
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : tier.isPopular
                                    ? "bg-slate-900 hover:bg-slate-800 text-white"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                              }`}
                            >
                              Buy {tier.name} ({tier.currency} {tier.price.toLocaleString()})
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Payment Methods Info Banner */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="font-bold text-sm text-slate-900">Supported Local &amp; International Payment Gateways</h4>
                  <p className="text-xs text-slate-500">Pay safely with local mobile wallets or global debit/credit cards.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-lg font-mono">
                    eSewa
                  </span>
                  <span className="px-3 py-1.5 bg-purple-50 text-purple-800 border border-purple-200 font-bold text-xs rounded-lg font-mono">
                    Khalti
                  </span>
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 font-bold text-xs rounded-lg font-mono">
                    Stripe / VISA / Mastercard
                  </span>
                </div>
              </div>

            </div>
            )}
          </div>
        )}

      </main>

      {/* 3. CONSISTENT BOTTOM SIGNUP CTA & FOOTER */}
      <footer className="bg-slate-950 text-white relative overflow-hidden border-t border-slate-900">
        <div className="absolute inset-0 bg-blue-900/10 blur-[120px] rounded-full -z-10" />
        
        {/* Bottom CTA */}
        <div className="py-16 max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Ready to Join ConfHub?</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Get started with your delegate pass or register a new account today.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate(isLoggedIn ? "app" : "signup")}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors cursor-pointer shadow-sm"
            >
              <span>{isLoggedIn ? "Go to Workspace" : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate(isLoggedIn ? "app" : "login")}
              className="px-6 py-2.5 bg-transparent border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {isLoggedIn ? "View Active Session" : "Log In"}
            </button>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="border-t border-slate-900 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-300">ConfHub Platform</span>
              <span>&middot;</span>
              <span>Academic Conference System</span>
            </div>
            <div className="flex items-center space-x-6 text-[11px]">
              <button onClick={() => switchTab("home")} className="hover:text-slate-300 transition-colors">Home</button>
              <button onClick={() => switchTab("features")} className="hover:text-slate-300 transition-colors">Features</button>
              <button onClick={() => switchTab("schedule")} className="hover:text-slate-300 transition-colors">Schedule</button>
              <button onClick={() => switchTab("tickets")} className="hover:text-slate-300 transition-colors">Tickets</button>
            </div>
            <div>
              &copy; {new Date().getFullYear()} ConfHub. All rights reserved.
            </div>
          </div>
        </div>

      </footer>

    </div>
  );
}
