import * as profileService from '../services/profile.service.js';

export const getProfile = async (req, res) => {
  const profile = await profileService.getProfile(req.user.id);

  res.json({ status: 'success', data: profile });
};

export const getApplications = async (req, res) => {
  const applications = await profileService.getApplications(req.user.id);

  res.json({ status: 'success', data: { applications } });
};

export const getBookmarks = async (req, res) => {
  const bookmarks = await profileService.getBookmarks(req.user.id);

  res.json({ status: 'success', data: { bookmarks } });
};
