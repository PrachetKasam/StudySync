const jwt = require('jsonwebtoken')

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwt.sign(
    { userId },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  )
}

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwt.verify(token, secret)
}

module.exports = {
  generateToken,
  verifyToken,
}
