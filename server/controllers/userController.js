const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const Clothing = require('../models/Clothing');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { estimateTextileWasteAvoidedKg } = require('../utils/sustainability');

// @route GET /api/users/:id
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.isSuspended) throw new ApiError(404, 'User not found.');

  const [listingsCount, reviews] = await Promise.all([
    Clothing.countDocuments({ owner: user._id, status: { $ne: 'REMOVED' } }),
    Review.find({ reviewedUser: user._id }).populate('reviewer', 'name profileImage').sort('-createdAt').limit(10),
  ]);

  success(res, 200, {
    user: user.toSafeObject(),
    listingsCount,
    reviews,
  });
});

// @route PUT /api/users/:id
const updateUserProfile = asyncHandler(async (req, res) => {
  if (req.params.id !== String(req.user._id)) {
    throw new ApiError(403, 'You can only edit your own profile.');
  }

  const allowedFields = ['name', 'bio', 'location'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (req.file) {
    updates.profileImage = { url: req.file.path, publicId: req.file.filename };
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  success(res, 200, { user: user.toSafeObject() }, 'Profile updated successfully.');
});

// @route GET /api/users/:id/swaps
const getUserSwaps = asyncHandler(async (req, res) => {
  if (req.params.id !== String(req.user._id)) {
    throw new ApiError(403, 'You can only view your own swap history.');
  }
  const { status } = req.query;
  const filter = { $or: [{ requester: req.user._id }, { receiver: req.user._id }] };
  if (status) filter.status = status.toUpperCase();

  const swaps = await SwapRequest.find(filter)
    .populate('requestedItem offeredItem', 'title images estimatedValue')
    .populate('requester receiver', 'name profileImage')
    .sort('-updatedAt');

  success(res, 200, { swaps });
});

// @route GET /api/users/me/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [myListingsCount, pendingIncoming, activeSwaps, completedSwaps, rejected] = await Promise.all([
    Clothing.countDocuments({ owner: userId, status: { $ne: 'REMOVED' } }),
    SwapRequest.countDocuments({ receiver: userId, status: { $in: ['PENDING', 'NEGOTIATING'] } }),
    SwapRequest.countDocuments({ $or: [{ requester: userId }, { receiver: userId }], status: 'ACCEPTED' }),
    SwapRequest.countDocuments({ $or: [{ requester: userId }, { receiver: userId }], status: 'COMPLETED' }),
    SwapRequest.countDocuments({ $or: [{ requester: userId }, { receiver: userId }], status: 'REJECTED' }),
  ]);

  const recentActivity = await SwapRequest.find({ $or: [{ requester: userId }, { receiver: userId }] })
    .sort('-updatedAt')
    .limit(5)
    .populate('requestedItem offeredItem', 'title')
    .populate('requester receiver', 'name');

  success(res, 200, {
    stats: {
      myListings: myListingsCount,
      pendingRequests: pendingIncoming,
      activeSwaps,
      completedSwaps,
      rejectedRequests: rejected,
    },
    sustainability: {
      itemsSwapped: req.user.completedSwaps,
      estimatedTextileWasteAvoidedKg: estimateTextileWasteAvoidedKg(req.user.completedSwaps),
    },
    recentActivity,
  });
});

module.exports = { getUserProfile, updateUserProfile, getUserSwaps, getDashboard };
