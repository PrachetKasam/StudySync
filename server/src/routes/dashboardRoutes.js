const express = require('express')
const { getDashboardSummaryController } = require('../controllers/dashboardController')
const authenticateToken = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authenticateToken)

router.get('/summary', getDashboardSummaryController)

module.exports = router
