import * as usersService from '../services/users.service.js';

export const register = async (req, res) => {
  const user = await usersService.register(req.body);

  res.status(201).json({ status: 'success', data: user });
};

export const getById = async (req, res) => {
  const user = await usersService.getById(req.params.id);

  res.json({ status: 'success', data: user });
};
