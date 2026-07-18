import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, ArrowRight, Calendar, MapPin, Award, X } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Logo from "../components/Logo";
import { applySeoDescription } from "../utils/seo";
import { fetchContent } from "../lib/content";
import PageLoader from "../components/PageLoader";
import { 
  CAMPAIGN_ABOUT, 
  CAMPAIGN_HIGHLIGHTS, 
  FOOTER_THANK_YOU,
  CAMPAIGN_CONTACT
} from "../data/campaignData";

const DEFAULT_HOME_TITLE = "Jua Terms | Simplify · Clarify · Consent";
const DEFAULT_HERO_TITLE = "JUA TERMS PROFILE";
const DEFAULT_HERO_SUBTITLE = "Simplify. Clarify. Champion Informed Consent.";
const DEFAULT_TAGLINE_QUOTE = "Consent Starts with Clarity.";
const DEFAULT_BADGE_TEXT = "Empowering Kenyan Citizens Since 2024";
const DEFAULT_WELCOME_HEADING = "Welcome to Jua Terms";
const DEFAULT_HIGHLIGHTS_EYEBROW = "Our Journey & Milestones";

export default function HomePage() {
  const navigate = useNavigate();
  const { onJoinCampaign } = useOutletContext<{ onJoinCampaign: () => void }>();
  const [about, setAbout] = useState(CAMPAIGN_ABOUT);
  const [highlights, setHighlights] = useState(CAMPAIGN_HIGHLIGHTS);
  const [footer, setFooter] = useState(FOOTER_THANK_YOU);
  const [siteSettings, setSiteSettings] = useState<any>(CAMPAIGN_CONTACT);
  const [selectedHighlight, setSelectedHighlight] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = DEFAULT_HOME_TITLE;
    fetchContent()
      .then((data) => {
        if (data.about) setAbout(data.about);
        if (data.highlights) setHighlights(data.highlights);
        if (data.footer) setFooter(data.footer);
        if (data.siteSettings) {
          setSiteSettings(data.siteSettings);
          // The homepage <title> is the site's primary title, so let the
          // admin-editable SEO Title override the default when set.
          document.title = data.siteSettings.seoTitle || DEFAULT_HOME_TITLE;
          applySeoDescription(data.siteSettings);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log("Database fetch failed or not initialized. Using static campaignData fallbacks.", err);
        setLoading(false);
      });
  }, []);

  const heroTitle = siteSettings?.heroTitle || DEFAULT_HERO_TITLE;
  const heroSubtitle = siteSettings?.heroSubtitle || DEFAULT_HERO_SUBTITLE;
  const taglineQuote = siteSettings?.taglineQuote || DEFAULT_TAGLINE_QUOTE;
  const badgeText = siteSettings?.badgeText || DEFAULT_BADGE_TEXT;
  const welcomeHeading = siteSettings?.welcomeHeading || DEFAULT_WELCOME_HEADING;
  const highlightsEyebrow = siteSettings?.highlightsEyebrow || DEFAULT_HIGHLIGHTS_EYEBROW;

  if (loading) return <PageLoader />;

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="space-y-0"
    >
      {/* ---------------------------------------------------- */}
      {/* SECTION A: HERO / COVER */}
      {/* ---------------------------------------------------- */}
      <section id="hero" className="relative bg-[#F1EFE7] overflow-hidden">
        
        {/* Stacked Arch Panel 1: Hero Header Block */}
        <div className="relative bg-[#0F2438] text-[#F1EFE7] pt-12 pb-16 px-4 text-center rounded-b-[60px] md:rounded-b-[90px] z-10 shadow-xl">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Logo Center Stage */}
            <div className="mb-6 transform hover:scale-102 transition-transform duration-300">
              <Logo size="lg" light={true} customImage={siteSettings?.logoImage} />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white tracking-tight uppercase leading-[1.1] mb-4">
              {heroTitle}
            </h1>
            
            <p className="text-[#8FC6E8] text-lg md:text-xl font-medium tracking-wide max-w-2xl font-display">
              {heroSubtitle}
            </p>
          </div>
        </div>

        {/* Stacked Arch Panel 2: Slogan and Graphic Block */}
        <div className="relative bg-[#0F2438] text-[#F1EFE7] pt-8 pb-32 px-4 text-center rounded-b-[70px] md:rounded-b-[100px] mt-[-30px] z-0 shadow-lg">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="text-xl md:text-2xl font-sans text-gray-200 font-medium mb-8 italic tracking-wide">
              "{taglineQuote}"
            </h2>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button 
                onClick={onJoinCampaign}
                className="w-full sm:w-auto bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] font-display font-extrabold uppercase px-8 py-3.5 rounded-full shadow-lg hover:shadow-[#7ED957]/25 transition-all transform hover:-translate-y-0.5"
              >
                Join the Campaign
              </button>
              
              <button 
                onClick={() => navigate("/about")}
                className="w-full sm:w-auto inline-flex items-center justify-center border-2 border-[#8FC6E8] text-[#8FC6E8] hover:bg-[#8FC6E8]/10 font-display font-extrabold uppercase px-8 py-3 rounded-full transition-all cursor-pointer text-center"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Transition area: light blue to light green gradient background bottom half */}
        <div className="relative bg-gradient-to-b from-[#BFE3F5] to-[#D8F5C0] pt-24 pb-16 px-4 flex flex-col items-center min-h-[250px]">
          
          {/* Circular Framed Group Photo straddling the navy-to-gradient transition */}
          <div 
            className="absolute top-0 -translate-y-1/2 w-[240px] h-[240px] md:w-[320px] md:h-[320px] rounded-full border-8 md:border-[12px] border-white shadow-2xl overflow-hidden z-20 hover:scale-102 transition-transform duration-500"
            id="hero-group-photo-frame"
          >
            <img 
              src={footer.groupPhoto} 
              alt="Jua Terms advocacy campaigners group" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="max-w-2xl mx-auto text-center mt-28 md:mt-40">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40 shadow-sm">
              <Users className="w-4 h-4 text-[#0F2438]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F2438]">
                {badgeText}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Short Intro teaser section */}
      <section className="py-20 bg-[#F1EFE7] border-t border-b border-black/5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-[#0F2438] text-[#F1EFE7] rounded-[40px] md:rounded-[60px] p-8 md:p-12 relative overflow-hidden shadow-xl text-center flex flex-col items-center border border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#7ED957]/10 blur-3xl pointer-events-none" />
            <div className="mb-4">
              <Logo size="sm" light={true} customImage={siteSettings?.logoImage} />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold uppercase mb-4 text-[#7ED957]">
              {welcomeHeading}
            </h2>
            <p className="text-gray-200 text-base md:text-lg max-w-3xl leading-relaxed mb-6 font-normal">
              {about.body || about.text}
            </p>
            <button 
              onClick={() => navigate("/about")}
              className="inline-flex items-center space-x-2 bg-[#7ED957] hover:bg-[#6ec248] text-[#0F2438] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <span>Read Our Full Story & Vision</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Highlights Teaser */}
      <section className="py-20 bg-[#FFF7ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <span className="text-[#F97316] text-xs font-bold uppercase tracking-wider block mb-2">{highlightsEyebrow}</span>
              <h2 className="text-3xl md:text-5xl font-display font-black text-[#0F2438] uppercase">Campaign Highlights</h2>
            </div>
            <button 
              onClick={() => navigate("/highlights")}
              className="mt-4 md:mt-0 inline-flex items-center space-x-1 bg-[#F97316] hover:bg-[#ea580c] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <span>View All Highlights</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {highlights.images ? (
              highlights.images.slice(0, 2).map((img: any, idx: number) => (
                <div key={idx} className="bg-white rounded-[32px] overflow-hidden border border-gray-100/80 shadow-lg group flex flex-col h-full hover:shadow-xl transition-all">
                  <div className="relative h-56 overflow-hidden">
                    <img src={img.url} alt={img.alt} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                    <span className="absolute top-4 left-4 bg-[#7ED957] text-[#0F2438] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{img.category}</span>
                  </div>
                  <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-display font-bold text-[#0F2438] uppercase mb-3 leading-tight">{img.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 font-normal">{img.description}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedHighlight(img)}
                      className="text-[#F97316] hover:text-[#ea580c] text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 self-start cursor-pointer group/btn"
                    >
                      <span>Explore Highlight</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-gray-500">No highlights loaded.</div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* CAMPAIGN HIGHLIGHT LIGHTBOX MODAL */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {selectedHighlight && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-pointer overflow-y-auto"
            onClick={() => setSelectedHighlight(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-full max-w-4xl bg-[#0F2438] text-[#F1EFE7] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl cursor-default my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedHighlight(null)}
                className="absolute top-4 right-4 text-white hover:text-[#7ED957] transition-colors p-2 rounded-full bg-black/40 hover:bg-black/60 z-20 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12">
                
                {/* Left Side: Image */}
                <div className="md:col-span-6 relative h-64 md:h-auto min-h-[320px]">
                  <img 
                    src={selectedHighlight.url} 
                    alt={selectedHighlight.alt} 
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#7ED957] text-[#0F2438] px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md font-display">
                    {selectedHighlight.category}
                  </div>
                </div>

                {/* Right Side: narrative details */}
                <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 font-semibold mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#7ED957]" />
                        {selectedHighlight.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#7ED957]" />
                        {selectedHighlight.location}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-tight leading-tight mb-4">
                      {selectedHighlight.title}
                    </h3>

                    <p className="text-gray-200 text-sm leading-relaxed font-normal">
                      {selectedHighlight.description}
                    </p>
                  </div>

                  {/* Impact Spot */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-[#7ED957]/5 blur-md pointer-events-none" />
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#7ED957]/20 flex items-center justify-center text-[#7ED957] flex-shrink-0 mt-0.5">
                        <Award className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-[#7ED957] font-black mb-1">Impact Spotlight</span>
                        <p className="text-xs text-white leading-relaxed font-normal">
                          {selectedHighlight.impact}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer options */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold font-mono">
                      Jua Terms Advocacy
                    </span>
                    <button
                      onClick={() => setSelectedHighlight(null)}
                      className="bg-transparent hover:text-[#7ED957] text-gray-300 font-display font-extrabold uppercase text-xs tracking-wider cursor-pointer border-none py-1"
                    >
                      Close Showcase
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
