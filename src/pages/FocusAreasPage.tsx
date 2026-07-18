import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import Timeline from "../components/Timeline";
import { CAMPAIGN_FOCUS_AREAS } from "../data/campaignData";
import { applySeoDescription } from "../utils/seo";
import { fetchContent } from "../lib/content";
import PageLoader from "../components/PageLoader";

export default function FocusAreasPage() {
  const [focusAreas, setFocusAreas] = useState(CAMPAIGN_FOCUS_AREAS);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Our Focus Areas | Jua Terms";
    fetchContent()
      .then((data) => {
        if (data.focusAreas) setFocusAreas(data.focusAreas);
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
      key="focus-areas"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
    >
      {/* ---------------------------------------------------- */}
      {/* SECTION D: OUR FOCUS AREAS */}
      {/* ---------------------------------------------------- */}
      <section id="focus-areas" className="py-20 bg-[#F1EFE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#4B5563] block mb-2">
              Empowering change on campuses & tech
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-[#0F2438] uppercase mb-2">
              <span className="editorial-header-underline">{focusAreas.title}</span>
            </h2>
            <p className="text-lg text-[#7ED957] font-display font-extrabold italic mt-3">
              {focusAreas.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Large photo */}
            <div className="lg:col-span-5 relative group" id="focus-image-container">
              <div className="absolute -top-3 -left-3 w-20 h-20 rounded-tl-3xl bg-[#7ED957]/20 -z-10 group-hover:scale-105 transition-transform" />
              <div className="absolute -bottom-3 -right-3 w-24 h-24 rounded-br-3xl bg-[#8FC6E8]/30 -z-10 group-hover:scale-105 transition-transform" />
              
              <div className="rounded-[40px] overflow-hidden border-4 border-white shadow-xl aspect-[3/4] bg-slate-100">
                <img 
                  src={focusAreas.image} 
                  alt="Focus Area leader" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                />
              </div>
            </div>

            {/* Right side: Timeline list */}
            <div className="lg:col-span-7">
              <Timeline items={focusAreas.items} idPrefix="focus" />
            </div>

          </div>
        </div>
      </section>
    </motion.div>
  );
}
