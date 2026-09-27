const { getSubjects } = require('../services/subjectService')

const getSubjectsController = (req, res) => {
    const subjects = getSubjects()

    res.status(200).json({
        success: true,
        data: subjects,
    })
}

module.exports = {
    getSubjectsController,
}