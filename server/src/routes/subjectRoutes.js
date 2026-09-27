const express = require('express')
const {
    getSubjectsController,
    getSubjectByIdController,
    createSubjectController,
} = require('../controllers/subjectController')

const router = express.Router()

router.get('/', getSubjectsController)
router.get('/:id', getSubjectByIdController)
router.post('/', createSubjectController)

module.exports = router