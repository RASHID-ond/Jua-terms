import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PARTNERS } from "../data/campaignData";
import { applySeoDescription } from "../utils/seo";
import { fetchContent } from "../lib/content";

export default function PartnersPage() {
  const [partners, setPartners] = useState(PARTNERS);

  useEffect(() => {
    document.title = "Our Partners | Jua Terms";
    fetchContent()
      .then((data) => {
        if (data.partners) setPartners(data.partners);
        if (data.siteSettings) applySeoDescription(data.siteSettings);
      })
      .catch((err) => {
        console.log("Database fetch failed or not initialized. Using static campaignData fallbacks.", err);
      });
  }, []);

  return (
    <motion.div
      key="partners"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="space-y-0"
    >
      {/* ---------------------------------------------------- */}
      {/* SECTION I: PREVIOUS & PRESENT PARTNERS */}
      {/* ---------------------------------------------------- */}
      <section id="partners" className="py-20 bg-[#F1EFE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
              Collaborative impact for digital dignity
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-[#0F2438] uppercase mb-2">
              <span className="editorial-header-underline">Previous & Present Partners</span>
            </h2>
          </div>

          {/* Dynamic responsive container wrapper for consistent aspect ratios and spacing */}
          <div className="w-full bg-white/40 backdrop-blur-md rounded-[32px] border border-white/60 shadow-inner p-3 sm:p-6 md:p-8 max-w-5xl mx-auto" id="partners-container-wrapper">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8" id="partners-grid">
              {partners.map((partner, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center aspect-[4/3] sm:aspect-video hover:shadow-md hover:border-gray-200 transition-all duration-300 select-none group"
                  id={`partner-${index}`}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center text-center">
                    <div className="text-[#0F2438] group-hover:text-[#7ED957] transition-colors flex flex-col items-center">
                      {partner.image ? (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2 shadow-sm border border-slate-100 flex items-center justify-center bg-white group-hover:scale-105 transition-transform duration-300">
                          <img src={partner.image} alt={partner.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-1.5 sm:mb-2 font-display font-black tracking-tighter text-xs sm:text-sm">
                          {partner.logoPlaceholder}
                        </div>
                      )}
                      
                      <span className="font-display font-black text-[10px] sm:text-xs uppercase tracking-tight text-[#0F2438] line-clamp-2 leading-tight">
                        {partner.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </motion.div>
  );
}
