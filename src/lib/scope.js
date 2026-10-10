// Which slice of the data a user is allowed to see.
export function scopeFor(user) {
  if (user.role === 'student') return { studentIds: [user.studentId], subjectIds: undefined }
  if (user.role === 'teacher') return { studentIds: undefined, subjectIds: user.subjectIds }
  return { studentIds: undefined, subjectIds: undefined }
}

export function scopeRecords(records, scope) {
  return records.filter(
    (r) =>
      (!scope.studentIds || scope.studentIds.includes(r.studentId)) &&
      (!scope.subjectIds || scope.subjectIds.includes(r.subjectId)),
  )
}
