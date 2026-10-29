# StudySync

StudySync is a full-stack, secure student academic dashboard built to streamline subject tracking, attendance monitoring with threshold calculations, assignment deadlines, and weekly timetable schedules.

---

## Architecture & Tech Stack

- **Frontend:** React 19, Vite 8, React Router 7, Lucide React icons.
- **Backend:** Node.js, Express 5, Prisma 8 (`@prisma/orm-postgres`), PostgreSQL 18.
- **Authentication & Security:** JWT (Short-lived Bearer tokens), bcrypt password hashing (12 rounds), Helmet security headers, CORS allow-listing, Express rate limiting, strict user-scoped database queries.
- **Testing:** Vitest + Supertest (Backend), Vitest + React Testing Library + jsdom (Frontend).

---

## Security & Token Storage Trade-off

Per the API Contract specification (`API_CONTRACT.md`), authentication tokens are exchanged via the standard `Authorization: Bearer <token>` header:
- **Storage:** Client-side `localStorage` with in-memory React Context synchronization.
- **Security Protections:**
  - Short-lived JWT expiration (`1h` by default).
  - Explicit omission of `dangerouslySetInnerHTML` across all UI views (React automatically escapes all rendered strings to protect against XSS).
  - `helmet` security headers configured on the Express API server (X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, etc.).
  - Route-level rate limiting on `/api/auth` endpoints.
  - Strict input sanitization and parameter scoping (all queries scoped to authenticated `userId`).
- **Trade-off:** Using `localStorage` adheres strictly to the decoupled REST API contract. While `httpOnly` cookies protect against malicious script extraction in XSS events, they require CSRF tokens, custom cookie parsers, and credentials mode on CORS. In this SPA architecture, avoiding raw HTML injections combined with short-lived tokens ensures safe token handling.

---

## Getting Started

### 1. Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL 18 (running on `localhost:5432`)

### 2. Environment Setup

Create `server/.env` based on `server/.env.example`:

```bash
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/studysync
JWT_SECRET=your-random-secure-jwt-secret-key
JWT_EXPIRES_IN=1h
CORS_ORIGIN=http://localhost:5173
```

> **Note:** The server strictly validates `JWT_SECRET` on startup and refuses to start if it is missing.

### 3. Database Migrations

Apply the planned Prisma migrations to the `studysync` database:

```bash
cd server
npm run test # or npx prisma db migrate
```

To optionally populate demo student data for testing:

```bash
node src/scripts/seed.js
```
*(Creates demo user `demo@studysync.edu` with password `demopassword123` along with sample subjects, attendance, assignments, and timetable entries).*

---

## Running the Application

### 1. Start the Backend Server (Port 5000)
```bash
cd server
npm start
# Server runs at http://localhost:5000
```

### 2. Start the Frontend Client (Port 5173)
```bash
cd client
npm run dev
# App opens at http://localhost:5173
```

---

## Running Automated Tests

### Backend Test Suite (Vitest + Supertest)
```bash
cd server
npm test
```
*Covers authentication, register/login, token verification, cross-user security isolation, subject CRUD, attendance percentage formula, assignments, timetable, and dashboard summary aggregation.*

### Frontend Test Suite (Vitest + React Testing Library)
```bash
cd client
npm test
```
*Covers login/register form rendering, input validation, and attendance threshold calculation logic.*

---

## Product Rules Implemented

1. **Attendance Formula:** `(attended / total) * 100`, returning 0 when total is 0. Both API and UI reject negative counts and `attended > total`.
2. **Attendance Threshold Advice:** User-configurable threshold (default 75%) accessed through `useAttendanceThreshold`. Displays dynamic advice per subject:
   - If on track: *"You can safely miss X more classes"*.
   - If low: *"Need to attend next X classes to reach Y%"*.
3. **Real API Dashboard Data:** No mock figures. Shows real enrolled subjects, overall attendance percentage, pending/overdue assignments, and today's classes with quick action shortcuts and meaningful empty states.
4. **UTC Dates & Local Formatting:** Due dates and class times stored in UTC ISO format and rendered in the user's local timezone with overdue and due-soon indicators.
