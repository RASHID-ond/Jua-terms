import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, 
  X, 
  Twitter, 
  Instagram, 
  Mail, 
  ArrowRight, 
  Shield, 
  ArrowUp 
} from "lucide-react";
import Logo from "./Logo";
import CampaignModal from "./CampaignModal";
import { CAMPAIGN_CONTACT, FOOTER_THANK_YOU } from "../data/campaignData";
import { fetchContent } from "../lib/content";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentRoute = location.pathname;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [siteSettings, setSiteSettings] = useState<any>(CAMPAIGN_CONTACT);
  const [footer, setFooter] = useState(FOOTER_THANK_YOU);

  useEffect(() => {
    // Sync shared content slice
    fetchContent()
      .then((data) => {
        if (data.siteSettings) setSiteSettings(data.siteSettings);
        if (data.footer) setFooter(data.footer);
      })
      .catch(() => {});
  }, []);

  // Scroll monitoring
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Focus Areas", path: "/focus-areas" },
    { label: "Our Approach", path: "/approach" },
    { label: "Events", path: "/events" },
    { label: "Highlights", path: "/highlights" },
    { label: "Team", path: "/team" },
    { label: "Partners", path: "/partners" },
    { label: "Contact", path: "/contact" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F1EFE7] text-[#101828] font-sans overflow-x-hidden antialiased selection:bg-[#7ED957]/30 selection:text-[#0F2438]">
      
      {/* ---------------------------------------------------- */}
      {/* STICKY NAVBAR */}
      {/* ---------------------------------------------------- */}
      <header 
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? "bg-[#0F2438]/95 backdrop-blur-md shadow-lg py-3 border-b border-white/5" 
            : "bg-[#0F2438] py-4 border-b border-white/10"
        }`}
        id="navbar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo container */}
          <Link 
            to="/"
            className="flex items-center hover:opacity-90 transition-opacity p-0 cursor-pointer text-white hover:text-[#7ED957]"
          >
            <Logo size="sm" light={true} customImage={siteSettings.logoImage} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-5 xl:space-x-7">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.path;
              return (
                <Link 
                  key={link.path}
                  to={link.path}
                  className={`font-semibold text-xs xl:text-sm tracking-wide transition-all py-1.5 px-1 relative ${
                    isActive 
                      ? "text-[#7ED957] font-bold" 
                      : "text-gray-300 hover:text-[#7ED957]"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavLine"
                      className="absolute bottom-0 left-1 right-1 h-0.5 bg-[#7ED957] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA & Mobile Hamburger */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:inline-flex items-center justify-center bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] font-display font-extrabold uppercase text-xs tracking-wider px-5 py-2.5 rounded-full shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              id="nav-join-button"
            >
              Join the Campaign
            </button>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-[#F1EFE7] hover:text-[#7ED957] p-2 rounded-lg bg-white/5 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ 
                opacity: 1, 
                height: "auto", 
                y: 0,
                transition: {
                  height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.25, ease: "linear" },
                  y: { type: "spring", stiffness: 280, damping: 26 }
                }
              }}
              exit={{ 
                opacity: 0, 
                height: 0, 
                y: -15,
                transition: {
                  height: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.15, ease: "linear" },
                  y: { duration: 0.2, ease: "easeIn" }
                }
              }}
              className="lg:hidden absolute top-full left-0 right-0 bg-[#0F2438] border-b border-white/10 shadow-xl px-4 py-6 space-y-4 flex flex-col overflow-hidden"
            >
              {navLinks.map((link, idx) => {
                const isActive = currentRoute === link.path;
                return (
                  <Link 
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-left text-base font-bold py-2 border-b border-white/5 transition-colors cursor-pointer ${
                      isActive ? "text-[#7ED957]" : "text-gray-200 hover:text-[#7ED957]"
                    }`}
                  >
                    <motion.span
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 + 0.08, type: "spring", stiffness: 200, damping: 20 }}
                      className="block w-full"
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                );
              })}
              <motion.button 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.04 + 0.1, type: "spring", stiffness: 200, damping: 20 }}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] font-display font-extrabold uppercase text-center py-3 rounded-full shadow-md transition-all cursor-pointer"
              >
                Join the Campaign
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Single Page Sections Wrapper */}
      <main className="pt-16 flex-grow flex flex-col justify-start">
        <Outlet context={{ onJoinCampaign: () => setIsModalOpen(true) }} />
      </main>

      {/* ---------------------------------------------------- */}
      {/* SECTION L: FOOTER / THANK YOU */}
      {/* ---------------------------------------------------- */}
      <footer className="relative bg-[#0F2438] text-[#F1EFE7] pt-10 md:pt-12 rounded-t-[32px] md:rounded-t-[48px] mt-12 shadow-inner" id="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Centered Thank You Block */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-white/10">
            <div className="flex-grow text-center md:text-left max-w-2xl">
              <span className="text-[#7ED957] text-xs font-bold uppercase tracking-widest block mb-1">
                Closing Message
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight uppercase mb-3">
                {footer.heading}
              </h2>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed font-normal">
                "{footer.text}"
              </p>
            </div>

            {/* Compact Team Photo */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative group w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-white/80 shadow-md overflow-hidden hover:scale-105 transition-transform duration-300">
                <img 
                  src={footer.groupPhoto || "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=400&h=400"} 
                  alt="Jua Terms group portrait" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-display text-[#7ED957] text-[10px] font-extrabold uppercase tracking-widest text-center">
                Together We Simplify · Clarify
              </div>
            </div>
          </div>

          {/* Grid: Navigation, Logo, Socials */}
          <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Logo and brief on left */}
            <div className="md:col-span-5 space-y-4">
              <Logo size="sm" light={true} customImage={siteSettings.logoImage} />
              <p className="text-gray-200 text-sm max-w-xs leading-relaxed font-normal mt-4">
                Amnesty International Kenya campaign under Privacy First, and proud recipient of the CIPESA grant. Championing informed consent across East Africa.
              </p>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-4">
              <h4 className="text-white text-xs uppercase tracking-wider font-bold mb-4 font-display">
                Quick Navigation
              </h4>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path}
                    to={link.path}
                    className="text-left text-sm transition-colors cursor-pointer text-gray-200 hover:text-[#7ED957]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Stay Updated & Admin shortcut */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-white text-xs uppercase tracking-wider font-bold mb-3 font-display">
                Stay Updated
              </h4>
              <div className="flex space-x-3">
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#7ED957] hover:text-[#0F2438] text-white transition-all"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#7ED957] hover:text-[#0F2438] text-white transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a 
                  href={`mailto:${siteSettings.email}`} 
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#7ED957] hover:text-[#0F2438] text-white transition-all"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
              <p className="text-gray-200 text-xs mt-2 font-normal">
                Join our newsletter list by clicking below to receive campaign updates.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-[#7ED957] hover:text-[#6ec248] transition-colors"
              >
                <span>Subscribe to newsletter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-200 font-medium">
            <span>&copy; {new Date().getFullYear()} Jua Terms Advocacy. All rights reserved.</span>
            <span className="mt-2 sm:mt-0 font-light flex items-center gap-1.5">
              <span>Made for</span> 
              <span className="text-[#7ED957] font-semibold">Privacy First Campaign</span>
            </span>
          </div>

          {/* Back to Top */}
          <AnimatePresence>
            {showBackToTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                whileHover={{ scale: 1.1, translateY: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] p-3 md:p-4 rounded-full shadow-xl hover:shadow-[#7ED957]/20 z-50 transition-colors flex items-center justify-center border border-white/10 group cursor-pointer"
                title="Back to Top"
                id="back-to-top"
              >
                <ArrowUp className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5]" />
              </motion.button>
            )}
          </AnimatePresence>

        </div>
      </footer>

      {/* ---------------------------------------------------- */}
      {/* CAMPAIGN OVERLAY MODAL */}
      {/* ---------------------------------------------------- */}
      <CampaignModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        logoImage={siteSettings.logoImage}
      />

    </div>
  );
}
