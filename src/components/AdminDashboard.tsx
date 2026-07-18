import React, { useState, useEffect } from "react";
import {
  Shield,
  Key,
  Mail,
  User,
  Users,
  Calendar,
  Layers,
  MapPin,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Check,
  X,
  Edit2,
  Save,
  CheckCircle,
  Eye,
  Activity,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Download,
  AlertCircle,
  Heart
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import { fetchContent, saveContent as saveContentToSupabase } from "../lib/content";
import { signIn, signOut, getCurrentAdmin, logAudit, type AdminProfile } from "../lib/auth";
import { uploadImage, type UploadProgress } from "../lib/upload";
import { formatBytes } from "../lib/imageOptimize";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
}

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  read: boolean;
}

interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

interface AdminDashboardProps {
  onBackToSite: () => void;
  onContentUpdated: () => void;
}

export default function AdminDashboard({ onBackToSite, onContentUpdated }: AdminDashboardProps) {
  // Auth state
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Active module
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dynamic Content states from server
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [about, setAbout] = useState<any>(null);
  const [visionMission, setVisionMission] = useState<any>(null);
  const [focusAreas, setFocusAreas] = useState<any>(null);
  const [approach, setApproach] = useState<any>(null);
  const [events, setEvents] = useState<any>(null);
  const [highlights, setHighlights] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [footer, setFooter] = useState<any>(null);

  // Admin and Messages states
  const [messages, setMessages] = useState<Message[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // UI notifications
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal / Add item states
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "", role: "Editor" });

  // Upload state helper
  const [uploadLoading, setUploadLoading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  // Check for an existing Supabase session on load, and stay in sync with
  // sign-in/sign-out events (e.g. token refresh, or logging in from another tab).
  useEffect(() => {
    let active = true;

    getCurrentAdmin().then((admin) => {
      if (!active) return;
      setUser(admin);
      setAuthLoading(false);
      if (admin) fetchAdminData();
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, _session) => {
      getCurrentAdmin().then((admin) => {
        setUser(admin);
      });
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      await signIn(loginEmail, loginPassword);
      const admin = await getCurrentAdmin();
      if (!admin) {
        throw new Error("This account is not registered as an admin, or has been deactivated.");
      }
      setUser(admin);
      showToast("Signed in successfully as " + admin.name);
    } catch (err: any) {
      setLoginError(err.message || "Something went wrong");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setMessages([]);
    setAdmins([]);
    setAuditLogs([]);
  };

  const fetchAdminData = async () => {
    try {
      // 1. Fetch live site content
      const c = await fetchContent();
      setSiteSettings(c.siteSettings);
      setAbout(c.about);
      setVisionMission(c.visionMission);
      setFocusAreas(c.focusAreas);
      setApproach(c.approach);
      setEvents(c.events);
      setHighlights(c.highlights);
      setTeam(c.team || []);
      setPartners(c.partners || []);
      setFooter(c.footer);

      // 2. Fetch admin messages (blocked by RLS unless the caller is an admin)
      const { data: msgs, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (!msgError && msgs) {
        setMessages(msgs.map((m: any) => ({ ...m, date: m.created_at })));
      }

      // 3. Fetch audit logs
      const { data: logs, error: logError } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!logError && logs) {
        setAuditLogs(
          logs.map((l: any) => ({ id: l.id, user: l.admin_email, action: l.action, timestamp: l.created_at }))
        );
      }

      // 4. Fetch admin users (RLS only returns all rows to a Super Admin)
      const { data: adms, error: admError } = await supabase.from("admins").select("*");
      if (!admError && adms) {
        setAdmins(adms as AdminUser[]);
      }
    } catch (e) {
      console.error("Failed to load admin data", e);
    }
  };

  // Re-fetch when tabs shift
  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [activeTab]);

  // Handle live content saves
  const saveContent = async (updatedFields: any) => {
    setSaving(true);
    try {
      await saveContentToSupabase(updatedFields);
      if (user) await logAudit(user.email, `Updated content: ${Object.keys(updatedFields).join(", ")}`);

      showToast("Content changes saved successfully");
      onContentUpdated(); // Trigger refresh on public side
      fetchAdminData(); // Refresh local admin data
    } catch (e: any) {
      showToast(e.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // Image upload function
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(file.name);
    setUploadProgress({ stage: "validating", percent: 0, message: "Starting..." });

    uploadImage(file, (progress) => setUploadProgress(progress))
      .then((result) => {
        callback(result.url);
        if (result.optimized) {
          showToast(
            `Image optimized: ${formatBytes(result.originalSize)} \u2192 ${formatBytes(result.optimizedSize)} ` +
            `(${result.reductionPercent}% smaller)`
          );
        } else {
          showToast("Image uploaded successfully");
        }
      })
      .catch((err: any) => {
        showToast(err.message || "Upload failed", "error");
      })
      .finally(() => {
        setUploadLoading(null);
        // Leave the final "done" state on screen briefly so the size
        // reduction is actually visible before the progress card disappears.
        setTimeout(() => setUploadProgress(null), 2500);
      });
  };

  // Message Actions
  const markMessageRead = async (id: string, read: boolean) => {
    try {
      const { error } = await supabase.from("messages").update({ read }).eq("id", id);
      if (!error) {
        setMessages(messages.map((m) => (m.id === id ? { ...m, read } : m)));
        showToast("Message marked as " + (read ? "read" : "unread"));
      } else {
        throw error;
      }
    } catch (err) {
      showToast("Failed to update message status", "error");
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (!error) {
        setMessages(messages.filter((m) => m.id !== id));
        showToast("Message deleted successfully");
      } else {
        throw error;
      }
    } catch (err) {
      showToast("Failed to delete message", "error");
    }
  };

  // Create new Admin user (Super Admin Only) — routed through a Supabase Edge
  // Function since creating another user's account requires a privileged key
  // that must never be exposed in the browser.
  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Your session has expired. Please log in again.");

      const { data, error } = await supabase.functions.invoke("create-admin", {
        body: newAdmin,
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (error) throw new Error(error.message || "Failed to create user");
      if (data?.error) throw new Error(data.error);

      showToast("Admin account registered successfully");
      setShowAddAdminModal(false);
      setNewAdmin({ name: "", email: "", password: "", role: "Editor" });
      fetchAdminData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Deactivates an admin account (soft delete). Actually deleting the
  // underlying login requires the same privileged key as account creation —
  // deactivating is enough to immediately revoke their access.
  const handleDeleteAdmin = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate this admin account?")) return;
    try {
      const { error } = await supabase.from("admins").update({ active: false }).eq("id", id);
      if (!error) {
        showToast("Admin account deactivated");
        fetchAdminData();
      } else {
        throw error;
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Export messages to CSV
  const exportMessagesToCSV = () => {
    if (messages.length === 0) {
      showToast("No messages to export", "error");
      return;
    }
    const headers = ["ID", "Name", "Email", "Message", "Received Date", "Read Status"];
    const rows = messages.map((m) => [
      m.id,
      m.name,
      m.email,
      m.message.replace(/\n/g, " "),
      m.date,
      m.read ? "Read" : "Unread"
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Jua_Terms_Messages_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Inbox exported to CSV successfully");
  };

  // ----------------------------------------------------
  // RENDER LOADING STATE WHILE CHECKING FOR AN EXISTING SESSION
  // ----------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F2438] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7ED957] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER LOGIN SCREEN (IF NOT AUTHENTICATED)
  // ----------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F2438] flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
        {/* Decorative branding background rings */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#7ED957]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#8FC6E8]/10 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white rounded-[32px] p-8 md:p-10 shadow-2xl z-10 border border-white/10 flex flex-col relative">
          
          {/* Logo center stage */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#0F2438] flex items-center justify-center shadow-lg border-2 border-[#7ED957]">
              <Shield className="w-8 h-8 text-[#7ED957]" />
            </div>
            <h1 className="text-2xl font-display font-black text-[#0F2438] uppercase tracking-tight mt-4">
              JUA TERMS ADMIN
            </h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">
              Campaign Content Manager
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-red-800 leading-normal">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="juaterms@gmail.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7ED957] focus:bg-white transition-all text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#0F2438] mb-1.5">
                Account Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7ED957] focus:bg-white transition-all text-slate-900 font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] font-display font-black uppercase rounded-xl shadow-lg shadow-[#7ED957]/15 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm tracking-widest flex items-center justify-center cursor-pointer"
            >
              {loginLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-[#0F2438] border-t-transparent animate-spin" />
              ) : (
                "AUTHENTICATE & ENTER"
              )}
            </button>
          </form>

          {/* Quick Info Box for testing */}
          <div className="mt-8 bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="block text-[10px] font-black uppercase tracking-widest text-[#0F2438] mb-1">
              🔑 Development Credentials
            </span>
            <div className="text-[11px] text-gray-500 font-medium space-y-0.5">
              <p>Email: <strong className="text-[#0F2438]">juaterms@gmail.com</strong></p>
              <p>Password: <strong className="text-[#0F2438]">admin123</strong></p>
              <p className="mt-1.5 text-[10px] text-gray-400 italic">Both 'Super Admin' and 'Editor' profiles are fully initialized on this backend.</p>
            </div>
          </div>

          <button
            onClick={onBackToSite}
            className="mt-6 text-center text-xs font-bold text-gray-400 hover:text-[#0F2438] transition-colors cursor-pointer bg-transparent border-none py-1 block w-full"
          >
            &larr; Return to Public Marketing Site
          </button>
        </div>
      </div>
    );
  }

  // Loading settings
  if (!siteSettings) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#0F2438] border-t-[#7ED957] animate-spin mb-4" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Synchronizing Admin Portal...
        </span>
      </div>
    );
  }

  const unreadMessagesCount = messages.filter((m) => !m.read).length;

  // ----------------------------------------------------
  // MAIN ADMIN INTERFACE (SIDEBAR + MODULE CONTENT)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-800 font-sans antialiased">
      
      {/* Toast Notifications */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-in-right ${
            notification.type === "success"
              ? "bg-[#0F2438] text-white border-l-4 border-[#7ED957]"
              : "bg-red-950 text-white border-l-4 border-red-500"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-[#7ED957]" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <span className="text-xs font-bold">{notification.text}</span>
        </div>
      )}

      {/* Image Upload Progress Card */}
      {uploadProgress && (
        <div className="fixed bottom-6 right-6 z-50 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 animate-slide-in-right">
          <div className="flex items-center gap-2 mb-2">
            {uploadProgress.stage === "done" ? (
              <CheckCircle className="w-4 h-4 text-[#7ED957] shrink-0" />
            ) : (
              <div className="w-4 h-4 border-2 border-[#7ED957] border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            <span className="text-xs font-black text-[#0F2438] uppercase tracking-wide truncate">
              {uploadProgress.message}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7ED957] transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SIDEBAR NAVIGATION */}
      {/* ---------------------------------------------------- */}
      <aside className="w-full md:w-64 bg-[#0F2438] text-[#F1EFE7] flex flex-col flex-shrink-0 border-r border-white/5 shadow-xl md:min-h-screen">
        
        {/* Brand Lockup */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#7ED957] flex items-center justify-center text-[#0F2438] font-black text-xs font-display">
              J
            </div>
            <div>
              <span className="block font-display font-black text-white uppercase tracking-tight text-sm leading-tight">
                JUA TERMS
              </span>
              <span className="block text-[9px] text-[#7ED957] font-black uppercase tracking-widest mt-0.5">
                Admin Console
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold text-gray-300">
            v1.0
          </span>
        </div>

        {/* User Badge */}
        <div className="px-6 py-4 border-b border-white/5 bg-black/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white border border-white/10">
            <User className="w-5 h-5 text-gray-300" />
          </div>
          <div className="overflow-hidden">
            <span className="block text-xs font-bold text-white truncate leading-tight">
              {user.name}
            </span>
            <span className="block text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
              {user.role}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: Layers },
            { id: "about", label: "About, Vision, Mission", icon: FileText },
            { id: "focus-areas", label: "Focus Areas", icon: TrendingUp },
            { id: "approach", label: "Our Approach", icon: Activity },
            { id: "events", label: "Events Timeline", icon: Calendar },
            { id: "highlights", label: "Campaign Highlights", icon: ImageIcon },
            { id: "team", label: "Team Members", icon: Users },
            { id: "partners", label: "Sponsors & Partners", icon: ExternalLink },
            { id: "footer", label: "Thank You Footer", icon: Heart },
            { id: "messages", label: "Contact Inbox", icon: MessageSquare, badge: unreadMessagesCount },
            { id: "settings", label: "Site & SEO Settings", icon: Settings },
            ...(user.role === "Super Admin" ? [{ id: "admins", label: "Admin Accounts", icon: Shield }] : [])
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#7ED957] text-[#0F2438] shadow-md shadow-[#7ED957]/10"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#0F2438]" : "text-gray-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                    isActive ? "bg-[#0F2438] text-[#7ED957]" : "bg-[#7ED957] text-[#0F2438]"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-black/10 space-y-2">
          <button
            onClick={onBackToSite}
            className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/5"
          >
            <span>View Public Site</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* MAIN MODULE CONTENT WINDOW */}
      {/* ---------------------------------------------------- */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
        
        {/* Header toolbar */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0F2438]">
              Jua Terms Back Office
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-black text-slate-900 uppercase mt-0.5">
              {activeTab.replace("-", " ")}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium font-mono">
              Role: <strong className="text-[#0F2438] font-bold">{user.role}</strong>
            </span>
            {saving && (
              <div className="flex items-center gap-2 text-[#0F2438] bg-[#7ED957]/10 border border-[#7ED957]/20 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-[#7ED957] animate-ping" />
                <span>Synchronizing changes...</span>
              </div>
            )}
          </div>
        </header>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: DASHBOARD STATS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Quick Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Total Team</span>
                  <span className="block text-3xl font-display font-black text-slate-900 mt-1">{team.length}</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#0F2438]/5 flex items-center justify-center text-[#0F2438]">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Total Events</span>
                  <span className="block text-3xl font-display font-black text-slate-900 mt-1">{events?.items?.length || 0}</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#0F2438]/5 flex items-center justify-center text-[#0F2438]">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Partners</span>
                  <span className="block text-3xl font-display font-black text-slate-900 mt-1">{partners.length}</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#0F2438]/5 flex items-center justify-center text-[#0F2438]">
                  <ExternalLink className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#0F2438] text-white rounded-3xl p-6 shadow-md flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-[#7ED957]/10" />
                <div className="z-10">
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#7ED957]">Unread Inbox</span>
                  <span className="block text-3xl font-display font-black text-white mt-1">{unreadMessagesCount}</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#7ED957]/25 flex items-center justify-center text-[#7ED957] z-10">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* Campaign Quick Actions & Audit Trail logs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Info Block */}
              <div className="lg:col-span-6 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-display font-black text-slate-900 uppercase">Welcome, {user.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Ready to manage the campaign content? Click any module on the sidebar to get started. Changes will immediately reflect live on the website.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab("about")}
                    className="p-4 bg-slate-50 hover:bg-[#7ED957]/10 rounded-2xl text-left border border-slate-100 hover:border-[#7ED957]/20 transition-all flex flex-col justify-between h-28 group"
                  >
                    <FileText className="w-5 h-5 text-slate-500 group-hover:text-[#0F2438]" />
                    <span className="text-xs font-bold uppercase text-slate-800">Edit Main Bio</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("messages")}
                    className="p-4 bg-slate-50 hover:bg-[#7ED957]/10 rounded-2xl text-left border border-slate-100 hover:border-[#7ED957]/20 transition-all flex flex-col justify-between h-28 group"
                  >
                    <MessageSquare className="w-5 h-5 text-slate-500 group-hover:text-[#0F2438]" />
                    <span className="text-xs font-bold uppercase text-slate-800">Review Inbox</span>
                  </button>
                </div>
              </div>

              {/* Live Backend Audit trail (Security log) */}
              <div className="lg:col-span-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col h-[340px]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4.5 h-4.5 text-[#0F2438]" />
                    <h3 className="text-base font-display font-black text-slate-900 uppercase">Security Audit Log</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Backend actions</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                  {auditLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10 text-center">
                      <Activity className="w-8 h-8 mb-2 stroke-[1.5]" />
                      <span className="text-xs font-semibold">No administrator logs yet.</span>
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className="text-xs border-b border-slate-50 pb-2 flex justify-between gap-3 font-medium">
                        <div>
                          <p className="text-slate-800"><span className="font-bold text-[#0F2438]">{log.user}</span>: {log.action}</p>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 self-start">OK</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: ABOUT / VISION / MISSION */}
        {/* ---------------------------------------------------- */}
        {activeTab === "about" && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* About bio editor */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-display font-black text-[#0F2438] uppercase">Main Campaign Paragraph</h3>
                <p className="text-xs text-slate-400">Edit the primary introductory bio displayed in Section B.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Bio Text</label>
                  <textarea
                    rows={7}
                    value={about?.body || ""}
                    onChange={(e) => setAbout({ ...about, body: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#7ED957] transition-all text-slate-800 font-medium"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Portrait Image</label>
                  <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
                    {about?.portraitImage ? (
                      <img src={about.portraitImage} alt="About portrait" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[9px] font-black uppercase tracking-wider cursor-pointer transition-opacity">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (url) => setAbout({ ...about, portraitImage: url }))}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => saveContent({ about })}
                  className="px-6 py-3 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Bio Block</span>
                </button>
              </div>
            </div>

            {/* Vision / Mission items editor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Vision editor */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-display font-black text-[#0F2438] uppercase">Vision Editor</h3>
                    <p className="text-xs text-slate-400">Edit core aspiration statement in Section C.</p>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Vision Title</label>
                    <input
                      type="text"
                      value={visionMission?.vision?.title || ""}
                      onChange={(e) => setVisionMission({
                        ...visionMission,
                        vision: { ...visionMission.vision, title: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] transition-all text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Vision statement</label>
                    <textarea
                      rows={4}
                      value={visionMission?.vision?.text || ""}
                      onChange={(e) => setVisionMission({
                        ...visionMission,
                        vision: { ...visionMission.vision, text: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#7ED957] transition-all text-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Vision Photos</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[0, 1].map((idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden aspect-square bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
                          {visionMission?.images?.[idx]?.url ? (
                            <img src={visionMission.images[idx].url} alt={visionMission.images[idx].alt || `Vision ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-300 stroke-[1.5]" />
                          )}
                          <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[8px] font-black uppercase tracking-wider cursor-pointer transition-opacity">
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, (url) => {
                                const newImages = [...(visionMission.images || [{}, {}])];
                                newImages[idx] = { ...newImages[idx], url };
                                setVisionMission({ ...visionMission, images: newImages });
                              })}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-50 mt-6">
                  <button
                    onClick={() => saveContent({ visionMission })}
                    className="px-5 py-2.5 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Vision</span>
                  </button>
                </div>
              </div>

              {/* Mission bullets editor */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-display font-black text-[#0F2438] uppercase">Mission Bullets Editor</h3>
                    <p className="text-xs text-slate-400">Edit bullet lines for the campaign roadmap in Section C.</p>
                  </div>

                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                    {visionMission?.mission?.items?.map((item: string, index: number) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="text-xs font-bold text-slate-400 w-5">{index + 1}.</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newItems = [...visionMission.mission.items];
                            newItems[index] = e.target.value;
                            setVisionMission({
                              ...visionMission,
                              mission: { ...visionMission.mission, items: newItems }
                            });
                          }}
                          className="flex-1 bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#7ED957] transition-all text-slate-800 font-medium"
                        />
                        <button
                          onClick={() => {
                            const newItems = visionMission.mission.items.filter((_: any, i: number) => i !== index);
                            setVisionMission({
                              ...visionMission,
                              mission: { ...visionMission.mission, items: newItems }
                            });
                          }}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg hover:text-red-700 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const newItems = [...(visionMission?.mission?.items || []), "New mission objective"];
                      setVisionMission({
                        ...visionMission,
                        mission: { ...visionMission.mission, items: newItems }
                      });
                    }}
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#7ED957] hover:text-[#6ec248] transition-colors bg-slate-50 hover:bg-slate-100 border border-slate-100 px-4 py-2 rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Bullet Line</span>
                  </button>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-50 mt-6">
                  <button
                    onClick={() => saveContent({ visionMission })}
                    className="px-5 py-2.5 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Mission</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: FOCUS AREAS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "focus-areas" && (
          <div className="space-y-8 animate-fade-in-up">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Image Editor */}
              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-display font-black text-[#0F2438] uppercase">Section Image</h3>
                    <p className="text-xs text-slate-400">Edit the prominent image displayed on the left of Section D.</p>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
                    {focusAreas?.image ? (
                      <img src={focusAreas.image} alt="Focus cover" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                    )}

                    {/* Image overlay upload bar */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-4 flex flex-col items-center gap-2">
                      <span className="text-[9px] text-gray-200 truncate max-w-full font-semibold">
                        {uploadLoading === "focus-image" ? "Processing image..." : "Update Focus Image"}
                      </span>
                      <label className="px-4 py-2 bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors shadow flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (url) => setFocusAreas({ ...focusAreas, image: url }))}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Image URL fallback</label>
                    <input
                      type="text"
                      value={focusAreas?.image || ""}
                      onChange={(e) => setFocusAreas({ ...focusAreas, image: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#7ED957]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-50 mt-6">
                  <button
                    onClick={() => saveContent({ focusAreas })}
                    className="px-5 py-2.5 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Image</span>
                  </button>
                </div>
              </div>

              {/* Items Timeline Editor */}
              <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-display font-black text-[#0F2438] uppercase">Focus Timeline Items</h3>
                    <p className="text-xs text-slate-400">Edit the sequential timeline items displayed on the right of Section D.</p>
                  </div>

                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                    {focusAreas?.items?.map((item: any, index: number) => (
                      <div key={item.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 items-start relative">
                        <div className="w-6 h-6 rounded-full bg-[#0F2438] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-1">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Item Description</label>
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...focusAreas.items];
                              newItems[index] = { ...item, description: e.target.value };
                              setFocusAreas({ ...focusAreas, items: newItems });
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#7ED957]"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newItems = focusAreas.items.filter((m: any) => m.id !== item.id);
                            setFocusAreas({ ...focusAreas, items: newItems });
                          }}
                          className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const newItems = [
                        ...(focusAreas?.items || []),
                        { id: Date.now(), description: "New focus area target objective" }
                      ];
                      setFocusAreas({ ...focusAreas, items: newItems });
                    }}
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#7ED957] hover:text-[#6ec248] transition-colors bg-slate-50 hover:bg-slate-100 border border-slate-100 px-4 py-2.5 rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Focus Target</span>
                  </button>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-50 mt-6">
                  <button
                    onClick={() => saveContent({ focusAreas })}
                    className="px-5 py-2.5 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Focus Content</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: APPROACH */}
        {/* ---------------------------------------------------- */}
        {activeTab === "approach" && (
          <div className="space-y-8 animate-fade-in-up">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Image Editor */}
              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-display font-black text-[#0F2438] uppercase">Section Image</h3>
                    <p className="text-xs text-slate-400">Edit the prominent approach photo displayed on the right of Section E.</p>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
                    {approach?.image ? (
                      <img src={approach.image} alt="Approach cover" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                    )}

                    {/* Image upload bar */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-4 flex flex-col items-center gap-2">
                      <span className="text-[9px] text-gray-200 truncate max-w-full font-semibold">
                        {uploadLoading === "approach-image" ? "Processing image..." : "Update Approach Image"}
                      </span>
                      <label className="px-4 py-2 bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors shadow flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (url) => setApproach({ ...approach, image: url }))}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Image URL fallback</label>
                    <input
                      type="text"
                      value={approach?.image || ""}
                      onChange={(e) => setApproach({ ...approach, image: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#7ED957]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-50 mt-6">
                  <button
                    onClick={() => saveContent({ approach })}
                    className="px-5 py-2.5 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Image</span>
                  </button>
                </div>
              </div>

              {/* Approach list timeline editor */}
              <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-display font-black text-[#0F2438] uppercase">Approach Milestones</h3>
                    <p className="text-xs text-slate-400">Edit the approach values and methods displayed on the left of Section E.</p>
                  </div>

                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                    {approach?.items?.map((item: any, index: number) => (
                      <div key={item.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 items-start relative">
                        <div className="w-6 h-6 rounded-full bg-[#0F2438] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-1">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...approach.items];
                              newItems[index] = { ...item, description: e.target.value };
                              setApproach({ ...approach, items: newItems });
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#7ED957]"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newItems = approach.items.filter((m: any) => m.id !== item.id);
                            setApproach({ ...approach, items: newItems });
                          }}
                          className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const newItems = [
                        ...(approach?.items || []),
                        { id: Date.now(), description: "New localized translation format and strategy" }
                      ];
                      setApproach({ ...approach, items: newItems });
                    }}
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#7ED957] hover:text-[#6ec248] transition-colors bg-slate-50 hover:bg-slate-100 border border-slate-100 px-4 py-2.5 rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Approach Pillar</span>
                  </button>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-50 mt-6">
                  <button
                    onClick={() => saveContent({ approach })}
                    className="px-5 py-2.5 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Approach Content</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: EVENTS TIMELINE */}
        {/* ---------------------------------------------------- */}
        {activeTab === "events" && (
          <div className="space-y-8 animate-fade-in-up">
            
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-display font-black text-[#0F2438] uppercase">Events & Dialogues Timeline</h3>
                  <p className="text-xs text-slate-400">Edit list of public dialogues and events for Section F.</p>
                </div>
                
                <button
                  onClick={() => {
                    const newItems = [
                      ...(events?.items || []),
                      {
                        id: Date.now(),
                        title: "New Dialogue Workshop",
                        description: "Deep dive roundtable dialogue with regional students and legal bodies."
                      }
                    ];
                    setEvents({ ...events, items: newItems });
                  }}
                  className="px-4 py-2.5 bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Event</span>
                </button>
              </div>

              <div className="space-y-5 max-h-[450px] overflow-y-auto pr-2">
                {events?.items?.map((evt: any, index: number) => (
                  <div key={evt.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 relative space-y-3">
                    <span className="absolute top-4 right-14 text-xs font-mono font-bold text-slate-400">Event #{index + 1}</span>
                    <button
                      onClick={() => {
                        const newItems = events.items.filter((item: any) => item.id !== evt.id);
                        setEvents({ ...events, items: newItems });
                      }}
                      className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="max-w-xl">
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Event Title / Name</label>
                      <input
                        type="text"
                        value={evt.title || ""}
                        onChange={(e) => {
                          const newItems = [...events.items];
                          newItems[index] = { ...evt, title: e.target.value };
                          setEvents({ ...events, items: newItems });
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-[#0F2438]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description Context</label>
                      <textarea
                        rows={2}
                        value={evt.description}
                        onChange={(e) => {
                          const newItems = [...events.items];
                          newItems[index] = { ...evt, description: e.target.value };
                          setEvents({ ...events, items: newItems });
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#7ED957]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => saveContent({ events })}
                  className="px-6 py-3 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Events Timeline</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: CAMPAIGN HIGHLIGHTS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "highlights" && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Quote editor */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-display font-black text-[#0F2438] uppercase">Highlights Main Quote</h3>
                <p className="text-xs text-slate-400">Edit the italicized bubble-quote text highlighted in Section G.</p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Quote Text</label>
                <input
                  type="text"
                  value={highlights?.quote || ""}
                  onChange={(e) => setHighlights({ ...highlights, quote: e.target.value })}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] text-slate-900 font-semibold italic"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => saveContent({ highlights })}
                  className="px-5 py-2.5 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Quote</span>
                </button>
              </div>
            </div>

            {/* Photo Gallery Grid list */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-display font-black text-[#0F2438] uppercase">Highlights Image Gallery</h3>
                  <p className="text-xs text-slate-400">Manage interactive collage photos, categories, dates, and full impact details.</p>
                </div>

                <button
                  onClick={() => {
                    const newImages = [
                      ...(highlights?.images || []),
                      {
                        url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600&h=450",
                        alt: "New highlight image",
                        title: "New Campaign Milestone Workshop",
                        date: "June 2024",
                        location: "Nairobi Chapter",
                        category: "Milestones",
                        description: "Advocacy sessions with young professionals to review digital rights laws in East Africa.",
                        impact: "Successfully trained 120 key leaders on terms simplicity."
                      }
                    ];
                    setHighlights({ ...highlights, images: newImages });
                  }}
                  className="px-4 py-2.5 bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Gallery Card</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-2">
                {highlights?.images?.map((img: any, index: number) => (
                  <div key={index} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between relative space-y-4">
                    <button
                      onClick={() => {
                        const newImages = highlights.images.filter((_: any, idx: number) => idx !== index);
                        setHighlights({ ...highlights, images: newImages });
                      }}
                      className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      title="Remove image card"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                    <div className="flex gap-4">
                      {/* Image Preview / Upload */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-200 relative border border-slate-300 flex-shrink-0 flex items-center justify-center">
                        {img.url ? (
                          <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-400" />
                        )}
                        <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[9px] font-black uppercase tracking-wider cursor-pointer transition-opacity">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, (url) => {
                              const newImages = [...highlights.images];
                              newImages[index].url = url;
                              setHighlights({ ...highlights, images: newImages });
                            })}
                          />
                        </label>
                      </div>

                      <div className="space-y-2 flex-1">
                        <div>
                          <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Title</label>
                          <input
                            type="text"
                            value={img.title || ""}
                            onChange={(e) => {
                              const newImages = [...highlights.images];
                              newImages[index].title = e.target.value;
                              setHighlights({ ...highlights, images: newImages });
                            }}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0F2438]"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Category</label>
                          <select
                            value={img.category || "University Dialogues"}
                            onChange={(e) => {
                              const newImages = [...highlights.images];
                              newImages[index].category = e.target.value;
                              setHighlights({ ...highlights, images: newImages });
                            }}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-[11px] text-[#0F2438] font-bold"
                          >
                            <option value="University Dialogues">University Dialogues</option>
                            <option value="Stakeholder Forums">Stakeholder Forums</option>
                            <option value="Milestones">Milestones</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Date</label>
                        <input
                          type="text"
                          value={img.date || ""}
                          onChange={(e) => {
                            const newImages = [...highlights.images];
                            newImages[index].date = e.target.value;
                            setHighlights({ ...highlights, images: newImages });
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-700 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Location</label>
                        <input
                          type="text"
                          value={img.location || ""}
                          onChange={(e) => {
                            const newImages = [...highlights.images];
                            newImages[index].location = e.target.value;
                            setHighlights({ ...highlights, images: newImages });
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-700 font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Full Narrative Description</label>
                      <textarea
                        rows={2}
                        value={img.description || ""}
                        onChange={(e) => {
                          const newImages = [...highlights.images];
                          newImages[index].description = e.target.value;
                          setHighlights({ ...highlights, images: newImages });
                        }}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-[11px] text-slate-600 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Impact Spotlight text</label>
                      <input
                        type="text"
                        value={img.impact || ""}
                        onChange={(e) => {
                          const newImages = [...highlights.images];
                          newImages[index].impact = e.target.value;
                          setHighlights({ ...highlights, images: newImages });
                        }}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => saveContent({ highlights })}
                  className="px-6 py-3 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Gallery Changes</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 7: TEAM MEMBERS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "team" && (
          <div className="space-y-8 animate-fade-in-up">
            
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-display font-black text-[#0F2438] uppercase">Active Campaign coordinators</h3>
                  <p className="text-xs text-slate-400">Manage campaign coordinators, role descriptions, active states, and cut-out profiles.</p>
                </div>

                <button
                  onClick={() => {
                    const newTeam = [
                      ...team,
                      {
                        name: "New Coordinator",
                        role: "Advocacy Facilitator",
                        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=500",
                        active: true
                      }
                    ];
                    setTeam(newTeam);
                  }}
                  className="px-4 py-2.5 bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Coordinator</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto pr-2">
                {team.map((member, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between relative space-y-4">
                    <button
                      onClick={() => {
                        const newTeam = team.filter((_, i) => i !== index);
                        setTeam(newTeam);
                      }}
                      className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      title="Delete profile"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                    <div className="flex gap-4">
                      {/* Photo upload container */}
                      <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-200 relative border border-slate-300 flex-shrink-0 flex items-center justify-center">
                        {member.image ? (
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-400" />
                        )}
                        <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[9px] font-black uppercase tracking-wider cursor-pointer transition-opacity">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, (url) => {
                              const newTeam = [...team];
                              newTeam[index].image = url;
                              setTeam(newTeam);
                            })}
                          />
                        </label>
                      </div>

                      <div className="space-y-2 flex-1">
                        <div>
                          <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Name</label>
                          <input
                            type="text"
                            value={member.name || ""}
                            onChange={(e) => {
                              const newTeam = [...team];
                              newTeam[index].name = e.target.value;
                              setTeam(newTeam);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0F2438]"
                          />
                        </div>

                        <div>
                          <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Role Description</label>
                          <input
                            type="text"
                            value={member.role || ""}
                            onChange={(e) => {
                              const newTeam = [...team];
                              newTeam[index].role = e.target.value;
                              setTeam(newTeam);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-bold text-slate-400">Display Settings:</span>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          {member.active !== false ? "Active Status" : "Inactive Past Profile"}
                        </span>
                        <input
                          type="checkbox"
                          checked={member.active !== false}
                          onChange={(e) => {
                            const newTeam = [...team];
                            newTeam[index].active = e.target.checked;
                            setTeam(newTeam);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-[#7ED957] focus:ring-[#7ED957]"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => saveContent({ team })}
                  className="px-6 py-3 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Team Listings</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 8: SPONSORS & PARTNERS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "partners" && (
          <div className="space-y-8 animate-fade-in-up">
            
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-display font-black text-[#0F2438] uppercase">Sponsor Logo Grid</h3>
                  <p className="text-xs text-slate-400">Manage campaign partners, academic institutions, and support organizations for Section I.</p>
                </div>

                <button
                  onClick={() => {
                    const newPartners = [...partners, { name: "New Partner Org", logoPlaceholder: "NEW" }];
                    setPartners(newPartners);
                  }}
                  className="px-4 py-2.5 bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Partner Logomark</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[450px] overflow-y-auto pr-2">
                {partners.map((pt, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col justify-between items-center text-center relative h-52 group hover:shadow-inner hover:bg-slate-100/60 transition-all">
                    
                    <button
                      type="button"
                      onClick={() => {
                        const newPartners = partners.filter((_, i) => i !== index);
                        setPartners(newPartners);
                      }}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200 z-10"
                      title="Remove partner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center relative overflow-hidden group/logo mt-3 shrink-0">
                      {pt.image ? (
                        <img src={pt.image} alt={pt.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="font-display font-black tracking-tight text-slate-800 text-xs">{pt.logoPlaceholder || "AIK"}</span>
                      )}
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/logo:opacity-100 flex flex-col items-center justify-center text-white text-[8px] font-black uppercase tracking-wider cursor-pointer transition-opacity">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (url) => {
                            const newPartners = [...partners];
                            newPartners[index].image = url;
                            setPartners(newPartners);
                            showToast("Partner logo uploaded. Click 'Save' to apply.");
                          })}
                        />
                      </label>
                    </div>

                    <div className="w-full space-y-1">
                      <input
                        type="text"
                        value={pt.name}
                        onChange={(e) => {
                          const newPartners = [...partners];
                          newPartners[index].name = e.target.value;
                          setPartners(newPartners);
                        }}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-[#0F2438] text-center"
                        placeholder="Partner Name"
                      />
                      <input
                        type="text"
                        value={pt.logoPlaceholder}
                        onChange={(e) => {
                          const newPartners = [...partners];
                          newPartners[index].logoPlaceholder = e.target.value;
                          setPartners(newPartners);
                        }}
                        className="w-1/2 mx-auto bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest"
                        placeholder="Initials"
                        maxLength={8}
                      />
                      {pt.image && (
                        <button
                          type="button"
                          onClick={() => {
                            const newPartners = [...partners];
                            newPartners[index].image = "";
                            setPartners(newPartners);
                            showToast("Partner logo image cleared.");
                          }}
                          className="text-[8px] font-black uppercase tracking-wider text-red-500 hover:text-red-600 block mx-auto py-0.5 transition-colors cursor-pointer bg-transparent border-none"
                        >
                          Clear Image
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => saveContent({ partners })}
                  className="px-6 py-3 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Partners</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: THANK YOU FOOTER */}
        {/* ---------------------------------------------------- */}
        {activeTab === "footer" && (
          <div className="space-y-8 animate-fade-in-up">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Group photo editor */}
              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-display font-black text-[#0F2438] uppercase">Group Photo</h3>
                    <p className="text-xs text-slate-400">Edit the closing photo shown in the Thank You footer section.</p>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
                    {footer?.groupPhoto ? (
                      <img src={footer.groupPhoto} alt="Footer group" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-4 flex flex-col items-center gap-2">
                      <span className="text-[9px] text-gray-200 truncate max-w-full font-semibold">
                        {uploadLoading === "footer-image" ? "Processing image..." : "Update Group Photo"}
                      </span>
                      <label className="px-4 py-2 bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors shadow flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (url) => setFooter({ ...footer, groupPhoto: url }))}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Image URL fallback</label>
                    <input
                      type="text"
                      value={footer?.groupPhoto || ""}
                      onChange={(e) => setFooter({ ...footer, groupPhoto: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#7ED957]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-50 mt-6">
                  <button
                    onClick={() => saveContent({ footer })}
                    className="px-5 py-2.5 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Photo</span>
                  </button>
                </div>
              </div>

              {/* Heading + text editor */}
              <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-display font-black text-[#0F2438] uppercase">Thank You Message</h3>
                    <p className="text-xs text-slate-400">Edit the closing heading and message shown at the bottom of the homepage.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Heading</label>
                    <input
                      type="text"
                      value={footer?.heading || ""}
                      onChange={(e) => setFooter({ ...footer, heading: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Message</label>
                    <textarea
                      rows={6}
                      value={footer?.text || ""}
                      onChange={(e) => setFooter({ ...footer, text: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#7ED957] transition-all text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-50 mt-6">
                  <button
                    onClick={() => saveContent({ footer })}
                    className="px-5 py-2.5 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Message</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 9: CONTACT INBOX */}
        {/* ---------------------------------------------------- */}
        {activeTab === "messages" && (
          <div className="space-y-8 animate-fade-in-up">
            
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col h-[520px]">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-display font-black text-[#0F2438] uppercase">Form Message Inbox</h3>
                  <p className="text-xs text-slate-400">View real form submissions from the contact form in Section K.</p>
                </div>

                <div className="flex gap-2 self-start">
                  <button
                    onClick={exportMessagesToCSV}
                    className="px-3 py-2 bg-[#0F2438]/5 hover:bg-[#0F2438]/10 text-[#0F2438] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-150"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export to CSV</span>
                  </button>
                </div>
              </div>

              {/* Inbox list */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-16 text-center">
                    <MessageSquare className="w-12 h-12 mb-3 stroke-[1.2]" />
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Your Campaign Inbox is Empty</span>
                    <p className="text-xs text-slate-300 max-w-sm mt-1">When users fill in the contact form, their queries will appear here in real time.</p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`border rounded-2xl p-5 relative space-y-3 transition-all ${
                        m.read
                          ? "bg-white border-slate-150"
                          : "bg-slate-50 border-l-4 border-l-[#7ED957] border-slate-150 shadow-sm"
                      }`}
                    >
                      <span className="absolute top-4 right-14 text-[9px] font-mono font-bold text-slate-400">
                        {new Date(m.date).toLocaleString()}
                      </span>
                      
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => deleteMessage(m.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200"
                          title="Delete message"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                        <span className="text-sm font-bold text-[#0F2438]">{m.name}</span>
                        <a href={`mailto:${m.email}`} className="text-xs text-[#7ED957] font-semibold hover:underline">
                          {m.email}
                        </a>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-line bg-white/50 p-3 rounded-xl border border-slate-100">
                        {m.message}
                      </p>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => markMessageRead(m.id, !m.read)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{m.read ? "Mark Unread" : "Mark Read"}</span>
                        </button>
                        
                        <a
                          href={`mailto:${m.email}?subject=RE: Jua Terms Inquiry`}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 bg-[#0F2438] text-white hover:bg-[#7ED957] hover:text-[#0F2438]"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Reply via Email</span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 10: SITE & SEO SETTINGS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "settings" && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Homepage Hero details */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-display font-black text-[#0F2438] uppercase">Homepage Content</h3>
                <p className="text-xs text-slate-400">Edit every editable text block on the homepage, from the top hero down to the highlights teaser.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Hero Title</label>
                  <input
                    type="text"
                    placeholder="JUA TERMS PROFILE"
                    value={siteSettings?.heroTitle || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Hero Subtitle</label>
                  <input
                    type="text"
                    placeholder="Simplify. Clarify. Champion Informed Consent."
                    value={siteSettings?.heroSubtitle || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Tagline Quote</label>
                  <input
                    type="text"
                    placeholder="Consent Starts with Clarity."
                    value={siteSettings?.taglineQuote || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, taglineQuote: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] text-slate-800 font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Shown italicized just below the hero, quotation marks added automatically.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Group Photo Badge Text</label>
                  <input
                    type="text"
                    placeholder="Empowering Kenyan Citizens Since 2024"
                    value={siteSettings?.badgeText || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, badgeText: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Welcome Section Heading</label>
                  <input
                    type="text"
                    placeholder="Welcome to Jua Terms"
                    value={siteSettings?.welcomeHeading || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, welcomeHeading: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Highlights Section Eyebrow Label</label>
                  <input
                    type="text"
                    placeholder="Our Journey & Milestones"
                    value={siteSettings?.highlightsEyebrow || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, highlightsEyebrow: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] text-slate-800 font-semibold"
                  />
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#0F2438] mb-2.5">
                    Circular Group Photo
                  </label>
                  <p className="text-xs text-slate-400 mb-4">
                    The photo shown in the circular frame just below the tagline quote.
                    This same photo also appears in the Thank You footer at the bottom of the site.
                  </p>

                  <div className="flex items-center gap-5">
                    <div className="w-24 h-24 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                      {footer?.groupPhoto ? (
                        <img
                          src={footer.groupPhoto}
                          alt="Group photo preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="inline-flex items-center justify-center px-4 py-2 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer shadow-sm border border-transparent">
                        <span>Choose Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (url) => {
                            setFooter({ ...footer, groupPhoto: url });
                            showToast("Group photo queued. Click 'Save' to apply changes.");
                          })}
                        />
                      </label>
                      {footer?.groupPhoto && (
                        <button
                          type="button"
                          onClick={() => {
                            setFooter({ ...footer, groupPhoto: "" });
                            showToast("Group photo cleared. Click 'Save' to apply changes.");
                          }}
                          className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:text-red-600 text-left transition-colors cursor-pointer bg-transparent border-none py-1 block"
                        >
                          Clear photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => saveContent({ siteSettings, footer })}
                  className="px-6 py-3 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Homepage Content</span>
                </button>
              </div>
            </div>

            {/* SEO and Site details */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-display font-black text-[#0F2438] uppercase">SEO Meta details</h3>
                <p className="text-xs text-slate-400">Configure public browser page headers and search engine crawlers optimization settings.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">SEO Meta Title</label>
                  <input
                    type="text"
                    value={siteSettings?.seoTitle || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, seoTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">SEO Meta Description</label>
                  <input
                    type="text"
                    value={siteSettings?.seoDescription || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, seoDescription: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] text-slate-800 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Public campaign contacts block */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-display font-black text-[#0F2438] uppercase">Campaign Contact Info</h3>
                <p className="text-xs text-slate-400">Configure address coordinates, telephone details, contact emails, and social badges.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Address Coordinate</label>
                  <input
                    type="text"
                    value={siteSettings?.address || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Contact Hotline</label>
                  <input
                    type="text"
                    value={siteSettings?.phone || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Contact Email</label>
                  <input
                    type="text"
                    value={siteSettings?.email || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Social Media @Handle</label>
                  <input
                    type="text"
                    value={siteSettings?.social || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, social: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] text-slate-800 font-semibold"
                  />
                </div>

                <div className="sm:col-span-2 border-t border-slate-100 pt-6">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#0F2438] mb-2.5">
                    Brand Logo Image (Optional)
                  </label>
                  <p className="text-xs text-slate-400 mb-4">
                    Upload a custom logo image to override the default magnifying glass icon. Transparent PNGs or clean SVGs work best.
                  </p>
                  
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                      {siteSettings?.logoImage ? (
                        <img 
                          src={siteSettings.logoImage} 
                          alt="Custom Logo Preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase text-center px-2">No Image</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="inline-flex items-center justify-center px-4 py-2 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer shadow-sm border border-transparent">
                        <span>Upload Logo File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (url) => {
                            setSiteSettings({ ...siteSettings, logoImage: url });
                            showToast("Logo image queued. Click 'Save' to apply changes.");
                          })}
                        />
                      </label>
                      {siteSettings?.logoImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setSiteSettings({ ...siteSettings, logoImage: "" });
                            showToast("Logo cleared. Click 'Save' to apply changes.");
                          }}
                          className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:text-red-600 text-left transition-colors cursor-pointer bg-transparent border-none py-1 block"
                        >
                          Clear custom image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => saveContent({ siteSettings })}
                  className="px-6 py-3 bg-[#0F2438] hover:bg-[#7ED957] text-[#F1EFE7] hover:text-[#0F2438] font-display font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Site Settings</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 11: ADMIN ACCOUNTS (SUPER ADMIN ONLY) */}
        {/* ---------------------------------------------------- */}
        {activeTab === "admins" && user.role === "Super Admin" && (
          <div className="space-y-8 animate-fade-in-up">
            
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-display font-black text-[#0F2438] uppercase">Administrative Access Logs</h3>
                  <p className="text-xs text-slate-400">Manage registered administrators, editors, and backend system privileges.</p>
                </div>

                <button
                  onClick={() => setShowAddAdminModal(true)}
                  className="px-4 py-2.5 bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] font-display font-black uppercase text-[10px] tracking-wider rounded-xl transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Admin</span>
                </button>
              </div>

              {/* Table of admins */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4">Role Privileges</th>
                      <th className="py-3 px-4 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((adm) => (
                      <tr key={adm.id} className="border-b border-slate-100 font-medium hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-800">{adm.name}</td>
                        <td className="py-4 px-4 text-slate-600">{adm.email}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                            adm.role === "Super Admin"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}>
                            {adm.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDeleteAdmin(adm.id)}
                            disabled={adm.id === user.id}
                            className={`p-2 rounded-lg transition-colors ${
                              adm.id === user.id
                                ? "text-slate-200 cursor-not-allowed"
                                : "text-red-400 hover:text-red-500 hover:bg-red-50"
                            }`}
                            title={adm.id === user.id ? "Your active profile" : "Delete account"}
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* REGISTER ADMIN MODAL LAYOVER */}
            {showAddAdminModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-[28px] w-full max-w-md p-6 shadow-2xl relative animate-scale-in">
                  <button
                    onClick={() => setShowAddAdminModal(false)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="text-lg font-display font-black text-[#0F2438] uppercase mb-4">Register Admin</h3>
                  
                  <form onSubmit={handleAddAdminSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">User Full Name</label>
                      <input
                        type="text"
                        required
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2 text-xs"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2 text-xs"
                        placeholder="john@juaterms.org"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Access Password</label>
                      <input
                        type="password"
                        required
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2 text-xs"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Access Privileges</label>
                      <select
                        value={newAdmin.role}
                        onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs"
                      >
                        <option value="Editor">Editor (Manage Content Only)</option>
                        <option value="Super Admin">Super Admin (Full privileges)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] font-display font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-md mt-4 cursor-pointer"
                    >
                      REGISTER ACCOUNT
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
