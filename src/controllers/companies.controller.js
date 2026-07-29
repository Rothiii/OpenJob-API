import * as companiesService from '../services/companies.service.js';

export const getAll = async (req, res) => {
  const companies = await companiesService.getAll();

  res.json({ status: 'success', data: { companies } });
};

export const getById = async (req, res) => {
  const company = await companiesService.getById(req.params.id);

  res.json({ status: 'success', data: company });
};

export const create = async (req, res) => {
  const company = await companiesService.create({
    ...req.body,
    userId: req.user.id,
  });

  res.status(201).json({ status: 'success', data: company });
};

export const update = async (req, res) => {
  const company = await companiesService.update(req.params.id, req.body);

  res.json({ status: 'success', message: 'Company updated', data: company });
};

export const remove = async (req, res) => {
  await companiesService.remove(req.params.id);

  res.json({ status: 'success', message: 'Company deleted' });
};
