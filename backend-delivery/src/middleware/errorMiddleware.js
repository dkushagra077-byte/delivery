const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const errorCode = err.code || err.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected server error occurred. Please try again.';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] [${req.method}] ${req.url} -> ${statusCode} [${errorCode}]: ${message}`);
    if (statusCode === 500 && err.stack) {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...(process.env.NODE_ENV === 'development' && statusCode === 500 ? { stack: err.stack } : {})
  });
};

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: [${req.method}] ${req.originalUrl}`,
    errorCode: 'ROUTE_NOT_FOUND'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
