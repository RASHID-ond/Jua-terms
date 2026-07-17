import React from "react";
import { Sparkles, Quote } from "lucide-react";
import { motion } from "motion/react";

interface CampaignHighlightsSectionProps {
  title?: string;
  subheading?: string;
  quote?: string;
}

export default function CampaignHighlightsSection({ title, subheading, quote }: CampaignHighlightsSectionProps) {
  const displayTitle = title || "Campaign Highlights";
  const displaySubheading = subheading || "Key milestones and engagements driving awareness and action on digital consent.";
  const displayQuote = quote || "“Every engagement is guided by clarity, purpose, and impact.”";

  return (
    <section 
      id="campaign-highlights" 
      className="min-h-[500px] bg-[#FFF7ED] flex items-center justify-center py-24 px-6 md:px-12 font-sans relative overflow-hidden"
    >
      {/* Decorative subtle visual elements using primary accent #F97316 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#EA580C]/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Centered max-width container (1200px) */}
      <div className="w-full max-w-[1200px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column (about 60% width) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            
            {/* Visual tag featuring the primary accent color #F97316 */}
            <div className="inline-flex items-center gap-2 self-start bg-[#F97316]/10 text-[#F97316] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Advocacy Milestones</span>
            </div>
            
            {/* Main Heading: 48px, font-weight 800, color #111827 */}
            <h2 className="text-[#111827] text-[36px] sm:text-[48px] font-extrabold font-sans leading-tight tracking-tight uppercase">
              {displayTitle}
            </h2>
            
            {/* Decorative accent divider */}
            <div className="w-20 h-1 bg-[#F97316] rounded-full" />
            
            {/* Subheading Paragraph: 18px, line-height 1.7, color #4B5563 */}
            <p className="text-[#4B5563] text-[18px] leading-[1.7] font-sans font-normal max-w-xl">
              {displaySubheading}
            </p>
          </div>
          
          {/* Right Column (about 40% width) - Vertically Centered */}
          <div className="lg:col-span-5 flex items-center justify-center">
            
            {/* Quote Card with rounded corners (24px radius), background #EA580C, white text, and subtle shadow */}
            {/* Includes smooth hover animation (translateY(-4px) and slightly stronger shadow) via Framer Motion & CSS */}
            <motion.div
              whileHover={{ 
                y: -4, 
                boxShadow: "0 20px 25px -5px rgba(234, 88, 12, 0.25), 0 8px 10px -6px rgba(234, 88, 12, 0.25)" 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="w-full bg-[#EA580C] text-white p-8 md:p-10 rounded-[24px] shadow-lg relative overflow-hidden group cursor-pointer transition-shadow duration-300"
            >
              {/* Corner decorative light effect */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/10 rounded-full blur-lg group-hover:scale-110 transition-transform duration-500" />
              
              {/* Large quote mark icon as watermark */}
              <div className="absolute right-6 top-6 text-white/5 group-hover:text-white/10 transition-colors duration-500">
                <Quote className="w-16 h-16 stroke-[1.5]" />
              </div>
 
              {/* Flex wrapper for the quote text */}
              <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                
                {/* Quote Text: 28px, font-weight 700, line-height 1.4 */}
                <p className="text-white text-[24px] sm:text-[28px] font-bold font-sans leading-[1.4] tracking-tight">
                  {displayQuote.startsWith("“") || displayQuote.startsWith('"') ? displayQuote : `“${displayQuote}”`}
                </p>
                
                {/* Footer source indicator */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/20">
                  <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center font-sans font-black text-xs text-white">
                    JT
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-white">
                      Jua Terms Campaign
                    </span>
                    <span className="block text-[10px] text-white/70 uppercase tracking-widest font-mono">
                      Privacy First, East Africa
                    </span>
                  </div>
                </div>
 
              </div>
            </motion.div>
            
          </div>
 
        </div>
      </div>
    </section>
  );
}
