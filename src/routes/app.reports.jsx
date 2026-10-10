import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Download, ArrowUpDown } from 'lucide-react'
import { PageHeader, AccessDenied } from '../components/AppShell'
import { Panel, Meter } from '../components/ui'
import { subjects, students, TODAY, ATTENDANCE_THRESHOLD } from '../data/fixtures'
import { useCurrentUser, useRecords, summarize, pct } from '../data/store'
import { scopeFor, scopeRecords } from '../lib/scope'
import { can } from '../lib/rbac'

export const Route = createFileRoute('/app/reports')({
  component: Reports,
})

const fmt = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })

function Reports() {
  const user = useCurrentUser()
  if (!can(user, 'reports:view-all') && !can(user, 'reports:view-own')) {
    return <AccessDenied permission="reports:view-own" />
  }
  return <ReportView key={user.id} user={user} />
}

function ReportView({ user }) {
  const allRecords = useRecords()
  const scope = scopeFor(user)
  const records = useMemo(() => scopeRecords(allRecords, scope), [allRecords, user.id])
  const visibleSubjects = subjects.filter((s) => !scope.subjectIds || scope.subjectIds.includes(s.id))
  const isStudent = user.role === 'student'

  const firstDate = records.reduce((m, r) => (r.date < m ? r.date : m), TODAY)
  const [from, setFrom] = useState(firstDate)
  const [to, setTo] = useState(TODAY)
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [riskOnly, setRiskOnly] = useState(false)
  const [sortAsc, setSortAsc] = useState(true)

  const subjectIds = subjectFilter === 'all' ? visibleSubjects.map((s) => s.id) : [subjectFilter]
  const columns = visibleSubjects.filter((s) => subjectIds.includes(s.id))

  const rows = summarize(records, { studentIds: scope.studentIds, subjectIds, from, to })
    .filter((r) => !riskOnly || r.atRisk)
    .sort((a, b) => (sortAsc ? a.percent - b.percent : b.percent - a.percent))

  const totals = rows.reduce((acc, r) => ({ p: acc.p + r.present, t: acc.t + r.total }), { p: 0, t: 0 })

  const exportCsv = () => {
    const header = ['Roll No', 'Name', ...columns.map((c) => `${c.code} %`), 'Present', 'Total', 'Overall %', 'Eligible']
    const lines = rows.map((r) => [
      r.student.rollNo,
      r.student.name,
      ...columns.map((c) => pct(r.bySubject[c.id].present, r.bySubject[c.id].total)),
      r.present,
      r.total,
      r.percent,
      r.atRisk ? 'No' : 'Yes',
    ])
    const csv = [header, ...lines].map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-report_${from}_to_${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const history = isStudent
    ? records
        .filter((r) => r.date >= from && r.date <= to && subjectIds.includes(r.subjectId))
        .sort((a, b) => b.date.localeCompare(a.date) || a.subjectId.localeCompare(b.subjectId))
        .slice(0, 40)
    : []

  return (
    <>
      <PageHeader eyebrow={isStudent ? 'My report' : 'Reports'} title={isStudent ? 'My attendance report' : 'Attendance report'}>
        {can(user, 'reports:export') && (
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-moss"
          >
            <Download size={16} /> Export CSV
          </button>
        )}
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-card p-4">
        <Field label="Subject">
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className={inputCls}>
            <option value="all">All subjects</option>
            {visibleSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} · {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="From">
          <input type="date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} className={`num ${inputCls}`} />
        </Field>
        <Field label="To">
          <input type="date" value={to} min={from} max={TODAY} onChange={(e) => e.target.value && setTo(e.target.value)} className={`num ${inputCls}`} />
        </Field>
        {!isStudent && (
          <label className="flex cursor-pointer items-center gap-2 px-2 py-2.5 text-sm">
            <input type="checkbox" checked={riskOnly} onChange={(e) => setRiskOnly(e.target.checked)} className="size-4 accent-vermilion" />
            Below {ATTENDANCE_THRESHOLD}% only
          </label>
        )}
        <div className="ml-auto text-right">
          <p className="text-xs text-ink-faint">{isStudent ? 'Overall' : 'Class average'}</p>
          <p className="num text-2xl font-semibold">{pct(totals.p, totals.t)}%</p>
        </div>
      </div>

      <section className="overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line bg-paper-deep/50 text-left text-xs text-ink-faint">
              <th className="px-5 py-3 font-medium">Roll no.</th>
              <th className="px-3 py-3 font-medium">Student</th>
              {columns.map((c) => (
                <th key={c.id} className="num px-3 py-3 text-right font-medium" title={c.name}>
                  {c.code}
                </th>
              ))}
              <th className="px-5 py-3 text-right font-medium">
                <button type="button" onClick={() => setSortAsc((v) => !v)} className="inline-flex items-center gap-1 hover:text-ink">
                  Overall <ArrowUpDown size={13} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.student.id} className={r.atRisk ? 'bg-vermilion-soft/30' : ''}>
                <td className="num px-5 py-3 text-xs text-ink-faint">{r.student.rollNo}</td>
                <td className="px-3 py-3">
                  <p className="font-medium">{r.student.name}</p>
                  <p className="text-xs text-ink-faint">{r.student.email}</p>
                </td>
                {columns.map((c) => {
                  const { present, total } = r.bySubject[c.id]
                  const p = pct(present, total)
                  return (
                    <td key={c.id} className="px-3 py-3 text-right">
                      <span className={`num ${total && p < ATTENDANCE_THRESHOLD ? 'font-semibold text-vermilion' : ''}`}>
                        {total ? `${p}%` : '—'}
                      </span>
                      <p className="num text-[11px] text-ink-faint">{present}/{total}</p>
                    </td>
                  )
                })}
                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <Meter value={r.percent} />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 3} className="p-10 text-center text-ink-faint">
                  No students match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      {!isStudent && (
        <p className="mt-3 text-xs text-ink-faint">
          Showing {rows.length} of {students.length} students · rows highlighted are below the {ATTENDANCE_THRESHOLD}% exam eligibility line
        </p>
      )}

      {isStudent && (
        <Panel title="Session history" subtitle="Most recent first" className="mt-6">
          <ul className="divide-y divide-line">
            {history.map((r) => {
              const s = subjects.find((x) => x.id === r.subjectId)
              return (
                <li key={r.id} className="flex items-center gap-4 py-2.5 text-sm">
                  <span className="num w-28 text-xs text-ink-faint">{fmt(r.date)}</span>
                  <span className="num w-14 text-xs">{s.code}</span>
                  <span className="flex-1 truncate text-ink-soft">{s.name}</span>
                  <span
                    className={`num rounded-md px-2.5 py-1 text-xs font-semibold ${
                      r.status === 'present' ? 'bg-moss-soft text-moss' : 'bg-vermilion-soft text-vermilion'
                    }`}
                  >
                    {r.status === 'present' ? 'Present' : 'Absent'}
                  </span>
                </li>
              )
            })}
          </ul>
        </Panel>
      )}
    </>
  )
}

const inputCls = 'mt-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-ink-faint">{label}</span>
      <div>{children}</div>
    </label>
  )
}
