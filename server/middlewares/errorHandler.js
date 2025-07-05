import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    endpoint: req.originalUrl,
    method: req.method,
    // user: req.user?._id,
    error: err.message,
    body: req.body,
    // stack: err.stack,
    query: req.query
  });
  res.status(500).json({ message: err.message || 'Server Error' });
};