const db = require('../db')

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const getTimetable = async (userId) => {
  const subjects = await db.orm.public.Subject.where({ userId }).all()
  const subjectMap = {}
  subjects.forEach((s) => {
    subjectMap[s.id] = s
  })

  const slots = await db.orm.public.Timetable.where({ userId }).all()

  return slots
    .map((s) => {
      const subject = subjectMap[s.subjectId]
      return {
        id: s.id,
        userId: s.userId,
        subjectId: s.subjectId,
        subjectName: subject?.name || 'Class',
        subjectCode: subject?.code || '',
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime,
        room: s.room || '',
      }
    })
    .sort((a, b) => {
      const dayDiff = DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day)
      if (dayDiff !== 0) return dayDiff
      return (a.startTime || '').localeCompare(b.startTime || '')
    })
}

const createTimetableSlot = async (userId, data) => {
  const { subjectId, day, startTime, endTime, room } = data

  const parsedSubjectId = Number(subjectId)
  if (isNaN(parsedSubjectId)) {
    const error = new Error('Valid subject is required')
    error.statusCode = 400
    throw error
  }

  const subject = await db.orm.public.Subject.where({ id: parsedSubjectId, userId }).first()
  if (!subject) {
    const error = new Error('Subject not found')
    error.statusCode = 404
    throw error
  }

  if (!day || !DAYS_ORDER.includes(day)) {
    const error = new Error(`Day must be one of: ${DAYS_ORDER.join(', ')}`)
    error.statusCode = 400
    throw error
  }

  if (!startTime || !endTime) {
    const error = new Error('Start time and end time are required')
    error.statusCode = 400
    throw error
  }

  const created = await db.orm.public.Timetable.create({
    userId,
    subjectId: parsedSubjectId,
    day,
    startTime: startTime.trim(),
    endTime: endTime.trim(),
    room: room ? room.trim() : null,
  })

  return {
    id: created.id,
    userId: created.userId,
    subjectId: created.subjectId,
    subjectName: subject.name,
    subjectCode: subject.code,
    day: created.day,
    startTime: created.startTime,
    endTime: created.endTime,
    room: created.room || '',
  }
}

const updateTimetableSlot = async (id, userId, data) => {
  const existing = await db.orm.public.Timetable.where({ id, userId }).first()
  if (!existing) {
    const error = new Error('Timetable slot not found')
    error.statusCode = 404
    throw error
  }

  const updateFields = {}
  if (data.subjectId) {
    const parsed = Number(data.subjectId)
    const subject = await db.orm.public.Subject.where({ id: parsed, userId }).first()
    if (!subject) throw new Error('Subject not found')
    updateFields.subjectId = parsed
  }
  if (data.day && DAYS_ORDER.includes(data.day)) {
    updateFields.day = data.day
  }
  if (data.startTime) updateFields.startTime = data.startTime.trim()
  if (data.endTime) updateFields.endTime = data.endTime.trim()
  if (data.room !== undefined) updateFields.room = data.room ? data.room.trim() : null

  const updated = await db.orm.public.Timetable.where({ id, userId }).update(updateFields)
  const subject = await db.orm.public.Subject.where({ id: updated.subjectId }).first()

  return {
    id: updated.id,
    userId: updated.userId,
    subjectId: updated.subjectId,
    subjectName: subject?.name || 'Class',
    subjectCode: subject?.code || '',
    day: updated.day,
    startTime: updated.startTime,
    endTime: updated.endTime,
    room: updated.room || '',
  }
}

const deleteTimetableSlot = async (id, userId) => {
  const existing = await db.orm.public.Timetable.where({ id, userId }).first()
  if (!existing) {
    const error = new Error('Timetable slot not found')
    error.statusCode = 404
    throw error
  }

  return db.orm.public.Timetable.where({ id, userId }).delete()
}

module.exports = {
  getTimetable,
  createTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot,
}
