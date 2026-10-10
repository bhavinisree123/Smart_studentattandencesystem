import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CheckCheck,
  FileBarChart2,
  ShieldCheck,
  BellRing,
  Users,
  GraduationCap,
  KeyRound,
} from 'lucide-react'
import { Logo } from '../components/Logo'
import { ROLES, permissionsFor } from '../lib/rbac'

export const Route = createFileRoute('/')({
  component: Landing,
})

const register = [
  { roll: '21A01', name: 'Aarav Mehta', present: true },
  { roll: '21A02', name: 'Diya Patel', present: true },
  { roll: '21A03', name: 'Kabir Singh', present: false },
  { roll: '21A04', name: 'Ananya Sharma', present: true },
  { roll: '21A05', name: 'Vihaan Gupta', present: true },
  { roll: '21A06', name: 'Ishita Reddy', present: true },
]

const features = [
  {
    icon: CheckCheck,
    title: 'Mark a class in under a minute',
    body: 'Pick a subject and date, everyone starts present, tap the absentees. Corrections are one click away.',
  },
  {
    icon: FileBarChart2,
    title: 'Reports that answer real questions',
    body: 'Subject-wise and student-wise percentages, date ranges, and CSV export for the exam cell.',
  },
  {
    icon: BellRing,
    title: 'Catch shortfalls before exams do',
    body: 'Anyone below the 75% eligibility line is flagged on the dashboard while there is still time to recover.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access, enforced twice',
    body: 'One permission map guards both the interface and every API route. Teachers only touch their own subjects.',
  },
]

const roleIcons = { admin: KeyRound, teacher: Users, student: GraduationCap }

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-6 text-sm text-ink-soft">
          <a href="#features" className="hidden hover:text-ink sm:inline">Features</a>
          <a href="#roles" className="hidden hover:text-ink sm:inline">Roles</a>
          <Link
            to="/app"
            className="rounded-full bg-ink px-4 py-2 font-medium text-paper transition hover:bg-moss"
          >
            Open dashboard
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pt-10 pb-24 lg:grid-cols-[1.1fr_1fr]">
        <div className="rise">
          <p className="num mb-5 inline-block rounded-full border border-line bg-card px-3 py-1 text-xs tracking-wide text-ink-soft uppercase">
            Attendance · Reports · RBAC
          </p>
          <h1 className="font-display text-5xl leading-[1.02] font-extrabold tracking-tight sm:text-7xl">
            The class register,
            <br />
            <span className="italic text-moss">finally smart.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Rollcall tracks every student, subject and session — present or absent — and turns it
            into reports your department can act on. Admins, teachers and students each see exactly
            what they should, and nothing more.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/app/attendance"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-paper transition hover:bg-moss"
            >
              Take today's roll
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
            <Link
              to="/app/reports"
              className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 font-medium transition hover:border-ink"
            >
              View reports
            </Link>
          </div>
        </div>

        <div className="rise relative" style={{ animationDelay: '120ms' }}>
          <div className="absolute -inset-4 -rotate-2 rounded-3xl bg-saffron/40" aria-hidden />
          <div className="ruled relative overflow-hidden rounded-2xl border border-line bg-card shadow-[0_30px_60px_-30px_rgb(28_26_23/0.35)]">
            <div className="flex items-baseline justify-between border-b border-line px-6 py-4">
              <div>
                <p className="font-display text-xl font-semibold">CS301 · DBMS</p>
                <p className="text-sm text-ink-faint">Fri, 9 Oct 2026 · Section A</p>
              </div>
              <p className="num text-sm text-moss">5 / 6 present</p>
            </div>
            <ul>
              {register.map((s) => (
                <li key={s.roll} className="flex h-12 items-center gap-4 px-6">
                  <span className="num w-14 text-xs text-ink-faint">{s.roll}</span>
                  <span className="flex-1">{s.name}</span>
                  <span
                    className={`num rounded-md px-2.5 py-1 text-xs font-semibold ${
                      s.present ? 'bg-moss-soft text-moss' : 'bg-vermilion-soft text-vermilion'
                    }`}
                  >
                    {s.present ? 'P' : 'A'}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-line bg-paper-deep/60 px-6 py-3 text-sm">
              <span className="text-ink-soft">Kabir is at 64% in DBMS</span>
              <span className="num rounded bg-vermilion px-2 py-0.5 text-xs text-white">AT RISK</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-6xl gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-card p-8">
              <Icon className="text-moss" size={26} strokeWidth={1.8} />
              <h3 className="mt-5 font-display text-xl font-semibold leading-snug">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl font-extrabold tracking-tight">Three roles. Clear boundaries.</h2>
          <p className="mt-4 text-ink-soft">
            Every action in Rollcall maps to a named permission. The dashboard lets you switch roles
            to preview exactly what each person can see and do.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {Object.entries(ROLES).map(([key, role]) => {
            const Icon = roleIcons[key]
            return (
              <div key={key} className="rounded-2xl border border-line bg-card p-7">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-ink text-saffron">
                    <Icon size={20} />
                  </span>
                  <h3 className="font-display text-2xl font-semibold">{role.label}</h3>
                </div>
                <p className="mt-4 text-sm text-ink-soft">{role.description}</p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {permissionsFor(key).map((p) => (
                    <li key={p} className="num rounded border border-line bg-paper px-2 py-0.5 text-[11px] text-ink-soft">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="ruled flex flex-col items-start justify-between gap-6 rounded-3xl bg-ink px-10 py-12 text-paper md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold">See it with real-looking data.</h2>
            <p className="mt-2 text-paper/70">
              18 students, 5 subjects, seven weeks of sessions — ready to explore.
            </p>
          </div>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-3 font-medium text-ink transition hover:bg-paper"
          >
            Open the dashboard <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-6 py-8 text-sm text-ink-faint sm:flex-row">
          <span>Rollcall — smart student attendance</span>
          <span>React · Express REST API · Role-based access control</span>
        </div>
      </footer>
    </div>
  )
}
