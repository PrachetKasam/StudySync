const db = require('../db')
const { getAttendance } = require('./attendanceService')
const { getAssignments } = require('./assignmentService')
const { getTimetable } = require('./timetableService')

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const getDashboardSummary = async (userId, threshold = 75) => {
  const subjects = await db.orm.public.Subject.where({ userId }).all()
  const attendanceRecords = await getAttendance(userId)
  const assignments = await getAssignments(userId)
  const timetable = await getTimetable(userId)

  // Overall attendance calculation
  const totalAttended = attendanceRecords.reduce((sum, r) => sum + r.attended, 0)
  const totalClasses = attendanceRecords.reduce((sum, r) => sum + r.total, 0)
  const overallAttendancePercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0

  // Pending & overdue assignments
  const pendingAssignments = assignments.filter((a) => a.status !== 'Completed')
  const overdueAssignments = assignments.filter((a) => a.isOverdue)

  // Today's classes based on local day of week
  const todayDayName = DAYS[new Date().getDay()]
  const todayClasses = timetable.filter((s) => s.day === todayDayName)

  // Subjects with attendance below threshold
  const lowAttendanceSubjects = attendanceRecords.filter(
    (r) => r.total > 0 && r.percentage < threshold
  )

  return {
    stats: {
      totalSubjects: subjects.length,
      overallAttendancePercentage,
      totalAttended,
      totalClasses,
      pendingAssignmentsCount: pendingAssignments.length,
      overdueAssignmentsCount: overdueAssignments.length,
    },
    todayClasses,
    todayDayName,
    upcomingAssignments: pendingAssignments.slice(0, 5),
    lowAttendanceSubjects,
    subjectsCount: subjects.length,
  }
}

module.exports = {
  getDashboardSummary,
}
