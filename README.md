# Reweave — Clothing Exchange & Swap Marketplace

A full-stack, barter-based marketplace where users swap clothes directly with
one another — no money changes hands. Built on the MERN stack with
Cloudinary for image storage and Socket.IO for real-time negotiation chat.

> **Status note:** This repository implements the complete core workflow end
> to end (auth → list → browse → request swap → negotiate/chat → accept →
> complete → review, plus a working admin panel). It's a solid, running
> foundation you can extend — not every stretch feature from the original
> 46-section spec (e.g. map-based geolocation search, AI-driven analytics
> charts, full CI test suite) is built out, but the architecture is designed
> so those slot in cleanly. See "What's implemented" below for specifics.

---

## 1. Features

- **Authentication** — JWT-based register/login/logout, protected routes, bcrypt password hashing.
- **Clothing listings** — create/edit/delete (soft-delete), multi-image upload to Cloudinary, search, filter (category/size/condition/brand/location/value range), sort, pagination.
- **Rule-based value calculator** — estimates a swap value from category × brand × condition × age (no AI), exactly as specified.
- **Swap requests** — a full state machine (`PENDING → NEGOTIATING → ACCEPTED → COMPLETED`, plus `REJECTED/CANCELLED/EXPIRED`) enforced server-side so invalid transitions (e.g. re-accepting a rejected swap) are rejected.
- **Negotiation** — revised swap proposals with fairness scoring (Excellent/Good/Moderate/Large Value Difference) and full proposal history.
- **Real-time chat** — Socket.IO, JWT-authenticated sockets, per-swap rooms, access control so only the two participants can join.
- **Notifications** — in-app notification feed + unread counter, pushed live over the socket connection.
- **Reviews & ratings** — post-completion, participants-only, updates the reviewed user's aggregate rating.
- **Admin panel** — dashboard KPIs & 6-month growth charts, user suspension/reactivation, listing moderation (soft remove/restore), report review & resolution.
- **Sustainability panel** — configurable "estimated textile waste avoided" metric on the user dashboard, clearly labelled as an estimate.
- **Realistic seed data** — 30 users, 50 listings, 24+ swap requests with sample messages/notifications, real Indian cities/brands/currency.

### What's implemented vs. simplified
- Location matching is **city/state text filtering**, not geo-radius search (Phase 1 scope per the spec — lat/lng fields exist on the schema for a future upgrade).
- Admin charts are custom lightweight bar visualizations (no external charting library) to keep the bundle small.
- Automated test suite (Jest/Supertest scaffolding is in `server/package.json` devDependencies) is not included as full test files — see "Testing" below for what to add first.
- Seed images use a single placeholder URL rather than 50 unique uploaded photos (Cloudinary upload requires your own account credentials at seed time).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, React Hook Form, Axios, Socket.IO client, Lucide icons |
| Backend | Node.js, Express, JWT, bcryptjs, Joi validation, Multer + Cloudinary, Socket.IO |
| Database | MongoDB + Mongoose |
| Image storage | Cloudinary |
| Deployment target | Vercel (frontend) · Render/Railway (backend) · MongoDB Atlas (database) |

---

## 3. Architecture

```
clothing-swap-marketplace/
├── client/                # React + Vite frontend
│   └── src/
│       ├── components/    # Navbar, Footer, ClothingCard, modals, ChatPanel...
│       ├── pages/          # Landing, Listings, ItemDetail, Dashboard, admin/...
│       ├── context/        # AuthContext, NotificationContext
│       └── services/       # axios API clients + socket.js
│
├── server/                # Express backend
│   ├── controllers/        # business logic per resource
│   ├── models/             # Mongoose schemas
│   ├── routes/              # REST route definitions
│   ├── middleware/          # auth, validation, upload, error handling
│   ├── validators/          # Joi schemas
│   ├── sockets/              # Socket.IO chat + registry
│   ├── utils/                 # value calculator, API response helpers
│   └── seed/                  # seed.js — realistic demo data
│
└── .env.example
```
