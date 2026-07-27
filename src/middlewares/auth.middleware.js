import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { AuthenticationError } from '../errors/index.js';

/** Verifies the Bearer access token and puts the user id on `req.user`. */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return next(new AuthenticationError('Missing authentication'));
  }

  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_KEY);
    req.user = { id: decoded.id };
    return next();
  } catch {
    return next(new AuthenticationError('Invalid authentication'));
  }
};

export default authenticate;
