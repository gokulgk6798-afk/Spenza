function errorMiddleware(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV !== "test") {
    console.error(error);
  }

  res.status(statusCode).json({
    message: error.message || "Something went wrong.",
    details: error.details || null,
  });
}

module.exports = errorMiddleware;

