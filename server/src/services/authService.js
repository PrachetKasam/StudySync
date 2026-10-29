const db = require('../db')
const { hashPassword, comparePassword } = require('../utils/password')
const { generateToken } = require('../utils/token')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const register = async ({ name, email, password }) => {
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    const error = new Error('Name must be at least 2 characters')
    error.statusCode = 400
    throw error
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    const error = new Error('A valid email address is required')
    error.statusCode = 400
    throw error
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    const error = new Error('Password must be at least 6 characters')
    error.statusCode = 400
    throw error
  }

  const normalizedEmail = email.trim().toLowerCase()
  const trimmedName = name.trim()

  const existing = await db.orm.public.User.where({ email: normalizedEmail }).first()
  if (existing) {
    const error = new Error('User with this email already exists')
    error.statusCode = 409
    throw error
  }

  const passwordHash = await hashPassword(password)

  const user = await db.orm.public.User.create({
    name: trimmedName,
    email: normalizedEmail,
    passwordHash,
  })

  const token = generateToken(user.id)

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt ? user.createdAt.toString() : new Date().toISOString(),
    },
    token,
  }
}

const login = async ({ email, password }) => {
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    const error = new Error('Email and password are required')
    error.statusCode = 400
    throw error
  }

  const normalizedEmail = email.trim().toLowerCase()

  const user = await db.orm.public.User.where({ email: normalizedEmail }).first()
  if (!user) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  const match = await comparePassword(password, user.passwordHash)
  if (!match) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  const token = generateToken(user.id)

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt ? user.createdAt.toString() : new Date().toISOString(),
    },
    token,
  }
}

const getCurrentUser = async (userId) => {
  const user = await db.orm.public.User.where({ id: userId }).first()
  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt ? user.createdAt.toString() : new Date().toISOString(),
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
}
