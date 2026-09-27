const express = require('express')
const { getSubjectsController } = require('../controllers/subjectController')

const router = express.Router()

router.get('/', getSubjectsController)

module.exports = router