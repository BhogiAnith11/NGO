# 🌍 District NGO Directory & Emergency Medical Assistance Platform

A unified full-stack **MERN** (MongoDB + Express + React + Node.js) web platform combining the **District NGO Directory & Verification System** with **Emergency Medical Assistance & Direct Donations**, Charity Drives, and Citizen Helpdesk features.

---

## ✨ Features

### 🩺 1. Emergency Medical Assistance & Direct Donations (NEW)
- **Patient Registration**: Injured people, patients, or authorized family members request financial assistance for medical emergencies.
- **Privacy Protection**: Confidential storage of private clinical diagnostic records, identity proofs, and personal contact details, with customizable public display names.
- **District Admin Verification**: Medical applications enter a `Pending` state and undergo official nodal officer review, document requests, approvals, or rejections.
- **Direct Online Donations with Razorpay**: Verified online contributions with server-side HMAC SHA256 signature verification, idempotency protection against duplicate webhook deliveries, and instant downloadable donation receipts.
- **Fundraising Progress & Tracking**: Real-time calculation:
  - `Amount Raised = Sum of Verified Successful Donations - Applicable Refunds`
  - `Remaining Amount = Maximum of 0 and Funding Target - Amount Raised`
  - `Progress Percentage = Minimum of 100 and (Amount Raised / Funding Target) × 100`
- **Patient Dashboard**: Manage submitted medical aid requests, upload requested hospital estimate letters, track confirmed funds, and publish recovery updates.
- **Donor Dashboard**: Overview of confirmed medical contributions, supported patients, transaction history, and official digital receipts.
- **Medical Audit Queue in Admin Panel**: Review medical documents, inspect clinical diagnoses, request extra evidence, pause suspicious campaigns, and view community reports.

### 🏛️ 2. District NGO Directory & Verification
- **Verified Directory**: Search and filter NGOs by focus area, operational talukas/villages, and official verification status.
- **2-Step Registration**: Public NGOs register official legal credentials (Trust/Society Reg No, PAN, target tehsils) into a pending queue.
- **Official Verification Workflow**: District Social Welfare Nodal Officers review, inspect, and approve or reject submissions with official remarks.
- **Direct Connect & Proposal Inbox**: Donors, CSR entities, and volunteers can send direct partnership proposals to verified NGOs.

### 💳 3. Public Donations & In-Kind Relief
- **Multi-Category Giving**: Support with **Money** or **In-Kind Items** (Food & Nutrition, Clothing, Educational Supplies, Medical Kits).
- **Target NGO or General Fund**: Route contributions directly to a specific verified NGO or the District General Welfare Relief Fund.

### 📅 4. Community Charity Drives & Events
- **Charity Drives Calendar**: Browse upcoming Mega Food Drives, Free Medical Camps, Literacy Workshops, and Afforestation Drives.
- **Volunteer RSVP**: Citizens can register as field volunteers for upcoming events with 1 click.

### ✉️ 5. Citizen Helpdesk & Grievance Portal
- **Inquiry & Feedback Form**: Citizens submit messages and grievance requests directly to the District Nodal Helpdesk.

### 📊 6. District Analytics & Data Export
- **Interactive Visualizations**: Recharts Bar & Pie charts for sector-wise and taluka-wise NGO distribution.
- **CSV Dataset Export**: One-click official CSV export for district administration planning.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite + Tailwind CSS v3 + React Router DOM v7 |
| **Backend** | Node.js + Express.js + Mongoose |
| **Payment Gateway** | Razorpay (Test Mode & Webhook Signature Verification) |
| **Database** | MongoDB Atlas / Local MongoDB |
| **Security & Auth** | JWT + bcryptjs + HMAC SHA256 Signature Verification |
| **Visuals & Charts** | Recharts |
| **File Storage** | Multer with segregated private medical document storage |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=ngo_dir_jwt_s3cr3t_2026_district_platform_secure_key
PORT=5000
CLIENT_URL=http://localhost:5173

# Razorpay Test Configuration (Optional - Defaults to test simulator if omitted)
RAZORPAY_KEY_ID=rzp_test_DistrictWelfare2026
RAZORPAY_KEY_SECRET=district_platform_test_secret_2026
RAZORPAY_WEBHOOK_SECRET=district_webhook_secret_2026
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Getting Started

### 1. Backend Setup
```powershell
cd backend
npm install

# Seed NGO Directory data
node seed.js

# Seed Emergency Medical Assistance data
node seed-medical.js

# Run integration tests (validates Razorpay flow & medical calculations)
node test-medical-integration.js

# Start backend server (Port 5000)
npm run dev
```

### 2. Frontend Setup
```powershell
cd frontend
npm install

# Start Vite development server
npm run dev
```

---

## 🔑 Default Credentials

| Role | Email | Password | Access / Dashboard |
|---|---|---|---|
| **District Nodal Admin** | `admin@district.gov.in` | `Admin@2026` | `/admin` (Medical Audit, NGO Approvals, Donations Ledger) |
| **Patient / Family** | `rahul.sharma@example.com` | `Admin@2026` | `/patient-dashboard` (Medical Requests, Recovery Updates) |
| **Sample NGO** | `info@aarogya.org` | `Admin@2026` | `/dashboard` (My NGO Profile & Activities) |
