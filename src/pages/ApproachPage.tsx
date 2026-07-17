import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import Timeline from "../components/Timeline";
import { CAMPAIGN_APPROACH } from "../data/campaignData";
import { applySeoDescription } from "../utils/seo";
import { fetchContent } from "../lib/content";

export default function ApproachPage() {
  const [approach, setApproach] = useState(CAMPAIGN_APPROACH);

  useEffect(() => {
    document.title = "Our Approach | Jua Terms";
    fetchContent()
      .then((data) => {
        if (data.approach) setApproach(data.approach);
        if (data.siteSettings) applySeoDescription(data.siteSettings);
      })
      .catch((err) => {
        console.log("Database fetch failed or not initialized. Using static campaignData fallbacks.", err);
      });
  }, []);

  return (
    <motion.div
      key="approach"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
    >
      {/* ---------------------------------------------------- */}
      {/* SECTION E: OUR APPROACH */}
      {/* ---------------------------------------------------- */}
      <section id="approach" className="py-20 bg-[#F1EFE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
              Inclusive, localized, and multi-format
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-[#0F2438] uppercase mb-2">
              <span className="editorial-header-underline">{approach.title}</span>
            </h2>
            <p className="text-base text-gray-500 font-bold mt-4 max-w-2xl mx-auto">
              {approach.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Timeline list */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <Timeline items={approach.items} idPrefix="approach" />
            </div>

            {/* Right side: Portrait image */}
            <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center" id="approach-image-container">
              <div className="relative group max-w-sm w-full">
                
                <div className="absolute -top-4 -right-4 w-32 h-32 rounded-tr-[50px] bg-[#8FC6E8]/40 -z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-bl-[40px] bg-[#7ED957]/30 -z-10 group-hover:-translate-x-1 group-hover:translate-y-1 transition-all" />

                <div className="rounded-[42px] overflow-hidden border-4 border-white shadow-2xl aspect-[3/4] bg-slate-100">
                  <img 
                    src={approach.image || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600&h=800"} 
                    alt="Transparency advocacy portrait" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </motion.div>
  );
}
