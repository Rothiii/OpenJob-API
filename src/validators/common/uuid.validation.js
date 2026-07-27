import Joi from 'joi';

export const uuid = Joi.string().guid({ version: 'uuidv4' });

export default uuid;
