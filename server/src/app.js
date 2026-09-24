const express = require('express')
const subjectRoutes = require('./routes/subjectRoutes')

const app = express()

app.use(express.json())

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'StudySync API is running',
    })
})

app.use('/api/subjects', subjectRoutes)

module.exports = app