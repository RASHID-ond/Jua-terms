import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, User, Key, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Admin Setup | Jua Terms";
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/auth/setup-status");
      if (res.ok) {
        const data = await res.json();
        setSetupRequired(data.setupRequired);
        // If setup is not required, redirect immediately to login
        if (!data.setupRequired) {
          navigate("/admin");
        }
      } else {
        throw new Error();
      }
    } catch (e) {
      setError("Failed to verify system setup status.");
      setSetupRequired(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Setup failed");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/admin");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (setupRequired === null) {
    return (
      <div className="min-h-screen bg-[#0F2438] flex justify-center items-center font-sans text-[#F1EFE7]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#7ED957] border-[#7ED957]/20 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold tracking-wider uppercase">Loading setup state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F2438] flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#7ED957]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#8FC6E8]/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-[32px] p-8 md:p-10 shadow-2xl z-10 border border-white/10 flex flex-col relative">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#0F2438] flex items-center justify-center shadow-lg border-2 border-[#7ED957]">
            <Shield className="w-8 h-8 text-[#7ED957]" />
          </div>
          <h1 className="text-2xl font-display font-black text-[#0F2438] uppercase tracking-tight mt-4">
            SYSTEM INITIALIZATION
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">
            Create First Super Administrator
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-red-800 leading-normal">{error}</p>
          </div>
        )}

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 bg-emerald-100 p-2 rounded-full mb-3" />
            <h4 className="font-display font-bold text-emerald-950 text-lg">Setup Completed Successfully!</h4>
            <p className="text-emerald-800 text-sm mt-1 max-w-sm">
              Your administrative account has been created. Redirecting to sign in page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSetupSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#0F2438] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="System Administrator"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7ED957] focus:bg-white transition-all text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#0F2438] mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@juaterms.org"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7ED957] focus:bg-white transition-all text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#0F2438] mb-1.5">
                Access Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7ED957] focus:bg-white transition-all text-slate-900 font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] font-display font-black uppercase text-xs tracking-widest py-3.5 rounded-full shadow-lg hover:shadow-[#7ED957]/20 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {loading ? "INITIALIZING..." : "INITIALIZE SYSTEM"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
