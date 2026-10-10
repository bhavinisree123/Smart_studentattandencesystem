// Demo data for the product surface. Everything the UI reads lives here so a
// later milestone can swap these exports for real API calls (see PLAN.md).

export const institution = {
  name: 'Northfield Institute of Technology',
  term: 'Autumn 2026 · Semester 5',
  className: 'B.Tech CSE — Section A',
}

export const users = [
  { id: 'u-admin', name: 'Dr. Meera Iyer', email: 'admin@northfield.edu', role: 'admin', title: 'Head of Department' },
  { id: 'u-teacher', name: 'Prof. Arjun Rao', email: 'arjun.rao@northfield.edu', role: 'teacher', title: 'Faculty · DBMS & Networks', subjectIds: ['dbms', 'cn'] },
  { id: 'u-student', name: 'Ananya Sharma', email: 'ananya.s@northfield.edu', role: 'student', title: 'Student · Roll CSE-21A04', studentId: 's04' },
]

export const subjects = [
  { id: 'dbms', code: 'CS301', name: 'Database Management Systems', teacher: 'Prof. Arjun Rao', color: '#2f6b4f' },
  { id: 'cn', code: 'CS302', name: 'Computer Networks', teacher: 'Prof. Arjun Rao', color: '#b4532a' },
  { id: 'os', code: 'CS303', name: 'Operating Systems', teacher: 'Dr. Kavya Menon', color: '#3d5a99' },
  { id: 'web', code: 'CS304', name: 'Web Technologies (MERN)', teacher: 'Ms. Fatima Khan', color: '#8a6d1f' },
  { id: 'math', code: 'MA305', name: 'Discrete Mathematics', teacher: 'Dr. Vikram Joshi', color: '#6d3d7a' },
]

const studentNames = [
  'Aarav Mehta', 'Diya Patel', 'Kabir Singh', 'Ananya Sharma', 'Vihaan Gupta',
  'Ishita Reddy', 'Rohan Nair', 'Saanvi Kulkarni', 'Aditya Verma', 'Meher Kapoor',
  'Arjun Das', 'Tara Bhat', 'Neel Chatterjee', 'Riya Fernandes', 'Kunal Joshi',
  'Pooja Iyer', 'Siddharth Rao', 'Zara Khan',
]

export const students = studentNames.map((name, i) => {
  const n = String(i + 1).padStart(2, '0')
  return {
    id: `s${n}`,
    rollNo: `CSE-21A${n}`,
    name,
    email: `${name.split(' ')[0].toLowerCase()}.${name.split(' ')[1][0].toLowerCase()}@northfield.edu`,
    section: 'A',
  }
})

// Deterministic PRNG so the demo looks identical on every load (and on SSR).
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Each student has a baseline reliability so reports show a realistic spread.
const reliability = [0.95, 0.9, 0.68, 0.88, 0.82, 0.97, 0.6, 0.91, 0.86, 0.79, 0.93, 0.72, 0.89, 0.84, 0.66, 0.94, 0.87, 0.9]

// Weekly timetable: day of week (1 = Mon) → subject ids held that day.
const timetable = {
  1: ['dbms', 'os', 'math'],
  2: ['cn', 'web'],
  3: ['dbms', 'os', 'web'],
  4: ['cn', 'math'],
  5: ['dbms', 'web', 'os'],
}

export const TODAY = '2026-10-09'

export function toISODate(d) {
  return d.toISOString().slice(0, 10)
}

function buildRecords() {
  const rand = mulberry32(2026)
  const records = []
  const end = new Date(`${TODAY}T00:00:00Z`)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - 7 * 7)
  // Stop before TODAY so today's registers are still waiting to be taken.
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    const held = timetable[d.getUTCDay()]
    if (!held) continue
    const date = toISODate(d)
    for (const subjectId of held) {
      students.forEach((s, i) => {
        const present = rand() < reliability[i]
        records.push({
          id: `${subjectId}-${date}-${s.id}`,
          studentId: s.id,
          subjectId,
          date,
          status: present ? 'present' : 'absent',
          markedBy: 'u-teacher',
        })
      })
    }
  }
  return records
}

export const initialRecords = buildRecords()

export function sessionsHeldOn(date) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay()
  return timetable[day] ?? []
}

// Minimum attendance a student needs to sit end-semester exams.
export const ATTENDANCE_THRESHOLD = 75
