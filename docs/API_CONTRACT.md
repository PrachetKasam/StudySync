# StudySync API Contract

## Base URL

All API endpoints use:

/api

Example:

GET /api/subjects

---

## Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Create a new user account |
| POST | /api/auth/login | Log in an existing user |
| GET | /api/auth/me | Get the currently authenticated user |

---

## Subjects

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/subjects | Get all subjects for the current user |
| GET | /api/subjects/:id | Get a single subject |
| POST | /api/subjects | Create a subject |
| PATCH | /api/subjects/:id | Update a subject |
| DELETE | /api/subjects/:id | Delete a subject |

---

## Attendance

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/attendance | Get attendance records |
| GET | /api/attendance/:subjectId | Get attendance for a subject |
| POST | /api/attendance | Create an attendance record |
| PATCH | /api/attendance/:subjectId | Update attendance for a subject |

The backend calculates attendance percentage.

Formula:

attendance percentage = (attended / total) × 100

---

## Assignments

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/assignments | Get assignments |
| GET | /api/assignments/:id | Get a single assignment |
| POST | /api/assignments | Create an assignment |
| PATCH | /api/assignments/:id | Update an assignment |
| DELETE | /api/assignments/:id | Delete an assignment |

---

## Timetable

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/timetable | Get timetable entries |
| POST | /api/timetable | Create a timetable entry |
| PATCH | /api/timetable/:id | Update a timetable entry |
| DELETE | /api/timetable/:id | Delete a timetable entry |

---

## Events

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/events | Get events |
| POST | /api/events | Create an event |
| PATCH | /api/events/:id | Update an event |
| DELETE | /api/events/:id | Delete an event |

---

## Notices

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/notices | Get notices |
| GET | /api/notices/:id | Get a single notice |
| POST | /api/notices | Create a notice |
| PATCH | /api/notices/:id | Update a notice |
| DELETE | /api/notices/:id | Delete a notice |

---

## Resources

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/resources | Get resources |
| GET | /api/resources/:id | Get a single resource |
| POST | /api/resources | Create a resource |
| PATCH | /api/resources/:id | Update a resource |
| DELETE | /api/resources/:id | Delete a resource |

---

## Response Format

All API responses should follow a consistent structure.

### Successful Response

```json
{
  "success": true,
  "data": {}
}

### For a list:

{
  "success": true,
  "data": []
}

### For a successful creation:

{
  "success": true,
  "data": {},
  "message": "Created successfully"
}

### Error Response

{
  "success": false,
  "message": "Something went wrong"
}

### Example:

{
  "success": false,
  "message": "Subject not found"
}

## HTTP Status Codes

Status Code	Meaning
200	Request successful
201	Resource successfully created
400	Bad request / invalid input
401	Authentication required or invalid
403	User does not have permission
404	Resource not found
409	Conflict
500	Internal server error

## JWT Authentication
Protected endpoints require a valid JWT.

The client will send the token using:

Authorization: Bearer <token>

Authentication middleware will verify the token before allowing access to protected resources.

## API Design Rules

1. Use REST-style endpoints.
2. Use JSON for request and response bodies.
3. Use appropriate HTTP methods.
4. Use appropriate HTTP status codes.
5. Keep response formats consistent.
6. Do not expose passwords or password hashes through the API.
7. User-specific data must only be accessible to the authenticated user.
8. Validate incoming request data on the backend.
9. Keep database logic separate from route definitions.
10. Return useful error messages without exposing sensitive server details.