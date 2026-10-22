export const errorHandler = (err, req, res, next) => {
  console.error('[API Error]:', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let errorCode = 'SERVER_ERROR';
  let message = err.message || 'An unexpected internal server error occurred.';

  if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'CONFLICT';
    const field = Object.keys(err.keyValue)[0];
    message = `A record with this ${field} already exists.`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 422;
    errorCode = 'UNPROCESSABLE_ENTITY';
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'BAD_REQUEST';
    message = `Invalid identifier format: ${err.value}`;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Authentication token is invalid.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired. Please log in again.';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
    },
  });
};
