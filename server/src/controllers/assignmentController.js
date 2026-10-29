const assignmentService = require('../services/assignmentService')

const getAssignmentsController = async (req, res, next) => {
  try {
    const { status, subjectId } = req.query
    const assignments = await assignmentService.getAssignments(req.user.id, { status, subjectId })
    res.status(200).json({
      success: true,
      data: assignments,
    })
  } catch (error) {
    next(error)
  }
}

const getAssignmentByIdController = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid assignment ID' })

    const assignment = await assignmentService.getAssignmentById(id, req.user.id)
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' })

    res.status(200).json({
      success: true,
      data: assignment,
    })
  } catch (error) {
    next(error)
  }
}

const createAssignmentController = async (req, res, next) => {
  try {
    const assignment = await assignmentService.createAssignment(req.user.id, req.body)
    res.status(201).json({
      success: true,
      data: assignment,
      message: 'Assignment created successfully',
    })
  } catch (error) {
    next(error)
  }
}

const updateAssignmentController = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid assignment ID' })

    const assignment = await assignmentService.updateAssignment(id, req.user.id, req.body)
    res.status(200).json({
      success: true,
      data: assignment,
      message: 'Assignment updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

const deleteAssignmentController = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid assignment ID' })

    await assignmentService.deleteAssignment(id, req.user.id)
    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAssignmentsController,
  getAssignmentByIdController,
  createAssignmentController,
  updateAssignmentController,
  deleteAssignmentController,
}
