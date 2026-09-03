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

---

## 4. Prerequisites

- Node.js 18+
- A MongoDB connection string (local `mongod` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- A free [Cloudinary](https://cloudinary.com) account (cloud name, API key, API secret)

---

## 5. Installation

```bash
git clone <your-fork-url>
cd clothing-swap-marketplace

# Backend
cd server
npm install
cp .env.example .env      # then fill in real values, see below

# Frontend
cd ../client
npm install
cp .env.example .env      # defaults point at localhost:5000, adjust if needed
```

### Environment variables (`server/.env`)

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/clothing-swap

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SEED_USER_EMAIL=user@example.com
SEED_USER_PASSWORD=User@12345
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin@12345
```

### Environment variables (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 6. Database setup & seed data

Once `MONGO_URI` points at a real cluster (or local Mongo):

```bash
cd server
npm run seed
```

This clears existing collections and creates:
- 30 users (including the two demo accounts below)
- 50 clothing listings across all 15 categories, real brands, real Indian cities
- 24+ swap requests spanning every status, with sample chat messages and notifications

---

## 7. Running the app

```bash
# Terminal 1 — backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd client
npm run dev
```

Open `http://localhost:5173`.

---

## 8. Demo credentials

```
User:
  Email:    user@example.com
  Password: User@12345

Admin:
  Email:    admin@example.com
  Password: Admin@12345
```

These are seeded from the `SEED_USER_*` / `SEED_ADMIN_*` env vars — change them there before seeding a public/production database.

---

## 9. API overview

All endpoints are prefixed with `/api`. Full route list:

```
Auth        POST /auth/register · POST /auth/login · POST /auth/logout · GET /auth/me
Users       GET/PUT /users/:id · GET /users/:id/swaps · GET /users/me/dashboard
Clothing    GET/POST /clothing · GET/PUT/DELETE /clothing/:id
Swaps       POST/GET /swaps · GET /swaps/:id · PUT /swaps/:id/{accept,reject,cancel,complete}
            POST /swaps/:id/proposals · GET/POST /swaps/:id/messages · POST /swaps/:id/reviews
Notif.      GET /notifications · PUT /notifications/:id/read · PUT /notifications/read-all
Reports     POST /reports
Admin       GET /admin/dashboard · GET /admin/users · GET /admin/listings
            PUT /admin/users/:id/{suspend,activate} · DELETE /admin/listings/:id
            PUT /admin/listings/:id/restore · GET /admin/reports · PUT /admin/reports/:id
```

Clothing list supports query params: `search, category, size, condition, brand, location, minValue, maxValue, page, limit, sort`.

Every response follows `{ success, message, data, meta? }`; errors follow `{ success: false, message, details? }`.

---

## 10. Testing

`server/package.json` includes `jest`, `supertest`, and `mongodb-memory-server` as devDependencies so you can add tests without further setup:

```bash
cd server
npm test
```

Priority areas to cover first (per the business rules in the spec):
1. Swap state machine — verify `REJECTED → ACCEPTED` and similar invalid transitions throw.
2. Authorization — a user cannot edit/delete another user's listing, accept another user's incoming request, or read a swap/chat they're not part of.
3. Swap creation guards — self-swap, offering an item you don't own, offering/requesting an unavailable item, duplicate active swap for the same item pair.

---

## 11. Deployment

```
React/Vite  →  Vercel
Express API →  Render / Railway
MongoDB     →  MongoDB Atlas
Images      →  Cloudinary
```

1. Push `server/` to Render/Railway; set all `server/.env` variables in the platform's dashboard (never commit `.env`).
2. Push `client/` to Vercel; set `VITE_API_URL` / `VITE_SOCKET_URL` to your deployed backend's URL.
3. Update `CLIENT_URL` in the backend's environment to your deployed frontend URL (needed for CORS and Socket.IO).
4. Run `npm run seed` once against the production database if you want demo data live (optional).

---

## 12. Security notes

- Passwords are hashed with bcrypt; JWT secret, DB credentials, and Cloudinary keys are read from environment variables only and never returned in API responses.
- Rate limiting is applied globally and more strictly on `/api/auth`.
- Input is sanitized against NoSQL injection (`express-mongo-sanitize`) and XSS (`xss-clean`); all request bodies are validated with Joi before hitting controllers.
- Role-based middleware (`authorize('admin')`) guards every `/api/admin/*` route.
