# KisanTech

A two-sided platform for Indian farmers and the staff who support them: a farmer-facing web app for markets, equipment rental, produce sales and government schemes, backed by an admin dashboard that keeps that content current.

## Table of contents

- [What problem it solves](#what-problem-it-solves)
- [Repository layout](#repository-layout)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [Known limitations](#known-limitations)
- [Contributing](#contributing)

## What problem it solves

Farmers currently have to juggle a different app or office visit for every part of running their work — one place to check government scheme eligibility, another to find or list farm equipment for rent, a third to sell produce to a nearby buyer, and no single place to see market rates or learn better technique for their crop — while the people running outreach have no shared back office to keep scheme and market data current, so it goes stale fast. KisanTech is a two-sided platform for this: a farmer-facing web app where a farmer signs up with Firebase auth, browses nearby markets, lists produce for sale or negotiates it live over Socket.IO chat, rents instruments with Stripe-processed payments, checks government scheme eligibility, and reads farming-technique content; and an admin dashboard where staff manage farmer records, publish and edit those schemes, maintain the instrument catalogue, and push out the technique/advisory content the client app reads.

## Repository layout

The backend lives on a **separate branch**, not on `master` — this follows the project's original convention of each major piece living on its own branch rather than all being merged into one.

| Branch | Contents |
|---|---|
| `master` (this branch) | `Admin/` — the staff dashboard. `client/` — the farmer-facing app. No backend code. |
| [`sujal`](../../tree/sujal) | The Express/MongoDB API and Socket.IO server both frontends call. |

To run the full system you need both branches checked out side by side (see [Getting started](#getting-started)).

```
KisanTech/                   # this branch (master)
├── Admin/                   # staff dashboard (React + Vite + TS)
└── client/                  # farmer-facing app (React + Vite)

KisanTech-backend/            # sujal branch, checked out separately
├── server.js
└── src/
    ├── config/               # MongoDB + Firebase Admin setup
    ├── controllers/          # auth, users, products, instruments, schemes, content
    ├── models/                # Mongoose schemas
    └── routes/                # authRoutes, userRoutes, adminRoutes, stripe
```

## Tech stack

- **Admin dashboard** — React 18, TypeScript, Vite, Tailwind CSS, Recharts
- **Farmer app** — React 19, Vite, Tailwind CSS, Firebase Auth, Stripe.js, Socket.IO client, Framer Motion
- **Backend** (`sujal` branch) — Node.js, Express, MongoDB (Mongoose), Firebase Admin SDK, Socket.IO, Stripe

## Architecture

```
                        ┌──────────────────────┐
                        │   Admin dashboard    │
                        │  (Admin/, Vite app)  │
                        └──────────┬───────────┘
                                   │ REST  (/admin/*)
                                   ▼
┌─────────────────┐      ┌──────────────────────┐      ┌────────────┐
│   Farmer app     │ REST │   Express API        │      │            │
│  (client/, Vite) │─────▶│  (sujal branch)      │─────▶│  MongoDB   │
│                  │◀─────│  :5000                │      │            │
└────────┬─────────┘ WS   └──────────┬───────────┘      └────────────┘
         │                            │
         │                   ┌────────┴────────┐
         │                   │  Firebase Admin  │
         │                   │  Stripe          │
         └── Socket.IO ──────┤  /sell  /buy      │
                              └──────────────────┘
```

Both frontends default to `http://localhost:5000` for the API (`Admin/src/constants/config.js`, `client/src/context/config.jsx`) and connect to the same host for Socket.IO (`client/src/socket.js`, namespaces `/sell` and `/buy`).

## Getting started

**Prerequisites:** Node.js 18+, npm, a MongoDB instance (local or Atlas), a Firebase project (client + Admin SDK), and a Stripe account (test mode is fine).

### 1. Backend (`sujal` branch)

```bash
git clone --branch sujal https://github.com/SujalPati1/KisanTech.git kisantech-backend
cd kisantech-backend
npm install
```

Create a `.env` in the backend root:

```env
PORT=5000
MONGO_URI=your-mongodb-connection-string
STRIPE_SECRET_KEY=sk_test_...
```

Download a Firebase service account key for the `techkisan-c0700` Firebase project and save it as `src/config/serviceAccountKey.json` (already gitignored — never commit this file).

```bash
npm run dev        # nodemon server.js — API + Socket.IO on :5000
```

### 2. Admin dashboard (`master` branch)

```bash
cd Admin
npm install
npm run dev         # http://localhost:5173
```

Sign-in is currently mocked (see [Known limitations](#known-limitations)) — use `admin@agriadmin.com` / `admin123`, defined in `Admin/src/contexts/AuthContext.jsx`.

### 3. Farmer app (`master` branch)

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
REACT_APP_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

```bash
npm run dev
```

## Environment variables

| App | Variable | Purpose |
|---|---|---|
| Backend | `PORT` | API port, defaults to `5000` |
| Backend | `MONGO_URI` | MongoDB connection string |
| Backend | `STRIPE_SECRET_KEY` | Stripe secret key used by `/stripe/create-checkout-session` |
| Backend | `src/config/serviceAccountKey.json` | Firebase Admin service account (file, not an env var) |
| Client | `VITE_FIREBASE_API_KEY` | Firebase web app config, project `techkisan-c0700` |
| Client | `REACT_APP_API_URL` | Backend base URL |
| Client | `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for checkout |

## API reference

All routes are served from the `sujal`-branch backend on `:5000`.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/signup` | Create a user (Firebase + MongoDB) |
| `POST` | `/api/login` | Log in, returns a Firebase custom token |
| `GET` | `/api/getUser` | Fetch a user's stored profile |
| `GET` | `/user/getMarketData` | Nearby market/mandi listings |
| `POST` | `/user/addProduct` | List produce for sale |
| `GET` | `/user/getProducts` | Browse listed produce |
| `GET` | `/user/getUsersProducts` | A user's own listings *(requires Firebase ID token)* |
| `POST` | `/user/deleteProducts` | Remove a listing *(requires Firebase ID token)* |
| `GET` | `/user/getInstruments` | Browse rentable instruments |
| `POST` | `/admin/addcontents` / `GET`/`PUT`/`DELETE` `/admin/content[/:id]` | Advisory content CRUD |
| `POST` | `/admin/addInstruments` / `GET` `/admin/getInstruments` / `PUT`/`DELETE` `/admin/*Instrument*` | Instrument catalogue CRUD |
| `POST`/`GET`/`PUT`/`DELETE` | `/admin/schemes[/:id]` | Government scheme CRUD |
| `POST` | `/admin/updateUsers/:id`, `/admin/deleteUsers/:id` | Farmer record management |
| `POST` | `/stripe/create-checkout-session` | Stripe Checkout session for instrument rental |
| WS | `/sell` (Socket.IO) | Live broadcast when a product is listed |
| WS | `/buy` (Socket.IO) | Live broadcast when a purchase is made |

Send the Firebase ID token as `Authorization: Bearer <token>` on routes marked above.

## Known limitations

- **Two branches, one system.** Cloning `master` alone gets you no backend; cloning `sujal` alone gets you no frontends. There's no top-level script that sets up both — see [Getting started](#getting-started) for the two-clone workflow.


## Contributing

This project originally used a convention of one branch per contributor rather than merging everything into `master`; the backend on `sujal` is a continuation of that. If you're extending the backend, keep working on `sujal` rather than moving it back into `master`, and open an issue first if you plan to change that layout — it's unusual but deliberate here.
