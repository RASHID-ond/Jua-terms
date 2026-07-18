import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, MapPin, Sparkles, ArrowRight, X, Award } from "lucide-react";
import { CAMPAIGN_HIGHLIGHTS } from "../data/campaignData";
import CampaignHighlightsSection from "../components/CampaignHighlightsSection";
import { applySeoDescription } from "../utils/seo";
import { fetchContent } from "../lib/content";
import PageLoader from "../components/PageLoader";

export default function HighlightsPage() {
  const [highlights, setHighlights] = useState(CAMPAIGN_HIGHLIGHTS);
  const [highlightFilter, setHighlightFilter] = useState("All");
  const [selectedHighlight, setSelectedHighlight] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Campaign Highlights | Jua Terms";
    fetchContent()
      .then((data) => {
        if (data.highlights) setHighlights(data.highlights);
        if (data.siteSettings) applySeoDescription(data.siteSettings);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Database fetch failed or not initialized. Using static campaignData fallbacks.", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <PageLoader />;

  return (
    <motion.div
      key="highlights"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
    >
      {/* ---------------------------------------------------- */}
      {/* SECTION G: CAMPAIGN HIGHLIGHTS */}
      {/* ---------------------------------------------------- */}
      <div id="campaign-highlights" className="bg-[#FFF7ED]">
        <CampaignHighlightsSection 
          title={highlights.title}
          subheading={highlights.subheading}
          quote={highlights.quote}
        />
        
        {/* Collage Gallery underneath */}
        <section className="pb-24 pt-4 bg-[#FFF7ED]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="border-t border-[#F97316]/10 pt-16">
              {/* Collapsible/Interactive collage filters */}
              <div className="flex flex-wrap justify-center gap-3 mb-12" id="highlights-filter-tabs">
                {["All", "University Dialogues", "Stakeholder Forums", "Milestones"].map((category) => {
                  const activeCat = highlightFilter === category;
                  return (
                    <button
                      key={category}
                      onClick={() => setHighlightFilter(category)}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer ${
                        activeCat 
                          ? "bg-[#F97316] text-white hover:bg-[#ea580c]" 
                          : "bg-white text-[#0F2438] border border-gray-100 hover:border-[#F97316]/30 hover:bg-orange-50/50"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              {/* Filtered Collage Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10" id="highlights-masonry-grid">
                {highlights.images ? (
                  highlights.images
                    .filter((img: any) => highlightFilter === "All" || img.category === highlightFilter)
                    .map((img: any) => (
                      <motion.div
                        layout
                        key={img.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden flex flex-col group h-full hover:shadow-2xl transition-all duration-300"
                      >
                        {/* Card Image banner */}
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={img.url}
                            alt={img.alt}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                          />
                          <div className="absolute top-4 left-4 bg-[#0F2438]/90 backdrop-blur-md text-[#F97316] px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                            {img.category}
                          </div>
                        </div>

                        {/* Card details */}
                        <div className="p-6 md:p-8 flex flex-col flex-1 justify-between">
                          <div>
                            {/* Meta Date & Location */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-semibold mb-3">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                {img.date}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                {img.location}
                              </span>
                            </div>

                            <h3 className="text-xl md:text-2xl font-display font-extrabold text-[#0F2438] uppercase tracking-tight mb-3">
                              {img.title}
                            </h3>

                            <p className="text-sm text-gray-600 leading-relaxed font-normal mb-6">
                              {img.description}
                            </p>
                          </div>

                          {/* Impact Spotlight */}
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-start gap-3 mt-auto">
                            <div className="w-8 h-8 rounded-full bg-[#F97316]/15 flex items-center justify-center text-[#F97316] flex-shrink-0 mt-0.5">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Key Impact Spotlight</span>
                              <p className="text-xs text-[#0F2438] font-semibold leading-relaxed">
                                {img.impact}
                              </p>
                            </div>
                          </div>

                          {/* Button trigger */}
                          <button
                            onClick={() => setSelectedHighlight(img)}
                            className="w-full mt-6 bg-[#0F2438] hover:bg-[#F97316] hover:text-white text-white font-display font-extrabold uppercase text-xs tracking-wider py-3 rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group/btn"
                          >
                            <span>Explore Immersive Detail</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                ) : (
                  <div className="col-span-2 text-center py-12 text-gray-500">No highlights loaded.</div>
                )}
              </div>

              <div className="text-center mt-12 text-gray-400 text-sm">
                <span className="font-semibold text-gray-500">Pro-Tip:</span> Click any card to launch an immersive full-screen impact showcase.
              </div>

            </div>
          </div>
        </section>
      </div>

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
