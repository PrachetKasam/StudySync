const attendanceService = require('../services/attendanceService')

const getAttendanceController = async (req, res, next) => {
  try {
    const data = await attendanceService.getAttendance(req.user.id)
    res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    next(error)
  }
}

const getAttendanceBySubjectIdController = async (req, res, next) => {
  try {
    const subjectId = Number(req.params.subjectId)
    if (isNaN(subjectId)) {
      return res.status(400).json({ success: false, message: 'Invalid subject ID' })
    }
    const data = await attendanceService.getAttendanceBySubjectId(subjectId, req.user.id)
    res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    next(error)
  }
}

const updateAttendanceController = async (req, res, next) => {
  try {
    const subjectId = Number(req.params.subjectId)
    if (isNaN(subjectId)) {
      return res.status(400).json({ success: false, message: 'Invalid subject ID' })
    }
    const { attended, total, action } = req.body
    const data = await attendanceService.updateAttendance(subjectId, req.user.id, { attended, total, action })
    res.status(200).json({
      success: true,
      data,
      message: 'Attendance updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAttendanceController,
  getAttendanceBySubjectIdController,
  updateAttendanceController,
}
