import * as categoriesService from '../services/categories.service.js';

export const getAll = async (req, res) => {
  const categories = await categoriesService.getAll();

  res.json({ status: 'success', data: { categories } });
};

export const getById = async (req, res) => {
  const category = await categoriesService.getById(req.params.id);

  res.json({ status: 'success', data: category });
};

export const create = async (req, res) => {
  const category = await categoriesService.create(req.body);

  res.status(201).json({ status: 'success', data: category });
};

export const update = async (req, res) => {
  const category = await categoriesService.update(req.params.id, req.body);

  res.json({ status: 'success', message: 'Category updated', data: category });
};

export const remove = async (req, res) => {
  await categoriesService.remove(req.params.id);

  res.json({ status: 'success', message: 'Category deleted' });
};
