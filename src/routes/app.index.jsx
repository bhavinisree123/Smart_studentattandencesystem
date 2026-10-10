import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Filler,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { AlertTriangle, ArrowRight, CalendarCheck, Percent, Users } from 'lucide-react'
import { PageHeader } from '../components/AppShell'
import { Panel, Meter, Stat, chartOptions } from '../components/ui'
import { scopeFor, scopeRecords } from '../lib/scope'
import { subjects, students, TODAY, sessionsHeldOn, ATTENDANCE_THRESHOLD } from '../data/fixtures'
import { useCurrentUser, useRecords, summarize, pct } from '../data/store'
import { can } from '../lib/rbac'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Filler)

export const Route = createFileRoute('/app/')({
  component: Dashboard,
})

function weekStart(date) {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}

// "Dr. Meera Iyer" → "Dr. Iyer", "Ananya Sharma" → "Ananya"
function greetingName(name) {
  const parts = name.split(' ')
  return parts[0].endsWith('.') ? `${parts[0]} ${parts.at(-1)}` : parts[0]
}

const fmtShort = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })

function Dashboard() {
  const user = useCurrentUser()
  const allRecords = useRecords()
  const scope = scopeFor(user)

  const records = useMemo(() => scopeRecords(allRecords, scope), [allRecords, user.id])
  const visibleSubjects = subjects.filter((s) => !scope.subjectIds || scope.subjectIds.includes(s.id))
  const rows = summarize(records, scope)

  const present = records.filter((r) => r.status === 'present').length
  const overall = pct(present, records.length)
  const sessions = new Set(records.map((r) => `${r.subjectId}|${r.date}`)).size
  const atRisk = rows.filter((r) => r.atRisk).sort((a, b) => a.percent - b.percent)

  const todays = sessionsHeldOn(TODAY).filter((id) => !scope.subjectIds || scope.subjectIds.includes(id))
  const markedToday = todays.filter((id) => records.some((r) => r.subjectId === id && r.date === TODAY))

  const weekly = useMemo(() => {
    const map = new Map()
    for (const r of records) {
      const w = weekStart(r.date)
      const e = map.get(w) ?? { p: 0, t: 0 }
      e.t++
      if (r.status === 'present') e.p++
      map.set(w, e)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [records])

  const bySubject = visibleSubjects.map((s) => {
    const rs = records.filter((r) => r.subjectId === s.id)
    return { subject: s, percent: pct(rs.filter((r) => r.status === 'present').length, rs.length) }
  })

  const isStudent = user.role === 'student'

  return (
    <>
      <PageHeader
        eyebrow={isStudent ? 'My attendance' : user.role === 'teacher' ? 'My subjects' : 'Department overview'}
        title={`Good morning, ${greetingName(user.name)}.`}
      >
        {can(user, 'attendance:mark') && (
          <Link
            to="/app/attendance"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-moss"
          >
            Take attendance <ArrowRight size={16} />
          </Link>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Percent}
          label={isStudent ? 'My overall attendance' : 'Overall attendance'}
          value={`${overall}%`}
          tone={overall < ATTENDANCE_THRESHOLD ? 'bad' : 'good'}
        />
        <Stat icon={CalendarCheck} label="Sessions recorded" value={sessions} />
        {isStudent ? (
          <Stat
            icon={AlertTriangle}
            label={`Subjects below ${ATTENDANCE_THRESHOLD}%`}
            value={bySubject.filter((b) => b.percent < ATTENDANCE_THRESHOLD).length}
            tone={bySubject.some((b) => b.percent < ATTENDANCE_THRESHOLD) ? 'bad' : 'good'}
          />
        ) : (
          <Stat icon={AlertTriangle} label={`Students below ${ATTENDANCE_THRESHOLD}%`} value={atRisk.length} tone={atRisk.length ? 'bad' : 'good'} />
        )}
        <Stat
          icon={Users}
          label={isStudent ? 'Classes today' : "Today's registers"}
          value={isStudent ? todays.length : `${markedToday.length} / ${todays.length}`}
          hint={isStudent ? fmtShort(TODAY) : 'marked'}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Panel title="Weekly attendance" subtitle="% present, last 7 weeks" className="lg:col-span-3">
          <div className="h-64">
            <Line
              data={{
                labels: weekly.map(([w]) => fmtShort(w)),
                datasets: [
                  {
                    data: weekly.map(([, e]) => pct(e.p, e.t)),
                    borderColor: '#2f6b4f',
                    backgroundColor: 'rgba(47,107,79,0.12)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 3,
                    pointBackgroundColor: '#2f6b4f',
                  },
                  {
                    data: weekly.map(() => ATTENDANCE_THRESHOLD),
                    borderColor: '#c2410c',
                    borderDash: [5, 5],
                    borderWidth: 1.5,
                    pointRadius: 0,
                  },
                ],
              }}
              options={chartOptions({ min: 50, max: 100 })}
            />
          </div>
        </Panel>

        <Panel title="By subject" subtitle="% present" className="lg:col-span-2">
          <div className="h-64">
            <Bar
              data={{
                labels: bySubject.map((b) => b.subject.code),
                datasets: [
                  {
                    data: bySubject.map((b) => b.percent),
                    backgroundColor: bySubject.map((b) =>
                      b.percent < ATTENDANCE_THRESHOLD ? '#c2410c' : b.subject.color,
                    ),
                    borderRadius: 6,
                    maxBarThickness: 42,
                  },
                ],
              }}
              options={chartOptions({ min: 0, max: 100 })}
            />
          </div>
        </Panel>
      </div>

      {isStudent ? (
        <Panel title="My subjects" className="mt-6">
          <ul className="divide-y divide-line">
            {bySubject.map(({ subject, percent }) => (
              <li key={subject.id} className="flex items-center gap-4 py-3">
                <span className="num w-14 text-xs text-ink-faint">{subject.code}</span>
                <span className="flex-1">{subject.name}</span>
                <Meter value={percent} />
              </li>
            ))}
          </ul>
        </Panel>
      ) : (
        <Panel
          title="Needs attention"
          subtitle={`Below the ${ATTENDANCE_THRESHOLD}% exam eligibility line`}
          className="mt-6"
          action={
            <Link to="/app/reports" className="text-sm text-moss hover:underline">
              Full report →
            </Link>
          }
        >
          {atRisk.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-soft">Everyone is above the line. 🎉</p>
          ) : (
            <ul className="divide-y divide-line">
              {atRisk.map((r) => (
                <li key={r.student.id} className="flex items-center gap-4 py-3">
                  <span className="num w-20 text-xs text-ink-faint">{r.student.rollNo}</span>
                  <span className="flex-1 font-medium">{r.student.name}</span>
                  <span className="num hidden text-xs text-ink-faint sm:inline">
                    {r.present}/{r.total} sessions
                  </span>
                  <Meter value={r.percent} />
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-ink-faint">
            {students.length} students enrolled · {visibleSubjects.length} subjects in scope
          </p>
        </Panel>
      )}
    </>
  )
}
