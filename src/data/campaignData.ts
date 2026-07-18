export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export interface TimelineItem {
  id: number;
  title?: string;
  description: string;
}

export interface Partner {
  name: string;
  logoPlaceholder: string;
}

export const CAMPAIGN_ABOUT = {
  title: "About Us",
  tagline: "Simplify · Clarify · Consent Starts with Clarity",
  body: "Jua Terms is an advocacy campaign championing informed consent by calling for terms and conditions to be made simpler and clearer. It was launched under the Privacy First Campaign by Amnesty International Kenya and is a CIPESA grant-winning initiative."
};

export const CAMPAIGN_VISION_MISSION = {
  vision: {
    title: "Vision",
    text: "A future where informed consent is the norm, enabled by simple, clear, and understandable terms and conditions."
  },
  mission: {
    title: "Mission",
    items: [
      "Advocate for the simplification and clarification of terms and conditions to make informed consent meaningful.",
      "Educate individuals about their digital rights and the importance of understanding the agreements they accept.",
      "Influence policymakers, regulators, and digital service providers to adopt transparent, user-centered consent practices.",
      "Mobilize citizens, civil society, and partners to champion accountability, transparency, and respect for digital rights."
    ]
  },
  images: [
    {
      url: "",
      alt: "Campaign session work"
    },
    {
      url: "",
      alt: "University campus briefing and discussion"
    }
  ]
};

export const CAMPAIGN_FOCUS_AREAS = {
  title: "Our Focus Areas",
  subheading: "Consent Starts with Clarity.",
  image: "",
  items: [
    { id: 1, description: "We engage university students to champion informed consent and digital rights." },
    { id: 2, description: "We call on technology companies to use clear, simple, and transparent terms and conditions." },
    { id: 3, description: "We help people understand the importance of reading and questioning the terms they accept." },
    { id: 4, description: "We advocate for policies that promote transparency, accountability, and meaningful informed consent." }
  ]
};

export const CAMPAIGN_APPROACH = {
  title: "Our Approach",
  subheading: "We promote clear, accessible, and understandable terms and conditions for all users.",
  image: "",
  items: [
    { id: 1, description: "We promote translations, sign language, and other accessible formats." },
    { id: 2, description: "We encourage short videos, animations, and infographics to explain complex terms." },
    { id: 3, description: "We believe one approach does not fit everyone." },
    { id: 4, description: "We champion transparency and informed consent for all users." },
    { id: 5, description: "We advocate for terms and conditions that are simple, clear, and easy to understand." }
  ]
};

export const CAMPAIGN_EVENTS = {
  title: "Our Events",
  subheading: "We have engaged universities and stakeholders through key dialogues and public engagements on digital consent and data rights.",
  items: [
    {
      id: 1,
      title: "Mount Kenya University Pre-Launch Event",
      description: "Introduction of the campaign to university students and stakeholders."
    },
    {
      id: 2,
      title: "CUEA Pre-Launch Event",
      description: "Engagement with students on informed consent and digital rights."
    },
    {
      id: 3,
      title: "Digital Consent General Assembly",
      description: "A multi-stakeholder dialogue on digital consent. A resolution was passed in collaboration with KMNUN."
    },
    {
      id: 4,
      title: "Campaign Launch",
      description: "Official launch of Jua Terms and its advocacy agenda."
    }
  ]
};

export const CAMPAIGN_HIGHLIGHTS = {
  title: "Campaign Highlights",
  subheading: "Key milestones and engagements driving awareness and action on digital consent.",
  quote: "Every engagement is guided by clarity, purpose, and impact.",
  images: [
    {
      url: "",
      alt: "Interactive group discussion",
      title: "CUEA Student Roundtables",
      date: "May 2024",
      location: "CUEA Campus, Nairobi",
      category: "University Dialogues",
      description: "Interactive peer-to-peer discussions focused on decoding complex digital privacy agreements and finding practical ways to assert digital dignity on campus.",
      impact: "Mobilized 150+ student advocates to champion terms clarification and campus-wide rights awareness."
    },
    {
      url: "",
      alt: "Dialogue presentation and ceremony",
      title: "CIPESA Grant Recognition",
      date: "September 2024",
      location: "Nairobi, Kenya",
      category: "Milestones",
      description: "Jua Terms was honored as a recipient of the prestigious CIPESA grant, recognizing our unique, youth-focused strategy for translating and simplifying complex digital terms of service in East Africa.",
      impact: "Secured vital institutional funding and connected Jua Terms to a broad regional digital rights network."
    },
    {
      url: "",
      alt: "Campaign launch stakeholder panel",
      title: "Official Jua Terms Launch Panel",
      date: "November 2024",
      location: "Amnesty International HQ, Nairobi",
      category: "Stakeholder Forums",
      description: "A collaborative launch event and panel featuring data protection experts, legal practitioners, civil society representatives, and digital rights defenders outlining our primary advocacy pillars.",
      impact: "Established a collaborative memorandum on digital consent standards signed by university and legal society representatives."
    },
    {
      url: "",
      alt: "Educational classroom interactive training",
      title: "MKU Campus Advocacy Lecture",
      date: "October 2024",
      location: "Mount Kenya University, Thika",
      category: "University Dialogues",
      description: "A deep-dive educational workshop focusing on user rights, terms of service design, and digital literacy. Students participated in a mock testing session for simplified legal summaries.",
      impact: "Formally launched the first MKU Student Chapter for Jua Terms, registering over 400 active student members."
    }
  ]
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Abigael Goko",
    role: "Administration Coordinator",
    // Premium professional black female portrait
    image: ""
  },
  {
    name: "Benjamin Kyamoneka",
    role: "Research Coordinator",
    // Friendly smiling young black male portrait
    image: ""
  },
  {
    name: "Belinda Njeri",
    role: "Operations Coordinator",
    // Confident smiling young black female portrait
    image: ""
  },
  {
    name: "George N. Bush",
    role: "Creative Coordinator",
    // Modern young African male portrait
    image: ""
  }
];

export const PARTNERS: Partner[] = [
  { name: "Amnesty International Kenya", logoPlaceholder: "AIK" },
  { name: "CIPESA", logoPlaceholder: "CIPESA" },
  { name: "The Catholic University of Eastern Africa (CUEA)", logoPlaceholder: "CUEA" },
  { name: "Law & Behold", logoPlaceholder: "L&B" },
  { name: "Data Privacy and Governance Students Association", logoPlaceholder: "DPGSA" },
  { name: "Data Privacy and Governance Society of Kenya (DPGSK)", logoPlaceholder: "DPGSK" },
  { name: "Mount Kenya University (MKU)", logoPlaceholder: "MKU" },
  { name: "Kenya MUN", logoPlaceholder: "Kenya MUN" }
];

export const CAMPAIGN_CONTACT = {
  title: "Contact Us",
  subheading: "Get in Touch",
  address: "Nairobi, Kenya",
  phone: "+254-740-834265",
  email: "juaterms@gmail.com",
  social: "@juaterms"
};

export const FOOTER_THANK_YOU = {
  heading: "Thank You",
  text: "Thank you for your continued support and engagement in advancing digital rights and informed consent. We appreciate your commitment to building a more transparent and inclusive digital space.",
  groupPhoto: ""
};
