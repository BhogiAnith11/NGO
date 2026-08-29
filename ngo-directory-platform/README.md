# 🌍 District NGO Directory & Social Impact Platform (Merged Edition)

A unified full-stack **MERN** (MongoDB + Express + React + Node.js) web platform combining the **District NGO Directory & Verification System** with **NGOConnect's Donation, Charity Drives, and Citizen Helpdesk features**.

---

## ✨ Unified Features

### 🏛️ 1. District NGO Directory & Verification
- **Verified Directory**: Search and filter NGOs by focus area, operational talukas/villages, and official verification status.
- **2-Step Registration**: Public NGOs register official legal credentials (Trust/Society Reg No, PAN, target tehsils) into a pending queue.
- **Official Verification Workflow**: District Social Welfare Nodal Officers review, inspect, and approve or reject submissions with official remarks.
- **Interactive Service Coverage Map**: Embedded Google Maps & OpenStreetMap views of coverage territories and operational centers.
- **Direct Connect & Proposal Inbox**: Donors, CSR entities, and volunteers can send direct partnership proposals to verified NGOs.

### 💳 2. Public Donations & In-Kind Relief (Merged from NGO-master)
- **Multi-Category Giving**: Support with **Money** (₹250, ₹500, ₹1000, ₹2500, ₹5000, custom) or **In-Kind Items** (Food & Nutrition, Clothing & Warmth, Educational Supplies, Medical Kits).
- **Target NGO or General Fund**: Route contributions directly to a specific verified NGO or the District General Welfare Relief Fund.
- **Official Acknowledgment Receipt**: Instant receipt generation with donor name, item breakdown, and tracking numbers.
- **Admin Donations Ledger**: District authorities monitor all incoming monetary and material donations.

### 📅 3. Community Charity Drives & Events (Merged from NGO-master)
- **Charity Drives Calendar**: Browse upcoming Mega Food Drives, Free Medical Camps, Literacy Workshops, Afforestation Drives, and Animal Care drives.
- **Volunteer RSVP**: Citizens can register as field volunteers for upcoming events with 1 click.
- **Event Management**: Verified NGOs and administrators post welfare drives with locations, dates, and volunteer quotas.

### ✉️ 4. Citizen Helpdesk & Grievance Portal (Merged from NGO-master)
- **Inquiry & Feedback Form**: Citizens, CSR heads, and non-profits submit official messages and grievance requests directly to the District Nodal Helpdesk.
- **Grievance Resolution**: Administrators can track, mark resolved, and reply directly via email.

### 📊 5. District Analytics & Data Export
- **Interactive Visualizations**: Recharts Bar & Pie charts for sector-wise and taluka-wise NGO distribution.
- **CSV Dataset Export**: One-click official CSV export for district administration planning.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS v3 + React Router DOM v6 |
| **Backend** | Node.js + Express.js + Mongoose |
| **Database** | MongoDB Atlas / Local MongoDB |
| **Security & Auth** | JWT (JSON Web Tokens) + bcryptjs password hashing |
| **Visuals & Charts** | Recharts + Google Maps Embed API / OpenStreetMap |
| **File Storage** | Multer local storage / Public static assets |

---

## 🚀 Getting Started

### 1. Backend Setup
```powershell
cd backend
npm install

# Run database seeder to populate all verified NGOs, drives, donations, and admin user
node seed.js

# Start backend server (Port 5000)
npm run dev
```

### 2. Frontend Setup
```powershell
cd frontend
npm install

# Start Vite dev server (Port 5173 / 5174)
npm run dev
```

---

## 🔑 Pre-configured Accounts (from `seed.js`)

| Role | Email | Password | Access Portals |
|---|---|---|---|
| **District Nodal Admin** | `admin@district.gov.in` | `Admin@2026` | `/admin` (Approvals, Donations Ledger, Inquiries, Analytics, CSV) |
| **Health NGO** | `aarogya.trust@gmail.com` | `Test@1234` | `/dashboard` (Profile, Medical camps, CSR Inbox) |
| **Education NGO** | `vidyasetu.ngo@gmail.com` | `Test@1234` | `/dashboard` (Profile, Smart school projects, Volunteer inbox) |
| **CSR Corporate Donor** | `rajesh.sharma@tata.com` | `Test@1234` | `/`, `/donate`, `/events` (Direct Connect & Contributions) |
| **Volunteer Citizen** | `pooja.kulkarni@gmail.com` | `Test@1234` | `/`, `/events`, `/donate` (Event RSVPs) |

---

## 🌐 Routes Summary

- `/` — District Directory, Welfare Pillars, Live Stats, Process Workflow, FAQ
- `/donate` — Financial & In-Kind Material Giving Portal
- `/events` — Upcoming Charity Drives, Medical Camps & Volunteer RSVPs
- `/contact` — District Helpdesk & Grievance Redressal
- `/ngos/:id` — Full NGO Profile with Map, Activity Feed, and Connect Modal
- `/dashboard` — NGO Portal (Edit Profile, Post Activity, View Connect Requests)
- `/admin` — Social Welfare Admin Panel (Approvals, Records, Donations Ledger, Inquiries, Analytics, CSV Export)
