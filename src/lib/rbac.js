// Role-based access control. One permission map shared by the UI today and by
// the Express API middleware in a later milestone, so both enforce the same rules.

export const ROLES = {
  admin: { label: 'Admin', description: 'Manages students, subjects, faculty and every record.' },
  teacher: { label: 'Teacher', description: 'Marks and corrects attendance for assigned subjects.' },
  student: { label: 'Student', description: 'Views their own attendance and reports.' },
}

const PERMISSIONS = {
  admin: [
    'dashboard:view', 'attendance:mark', 'attendance:edit', 'attendance:view-all',
    'reports:view-all', 'reports:export', 'students:manage', 'subjects:manage', 'users:manage',
  ],
  teacher: [
    'dashboard:view', 'attendance:mark', 'attendance:edit', 'attendance:view-all',
    'reports:view-all', 'reports:export',
  ],
  student: ['dashboard:view', 'reports:view-own'],
}

export function can(user, permission) {
  return Boolean(user && PERMISSIONS[user.role]?.includes(permission))
}

export function permissionsFor(role) {
  return PERMISSIONS[role] ?? []
}

// Teachers may only act on the subjects they're assigned; admins on all.
export function canActOnSubject(user, subjectId) {
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.role === 'teacher') return user.subjectIds?.includes(subjectId) ?? false
  return false
}
