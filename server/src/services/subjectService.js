const db = require('../db')

const getSubjects = async (userId) => {
  return db.orm.public.Subject.where({ userId }).all()
}

const getSubjectById = async (id, userId) => {
  return db.orm.public.Subject.where({ id, userId }).first()
}

const createSubject = async (name, code, userId) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    const error = new Error('Subject name is required')
    error.statusCode = 400
    throw error
  }
  if (!code || typeof code !== 'string' || !code.trim()) {
    const error = new Error('Subject code is required')
    error.statusCode = 400
    throw error
  }

  const trimmedName = name.trim()
  const trimmedCode = code.trim().toUpperCase()

  const subject = await db.orm.public.Subject.create({
    name: trimmedName,
    code: trimmedCode,
    userId,
  })

  // Automatically initialize attendance for this subject
  try {
    await db.orm.public.Attendance.create({
      subjectId: subject.id,
      attended: 0,
      total: 0,
    })
  } catch {
    // If attendance table already has it or fails non-critically, continue
  }

  return subject
}

const updateSubject = async (id, userId, { name, code }) => {
  const existing = await db.orm.public.Subject.where({ id, userId }).first()
  if (!existing) {
    const error = new Error('Subject not found')
    error.statusCode = 404
    throw error
  }

  const updateData = {}
  if (name && typeof name === 'string' && name.trim()) {
    updateData.name = name.trim()
  }
  if (code && typeof code === 'string' && code.trim()) {
    updateData.code = code.trim().toUpperCase()
  }

  return db.orm.public.Subject.where({ id, userId }).update(updateData)
}

const deleteSubject = async (id, userId) => {
  const existing = await db.orm.public.Subject.where({ id, userId }).first()
  if (!existing) {
    const error = new Error('Subject not found')
    error.statusCode = 404
    throw error
  }

  // Delete child records first to respect foreign key constraints
  try {
    await db.orm.public.Attendance.where({ subjectId: id }).delete()
  } catch {
    // Continue
  }
  try {
    const assignments = await db.orm.public.Assignment.where({ subjectId: id, userId }).all()
    for (const a of assignments) {
      await db.orm.public.Assignment.where({ id: a.id }).delete()
    }
  } catch {
    // Continue
  }
  try {
    const slots = await db.orm.public.Timetable.where({ subjectId: id, userId }).all()
    for (const s of slots) {
      await db.orm.public.Timetable.where({ id: s.id }).delete()
    }
  } catch {
    // Continue
  }

  return db.orm.public.Subject.where({ id, userId }).delete()
}

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
}
