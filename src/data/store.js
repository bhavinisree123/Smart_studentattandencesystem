import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'
import { initialRecords, users, students, subjects, ATTENDANCE_THRESHOLD } from './fixtures'

// Client-side store standing in for the REST API until persistence lands.
export const appStore = new Store({
  currentUserId: 'u-admin',
  records: initialRecords,
})

export function useCurrentUser() {
  const id = useStore(appStore, (s) => s.currentUserId)
  return users.find((u) => u.id === id)
}

export function useRecords() {
  return useStore(appStore, (s) => s.records)
}

export function switchUser(userId) {
  appStore.setState((s) => ({ ...s, currentUserId: userId }))
}

// Upsert a whole register for one subject + date.
export function saveRegister({ subjectId, date, statuses, markedBy }) {
  appStore.setState((s) => {
    const others = s.records.filter((r) => !(r.subjectId === subjectId && r.date === date))
    const fresh = Object.entries(statuses).map(([studentId, status]) => ({
      id: `${subjectId}-${date}-${studentId}`,
      studentId,
      subjectId,
      date,
      status,
      markedBy,
    }))
    return { ...s, records: [...others, ...fresh] }
  })
}

export function pct(present, total) {
  return total === 0 ? 0 : Math.round((present / total) * 1000) / 10
}

// Per-student, per-subject attendance summary used by dashboard and reports.
export function summarize(records, { studentIds, subjectIds, from, to } = {}) {
  const rows = students
    .filter((s) => !studentIds || studentIds.includes(s.id))
    .map((s) => {
      const bySubject = {}
      let present = 0
      let total = 0
      for (const sub of subjects) {
        if (subjectIds && !subjectIds.includes(sub.id)) continue
        bySubject[sub.id] = { present: 0, total: 0 }
      }
      for (const r of records) {
        if (r.studentId !== s.id || !bySubject[r.subjectId]) continue
        if (from && r.date < from) continue
        if (to && r.date > to) continue
        bySubject[r.subjectId].total++
        total++
        if (r.status === 'present') {
          bySubject[r.subjectId].present++
          present++
        }
      }
      const percent = pct(present, total)
      return { student: s, bySubject, present, total, percent, atRisk: total > 0 && percent < ATTENDANCE_THRESHOLD }
    })
  return rows
}
