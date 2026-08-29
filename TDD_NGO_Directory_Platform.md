# Technical Design Document (TDD)
## NGO Directory and Social Impact Networking Platform

**Version:** 1.0
**Date:** 29 August 2026

---

## 1. Introduction

This Technical Design Document (TDD) describes the system architecture, technology stack, data model, API design, and security approach for building the NGO Directory and Social Impact Networking Platform. It translates the requirements in the Business Requirements Document (BRD) into an implementable technical design.

---

## 2. System Architecture Overview

The system follows a three-tier web architecture: a React-based frontend (client), a Node.js/Express REST API (application/business layer), and a MongoDB database (data layer). Communication between frontend and backend occurs over HTTPS using JSON payloads, secured with JWT-based authentication.

```
[ React + Tailwind Frontend ]  <-- HTTPS/REST/JSON -->  [ Node.js + Express API ]  <-->  [ MongoDB ]
                                                                  |
                                                          [ Google Maps API ] (optional)
```

Static assets are served via the frontend build; file/image uploads (NGO logos, activity photos) are stored either on server disk (Phase 1) or a cloud object store such as AWS S3 / Firebase Storage (Phase 2).

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js + Tailwind CSS | Responsive UI, component-based development |
| Backend | Node.js + Express.js | REST API, business logic, auth middleware |
| Database | MongoDB + Mongoose ODM | Flexible schema storage for NGOs, users, activities |
| Authentication | JWT (JSON Web Tokens) + bcrypt | Stateless auth; password hashing |
| Hosting | Render / Firebase / AWS (free-tier viable) | Application and database hosting |
| Maps (optional) | Google Maps JavaScript API | Visualize NGO service regions |
| Version Control | Git + GitHub | Source control and collaboration |

---

## 4. User Roles and Access Control

| Role | Access Rights |
|---|---|
| Guest / Public | Search directory, view approved NGO profiles — read-only, no login required |
| NGO User | Register, edit own profile, post activities, view/respond to connect requests |
| Donor / Volunteer (Registered User) | Search, view profiles, send connect requests |
| Admin (District Officer) | Approve/reject NGOs, view analytics dashboard, export data, manage all records |

---

## 5. Data Model / Database Schema

### 5.1 Users Collection

```
{
  _id,
  name,
  email,
  passwordHash,
  role: ['ngo' | 'donor' | 'volunteer' | 'admin'],
  phone,
  createdAt
}
```

### 5.2 NGOs Collection

```
{
  _id,
  userId (ref Users),
  ngoName,
  registrationNumber,
  focusAreas: [String],
  serviceRegion: [String],
  address,
  latitude,
  longitude,
  contactEmail,
  contactPhone,
  website,
  description,
  logoUrl,
  status: ['pending' | 'approved' | 'rejected'],
  createdAt
}
```

### 5.3 Activities Collection

```
{
  _id,
  ngoId (ref NGOs),
  title,
  description,
  date,
  images: [String],
  beneficiaryCount,
  category,
  createdAt
}
```

### 5.4 ConnectRequests Collection

```
{
  _id,
  fromUserId (ref Users),
  toNgoId (ref NGOs),
  message,
  status: ['sent' | 'read' | 'responded'],
  createdAt
}
```

### 5.5 Entity Relationships

- One User (role: ngo) ↔ One NGO profile (1:1).
- One NGO → Many Activities (1:N).
- One NGO → Many ConnectRequests received (1:N); One User → Many ConnectRequests sent (1:N).

---

## 6. API Design (REST Endpoints)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user (NGO/donor/volunteer) | Public |
| POST | `/api/auth/login` | Authenticate and issue JWT | Public |
| GET | `/api/ngos` | List/search/filter approved NGOs | Public |
| GET | `/api/ngos/:id` | Get single NGO profile with activities | Public |
| POST | `/api/ngos` | Create NGO profile (status=pending) | NGO |
| PUT | `/api/ngos/:id` | Update own NGO profile | NGO (owner) |
| POST | `/api/ngos/:id/activities` | Post a new activity/impact update | NGO (owner) |
| POST | `/api/connect/:ngoId` | Send a connect request to an NGO | Donor/Volunteer |
| GET | `/api/connect/inbox` | View received connect requests | NGO |
| GET | `/api/admin/ngos` | List all NGOs incl. pending/rejected | Admin |
| PATCH | `/api/admin/ngos/:id/status` | Approve or reject an NGO | Admin |
| GET | `/api/admin/analytics` | Dashboard stats (counts by category/region) | Admin |
| GET | `/api/admin/export` | Export NGO data as CSV | Admin |

---

## 7. Frontend Page/Component Structure

- **Home / Search Page** — search bar, category & region filters, NGO card grid.
- **NGO Profile Page** — details, focus areas, map (optional), activity feed, Connect button.
- **Login / Register Page** — role selection (NGO / Donor / Volunteer).
- **NGO Dashboard** — edit profile, post activity, view connect-request inbox.
- **Admin Dashboard** — pending approvals table, analytics charts, CSV export button.

---

## 8. Security Design

- Passwords hashed using bcrypt before storage; never stored in plain text.
- JWT access tokens with expiry; refresh-token flow for extended sessions.
- Role-based middleware guards on all NGO/Admin-only routes.
- Input validation and sanitization on all API endpoints to prevent injection attacks.
- HTTPS enforced in production; environment secrets stored outside source control (`.env`).
- Only Admin-approved NGOs are publicly visible in search results.

---

## 9. Deployment Architecture

Phase 1 deployment targets a low-cost / free-tier setup suitable for a district pilot:

- **Frontend:** deployed as a static build on Render, Netlify, or Firebase Hosting.
- **Backend API:** deployed on Render / Railway as a Node.js web service.
- **Database:** MongoDB Atlas free-tier cluster.
- **CI/CD:** GitHub → auto-deploy on push to main branch.

---

## 10. Technical Constraints and Assumptions

- Free/low-cost hosting tiers may impose request-rate and storage limits in Phase 1.
- Image uploads capped (e.g., 2MB per file) to control storage costs.
- Google Maps API usage requires an API key with a billing account (free quota available).
- System designed to scale horizontally by moving to paid-tier hosting as NGO/user count grows.

---

## 11. Future Enhancements (Phase 2+)

- Online donation/payment gateway integration.
- Native mobile apps (Android/iOS).
- AI-based NGO credibility scoring and duplicate-effort detection.
- Multi-district and state-level rollout with federated dashboards.
- SMS/WhatsApp notifications for connect requests and approvals.
