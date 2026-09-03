const User = require('../models/User');
const Clothing = require('../models/Clothing');
const SwapRequest = require('../models/SwapRequest');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

// @route GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers, activeUsers, totalListings, activeListings,
    totalSwapRequests, successfulSwaps, pendingReports,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', isSuspended: false }),
    Clothing.countDocuments({}),
    Clothing.countDocuments({ status: 'AVAILABLE' }),
    SwapRequest.countDocuments({}),
    SwapRequest.countDocuments({ status: 'COMPLETED' }),
    Report.countDocuments({ status: { $in: ['OPEN', 'UNDER_REVIEW'] } }),
  ]);

  // Monthly activity for the last 6 months (user signups, listings, swaps)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlyGroup = (model, dateField = 'createdAt') => model.aggregate([
    { $match: { [dateField]: { $gte: sixMonthsAgo } } },
    { $group: { _id: { y: { $year: `$${dateField}` }, m: { $month: `$${dateField}` } }, count: { $sum: 1 } } },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ]);

  const [userGrowth, listingGrowth, swapGrowth, completedGrowth] = await Promise.all([
    monthlyGroup(User),
    monthlyGroup(Clothing),
    monthlyGroup(SwapRequest),
    SwapRequest.aggregate([
      { $match: { status: 'COMPLETED', completedAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { y: { $year: '$completedAt' }, m: { $month: '$completedAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),
  ]);

  const popularCategories = await Clothing.aggregate([
    { $match: { status: { $ne: 'REMOVED' } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const activeLocations = await Clothing.aggregate([
    { $match: { status: { $ne: 'REMOVED' } } },
    { $group: { _id: '$location.city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  success(res, 200, {
    stats: {
      totalUsers, activeUsers, totalListings, activeListings,
      totalSwapRequests, successfulSwaps, pendingReports,
      swapConversionRate: totalSwapRequests ? Math.round((successfulSwaps / totalSwapRequests) * 1000) / 10 : 0,
    },
    charts: { userGrowth, listingGrowth, swapGrowth, completedGrowth },
    popularCategories,
    activeLocations,
  });
});

// @route GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const filter = { role: 'user' };
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  if (status === 'suspended') filter.isSuspended = true;
  if (status === 'active') filter.isSuspended = false;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum),
    User.countDocuments(filter),
  ]);

  success(res, 200, { users }, 'Users fetched.', { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) });
});

// @route GET /api/admin/listings
const getListings = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (search) filter.title = new RegExp(search, 'i');
  if (status) filter.status = status.toUpperCase();

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

  const [listings, total] = await Promise.all([
    Clothing.find(filter).populate('owner', 'name email').sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum),
    Clothing.countDocuments(filter),
  ]);

  success(res, 200, { listings }, 'Listings fetched.', { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) });
});

// @route PUT /api/admin/users/:id/suspend
const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  if (user.role === 'admin') throw new ApiError(400, 'Cannot suspend an admin account.');
  user.isSuspended = true;
  await user.save();
  success(res, 200, { user: user.toSafeObject() }, 'User suspended.');
});

// @route PUT /api/admin/users/:id/activate
const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  user.isSuspended = false;
  await user.save();
  success(res, 200, { user: user.toSafeObject() }, 'User reactivated.');
});

// @route DELETE /api/admin/listings/:id
const removeListing = asyncHandler(async (req, res) => {
  const listing = await Clothing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found.');
  listing.status = 'REMOVED';
  await listing.save();

  await Notification.create({
    user: listing.owner,
    type: 'LISTING_REMOVED',
    title: 'Listing removed',
    message: `Your listing "${listing.title}" was removed by an administrator for violating our guidelines.`,
    referenceId: listing._id,
  });

  success(res, 200, null, 'Listing removed.');
});

// @route PUT /api/admin/listings/:id/restore
const restoreListing = asyncHandler(async (req, res) => {
  const listing = await Clothing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found.');
  listing.status = 'AVAILABLE';
  await listing.save();
  success(res, 200, { listing }, 'Listing restored.');
});

// @route GET /api/admin/reports
const getReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status.toUpperCase();

  const reports = await Report.find(filter)
    .populate('reportedBy', 'name email')
    .populate('reportedUser', 'name email')
    .populate('listing', 'title')
    .sort('-createdAt');

  success(res, 200, { reports });
});

// @route PUT /api/admin/reports/:id
const resolveReport = asyncHandler(async (req, res) => {
  const { status, adminResponse } = req.body;
  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Report not found.');

  report.status = status;
  report.adminResponse = adminResponse || report.adminResponse;
  if (['RESOLVED', 'REJECTED'].includes(status)) report.resolvedAt = new Date();
  await report.save();

  await Notification.create({
    user: report.reportedBy,
    type: 'REPORT_UPDATE',
    title: 'Report update',
    message: `Your report has been marked as ${status.replace('_', ' ').toLowerCase()}.`,
    referenceId: report._id,
  });

  success(res, 200, { report }, 'Report updated.');
});

module.exports = {
  getDashboard, getUsers, getListings, suspendUser, activateUser,
  removeListing, restoreListing, getReports, resolveReport,
};
