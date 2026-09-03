const Review = require('../models/Review');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

// @route POST /api/swaps/:id/reviews
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const swap = await SwapRequest.findById(req.params.id);
  if (!swap) throw new ApiError(404, 'Swap request not found.');
  if (swap.status !== 'COMPLETED') throw new ApiError(400, 'You can only review completed swaps.');

  const ids = [String(swap.requester), String(swap.receiver)];
  if (!ids.includes(String(req.user._id))) {
    throw new ApiError(403, 'Only participants of this swap can leave a review.');
  }

  const reviewedUser = ids.find((id) => id !== String(req.user._id));

  const existing = await Review.findOne({ swap: swap._id, reviewer: req.user._id });
  if (existing) throw new ApiError(409, 'You already reviewed this swap.');

  const review = await Review.create({
    reviewer: req.user._id,
    reviewedUser,
    swap: swap._id,
    rating,
    comment: comment || '',
  });

  const target = await User.findById(reviewedUser);
  const newCount = target.ratingCount + 1;
  const newRating = (target.rating * target.ratingCount + rating) / newCount;
  target.rating = Math.round(newRating * 10) / 10;
  target.ratingCount = newCount;
  await target.save();

  success(res, 201, { review }, 'Review submitted.');
});

module.exports = { createReview };
