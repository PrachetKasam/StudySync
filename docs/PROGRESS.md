# StudySync — Progress Log

**Branch:** `finish/studysync`  
**Started:** 2026-10-29  

---

## Phase 0 — Audit (Read-Only) [COMPLETED]
- Inspected repository history and teammate authorship.
- Created `finish/studysync` working branch.
- Documented findings in `docs/STATUS.md`.
- Obtained user approval for merge, migration, token storage strategy, and threshold persistence.

---

## Phase 1 — Foundation [COMPLETED]
- Merged `origin/frontend-features` with `--no-ff` (27 files, 3,597 insertions).
- Configured PostgreSQL connection in gitignored `server/.env` and updated `server/.env.example`.
- Ran `prisma db migrate` to create all 8 tables in `studysync` database. Verified 1:1 match with `schema.prisma`.
- Documented verified Prisma RC query patterns in `docs/PRISMA_NOTES.md`.
- Implemented backend auth (`register`, `login`, `me`) with bcrypt and JWT.
- Configured Helmet, CORS allow-listing, rate limiting, and centralized error handling.
- Built frontend API client (`client/src/services/api.js`) with Bearer token injection.
- Built `AuthContext`, `ToastContext`, and `useAttendanceThreshold` hook.
- Built shared UI primitives: `Button`, `Card`, `Badge`, `Modal`, `EmptyState`, `SkeletonLoader`, `Toast`.
- Built app shell: fixed sidebar (desktop), responsive drawer (mobile/tablet), sticky header with account menu and settings modal.

---

## Phase 2 — Feature Slices [COMPLETED]
1. **Subjects Slice:**
   - Real DB persistence via `db.orm.public.Subject`, scoped to `req.user.id`.
   - Automatic attendance initialization on subject creation.
   - Frontend Subjects page with Add Subject modal, delete confirmation, empty state.
2. **Attendance Slice:**
   - Formula: `(attended / total) * 100` (returns 0 if total is 0).
   - Validation: rejects negative counts and `attended > total` at both API and UI level.
   - Dynamic threshold advice ("safely miss X classes" / "need to attend next X classes").
   - Quick logging buttons (+1 Attended, +1 Missed) and manual edit modal.
3. **Assignments Slice:**
   - Database persistence with `Temporal.Instant` timestamps in UTC.
   - Search by title/subject and filter by status (All, Pending, Completed).
   - Overdue and due-soon indicators based on current local time.
   - Status toggle ("Mark Completed" / "Mark Pending") and delete with confirmation.
4. **Timetable Slice:**
   - Weekly grid on desktop (Monday to Saturday) and day-by-day tabs on mobile.
   - Add class slot modal (subject, day, start/end time, room).
5. **Dashboard Slice:**
   - Aggregated real data API (`/api/dashboard/summary?threshold=...`).
   - Summary cards: Active subjects, attendance %, pending/overdue assignments, today's schedule.
   - Meaningful empty state with direct action when zero data exists.
6. **Demo Seed Script:**
   - Authored `server/src/scripts/seed.js` for optional dev demo seeding.

---

## Phase 3 — Hardening [COMPLETED]
- Verified cross-user isolation: user A receives 403/404 for user B's resources.
- Verified input validation across all endpoints.
- Accessibility & WCAG AA contrast check: visible `:focus-visible` rings, semantic labels, ARIA dialog roles.
- Responsive design verified across mobile (360px), tablet (768px), and desktop (1280px).
- Zero console errors, zero dead code, production builds verified.

---

## Phase 4 — Deployment Prep & Testing [COMPLETED]
- Updated `README.md` with setup guide, scripts, security decisions, and product rules.
- Production build verified: `vite build` completed in 1.17s.
- Test suites:
  - Backend: 13 tests passed across 2 suites (`vitest`).
  - Frontend: 3 tests passed across 1 suite (`vitest`).
  - Total: 16 automated tests passing.

---

## Phase 5 — Visual Polish & UI/UX Overhaul [COMPLETED]
- Integrated **Plus Jakarta Sans** and **Inter** font typography scale with crisp tracking (`letter-spacing: -0.02em`).
- Upgraded Design Tokens:
  - Multi-tiered elevation shadows (`--shadow-card`, `--shadow-card-hover`, `--shadow-modal`).
  - Vibrant semantic palette with soft tinted pill backgrounds and matching border outlines.
  - Tactile micro-interactions (hover elevation, button press feedback, smooth tab transitions).
- Enhanced App Shell & Navigation:
  - Sidebar: Branded gradient squircle logo icon, structured navigation sections (`ACADEMICS`, `CAMPUS LIFE`), active indicator bar, and student workspace status footer.
  - Header: Frosted backdrop blur (`backdrop-filter: blur(12px)`), live attendance target indicator badge with glowing pulse dot, and user profile menu.
- Enhanced Feature Pages:
  - **Dashboard:** Welcoming hero briefing banner, accent top border stripes on stat KPI cards, styled timeline class items with MapPin/Clock icons, priority-badged upcoming coursework.
  - **Attendance:** Hero card with interactive progress track, target threshold marker with tooltip, subject cards with micro-progress meters, status advice callouts, and tactile `+1 Attended` / `+1 Missed` action buttons.
  - **Assignments:** Search input with icon, segmented status tabs with real-time numeric count pills, priority left stripe indicators (High = Rose, Medium = Amber, Low = Sky), and instant checkmark toggle.
  - **Timetable:** Weekly 6-column grid with "Today" chip highlight, rounded lecture cards, and responsive mobile day tabs.
  - **Auth Pages:** Premium centered card with subtle ambient radial glow, squircle logo, clean form inputs, and 1-click demo account filler.
- Verified test suite:
  - Frontend: 3/3 tests passing (`vitest`).
  - Backend: 13/13 tests passing (`vitest`).
  - Production build: `vite build` completed cleanly in 1.18s with 0 errors.
