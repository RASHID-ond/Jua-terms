import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import TeamCard from "../components/TeamCard";
import { TEAM_MEMBERS } from "../data/campaignData";
import { applySeoDescription } from "../utils/seo";

export default function TeamPage() {
  const [team, setTeam] = useState(TEAM_MEMBERS);

  useEffect(() => {
    document.title = "Our Team | Jua Terms";
    fetch("/api/content")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Unable to fetch content");
      })
      .then((data) => {
        if (data.team) setTeam(data.team);
        if (data.siteSettings) applySeoDescription(data.siteSettings);
      })
      .catch((err) => {
        console.log("Database fetch failed or not initialized. Using static campaignData fallbacks.", err);
      });
  }, []);

  return (
    <motion.div
      key="team"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
    >
      {/* ---------------------------------------------------- */}
      {/* SECTION H: TEAM MEMBERS */}
      {/* ---------------------------------------------------- */}
      <section id="team" className="py-20 bg-[#F1EFE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#4B5563] block mb-2">
              Meet our energetic campaign coordinators
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-[#0F2438] uppercase mb-2">
              <span className="editorial-header-underline">Our Best Team</span>
            </h2>
          </div>

          {/* Responsive team cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" id="team-grid">
            {team.map((member) => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>

        </div>
      </section>
    </motion.div>
  );
}
