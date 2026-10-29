# Prisma 8 (Release Candidate) Verified Query Patterns

**Package Version:** `@prisma/orm-postgres@8.0.0-rc.12` / `prisma@8.0.0-rc.17`  
**Database:** PostgreSQL 18  
**Verification Date:** 2026-10-29  

All query patterns below have been empirically tested and verified against the live PostgreSQL database via `db.orm.public.<Model>` runtime.

---

## 1. Database Connection & Setup

In `server/src/db.js`:
```javascript
require('temporal-polyfill/full/global');
const postgres = require('@prisma/orm-postgres/runtime').default;
const { readFileSync } = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const contractPath = path.join(__dirname, '../prisma/contract.json');
const contractJson = JSON.parse(readFileSync(contractPath, 'utf8'));

const db = postgres({
  contractJson,
  url: process.env.DATABASE_URL,
});

module.exports = db;
```

Access model collections via `db.orm.public.<ModelName>`:
- `db.orm.public.User`
- `db.orm.public.Subject`
- `db.orm.public.Attendance`
- `db.orm.public.Assignment`
- `db.orm.public.Timetable`
- `db.orm.public.Event`
- `db.orm.public.Notice`
- `db.orm.public.Resource`

---

## 2. Working with Timestamps (`Temporal.Instant`)

Columns authored with `timestamptz` (such as `createdAt`, `dueDate`, `date`) use the `pg/timestamptz-temporal@1` codec. Passing a plain string or standard JS `Date` will fail with `RUNTIME.ENCODE_FAILED`.

### Rules for Timestamps:
1. **Omit for Default:** If the column has a `@default(now())` database default (e.g. `User.createdAt`, `Assignment.createdAt`), omit the property from the `.create()` payload to let PostgreSQL assign `now()`.
2. **Explicit Timestamps:** When providing a timestamp (e.g. `Assignment.dueDate`), parse the ISO string using `Temporal.Instant.from(isoString)`:
```javascript
const instant = Temporal.Instant.from(dueDateIsoString);
// or for current time:
const now = Temporal.Now.instant();
```
3. **Reading Timestamps:** When returned from queries, timestamps are `Temporal.Instant` instances. Convert them to ISO strings for API serialization using `.toString()`:
```javascript
const formattedDueDate = assignment.dueDate.toString(); // "2026-11-15T18:00:00Z"
```

---

## 3. Verified CRUD Query Patterns

### Create (`.create(data)`)
```javascript
// User
const user = await db.orm.public.User.create({
  name: 'Jane Doe',
  email: 'jane@example.com',
  passwordHash: hashedPassword,
});

// Subject (scoped to userId)
const subject = await db.orm.public.Subject.create({
  name: 'Mathematics',
  code: 'MATH101',
  userId: req.user.id,
});

// Attendance (unique subjectId FK)
const attendance = await db.orm.public.Attendance.create({
  subjectId: subject.id,
  attended: 0,
  total: 0,
});

// Assignment (scoped to userId & subjectId)
const assignment = await db.orm.public.Assignment.create({
  userId: req.user.id,
  subjectId: subject.id,
  title: 'Calculus Assignment 1',
  description: 'Chapters 1-3 problems',
  dueDate: Temporal.Instant.from(req.body.dueDate),
  priority: 'High',
  status: 'Pending',
});

// Timetable Entry
const slot = await db.orm.public.Timetable.create({
  userId: req.user.id,
  subjectId: subject.id,
  day: 'Monday',
  startTime: '09:00',
  endTime: '10:30',
  room: 'Room 301',
});
```

---

### Find One (`.where(condition).first()`)
- Returns the single matching record object if found.
- Returns `null` if no match exists.

```javascript
// By unique field
const user = await db.orm.public.User.where({ email }).first();
if (!user) {
  // Not found
}

// By ID and user scoping
const subject = await db.orm.public.Subject.where({
  id: subjectId,
  userId: req.user.id,
}).first();

// Attendance by subjectId
const attendance = await db.orm.public.Attendance.where({
  subjectId,
}).first();
```

---

### Find Many (`.where(condition).all()`)
- Returns an `Array` of matching record objects.
- Returns `[]` if no matches exist.

```javascript
// All subjects owned by user
const subjects = await db.orm.public.Subject.where({
  userId: req.user.id,
}).all();

// Filtered assignments
const pendingAssignments = await db.orm.public.Assignment.where({
  userId: req.user.id,
  status: 'Pending',
}).all();
```

---

### Update (`.where(condition).update(data)`)
- Returns the updated record object.

```javascript
// Update subject
const updatedSubject = await db.orm.public.Subject.where({
  id: subjectId,
  userId: req.user.id,
}).update({
  name: 'Advanced Mathematics',
  code: 'MATH201',
});

// Update attendance counts
const updatedAttendance = await db.orm.public.Attendance.where({
  subjectId,
}).update({
  attended: newAttended,
  total: newTotal,
});

// Update assignment status
const updatedAssignment = await db.orm.public.Assignment.where({
  id: assignmentId,
  userId: req.user.id,
}).update({
  status: 'Completed',
});
```

---

### Delete (`.where(condition).delete()`)
- Returns the deleted record object.

```javascript
// Delete assignment (scoped to user)
const deleted = await db.orm.public.Assignment.where({
  id: assignmentId,
  userId: req.user.id,
}).delete();

// Delete subject (scoped to user)
const deletedSubject = await db.orm.public.Subject.where({
  id: subjectId,
  userId: req.user.id,
}).delete();
```

---

## 4. User Ownership & Security Scoping Rules

1. **Token Scoping:** Every query and mutation MUST filter by `req.user.id` obtained from the verified JWT:
   - For `Subject`, `Assignment`, `Timetable`, `Event`, `Resource`: explicitly include `{ userId: req.user.id }` in all `.where(...)` queries.
   - For `Attendance`: Attendance references `subjectId` (not `userId`). Always verify the subject belongs to `req.user.id` before reading or updating attendance:
     ```javascript
     const subject = await db.orm.public.Subject.where({ id: subjectId, userId: req.user.id }).first();
     if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
     ```
2. **Cross-User Protection:** If a resource exists but belongs to a different user, returning `404` prevents enumeration attacks while securing data boundaries.
3. **Foreign Key Integrity:** Creating child records (`Attendance`, `Assignment`, `Timetable`) requires the referenced `subjectId` and `userId` to exist in the database, otherwise PostgreSQL raises code `23503` (`ForeignKeyViolation`).
