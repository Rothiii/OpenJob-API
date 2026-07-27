const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AuthenticationError = require('../errors/AuthenticationError');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AuthenticationError('Missing authentication'));
  }

  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_KEY);
    req.user = { id: decoded.id };
    return next();
  } catch (error) {
    return next(new AuthenticationError('Invalid authentication'));
  }
};
