import env from '../config/env.js';
import { ClientError } from '../errors/index.js';

/** Postgres error codes we can translate into a meaningful client response. */
const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_INVALID_TEXT_REPRESENTATION = '22P02';

// The unused `next` is required: Express identifies error handlers by arity.
export const errorHandler = (err, req, res, next) => {
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      status: 'failed',
      message: err.message,
    });
  }

  // Malformed JSON body from express.json()
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      status: 'failed',
      message: 'Request body is not valid JSON',
    });
  }

  if (err?.code === PG_FOREIGN_KEY_VIOLATION) {
    return res.status(400).json({
      status: 'failed',
      message: 'Referenced resource does not exist',
    });
  }

  if (err?.code === PG_UNIQUE_VIOLATION) {
    return res.status(400).json({
      status: 'failed',
      message: 'Resource already exists',
    });
  }

  if (err?.code === PG_INVALID_TEXT_REPRESENTATION) {
    return res.status(400).json({
      status: 'failed',
      message: 'Invalid value format',
    });
  }

  console.error(err);

  return res.status(500).json({
    status: 'error',
    message: env.isProduction ? 'Internal server error' : err.message,
  });
};

export default errorHandler;
