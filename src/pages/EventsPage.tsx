import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import Timeline from "../components/Timeline";
import { CAMPAIGN_EVENTS } from "../data/campaignData";
import { applySeoDescription } from "../utils/seo";
import { fetchContent } from "../lib/content";

export default function EventsPage() {
  const [events, setEvents] = useState(CAMPAIGN_EVENTS);

  useEffect(() => {
    document.title = "Our Events | Jua Terms";
    fetchContent()
      .then((data) => {
        if (data.events) setEvents(data.events);
        if (data.siteSettings) applySeoDescription(data.siteSettings);
      })
      .catch((err) => {
        console.log("Database fetch failed or not initialized. Using static campaignData fallbacks.", err);
      });
  }, []);

  return (
    <motion.div
      key="events"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
    >
      {/* ---------------------------------------------------- */}
      {/* SECTION F: OUR EVENTS */}
      {/* ---------------------------------------------------- */}
      <section id="events" className="py-20 bg-[#F1EFE7]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#4B5563] block mb-2">
              Milestones & Stakeholder engagement
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-[#0F2438] uppercase mb-2">
              <span className="editorial-header-underline">{events.title}</span>
            </h2>
            <p className="text-base text-gray-500 font-bold mt-4">
              {events.subheading}
            </p>
          </div>

          {/* Timeline List */}
          <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl border border-black/5">
            <Timeline items={events.items} idPrefix="events" />
          </div>

        </div>
      </section>
    </motion.div>
  );
}
