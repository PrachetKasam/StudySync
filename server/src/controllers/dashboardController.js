const dashboardService = require('../services/dashboardService')

const getDashboardSummaryController = async (req, res, next) => {
  try {
    const threshold = Number(req.query.threshold) || 75
    const summary = await dashboardService.getDashboardSummary(req.user.id, threshold)
    res.status(200).json({
      success: true,
      data: summary,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getDashboardSummaryController,
}
