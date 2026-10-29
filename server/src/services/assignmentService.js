const db = require('../db')

const formatAssignment = (a, subjectMap = {}) => {
  const dueDateStr = a.dueDate ? a.dueDate.toString() : null
  const now = new Date()
  const dueDateObj = dueDateStr ? new Date(dueDateStr) : null

  let isOverdue = false
  let isDueSoon = false

  if (dueDateObj && a.status !== 'Completed') {
    const diffHours = (dueDateObj - now) / (1000 * 60 * 60)
    if (diffHours < 0) {
      isOverdue = true
    } else if (diffHours <= 48) {
      isDueSoon = true
    }
  }

  const subject = subjectMap[a.subjectId] || null

  return {
    id: a.id,
    userId: a.userId,
    subjectId: a.subjectId,
    subjectName: subject?.name || 'General',
    subjectCode: subject?.code || '',
    title: a.title,
    description: a.description || '',
    dueDate: dueDateStr,
    priority: a.priority || 'Medium',
    status: a.status || 'Pending',
    createdAt: a.createdAt ? a.createdAt.toString() : new Date().toISOString(),
    isOverdue,
    isDueSoon,
  }
}

const getAssignments = async (userId, filters = {}) => {
  const subjects = await db.orm.public.Subject.where({ userId }).all()
  const subjectMap = {}
  subjects.forEach((s) => {
    subjectMap[s.id] = s
  })

  let query = { userId }
  if (filters.status && filters.status !== 'All') {
    query.status = filters.status
  }
  if (filters.subjectId) {
    query.subjectId = Number(filters.subjectId)
  }

  const assignments = await db.orm.public.Assignment.where(query).all()

  // Format and sort: pending first, then by dueDate ascending
  return assignments
    .map((a) => formatAssignment(a, subjectMap))
    .sort((a, b) => {
      if (a.status === 'Completed' && b.status !== 'Completed') return 1
      if (a.status !== 'Completed' && b.status === 'Completed') return -1
      return new Date(a.dueDate || 0) - new Date(b.dueDate || 0)
    })
}

const getAssignmentById = async (id, userId) => {
  const assignment = await db.orm.public.Assignment.where({ id, userId }).first()
  if (!assignment) return null

  const subject = await db.orm.public.Subject.where({ id: assignment.subjectId }).first()
  return formatAssignment(assignment, { [assignment.subjectId]: subject })
}

const createAssignment = async (userId, data) => {
  const { title, description, subjectId, dueDate, priority = 'Medium', status = 'Pending' } = data

  if (!title || typeof title !== 'string' || !title.trim()) {
    const error = new Error('Title is required')
    error.statusCode = 400
    throw error
  }

  const parsedSubjectId = Number(subjectId)
  if (isNaN(parsedSubjectId)) {
    const error = new Error('Valid subject is required')
    error.statusCode = 400
    throw error
  }

  // Verify subject belongs to user
  const subject = await db.orm.public.Subject.where({ id: parsedSubjectId, userId }).first()
  if (!subject) {
    const error = new Error('Selected subject does not exist')
    error.statusCode = 404
    throw error
  }

  if (!dueDate) {
    const error = new Error('Due date is required')
    error.statusCode = 400
    throw error
  }

  let temporalDueDate
  try {
    const isoString = new Date(dueDate).toISOString()
    temporalDueDate = Temporal.Instant.from(isoString)
  } catch {
    const error = new Error('Invalid due date format')
    error.statusCode = 400
    throw error
  }

  const created = await db.orm.public.Assignment.create({
    userId,
    subjectId: parsedSubjectId,
    title: title.trim(),
    description: description ? description.trim() : null,
    dueDate: temporalDueDate,
    priority: ['Low', 'Medium', 'High'].includes(priority) ? priority : 'Medium',
    status: status === 'Completed' ? 'Completed' : 'Pending',
  })

  return formatAssignment(created, { [parsedSubjectId]: subject })
}

const updateAssignment = async (id, userId, data) => {
  const existing = await db.orm.public.Assignment.where({ id, userId }).first()
  if (!existing) {
    const error = new Error('Assignment not found')
    error.statusCode = 404
    throw error
  }

  const updateFields = {}

  if (data.title && typeof data.title === 'string' && data.title.trim()) {
    updateFields.title = data.title.trim()
  }
  if (data.description !== undefined) {
    updateFields.description = data.description ? data.description.trim() : null
  }
  if (data.status) {
    updateFields.status = data.status === 'Completed' ? 'Completed' : 'Pending'
  }
  if (data.priority && ['Low', 'Medium', 'High'].includes(data.priority)) {
    updateFields.priority = data.priority
  }
  if (data.dueDate) {
    try {
      const iso = new Date(data.dueDate).toISOString()
      updateFields.dueDate = Temporal.Instant.from(iso)
    } catch {
      const error = new Error('Invalid due date format')
      error.statusCode = 400
      throw error
    }
  }

  const updated = await db.orm.public.Assignment.where({ id, userId }).update(updateFields)
  const subject = await db.orm.public.Subject.where({ id: updated.subjectId }).first()
  return formatAssignment(updated, { [updated.subjectId]: subject })
}

const deleteAssignment = async (id, userId) => {
  const existing = await db.orm.public.Assignment.where({ id, userId }).first()
  if (!existing) {
    const error = new Error('Assignment not found')
    error.statusCode = 404
    throw error
  }

  return db.orm.public.Assignment.where({ id, userId }).delete()
}

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
}
