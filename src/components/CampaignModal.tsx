import React, { useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import Logo from "./Logo";

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoImage?: string;
}

export default function CampaignModal({ isOpen, onClose, logoImage }: CampaignModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    affiliation: "",
    interest: "Student Advocacy",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm cursor-pointer overflow-y-auto" 
      id="campaign-modal"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#0F2438] text-[#F1EFE7] rounded-[32px] p-6 md:p-8 border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh] cursor-default scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        id="campaign-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#7ED957] transition-colors p-2 rounded-full hover:bg-white/5"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-[#7ED957]/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-[#8FC6E8]/10 blur-xl pointer-events-none" />

        {!submitted ? (
          <div>
            <div className="mb-6">
              <Logo size="sm" light={true} customImage={logoImage} />
              <h3 className="text-2xl font-display font-extrabold mt-4 text-white">Join Jua Terms</h3>
              <p className="text-gray-300 text-sm mt-1">
                Champion informed consent. Help us make terms & conditions simple and clear.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abigael Goko"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7ED957] transition-all text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. abigael@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7ED957] transition-all text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  University / Affiliation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mount Kenya University"
                  value={formData.affiliation}
                  onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7ED957] transition-all text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Area of Interest
                </label>
                <select
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  className="w-full bg-slate-800 border border-white/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7ED957] transition-all text-white"
                >
                  <option value="Student Advocacy">Student Advocacy & Campus Dialogues</option>
                  <option value="Corporate Outreach">Corporate Engagement & T&C Simplification</option>
                  <option value="Policy Advocacy">Policy Formulation & Legislative Support</option>
                  <option value="Creative & Media">Creative Design, Audio-Visual & Infographics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Message / Why you want to join (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us briefly how you'd like to support..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7ED957] transition-all text-white placeholder-gray-500 resize-none"
                />
              </div>

              <div className="space-y-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] font-display font-extrabold uppercase py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center justify-center disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Registering..." : "Submit Application"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-display font-bold uppercase py-3 rounded-xl transition-all text-sm flex items-center justify-center border border-white/10 cursor-pointer"
                >
                  Cancel / Go Back
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle2 className="w-16 h-16 text-[#7ED957] mb-4 animate-bounce" />
            <h3 className="text-2xl font-display font-extrabold text-white mb-2">Welcome to the Campaign!</h3>
            <p className="text-gray-300 max-w-sm text-sm">
              Thank you, <strong className="text-white">{formData.name}</strong>, for joining Jua Terms. We will send a welcome kit to <strong className="text-white">{formData.email}</strong> shortly!
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: "", email: "", affiliation: "", interest: "Student Advocacy", message: "" });
                onClose();
              }}
              className="mt-6 bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] font-display font-extrabold uppercase px-8 py-3 rounded-full transition-all text-sm cursor-pointer shadow-lg"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
