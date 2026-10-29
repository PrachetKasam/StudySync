# StudySync — Project Status & Feature Audit

**Generated:** 2026-10-29  
**Branch:** `finish/studysync` (branched from `integration/database-auth`)  
**Audit Phase:** Phase 0 (Read-Only Inspection & Verification)

---

## 1. Executive Summary

StudySync was initiated by a 3-person team:
- **Prachet Kasam:** Backend architecture, authentication scaffolding, subject routes, Express setup.
- **Alok Ranjan:** PostgreSQL schema, Prisma 8 integration, initial migration (`20260925T1941_initial_study_sync`), Temporal polyfill.
- **Sunidhi Jain:** Frontend UI, layout, navigation, mock pages for Dashboard, Subjects, Attendance, Assignments, Timetable, Events, Notices, and Resources (located on `origin/frontend-features`).

### Key Findings:
1. **Disconnected Codebases:** Backend development progressed on `backend-api`, `auth`, and `integration/database-auth`, while frontend development was isolated on `origin/frontend-features`. The frontend has never been merged into the backend branch and contains zero API client code or state management; all pages render hardcoded mock data.
2. **Database Integration Status:** Alok defined a complete Prisma schema and generated a Prisma 8 migration (`Assignment`, `Attendance`, `Event`, `Notice`, `Resource`, `Subject`, `Timetable`, `User`). However, the migration was never executed against a live database, `DATABASE_URL` was missing from `server/.env`, and all existing backend controllers still read and write from volatile in-memory JavaScript arrays.
3. **Database Availability:** PostgreSQL 18 is running locally on port 5432. The `studysync` database was verified and prepared; applying the initial migration via `prisma db migrate` is pending user sign-off.
4. **Security Gaps:** No authentication or authorization is mounted on any route. `helmet`, `cors`, and rate limiting are absent. Missing `JWT_SECRET` does not prevent the server from starting.

---

## 2. Feature-by-Feature Audit

### 2.1 Authentication (`/api/auth`)
* **Data Model & Migrations:**
  - `User` model exists in `server/prisma/schema.prisma` and `migration.ts` (`id`, `name`, `email` unique, `passwordHash`, `createdAt`).
* **Backend Implementation:**
  - Password utilities exist: `bcrypt.hash` (12 rounds) and `bcrypt.compare` in `server/src/utils/password.js`.
  - JWT utilities exist: `jwt.sign` and `jwt.verify` in `server/src/utils/token.js`.
  - Middleware exists: `authenticateToken` in `server/src/middleware/authMiddleware.js` parses and validates `Authorization: Bearer <token>`.
  - **Broken/Missing:** No auth routes are mounted in `server/src/app.js`. `POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/auth/me` are completely missing. Server startup does not validate `JWT_SECRET`.
* **Frontend Implementation:**
  - **Broken/Missing:** No register or login pages exist. No `AuthContext`, no token storage (`localStorage`/cookie), and no protected route wrapper exists.
* **API Contract Alignment:**
  - Missing all three endpoints specified in `API_CONTRACT.md`.

---

### 2.2 Subjects (`/api/subjects`)
* **Data Model & Migrations:**
  - `Subject` model in `schema.prisma` (`id`, `name`, `code`, `userId` FK).
* **Backend Implementation:**
  - Endpoints present in `server/src/routes/subjectRoutes.js`:
    - `GET /api/subjects` (Works, verified via curl/fetch)
    - `GET /api/subjects/:id` (Works, verified via curl/fetch)
    - `POST /api/subjects` (Works, verified via curl/fetch)
  - **Broken/Missing:** Connected to an in-memory array (`subjectService.js`), NOT the database. No auth middleware attached. Zero user scoping (any requester sees/modifies all records). Missing `PATCH /api/subjects/:id` and `DELETE /api/subjects/:id`. No input validation for string length or duplicate codes per user.
* **Frontend Implementation:**
  - `client/src/pages/Subjects.jsx` displays a static mock list of 6 hardcoded subjects.
  - **Broken/Missing:** No API integration. No "Add Subject" modal/form, no edit or delete actions. No loading, empty, or error states.
* **API Contract Alignment:**
  - Existing endpoints follow `{ success: true, data: ... }` format, but PATCH and DELETE are unimplemented.

---

### 2.3 Attendance (`/api/attendance`)
* **Data Model & Migrations:**
  - `Attendance` model in `schema.prisma` (`id`, `subjectId` unique FK, `attended`, `total`).
* **Backend Implementation:**
  - **Broken/Missing:** Completely missing. No routes, controllers, or services for `GET /api/attendance`, `GET /api/attendance/:subjectId`, `POST /api/attendance`, or `PATCH /api/attendance/:subjectId`. Formula calculation (`(attended / total) * 100`) and input validation (`attended <= total`, non-negative) not implemented.
* **Frontend Implementation:**
  - `client/src/pages/Attendance.jsx` computes overall attendance from a hardcoded array of 6 subjects.
  - **Broken/Missing:** No API calls. No controls to log attendance (attended/missed classes). Low-attendance warning threshold (default 75%) and "classes you can still miss" / "classes needed to reach threshold" are missing.
* **API Contract Alignment:**
  - None of the contract endpoints are implemented.

---

### 2.4 Assignments (`/api/assignments`)
* **Data Model & Migrations:**
  - `Assignment` model in `schema.prisma` (`id`, `userId` FK, `subjectId` FK, `title`, `description`, `dueDate`, `priority`, `status`, `createdAt`).
* **Backend Implementation:**
  - **Broken/Missing:** Completely missing. No routes, controllers, or services for `GET /api/assignments`, `GET /api/assignments/:id`, `POST /api/assignments`, `PATCH /api/assignments/:id`, `DELETE /api/assignments/:id`.
* **Frontend Implementation:**
  - `client/src/pages/Assignments.jsx` renders 4 hardcoded cards.
  - **Broken/Missing:** No API integration. Missing search, status filter, sorting by due date, overdue badges, due-soon indicators, and create/update forms.
* **API Contract Alignment:**
  - None of the contract endpoints are implemented.

---

### 2.5 Timetable (`/api/timetable`)
* **Data Model & Migrations:**
  - `Timetable` model in `schema.prisma` (`id`, `userId` FK, `subjectId` FK, `day`, `startTime`, `endTime`, `room`).
* **Backend Implementation:**
  - **Broken/Missing:** Completely missing. No routes, controllers, or services for `GET /api/timetable`, `POST /api/timetable`, `PATCH /api/timetable/:id`, `DELETE /api/timetable/:id`.
* **Frontend Implementation:**
  - `client/src/pages/Timetable.jsx` is an empty stub returning `<h1>Timetable</h1>`.
  - **Broken/Missing:** No weekly grid on desktop, no day-by-day list on mobile, no slot creation or conflict management.
* **API Contract Alignment:**
  - None of the contract endpoints are implemented.

---

### 2.6 Dashboard
* **Backend Implementation:**
  - No dedicated dashboard aggregation endpoint exists.
* **Frontend Implementation:**
  - `client/src/pages/Dashboard.jsx` displays hardcoded numbers (6 subjects, 87% attendance, 4 assignments, 3 events).
  - **Broken/Missing:** Hardcoded mock statistics violate the product rule requiring real API data and meaningful empty states. Missing quick actions ("Add subject", "Record attendance", "Add assignment") and today's schedule.

---

### 2.7 Events, Resources, Notices & Settings
* **Events, Resources, Notices:**
  - Defined in `schema.prisma` (`Event`, `Notice`, `Resource`) and `API_CONTRACT.md`.
  - Backend: No endpoints implemented.
  - Frontend: Empty stubs returning `<h1>Events</h1>`, `<h1>Notices</h1>`, `<h1>Resources</h1>`.
* **Settings:**
  - Not present in `schema.prisma` or `API_CONTRACT.md`.
  - Product requirement: Low-attendance threshold is user-configurable (default 75%).
  - **Proposed Solution:** Add an optional/defaulted column `lowAttendanceThreshold Int @default(75)` to the `User` table or provide a client-side setting with persistence.

---

## 3. Communication & Contract Compliance Matrix

| Feature | Method & Endpoint | In Contract | Backend Status | Frontend Status | Verification |
|---|---|---|---|---|---|
| **Health** | `GET /api/health` | No | Working | Not used | Verified (200 OK) |
| **DB Health** | `GET /api/health/database` | No | Broken (no DB URL) | Not used | Verified (500 Error) |
| **Auth** | `POST /api/auth/register` | Yes | Missing | Missing | 404 |
| **Auth** | `POST /api/auth/login` | Yes | Missing | Missing | 404 |
| **Auth** | `GET /api/auth/me` | Yes | Missing | Missing | 404 |
| **Subjects** | `GET /api/subjects` | Yes | Working (in-memory, no auth) | Hardcoded Mock | Verified (200 OK) |
| **Subjects** | `GET /api/subjects/:id` | Yes | Working (in-memory, no auth) | Missing | Verified (200 OK) |
| **Subjects** | `POST /api/subjects` | Yes | Working (in-memory, no auth) | Missing | Verified (201 Created) |
| **Subjects** | `PATCH /api/subjects/:id` | Yes | Missing | Missing | 404 |
| **Subjects** | `DELETE /api/subjects/:id` | Yes | Missing | Missing | 404 |
| **Attendance** | `GET /api/attendance` | Yes | Missing | Hardcoded Mock | 404 |
| **Attendance** | `GET /api/attendance/:subjectId`| Yes | Missing | Missing | 404 |
| **Attendance** | `POST /api/attendance` | Yes | Missing | Missing | 404 |
| **Attendance** | `PATCH /api/attendance/:subjectId`| Yes | Missing | Missing | 404 |
| **Assignments**| `GET /api/assignments` | Yes | Missing | Hardcoded Mock | 404 |
| **Assignments**| `GET /api/assignments/:id` | Yes | Missing | Missing | 404 |
| **Assignments**| `POST /api/assignments` | Yes | Missing | Missing | 404 |
| **Assignments**| `PATCH /api/assignments/:id` | Yes | Missing | Missing | 404 |
| **Assignments**| `DELETE /api/assignments/:id` | Yes | Missing | Missing | 404 |
| **Timetable** | `GET /api/timetable` | Yes | Missing | Stub (`<h1>`) | 404 |
| **Timetable** | `POST /api/timetable` | Yes | Missing | Missing | 404 |
| **Timetable** | `PATCH /api/timetable/:id` | Yes | Missing | Missing | 404 |
| **Timetable** | `DELETE /api/timetable/:id` | Yes | Missing | Missing | 404 |

---

## 4. Immediate Roadmap (Phase 1 & Beyond)

1. **Gate Approval:** Obtain user sign-off to merge `origin/frontend-features` into `finish/studysync` and apply Alok's initial migration via `prisma db migrate`.
2. **Phase 1 (Foundation):**
   - Configure environment (`DATABASE_URL`, `JWT_SECRET`, port, CORS origin).
   - Implement authentication endpoints (`register`, `login`, `me`) with bcrypt, JWT, and Prisma ORM.
   - Build frontend API client layer (`apiClient.js` with Bearer injection and error handling).
   - Implement Auth Context, Login/Register pages, and ProtectedRoute wrapper.
   - Assemble responsive App Shell (Sidebar, Header, Account Menu, Drawer, Toast notifications).
3. **Phase 2 (Feature Slices):**
   - Slice 1: Subjects (DB migration/service -> API validation & scoping -> UI CRUD -> tests).
   - Slice 2: Attendance (DB -> API with formula & threshold -> UI -> tests).
   - Slice 3: Assignments (DB -> API with filters & overdue checks -> UI -> tests).
   - Slice 4: Timetable (DB -> API -> UI grid/day-view -> tests).
   - Slice 5: Dashboard (real aggregation API -> UI summary & quick actions -> tests).
