-- ============================================================================
-- Jua Terms — seed the remaining content sections
-- Run this in the Supabase SQL Editor AFTER schema.sql.
-- Safe to re-run: uses ON CONFLICT DO NOTHING, so it will never overwrite
-- content you've already edited from the admin dashboard.
-- ============================================================================

insert into content (key, value) values

('about', '{
  "title": "About Us",
  "tagline": "Simplify \u00b7 Clarify \u00b7 Consent Starts with Clarity",
  "body": "Jua Terms is an advocacy campaign championing informed consent by calling for terms and conditions to be made simpler and clearer. It was launched under the Privacy First Campaign by Amnesty International Kenya and is a CIPESA grant-winning initiative."
}'::jsonb),

('visionMission', '{
  "vision": {
    "title": "Vision",
    "text": "A future where informed consent is the norm, enabled by simple, clear, and understandable terms and conditions."
  },
  "mission": {
    "title": "Mission",
    "items": [
      "Advocate for the simplification and clarification of terms and conditions to make informed consent meaningful.",
      "Educate individuals about their digital rights and the importance of understanding the agreements they accept.",
      "Influence policymakers, regulators, and digital service providers to adopt transparent, user-centered consent practices.",
      "Mobilize citizens, civil society, and partners to champion accountability, transparency, and respect for digital rights."
    ]
  },
  "images": [
    { "url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600&h=400", "alt": "Campaign session work" },
    { "url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600&h=400", "alt": "University campus briefing and discussion" }
  ]
}'::jsonb),

('focusAreas', '{
  "title": "Our Focus Areas",
  "subheading": "Consent Starts with Clarity.",
  "image": "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=600&h=800",
  "items": [
    { "id": 1, "description": "We engage university students to champion informed consent and digital rights." },
    { "id": 2, "description": "We call on technology companies to use clear, simple, and transparent terms and conditions." },
    { "id": 3, "description": "We help people understand the importance of reading and questioning the terms they accept." },
    { "id": 4, "description": "We advocate for policies that promote transparency, accountability, and meaningful informed consent." }
  ]
}'::jsonb),

('approach', '{
  "title": "Our Approach",
  "subheading": "We promote clear, accessible, and understandable terms and conditions for all users.",
  "image": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=600&h=800",
  "items": [
    { "id": 1, "description": "We promote translations, sign language, and other accessible formats." },
    { "id": 2, "description": "We encourage short videos, animations, and infographics to explain complex terms." },
    { "id": 3, "description": "We believe one approach does not fit everyone." },
    { "id": 4, "description": "We champion transparency and informed consent for all users." },
    { "id": 5, "description": "We advocate for terms and conditions that are simple, clear, and easy to understand." }
  ]
}'::jsonb),

('events', '{
  "title": "Our Events",
  "subheading": "We have engaged universities and stakeholders through key dialogues and public engagements on digital consent and data rights.",
  "items": [
    { "id": 1, "title": "Mount Kenya University Pre-Launch Event", "description": "Introduction of the campaign to university students and stakeholders." },
    { "id": 2, "title": "CUEA Pre-Launch Event", "description": "Engagement with students on informed consent and digital rights." },
    { "id": 3, "title": "Digital Consent General Assembly", "description": "A multi-stakeholder dialogue on digital consent. A resolution was passed in collaboration with KMNUN." },
    { "id": 4, "title": "Campaign Launch", "description": "Official launch of Jua Terms and its advocacy agenda." }
  ]
}'::jsonb),

('highlights', '{
  "title": "Campaign Highlights",
  "subheading": "Key milestones and engagements driving awareness and action on digital consent.",
  "quote": "Every engagement is guided by clarity, purpose, and impact.",
  "images": [
    {
      "url": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600&h=450",
      "alt": "Interactive group discussion",
      "title": "CUEA Student Roundtables",
      "date": "May 2024",
      "location": "CUEA Campus, Nairobi",
      "category": "University Dialogues",
      "description": "Interactive peer-to-peer discussions focused on decoding complex digital privacy agreements and finding practical ways to assert digital dignity on campus.",
      "impact": "Mobilized 150+ student advocates to champion terms clarification and campus-wide rights awareness."
    },
    {
      "url": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600&h=450",
      "alt": "Dialogue presentation and ceremony",
      "title": "CIPESA Grant Recognition",
      "date": "September 2024",
      "location": "Nairobi, Kenya",
      "category": "Milestones",
      "description": "Jua Terms was honored as a recipient of the prestigious CIPESA grant, recognizing our unique, youth-focused strategy for translating and simplifying complex digital terms of service in East Africa.",
      "impact": "Secured vital institutional funding and connected Jua Terms to a broad regional digital rights network."
    },
    {
      "url": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600&h=450",
      "alt": "Campaign launch stakeholder panel",
      "title": "Official Jua Terms Launch Panel",
      "date": "November 2024",
      "location": "Amnesty International HQ, Nairobi",
      "category": "Stakeholder Forums",
      "description": "A collaborative launch event and panel featuring data protection experts, legal practitioners, civil society representatives, and digital rights defenders outlining our primary advocacy pillars.",
      "impact": "Established a collaborative memorandum on digital consent standards signed by university and legal society representatives."
    },
    {
      "url": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600&h=450",
      "alt": "Educational classroom interactive training",
      "title": "MKU Campus Advocacy Lecture",
      "date": "October 2024",
      "location": "Mount Kenya University, Thika",
      "category": "University Dialogues",
      "description": "A deep-dive educational workshop focusing on user rights, terms of service design, and digital literacy. Students participated in a mock testing session for simplified legal summaries.",
      "impact": "Formally launched the first MKU Student Chapter for Jua Terms, registering over 400 active student members."
    }
  ]
}'::jsonb),

('team', '[
  { "name": "Abigael Goko", "role": "Administration Coordinator", "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=500" },
  { "name": "Benjamin Kyamoneka", "role": "Research Coordinator", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=500" },
  { "name": "Belinda Njeri", "role": "Operations Coordinator", "image": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=500" },
  { "name": "George N. Bush", "role": "Creative Coordinator", "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=500" }
]'::jsonb),

('partners', '[
  { "name": "Amnesty International Kenya", "logoPlaceholder": "AIK" },
  { "name": "CIPESA", "logoPlaceholder": "CIPESA" },
  { "name": "The Catholic University of Eastern Africa (CUEA)", "logoPlaceholder": "CUEA" },
  { "name": "Law & Behold", "logoPlaceholder": "L&B" },
  { "name": "Data Privacy and Governance Students Association", "logoPlaceholder": "DPGSA" },
  { "name": "Data Privacy and Governance Society of Kenya (DPGSK)", "logoPlaceholder": "DPGSK" },
  { "name": "Mount Kenya University (MKU)", "logoPlaceholder": "MKU" },
  { "name": "Kenya MUN", "logoPlaceholder": "Kenya MUN" }
]'::jsonb),

('footer', '{
  "heading": "Thank You",
  "text": "Thank you for your continued support and engagement in advancing digital rights and informed consent. We appreciate your commitment to building a more transparent and inclusive digital space.",
  "groupPhoto": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800&h=800"
}'::jsonb)

on conflict (key) do nothing;
