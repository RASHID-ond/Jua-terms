import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CAMPAIGN_ABOUT, CAMPAIGN_VISION_MISSION } from "../data/campaignData";
import { applySeoDescription } from "../utils/seo";
import { fetchContent } from "../lib/content";
import PageLoader from "../components/PageLoader";

export default function AboutPage() {
  const [about, setAbout] = useState(CAMPAIGN_ABOUT);
  const [visionMission, setVisionMission] = useState(CAMPAIGN_VISION_MISSION);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "About Us | Jua Terms";
    fetchContent()
      .then((data) => {
        if (data.about) setAbout(data.about);
        if (data.visionMission) setVisionMission(data.visionMission);
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
      key="about"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="space-y-0"
    >
      {/* ---------------------------------------------------- */}
      {/* SECTION B: ABOUT US */}
      {/* ---------------------------------------------------- */}
      <section id="about" className="relative bg-[#F1EFE7] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left text column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F97316] block">
                Campaign Background
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-black text-[#0F2438] uppercase leading-[1.1]">
                <span className="editorial-header-underline">About Us</span>
              </h2>
              
              <p className="text-base md:text-lg text-gray-700 leading-relaxed font-normal">
                {about.body || about.text}
              </p>
              
              <div className="flex space-x-2 pt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7ED957]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#8FC6E8]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F2438]" />
              </div>
            </div>

            {/* Right column: single image with subtle frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div 
                className="relative max-w-sm rounded-[40px] overflow-hidden shadow-2xl border-4 border-white group"
                id="about-portrait-frame"
              >
                <img 
                  src={about.portraitImage} 
                  alt="About Jua Terms Campaign Portrait" 
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500" 
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION C: VISION & MISSION */}
      {/* ---------------------------------------------------- */}
      <section id="vision" className="py-20 bg-[#F1EFE7] border-t border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Vision Block on Left Side (span 5) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-[#7ED957] text-xs font-bold uppercase tracking-widest block">
                  Our core purpose
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-black text-[#0F2438] tracking-tight uppercase mb-4">
                  <span className="editorial-header-underline">{visionMission.vision.title}</span>
                </h2>
              </div>

              <p className="text-[#101828] text-xl md:text-2xl font-display font-bold leading-normal text-slate-800 tracking-tight">
                "{visionMission.vision.text}"
              </p>

              {/* Two side-by-side photos beneath */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                
                {/* Photo 1 with Blob */}
                <div className="relative group">
                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-tl-full bg-[#7ED957] -z-10 group-hover:scale-110 transition-transform" />
                  
                  <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-md aspect-square bg-slate-100">
                    <img 
                      src={visionMission.images?.[0]?.url} 
                      alt={visionMission.images?.[0]?.alt || "Vision 1"} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>

                {/* Photo 2 with Blob */}
                <div className="relative group">
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-br-full bg-[#8FC6E8] -z-10 group-hover:scale-110 transition-transform" />
                  
                  <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-md aspect-square bg-slate-100">
                    <img 
                      src={visionMission.images?.[1]?.url} 
                      alt={visionMission.images?.[1]?.alt || "Vision 2"} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Mission Block on Right Side (span 7) */}
            <div className="lg:col-span-7 bg-white rounded-[40px] p-8 md:p-12 shadow-xl border border-black/5">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[#0F2438] text-xs font-bold uppercase tracking-widest block">
                    Our roadmap
                  </span>
                  <h2 className="text-3xl md:text-4xl font-display font-black text-[#0F2438] tracking-tight uppercase mb-4">
                    <span className="editorial-header-underline">{visionMission.mission.title}</span>
                  </h2>
                </div>

                {/* Mission bulleted list */}
                <ul className="space-y-5" id="mission-bullet-list">
                  {visionMission.mission.items.map((item: string, index: number) => (
                    <li key={index} className="flex items-start group">
                      
                      <div className="mr-4 mt-1 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full border-2 border-[#7ED957] bg-white flex items-center justify-center shadow-sm group-hover:bg-[#7ED957]/15 transition-colors">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#7ED957]"></div>
                        </div>
                      </div>

                      <p className="font-sans text-[#4B5563] text-base md:text-lg leading-relaxed font-normal">
                        {item}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>
    </motion.div>
  );
}
