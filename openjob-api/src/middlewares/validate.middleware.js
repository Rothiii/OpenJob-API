import { InvariantError } from '../errors/index.js';

/**
 * Validates `req[property]` against a Joi schema and replaces it with the
 * coerced value. Unknown keys are stripped rather than rejected.
 */
export const validate =
  (schema, property = 'body') =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[property] ?? {}, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      return next(new InvariantError(message));
    }

    req[property] = value;
    return next();
  };

export default validate;
