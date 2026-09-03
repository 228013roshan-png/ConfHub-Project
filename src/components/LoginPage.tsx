import React, { useState } from "react";
import { 
  Lock, 
  Mail, 
  ArrowLeft, 
  ShieldCheck, 
  BookOpen, 
  User, 
  HelpCircle,
  AlertCircle,
  GraduationCap
} from "lucide-react";
import { Reviewer, UserRole, UserSession } from "../types";

interface LoginPageProps {
  reviewers: Reviewer[];
  onNavigate: (view: "landing" | "login" | "signup" | "app", selectedRole?: UserRole) => void;
  onLoginSuccess: (user: UserSession) => void;
  defaultRole?: UserRole;
  currentUser?: UserSession | null;
  onLogout?: () => void;
}

export function LoginPage({ reviewers, onNavigate, onLoginSuccess, defaultRole, currentUser, onLogout }: LoginPageProps) {
  const [role, setRole] = useState<UserRole>(defaultRole || "author");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-center items-center p-4">
        <button 
          onClick={() => onNavigate("landing")}
          className="mb-6 flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold select-none cursor-pointer group transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Go Back Home</span>
        </button>

        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 text-center space-y-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
            {currentUser.role === "student" ? (
              <GraduationCap className="w-6 h-6 text-emerald-600" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">Already Signed In</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              You are currently logged in as <strong className="text-slate-800 font-bold">{currentUser.name}</strong> ({currentUser.email}) with active <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">{currentUser.role}</span> privileges.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {currentUser.role === "student" ? (
              <button
                onClick={() => onNavigate("landing")}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center justify-center space-x-2"
              >
                <span>Go to Conference Home &amp; Passes</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate("app", currentUser.role)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center justify-center space-x-2"
              >
                <span>Go to {currentUser.role.toUpperCase()} Workspace</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                Sign Out &amp; Switch Account
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }



  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email) {
      setErrorMsg("Please enter your academic registration email.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your account password.");
      return;
    }

    setLoading(true);

    try {
      // Direct login against data.json
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
          role: role
        })
      });

      let resData: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        resData = await res.json();
      } else {
        const rawText = await res.text();
        console.warn("Unexpected non-JSON response from /api/users/login:", rawText.slice(0, 150));
        resData = { error: "Authentication service is currently reconciling. Please try again in a moment." };
      }

      if (!res.ok) {
        throw new Error(resData.error || "Authentication failed. Please verify your credentials.");
      }

      const authenticatedUser = resData.user;
      
      onLoginSuccess({
        name: authenticatedUser.name,
        email: authenticatedUser.email.toLowerCase(),
        role: authenticatedUser.role,
        token: authenticatedUser.token || resData.token,
      });

    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMsg(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      
      {/* Back button to landing */}
      <button 
        onClick={() => onNavigate("landing")}
        className="mb-6 flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold select-none cursor-pointer group transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        <span>Go Back Home</span>
      </button>

      {/* Main Login Box */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Banner header brand */}
        <div className="p-6 bg-slate-900 text-white text-center space-y-2 relative select-none">
          <div className="inline-flex w-10 h-10 bg-blue-600 rounded-xl items-center justify-center text-white font-bold leading-none mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold tracking-tight">Log In</h2>
          <p className="text-[10.5px] text-slate-400">Log in to check reviews, papers, and tickets</p>
        </div>

        {/* Form controls */}
        <div className="p-6 space-y-6">

          {/* Core Roles switch tabs */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Select Your Role
            </label>
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-205">
              <button
                type="button"
                onClick={() => setRole("author")}
                className={`flex flex-col items-center justify-center py-2 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  role === "author" ? "bg-white text-blue-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <User className="w-3.5 h-3.5 mb-0.5" />
                <span>Author</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("reviewer")}
                className={`flex flex-col items-center justify-center py-2 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  role === "reviewer" ? "bg-white text-blue-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 mb-0.5" />
                <span>Reviewer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex flex-col items-center justify-center py-2 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  role === "student" ? "bg-white text-emerald-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 mb-0.5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex flex-col items-center justify-center py-2 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  role === "admin" ? "bg-white text-blue-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 mb-0.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-650 text-xs font-semibold rounded-lg flex items-start space-x-2 animate-pulse">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder={role === "student" ? "e.g. student@university.edu" : "e.g. name@domain.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-500 transition-colors text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <span className="text-[10px] text-blue-600 hover:underline cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-500 transition-colors text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Submit btn */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 ${role === "student" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"} disabled:bg-blue-400 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex justify-center items-center shadow-xs`}
            >
              {loading ? "Checking details..." : role === "student" ? "Log In as Student" : "Log In"}
            </button>

          </form>

          {/* Join Link */}
          <div className="text-center pt-2">
            {role === "admin" ? (
              <span className="text-slate-400 text-[11px]">
                Admin accounts are pre-authorized and cannot be registered publicly.
              </span>
            ) : role === "student" ? (
              <>
                <span className="text-slate-400 text-xs text-medium">
                  Don't have a student account?{" "}
                </span>
                <button
                  onClick={() => onNavigate("signup", "student")}
                  className="text-emerald-600 font-bold hover:underline py-1 text-xs select-none cursor-pointer"
                >
                  Sign up as Student
                </button>
              </>
            ) : (
              <>
                <span className="text-slate-400 text-xs text-medium">
                  Don't have an account?{" "}
                </span>
                <button
                  onClick={() => onNavigate("signup", role)}
                  className="text-blue-600 font-bold hover:underline py-1 text-xs select-none cursor-pointer"
                >
                  Sign up here
                </button>
              </>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
