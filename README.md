# Rollcall — Smart Student Attendance System

Rollcall tracks attendance per **student, subject and date (present/absent)** and turns
it into reports. It has three roles — **Admin**, **Teacher** and **Student** — and every
screen and action is gated by a shared role-based access control (RBAC) permission map.

## What works today
- **Landing page** (`/`) — product overview and the permissions of each role.
- **Dashboard** (`/app`) — overall %, sessions recorded, students below 75%, today's
  registers, weekly trend and subject-wise charts, at-risk list. Scoped by role.
- **Mark attendance** (`/app/attendance`) — choose subject + date, toggle P/A per student,
  bulk mark, search, save or update an existing register. Teachers only see their subjects;
  students are denied.
- **Reports** (`/app/reports`) — student × subject matrix with date range and subject filters,
  "below 75%" filter, sorting and CSV export. Students see only their own report and history.

Use the **Preview as role** switcher in the sidebar to see how each role's access changes.
Data is currently realistic demo data held in the browser (resets on reload).

## Tech stack
- React 19 + JavaScript (JSX), TanStack Start/Router, Vite
- Tailwind CSS 4, Chart.js, lucide-react
- Netlify hosting; Express REST API, database and auth are on the roadmap

## Run locally
```bash
pnpm install
pnpm dev            # http://localhost:3000
# or, with Netlify emulation:
netlify dev
```

## Roadmap
See [PLAN.md](./PLAN.md): persistence (Netlify Database), Express REST API as a Netlify
Function, authentication with server-side RBAC enforcement, admin CRUD screens for
students/subjects/users, and reporting extras.
