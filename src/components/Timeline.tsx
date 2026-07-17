import React from "react";
import { TimelineItem } from "../data/campaignData";

interface TimelineProps {
  items: TimelineItem[];
  idPrefix: string;
}

export default function Timeline({ items, idPrefix }: TimelineProps) {
  return (
    <div className="relative pl-6 md:pl-8 border-l border-gray-200 ml-4 py-2 space-y-8" id={`timeline-${idPrefix}`}>
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className="relative group transition-all duration-300 hover:translate-x-1"
          id={`timeline-item-${idPrefix}-${item.id}`}
        >
          {/* Circular ring marker: green-to-blue gradient stroke, hollow center, ~20px diameter */}
          <div className="absolute -left-[37px] md:-left-[45px] top-1.5 flex items-center justify-center">
            {/* Outer gradient background mask for 2px stroke */}
            <div className="w-[20px] h-[20px] rounded-full p-[2px] bg-gradient-to-br from-[#7ED957] to-[#8FC6E8] flex items-center justify-center shadow-sm">
              {/* Inner hollow background matching section backdrop (usually white or light) */}
              <div className="w-full h-full rounded-full bg-white transition-colors duration-300 group-hover:bg-[#7ED957]/15 flex items-center justify-center">
                {/* Micro dot in center for polish */}
                <div className="w-[4px] h-[4px] rounded-full bg-gradient-to-br from-[#7ED957] to-[#8FC6E8]"></div>
              </div>
            </div>
          </div>

          {/* Connected heading + description pair to the right */}
          <div className="flex flex-col items-start">
            {item.title ? (
              <h3 className="font-display font-extrabold text-[#101828] text-base md:text-lg tracking-tight mb-1 group-hover:text-[#0F2438] transition-colors">
                <span className="text-gray-400 mr-2 font-mono text-xs font-semibold">
                  {String(index + 1).padStart(2, "0")}.
                </span>
                {item.title}
              </h3>
            ) : null}
            
            <p className="font-sans text-[#4B5563] text-sm md:text-base leading-relaxed max-w-2xl font-normal">
              {!item.title && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#7ED957]/20 text-[#0F2438] font-mono text-[10px] font-bold mr-2">
                  {item.id}
                </span>
              )}
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
