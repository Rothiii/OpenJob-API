import Joi from 'joi';

/** Registration password: enforced strength. */
export const password = Joi.string().min(6).max(255);

/** Login password: only presence matters, so a wrong password yields 401 not 400. */
export const passwordInput = Joi.string().max(255);

export default password;
