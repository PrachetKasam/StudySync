const express = require('express')
const db = require('./db')

const app = express()

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'StudySync API is running',
  })
})

app.get('/api/health/database', async (req, res) => {
  try {
    const runtime = await db.runtime()
    const plan = db.raw.sql`SELECT 1 AS healthy`
      .returnsRow({ healthy: 'pg/int4@1' })
      .build()

    await runtime.query(plan)

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

module.exports = app