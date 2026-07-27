import { Router } from 'express';
import usersRoute from './users.route.js';
import authRoute from './auth.route.js';
import companiesRoute from './companies.route.js';
import categoriesRoute from './categories.route.js';
import jobsRoute from './jobs.route.js';
import applicationsRoute from './applications.route.js';
import bookmarksRoute from './bookmarks.route.js';
import profileRoute from './profile.route.js';

const router = Router();

router.use('/users', usersRoute);
router.use('/authentications', authRoute);
router.use('/companies', companiesRoute);
router.use('/categories', categoriesRoute);
router.use('/jobs', jobsRoute);
router.use('/applications', applicationsRoute);
router.use('/bookmarks', bookmarksRoute);
router.use('/profile', profileRoute);

export default router;
