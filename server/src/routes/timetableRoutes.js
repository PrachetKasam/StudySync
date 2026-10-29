const express = require('express')
const {
  getTimetableController,
  createTimetableSlotController,
  updateTimetableSlotController,
  deleteTimetableSlotController,
} = require('../controllers/timetableController')
const authenticateToken = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authenticateToken)

router.get('/', getTimetableController)
router.post('/', createTimetableSlotController)
router.patch('/:id', updateTimetableSlotController)
router.delete('/:id', deleteTimetableSlotController)

module.exports = router
