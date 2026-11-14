import { env } from '../config/env.js';

export class AppError extends Error {
  constructor(message, status = 400, code = 'BAD_REQUEST') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function notFound(req, res) {
  res.status(404).json({ success: false, code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` });
}

export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    code: err.code || 'SERVER_ERROR',
    message: status >= 500 && env.isProd ? 'Something went wrong' : err.message,
  });
}
