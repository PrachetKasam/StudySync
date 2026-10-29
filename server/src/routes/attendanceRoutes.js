const express = require('express')
const {
  getAttendanceController,
  getAttendanceBySubjectIdController,
  updateAttendanceController,
} = require('../controllers/attendanceController')
const authenticateToken = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authenticateToken)

router.get('/', getAttendanceController)
router.get('/:subjectId', getAttendanceBySubjectIdController)
router.post('/', updateAttendanceController) // also handles initial / create
router.patch('/:subjectId', updateAttendanceController)

module.exports = router
