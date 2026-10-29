const express = require('express')
const {
  getAssignmentsController,
  getAssignmentByIdController,
  createAssignmentController,
  updateAssignmentController,
  deleteAssignmentController,
} = require('../controllers/assignmentController')
const authenticateToken = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authenticateToken)

router.get('/', getAssignmentsController)
router.get('/:id', getAssignmentByIdController)
router.post('/', createAssignmentController)
router.patch('/:id', updateAssignmentController)
router.delete('/:id', deleteAssignmentController)

module.exports = router
