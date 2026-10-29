const express = require('express')
const {
  registerController,
  loginController,
  meController,
} = require('../controllers/authController')
const authenticateToken = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', registerController)
router.post('/login', loginController)
router.get('/me', authenticateToken, meController)

module.exports = router
