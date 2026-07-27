import * as applicationsService from '../services/applications.service.js';

export const getAll = async (req, res) => {
  const applications = await applicationsService.getAll();

  res.json({ status: 'success', data: { applications } });
};

export const getById = async (req, res) => {
  const application = await applicationsService.getById(req.params.id);

  res.json({ status: 'success', data: application });
};

export const getByUserId = async (req, res) => {
  const applications = await applicationsService.getByUserId(req.params.userId);

  res.json({ status: 'success', data: { applications } });
};

export const getByJobId = async (req, res) => {
  const applications = await applicationsService.getByJobId(req.params.jobId);

  res.json({ status: 'success', data: { applications } });
};

export const create = async (req, res) => {
  const application = await applicationsService.create({
    ...req.body,
    userId: req.user.id,
  });

  res.status(201).json({ status: 'success', data: application });
};

export const update = async (req, res) => {
  const application = await applicationsService.updateStatus(
    req.params.id,
    req.body.status
  );

  res.json({
    status: 'success',
    message: 'Application updated',
    data: application,
  });
};

export const remove = async (req, res) => {
  await applicationsService.remove(req.params.id);

  res.json({ status: 'success', message: 'Application deleted' });
};
