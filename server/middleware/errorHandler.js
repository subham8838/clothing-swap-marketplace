const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong. Please try again.';
  let details = err.details || null;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found.';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `An account with this ${field} already exists.` : 'Duplicate entry.';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    details = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed.';
  }

  console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };
