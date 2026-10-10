# Rollcall — Product Roadmap

Rollcall is a smart student attendance system: teachers mark present/absent per
student, subject and date; admins manage the roster; everyone gets reports scoped
to their role. Each milestone below is small and self-contained.

## ✅ Milestone 1 — Product surface (done)
- Landing page explaining the product and its three roles.
- Dashboard with KPIs, weekly trend, subject-wise chart and at-risk list, scoped per role.
- Mark-attendance register (subject + date, toggle P/A, bulk actions, save/update).
- Reports (student × subject matrix, date range, subject filter, below-75% filter, CSV export).
- Role preview switcher; shared permission map in `src/lib/rbac.js`.
- All data comes from `src/data/fixtures.js` via the client store in `src/data/store.js`.

## Milestone 2 — Data model & persistence
- Persist in **Netlify Database** (managed Postgres) with Drizzle ORM — the hosting
  platform's native database, used instead of MongoDB. The document shapes in
  `fixtures.js` map 1:1 to tables, so the API contract stays the same.
- Tables: `users` (id, name, email, role), `students` (roll_no unique, name, email, section),
  `subjects` (code unique, name), `teacher_subjects` (teacher_id, subject_id),
  `attendance` (student_id, subject_id, date, status `present|absent`, marked_by,
  updated_at; unique on student+subject+date).
- Seed script that loads the current fixtures.

## Milestone 3 — Express REST API
- Express app as a Netlify Function (`netlify/functions/api.js` via `serverless-http`), mounted at `/api/*`.
- Routes: `GET/POST/PUT/DELETE /api/students`, `/api/subjects`, `/api/users`,
  `GET /api/attendance?subjectId&date`, `PUT /api/attendance` (upsert a register),
  `GET /api/reports?from&to&subjectId`, `GET /api/reports.csv`.
- Input validation (zod), consistent JSON errors, pagination for lists.

## Milestone 4 — Authentication & RBAC enforcement
- Netlify Identity sign-up/login; roles stored in `app_metadata.authorization.roles`.
- Express middleware `requirePermission('attendance:mark')` reusing `src/lib/rbac.js`,
  plus subject-ownership checks for teachers and own-record scoping for students.
- Replace the role preview switcher with real sessions; protected routes redirect to login.
- Security hardening: invite-only admin/teacher roles, rate limiting on auth/API,
  audit log of every attendance edit (who/when/before/after).

## Milestone 5 — Admin management screens
- Students CRUD (add, edit, deactivate, bulk CSV import).
- Subjects CRUD and teacher assignment.
- User management: invite teachers, change roles.

## Milestone 6 — Wire the UI to the API
- Replace `src/data/store.js` calls with fetches to the API (TanStack Router loaders).
- Optimistic register saves, loading/empty/error states.

## Milestone 7 — Reporting extras
- Per-student detail page with calendar heatmap.
- Monthly PDF reports, scheduled weekly email to students below 75%.
