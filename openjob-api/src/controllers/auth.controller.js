import * as authService from '../services/auth.service.js';

export const login = async (req, res) => {
  const tokens = await authService.login(req.body);

  res.json({ status: 'success', data: tokens });
};

export const refresh = async (req, res) => {
  const data = await authService.refreshAccessToken(req.body.refreshToken);

  res.json({ status: 'success', data });
};

export const logout = async (req, res) => {
  await authService.logout(req.body.refreshToken);

  res.json({ status: 'success', message: 'Logout success' });
};
