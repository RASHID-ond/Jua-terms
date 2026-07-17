import React from "react";
import { TeamMember } from "../data/campaignData";

interface TeamCardProps {
  member: TeamMember;
  key?: string;
}

export default function TeamCard({ member }: TeamCardProps) {
  return (
    <div 
      className="group relative p-[4px] rounded-[32px] bg-gradient-to-br from-[#7ED957] to-[#8FC6E8] shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      id={`team-card-${member.name.replace(/\s+/g, "-").toLowerCase()}`}
    >
      {/* Inner card container with fixed height */}
      <div className="relative w-full h-[460px] rounded-[28px] overflow-hidden flex flex-col bg-slate-900">
        
        {/* Top Band: White background (approx 1/3) */}
        <div className="h-[145px] w-full bg-white transition-colors duration-300" />

        {/* Middle Band: Bright Lime-Green (approx 1/3) */}
        <div className="h-[145px] w-full bg-[#7ED957]" />

        {/* Bottom Band: Near-Black (approx 1/3) */}
        <div className="flex-1 w-full bg-[#111111]" />

        {/* Decorative corner accent blobs within the card behind the photo */}
        <div className="absolute top-4 left-4 w-12 h-12 rounded-tl-3xl bg-[#8FC6E8]/20 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-16 h-16 rounded-br-3xl bg-[#7ED957]/10 pointer-events-none" />

        {/* The Photo Cutout Layer: Spans all three bands, absolute bottom positioned */}
        <img
          src={member.image}
          alt={member.name}
          referrerPolicy="no-referrer"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[380px] w-auto max-w-[90%] object-contain object-bottom z-10 transition-transform duration-500 group-hover:scale-105 select-none"
        />

        {/* Overlapping Pill-Shaped Name Tag: straddles the green/black boundary (at 290px from top) */}
        <div 
          className="absolute top-[265px] left-1/2 -translate-x-1/2 z-20 min-w-[210px] max-w-[90%] bg-[#F1EFE7] rounded-full py-2 px-5 text-center shadow-lg border border-gray-100 flex flex-col items-center justify-center pointer-events-none transition-all duration-300 group-hover:bg-white group-hover:scale-105"
        >
          <span className="font-display font-extrabold text-[#101828] text-sm md:text-base tracking-tight leading-tight">
            {member.name}
          </span>
          <span className="font-sans italic text-xs text-[#4B5563] mt-0.5 font-medium">
            {member.role}
          </span>
        </div>

      </div>
    </div>
  );
}
