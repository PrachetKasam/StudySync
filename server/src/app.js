const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')

const rawDb = require('./db')
const db = rawDb.orm ? rawDb : (rawDb.default || rawDb.db || rawDb)
const authRoutes = require('./routes/authRoutes')
const subjectRoutes = require('./routes/subjectRoutes')
const attendanceRoutes = require('./routes/attendanceRoutes')
const assignmentRoutes = require('./routes/assignmentRoutes')
const timetableRoutes = require('./routes/timetableRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const errorHandler = require('./middleware/errorHandler')

const app = express()

// Trust first proxy hop securely (e.g. Vercel)
app.set('trust proxy', 1)

// Security headers
app.use(helmet())

// CORS allow-list
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
)

app.use(express.json())

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
})

// Health checks
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'StudySync API is running',
  })
})

app.get('/api/health/database', async (req, res) => {
  try {
    const activeDb = db.orm ? db : (db.default || db.db || db)
    await activeDb.orm.public.User.first()

    res.json({
      success: true,
      message: 'Database connection is healthy',
    })
  } catch (error) {
    console.error('Database health check failed:', error.message)
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
    })
  }
})

// Mount feature routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/subjects', subjectRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use('/api/timetable', timetableRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Fallback for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  })
})

// Centralized error handler
app.use(errorHandler)

module.exports = app
