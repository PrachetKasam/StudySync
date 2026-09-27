const {
    getSubjects,
    getSubjectById,
    createSubject,
} = require('../services/subjectService')

const getSubjectsController = (req, res) => {
    const subjects = getSubjects()

    res.status(200).json({
        success: true,
        data: subjects,
    })
}

const getSubjectByIdController = (req, res) => {
    const id = Number(req.params.id)

    const subject = getSubjectById(id)

    if (!subject) {
        return res.status(404).json({
            success: false,
            message: 'Subject not found',
        })
    }

    res.status(200).json({
        success: true,
        data: subject,
    })
}

const createSubjectController = (req, res) => {
    const { name, code } = req.body

    if (!name || !code) {
        return res.status(400).json({
            success: false,
            message: 'Name and code are required',
        })
    }

    const subject = createSubject(name, code)

    res.status(201).json({
        success: true,
        data: subject,
        message: 'Subject created successfully',
    })
}

module.exports = {
    getSubjectsController,
    getSubjectByIdController,
    createSubjectController,
}