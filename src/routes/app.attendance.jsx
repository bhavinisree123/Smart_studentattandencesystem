import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { Check, CheckCheck, RotateCcw, Search, Save, X, Info } from 'lucide-react'
import { PageHeader, AccessDenied } from '../components/AppShell'
import { students, subjects, TODAY, sessionsHeldOn } from '../data/fixtures'
import { useCurrentUser, useRecords, saveRegister } from '../data/store'
import { can, canActOnSubject } from '../lib/rbac'

export const Route = createFileRoute('/app/attendance')({
  component: MarkAttendance,
})

function MarkAttendance() {
  const user = useCurrentUser()
  if (!can(user, 'attendance:mark')) return <AccessDenied permission="attendance:mark" />
  return <Register key={user.id} user={user} />
}

function Register({ user }) {
  const records = useRecords()
  const mySubjects = subjects.filter((s) => canActOnSubject(user, s.id))
  const scheduledToday = sessionsHeldOn(TODAY).find((id) => mySubjects.some((s) => s.id === id))

  const [subjectId, setSubjectId] = useState(scheduledToday ?? mySubjects[0]?.id)
  const [date, setDate] = useState(TODAY)
  const [query, setQuery] = useState('')
  const [statuses, setStatuses] = useState({})
  const [savedAt, setSavedAt] = useState(null)

  const existing = useMemo(
    () => records.filter((r) => r.subjectId === subjectId && r.date === date),
    [records, subjectId, date],
  )
  const isEdit = existing.length > 0

  // Load the saved register for this subject + date, or start everyone as present.
  useEffect(() => {
    const next = {}
    for (const s of students) next[s.id] = 'present'
    for (const r of existing) next[r.studentId] = r.status
    setStatuses(next)
  }, [subjectId, date, existing.length])

  useEffect(() => setSavedAt(null), [subjectId, date])

  const subject = subjects.find((s) => s.id === subjectId)
  const scheduled = sessionsHeldOn(date).includes(subjectId)
  const presentCount = Object.values(statuses).filter((s) => s === 'present').length
  const absentees = students.filter((s) => statuses[s.id] === 'absent')
  const visible = students.filter(
    (s) => !query || `${s.name} ${s.rollNo}`.toLowerCase().includes(query.toLowerCase()),
  )
  const dirty = !isEdit || existing.some((r) => statuses[r.studentId] !== r.status)
  const blockedEdit = isEdit && !can(user, 'attendance:edit')

  const setAll = (status) => {
    const next = {}
    for (const s of students) next[s.id] = status
    setStatuses(next)
  }
  const toggle = (id) =>
    setStatuses((s) => ({ ...s, [id]: s[id] === 'present' ? 'absent' : 'present' }))

  const onSave = () => {
    saveRegister({ subjectId, date, statuses, markedBy: user.id })
    setSavedAt(new Date())
  }

  return (
    <>
      <PageHeader eyebrow="Register" title="Mark attendance">
        <span className="num rounded-full border border-line bg-card px-3 py-1.5 text-xs text-ink-soft">
          Signed in as {user.name}
        </span>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="overflow-hidden rounded-2xl border border-line bg-card">
          <div className="grid gap-3 border-b border-line p-5 sm:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="text-xs text-ink-faint">Subject</span>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2.5 font-medium outline-none focus:border-ink"
              >
                {mySubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} · {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-ink-faint">Date</span>
              <input
                type="date"
                value={date}
                max={TODAY}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                className="num mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2.5 outline-none focus:border-ink"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-paper-deep/40 px-5 py-3">
            <div className="relative mr-auto">
              <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or roll no."
                className="w-56 rounded-full border border-line bg-card py-1.5 pr-3 pl-9 text-sm outline-none focus:border-ink"
              />
            </div>
            <button type="button" onClick={() => setAll('present')} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-sm hover:border-moss hover:text-moss">
              <CheckCheck size={15} /> All present
            </button>
            <button type="button" onClick={() => setAll('absent')} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-sm hover:border-vermilion hover:text-vermilion">
              <RotateCcw size={15} /> All absent
            </button>
          </div>

          <ul className="ruled">
            {visible.map((s) => {
              const present = statuses[s.id] === 'present'
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => toggle(s.id)}
                    aria-pressed={present}
                    className="flex h-14 w-full items-center gap-4 px-5 text-left transition hover:bg-paper/70"
                  >
                    <span className="num w-20 text-xs text-ink-faint">{s.rollNo}</span>
                    <span className={`flex-1 ${present ? '' : 'text-ink-faint line-through decoration-vermilion/50'}`}>{s.name}</span>
                    <span className="flex overflow-hidden rounded-lg border border-line text-xs font-semibold">
                      <span className={`num flex items-center gap-1 px-3 py-1.5 ${present ? 'bg-moss text-white' : 'text-ink-faint'}`}>
                        <Check size={13} /> P
                      </span>
                      <span className={`num flex items-center gap-1 px-3 py-1.5 ${!present ? 'bg-vermilion text-white' : 'text-ink-faint'}`}>
                        <X size={13} /> A
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
            {visible.length === 0 && <li className="p-8 text-center text-sm text-ink-faint">No students match “{query}”.</li>}
          </ul>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl bg-ink p-6 text-paper">
            <p className="text-xs tracking-wider text-saffron uppercase">{subject?.code}</p>
            <p className="mt-1 font-display text-xl leading-snug font-semibold">{subject?.name}</p>
            <p className="mt-1 text-sm text-paper/60">
              {new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-paper/10 p-3">
                <p className="num text-3xl font-semibold text-[#9fd3b4]">{presentCount}</p>
                <p className="text-xs text-paper/60">present</p>
              </div>
              <div className="rounded-xl bg-paper/10 p-3">
                <p className="num text-3xl font-semibold text-[#f4a582]">{students.length - presentCount}</p>
                <p className="text-xs text-paper/60">absent</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onSave}
              disabled={!dirty || blockedEdit}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-saffron px-5 py-3 font-medium text-ink transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save size={17} /> {isEdit ? 'Update register' : 'Save register'}
            </button>
            {savedAt && (
              <p className="mt-3 text-center text-xs text-[#9fd3b4]">
                Saved at {savedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          {(isEdit || !scheduled) && (
            <div className="flex gap-3 rounded-2xl border border-line bg-card p-4 text-sm text-ink-soft">
              <Info size={18} className="mt-0.5 shrink-0 text-ink-faint" />
              <div className="space-y-1">
                {isEdit && <p>A register already exists for this session — changes will update it.</p>}
                {!scheduled && <p>{subject?.code} isn't on the timetable for this day. You can still record an extra class.</p>}
              </div>
            </div>
          )}

          {absentees.length > 0 && (
            <div className="rounded-2xl border border-line bg-card p-4">
              <p className="text-xs tracking-wider text-ink-faint uppercase">Absentees</p>
              <ul className="mt-2 space-y-1 text-sm">
                {absentees.map((s) => (
                  <li key={s.id} className="flex justify-between">
                    <span>{s.name}</span>
                    <span className="num text-xs text-ink-faint">{s.rollNo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
