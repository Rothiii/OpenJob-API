import * as usersService from './users.service.js';
import * as applicationsService from './applications.service.js';
import * as bookmarksService from './bookmarks.service.js';

export const getProfile = (userId) => usersService.getById(userId);

export const getApplications = (userId) =>
  applicationsService.getDetailedByUserId(userId);

export const getBookmarks = (userId) => bookmarksService.getByUserId(userId);
