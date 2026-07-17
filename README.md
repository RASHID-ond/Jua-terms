# Jua Terms — Digital Rights Advocacy Campaign

Jua Terms is a fully responsive digital rights marketing website and campaign content management system designed to advocate for simpler and clearer digital agreements, promoting informed consent across East Africa.

Launched under the **Privacy First Campaign by Amnesty International Kenya** and recognized by the **CIPESA grant**, this platform combines a public-facing portal with a rich, secure content management system (CMS) to customize campaign highlights, milestones, teams, partners, and site coordinates.

---

## Features

- **Multi-Page Routing:** Powered by `react-router-dom` for real browser history support, shareable deep-linked URLs, and automatic page title updates.
- **Shared Master Layout:** Persistent, responsive header and footer navigation with spring layout transitions.
- **Isolated Data Fetching:** Optimized pages that only pull and display their designated slice of API content.
- **First-Run Setup Flow:** Secure administrative initialization at `/admin/setup` to dynamically bootstrap the first Super Admin account without hardcoded credentials.
- **Interactive CMS Panel:** Secure markdown, text, image-upload editors, and access logs tracking all modifications.

---

## Technical Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Motion, Lucide Icons
- **Backend/API:** Express Server, JWT Authentication, bcryptjs hashing
- **Bundler:** Vite 6, esbuild (Node.js production bundling)
- **Database:** Local JSON-based persistent file storage (`src/data/db.json`)

---

## Local Setup & Installation

### 1. Install Dependencies
Run the installation script in the root directory:
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root of the project:
```bash
cp .env.example .env
```
Open `.env` and set `JWT_SECRET` to a secure, long random string:
```env
JWT_SECRET=your_super_secure_random_string_here
```

### 3. Start Development Server
Boot up the development environment using `tsx` (TypeScript Execute):
```bash
npm run dev
```
The application will run locally on `http://localhost:3000`.

---

## First-Run Administrator Setup

To register your first administration credentials and unlock the content management dashboard:

1. Launch the application and navigate to **`/admin/setup`** in your browser.
2. Provide your **Full Name**, **Email Address**, and a secure **Password** (minimum 8 characters).
3. Click **Initialize System**. 
4. The backend will hash your password and register you as the first **Super Admin** inside the local database.
5. You will be automatically redirected to the administrative login portal where you can sign in and manage site content.

*Note: Once a first admin is registered, the `/admin/setup` route will be locked and automatically redirect visitors to the standard login screen to maintain high security.*

---

## Production Deployment

### Building the Application
To compile both the frontend client bundle and the backend Node.js production server:
```bash
npm run build
```
This script generates a static client build in `/dist` and bundles the entire Express server into a standalone CommonJS file at `/dist/server.cjs` using `esbuild`.

### Running in Production
```bash
npm start
```

### Deployment Considerations (Serverless & Ephemeral Hosts)
The application saves uploaded images, message inboxes, and dynamic content changes inside a file-based JSON store (`src/data/db.json`). 

- **Warning for Ephemeral Hosts:** Standard serverless or server-side-rendering hosts (such as Vercel, Netlify, or AWS Lambda) have ephemeral filesystems. Content modifications or new message submissions will be lost upon container recycling.
- **Recommended Hosting:** Deploy using persistent cloud containers (such as **Google Cloud Run** with a mounted persistent volume, standard VPS/VMs like AWS EC2, DigitalOcean, or Google Compute Engine), where the `src/data/db.json` and dynamic file uploads remain intact across restarts.
