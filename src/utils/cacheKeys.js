export const cacheKeys = {
  companyDetail: (id) => `companies:detail:${id}`,
  userDetail: (id) => `users:detail:${id}`,
  applicationDetail: (id) => `applications:detail:${id}`,
  applicationsByUser: (userId) => `applications:user:${userId}`,
  applicationsByJob: (jobId) => `applications:job:${jobId}`,
  bookmarksByUser: (userId) => `bookmarks:user:${userId}`,
};

export const cachePatterns = {
  companies: 'companies:*',
  users: 'users:*',
  applications: 'applications:*',
  bookmarks: 'bookmarks:*',
};

export default cacheKeys;
