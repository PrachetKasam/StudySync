const express = require('express')
const {
  getSubjectsController,
  getSubjectByIdController,
  createSubjectController,
  updateSubjectController,
  deleteSubjectController,
} = require('../controllers/subjectController')
const authenticateToken = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authenticateToken)

router.get('/', getSubjectsController)
router.get('/:id', getSubjectByIdController)
router.post('/', createSubjectController)
router.patch('/:id', updateSubjectController)
router.delete('/:id', deleteSubjectController)

module.exports = router
