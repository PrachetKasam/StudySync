const express = require('express')
const {
    getSubjectsController,
    getSubjectByIdController,
} = require('../controllers/subjectController')

const router = express.Router()

router.get('/', getSubjectsController)
router.get('/:id', getSubjectByIdController)

module.exports = router