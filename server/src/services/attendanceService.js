const db = require('../db')

const calculatePercentage = (attended, total) => {
  if (!total || total <= 0) return 0
  return Math.round((attended / total) * 100)
}

const getAttendance = async (userId) => {
  const subjects = await db.orm.public.Subject.where({ userId }).all()
  if (!subjects.length) return []

  const records = []
  for (const subject of subjects) {
    let attendance = await db.orm.public.Attendance.where({ subjectId: subject.id }).first()
    if (!attendance) {
      attendance = await db.orm.public.Attendance.create({
        subjectId: subject.id,
        attended: 0,
        total: 0,
      })
    }

    records.push({
      id: attendance.id,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      attended: attendance.attended,
      total: attendance.total,
      percentage: calculatePercentage(attendance.attended, attendance.total),
    })
  }

  return records
}

const getAttendanceBySubjectId = async (subjectId, userId) => {
  const subject = await db.orm.public.Subject.where({ id: subjectId, userId }).first()
  if (!subject) {
    const error = new Error('Subject not found')
    error.statusCode = 404
    throw error
  }

  let attendance = await db.orm.public.Attendance.where({ subjectId }).first()
  if (!attendance) {
    attendance = await db.orm.public.Attendance.create({
      subjectId,
      attended: 0,
      total: 0,
    })
  }

  return {
    id: attendance.id,
    subjectId: subject.id,
    subjectName: subject.name,
    subjectCode: subject.code,
    attended: attendance.attended,
    total: attendance.total,
    percentage: calculatePercentage(attendance.attended, attendance.total),
  }
}

const updateAttendance = async (subjectId, userId, { attended, total, action }) => {
  const subject = await db.orm.public.Subject.where({ id: subjectId, userId }).first()
  if (!subject) {
    const error = new Error('Subject not found')
    error.statusCode = 404
    throw error
  }

  let current = await db.orm.public.Attendance.where({ subjectId }).first()
  if (!current) {
    current = await db.orm.public.Attendance.create({
      subjectId,
      attended: 0,
      total: 0,
    })
  }

  let newAttended = current.attended
  let newTotal = current.total

  // Support convenient quick logging actions: 'attended' (+1/+1) or 'missed' (+0/+1)
  if (action === 'attended') {
    newAttended += 1
    newTotal += 1
  } else if (action === 'missed') {
    newTotal += 1
  } else {
    // Explicit values provided
    if (attended !== undefined) {
      const parsedAtt = parseInt(attended, 10)
      if (isNaN(parsedAtt) || parsedAtt < 0) {
        const error = new Error('Attended classes cannot be negative')
        error.statusCode = 400
        throw error
      }
      newAttended = parsedAtt
    }

    if (total !== undefined) {
      const parsedTot = parseInt(total, 10)
      if (isNaN(parsedTot) || parsedTot < 0) {
        const error = new Error('Total classes cannot be negative')
        error.statusCode = 400
        throw error
      }
      newTotal = parsedTot
    }
  }

  if (newAttended > newTotal) {
    const error = new Error('Attended classes cannot exceed total classes')
    error.statusCode = 400
    throw error
  }

  const updated = await db.orm.public.Attendance.where({ subjectId }).update({
    attended: newAttended,
    total: newTotal,
  })

  return {
    id: updated.id,
    subjectId: subject.id,
    subjectName: subject.name,
    subjectCode: subject.code,
    attended: updated.attended,
    total: updated.total,
    percentage: calculatePercentage(updated.attended, updated.total),
  }
}

module.exports = {
  getAttendance,
  getAttendanceBySubjectId,
  updateAttendance,
}
