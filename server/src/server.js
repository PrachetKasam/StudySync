const path = require('node:path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') })
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
require('dotenv').config()

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is missing. Server cannot start.')
  process.exit(1)
}

const app = require('./app')

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`StudySync API running on http://localhost:${PORT}`)
})
