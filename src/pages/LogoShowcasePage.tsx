import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import Logo from "../components/Logo";
import { fetchContent } from "../lib/content";

export default function LogoShowcasePage() {
  const [logoImage, setLogoImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    document.title = "Our Logo | Jua Terms";
    fetchContent()
      .then((data) => {
        if (data.siteSettings && data.siteSettings.logoImage) {
          setLogoImage(data.siteSettings.logoImage);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <motion.div
      key="logo-showcase"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
    >
      {/* ---------------------------------------------------- */}
      {/* SECTION J: OUR LOGO SHOWCASE */}
      {/* ---------------------------------------------------- */}
      <section id="brand-logo-showcase" className="py-20 bg-[#F1EFE7]">
        <div className="max-w-5xl mx-auto px-4">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-black text-[#0F2438] uppercase mb-2">
              <span className="editorial-header-underline">Our Logo</span>
            </h2>
          </div>

          {/* Near-Black `#111111` card with rounded corners */}
          <div 
            className="bg-[#111111] text-[#F1EFE7] rounded-[40px] p-12 md:p-24 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl"
            id="logo-dark-panel"
          >
            <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-[#7ED957]/5 blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-[#8FC6E8]/10 blur-3xl" />

            <div className="scale-110 md:scale-125 transform transition-transform hover:scale-130 duration-500">
              <Logo size="lg" light={true} customImage={logoImage} />
            </div>

            <p className="mt-12 text-gray-400 text-xs tracking-[0.2em] uppercase font-bold text-center max-w-md">
              THE BRAND MARK OF MEANINGFUL DIGITAL CONSENT
            </p>
          </div>

        </div>
      </section>
    </motion.div>
  );
}
