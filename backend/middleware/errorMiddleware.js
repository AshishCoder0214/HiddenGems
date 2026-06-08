import { logger } from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log the internal stacktrace and error details
  logger.error('API Server Request Exception', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });

  // Mask database details and raw messages in production
  let clientMessage = 'An unexpected error occurred on the server.';
  
  if (process.env.NODE_ENV !== 'production') {
    clientMessage = err.message;
  } else if (err.name === 'ValidationError') {
    clientMessage = 'Database validation rules failed.';
  } else if (err.name === 'CastError') {
    clientMessage = 'Invalid parameter resource ID structure.';
  }

  res.status(statusCode).json({
    error: clientMessage,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};
