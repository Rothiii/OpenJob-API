const InvariantError = require('../errors/InvariantError');

module.exports = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    return next(new InvariantError(error.details.map((d) => d.message).join(', ')));
  }

  req[property] = value;
  return next();
};
