import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Database Configuration
const DB_PATH = path.join(process.cwd(), "src", "data", "db.json");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required but was not set.");
}

const PORT = 3000;

// Helper to ensure database is initialized
function initDatabase() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const defaultDb = {
      siteSettings: {
        address: "Nairobi, Kenya",
        phone: "+254-740-834265",
        email: "juaterms@gmail.com",
        social: "@juaterms",
        heroTitle: "JUA TERMS PROFILE",
        heroSubtitle: "Simplify. Clarify. Champion Informed Consent.",
        seoTitle: "Jua Terms - Digital Rights Advocacy Campaign",
        seoDescription: "Advocating for simpler, clearer terms and conditions to enable meaningful informed consent."
      },
      about: {
        body: "Jua Terms is an advocacy campaign championing informed consent by calling for terms and conditions to be made simpler and clearer. It was launched under the Privacy First Campaign by Amnesty International Kenya and is a CIPESA grant-winning initiative."
      },
      visionMission: {
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
            url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600&h=400",
            alt: "Campaign session work"
          },
          {
            url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600&h=400",
            alt: "University campus briefing and discussion"
          }
        ]
      },
      focusAreas: {
        title: "Our Focus Areas",
        subheading: "Consent Starts with Clarity.",
        image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=600&h=800",
        items: [
          { id: 1, description: "We engage university students to champion informed consent and digital rights." },
          { id: 2, description: "We call on technology companies to use clear, simple, and transparent terms and conditions." },
          { id: 3, description: "We help people understand the importance of reading and questioning the terms they accept." },
          { id: 4, description: "We advocate for policies that promote transparency, accountability, and meaningful informed consent." }
        ]
      },
      approach: {
        title: "Our Approach",
        subheading: "We promote clear, accessible, and understandable terms and conditions for all users.",
        image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=600&h=800",
        items: [
          { id: 1, description: "We promote translations, sign language, and other accessible formats." },
          { id: 2, description: "We encourage short videos, animations, and infographics to explain complex terms." },
          { id: 3, description: "We believe one approach does not fit everyone." },
          { id: 4, description: "We champion transparency and informed consent for all users." },
          { id: 5, description: "We advocate for terms and conditions that are simple, clear, and easy to understand." }
        ]
      },
      events: {
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
      },
      highlights: {
        title: "Campaign Highlights",
        subheading: "Key milestones and engagements driving awareness and action on digital consent.",
        quote: "Every engagement is guided by clarity, purpose, and impact.",
        images: [
          {
            url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600&h=450",
            alt: "Interactive group discussion",
            title: "CUEA Student Roundtables",
            date: "May 2024",
            location: "CUEA Campus, Nairobi",
            category: "University Dialogues",
            description: "Interactive peer-to-peer discussions focused on decoding complex digital privacy agreements and finding practical ways to assert digital dignity on campus.",
            impact: "Mobilized 150+ student advocates to champion terms clarification and campus-wide rights awareness."
          },
          {
            url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600&h=450",
            alt: "Dialogue presentation and ceremony",
            title: "CIPESA Grant Recognition",
            date: "September 2024",
            location: "Nairobi, Kenya",
            category: "Milestones",
            description: "Jua Terms was honored as a recipient of the prestigious CIPESA grant, recognizing our unique, youth-focused strategy for translating and simplifying complex digital terms of service in East Africa.",
            impact: "Secured vital institutional funding and connected Jua Terms to a broad regional digital rights network."
          },
          {
            url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600&h=450",
            alt: "Campaign launch stakeholder panel",
            title: "Official Jua Terms Launch Panel",
            date: "November 2024",
            location: "Amnesty International HQ, Nairobi",
            category: "Stakeholder Forums",
            description: "A collaborative launch event and panel featuring data protection experts, legal practitioners, civil society representatives, and digital rights defenders outlining our primary advocacy pillars.",
            impact: "Established a collaborative memorandum on digital consent standards signed by university and legal society representatives."
          },
          {
            url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600&h=450",
            alt: "Educational classroom interactive training",
            title: "MKU Campus Advocacy Lecture",
            date: "October 2024",
            location: "Mount Kenya University, Thika",
            category: "University Dialogues",
            description: "A deep-dive educational workshop focusing on user rights, terms of service design, and digital literacy. Students participated in a mock testing session for simplified legal summaries.",
            impact: "Formally launched the first MKU Student Chapter for Jua Terms, registering over 400 active student members."
          }
        ]
      },
      team: [
        {
          name: "Abigael Goko",
          role: "Administration Coordinator",
          image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=500",
          active: true
        },
        {
          name: "Benjamin Kyamoneka",
          role: "Research Coordinator",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=500",
          active: true
        },
        {
          name: "Belinda Njeri",
          role: "Operations Coordinator",
          image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=500",
          active: true
        },
        {
          name: "George N. Bush",
          role: "Creative Coordinator",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=500",
          active: true
        }
      ],
      partners: [
        { name: "Amnesty International Kenya", logoPlaceholder: "AIK" },
        { name: "CIPESA", logoPlaceholder: "CIPESA" },
        { name: "The Catholic University of Eastern Africa (CUEA)", logoPlaceholder: "CUEA" },
        { name: "Law & Behold", logoPlaceholder: "L&B" },
        { name: "Data Privacy and Governance Students Association", logoPlaceholder: "DPGSA" },
        { name: "Data Privacy and Governance Society of Kenya (DPGSK)", logoPlaceholder: "DPGSK" },
        { name: "Mount Kenya University (MKU)", logoPlaceholder: "MKU" },
        { name: "Kenya MUN", logoPlaceholder: "Kenya MUN" }
      ],
      footer: {
        heading: "Thank You",
        text: "Thank you for your continued support and engagement in advancing digital rights and informed consent. We appreciate your commitment to building a more transparent and inclusive digital space.",
        groupPhoto: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800&h=800"
      },
      contactMessages: [],
      adminUsers: [],
      auditLogs: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf-8");
  }
}

initDatabase();

// Database Reading / Writing Utilities
function readDb() {
  initDatabase();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function logAudit(email: string, action: string) {
  const db = readDb();
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: Date.now().toString(),
    user: email,
    action,
    timestamp: new Date().toISOString()
  });
  // Keep last 100 entries
  if (db.auditLogs.length > 100) {
    db.auditLogs = db.auditLogs.slice(0, 100);
  }
  writeDb(db);
}

// Very simple in-memory brute-force guard for login attempts.
// Keyed by lowercased email; resets after a successful login or after the lockout window passes.
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes
const loginAttempts = new Map<string, { count: number; firstAttempt: number; lockedUntil?: number }>();

function getLoginLockStatus(key: string) {
  const entry = loginAttempts.get(key);
  if (!entry) return { locked: false };
  if (entry.lockedUntil && entry.lockedUntil > Date.now()) {
    return { locked: true, retryAfterMs: entry.lockedUntil - Date.now() };
  }
  if (entry.lockedUntil && entry.lockedUntil <= Date.now()) {
    loginAttempts.delete(key);
  }
  return { locked: false };
}

function recordFailedLogin(key: string) {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now - entry.firstAttempt > LOGIN_LOCKOUT_MS) {
    loginAttempts.set(key, { count: 1, firstAttempt: now });
    return;
  }
  entry.count += 1;
  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOGIN_LOCKOUT_MS;
  }
  loginAttempts.set(key, entry);
}

function clearLoginAttempts(key: string) {
  loginAttempts.delete(key);
}

// Upload validation constants
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml"
]);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "8mb" }));

  // Return clean JSON errors for oversized or malformed request bodies
  // instead of Express's default HTML error page.
  app.use((err: any, req: any, res: any, next: any) => {
    if (err && err.type === "entity.too.large") {
      return res.status(413).json({ error: "Upload is too large. Please use a smaller file." });
    }
    if (err && err.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Malformed request body." });
    }
    next(err);
  });

  // CORS or simple cookies headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    next();
  });

  // Authentication Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token is required" });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ error: "Token is expired or invalid" });
      }
      req.user = user;
      next();
    });
  };

  // API ROUTES

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Auth: Setup Status
  app.get("/api/auth/setup-status", (req, res) => {
    try {
      const db = readDb();
      const setupRequired = !db.adminUsers || db.adminUsers.length === 0;
      res.json({ setupRequired });
    } catch (e) {
      res.status(500).json({ error: "Failed to check setup status" });
    }
  });

  // Auth: Setup first admin
  app.post("/api/auth/setup", async (req: any, res: any) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    try {
      const db = readDb();
      if (db.adminUsers && db.adminUsers.length > 0) {
        return res.status(403).json({ error: "Setup already completed" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const firstAdmin = {
        id: Date.now().toString(),
        email,
        passwordHash,
        name,
        role: "Super Admin",
        active: true
      };

      if (!db.adminUsers) db.adminUsers = [];
      db.adminUsers.push(firstAdmin);
      writeDb(db);
      logAudit(email, "First-time super admin created during setup");

      res.json({ success: true, message: "Super Admin account created successfully" });
    } catch (e) {
      res.status(500).json({ error: "Failed to complete setup" });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", async (req: any, res: any) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const loginKey = String(email).toLowerCase().trim();
    const lockStatus = getLoginLockStatus(loginKey);
    if (lockStatus.locked) {
      const retryMinutes = Math.ceil((lockStatus.retryAfterMs || 0) / 60000);
      return res.status(429).json({
        error: `Too many failed login attempts. Please try again in about ${retryMinutes} minute(s).`
      });
    }

    try {
      const db = readDb();
      const user = db.adminUsers.find((u: any) => u.email === email && u.active !== false);
      if (!user) {
        recordFailedLogin(loginKey);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        recordFailedLogin(loginKey);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      clearLoginAttempts(loginKey);

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: "4h" }
      );

      logAudit(user.email, "Logged in successfully");

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (e) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Auth: Get current profile
  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  // Public: Get all campaign content
  app.get("/api/content", (req, res) => {
    try {
      const db = readDb();
      // Don't send passwords, contact messages, and logs to general public
      const { adminUsers, contactMessages, auditLogs, ...publicContent } = db;
      res.json(publicContent);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Admin: Update content
  app.put("/api/content", authenticateToken, (req: any, res) => {
    try {
      const db = readDb();
      const {
        siteSettings,
        about,
        visionMission,
        focusAreas,
        approach,
        events,
        highlights,
        team,
        partners,
        footer
      } = req.body;

      if (siteSettings) db.siteSettings = siteSettings;
      if (about) db.about = about;
      if (visionMission) db.visionMission = visionMission;
      if (focusAreas) db.focusAreas = focusAreas;
      if (approach) db.approach = approach;
      if (events) db.events = events;
      if (highlights) db.highlights = highlights;
      if (team) db.team = team;
      if (partners) db.partners = partners;
      if (footer) db.footer = footer;

      writeDb(db);
      logAudit(req.user.email, "Updated site content settings");
      res.json({ message: "Content updated successfully" });
    } catch (e) {
      res.status(500).json({ error: "Failed to update content" });
    }
  });

  // Public: Submit a message
  app.post("/api/messages", (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const db = readDb();
      if (!db.contactMessages) db.contactMessages = [];

      const newMessage = {
        id: Date.now().toString(),
        name,
        email,
        message,
        date: new Date().toISOString(),
        read: false
      };

      db.contactMessages.unshift(newMessage);
      writeDb(db);
      res.json({ message: "Message sent successfully" });
    } catch (e) {
      res.status(500).json({ error: "Failed to save message" });
    }
  });

  // Admin: Get contact messages
  app.get("/api/messages", authenticateToken, (req, res) => {
    try {
      const db = readDb();
      res.json(db.contactMessages || []);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Admin: Mark message as read / delete message
  app.put("/api/messages/:id", authenticateToken, (req: any, res) => {
    try {
      const db = readDb();
      const msgId = req.params.id;
      const { read } = req.body;

      db.contactMessages = (db.contactMessages || []).map((m: any) => {
        if (m.id === msgId) {
          return { ...m, read: read ?? true };
        }
        return m;
      });

      writeDb(db);
      res.json({ message: "Message status updated" });
    } catch (e) {
      res.status(500).json({ error: "Failed to update message" });
    }
  });

  app.delete("/api/messages/:id", authenticateToken, (req: any, res) => {
    try {
      const db = readDb();
      const msgId = req.params.id;

      db.contactMessages = (db.contactMessages || []).filter((m: any) => m.id !== msgId);
      writeDb(db);
      logAudit(req.user.email, `Deleted contact message ID ${msgId}`);
      res.json({ message: "Message deleted successfully" });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  // Admin: Get Audit Logs
  app.get("/api/audit-logs", authenticateToken, (req, res) => {
    try {
      const db = readDb();
      res.json(db.auditLogs || []);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // Admin Users CRUD (Super Admin Only)
  app.get("/api/admins", authenticateToken, (req: any, res) => {
    try {
      if (req.user.role !== "Super Admin") {
        return res.status(403).json({ error: "Super Admin privileges required" });
      }
      const db = readDb();
      // Strip passwords
      const safeAdmins = db.adminUsers.map(({ passwordHash, ...rest }: any) => rest);
      res.json(safeAdmins);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch admins" });
    }
  });

  app.post("/api/admins", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== "Super Admin") {
        return res.status(403).json({ error: "Super Admin privileges required" });
      }

      const { email, password, name, role } = req.body;
      if (!email || !password || !name || !role) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const db = readDb();
      if (db.adminUsers.some((u: any) => u.email === email)) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newAdmin = {
        id: Date.now().toString(),
        email,
        passwordHash,
        name,
        role,
        active: true
      };

      db.adminUsers.push(newAdmin);
      writeDb(db);
      logAudit(req.user.email, `Created new admin user: ${email} (${role})`);
      res.json({ message: "Admin user created successfully" });
    } catch (e) {
      res.status(500).json({ error: "Failed to create admin" });
    }
  });

  app.delete("/api/admins/:id", authenticateToken, (req: any, res) => {
    try {
      if (req.user.role !== "Super Admin") {
        return res.status(403).json({ error: "Super Admin privileges required" });
      }

      const db = readDb();
      const targetId = req.params.id;

      if (targetId === req.user.id) {
        return res.status(400).json({ error: "You cannot delete your own account" });
      }

      db.adminUsers = db.adminUsers.filter((u: any) => u.id !== targetId);
      writeDb(db);
      logAudit(req.user.email, `Deleted admin user ID: ${targetId}`);
      res.json({ message: "Admin user deleted successfully" });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete admin" });
    }
  });

  // Admin: Upload image (saves to ./assets folder as static file)
  app.post("/api/upload", authenticateToken, (req: any, res) => {
    try {
      const { filename, base64 } = req.body;
      if (!filename || !base64) {
        return res.status(400).json({ error: "Filename and base64 data are required" });
      }

      const matches = base64.match(/^data:([A-Za-z0-9-+\/.]+);base64,(.+)$/);
      let buffer: Buffer;
      let mimeType: string | null = null;
      if (matches && matches.length === 3) {
        mimeType = matches[1].toLowerCase();
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(base64, "base64");
      }

      // Only allow known image types. If no data-URL prefix was present we cannot
      // verify the type, so reject rather than trust the client-supplied filename.
      if (!mimeType || !ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
        return res.status(400).json({
          error: "Unsupported file type. Please upload a PNG, JPG, WEBP, GIF, or SVG image."
        });
      }

      if (buffer.length > MAX_UPLOAD_BYTES) {
        return res.status(400).json({
          error: `Image is too large. Maximum allowed size is ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB.`
        });
      }

      const assetsDir = path.join(process.cwd(), "assets");
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      const safeFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
      const filePath = path.join(assetsDir, safeFilename);

      fs.writeFileSync(filePath, buffer);
      
      const fileUrl = `/assets/${safeFilename}`;
      logAudit(req.user.email, `Uploaded image: ${safeFilename}`);
      res.json({ url: fileUrl });
    } catch (e) {
      res.status(500).json({ error: "Image upload failed" });
    }
  });

  // Client assets / routing fallback handler
  app.use("/assets", express.static(path.join(process.cwd(), "assets")));

  if (process.env.NODE_ENV !== "production") {
    // Integrate Vite dev server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback: render index.html for all page loads
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
