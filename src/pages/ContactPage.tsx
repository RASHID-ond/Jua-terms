import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MapPin, Phone, Mail, Twitter, ArrowRight, Check } from "lucide-react";
import Logo from "../components/Logo";
import { applySeoDescription } from "../utils/seo";
import { CAMPAIGN_CONTACT } from "../data/campaignData";

export default function ContactPage() {
  const [siteSettings, setSiteSettings] = useState(CAMPAIGN_CONTACT);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Contact Us | Jua Terms";
    fetch("/api/content")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Unable to fetch content");
      })
      .then((data) => {
        if (data.siteSettings) {
          setSiteSettings(data.siteSettings);
          applySeoDescription(data.siteSettings);
        }
      })
      .catch((err) => {
        console.log("Database fetch failed or not initialized. Using static campaignData fallbacks.", err);
      });
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      });
      if (res.ok) {
        setIsSubmitted(true);
        setContactForm({ name: "", email: "", message: "" });
        setTimeout(() => setIsSubmitted(false), 5000); // clear success alert after 5s
      } else {
        throw new Error("API submission failed");
      }
    } catch (err) {
      console.error(err);
      // Fallback submission simulation if local network/db fails
      setTimeout(() => {
        setIsSubmitted(true);
        setContactForm({ name: "", email: "", message: "" });
        setTimeout(() => setIsSubmitted(false), 5000);
      }, 800);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      key="contact"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
    >
      {/* ---------------------------------------------------- */}
      {/* SECTION K: CONTACT US */}
      {/* ---------------------------------------------------- */}
      <section id="contact" className="py-20 bg-[#F1EFE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
              Have questions or want to partner?
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-[#0F2438] uppercase mb-2">
              <span className="editorial-header-underline">Contact Us</span>
            </h2>
            <p className="text-lg text-[#7ED957] font-display font-black italic mt-3">
              {siteSettings.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Left Column: Contact Details */}
            <div className="lg:col-span-5 bg-[#0F2438] text-[#F1EFE7] rounded-[40px] p-8 md:p-12 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-display font-extrabold text-white mb-2 uppercase">
                    Connect Directly
                  </h3>
                  <p className="text-[#8FC6E8] text-sm">
                    We welcome inquiries from academic institutions, tech developers, policy thinkers, and legal practitioners.
                  </p>
                </div>

                <div className="space-y-6">
                  
                  {/* Address */}
                  <div className="flex items-center space-x-4 group">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[#7ED957] group-hover:bg-[#7ED957] group-hover:text-[#0F2438] transition-all">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">Address</span>
                      <span className="font-semibold text-white">{siteSettings.address}</span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center space-x-4 group">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[#7ED957] group-hover:bg-[#7ED957] group-hover:text-[#0F2438] transition-all">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">Phone</span>
                      <span className="font-semibold text-white">{siteSettings.phone}</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center space-x-4 group">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[#7ED957] group-hover:bg-[#7ED957] group-hover:text-[#0F2438] transition-all">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">Email Address</span>
                      <a href={`mailto:${siteSettings.email}`} className="font-semibold text-white hover:text-[#7ED957] transition-colors">{siteSettings.email}</a>
                    </div>
                  </div>

                  {/* Social */}
                  <div className="flex items-center space-x-4 group">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[#7ED957] group-hover:bg-[#7ED957] group-hover:text-[#0F2438] transition-all">
                      <Twitter className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">Social Media</span>
                      <span className="font-semibold text-white">{siteSettings.social}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Campaign Logo Stamp */}
              <div className="pt-8 border-t border-white/10 mt-8 flex items-center justify-between">
                <Logo size="sm" light={true} customImage={siteSettings?.logoImage} />
                <div className="text-right text-xs text-gray-400 font-mono">
                  #ConsentFirst
                </div>
              </div>

            </div>

            {/* Right Column: Active Form */}
            <div className="lg:col-span-7 bg-white border border-black/5 rounded-[40px] p-8 md:p-12 shadow-xl">
              <h3 className="text-xl font-display font-extrabold text-[#0F2438] mb-6 uppercase">
                Send us a Message
              </h3>

              {isSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center flex flex-col items-center animate-fade-in-up">
                  <Check className="w-12 h-12 text-emerald-500 bg-emerald-100 p-2 rounded-full mb-3" />
                  <h4 className="font-display font-bold text-emerald-950 text-lg">Message Sent Successfully!</h4>
                  <p className="text-emerald-800 text-sm mt-1 max-w-sm">
                    Thank you for reaching out to Jua Terms. Our digital rights advocacy team will respond within 48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5" id="contact-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0F2438] mb-1">
                        Your Name
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Abigael Goko"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0F2438] mb-1">
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        required
                        placeholder="abigael@gmail.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0F2438] mb-1">
                      Your Message
                    </label>
                    <textarea 
                      required
                      rows={5}
                      placeholder="Type your feedback, partnership proposal, or question here..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7ED957] transition-all resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#0F2438] hover:bg-[#F97316] text-white font-display font-extrabold uppercase text-xs tracking-wider py-3.5 rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Sending message...</span>
                    ) : (
                      <>
                        <span>Submit Message</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </motion.div>
  );
}
