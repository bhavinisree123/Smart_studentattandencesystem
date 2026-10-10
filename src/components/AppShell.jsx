import { Link } from '@tanstack/react-router'
import { LayoutDashboard, ClipboardCheck, FileBarChart2, ShieldCheck } from 'lucide-react'
import { Logo } from './Logo'
import { users, institution } from '../data/fixtures'
import { useCurrentUser, switchUser } from '../data/store'
import { ROLES, can } from '../lib/rbac'

const nav = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard:view', exact: true },
  { to: '/app/attendance', label: 'Mark attendance', icon: ClipboardCheck, permission: 'attendance:mark' },
  { to: '/app/reports', label: 'Reports', icon: FileBarChart2, permission: null },
]

export function AppShell({ children }) {
  const user = useCurrentUser()

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="ruled flex flex-col bg-ink text-paper lg:sticky lg:top-0 lg:h-screen">
        <div className="px-6 py-6">
          <Logo dark />
          <p className="mt-4 text-xs leading-relaxed text-paper/55">
            {institution.name}
            <br />
            {institution.term}
          </p>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 lg:flex-col">
          {nav.map(({ to, label, icon: Icon, permission, exact }) => {
            const allowed = !permission || can(user, permission)
            if (!allowed) return null
            return (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-paper/75 transition hover:bg-paper/10 hover:text-paper"
                activeProps={{ className: '!bg-paper !text-ink font-medium' }}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto hidden p-4 lg:block">
          <RoleSwitcher user={user} />
        </div>
      </aside>

      <div className="min-w-0">
        <div className="border-b border-line bg-card px-4 py-3 lg:hidden">
          <RoleSwitcher user={user} compact />
        </div>
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  )
}

function RoleSwitcher({ user, compact = false }) {
  return (
    <div className={compact ? '' : 'rounded-xl border border-paper/15 bg-paper/5 p-4'}>
      <div className="flex items-center gap-2 text-[11px] tracking-wider text-saffron uppercase">
        <ShieldCheck size={14} /> Preview as role
      </div>
      <div className={`mt-2 grid grid-cols-3 gap-1 rounded-lg p-1 ${compact ? 'bg-paper-deep' : 'bg-paper/10'}`}>
        {users.map((u) => {
          const active = u.id === user.id
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => switchUser(u.id)}
              className={`rounded-md px-2 py-1.5 text-xs font-medium transition ${
                active
                  ? 'bg-saffron text-ink'
                  : compact
                    ? 'text-ink-soft hover:text-ink'
                    : 'text-paper/70 hover:text-paper'
              }`}
            >
              {ROLES[u.role].label}
            </button>
          )
        })}
      </div>
      {!compact && (
        <div className="mt-3">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-paper/55">{user.title}</p>
        </div>
      )}
    </div>
  )
}

export function PageHeader({ eyebrow, title, children }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && <p className="num text-xs tracking-wider text-ink-faint uppercase">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

export function AccessDenied({ permission }) {
  return (
    <div className="rounded-2xl border border-dashed border-vermilion/40 bg-vermilion-soft/40 p-10 text-center">
      <ShieldCheck className="mx-auto text-vermilion" size={32} />
      <h2 className="mt-4 font-display text-2xl font-semibold">You don't have access to this page</h2>
      <p className="mt-2 text-sm text-ink-soft">
        This action requires the <code className="num rounded bg-card px-1.5 py-0.5">{permission}</code>{' '}
        permission. Switch role in the sidebar to preview it.
      </p>
    </div>
  )
}
