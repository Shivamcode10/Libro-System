const errorHandler = (err, req, res, next) => {
  // Default to 500 Internal Server Error if status isn't set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode);
  res.json({
    message: err.message,
    // Include stack trace only in development mode for debugging
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;