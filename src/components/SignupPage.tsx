import React, { useState } from "react";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Building,
  AlertCircle,
  GraduationCap
} from "lucide-react";
import { UserRole, UserSession } from "../types";

interface SignupPageProps {
  onNavigate: (view: "landing" | "login" | "signup" | "app", selectedRole?: UserRole) => void;
  onRefreshDatabase: () => Promise<void>;
  onLoginSuccess: (user: UserSession) => void;
  currentUser?: UserSession | null;
  defaultRole?: UserRole;
  onLogout?: () => void;
}

export function SignupPage({ onNavigate, onRefreshDatabase, onLoginSuccess, currentUser, defaultRole, onLogout }: SignupPageProps) {
  const [role, setRole] = useState<"author" | "reviewer" | "student">(
    defaultRole === "student" || defaultRole === "reviewer" || defaultRole === "author"
      ? defaultRole
      : "author"
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [major, setMajor] = useState("");
  const [password, setPassword] = useState("");
  
  // Domains for Reviewers
  const [selectedDomains, setSelectedDomains] = useState<string[]>(["Artificial Intelligence"]);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  if (currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-center items-center p-4">
        <button 
          onClick={() => onNavigate("landing")}
          className="mb-6 flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold select-none cursor-pointer group transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>

        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 text-center space-y-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
            {currentUser.role === "student" ? (
              <GraduationCap className="w-6 h-6 text-emerald-600" />
            ) : (
              <User className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">Account Session Active</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              You are currently signed in as <strong className="text-slate-800 font-bold">{currentUser.name}</strong> ({currentUser.email}) with <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">{currentUser.role}</span> role permissions.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {currentUser.role === "student" ? (
              <button
                onClick={() => onNavigate("landing")}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center justify-center space-x-2"
              >
                <span>Continue to Conference Home &amp; Passes</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate("app", currentUser.role)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center justify-center space-x-2"
              >
                <span>Continue to Workspace ({currentUser.role.toUpperCase()})</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                Sign Out &amp; Create New Account
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const [registeredUser, setRegisteredUser] = useState<{
    name: string;
    email: string;
    role: UserRole;
    institution?: string;
  } | null>(null);

  const availableDomains = [
    "Artificial Intelligence",
    "Machine Learning",
    "Cyber Security",
    "Telemedicine",
    "GIS",
    "Blockchain in Governance",
    "Climate Modeling",
    "Bioinformatics",
    "Cloud Computing"
  ];

  const handleDomainToggle = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      setSelectedDomains(selectedDomains.filter(d => d !== domain));
    } else {
      setSelectedDomains([...selectedDomains, domain]);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName) {
      setErrorMsg("Please enter your formal full name.");
      return;
    }
    if (!email) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg("Please choose a secure password (at least 4 characters).");
      return;
    }

    if (role === "reviewer" && selectedDomains.length === 0) {
      setErrorMsg("Expert Reviewers must select at least one field of study.");
      return;
    }

    setLoading(true);

    try {
      // POST directly to user registration endpoint which writes to data.json
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          role: role,
          institution: institution.trim() || (role === "reviewer" ? "Academic Review Board" : role === "student" ? "University / College" : "Research Institution"),
          domains: role === "reviewer" ? selectedDomains : role === "student" && major ? [major.trim()] : []
        }),
      });

      let resData: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        resData = await res.json();
      } else {
        const rawText = await res.text();
        console.warn("Unexpected non-JSON response from /api/users/register:", rawText.slice(0, 150));
        resData = { error: "Registration service is currently reconciling. Please try again in a moment." };
      }

      if (!res.ok) {
        throw new Error(resData.error || "Could not complete user registration.");
      }

      setRegisteredUser(resData.user);
      
      // Refresh DB so any synced reviewers or state updates are loaded
      await onRefreshDatabase();

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Registration server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoEnter = () => {
    if (registeredUser) {
      onLoginSuccess({
        name: registeredUser.name,
        email: registeredUser.email.toLowerCase(),
        role: registeredUser.role,
        token: registeredUser.token,
      });
    } else {
      onLoginSuccess({
        name: fullName,
        email: email.trim().toLowerCase(),
        role: role
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-center items-center py-12 px-4 selection:bg-blue-600 selection:text-white">
      
      {/* Back click link */}
      <button 
        onClick={() => onNavigate("landing")}
        className="mb-6 flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold select-none cursor-pointer group transition-colors animate-in"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Home</span>
      </button>

      {/* Main Container */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Banner */}
        <div className="p-6 bg-slate-900 text-white text-center space-y-2 relative select-none">
          <div className="inline-flex w-10 h-10 bg-blue-600 rounded-xl items-center justify-center text-white font-bold mx-auto leading-none">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <h2 className="text-base font-bold tracking-tight">Create Account</h2>
          <p className="text-[10.5px] text-slate-400">Join as an author, reviewer, or student delegate</p>
        </div>

        {/* Content area */}
        <div className="p-6 space-y-6">

          {success ? (
            <div className="space-y-6 text-center py-6 animate-in fade-in zoom-in-95 duration-200">
              <div className={`w-14 h-14 ${role === "student" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"} rounded-full flex items-center justify-center mx-auto border`}>
                {role === "student" ? (
                  <GraduationCap className="w-8 h-8" />
                ) : (
                  <CheckCircle2 className="w-8 h-8" />
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-slate-850 text-sm">
                  {role === "student" ? "Student Account Created" : "Account Created"}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Congratulations, <strong>{fullName}</strong>! Your account has been registered successfully.
                </p>
                {role === "student" && (
                  <p className="text-[11px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-100 py-1.5 px-3 rounded-lg max-w-sm mx-auto">
                    You have access to conference tracks, dynamic schedule, and authenticated conference registration.
                  </p>
                )}
                {role === "reviewer" && (
                  <p className="text-[11px] text-blue-600 font-medium bg-blue-50 border border-blue-100 py-1.5 px-3 rounded-lg max-w-sm mx-auto">
                    Topics Selected: {selectedDomains.join(", ")}
                  </p>
                )}
              </div>

              <div className="space-y-3.5 max-w-xs mx-auto">
                <button
                  onClick={handleAutoEnter}
                  className={`w-full py-2.5 ${role === "student" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"} text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-colors`}
                >
                  {role === "student" ? "Enter Conference Home" : "Enter Your Account"}
                </button>
                <button
                  onClick={() => onNavigate("login", role)}
                  className="w-full text-xs text-slate-500 hover:text-slate-850 font-medium py-1 cursor-pointer"
                >
                  Go to Login Page
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-5">
              
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-650 text-xs font-semibold rounded-lg flex items-start space-x-2 animate-pulse">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Role options */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Select Your Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("author")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col space-y-1 transition-all cursor-pointer ${
                      role === "author" 
                        ? "border-blue-600 bg-blue-50/40 text-blue-900 shadow-3xs" 
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <User className={`w-3.5 h-3.5 ${role === "author" ? "text-blue-600" : "text-slate-400"}`} />
                      <span className="text-xs font-bold">Author</span>
                    </div>
                    <span className="text-[9.5px] leading-tight text-slate-400">Submit papers &amp; buy passes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("reviewer")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col space-y-1 transition-all cursor-pointer ${
                      role === "reviewer" 
                        ? "border-blue-600 bg-blue-50/40 text-blue-900 shadow-3xs" 
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <BookOpen className={`w-3.5 h-3.5 ${role === "reviewer" ? "text-blue-600" : "text-slate-400"}`} />
                      <span className="text-xs font-bold">Reviewer</span>
                    </div>
                    <span className="text-[9.5px] leading-tight text-slate-400">Evaluate manuscripts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col space-y-1 transition-all cursor-pointer ${
                      role === "student" 
                        ? "border-emerald-600 bg-emerald-50/40 text-emerald-900 shadow-3xs" 
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <GraduationCap className={`w-3.5 h-3.5 ${role === "student" ? "text-emerald-600" : "text-slate-400"}`} />
                      <span className="text-xs font-bold">Student</span>
                    </div>
                    <span className="text-[9.5px] leading-tight text-slate-400">Sessions &amp; student pass</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Shrestha"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-500 transition-colors text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder={role === "student" ? "e.g. student@university.edu" : "e.g. ramesh@mail.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-500 transition-colors text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Institution */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {role === "student" ? "College or University Name" : "University or School Name"}
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={role === "student" ? "e.g. Tribhuvan University, Pulchowk Campus" : "e.g. Tribhuvan University, Nepal"}
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-500 transition-colors text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Student Major / Department */}
              {role === "student" && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Major / Department
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. B.Sc. Computer Science / AI"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-500 transition-colors text-slate-800 font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-emerald-600">
                    Student pass grants access to all conference keynote speeches, technical presentations, and includes a delegate certificate.
                  </p>
                </div>
              )}

              {/* Expert Checkboxes if Reviewer */}
              {role === "reviewer" && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-150">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Select Your Specialties
                  </label>
                  <p className="text-[10px] text-slate-400 leading-tight">These topics help match you with relevant papers.</p>
                  
                  <div className="grid grid-cols-2 gap-1.5 pt-2">
                    {availableDomains.map((domain) => (
                      <button
                        type="button"
                        key={domain}
                        onClick={() => handleDomainToggle(domain)}
                        className={`p-1.5 px-2 rounded-md text-[10px] text-left font-semibold border transition-colors flex items-center space-x-1 cursor-pointer ${
                          selectedDomains.includes(domain)
                            ? "bg-blue-600 border-transparent text-white"
                            : "bg-white border-slate-200 text-slate-650 hover:bg-slate-100"
                        }`}
                      >
                        <span className="truncate">{domain}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Minimum 4 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-500 transition-colors text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 ${role === "student" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"} text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex justify-center items-center`}
              >
                {loading ? "Creating account..." : role === "student" ? "Sign Up as Student Delegate" : "Sign Up"}
              </button>

              <div className="text-center space-y-1">
                <div>
                  <span className="text-xs text-slate-400">Already registered? </span>
                  <button
                    type="button"
                    onClick={() => onNavigate("login", role)}
                    className="font-bold text-blue-600 shadow-3xs cursor-pointer select-none text-xs hover:underline"
                  >
                    Log in here
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Academic Chairs &amp; Admins: Sign in directly with your administrator credentials on the login page.
                </p>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
