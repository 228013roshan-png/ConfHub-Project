import React, { useState } from "react";
import { Conference, Paper, Reviewer, Order, ScheduleItem } from "../types";
import { ScheduleBuilder } from "./ScheduleBuilder";
import { 
  Plus, 
  Users, 
  Award, 
  Shield, 
  FileCode, 
  CheckCircle, 
  Brain, 
  Calendar, 
  Activity, 
  Database, 
  Clock, 
  MapPin, 
  X, 
  FileText, 
  Check, 
  Search, 
  Filter, 
  Download, 
  CreditCard, 
  Receipt, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  TrendingUp,
  DollarSign,
  BookOpen
} from "lucide-react";

interface AdminPortalProps {
  conferences: Conference[];
  papers: Paper[];
  reviewers: Reviewer[];
  orders: Order[];
  schedule: ScheduleItem[];
  onCreateConference: (conf: { title: string; date: string; venue: string; deadline: string }) => Promise<void>;
  onDeleteConference?: (confId: string) => Promise<void>;
  onRegisterReviewer?: (reviewer: { name: string; email: string; domains: string[] }) => Promise<void>;
  onAutoMatchPaper: (paperId: string) => Promise<{ matchedReviewer: Reviewer | null; score: number }>;
  onManualAssign: (paperId: string, reviewerId: string) => Promise<void>;
  onUnassignReviewer?: (paperId: string) => Promise<void>;
  onUpdatePaperStatus: (paperId: string, status: "Accepted" | "Rejected") => Promise<void>;
  onSaveSchedule: (newSchedule: ScheduleItem[]) => Promise<void>;
  onRefreshOrders?: () => Promise<void>;
}

export function AdminPortal({
  conferences,
  papers,
  reviewers,
  orders,
  schedule,
  onCreateConference,
  onDeleteConference,
  onRegisterReviewer,
  onAutoMatchPaper,
  onManualAssign,
  onUnassignReviewer,
  onUpdatePaperStatus,
  onSaveSchedule,
  onRefreshOrders,
}: AdminPortalProps) {
  // New Conference Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [showConfForm, setShowConfForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confToDelete, setConfToDelete] = useState<Conference | null>(null);
  const [isDeletingConf, setIsDeletingConf] = useState(false);

  // New Reviewer Form State
  const [showAddReviewerModal, setShowAddReviewerModal] = useState(false);
  const [newRevName, setNewRevName] = useState("");
  const [newRevEmail, setNewRevEmail] = useState("");
  const [newRevDomains, setNewRevDomains] = useState("Artificial Intelligence, Machine Learning");
  const [isAddingReviewer, setIsAddingReviewer] = useState(false);

  // XML Index Preview Modal State
  const [indexPaperId, setIndexPaperId] = useState<string | null>(null);
  const [indexFormat, setIndexFormat] = useState<"xml" | "json">("xml");
  const [indexData, setIndexData] = useState<string>("");
  const [loadingIndex, setLoadingIndex] = useState(false);

  // Auto Matching feedback messages per paper
  const [matchingFeedback, setMatchingFeedback] = useState<Record<string, string>>({});
  const [matchingLoading, setMatchingLoading] = useState<Record<string, boolean>>({});

  // Accept Paper & Session Block Modal State
  const [acceptModalPaper, setAcceptModalPaper] = useState<Paper | null>(null);
  const [sessionConferenceId, setSessionConferenceId] = useState<string>("");
  const [sessionTitle, setSessionTitle] = useState<string>("");
  const [sessionSpeaker, setSessionSpeaker] = useState<string>("");
  const [sessionType, setSessionType] = useState<string>("Paper Presentation");
  const [sessionTimeSlot, setSessionTimeSlot] = useState<string>("10:30 AM - 11:30 AM");
  const [sessionRoom, setSessionRoom] = useState<string>("Hall A - Annapurna");
  const [sessionDescription, setSessionDescription] = useState<string>("");
  const [isProcessingAccept, setIsProcessingAccept] = useState<boolean>(false);

  const openAcceptModal = (paper: Paper) => {
    setAcceptModalPaper(paper);
    setSessionConferenceId(paper.conferenceId || conferences[0]?.id || "conf-1");
    setSessionTitle(`Technical Session: ${paper.title}`);
    setSessionSpeaker(paper.authorName || "Presenting Author");
    setSessionType("Paper Presentation");
    setSessionTimeSlot("10:30 AM - 11:30 AM");
    setSessionRoom("Hall A - Annapurna");
    setSessionDescription(paper.abstractText || "");
  };

  const handleConfirmAcceptWithSession = async () => {
    if (!acceptModalPaper) return;
    setIsProcessingAccept(true);
    try {
      // 1. Update Paper Status to Accepted
      await onUpdatePaperStatus(acceptModalPaper.id, "Accepted");

      // 2. Create and Save Session Block to Schedule
      const newSession: ScheduleItem = {
        id: `sch-dyn-${Date.now()}`,
        conferenceId: sessionConferenceId || acceptModalPaper.conferenceId || "conf-1",
        timeSlot: sessionTimeSlot || "10:30 AM - 11:30 AM",
        sessionTitle: sessionTitle || `Technical Session: ${acceptModalPaper.title}`,
        speaker: sessionSpeaker || acceptModalPaper.authorName,
        type: sessionType || "Paper Presentation",
        room: sessionRoom || "Hall A - Annapurna",
      };

      await onSaveSchedule([...schedule, newSession]);
      setAcceptModalPaper(null);
    } catch (err) {
      console.error("Error accepting paper and creating session:", err);
    } finally {
      setIsProcessingAccept(false);
    }
  };

  const handleConfirmAcceptOnly = async () => {
    if (!acceptModalPaper) return;
    setIsProcessingAccept(true);
    try {
      await onUpdatePaperStatus(acceptModalPaper.id, "Accepted");
      setAcceptModalPaper(null);
    } catch (err) {
      console.error("Error accepting paper:", err);
    } finally {
      setIsProcessingAccept(false);
    }
  };

  const handleCreateConf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;
    setCreating(true);
    try {
      await onCreateConference({
        title: newTitle,
        date: newDate,
        venue: newVenue || "Virtual Sandbox",
        deadline: newDeadline || "2026-12-31",
      });
      setNewTitle("");
      setNewDate("");
      setNewVenue("");
      setNewDeadline("");
      setShowConfForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const triggerAutoMatch = async (paperId: string) => {
    setMatchingLoading((prev) => ({ ...prev, [paperId]: true }));
    try {
      const res = await onAutoMatchPaper(paperId);
      if (res.matchedReviewer) {
        setMatchingFeedback((prev) => ({
          ...prev,
          [paperId]: `Smart Assigned: Dr. ${res.matchedReviewer?.name} with tag overlap score of ${res.score}`,
        }));
      } else {
        setMatchingFeedback((prev) => ({ ...prev, [paperId]: "Algorithm ran: auto fallback assigned" }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMatchingLoading((prev) => ({ ...prev, [paperId]: false }));
    }
  };

  const triggerExportIndex = async (paperId: string, format: "xml" | "json") => {
    setIndexPaperId(paperId);
    setIndexFormat(format);
    setLoadingIndex(true);
    try {
      const res = await fetch(`/api/indexing/${paperId}/export?format=${format}`);
      if (format === "xml") {
        const text = await res.text();
        setIndexData(text);
      } else {
        const json = await res.json();
        setIndexData(JSON.stringify(json, null, 2));
      }
    } catch (e) {
      console.error(e);
      setIndexData("Failed to fetch scholarly indexing schema.");
    } finally {
      setLoadingIndex(false);
    }
  };

  // Registrations & Revenue Ledger State
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "Completed" | "Pending" | "Failed">("all");
  const [orderConfFilter, setOrderConfFilter] = useState<string>("all");
  const [orderGatewayFilter, setOrderGatewayFilter] = useState<string>("all");
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [ledgerMessage, setLedgerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Manual Registration / Offline Order Modal
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);
  const [manualUserName, setManualUserName] = useState("");
  const [manualUserEmail, setManualUserEmail] = useState("");
  const [manualConferenceId, setManualConferenceId] = useState(conferences[0]?.id || "conf-1");
  const [manualPassType, setManualPassType] = useState("Professional Delegate Pass");
  const [manualPrice, setManualPrice] = useState<number>(3500);
  const [manualCurrency, setManualCurrency] = useState<"NPR" | "USD">("NPR");
  const [manualGateway, setManualGateway] = useState("On-Site Cash / Desk Registration");
  const [manualStatus, setManualStatus] = useState<"Completed" | "Pending">("Completed");
  const [manualTrnRef, setManualTrnRef] = useState("");
  const [submittingManualOrder, setSubmittingManualOrder] = useState(false);

  const handleUpdateOrderStatus = async (orderId: string, status: "Completed" | "Failed", trnRef?: string) => {
    setProcessingOrderId(orderId);
    try {
      const res = await fetch(`/api/tickets/${orderId}/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, trnRef }),
      });
      if (res.ok) {
        setLedgerMessage({ type: "success", text: `Transaction #${orderId} marked as ${status}.` });
        if (onRefreshOrders) await onRefreshOrders();
        setTimeout(() => setLedgerMessage(null), 4000);
      } else {
        const data = await res.json();
        setLedgerMessage({ type: "error", text: data.error || "Failed to update transaction status." });
      }
    } catch (err) {
      console.error(err);
      setLedgerMessage({ type: "error", text: "Network error updating transaction." });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      const res = await fetch(`/api/tickets/${orderId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLedgerMessage({ type: "success", text: `Order #${orderId} successfully removed.` });
        setOrderToDelete(null);
        if (onRefreshOrders) await onRefreshOrders();
        setTimeout(() => setLedgerMessage(null), 4000);
      } else {
        const data = await res.json();
        setLedgerMessage({ type: "error", text: data.error || "Could not delete order." });
      }
    } catch (err) {
      console.error(err);
      setLedgerMessage({ type: "error", text: "Error deleting transaction." });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleDeleteConferenceAction = async (confId: string) => {
    if (!onDeleteConference) return;
    setIsDeletingConf(true);
    try {
      await onDeleteConference(confId);
      setConfToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingConf(false);
    }
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUserName.trim() || !manualUserEmail.trim() || !manualPrice) return;
    setSubmittingManualOrder(true);
    try {
      const res = await fetch("/api/tickets/manual-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: manualUserName.trim(),
          userEmail: manualUserEmail.trim(),
          conferenceId: manualConferenceId || conferences[0]?.id || "conf-1",
          passType: manualPassType,
          price: Number(manualPrice),
          currency: manualCurrency,
          gateway: manualGateway,
          status: manualStatus,
          trnRef: manualTrnRef.trim() || undefined,
        }),
      });

      if (res.ok) {
        setLedgerMessage({ type: "success", text: `New delegate pass for ${manualUserName} recorded in ledger.` });
        setShowManualOrderModal(false);
        setManualUserName("");
        setManualUserEmail("");
        setManualTrnRef("");
        if (onRefreshOrders) await onRefreshOrders();
        setTimeout(() => setLedgerMessage(null), 4000);
      } else {
        const data = await res.json();
        setLedgerMessage({ type: "error", text: data.error || "Failed to record manual order." });
      }
    } catch (err) {
      console.error(err);
      setLedgerMessage({ type: "error", text: "Network error creating manual order." });
    } finally {
      setSubmittingManualOrder(false);
    }
  };

  const handleExportCsv = () => {
    const headers = ["Order ID", "Customer Name", "Customer Email", "Conference", "Pass Tier", "Price", "Currency", "Payment Gateway", "Status", "TRN Reference", "Created At"];
    const rows = filteredOrders.map((o) => {
      const confName = conferences.find((c) => c.id === o.conferenceId)?.title || o.conferenceId;
      return [
        o.id,
        `"${o.userName.replace(/"/g, '""')}"`,
        `"${o.userEmail.replace(/"/g, '""')}"`,
        `"${confName.replace(/"/g, '""')}"`,
        `"${o.passType.replace(/"/g, '""')}"`,
        o.price,
        o.currency,
        `"${o.gateway}"`,
        o.status,
        `"${o.trnRef || ""}"`,
        `"${o.createdAt}"`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ConfHub_Revenue_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered orders computation
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== "all" && o.status !== orderStatusFilter) {
      return false;
    }
    if (orderConfFilter !== "all" && o.conferenceId !== orderConfFilter) {
      return false;
    }
    if (orderGatewayFilter !== "all" && !o.gateway.toLowerCase().includes(orderGatewayFilter.toLowerCase())) {
      return false;
    }
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchName = o.userName?.toLowerCase().includes(q);
      const matchEmail = o.userEmail?.toLowerCase().includes(q);
      const matchTrn = o.trnRef?.toLowerCase().includes(q);
      const matchId = o.id?.toLowerCase().includes(q);
      const matchPass = o.passType?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchTrn && !matchId && !matchPass) {
        return false;
      }
    }
    return true;
  });

  const completedOrders = orders.filter((o) => o.status === "Completed");
  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const totalCompletedNpr = completedOrders.reduce((sum, o) => {
    const cost = o.currency === "USD" ? o.price * 133 : o.price;
    return sum + cost;
  }, 0);
  const totalCompletedUsd = completedOrders.filter(o => o.currency === "USD").reduce((sum, o) => sum + o.price, 0);
  const totalCompletedNprOnly = completedOrders.filter(o => o.currency === "NPR").reduce((sum, o) => sum + o.price, 0);
  const esewaOrdersCount = completedOrders.filter(o => o.gateway.toLowerCase().includes("esewa")).length;
  const khaltiOrdersCount = completedOrders.filter(o => o.gateway.toLowerCase().includes("khalti")).length;
  const stripeOrdersCount = completedOrders.filter(o => o.gateway.toLowerCase().includes("stripe") || o.currency === "USD").length;

  // Compute stats
  const pendingPapersCount = papers.filter((p) => p.status === "Pending").length;
  const underReviewCount = papers.filter((p) => p.status === "Under Review").length;
  const totalRevenueNpr = totalCompletedNpr;

  return (
    <div className="space-y-6">
      
      {/* 1. Administrative Analytics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Activity className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Conferences</span>
            <span className="block text-2xl font-bold text-slate-800 leading-none mt-1">{conferences.length}</span>
            <span className="text-[9px] text-blue-600 font-semibold tracking-tight bg-blue-50 px-1 py-0.5 rounded mt-1.5 inline-block">Active Assemblies</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-lg shrink-0">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Manuscripts Ingested</span>
            <span className="block text-2xl font-bold text-slate-800 leading-none mt-1">{papers.length}</span>
            <span className="text-[9px] text-slate-600 font-semibold tracking-tight bg-slate-100 px-1 py-0.5 rounded mt-1.5 inline-block">Double-Blind Submissions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg shrink-0">
            <Brain className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Requires Match</span>
            <span className="block text-2xl font-bold text-orange-600 leading-none mt-1">
              {pendingPapersCount + underReviewCount}
            </span>
            <span className="text-[9px] text-orange-600 font-semibold tracking-tight bg-orange-50 px-1 py-0.5 rounded mt-1.5 inline-block">{pendingPapersCount} Pending Verification</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <Database className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Sales Ledger</span>
            <span className="block text-lg font-bold text-slate-800 leading-none mt-1">NPR {totalRevenueNpr.toLocaleString()}</span>
            <span className="text-[9px] text-emerald-600 font-semibold tracking-tight bg-emerald-50 px-1 py-0.5 rounded mt-1.5 inline-block">Secure Verified Webhooks</span>
          </div>
        </div>

      </div>

      {/* 2. Conference Creation Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="space-y-0.5">
            <h3 className="font-bold text-slate-800 text-sm">Conference Assemblies Group</h3>
            <p className="text-xs text-slate-400">Instantiate academic conventions, set author deadlines and allocate venues</p>
          </div>
          <button
            onClick={() => setShowConfForm(!showConfForm)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Assembly</span>
          </button>
        </div>

        {/* Conference Create Form */}
        {showConfForm && (
          <form onSubmit={handleCreateConf} className="p-5 bg-slate-50/60 border border-slate-200 rounded-xl space-y-4 animate-in slide-in-from-top-4 duration-200">
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Assembly Parameters Configuration</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Event Assembly Title</label>
                <input
                  type="text"
                  placeholder="e.g. Kathmandu Engineering Colloquium 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none placeholder-slate-400 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Event Assemblies Host Date</label>
                <input
                  type="text"
                  placeholder="e.g. November 18-20, 2026"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none placeholder-slate-400 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Host Venue Location Address</label>
                <input
                  type="text"
                  placeholder="e.g. IOE Pulchowk, Lalitpur, Nepal"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none placeholder-slate-400 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Manuscript Deadline</label>
                <input
                  type="text"
                  placeholder="e.g. Oct 10, 2026"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none placeholder-slate-400 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowConfForm(false)}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Collapse
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs disabled:opacity-50 cursor-pointer transition-colors"
              >
                {creating ? "Instantiating..." : "Confirm Assembly Launch"}
              </button>
            </div>
          </form>
        )}

        {/* Existing Conferences */}
        {conferences.length === 0 ? (
          <div className="p-8 mt-4 text-center bg-slate-50/70 border border-dashed border-slate-200 rounded-xl space-y-2">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-bold text-xs text-slate-700">No Conference Assemblies Yet</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Your database is fresh and empty. Click &ldquo;+ Launch New Assembly&rdquo; above to create your first conference with venue, dates, and ticket tiers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {conferences.map((c) => (
              <div key={c.id} className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl space-y-1.5 hover:border-slate-300 transition-colors relative group">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200/50">
                    ID: #{c.id}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] rounded-full font-bold uppercase tracking-wider border border-blue-100/50">
                      {c.status}
                    </span>
                    {onDeleteConference && (
                      <button
                        onClick={() => setConfToDelete(c)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title={`Delete ${c.title} assembly`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h4 className="font-bold text-xs text-slate-800 leading-snug">{c.title}</h4>
                <div className="text-[11px] text-slate-500 font-medium">
                  Date: <span className="text-slate-750 font-semibold">{c.date}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Venue: {c.venue} &middot; Sub Deadline: {c.deadline}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Smart Peer-Review Engine & Manuscripts Assignment Hub */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/40">
          <h3 className="font-bold text-slate-800 text-sm">Smart Peer-Review Engine Router</h3>
          <p className="text-xs text-slate-400 mt-1">Enforces double-blind peer reviews. Matches domain tags to experts or exports indices to Scopus XML.</p>
        </div>

        <div className="divide-y divide-slate-100">
          {papers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No manuscript papers submitted yet. Authors can submit abstracts via the Author Portal.
            </div>
          ) : (
            papers.map((paper) => {
              const currentReviewer = reviewers.find((r) => r.id === paper.assignedReviewerId);
              const feedbackMsg = matchingFeedback[paper.id];
              const loadState = matchingLoading[paper.id];

              const isAccepted = paper.status === "Accepted";
              const isRejected = paper.status === "Rejected";

              return (
                <div key={paper.id} className="p-6 space-y-4 hover:bg-slate-50/30 transition-colors">
                  
                  {/* Meta Paper Title and Double Blind Safeguard */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wider">
                          CH-{paper.id.split("-").pop()?.toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider flex items-center space-x-1 ${
                          isAccepted
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isRejected
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {isAccepted && <CheckCircle className="w-3 h-3 text-emerald-600 inline" />}
                          {isRejected && <X className="w-3 h-3 text-rose-600 inline" />}
                          <span>{paper.status}</span>
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 max-w-xl leading-relaxed mt-1">{paper.title}</h4>
                    </div>

                    {/* Scopus Export Button Controls */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => triggerExportIndex(paper.id, "xml")}
                        className="px-2.5 py-1 text-[10px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <FileCode className="w-3.5 h-3.5 text-blue-500" />
                        <span>Scopus XML</span>
                      </button>
                      <button
                        onClick={() => triggerExportIndex(paper.id, "json")}
                        className="px-2.5 py-1 text-[10px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <Database className="w-3.5 h-3.5 text-slate-400" />
                        <span>DOAJ JSON</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    
                    {/* Column 1: Privacy Safeguard Info */}
                    <div className="space-y-1 bg-slate-50/60 p-3 rounded-lg border border-slate-200/60">
                      <span className="text-[9px] font-mono tracking-wider font-semibold uppercase text-slate-400">
                        Author Coordinates
                      </span>
                      <div className="text-[11px] leading-relaxed">
                        <p className="font-semibold text-slate-800">{paper.authorName}</p>
                        <p className="text-slate-400 font-mono text-[10px] truncate">{paper.authorEmail}</p>
                      </div>
                    </div>

                    {/* Column 2: Subject Domain Tags */}
                    <div className="space-y-1 bg-slate-50/60 p-3 rounded-lg border border-slate-200/60">
                      <span className="text-[9px] font-mono tracking-wider font-semibold uppercase text-slate-400">
                        Ingested Domains
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {paper.domainTags.map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 bg-white text-slate-650 text-[10px] rounded border border-slate-200 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Professional Reviewer Entity Allocation */}
                    <div className="space-y-1 bg-slate-50/60 p-3 rounded-lg border border-slate-200/60">
                      <span className="text-[9px] font-mono tracking-wider font-semibold uppercase text-slate-400">
                        Assigned Reviewer
                      </span>
                      {currentReviewer ? (
                        <div className="text-[11px]">
                          <p className="font-semibold text-slate-800">{currentReviewer.name}</p>
                          <p className="text-slate-400 text-[10px] font-mono truncate">{currentReviewer.email}</p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-600 font-semibold italic">Awaiting Evaluator</p>
                      )}
                    </div>

                  </div>

                  {/* Algorithmic router match click & Action Area */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 bg-slate-50/80 p-3 rounded-lg border border-slate-200/70">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => triggerAutoMatch(paper.id)}
                        disabled={loadState}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        <Brain className="w-3.5 h-3.5 text-blue-400" />
                        <span>{loadState ? "Matching..." : "Auto-Route Reviewer"}</span>
                      </button>
                      
                      {/* Manual Override Option */}
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "__UNASSIGN__") {
                            if (onUnassignReviewer) {
                              onUnassignReviewer(paper.id);
                            } else {
                              onManualAssign(paper.id, "");
                            }
                          } else if (val) {
                            onManualAssign(paper.id, val);
                          }
                        }}
                        value={paper.assignedReviewerId || ""}
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 outline-none hover:border-slate-300 transition-all font-medium"
                      >
                        <option value="">-- Override Reviewer --</option>
                        {paper.assignedReviewerId && (
                          <option value="__UNASSIGN__">-- Unassign / Remove Reviewer --</option>
                        )}
                        {reviewers.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.domains[0] || "General"})
                          </option>
                        ))}
                      </select>

                      {paper.assignedReviewerId && onUnassignReviewer && (
                        <button
                          onClick={() => onUnassignReviewer(paper.id)}
                          className="px-2 py-1.5 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors flex items-center space-x-1 cursor-pointer"
                          title="Remove reviewer assignment"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Unassign</span>
                        </button>
                      )}
                    </div>

                    {/* Dynamic Decision Status Actions */}
                    <div className="flex items-center space-x-2">
                      {isAccepted ? (
                        <>
                          <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[11px] font-semibold flex items-center space-x-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Accepted</span>
                          </div>
                          <button
                            onClick={() => openAcceptModal(paper)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors flex items-center space-x-1"
                            title="Open session block modal to add or edit presentation schedule"
                          >
                            <Calendar className="w-3 h-3 text-blue-600" />
                            <span>Add Session Block</span>
                          </button>
                          <button
                            onClick={() => onUpdatePaperStatus(paper.id, "Rejected")}
                            className="px-2.5 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
                            title="Change decision to Rejected"
                          >
                            Revoke / Reject
                          </button>
                        </>
                      ) : isRejected ? (
                        <>
                          <div className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[11px] font-semibold flex items-center space-x-1">
                            <X className="w-3.5 h-3.5 text-rose-600" />
                            <span>Rejected</span>
                          </div>
                          <button
                            onClick={() => openAcceptModal(paper)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Re-evaluate & Accept</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openAcceptModal(paper)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center space-x-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept Paper</span>
                          </button>
                          <button
                            onClick={() => onUpdatePaperStatus(paper.id, "Rejected")}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                          >
                            Reject Paper
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Match Results text */}
                  {feedbackMsg && (
                    <p className="text-[11px] text-blue-700 bg-blue-50 border border-blue-100/50 px-3 py-2 rounded-lg font-mono">
                      {feedbackMsg}
                    </p>
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3b. Peer Reviewers Expert Registry */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-800 text-sm">Peer Reviewers Registry</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {reviewers.length} {reviewers.length === 1 ? "Expert" : "Experts"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Accredited academic referees and subject matter experts for automated manuscript scoring.
            </p>
          </div>
          <button
            onClick={() => setShowAddReviewerModal(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expert Reviewer</span>
          </button>
        </div>

        <div className="p-6">
          {reviewers.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/70 border border-dashed border-slate-200 rounded-xl space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-bold text-xs text-slate-700">No Peer Reviewers Enrolled</h4>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                No reviewers are registered yet. Click &ldquo;Add Expert Reviewer&rdquo; above or invite reviewers to sign up on the platform.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {reviewers.map((rev) => (
                <div key={rev.id || rev.email} className="p-4 bg-slate-50/50 border border-slate-200/70 rounded-xl space-y-2 hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        {rev.name?.slice(0, 1) || "R"}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{rev.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{rev.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(rev.domains || []).map((dom) => (
                      <span key={dom} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[9.5px] font-medium text-slate-600">
                        {dom}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Reviewer Modal */}
      {showAddReviewerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white text-slate-800 rounded-2xl overflow-hidden w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-150 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Enroll Peer Reviewer Expert</h3>
              </div>
              <button
                onClick={() => setShowAddReviewerModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newRevName || !newRevEmail) return;
                setIsAddingReviewer(true);
                try {
                  const domainsList = newRevDomains
                    .split(",")
                    .map((d) => d.trim())
                    .filter(Boolean);
                  if (onRegisterReviewer) {
                    await onRegisterReviewer({
                      name: newRevName,
                      email: newRevEmail,
                      domains: domainsList.length ? domainsList : ["General Science"],
                    });
                  }
                  setNewRevName("");
                  setNewRevEmail("");
                  setShowAddReviewerModal(false);
                } finally {
                  setIsAddingReviewer(false);
                }
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Priya Sharma"
                  value={newRevName}
                  onChange={(e) => setNewRevName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-500 transition-colors text-slate-800 font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Institutional Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. p.sharma@university.edu"
                  value={newRevEmail}
                  onChange={(e) => setNewRevEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-500 transition-colors text-slate-800 font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Research Domains &amp; Specializations (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="Artificial Intelligence, Computer Science, Cyber Security"
                  value={newRevDomains}
                  onChange={(e) => setNewRevDomains(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-500 transition-colors text-slate-800 font-medium"
                />
                <p className="text-[10px] text-slate-400">
                  These keywords are matched against incoming manuscripts during AI domain auto-assignment.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddReviewerModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingReviewer}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <span>{isAddingReviewer ? "Registering..." : "Save Reviewer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accept Paper & Schedule Session Block Modal */}
      {acceptModalPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white text-slate-800 rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-150 bg-gradient-to-r from-emerald-50 via-slate-50 to-white flex justify-between items-center">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                    <span>Add Session Block for Accepted Manuscript</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Manuscript acceptance confirmed. Allocate a timetable presentation slot in the conference schedule.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAcceptModalPaper(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Accepted Paper Summary Card */}
              <div className="p-4 bg-emerald-50/40 border border-emerald-200/70 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
                    CH-{acceptModalPaper.id.split("-").pop()?.toUpperCase()} &middot; Acceptance Stage
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Author: <strong className="text-slate-800 font-semibold">{acceptModalPaper.authorName}</strong> ({acceptModalPaper.authorEmail})
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-850 leading-relaxed">
                  {acceptModalPaper.title}
                </h4>

                <div className="bg-white/80 p-3 rounded-lg border border-emerald-100 space-y-1">
                  <span className="text-[10px] font-mono font-semibold uppercase text-emerald-800 flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>Paper Abstract & Description</span>
                  </span>
                  <p className="text-[11px] text-slate-650 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all cursor-default">
                    {acceptModalPaper.abstractText || "No abstract submitted."}
                  </p>
                </div>

                {acceptModalPaper.domainTags && acceptModalPaper.domainTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {acceptModalPaper.domainTags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-white text-slate-650 text-[10px] rounded border border-slate-200 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Session Block Form Configuration */}
              <div className="space-y-4 pt-1">
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Session Block Timeline Allocation</span>
                </h4>

                {/* Target Conference */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Target Conference Assembly
                  </label>
                  <select
                    value={sessionConferenceId}
                    onChange={(e) => setSessionConferenceId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-medium text-slate-700"
                  >
                    {conferences.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.date})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Session Title */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Session Presentation Title
                  </label>
                  <input
                    type="text"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="e.g. Technical Session: Paper Title"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-800 font-medium"
                    required
                  />
                </div>

                {/* Speaker & Session Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Presenting Author / Speaker
                    </label>
                    <input
                      type="text"
                      value={sessionSpeaker}
                      onChange={(e) => setSessionSpeaker(e.target.value)}
                      placeholder="e.g. Author Name"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-800 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Session Block Type
                    </label>
                    <select
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-medium text-slate-700"
                    >
                      <option value="Paper Presentation">Paper Presentation (Oral)</option>
                      <option value="Poster Presentation">Poster Presentation</option>
                      <option value="Keynote">Keynote Address</option>
                      <option value="Panel">Panel Discussion</option>
                      <option value="Workshop">Technical Track / Workshop</option>
                    </select>
                  </div>
                </div>

                {/* Time Slot & Room */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Schedule Time Slot
                    </label>
                    <input
                      type="text"
                      value={sessionTimeSlot}
                      onChange={(e) => setSessionTimeSlot(e.target.value)}
                      placeholder="e.g. 10:30 AM - 11:30 AM"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-800 font-medium"
                      required
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {["09:00 AM - 10:00 AM", "10:30 AM - 11:30 AM", "11:30 AM - 12:30 PM", "01:30 PM - 02:30 PM", "03:00 PM - 04:00 PM"].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSessionTimeSlot(slot)}
                          className={`text-[9.5px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                            sessionTimeSlot === slot 
                              ? "bg-blue-50 text-blue-700 border-blue-200 font-bold" 
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {slot.split(" - ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Hall / Room Location
                    </label>
                    <input
                      type="text"
                      value={sessionRoom}
                      onChange={(e) => setSessionRoom(e.target.value)}
                      placeholder="e.g. Hall A - Annapurna"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-800 font-medium"
                      required
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {["Hall A - Annapurna", "Hall B - Everest", "Sagarmatha Grand Ballroom (Hall 1)", "Terrace Garden Cafe"].map((room) => (
                        <button
                          key={room}
                          type="button"
                          onClick={() => setSessionRoom(room)}
                          className={`text-[9.5px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer truncate max-w-[140px] ${
                            sessionRoom === room 
                              ? "bg-blue-50 text-blue-700 border-blue-200 font-bold" 
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                          title={room}
                        >
                          {room.split(" - ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Session Description / Abstract Notes */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Session Description / Topic Synopsis
                  </label>
                  <textarea
                    rows={3}
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    placeholder="Brief description of the paper session for attendees..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-700 resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-150 bg-slate-50/80 flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => setAcceptModalPaper(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isProcessingAccept}
                  onClick={handleConfirmAcceptOnly}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                  title="Accept the paper without adding a timetable session block"
                >
                  Accept Paper Only
                </button>

                <button
                  type="button"
                  disabled={isProcessingAccept}
                  onClick={handleConfirmAcceptWithSession}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isProcessingAccept ? "Scheduling..." : "Accept & Add to Schedule"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Index Preview Modal Backdrop */}
      {indexPaperId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-slate-900 text-slate-100 rounded-xl overflow-hidden w-full max-w-2xl shadow-2xl animate-in font-mono text-xs border border-slate-800">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <span className="font-bold tracking-wider text-blue-400">
                SCHOLARLY PREVIEW INDEX ({indexFormat.toUpperCase()})
              </span>
              <button
                onClick={() => setIndexPaperId(null)}
                className="text-slate-400 hover:text-white px-2 py-1 text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-[10px] text-slate-400 mb-3 leading-relaxed font-sans">
                This schema meets the DOAJ metadata ingestion mandate and is fully mapped to high-integrity indexing standards (Scopus, DOAJ, Google Scholar).
              </p>
              
              {loadingIndex ? (
                <div className="p-20 text-center text-slate-500 font-sans">Generating structured schema...</div>
              ) : (
                <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto max-h-[300px] border border-slate-850 text-emerald-400 leading-relaxed text-[11px]">
                  {indexData}
                </pre>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-800 text-right bg-slate-950 flex justify-between items-center">
              <span className="text-[9px] text-slate-500 tracking-wider">MAPPED COMPLIANCY VERIFIED: CC-BY-NC</span>
              <button
                onClick={() => setIndexPaperId(null)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold font-sans cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Schedule Builder block */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
          CONFSCHEDULE MANAGEMENT CORNER
        </h3>
        <ScheduleBuilder
          schedule={schedule}
          conferences={conferences}
          conferenceId={conferences[0]?.id || "conf-1"}
          onSaveSchedule={onSaveSchedule}
          papers={papers}
        />
      </div>

      {/* 6. Registration Orders Table & Revenue Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
        
        {/* Ledger Header Bar */}
        <div className="p-6 border-b border-slate-150 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <Receipt className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Registrations &amp; Revenue Ledger</h3>
              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider font-mono">
                {completedOrders.length} Paid Passes
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Real-time payment webhook confirmations, delegate pass credentials, and financial audit reconciliation.
            </p>
          </div>

          {/* Header Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowManualOrderModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Offline / Desk Pass</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-750 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-3xs"
              title="Download CSV report of current filtered orders"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {onRefreshOrders && (
              <button
                onClick={onRefreshOrders}
                className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer shadow-3xs"
                title="Sync database transactions"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Ledger Notification alert banner */}
        {ledgerMessage && (
          <div className={`p-3.5 text-xs flex items-center justify-between border-b ${
            ledgerMessage.type === "success" 
              ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}>
            <div className="flex items-center space-x-2 font-medium">
              {ledgerMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{ledgerMessage.text}</span>
            </div>
            <button onClick={() => setLedgerMessage(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Financial Metrics Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50/70 border-b border-slate-150 text-xs">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-3xs space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Total Revenue</span>
            <div className="font-bold text-slate-900 text-base font-mono">
              NPR {totalCompletedNpr.toLocaleString()}
            </div>
            <span className="text-[9.5px] text-slate-500 font-mono">
              (NPR {totalCompletedNprOnly.toLocaleString()} + USD ${totalCompletedUsd})
            </span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-3xs space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Verified Delegates</span>
            <div className="font-bold text-emerald-600 text-base font-mono">
              {completedOrders.length} <span className="text-xs text-slate-400 font-normal">/ {orders.length} total</span>
            </div>
            <span className="text-[9.5px] text-emerald-700 font-medium">
              {orders.length > 0 ? `${Math.round((completedOrders.length / orders.length) * 100)}% Verified` : "0%"}
            </span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-3xs space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Pending Approvals</span>
            <div className="font-bold text-amber-600 text-base font-mono">
              {pendingOrders.length}
            </div>
            <span className="text-[9.5px] text-amber-700 font-medium">
              Awaiting Webhook or Admin Verification
            </span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-3xs space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Gateway Breakdown</span>
            <div className="flex flex-wrap gap-1 items-center">
              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[9.5px] font-bold font-mono">
                eSewa ({esewaOrdersCount})
              </span>
              <span className="px-1.5 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded text-[9.5px] font-bold font-mono">
                Khalti ({khaltiOrdersCount})
              </span>
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[9.5px] font-bold font-mono">
                Stripe/Card ({stripeOrdersCount})
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-slate-150 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80 overflow-x-auto">
            <button
              onClick={() => setOrderStatusFilter("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                orderStatusFilter === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setOrderStatusFilter("Completed")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                orderStatusFilter === "Completed" ? "bg-emerald-600 text-white shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Completed ({completedOrders.length})
            </button>
            <button
              onClick={() => setOrderStatusFilter("Pending")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                orderStatusFilter === "Pending" ? "bg-amber-500 text-white shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Pending ({pendingOrders.length})
            </button>
            <button
              onClick={() => setOrderStatusFilter("Failed")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                orderStatusFilter === "Failed" ? "bg-rose-600 text-white shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Failed / Refunded ({orders.filter(o => o.status === "Failed").length})
            </button>
          </div>

          {/* Search and Secondary Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Conference Selector */}
            <div className="relative">
              <select
                value={orderConfFilter}
                onChange={(e) => setOrderConfFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-500 font-medium"
              >
                <option value="all">All Conferences</option>
                {conferences.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Gateway Filter */}
            <div className="relative">
              <select
                value={orderGatewayFilter}
                onChange={(e) => setOrderGatewayFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-500 font-medium"
              >
                <option value="all">All Gateways</option>
                <option value="eSewa">eSewa</option>
                <option value="Khalti">Khalti</option>
                <option value="Stripe">Stripe / Card</option>
                <option value="Cash">On-Site / Cash</option>
              </select>
            </div>

            {/* Search Box */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search delegate, email, trn..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
              />
              {orderSearch && (
                <button
                  onClick={() => setOrderSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-white">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Receipt className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">No Transaction Records Found</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {orderSearch || orderStatusFilter !== "all" || orderConfFilter !== "all" || orderGatewayFilter !== "all"
                    ? "No registrations match your active search or filter criteria. Try resetting the filters."
                    : "No registration pass purchases have been recorded in the database ledger yet."}
                </p>
              </div>
              <div className="pt-2 flex justify-center space-x-2">
                {(orderSearch || orderStatusFilter !== "all" || orderConfFilter !== "all" || orderGatewayFilter !== "all") && (
                  <button
                    onClick={() => {
                      setOrderSearch("");
                      setOrderStatusFilter("all");
                      setOrderConfFilter("all");
                      setOrderGatewayFilter("all");
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Clear Filter Criteria
                  </button>
                )}
                <button
                  onClick={() => setShowManualOrderModal(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record First Delegate Pass</span>
                </button>
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-mono text-slate-400 uppercase tracking-widest text-[9px] select-none font-semibold">
                  <th className="p-4 font-semibold">Delegate / Customer</th>
                  <th className="p-4 font-semibold">Assembly Target</th>
                  <th className="p-4 font-semibold">Pass Tier</th>
                  <th className="p-4 font-semibold text-center">Amount</th>
                  <th className="p-4 font-semibold text-center">Payment Gateway</th>
                  <th className="p-4 font-semibold">TRN Reference</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-right pr-6">Ledger Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredOrders.map((o) => {
                  const conf = conferences.find((c) => c.id === o.conferenceId);
                  const isProcessing = processingOrderId === o.id;

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Customer */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block text-xs">{o.userName}</span>
                          <span className="text-slate-400 font-mono text-[10px] block">{o.userEmail}</span>
                          <span className="text-[9.5px] text-slate-400 font-mono block">
                            {new Date(o.createdAt).toLocaleDateString()} &middot; #{o.id.slice(-6)}
                          </span>
                        </div>
                      </td>

                      {/* Conference Target */}
                      <td className="p-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold block max-w-[140px] truncate border border-slate-200" title={conf?.title || o.conferenceId}>
                          {conf?.title || o.conferenceId}
                        </span>
                      </td>

                      {/* Pass Tier */}
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 block text-xs">{o.passType}</span>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-mono font-bold text-slate-800 text-center">
                        <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs">
                          {o.currency} {o.price.toLocaleString()}
                        </span>
                      </td>

                      {/* Payment Gateway */}
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase font-mono border ${
                          o.gateway.toLowerCase().includes("esewa")
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : o.gateway.toLowerCase().includes("khalti")
                            ? "bg-purple-50 text-purple-700 border-purple-200" 
                            : o.gateway.toLowerCase().includes("stripe")
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}>
                          {o.gateway}
                        </span>
                      </td>

                      {/* Reference Ticket */}
                      <td className="p-4 font-mono text-[10.5px]">
                        {o.trnRef ? (
                          <span className="text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate inline-block max-w-[130px]" title={o.trnRef}>
                            {o.trnRef}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">-- Awaiting TRN --</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 text-[9px] rounded-full font-bold uppercase tracking-wider border inline-block ${
                          o.status === "Completed"
                            ? "bg-emerald-50 text-emerald-750 border-emerald-200 font-bold" 
                            : o.status === "Pending"
                            ? "bg-amber-50 text-amber-750 border-amber-200 font-bold"
                            : "bg-rose-50 text-rose-750 border-rose-200 font-bold"
                        }`}>
                          {o.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end space-x-1.5">
                          {o.status === "Pending" && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleUpdateOrderStatus(o.id, "Completed", `VERIFIED-ADMIN-${Math.floor(Math.random() * 900000) + 100000}`)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center space-x-1 shadow-3xs disabled:opacity-50"
                              title="Manually confirm & approve this payment"
                            >
                              <Check className="w-3 h-3" />
                              <span>Verify</span>
                            </button>
                          )}

                          {o.status === "Pending" && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleUpdateOrderStatus(o.id, "Failed")}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                              title="Mark as Failed/Declined"
                            >
                              Reject
                            </button>
                          )}

                          {o.status === "Completed" && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleUpdateOrderStatus(o.id, "Failed")}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                              title="Mark transaction as Refunded/Revoked"
                            >
                              Refund
                            </button>
                          )}

                          <button
                            disabled={isProcessing}
                            onClick={() => setOrderToDelete(o)}
                            className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Delete transaction record from ledger"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Conference Assembly Confirmation Dialog */}
      {confToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Conference Assembly</h3>
                <p className="text-[11px] text-slate-500">Assembly ID: #{confToDelete.id}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400">Title:</span>
                <span className="font-bold text-slate-800">{confToDelete.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Host Date:</span>
                <span>{confToDelete.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Venue:</span>
                <span>{confToDelete.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deadline:</span>
                <span>{confToDelete.deadline}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to permanently delete this conference assembly? All related scheduled sessions and assemblies will be removed.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingConf}
                onClick={() => handleDeleteConferenceAction(confToDelete.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingConf ? "Deleting..." : "Confirm Delete Assembly"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Dialog */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Transaction Record</h3>
                <p className="text-[11px] text-slate-500">Order ID: #{orderToDelete.id}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400">Delegate:</span>
                <span className="font-bold text-slate-800">{orderToDelete.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-[11px]">{orderToDelete.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pass Type:</span>
                <span>{orderToDelete.passType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-mono font-bold">{orderToDelete.currency} {orderToDelete.price.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to permanently remove this transaction from the registration ledger? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processingOrderId === orderToDelete.id}
                onClick={() => handleDeleteOrder(orderToDelete.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{processingOrderId === orderToDelete.id ? "Deleting..." : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Registration / Offline Order Modal */}
      {showManualOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-150 bg-slate-50/80 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Receipt className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-slate-800">Record Offline / On-Site Delegate Pass</h3>
              </div>
              <button
                onClick={() => setShowManualOrderModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Delegate Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Er. Pradeep Thapa"
                    value={manualUserName}
                    onChange={(e) => setManualUserName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Delegate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. pradeep@tu.edu.np"
                    value={manualUserEmail}
                    onChange={(e) => setManualUserEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Target Conference Assembly
                </label>
                <select
                  value={manualConferenceId}
                  onChange={(e) => setManualConferenceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-700 font-medium"
                >
                  {conferences.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Pass Tier
                  </label>
                  <select
                    value={manualPassType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setManualPassType(val);
                      if (val.includes("Student")) {
                        setManualPrice(1500);
                        setManualCurrency("NPR");
                      } else if (val.includes("International")) {
                        setManualPrice(50);
                        setManualCurrency("USD");
                      } else {
                        setManualPrice(3500);
                        setManualCurrency("NPR");
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-700 font-medium"
                  >
                    <option value="Student Delegate Pass">Student Delegate Pass (NPR 1,500)</option>
                    <option value="Professional Delegate Pass">Professional Delegate Pass (NPR 3,500)</option>
                    <option value="International Delegate Pass">International Delegate Pass (USD 50)</option>
                    <option value="VIP Keynote / Speaker Pass">VIP Keynote / Speaker Pass (NPR 0)</option>
                    <option value="Custom Registration Pass">Custom Registration Pass</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Price &amp; Currency
                  </label>
                  <div className="flex space-x-1.5">
                    <input
                      type="number"
                      required
                      min="0"
                      value={manualPrice}
                      onChange={(e) => setManualPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-mono font-bold text-slate-800"
                    />
                    <select
                      value={manualCurrency}
                      onChange={(e) => setManualCurrency(e.target.value as "NPR" | "USD")}
                      className="px-2.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-700"
                    >
                      <option value="NPR">NPR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Payment Channel
                  </label>
                  <select
                    value={manualGateway}
                    onChange={(e) => setManualGateway(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-700 font-medium"
                  >
                    <option value="On-Site Cash / Desk Registration">On-Site Cash / Desk Registration</option>
                    <option value="Bank Direct Wire Transfer">Bank Direct Wire Transfer</option>
                    <option value="eSewa (Offline POS)">eSewa (Offline POS)</option>
                    <option value="Khalti (Offline QR)">Khalti (Offline QR)</option>
                    <option value="ConnectIPS / NCHL">ConnectIPS / NCHL</option>
                    <option value="Complimentary / Sponsored">Complimentary / Sponsored</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Payment Status
                  </label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as "Completed" | "Pending")}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-700 font-medium"
                  >
                    <option value="Completed">Completed (Verified &amp; Paid)</option>
                    <option value="Pending">Pending (Awaiting Wire / Cheque)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Reference Voucher / Cheque / TRN Ref (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CASH-RCPT-00412 or BANK-SLIP-9812"
                  value={manualTrnRef}
                  onChange={(e) => setManualTrnRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-mono text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-150 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowManualOrderModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManualOrder}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{submittingManualOrder ? "Saving Pass..." : "Record to Ledger"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
