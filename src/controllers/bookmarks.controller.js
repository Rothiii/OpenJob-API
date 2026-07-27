import * as bookmarksService from '../services/bookmarks.service.js';

export const getAll = async (req, res) => {
  const bookmarks = await bookmarksService.getByUserId(req.user.id);

  res.json({ status: 'success', data: { bookmarks } });
};

export const getById = async (req, res) => {
  const bookmark = await bookmarksService.getById({
    id: req.params.id,
    jobId: req.params.jobId,
    userId: req.user.id,
  });

  res.json({ status: 'success', data: bookmark });
};

export const create = async (req, res) => {
  const bookmark = await bookmarksService.create({
    jobId: req.params.jobId,
    userId: req.user.id,
  });

  res.status(201).json({ status: 'success', data: bookmark });
};

export const removeByJob = async (req, res) => {
  await bookmarksService.removeByJob({
    jobId: req.params.jobId,
    userId: req.user.id,
  });

  res.json({ status: 'success', message: 'Bookmark deleted' });
};
