const authService = require('../services/authService')

const registerController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    const result = await authService.register({ name, email, password })
    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully',
    })
  } catch (error) {
    next(error)
  }
}

const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await authService.login({ email, password })
    res.status(200).json({
      success: true,
      data: result,
      message: 'Logged in successfully',
    })
  } catch (error) {
    next(error)
  }
}

const meController = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id)
    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  registerController,
  loginController,
  meController,
}
