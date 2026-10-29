const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (typeof err.status === 'number' ? err.status : 500)

  let message = err.message || 'Something went wrong'

  // Normalize specific database errors without leaking schema internals
  if (err.code === '23505') {
    message = 'A record with this information already exists'
  } else if (err.code === '23503') {
    message = 'Referenced resource was not found'
  } else if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'An unexpected server error occurred'
  }

  res.status(statusCode).json({
    success: false,
    message,
  })
}

module.exports = errorHandler
