import { NotFoundError } from '../errors/index.js';

/** Turns unmatched routes into a NotFoundError so they hit the error handler. */
export const notFound = (req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
};

export default notFound;
