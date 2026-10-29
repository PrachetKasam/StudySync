const timetableService = require('../services/timetableService')

const getTimetableController = async (req, res, next) => {
  try {
    const slots = await timetableService.getTimetable(req.user.id)
    res.status(200).json({
      success: true,
      data: slots,
    })
  } catch (error) {
    next(error)
  }
}

const createTimetableSlotController = async (req, res, next) => {
  try {
    const slot = await timetableService.createTimetableSlot(req.user.id, req.body)
    res.status(201).json({
      success: true,
      data: slot,
      message: 'Class added to timetable',
    })
  } catch (error) {
    next(error)
  }
}

const updateTimetableSlotController = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid slot ID' })

    const slot = await timetableService.updateTimetableSlot(id, req.user.id, req.body)
    res.status(200).json({
      success: true,
      data: slot,
      message: 'Timetable updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

const deleteTimetableSlotController = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid slot ID' })

    await timetableService.deleteTimetableSlot(id, req.user.id)
    res.status(200).json({
      success: true,
      message: 'Class slot deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getTimetableController,
  createTimetableSlotController,
  updateTimetableSlotController,
  deleteTimetableSlotController,
}
