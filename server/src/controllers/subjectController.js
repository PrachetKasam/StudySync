const subjectService = require('../services/subjectService')

const getSubjectsController = async (req, res, next) => {
  try {
    const subjects = await subjectService.getSubjects(req.user.id)
    res.status(200).json({
      success: true,
      data: subjects,
    })
  } catch (error) {
    next(error)
  }
}

const getSubjectByIdController = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject ID',
      })
    }

    const subject = await subjectService.getSubjectById(id, req.user.id)
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
  } catch (error) {
    next(error)
  }
}

const createSubjectController = async (req, res, next) => {
  try {
    const { name, code } = req.body
    const subject = await subjectService.createSubject(name, code, req.user.id)
    res.status(201).json({
      success: true,
      data: subject,
      message: 'Subject created successfully',
    })
  } catch (error) {
    next(error)
  }
}

const updateSubjectController = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject ID',
      })
    }

    const { name, code } = req.body
    const subject = await subjectService.updateSubject(id, req.user.id, { name, code })
    res.status(200).json({
      success: true,
      data: subject,
      message: 'Subject updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

const deleteSubjectController = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject ID',
      })
    }

    await subjectService.deleteSubject(id, req.user.id)
    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getSubjectsController,
  getSubjectByIdController,
  createSubjectController,
  updateSubjectController,
  deleteSubjectController,
}
