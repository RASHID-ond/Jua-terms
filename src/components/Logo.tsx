import React from "react";

interface LogoProps {
  light?: boolean; // If true, rendering on a dark background (text is cream). If false, rendering on light background (text is navy).
  size?: "sm" | "md" | "lg";
  customImage?: string; // Optional custom logo image URL
}

export default function Logo({ light = true, size = "md", customImage }: LogoProps) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  // Sizing styles
  const containerClasses = "flex items-center font-sans select-none";
  const taglineClasses = `tracking-[0.25em] uppercase font-bold text-gray-400 font-display ${
    isSm ? "text-[8px] mb-0.5" : isLg ? "text-xs mb-1.5" : "text-[10px] mb-1"
  }`;
  
  const textTermsClasses = `font-display font-extrabold ${
    light ? "text-[#F1EFE7]" : "text-[#0F2438]"
  } ${isSm ? "text-xl" : isLg ? "text-5xl" : "text-3xl"}`;

  const textContainerClasses = `flex flex-col items-start justify-center ${
    isSm ? "ml-1.5" : isLg ? "ml-4" : "ml-2.5"
  }`;

  // SVG Sizing
  const svgWidth = isSm ? 44 : isLg ? 100 : 64;
  const svgHeight = isSm ? 44 : isLg ? 100 : 64;

  return (
    <div className={containerClasses} id={`jua-logo-${size}`}>
      {customImage ? (
        <div 
          className="overflow-hidden flex items-center justify-center rounded-full bg-white border-2 border-[#7ED957] shrink-0"
          style={{ width: svgWidth, height: svgHeight }}
        >
          <img src={customImage} alt="Brand Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      ) : (
        /* Magnifying glass inline SVG */
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          {/* Magnifying Glass Handle - extends diagonally down-right ending in rounded tip */}
          <line
            x1="66"
            y1="66"
            x2="88"
            y2="88"
            stroke="#7ED957"
            strokeWidth={isSm ? "12" : isLg ? "11" : "11"}
            strokeLinecap="round"
          />
          
          {/* Magnifying Glass Lens - Solid bright-green circle */}
          <circle
            cx="44"
            cy="44"
            r="32"
            fill="#7ED957"
          />
          
          {/* "JUA" Text inside the lens */}
          <text
            x="44"
            y="51"
            textAnchor="middle"
            fill="#0F2438"
            fontSize="19"
            fontFamily="var(--font-display), Poppins, sans-serif"
            fontWeight="800"
          >
            JUA
          </text>
        </svg>
      )}

      {/* Vertical stack containing tagline and TERMS wordmark */}
      <div className={textContainerClasses}>
        {/* Tagline "SIMPLIFY · CLARIFY" placed directly above the span TERMS */}
        <span className={taglineClasses}>Simplify · Clarify</span>
        {/* "TERMS" Wordmark */}
        <span className={textTermsClasses}>TERMS</span>
      </div>
    </div>
  );
}
