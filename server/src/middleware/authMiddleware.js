const { verifyToken } = require('../utils/token')

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    })
  }

  const token = authHeader.slice(7).trim()

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    })
  }

  try {
    const payload = verifyToken(token)

    if (!Number.isInteger(payload.userId) || payload.userId <= 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      })
    }

    req.user = {
      id: payload.userId,
    }

    next()
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
  }
}

module.exports = authenticateToken
