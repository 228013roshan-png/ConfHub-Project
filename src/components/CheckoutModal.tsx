import React, { useState } from "react";
import { Order } from "../types";
import { X, CheckCircle, Smartphone, Lock, AlertCircle } from "lucide-react";

interface CheckoutModalProps {
  order: Order | null;
  isOpen?: boolean;
  onVerify: (success: boolean, trnRef?: string) => void;
  onClose: () => void;
}

export function CheckoutModal({ order, isOpen = true, onVerify, onClose }: CheckoutModalProps) {
  const [phone, setPhone] = useState("9841000000");
  const [pin, setPin] = useState("1234");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!order || !order.id || !isOpen) return null;

  const gwLower = (order.gateway || "").toLowerCase();
  const isCard = gwLower.includes("stripe") || gwLower.includes("card");
  const isEsewa = gwLower.includes("esewa");
  const isKhalti = gwLower.includes("khalti");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCard && (!phone || !pin)) {
      setError("Please fill mock phone and PIN credentials.");
      return;
    }
    setSubmitting(true);
    setError("");

    // Instant/smooth sandbox callback simulation
    setTimeout(() => {
      setSubmitting(false);
      const randomRef = isEsewa
        ? `ESE-${Math.floor(Math.random() * 8999999) + 1000000}`
        : isKhalti
        ? `KLT-${Math.floor(Math.random() * 8999999) + 1000000}`
        : `ch_stripe_${Math.random().toString(36).substring(2, 10)}`;
      onVerify(true, randomRef);
    }, 600);
  };

  const getGatewayColorStyles = () => {
    if (isEsewa) {
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        btn: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
        logo: "eSewa Nepal Sandbox",
      };
    }
    if (isKhalti) {
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        btn: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
        logo: "Khalti Digital Wallet",
      };
    }
    if (isCard) {
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        btn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        logo: "Stripe International",
      };
    }
    return {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
      btn: "bg-slate-900 hover:bg-slate-800 focus:ring-slate-500",
      logo: order.gateway ? `${order.gateway} Gateway` : "Secure Payment Gateway",
    };
  };

  const currentStyles = getGatewayColorStyles() || {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    btn: "bg-slate-900 hover:bg-slate-800 focus:ring-slate-500",
    logo: "Secure Payment Gateway",
  };

  return (
    <div id="checkout_modal_container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-sm overflow-hidden bg-white rounded-xl shadow-2xl animate-in font-sans">
        
        {/* Gateway Branded Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${currentStyles.border} ${currentStyles.bg}`}>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isEsewa ? "bg-emerald-500" : isKhalti ? "bg-purple-500" : "bg-blue-500"}`} />
            <span className={`font-mono text-xs font-bold uppercase tracking-wider ${currentStyles.text}`}>
              {currentStyles.logo}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-650 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Area */}
        <div className="p-6 border-b border-slate-150 bg-slate-50/30">
          <span className="text-[10px] text-slate-400 font-mono tracking-wider">SECURE TRANSACTION</span>
          <h3 className="text-sm font-semibold text-slate-850 mt-1">{order.passType}</h3>
          
          <div className="flex justify-between items-center mt-3">
            <span className="text-[10px] text-slate-400 font-mono">ORDER ID: {order.id}</span>
            <span className="text-lg font-mono font-bold text-slate-905 text-slate-850">
              {order.currency} {(order.price ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Sandbox Instruction Alert */}
        <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-100 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-800 leading-normal">
            <strong>ConfHub Sandbox Environment:</strong> Use mock credentials to simulate the active payment cycle. Real money will not be charged.
          </p>
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-xs text-red-650 bg-red-50 p-2.5 rounded border border-red-100 font-semibold">{error}</p>}
          
          {isCard ? (
            <div className="space-y-3">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cardholder Name</label>
              <input
                type="text"
                defaultValue={order.userName}
                disabled
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed font-medium"
              />
              
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Test Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="4242 •••• •••• 4242"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:border-blue-500 outline-none transition-colors"
                  required
                />
                <span className="absolute right-3 top-2 text-[9px] uppercase font-mono tracking-wider font-bold text-blue-600">
                  AUTOFILL READY
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Expiry</label>
                  <input
                    type="text"
                    placeholder="12/28"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:border-blue-500 outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">CVC</label>
                  <input
                    type="text"
                    placeholder="***"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:border-blue-500 outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Registered Mobile Number ({isEsewa ? "eSewa Id" : "Khalti M-ID"})
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98xxxxxxxx (e.g. 9841234567)"
                    maxLength={10}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:border-blue-500 outline-none transition-colors text-slate-750"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">NP Security PIN</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    maxLength={4}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:border-blue-500 outline-none transition-colors text-slate-750"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center space-x-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              Cancel Transaction
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs ${currentStyles.btn}`}
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Pay {order.currency} {order.price}</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="bg-slate-50 px-6 py-4 text-center border-t border-slate-150">
          <p className="text-[10px] text-slate-400 font-mono tracking-wider">
            SSL Secure End-To-End API verification webhook simulation
          </p>
        </div>
      </div>
    </div>
  );
}
