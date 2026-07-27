import * as jobsService from '../services/jobs.service.js';

export const getAll = async (req, res) => {
  const jobs = await jobsService.getAll({
    title: req.query.title,
    companyName: req.query['company-name'],
  });

  res.json({ status: 'success', data: { jobs } });
};

export const getById = async (req, res) => {
  const job = await jobsService.getById(req.params.id);

  res.json({ status: 'success', data: job });
};

export const getByCompanyId = async (req, res) => {
  const jobs = await jobsService.getByCompanyId(req.params.companyId);

  res.json({ status: 'success', data: { jobs } });
};

export const getByCategoryId = async (req, res) => {
  const jobs = await jobsService.getByCategoryId(req.params.categoryId);

  res.json({ status: 'success', data: { jobs } });
};

export const create = async (req, res) => {
  const job = await jobsService.create(req.body);

  res.status(201).json({ status: 'success', data: job });
};

export const update = async (req, res) => {
  const job = await jobsService.update(req.params.id, req.body);

  res.json({ status: 'success', message: 'Job updated', data: job });
};

export const remove = async (req, res) => {
  await jobsService.remove(req.params.id);

  res.json({ status: 'success', message: 'Job deleted' });
};
