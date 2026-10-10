# AGENTS.md

Rollcall is a smart student attendance system (attendance per student/subject/date,
reports, role-based access). **Read `PLAN.md` first** — Milestone 1 (UI surface) is done;
continue from the next unchecked milestone.

## Stack
- TanStack Start (React 19) on Vite, deployed to Netlify (`@netlify/vite-plugin-tanstack-start`).
- **Application code is JavaScript (`.jsx`/`.js`)** — the user asked for JavaScript. Only
  framework glue (`src/router.tsx`, generated `routeTree.gen.ts`) is TS. `tsconfig.json` has `allowJs`.
- Tailwind CSS 4 with theme tokens in `src/styles.css` (`paper`, `ink`, `moss` = present,
  `vermilion` = absent, `saffron` accent; fonts Fraunces / IBM Plex Sans / JetBrains Mono).
- Chart.js via react-chartjs-2.

## Layout
```
src/
  routes/
    __root.jsx          # HTML shell, meta, fonts
    index.jsx           # Landing page
    app.jsx             # /app layout → AppShell (sidebar + role switcher)
    app.index.jsx       # Dashboard
    app.attendance.jsx  # Mark attendance register
    app.reports.jsx     # Reports + CSV export
  components/
    AppShell.jsx        # Sidebar nav, RoleSwitcher, PageHeader, AccessDenied
    ui.jsx              # Panel, Stat, Meter, chartOptions
    Logo.jsx
  data/
    fixtures.js         # ALL demo data (users, subjects, students, generated records)
    store.js            # @tanstack/store client store + summarize()/pct() helpers
  lib/
    rbac.js             # Permission map: can(), canActOnSubject(), ROLES
    scope.js            # Which students/subjects a user may see
```

## Conventions & decisions
- Route files only export `Route`; shared components go in `src/components`.
- RBAC: never check `user.role` for permissions in UI — use `can(user, 'perm')`. `rbac.js`
  is meant to be imported by the future Express middleware so UI and API enforce the same rules.
- Data scoping (teacher → own subjects, student → own records) goes through `lib/scope.js`.
- Demo "today" is fixed (`TODAY` in fixtures) and records are generated with a seeded PRNG so
  SSR and client render identically. Today's registers are intentionally left unmarked.
- Persistence must use Netlify Database (Postgres + Drizzle), not MongoDB — see PLAN.md M2.
  When it lands, replace `store.js` functions with API calls; keep their shapes.
- Status values are exactly `'present' | 'absent'`; eligibility threshold is `ATTENDANCE_THRESHOLD` (75).

## Commands
`pnpm dev` (port 3000), `netlify dev`. Don't commit build output.
